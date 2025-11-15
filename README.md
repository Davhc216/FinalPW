# Documentación Sencilla del Proyecto Banco Virtual - Piggie

## Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Backend](#backend)
3. [Frontend](#frontend)
4. [Flujos de Datos](#flujos-de-datos)
5. [Conexiones API](#conexiones-api)
6. [Base de Datos](#base-de-datos)

---

## Arquitectura General

El proyecto tiene dos partes principales:

- **Backend**: API REST con Node.js, Express y Prisma
- **Frontend**: Aplicación React con Vite y React Router

### Tecnologías

**Backend:**
- Node.js
- Express.js
- Prisma ORM
- SQLite
- bcryptjs
- CORS

**Frontend:**
- React 18
- Vite
- React Router DOM
- Fetch API

---

## Backend

### Estructura de Archivos

```
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── index.js
│   ├── app.js
│   ├── database/
│   │   └── prisma.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── users.controller.js
│   │   ├── transacciones.controller.js
│   │   └── prestamos.controller.js
│   └── routes/
│       ├── auth.routes.js
│       ├── users.routes.js
│       ├── transacciones.routes.js
│       └── prestamos.routes.js
├── .env
└── package.json
```

---

### Base de Datos

#### Archivo: `prisma/schema.prisma`

Define cómo se guardan los datos en la base de datos.

**Modelo Usuario:**
- `id`: Número único que se genera automáticamente
- `nombre`: Nombre completo
- `email`: Email único
- `password`: Contraseña encriptada
- `saldo`: Dinero disponible (empieza en 0)
- `createdAt`: Cuándo se creó
- `updatedAt`: Cuándo se actualizó por última vez

Un usuario puede tener muchas transacciones y préstamos.

**Modelo Transaccion:**
- `id`: Número único
- `usuarioId`: Quién hizo la transacción
- `tipo`: 'deposito', 'retiro' o 'transferencia'
- `monto`: Cuánto dinero
- `descripcion`: Nota opcional
- `usuarioDestinoId`: A quién se transfirió (solo para transferencias)
- `createdAt`: Cuándo se hizo

**Modelo Prestamo:**
- `id`: Número único
- `usuarioId`: Quién pidió el préstamo
- `monto`: Cuánto pidió
- `tasaInteres`: Porcentaje de interés (5% por defecto)
- `plazoMeses`: En cuántos meses lo pagará
- `estado`: 'pendiente', 'aprobado' o 'rechazado'
- `fechaSolicitud`: Cuándo lo pidió
- `fechaAprobacion`: Cuándo se aprobó (si se aprobó)
- `fechaVencimiento`: Cuándo vence

---

### Cliente Prisma

#### Archivo: `src/database/prisma.js`

Crea la conexión con la base de datos. Todos los controladores usan esta misma conexión.

```javascript
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

Cuando se cierra el servidor (Ctrl+C), se desconecta de la base de datos correctamente.

---

### Inicio del Servidor

#### Archivo: `src/index.js`

Este archivo inicia todo. Primero carga las variables de entorno, luego conecta a la base de datos y finalmente inicia el servidor en el puerto 4000.

```javascript
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { prisma } from "./database/prisma.js";

const PORT = process.env.PORT || 4000;

async function main() {
  try {
    await prisma.$connect();
    console.log("✅ Conectado a la base de datos");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al conectar la base de datos:", error);
    process.exit(1);
  }
}

main();
```

---

### Configuración de Express

#### Archivo: `src/app.js`

Configura Express para recibir peticiones y las dirige a las rutas correctas.

```javascript
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import transaccionesRoutes from "./routes/transacciones.routes.js";
import prestamosRoutes from "./routes/prestamos.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/transacciones", transaccionesRoutes);
app.use("/api/prestamos", prestamosRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

export default app;
```

- `cors()`: Permite que el frontend haga peticiones desde otro puerto
- `express.json()`: Convierte el body de las peticiones a JSON
- Las rutas se montan en `/api/auth`, `/api/users`, etc.
- Si no encuentra la ruta, devuelve 404
- Si hay un error, lo captura y devuelve 500

---

### Controladores

#### Auth Controller (`src/controllers/auth.controller.js`)

Maneja el registro y login de usuarios.

**register:**
- Recibe nombre, email y password
- Verifica que el email no esté registrado
- Encripta la password con bcrypt
- Crea el usuario con saldo 0
- Devuelve los datos del usuario (sin la password)

**login:**
- Recibe email y password
- Busca el usuario por email
- Compara la password con la guardada
- Si coincide, devuelve los datos del usuario (incluyendo saldo)

No se usan tokens JWT. El frontend guarda el ID del usuario en localStorage.

---

#### Users Controller (`src/controllers/users.controller.js`)

Operaciones con usuarios.

**getUsers:**
- Devuelve todos los usuarios (sin passwords)

**getUserById:**
- Busca un usuario por su ID
- Devuelve sus datos (sin password)

**updateUser:**
- Actualiza nombre, email o password
- Si cambia la password, la encripta de nuevo
- Solo actualiza los campos que se envíen

**deleteUser:**
- Elimina un usuario
- Prisma elimina automáticamente sus transacciones y préstamos

---

#### Transacciones Controller (`src/controllers/transacciones.controller.js`)

Maneja depósitos, retiros y transferencias.

**getTransacciones:**
- Recibe `usuario_id` en la URL
- Busca todas las transacciones donde el usuario participó (como origen o destino)
- Incluye los nombres de los usuarios
- Las ordena de más reciente a más antigua

**getTransaccionById:**
- Busca una transacción específica por su ID

**createDeposito:**
- Recibe `usuario_id` y `monto`
- Usa una transacción de base de datos para:
  - Crear el registro de la transacción
  - Sumar el monto al saldo del usuario
- Si algo falla, revierte todo

**createRetiro:**
- Recibe `usuario_id` y `monto`
- Verifica que el usuario tenga suficiente saldo
- Usa una transacción para:
  - Crear el registro de la transacción
  - Restar el monto del saldo
- Si no hay saldo suficiente, devuelve error

**createTransferencia:**
- Recibe `usuario_id`, `usuario_destino_id` y `monto`
- Verifica que el origen no sea el mismo que el destino
- Verifica que el origen tenga suficiente saldo
- Verifica que el destino exista
- Usa una transacción para:
  - Crear el registro de la transacción
  - Restar del origen
  - Sumar al destino
- Todo se hace de una vez, si algo falla se revierte

---

#### Prestamos Controller (`src/controllers/prestamos.controller.js`)

Maneja los préstamos.

**getPrestamos:**
- Recibe `usuario_id` en la URL
- Devuelve todos los préstamos del usuario
- Los ordena de más reciente a más antiguo

**getPrestamoById:**
- Busca un préstamo específico por su ID

**createPrestamo:**
- Recibe `usuario_id`, `monto`, `tasa_interes` y `plazo_meses`
- Calcula la fecha de vencimiento
- Crea el préstamo con estado 'pendiente'

**updatePrestamo:**
- Solo permite actualizar préstamos 'pendientes'
- Puede cambiar monto, tasa de interés o plazo
- Si cambia el plazo, recalcula la fecha de vencimiento

**aprobarPrestamo:**
- Cambia el estado a 'aprobado'
- Usa una transacción para:
  - Actualizar el préstamo
  - Sumar el monto al saldo del usuario
  - Crear una transacción tipo 'deposito' asociada
- Todo se hace de una vez

**rechazarPrestamo:**
- Cambia el estado a 'rechazado'
- No afecta el saldo del usuario

---

### Rutas

#### Auth Routes (`src/routes/auth.routes.js`)

- `POST /api/auth/register` → registra un usuario
- `POST /api/auth/login` → inicia sesión

#### Users Routes (`src/routes/users.routes.js`)

- `GET /api/users` → lista todos los usuarios
- `GET /api/users/:id` → obtiene un usuario
- `PUT /api/users/:id` → actualiza un usuario
- `DELETE /api/users/:id` → elimina un usuario

#### Transacciones Routes (`src/routes/transacciones.routes.js`)

- `GET /api/transacciones?usuario_id=1` → obtiene transacciones
- `GET /api/transacciones/:id` → obtiene una transacción
- `POST /api/transacciones/deposito` → hace un depósito
- `POST /api/transacciones/retiro` → hace un retiro
- `POST /api/transacciones/transferencia` → hace una transferencia

#### Prestamos Routes (`src/routes/prestamos.routes.js`)

- `GET /api/prestamos?usuario_id=1` → obtiene préstamos
- `GET /api/prestamos/:id` → obtiene un préstamo
- `POST /api/prestamos` → crea un préstamo
- `PUT /api/prestamos/:id` → actualiza un préstamo
- `PUT /api/prestamos/:id/aprobar` → aprueba un préstamo
- `PUT /api/prestamos/:id/rechazar` → rechaza un préstamo

Todas las rutas son públicas. No hay autenticación en el backend.

---

## Frontend

### Estructura de Archivos

```
frontend/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── services/
│   │   └── api.js
│   └── components/
│       ├── header/
│       ├── inicio/
│       ├── login/
│       ├── registro/
│       ├── dashboard/
│       ├── transacciones/
│       └── prestamos/
├── .env
└── package.json
```

---

### Servicio API

#### Archivo: `src/services/api.js`

Todas las llamadas al backend están aquí. Es más fácil mantenerlas en un solo lugar.

Tiene una función `request` que:
- Construye la URL completa
- Configura los headers
- Convierte el body a JSON
- Maneja errores

Funciones disponibles:
- `register(nombre, email, password)`
- `login(email, password)`
- `getUsers()`
- `getUserById(id)`
- `updateUser(id, data)`
- `deleteUser(id)`
- `getTransacciones(usuario_id)`
- `getTransaccionById(id)`
- `createDeposito(usuario_id, monto, descripcion)`
- `createRetiro(usuario_id, monto, descripcion)`
- `createTransferencia(usuario_id, usuario_destino_id, monto, descripcion)`
- `getPrestamos(usuario_id)`
- `getPrestamoById(id)`
- `createPrestamo(usuario_id, monto, plazo_meses, tasa_interes)`
- `updatePrestamo(id, data)`
- `aprobarPrestamo(id)`
- `rechazarPrestamo(id)`

---

### Punto de Entrada

#### Archivo: `src/main.jsx`

Renderiza la aplicación React en la página.

```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

---

### Componente Raíz

#### Archivo: `src/App.jsx`

Define todas las rutas de la aplicación.

- `/` → página de inicio
- `/registro` → formulario de registro
- `/login` → formulario de login
- `/dashboard` → panel del usuario
- `/transacciones` → formulario de transferencias
- `/prestamos` → formulario de préstamos
- `/menu` → menú adicional
- `/box` → componente opcional
- Cualquier otra ruta → redirige a `/`

El Header se muestra en todas las páginas.

---

### Componentes

#### Header (`src/components/header/Header.jsx`)

Barra de navegación que aparece en todas las páginas.

- Muestra el logo y nombre
- Si el usuario no está logueado: muestra "Iniciar sesión" y "Registrarse"
- Si está logueado: muestra "Mi cuenta", "Transacciones", "Préstamos", el nombre del usuario y "Salir"
- El botón "Salir" limpia localStorage y redirige a inicio
- Resalta la ruta actual

Lee el estado de login desde localStorage.

---

#### Inicio (`src/components/inicio/Inicio.jsx`)

Página principal.

- Tiene un campo de email para "Aplicar ahora"
- Botón "Ya tengo cuenta" que lleva a login
- Muestra información sobre el banco
- Si el usuario ingresa su email, lo pasa al formulario de registro

---

#### Login (`src/components/login/Login.jsx`)

Formulario para iniciar sesión.

- Campos: email y password
- Valida que estén completos
- Muestra errores si algo falla
- Muestra "Iniciando sesión..." mientras procesa
- Si el login es exitoso:
  - Guarda en localStorage: `usuario_id`, `usuario_nombre`, `usuario_email`, `usuario_saldo`
  - Redirige a dashboard
- Tiene link a registro y botón para volver al inicio

---

#### Registro (`src/components/registro/Registro.jsx`)

Formulario para crear cuenta.

- Campos: email (con confirmación), nombres, apellidos, celular (opcional), password (con confirmación)
- Valida que los emails coincidan
- Valida que las passwords coincidan
- Valida que la password tenga al menos 6 caracteres
- Concatena nombres y apellidos en un solo campo
- Si el registro es exitoso:
  - Guarda en localStorage: `usuario_id`, `usuario_nombre`, `usuario_email`, `usuario_saldo` = '0'
  - Redirige a dashboard
- Muestra errores si algo falla
- Botón para volver atrás

---

#### Dashboard (`src/components/dashboard/Dashboard.jsx`)

Panel principal del usuario.

- Muestra el saldo disponible
- Muestra información del perfil (nombre, email, tipo de cuenta)
- Lista las últimas 5 transacciones
- Botones "Depositar" y "Retirar" que abren modales
- Los modales permiten ingresar monto y descripción
- Después de depositar o retirar, recarga los datos automáticamente
- Si no hay usuario logueado, redirige a login
- Botón para ir a transferencias

Al cargar, obtiene los datos del usuario y sus transacciones en paralelo.

---

#### Transacciones (`src/components/transacciones/Transacciones.jsx`)

Formulario para transferir dinero.

- Campo para ID del usuario destino
- Botón "Ver usuarios" que muestra una lista de usuarios disponibles
- Al hacer clic en un usuario de la lista, se selecciona su ID
- Campo para monto (formateado como moneda)
- Campo opcional para descripción
- Muestra un resumen con el monto y comisión ($0)
- Valida que el usuario esté logueado
- Valida que el destino no sea el mismo que el origen
- Valida que el monto sea mayor a 0
- Si la transferencia es exitosa, muestra alerta y redirige a dashboard
- Muestra errores si algo falla
- Botón para volver al dashboard

---

#### Prestamos (`src/components/prestamos/Prestamos.jsx`)

Formulario para solicitar préstamo.

- Campo para monto (formateado como moneda)
- Select para plazo en meses (6, 12, 18, 24, 36, 48, 60)
- Select para propósito del préstamo
- Campo para ingresos mensuales (formateado como moneda)
- Select para ocupación
- Checkbox para aceptar términos
- Valida que el usuario esté logueado
- Valida que todos los campos obligatorios estén completos
- Valida que se acepten los términos
- Valida que el monto sea mayor a 0
- Si la solicitud es exitosa, muestra alerta y redirige a dashboard
- Muestra errores si algo falla
- Botón para volver al dashboard

Nota: Los campos `proposito`, `ingresos` y `ocupacion` no se envían al backend, solo se usan para validación local.

---

## Flujos de Datos

### Registro

1. Usuario completa el formulario
2. Frontend valida los campos
3. Frontend concatena nombres y apellidos
4. Frontend llama a la API de registro
5. Backend valida, verifica email único, encripta password y crea el usuario
6. Frontend guarda datos en localStorage
7. Frontend redirige a dashboard

### Login

1. Usuario ingresa email y password
2. Frontend valida los campos
3. Frontend llama a la API de login
4. Backend busca el usuario y compara la password
5. Frontend guarda datos en localStorage
6. Frontend redirige a dashboard

### Depósito

1. Usuario hace clic en "Depositar"
2. Se abre el modal
3. Usuario ingresa monto y descripción
4. Frontend valida el monto
5. Frontend llama a la API de depósito
6. Backend crea la transacción y suma al saldo (todo en una transacción de BD)
7. Frontend muestra alerta de éxito
8. Frontend recarga los datos
9. Dashboard muestra el nuevo saldo

### Retiro

1. Usuario hace clic en "Retirar"
2. Se abre el modal
3. Usuario ingresa monto y descripción
4. Frontend valida el monto
5. Frontend llama a la API de retiro
6. Backend verifica saldo suficiente, crea la transacción y resta del saldo
7. Frontend muestra alerta de éxito o error
8. Si fue exitoso, frontend recarga los datos

### Transferencia

1. Usuario va a la página de transacciones
2. Usuario puede ver la lista de usuarios disponibles
3. Usuario selecciona destino e ingresa monto
4. Frontend valida todo
5. Frontend llama a la API de transferencia
6. Backend verifica saldos y usuarios, crea la transacción, resta del origen y suma al destino (todo en una transacción de BD)
7. Frontend muestra alerta de éxito o error
8. Si fue exitoso, frontend redirige a dashboard

### Solicitud de Préstamo

1. Usuario va a la página de préstamos
2. Usuario completa el formulario
3. Frontend valida todo
4. Frontend llama a la API de préstamo
5. Backend calcula fecha de vencimiento y crea el préstamo con estado 'pendiente'
6. Frontend muestra alerta de éxito
7. Frontend redirige a dashboard

### Aprobación de Préstamo

1. Se llama a la API de aprobar préstamo
2. Backend cambia el estado a 'aprobado', suma el monto al saldo del usuario y crea una transacción tipo 'deposito' (todo en una transacción de BD)
3. Frontend recibe confirmación

Esta funcionalidad no está en el frontend actual, pero el endpoint existe en el backend.

---

## Conexiones API

Tabla de mapeo entre funciones del frontend y endpoints del backend:

| Frontend | Método | Backend |
|----------|--------|---------|
| `register()` | POST | `/api/auth/register` |
| `login()` | POST | `/api/auth/login` |
| `getUsers()` | GET | `/api/users` |
| `getUserById(id)` | GET | `/api/users/:id` |
| `updateUser(id, data)` | PUT | `/api/users/:id` |
| `deleteUser(id)` | DELETE | `/api/users/:id` |
| `getTransacciones(usuario_id)` | GET | `/api/transacciones?usuario_id=:id` |
| `getTransaccionById(id)` | GET | `/api/transacciones/:id` |
| `createDeposito(...)` | POST | `/api/transacciones/deposito` |
| `createRetiro(...)` | POST | `/api/transacciones/retiro` |
| `createTransferencia(...)` | POST | `/api/transacciones/transferencia` |
| `getPrestamos(usuario_id)` | GET | `/api/prestamos?usuario_id=:id` |
| `getPrestamoById(id)` | GET | `/api/prestamos/:id` |
| `createPrestamo(...)` | POST | `/api/prestamos` |
| `updatePrestamo(id, data)` | PUT | `/api/prestamos/:id` |
| `aprobarPrestamo(id)` | PUT | `/api/prestamos/:id/aprobar` |
| `rechazarPrestamo(id)` | PUT | `/api/prestamos/:id/rechazar` |

---

## Base de Datos

### Relaciones

```
Usuario
├── id
├── nombre
├── email (único)
├── password
├── saldo
├── created_at
└── updated_at
    │
    ├─── Transaccion (muchas)
    │      ├── id
    │      ├── usuario_id
    │      ├── usuario_destino_id (opcional)
    │      ├── tipo
    │      ├── monto
    │      ├── descripcion
    │      └── created_at
    │
    └─── Prestamo (muchos)
           ├── id
           ├── usuario_id
           ├── monto
           ├── tasa_interes
           ├── plazo_meses
           ├── estado
           ├── fecha_solicitud
           ├── fecha_aprobacion
           └── fecha_vencimiento
```

### Operaciones

Todas las operaciones se hacen con Prisma:
- Crear: `prisma.modelo.create()`
- Leer: `prisma.modelo.findMany()` o `findUnique()`
- Actualizar: `prisma.modelo.update()`
- Eliminar: `prisma.modelo.delete()`
- Transacciones: `prisma.$transaction()` para hacer varias operaciones de una vez

### Índices

- `Transaccion.usuarioId`: Para buscar rápido las transacciones de un usuario
- `Prestamo.usuarioId`: Para buscar rápido los préstamos de un usuario
- `Usuario.email`: Único, para buscar usuarios por email

### Restricciones

- El email del usuario debe ser único
- Si se elimina un usuario, se eliminan sus transacciones y préstamos
- Si se elimina un usuario destino en una transferencia, el `usuario_destino_id` se pone en null

---

## Notas Importantes

### Autenticación

No se usan tokens JWT. El frontend guarda el ID del usuario en localStorage y lo envía en cada petición. Todas las rutas del backend son públicas.

### Transacciones de Base de Datos

Los depósitos, retiros y transferencias usan transacciones de base de datos para asegurar que todo se haga de una vez. Si algo falla, se revierte todo.

### Formato de Datos

Los controladores formatean las respuestas para usar nombres de campos en snake_case (como `usuario_id` en lugar de `usuarioId`). El frontend formatea fechas y montos para mostrarlos.

### Variables de Entorno

**Backend (.env):**
```
DATABASE_URL="file:./dev.db"
PORT=4000
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:4000
```

### Manejo de Errores

El backend devuelve códigos HTTP apropiados (400, 401, 404, 500) con mensajes de error en JSON. El frontend captura estos errores y los muestra al usuario.

---

## Comandos Útiles

### Backend

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
npm start
```

### Frontend

```bash
npm install
npm run dev
npm run build
```

---

## Recursos

- [Prisma](https://www.prisma.io/docs)
- [Express](https://expressjs.com/)
- [React Router](https://reactrouter.com/)
- [React](https://react.dev/)

---------------------------------------------------------------------

# Documentación Técnica - Proyecto Banco Virtual - Piggie

## Especificaciones del Sistema

### Stack Tecnológico

**Backend:**
- Runtime: Node.js (ES Modules)
- Framework: Express.js v4.18.2
- ORM: Prisma v5.0.0
- Database: SQLite 3
- Password Hashing: bcryptjs v2.4.3 (10 rounds)
- CORS: cors v2.8.5
- Environment: dotenv v16.0.3

**Frontend:**
- Framework: React v19.1.1
- Build Tool: Vite v7.1.7
- Routing: React Router DOM v6.30.1
- HTTP Client: Fetch API (nativo)
- State Management: React Hooks + localStorage

---

## Arquitectura del Sistema

### Patrón Arquitectónico

**Backend:** Arquitectura en capas (Layered Architecture)
```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│  (Routes + Request/Response)        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Application Layer           │
│      (Controllers + Business)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Data Access Layer           │
│    (Prisma ORM + SQLite)            │
└─────────────────────────────────────┘
```

**Frontend:** Arquitectura basada en componentes (Component-Based Architecture)
```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│    (React Components + UI)          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Service Layer               │
│    (API Service Abstraction)        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         State Management            │
│  (React Hooks + localStorage)       │
└─────────────────────────────────────┘
```

### Patrones de Diseño Implementados

1. **Repository Pattern**: Prisma ORM abstrae el acceso a datos
2. **Service Layer Pattern**: `api.js` centraliza la lógica de comunicación HTTP
3. **Singleton Pattern**: Instancia única de PrismaClient
4. **Factory Pattern**: Prisma Client Factory
5. **Observer Pattern**: React hooks (useState, useEffect)
6. **Strategy Pattern**: Diferentes tipos de transacciones (deposito, retiro, transferencia)

---

## Especificación de Base de Datos

### Schema Prisma

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

### Modelo Usuario

```prisma
model Usuario {
  id        Int       @id @default(autoincrement())
  nombre    String
  email     String    @unique
  password  String    // bcrypt hash, 60 chars
  saldo     Float     @default(0) @db.Real
  createdAt DateTime  @default(now()) @map("created_at") @db.DateTime
  updatedAt DateTime  @updatedAt @map("updated_at") @db.DateTime

  transacciones        Transaccion[] @relation("UsuarioTransacciones")
  transaccionesDestino Transaccion[] @relation("UsuarioDestino")
  prestamos            Prestamo[]

  @@index([email], name: "idx_usuario_email")
  @@map("usuarios")
}
```

**Especificaciones Técnicas:**
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `email`: UNIQUE constraint, índice B-tree
- `password`: VARCHAR(255), almacena hash bcrypt
- `saldo`: REAL (IEEE 754 double precision)
- Índice en `email` para búsquedas O(log n)

### Modelo Transaccion

```prisma
model Transaccion {
  id               Int       @id @default(autoincrement())
  usuarioId        Int       @map("usuario_id")
  tipo             String    // ENUM: 'deposito' | 'retiro' | 'transferencia'
  monto            Float     @db.Real
  descripcion      String?   @db.Text
  usuarioDestinoId Int?      @map("usuario_destino_id")
  createdAt        DateTime  @default(now()) @map("created_at") @db.DateTime

  usuario        Usuario  @relation("UsuarioTransacciones", fields: [usuarioId], references: [id], onDelete: Cascade)
  usuarioDestino Usuario? @relation("UsuarioDestino", fields: [usuarioDestinoId], references: [id], onDelete: SetNull)

  @@index([usuarioId], name: "idx_transaccion_usuario")
  @@index([createdAt], name: "idx_transaccion_fecha")
  @@map("transacciones")
}
```

**Especificaciones Técnicas:**
- Foreign Key `usuarioId`: ON DELETE CASCADE
- Foreign Key `usuarioDestinoId`: ON DELETE SET NULL
- Índice compuesto en `usuarioId` para queries de historial
- Índice en `createdAt` para ordenamiento temporal

### Modelo Prestamo

```prisma
model Prestamo {
  id               Int       @id @default(autoincrement())
  usuarioId        Int       @map("usuario_id")
  monto            Float     @db.Real
  tasaInteres      Float     @default(5.00) @map("tasa_interes") @db.Real
  plazoMeses       Int       @map("plazo_meses")
  estado           String    @default("pendiente") // ENUM: 'pendiente' | 'aprobado' | 'rechazado'
  fechaSolicitud   DateTime  @default(now()) @map("fecha_solicitud") @db.DateTime
  fechaAprobacion  DateTime? @map("fecha_aprobacion") @db.DateTime
  fechaVencimiento DateTime? @map("fecha_vencimiento") @db.DateTime

  usuario Usuario @relation(fields: [usuarioId], references: [id], onDelete: Cascade)

  @@index([usuarioId], name: "idx_prestamo_usuario")
  @@index([estado], name: "idx_prestamo_estado")
  @@map("prestamos")
}
```

**Especificaciones Técnicas:**
- Foreign Key `usuarioId`: ON DELETE CASCADE
- Índice en `usuarioId` para queries por usuario
- Índice en `estado` para filtrado de préstamos pendientes

### Optimizaciones de Base de Datos

1. **Índices**: Optimización de queries frecuentes
   - `Usuario.email`: Búsqueda O(log n) en lugar de O(n)
   - `Transaccion.usuarioId`: JOIN eficiente
   - `Transaccion.createdAt`: ORDER BY optimizado

2. **Foreign Keys con CASCADE**: Integridad referencial automática
3. **Tipos de Datos**: REAL para precisión monetaria (IEEE 754)
4. **Constraints**: UNIQUE en email previene duplicados

---

## Especificación de API REST

### Convenciones REST

- **Métodos HTTP**: GET (lectura), POST (creación), PUT (actualización), DELETE (eliminación)
- **Códigos de Estado**: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Internal Server Error)
- **Content-Type**: `application/json`
- **Encoding**: UTF-8

### Endpoints de Autenticación

#### POST /api/auth/register

**Request:**
```http
POST /api/auth/register HTTP/1.1
Content-Type: application/json

{
  "nombre": "string (required, min: 1, max: 255)",
  "email": "string (required, valid email format, unique)",
  "password": "string (required, min: 6)"
}
```

**Response 201:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "integer",
    "nombre": "string",
    "email": "string"
  }
}
```

**Response 400:**
```json
{
  "error": "string (validation error message)"
}
```

**Algoritmo:**
1. Validar campos requeridos
2. Verificar unicidad de email (SELECT WHERE email = ?)
3. Hash password con bcrypt (10 rounds, salt automático)
4. INSERT INTO usuarios (transacción implícita)
5. Retornar datos sin password

**Complejidad Temporal:** O(1) promedio, O(n) peor caso (verificación email)
**Complejidad Espacial:** O(1)

#### POST /api/auth/login

**Request:**
```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response 200:**
```json
{
  "message": "Login exitoso",
  "user": {
    "id": "integer",
    "nombre": "string",
    "email": "string",
    "saldo": "float"
  }
}
```

**Algoritmo:**
1. SELECT usuario WHERE email = ?
2. bcrypt.compare(password, hash)
3. Retornar datos del usuario

**Complejidad Temporal:** O(1) promedio (índice email)
**Complejidad Espacial:** O(1)

---

### Endpoints de Usuarios

#### GET /api/users

**Query Parameters:** Ninguno

**Response 200:**
```json
{
  "users": [
    {
      "id": "integer",
      "nombre": "string",
      "email": "string",
      "saldo": "float",
      "createdAt": "ISO 8601 datetime"
    }
  ]
}
```

**Query SQL Generada:**
```sql
SELECT id, nombre, email, saldo, created_at 
FROM usuarios;
```

**Complejidad Temporal:** O(n) donde n = número de usuarios

#### GET /api/users/:id

**Path Parameters:**
- `id`: integer (required)

**Response 200:**
```json
{
  "user": {
    "id": "integer",
    "nombre": "string",
    "email": "string",
    "saldo": "float",
    "createdAt": "ISO 8601 datetime"
  }
}
```

**Query SQL Generada:**
```sql
SELECT id, nombre, email, saldo, created_at 
FROM usuarios 
WHERE id = ? 
LIMIT 1;
```

**Complejidad Temporal:** O(1) (índice primario)

---

### Endpoints de Transacciones

#### GET /api/transacciones?usuario_id={id}

**Query Parameters:**
- `usuario_id`: integer (required)

**Response 200:**
```json
{
  "transacciones": [
    {
      "id": "integer",
      "usuario_id": "integer",
      "usuario_destino_id": "integer | null",
      "tipo": "string",
      "monto": "float",
      "descripcion": "string | null",
      "created_at": "ISO 8601 datetime",
      "usuario_nombre": "string",
      "usuario_destino_nombre": "string | null"
    }
  ]
}
```

**Query SQL Generada:**
```sql
SELECT t.*, u1.nombre as usuario_nombre, u2.nombre as usuario_destino_nombre
FROM transacciones t
LEFT JOIN usuarios u1 ON t.usuario_id = u1.id
LEFT JOIN usuarios u2 ON t.usuario_destino_id = u2.id
WHERE t.usuario_id = ? OR t.usuario_destino_id = ?
ORDER BY t.created_at DESC;
```

**Complejidad Temporal:** O(n log n) por ORDER BY, optimizado con índice

#### POST /api/transacciones/deposito

**Request:**
```json
{
  "usuario_id": "integer (required)",
  "monto": "float (required, > 0)",
  "descripcion": "string (optional)"
}
```

**Algoritmo (Transacción ACID):**
```javascript
BEGIN TRANSACTION;
  INSERT INTO transacciones (usuario_id, tipo, monto, descripcion, created_at)
  VALUES (?, 'deposito', ?, ?, NOW());
  
  UPDATE usuarios 
  SET saldo = saldo + ? 
  WHERE id = ?;
COMMIT;
```

**Propiedades ACID:**
- **Atomicity**: Todo o nada
- **Consistency**: Saldo siempre correcto
- **Isolation**: No hay race conditions
- **Durability**: Persistido en disco

**Complejidad Temporal:** O(1) (índices primarios)

#### POST /api/transacciones/retiro

**Request:**
```json
{
  "usuario_id": "integer (required)",
  "monto": "float (required, > 0)",
  "descripcion": "string (optional)"
}
```

**Algoritmo:**
```javascript
BEGIN TRANSACTION;
  SELECT saldo FROM usuarios WHERE id = ? FOR UPDATE;
  
  IF saldo < monto THEN
    ROLLBACK;
    RETURN 400;
  END IF;
  
  INSERT INTO transacciones ...;
  UPDATE usuarios SET saldo = saldo - ? WHERE id = ?;
COMMIT;
```

**Locking:** Row-level lock en SELECT FOR UPDATE previene race conditions

#### POST /api/transacciones/transferencia

**Request:**
```json
{
  "usuario_id": "integer (required)",
  "usuario_destino_id": "integer (required, != usuario_id)",
  "monto": "float (required, > 0)",
  "descripcion": "string (optional)"
}
```

**Algoritmo:**
```javascript
BEGIN TRANSACTION;
  SELECT saldo FROM usuarios WHERE id = ? FOR UPDATE;
  SELECT id FROM usuarios WHERE id = ? FOR UPDATE;
  
  IF saldo_origen < monto THEN ROLLBACK; RETURN 400; END IF;
  IF destino_no_existe THEN ROLLBACK; RETURN 404; END IF;
  
  INSERT INTO transacciones ...;
  UPDATE usuarios SET saldo = saldo - ? WHERE id = ?;
  UPDATE usuarios SET saldo = saldo + ? WHERE id = ?;
COMMIT;
```

**Deadlock Prevention:** Locks adquiridos en orden consistente (origen, luego destino)

---

### Endpoints de Préstamos

#### POST /api/prestamos

**Request:**
```json
{
  "usuario_id": "integer (required)",
  "monto": "float (required, > 0)",
  "tasa_interes": "float (optional, default: 5.00)",
  "plazo_meses": "integer (required, > 0)"
}
```

**Algoritmo de Cálculo de Fecha de Vencimiento:**
```javascript
const fechaVencimiento = new Date();
fechaVencimiento.setMonth(fechaVencimiento.getMonth() + plazo_meses);
// Maneja correctamente desbordamiento de meses (ej: enero + 1 mes = febrero)
```

#### PUT /api/prestamos/:id/aprobar

**Algoritmo (Transacción ACID):**
```javascript
BEGIN TRANSACTION;
  UPDATE prestamos 
  SET estado = 'aprobado', fecha_aprobacion = NOW() 
  WHERE id = ? AND estado = 'pendiente';
  
  UPDATE usuarios 
  SET saldo = saldo + (SELECT monto FROM prestamos WHERE id = ?) 
  WHERE id = (SELECT usuario_id FROM prestamos WHERE id = ?);
  
  INSERT INTO transacciones (usuario_id, tipo, monto, descripcion)
  VALUES (?, 'deposito', ?, 'Préstamo aprobado #?');
COMMIT;
```

**Consistencia:** Tres operaciones atómicas garantizan estado consistente

---

## Implementación Frontend

### Arquitectura de Componentes

**Jerarquía de Componentes:**
```
App
├── Header (presentational)
└── Routes
    ├── Inicio (container)
    ├── Login (container)
    ├── Registro (container)
    ├── Dashboard (container)
    ├── Transacciones (container)
    └── Prestamos (container)
```

### Patrón de Estado

**State Management:**
- **Local State**: `useState` para estado de componente
- **Persistent State**: `localStorage` para autenticación
- **Derived State**: Cálculos basados en props/state

**Ejemplo de Estado en Dashboard:**
```javascript
const [user, setUser] = useState(null);                    // Server state
const [transacciones, setTransacciones] = useState([]);    // Server state
const [loading, setLoading] = useState(true);              // UI state
const [error, setError] = useState('');                     // Error state
const [showDeposito, setShowDeposito] = useState(false);   // Modal state
```

### Service Layer Pattern

**Abstracción de API (`src/services/api.js`):**

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Error ${response.status}`);
  }

  return data;
}
```

**Ventajas:**
- Centralización de lógica HTTP
- Manejo consistente de errores
- Fácil mockeo para testing
- Configuración centralizada de headers

### Manejo de Errores

**Estrategia de Error Handling:**
1. **Network Errors**: Capturados en `request()`
2. **HTTP Errors**: Parseados desde response body
3. **Validation Errors**: Mostrados en UI con estado de error
4. **User Feedback**: Alertas y mensajes inline

**Ejemplo:**
```javascript
try {
  await createDeposito(usuarioId, monto, descripcion);
  alert('Depósito realizado exitosamente');
} catch (err) {
  alert(err.message || 'Error al realizar el depósito');
}
```

### Optimizaciones de Rendimiento

1. **Lazy Loading**: Componentes cargados bajo demanda
2. **Memoization**: `useMemo` para cálculos costosos
3. **Debouncing**: En inputs de búsqueda (si se implementa)
4. **Code Splitting**: Vite automático por rutas

---

## Seguridad

### Autenticación

**Modelo de Autenticación:**
- **Tipo**: Stateless (sin sesiones en servidor)
- **Almacenamiento**: localStorage (cliente)
- **Identificación**: `usuario_id` en cada request
- **Ventaja**: Escalabilidad horizontal
- **Desventaja**: Vulnerable a XSS

### Password Hashing

**Algoritmo:** bcrypt
- **Rounds:** 10 (2^10 = 1024 iteraciones)
- **Salt:** Generado automáticamente (único por password)
- **Output:** String de 60 caracteres
- **Formato:** `$2a$10$[salt][hash]`

**Ejemplo:**
```
Input: "password123"
Output: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
```

### Validación de Input

**Backend:**
- Validación de tipos (parseInt, parseFloat)
- Validación de rangos (monto > 0)
- Validación de existencia (usuarios, préstamos)
- Sanitización: Prisma previene SQL injection

**Frontend:**
- Validación de formato (email regex)
- Validación de longitud (password min 6)
- Validación de coincidencia (passwords, emails)
- HTML escaping automático (React)

### CORS

**Configuración:**
```javascript
app.use(cors()); // Permite todos los orígenes
```

**Producción Recomendada:**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

---

## Performance y Escalabilidad

### Optimizaciones de Base de Datos

1. **Índices**: Reducen complejidad de queries
2. **Select Específico**: Solo campos necesarios
3. **Paginación**: Implementable con LIMIT/OFFSET
4. **Connection Pooling**: Prisma maneja automáticamente

### Optimizaciones de API

1. **Transacciones Atómicas**: Reducen round-trips
2. **Batch Operations**: Múltiples updates en una transacción
3. **Caching**: Implementable con Redis (futuro)
4. **Compresión**: Express compression middleware (futuro)

### Límites y Consideraciones

**SQLite:**
- **Concurrent Writes**: Limitado (WAL mode recomendado)
- **Tamaño Máximo**: ~281 TB teórico
- **Escalabilidad**: Vertical (mejor hardware)

**Recomendaciones para Producción:**
1. Migrar a PostgreSQL para escalabilidad horizontal
2. Implementar connection pooling
3. Agregar Redis para caching
4. Implementar rate limiting
5. Agregar logging estructurado

---

## Testing

### Estrategia de Testing

**Backend:**
- Unit Tests: Controladores individuales
- Integration Tests: API endpoints
- Database Tests: Transacciones ACID

**Frontend:**
- Unit Tests: Componentes aislados
- Integration Tests: Flujos completos
- E2E Tests: Cypress/Playwright

### Ejemplo de Test (Backend)

```javascript
describe('createTransferencia', () => {
  it('debe transferir dinero correctamente', async () => {
    const usuario1 = await crearUsuario({ saldo: 1000 });
    const usuario2 = await crearUsuario({ saldo: 0 });
    
    await createTransferencia({
      usuario_id: usuario1.id,
      usuario_destino_id: usuario2.id,
      monto: 500
    });
    
    const u1 = await obtenerUsuario(usuario1.id);
    const u2 = await obtenerUsuario(usuario2.id);
    
    expect(u1.saldo).toBe(500);
    expect(u2.saldo).toBe(500);
  });
});
```

---

## Deployment

### Variables de Entorno

**Backend (.env):**
```env
DATABASE_URL="file:./dev.db"
PORT=4000
NODE_ENV=production
```

**Frontend (.env):**
```env
VITE_API_URL=https://api.ejemplo.com
```

### Build Process

**Backend:**
```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm start
```

**Frontend:**
```bash
npm install
npm run build
# Output: dist/
```

### Docker (Opcional)

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 4000
CMD ["npm", "start"]
```

---

## Monitoreo y Logging

### Logging Estructurado

**Recomendación:**
```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Métricas Recomendadas

1. **Response Time**: Tiempo de respuesta de endpoints
2. **Error Rate**: Porcentaje de errores
3. **Throughput**: Requests por segundo
4. **Database Queries**: Tiempo de queries
5. **Memory Usage**: Uso de memoria

---

## Conclusión

Este sistema implementa una arquitectura en capas con separación de responsabilidades, transacciones ACID para garantizar consistencia de datos, y un frontend reactivo basado en componentes. La ausencia de autenticación JWT es intencional para simplificar el desarrollo académico, pero requiere implementación de seguridad adicional para producción.

**Puntos Clave:**
- Transacciones atómicas garantizan integridad financiera
- Índices optimizan queries frecuentes
- Service layer abstrae complejidad HTTP
- Component-based architecture facilita mantenimiento

