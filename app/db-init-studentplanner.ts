import { Pool } from 'pg';

// Функция для инициализации базы данных
async function initStudentPlannerDB() {
  const pool = new Pool({
    user: 'ekaterinauhova', // используем имя пользователя из логов
    password: process.env.POSTGRES_PASSWORD || '',
    host: 'localhost',
    port: 5432,
    database: 'studentplanner' // важно: без подчеркивания
  });

  try {
    console.log('Начинаем инициализацию базы данных studentplanner...');
    
    // Проверяем подключение
    const client = await pool.connect();
    console.log('Успешное подключение к базе данных!');
    
    // Создание таблицы пользователей
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Таблица users создана');

    // Создание таблицы категорий
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Таблица categories создана');

    // Создание таблицы уроков
    await client.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        location VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Таблица lessons создана');

    // Создание таблицы заданий
    await client.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date TIMESTAMP,
        completed BOOLEAN DEFAULT FALSE,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Таблица assignments создана');

    // Создание таблицы задач (todos)
    await client.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        due_date TIMESTAMP,
        priority VARCHAR(50) NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Таблица todos создана');

    // Создание тестового пользователя
    const hashedPassword = '$2b$10$YubB1uk9ohpkMNgvdWS1v.mbCg6.2BsM1iOJXzNELL70jtb6csRKa'; // хеш для пароля '123456'
    
    try {
      await client.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
        ['Test User', 'simple@example.com', hashedPassword]
      );
      console.log('Тестовый пользователь создан: simple@example.com / 123456');
    } catch (err) {
      console.log('Тестовый пользователь уже существует или произошла ошибка:', err.message);
    }

    client.release();
    console.log('База данных studentplanner успешно инициализирована!');
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
  } finally {
    await pool.end();
    process.exit();
  }
}

initStudentPlannerDB(); 