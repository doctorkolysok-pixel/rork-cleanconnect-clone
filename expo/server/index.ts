import app from "../backend/hono";
import { serve } from "@hono/node-server";

const port = Number(process.env.PORT) || 3000;

console.log('\n' + '='.repeat(60));
console.log(`🚀 ЗАПУСК БЭКЕНД-СЕРВЕРА TazaGo`);
console.log('='.repeat(60));
console.log(`\n⏳ Запуск сервера на порту ${port}...\n`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`✅ Сервер успешно запущен!`);
console.log(`\n🔗 Адреса:`);
console.log(`   • Основной: http://localhost:${port}`);
console.log(`   • tRPC API: http://localhost:${port}/api/trpc`);
console.log(`   • Health: http://localhost:${port}/`);
console.log(`\n📝 Что делать дальше:`);
console.log(`   1. Оставьте этот терминал открытым`);
console.log(`   2. Откройте новый терминал`);
console.log(`   3. Выполните: bun run start`);
console.log(`\n🔍 Проверить статус: bun check-backend.ts`);
console.log(`📚 Документация: ЗАПУСК_ПРИЛОЖЕНИЯ.md`);
console.log('\n' + '='.repeat(60) + '\n');

export default app;
