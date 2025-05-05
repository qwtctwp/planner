import { testDatabaseConnection, initDatabase } from './db';

// Инициализация и тестирование подключения
const initialize = async () => {
  // Проверка подключения к базе данных
  console.log('Инициализация приложения...');
  
  try {
    // Тестирование подключения к базе данных
    const connectionSuccessful = await testDatabaseConnection();
    
    if (connectionSuccessful) {
      // Если подключение успешно, инициализируем базу данных
      console.log('Начало инициализации базы данных...');
      await initDatabase();
      console.log('Инициализация базы данных завершена');
    } else {
      console.error('Не удалось инициализировать базу данных из-за проблем с подключением');
    }
  } catch (error) {
    console.error('Ошибка при инициализации:', error);
  }
};

// Выполняем инициализацию, но только не в режиме статической сборки
if (process.env.NEXT_PHASE !== 'phase-production-build' && 
    !(process.env.NODE_ENV === 'production' && process.env.VERCEL === '1')) {
  initialize();
}

export default initialize; 