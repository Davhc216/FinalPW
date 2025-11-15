/**
 * Servicio API para comunicación con el backend
 * Base URL configurada desde VITE_API_URL
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/**
 * Función helper para hacer peticiones HTTP
 */
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

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ==================== AUTH ====================

/**
 * Registrar nuevo usuario
 * @param {string} nombre - Nombre completo del usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 */
export async function register(nombre, email, password) {
  return request('/api/auth/register', {
    method: 'POST',
    body: { nombre, email, password },
  });
}

/**
 * Iniciar sesión
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 */
export async function login(email, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

// ==================== USERS ====================

/**
 * Obtener todos los usuarios
 */
export async function getUsers() {
  return request('/api/users');
}

/**
 * Obtener usuario por ID
 * @param {number} id - ID del usuario
 */
export async function getUserById(id) {
  return request(`/api/users/${id}`);
}

/**
 * Actualizar usuario
 * @param {number} id - ID del usuario
 * @param {object} data - Datos a actualizar (nombre, email, password)
 */
export async function updateUser(id, data) {
  return request(`/api/users/${id}`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * Eliminar usuario
 * @param {number} id - ID del usuario
 */
export async function deleteUser(id) {
  return request(`/api/users/${id}`, {
    method: 'DELETE',
  });
}

// ==================== TRANSACCIONES ====================

/**
 * Obtener transacciones de un usuario
 * @param {number} usuario_id - ID del usuario
 */
export async function getTransacciones(usuario_id) {
  return request(`/api/transacciones?usuario_id=${usuario_id}`);
}

/**
 * Obtener transacción por ID
 * @param {number} id - ID de la transacción
 */
export async function getTransaccionById(id) {
  return request(`/api/transacciones/${id}`);
}

/**
 * Crear depósito
 * @param {number} usuario_id - ID del usuario
 * @param {number} monto - Monto a depositar
 * @param {string} descripcion - Descripción del depósito
 */
export async function createDeposito(usuario_id, monto, descripcion = 'Depósito') {
  return request('/api/transacciones/deposito', {
    method: 'POST',
    body: { usuario_id, monto, descripcion },
  });
}

/**
 * Crear retiro
 * @param {number} usuario_id - ID del usuario
 * @param {number} monto - Monto a retirar
 * @param {string} descripcion - Descripción del retiro
 */
export async function createRetiro(usuario_id, monto, descripcion = 'Retiro') {
  return request('/api/transacciones/retiro', {
    method: 'POST',
    body: { usuario_id, monto, descripcion },
  });
}

/**
 * Crear transferencia
 * @param {number} usuario_id - ID del usuario origen
 * @param {number} usuario_destino_id - ID del usuario destino
 * @param {number} monto - Monto a transferir
 * @param {string} descripcion - Descripción de la transferencia
 */
export async function createTransferencia(usuario_id, usuario_destino_id, monto, descripcion = 'Transferencia') {
  return request('/api/transacciones/transferencia', {
    method: 'POST',
    body: { usuario_id, usuario_destino_id, monto, descripcion },
  });
}

// ==================== PRESTAMOS ====================

/**
 * Obtener préstamos de un usuario
 * @param {number} usuario_id - ID del usuario
 */
export async function getPrestamos(usuario_id) {
  return request(`/api/prestamos?usuario_id=${usuario_id}`);
}

/**
 * Obtener préstamo por ID
 * @param {number} id - ID del préstamo
 */
export async function getPrestamoById(id) {
  return request(`/api/prestamos/${id}`);
}

/**
 * Crear préstamo
 * @param {number} usuario_id - ID del usuario
 * @param {number} monto - Monto del préstamo
 * @param {number} plazo_meses - Plazo en meses
 * @param {number} tasa_interes - Tasa de interés (opcional, default 5.00)
 */
export async function createPrestamo(usuario_id, monto, plazo_meses, tasa_interes = 5.00) {
  return request('/api/prestamos', {
    method: 'POST',
    body: { usuario_id, monto, tasa_interes, plazo_meses },
  });
}

/**
 * Actualizar préstamo
 * @param {number} id - ID del préstamo
 * @param {object} data - Datos a actualizar
 */
export async function updatePrestamo(id, data) {
  return request(`/api/prestamos/${id}`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * Aprobar préstamo
 * @param {number} id - ID del préstamo
 */
export async function aprobarPrestamo(id) {
  return request(`/api/prestamos/${id}/aprobar`, {
    method: 'PUT',
  });
}

/**
 * Rechazar préstamo
 * @param {number} id - ID del préstamo
 */
export async function rechazarPrestamo(id) {
  return request(`/api/prestamos/${id}/rechazar`, {
    method: 'PUT',
  });
}

