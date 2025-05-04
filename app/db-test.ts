import { Pool } from 'pg';

// Функция для тестирования подключения к базе данных
async function testDB() {
  try {
    // Конфигурация подключения
    const config = {
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'studentplanner'
    };
    
    console.log('Конфигурация подключения:', {
      ...config,
      password: '***' // Скрываем пароль в логах
    });
    
    const pool = new Pool(config);
    
    console.log('Тестирование подключения к базе данных...');
    
    // Проверка подключения
    const client = await pool.connect();
    console.log('Успешное подключение к базе данных!');
    
    // Проверяем, какие базы данных доступны
    const databases = await client.query('SELECT datname FROM pg_database');
    console.log('Доступные базы данных:', databases.rows.map(row => row.datname));
    
    // Проверяем текущую базу данных
    const currentDb = await client.query('SELECT current_database()');
    console.log('Текущая база данных:', currentDb.rows[0].current_database);
    
    // Проверяем таблицы в текущей базе
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log('Таблицы в текущей базе данных:', tables.rows.map(row => row.table_name));
    
    // Проверка запроса
    const result = await client.query('SELECT id, name, email FROM users');
    console.log('Все пользователи в базе данных:', result.rows);
    
    const result2 = await client.query('SELECT id, name, email FROM users WHERE email = $1', ['simple@example.com']);
    console.log('Результат запроса для simple@example.com:', result2.rows);
    
    client.release();
    
    await pool.end();
  } catch (error) {
    console.error('Ошибка при тестировании базы данных:', error);
  } finally {
    process.exit();
  }
}

testDB(); 