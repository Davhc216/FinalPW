/**
 * Script de pruebas automatizadas para la API
 * Ejecutar con: node test-api.js
 */

import axios from 'axios';

const API_URL = 'http://localhost:4000/api';
let usuario1Id = null;
let usuario2Id = null;
let prestamoId = null;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  log(`\n🧪 ${name}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function test(name, testFn) {
  try {
    await testFn();
    logSuccess(`${name}`);
    return true;
  } catch (error) {
    logError(`${name}: ${error.message}`);
    if (error.response) {
      console.log('   Response:', error.response.data);
    }
    return false;
  }
}

// ==================== TESTS ====================

async function runTests() {
  log('\n═══════════════════════════════════════', 'blue');
  log('   PRUEBAS AUTOMATIZADAS DE LA API', 'blue');
  log('═══════════════════════════════════════\n', 'blue');

  let passed = 0;
  let failed = 0;

  // Test 1: Health Check
  logTest('1. Health Check');
  if (await test('GET /api/health', async () => {
    const response = await axios.get(`${API_URL}/health`);
    if (response.data.status !== 'ok') {
      throw new Error('Status no es "ok"');
    }
  })) passed++; else failed++;

  // Test 2: Registro Usuario 1
  logTest('2. Registro de Usuario 1');
  if (await test('POST /api/auth/register', async () => {
    const response = await axios.post(`${API_URL}/auth/register`, {
      nombre: 'Test Usuario 1',
      email: `test1_${Date.now()}@test.com`,
      password: 'password123'
    });
    if (!response.data.user || !response.data.user.id) {
      throw new Error('No se recibió ID de usuario');
    }
    usuario1Id = response.data.user.id;
  })) passed++; else failed++;

  // Test 3: Registro Usuario 2
  logTest('3. Registro de Usuario 2');
  if (await test('POST /api/auth/register', async () => {
    const response = await axios.post(`${API_URL}/auth/register`, {
      nombre: 'Test Usuario 2',
      email: `test2_${Date.now()}@test.com`,
      password: 'password456'
    });
    usuario2Id = response.data.user.id;
  })) passed++; else failed++;

  // Test 4: Login
  logTest('4. Login');
  if (await test('POST /api/auth/login', async () => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: `test1_${Date.now()}@test.com`,
      password: 'password123'
    });
    if (!response.data.user) {
      throw new Error('No se recibieron datos de usuario');
    }
  })) passed++; else failed++;

  // Test 5: Obtener Usuarios
  logTest('5. Obtener Todos los Usuarios');
  if (await test('GET /api/users', async () => {
    const response = await axios.get(`${API_URL}/users`);
    if (!Array.isArray(response.data.users)) {
      throw new Error('No se recibió array de usuarios');
    }
  })) passed++; else failed++;

  // Test 6: Obtener Usuario por ID
  logTest('6. Obtener Usuario por ID');
  if (await test('GET /api/users/:id', async () => {
    if (!usuario1Id) throw new Error('No hay usuario1Id');
    const response = await axios.get(`${API_URL}/users/${usuario1Id}`);
    if (!response.data.user) {
      throw new Error('No se recibieron datos del usuario');
    }
  })) passed++; else failed++;

  // Test 7: Depósito
  logTest('7. Crear Depósito');
  if (await test('POST /api/transacciones/deposito', async () => {
    if (!usuario1Id) throw new Error('No hay usuario1Id');
    const response = await axios.post(`${API_URL}/transacciones/deposito`, {
      usuario_id: usuario1Id,
      monto: 1000,
      descripcion: 'Depósito de prueba'
    });
    
    // Verificar que el saldo se actualizó
    const userResponse = await axios.get(`${API_URL}/users/${usuario1Id}`);
    if (userResponse.data.user.saldo !== 1000) {
      throw new Error(`Saldo incorrecto. Esperado: 1000, Obtenido: ${userResponse.data.user.saldo}`);
    }
  })) passed++; else failed++;

  // Test 8: Retiro
  logTest('8. Crear Retiro');
  if (await test('POST /api/transacciones/retiro', async () => {
    if (!usuario1Id) throw new Error('No hay usuario1Id');
    const response = await axios.post(`${API_URL}/transacciones/retiro`, {
      usuario_id: usuario1Id,
      monto: 300,
      descripcion: 'Retiro de prueba'
    });
    
    // Verificar saldo
    const userResponse = await axios.get(`${API_URL}/users/${usuario1Id}`);
    if (userResponse.data.user.saldo !== 700) {
      throw new Error(`Saldo incorrecto. Esperado: 700, Obtenido: ${userResponse.data.user.saldo}`);
    }
  })) passed++; else failed++;

  // Test 9: Transferencia
  logTest('9. Crear Transferencia');
  if (await test('POST /api/transacciones/transferencia', async () => {
    if (!usuario1Id || !usuario2Id) throw new Error('Faltan IDs de usuario');
    
    const response = await axios.post(`${API_URL}/transacciones/transferencia`, {
      usuario_id: usuario1Id,
      usuario_destino_id: usuario2Id,
      monto: 200,
      descripcion: 'Transferencia de prueba'
    });
    
    // Verificar saldos
    const user1Response = await axios.get(`${API_URL}/users/${usuario1Id}`);
    const user2Response = await axios.get(`${API_URL}/users/${usuario2Id}`);
    
    if (user1Response.data.user.saldo !== 500) {
      throw new Error(`Saldo usuario 1 incorrecto. Esperado: 500, Obtenido: ${user1Response.data.user.saldo}`);
    }
    if (user2Response.data.user.saldo !== 200) {
      throw new Error(`Saldo usuario 2 incorrecto. Esperado: 200, Obtenido: ${user2Response.data.user.saldo}`);
    }
  })) passed++; else failed++;

  // Test 10: Obtener Transacciones
  logTest('10. Obtener Transacciones');
  if (await test('GET /api/transacciones?usuario_id=:id', async () => {
    if (!usuario1Id) throw new Error('No hay usuario1Id');
    const response = await axios.get(`${API_URL}/transacciones?usuario_id=${usuario1Id}`);
    if (!Array.isArray(response.data.transacciones)) {
      throw new Error('No se recibió array de transacciones');
    }
    if (response.data.transacciones.length < 3) {
      throw new Error(`Se esperaban al menos 3 transacciones, se obtuvieron ${response.data.transacciones.length}`);
    }
  })) passed++; else failed++;

  // Test 11: Crear Préstamo
  logTest('11. Crear Préstamo');
  if (await test('POST /api/prestamos', async () => {
    if (!usuario1Id) throw new Error('No hay usuario1Id');
    const response = await axios.post(`${API_URL}/prestamos`, {
      usuario_id: usuario1Id,
      monto: 5000,
      tasa_interes: 5.00,
      plazo_meses: 12
    });
    if (!response.data.prestamo || response.data.prestamo.estado !== 'pendiente') {
      throw new Error('Préstamo no creado correctamente');
    }
    prestamoId = response.data.prestamo.id;
  })) passed++; else failed++;

  // Test 12: Obtener Préstamos
  logTest('12. Obtener Préstamos');
  if (await test('GET /api/prestamos?usuario_id=:id', async () => {
    if (!usuario1Id) throw new Error('No hay usuario1Id');
    const response = await axios.get(`${API_URL}/prestamos?usuario_id=${usuario1Id}`);
    if (!Array.isArray(response.data.prestamos)) {
      throw new Error('No se recibió array de préstamos');
    }
  })) passed++; else failed++;

  // Test 13: Aprobar Préstamo
  logTest('13. Aprobar Préstamo');
  if (await test('PUT /api/prestamos/:id/aprobar', async () => {
    if (!prestamoId || !usuario1Id) throw new Error('Faltan IDs');
    
    const response = await axios.put(`${API_URL}/prestamos/${prestamoId}/aprobar`);
    
    // Verificar que el préstamo está aprobado
    const prestamoResponse = await axios.get(`${API_URL}/prestamos/${prestamoId}`);
    if (prestamoResponse.data.prestamo.estado !== 'aprobado') {
      throw new Error('Préstamo no está aprobado');
    }
    
    // Verificar que el saldo aumentó
    const userResponse = await axios.get(`${API_URL}/users/${usuario1Id}`);
    const saldoEsperado = 500 + 5000; // saldo anterior + préstamo
    if (userResponse.data.user.saldo !== saldoEsperado) {
      throw new Error(`Saldo incorrecto después de aprobar préstamo. Esperado: ${saldoEsperado}, Obtenido: ${userResponse.data.user.saldo}`);
    }
  })) passed++; else failed++;

  // Test 14: Actualizar Usuario
  logTest('14. Actualizar Usuario');
  if (await test('PUT /api/users/:id', async () => {
    if (!usuario1Id) throw new Error('No hay usuario1Id');
    const response = await axios.put(`${API_URL}/users/${usuario1Id}`, {
      nombre: 'Test Usuario Actualizado'
    });
    
    // Verificar actualización
    const userResponse = await axios.get(`${API_URL}/users/${usuario1Id}`);
    if (userResponse.data.user.nombre !== 'Test Usuario Actualizado') {
      throw new Error('Nombre no se actualizó');
    }
  })) passed++; else failed++;

  // Test 15: Validación de Errores
  logTest('15. Validación de Errores');
  let errorTests = 0;
  
  // Email duplicado
  try {
    await axios.post(`${API_URL}/auth/register`, {
      nombre: 'Test',
      email: 'duplicado@test.com',
      password: 'password123'
    });
    await axios.post(`${API_URL}/auth/register`, {
      nombre: 'Test 2',
      email: 'duplicado@test.com',
      password: 'password123'
    });
    logError('Email duplicado: No se detectó error');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      logSuccess('Email duplicado detectado correctamente');
      errorTests++;
    }
  }
  
  // Saldo insuficiente
  try {
    await axios.post(`${API_URL}/transacciones/retiro`, {
      usuario_id: usuario1Id,
      monto: 999999
    });
    logError('Saldo insuficiente: No se detectó error');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      logSuccess('Saldo insuficiente detectado correctamente');
      errorTests++;
    }
  }
  
  if (errorTests >= 2) passed++; else failed++;

  // ==================== RESUMEN ====================
  log('\n═══════════════════════════════════════', 'blue');
  log('   RESUMEN DE PRUEBAS', 'blue');
  log('═══════════════════════════════════════\n', 'blue');
  
  log(`Total de pruebas: ${passed + failed}`, 'blue');
  log(`✅ Pasadas: ${passed}`, 'green');
  log(`❌ Fallidas: ${failed}`, failed > 0 ? 'red' : 'green');
  
  if (failed === 0) {
    log('\n🎉 ¡Todas las pruebas pasaron!', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Algunas pruebas fallaron. Revisa los errores arriba.', 'yellow');
    process.exit(1);
  }
}

// Ejecutar pruebas
runTests().catch(error => {
  logError(`Error fatal: ${error.message}`);
  process.exit(1);
});

