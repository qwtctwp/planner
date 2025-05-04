const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Загрузка переменных окружения из .env.local если в командной строке не запущено с process.env
if (!process.env.POSTGRES_USER) {
  try {
    const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
    envFile.split('\n').forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    });
    console.log('Загружены переменные окружения из .env.local');
  } catch (err) {
    console.warn('Не удалось загрузить .env.local:', err.message);
  }
}

// Конфигурация подключения к базе данных
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'studentplanner', // Используем значение из .env.local
  password: process.env.POSTGRES_PASSWORD || '',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

console.log('Подключение к базе данных:', {
  database: process.env.POSTGRES_DB || 'studentplanner',
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
});

async function updateDatabase() {
  try {
    // Чтение SQL-файла обновления
    const updateSql = fs.readFileSync(path.join(__dirname, '../db-update.sql'), 'utf8');
    
    console.log('Starting database update...');
    
    // Выполнение SQL-запроса
    await pool.query(updateSql);
    
    console.log('Database updated successfully!');
    console.log('- Renamed lessons to events');
    console.log('- Added flashcards and flashcard_topics tables');
    console.log('- Updated related constraints and indexes');
    
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    // Закрытие соединения с базой данных
    await pool.end();
  }
}

// Запуск скрипта
updateDatabase(); 