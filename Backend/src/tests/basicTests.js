// Tests básicos para verificar la estructura del proyecto

console.log('🧪 Ejecutando tests básicos...\n');

const tests = [
  {
    name: 'Verificar importación de módulos',
    test: () => {
      try {
        import('express');
        import('dotenv');
        import('bcryptjs');
        import('@prisma/client');
        import('cors');
        return true;
      } catch (error) {
        return false;
      }
    }
  },
  {
    name: 'Verificar variables de entorno',
    test: () => {
      try {
        import('dotenv').then(dotenv => {
          dotenv.default.config();
        });
        return process.env.DATABASE_URL !== undefined;
      } catch (error) {
        return false;
      }
    }
  }
];

let passed = 0;
let failed = 0;

tests.forEach(({ name, test }) => {
  try {
    const result = test();
    if (result) {
      console.log(`✅ ${name}`);
      passed++;
    } else {
      console.log(`❌ ${name}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    failed++;
  }
});

console.log(`\n📊 Resultados: ${passed} pasados, ${failed} fallidos`);

if (failed === 0) {
  console.log('🎉 Todos los tests pasaron!');
  process.exit(0);
} else {
  console.log('⚠️  Algunos tests fallaron');
  process.exit(1);
}

