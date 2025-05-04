import { initDatabase } from './lib/db';

// Инициализация базы данных
async function init() {
  try {
    console.log('Начинаем инициализацию базы данных...');
    await initDatabase();
    console.log('База данных успешно инициализирована!');
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
  } finally {
    process.exit();
  }
}

init(); 