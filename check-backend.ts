#!/usr/bin/env bun

console.log('\n' + '='.repeat(60));
console.log('🔍 ПРОВЕРКА BACKEND TAZAGO');
console.log('='.repeat(60) + '\n');

async function checkBackend() {
  try {
    console.log('📡 Проверяю подключение к http://localhost:3000...\n');
    
    const response = await fetch('http://localhost:3000', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend работает!');
      console.log('📦 Ответ сервера:', JSON.stringify(data, null, 2));
      console.log('\n' + '='.repeat(60));
      console.log('✅ ВСЁ РАБОТАЕТ КОРРЕКТНО!');
      console.log('='.repeat(60) + '\n');
      console.log('💡 Теперь можете запустить приложение:');
      console.log('   bun run start\n');
      process.exit(0);
    } else {
      console.error('❌ Сервер вернул ошибку:', response.status, response.statusText);
      console.log('\n💡 Решение: Перезапустите backend:');
      console.log('   bun server/index.ts\n');
      process.exit(1);
    }
  } catch {
    console.error('❌ Backend не запущен или недоступен!\n');
    console.log('📝 Причины:');
    console.log('   1. Backend не запущен');
    console.log('   2. Порт 3000 занят другим процессом');
    console.log('   3. База данных не создана\n');
    console.log('💡 Решение:\n');
    console.log('   1. Создайте базу данных:');
    console.log('      bun backend/db/migrate.ts\n');
    console.log('   2. Запустите backend:');
    console.log('      bun server/index.ts\n');
    console.log('   3. Проверьте снова:');
    console.log('      bun check-backend.ts\n');
    console.log('='.repeat(60) + '\n');
    process.exit(1);
  }
}

checkBackend();
