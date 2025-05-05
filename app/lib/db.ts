import { Pool } from 'pg';

// Проверка, находимся ли мы в процессе сборки на Vercel или в режиме статической генерации
const isStaticGeneration = process.env.NEXT_PHASE === 'phase-production-build' || 
                         process.env.NODE_ENV === 'production' && process.env.VERCEL === '1';

// Создаем mock-функцию для запросов при статической сборке
const mockQuery = async (text: string, params?: any[]) => {
  console.log('Пропуск запроса БД в процессе сборки:', { text });
  return { rows: [], rowCount: 0 };
};

// Конфигурация подключения к PostgreSQL
const dbConfig = {
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'studentplanner',
  ssl: process.env.NODE_ENV === 'production' // Включаем SSL только в production
};

// Логгирование конфигурации (без пароля)
console.log('DB Config:', { 
  user: dbConfig.user,
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  ssl: dbConfig.ssl,
  password: '***' // Скрываем пароль в логах
});

// Создаем пул соединений только если не находимся в режиме статической сборки
const pool = isStaticGeneration ? null : new Pool(dbConfig);

// Проверка подключения при инициализации (только если не статическая сборка)
if (pool) {
  pool.on('connect', () => {
    console.log('Установлено соединение с базой данных PostgreSQL');
  });

  pool.on('error', (err) => {
    console.error('Ошибка в пуле подключений PostgreSQL', err);
  });
}

// Подключение к базе данных
export const query = async (text: string, params?: any[]) => {
  // Пропускаем реальные запросы при статической сборке
  if (isStaticGeneration) {
    return mockQuery(text, params);
  }

  try {
    const start = Date.now();
    
    if (!pool) {
      console.error('Пул соединений с базой данных не инициализирован');
      throw new Error('Пул соединений с базой данных не инициализирован');
    }
    
    console.log('Выполнение запроса:', { text, params });
    
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Запрос выполнен:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', { text, params, error });
    throw error;
  }
};

// Функция для проверки подключения к базе данных
export const testDatabaseConnection = async () => {
  try {
    if (!pool) {
      console.error('Пул соединений не инициализирован для тестирования');
      return false;
    }
    
    console.log('Тестирование подключения к базе данных...');
    const result = await pool.query('SELECT NOW()');
    console.log('Подключение к базе данных успешно! Текущее время сервера:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Ошибка при тестировании подключения к базе данных:', error);
    return false;
  }
};

// SQL скрипты для создания таблиц
export const initDatabase = async () => {
  // Создание таблицы пользователей
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Создание таблицы категорий
  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      color VARCHAR(50) NOT NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Создание таблицы событий
  await query(`
    CREATE TABLE IF NOT EXISTS events (
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

  // Создание таблицы заданий
  await query(`
    CREATE TABLE IF NOT EXISTS assignments (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      due_date TIMESTAMP,
      completed BOOLEAN DEFAULT FALSE,
      status VARCHAR(20) DEFAULT 'todo',
      event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Создание таблицы задач (todos)
  await query(`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      priority VARCHAR(50) NOT NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Создание таблицы тем для флеш-карточек
  await query(`
    CREATE TABLE IF NOT EXISTS flashcard_topics (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      color VARCHAR(50),
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Создание таблицы флеш-карточек
  await query(`
    CREATE TABLE IF NOT EXISTS flashcards (
      id SERIAL PRIMARY KEY,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      topic_id INTEGER REFERENCES flashcard_topics(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      favorite BOOLEAN DEFAULT FALSE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('База данных инициализирована');
};

// Функции для работы с пользователями
export const userRepository = {
  // Создать пользователя
  createUser: async (name: string, email: string, hashedPassword: string) => {
    console.log('Создание пользователя:', { name, email });
    try {
      const result = await query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *', 
        [name, email, hashedPassword]
      );
      console.log('Пользователь успешно создан:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Ошибка при создании пользователя:', error);
      throw error;
    }
  },

  // Получить пользователя по email
  getUserByEmail: async (email: string) => {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  // Получить пользователя по id
  getUserById: async (id: number) => {
    const result = await query('SELECT id, name, email, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }
};

// Функции для работы с категориями
export const categoryRepository = {
  // Получить все категории пользователя
  getCategoriesByUserId: async (userId: number) => {
    const result = await query('SELECT * FROM categories WHERE user_id = $1', [userId]);
    return result.rows;
  },

  // Создать категорию
  createCategory: async (name: string, color: string, userId: number) => {
    // First, let's reset the sequence if needed to avoid primary key conflicts
    await query('SELECT setval(\'categories_id_seq\', (SELECT COALESCE(MAX(id), 0) FROM categories), true)');
    
    const result = await query(
      'INSERT INTO categories (name, color, user_id) VALUES ($1, $2, $3) RETURNING *',
      [name, color, userId]
    );
    return result.rows[0];
  },

  // Обновить категорию
  updateCategory: async (id: number, name: string, color: string) => {
    const result = await query(
      'UPDATE categories SET name = $1, color = $2 WHERE id = $3 RETURNING *',
      [name, color, id]
    );
    return result.rows[0];
  },

  // Удалить категорию
  deleteCategory: async (id: number) => {
    await query('DELETE FROM categories WHERE id = $1', [id]);
  }
};

// Функции для работы с событиями
export const eventRepository = {
  // Получить все события пользователя
  getEventsByUserId: async (userId: number) => {
    const result = await query('SELECT * FROM events WHERE user_id = $1', [userId]);
    return result.rows;
  },

  // Создать событие
  createEvent: async (title: string, startTime: Date, endTime: Date, categoryId: number, userId: number, location?: string, description?: string) => {
    const result = await query(
      'INSERT INTO events (title, start_time, end_time, category_id, user_id, location, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, startTime, endTime, categoryId, userId, location, description]
    );
    return result.rows[0];
  },

  // Обновить событие
  updateEvent: async (id: number, title: string, startTime: Date, endTime: Date, categoryId: number, location?: string, description?: string) => {
    const result = await query(
      'UPDATE events SET title = $1, start_time = $2, end_time = $3, category_id = $4, location = $5, description = $6 WHERE id = $7 RETURNING *',
      [title, startTime, endTime, categoryId, location, description, id]
    );
    return result.rows[0];
  },

  // Удалить событие
  deleteEvent: async (id: number) => {
    await query('DELETE FROM events WHERE id = $1', [id]);
  },

  // Получить событие по id
  getEventById: async (id: number) => {
    const result = await query('SELECT * FROM events WHERE id = $1', [id]);
    return result.rows[0];
  }
};

// Для обратной совместимости
export const lessonRepository = eventRepository;

// Функции для работы с заданиями
export const assignmentRepository = {
  // Получить все задания пользователя
  getAssignmentsByUserId: async (userId: number) => {
    const result = await query('SELECT * FROM assignments WHERE user_id = $1', [userId]);
    return result.rows;
  },

  // Получить задания по ID события
  getAssignmentsByEventId: async (eventId: number) => {
    const result = await query('SELECT * FROM assignments WHERE event_id = $1', [eventId]);
    return result.rows;
  },
  
  // Получить задание по ID
  getAssignmentById: async (id: number) => {
    const result = await query('SELECT * FROM assignments WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Создать задание
  createAssignment: async (title: string, description: string, dueDate: Date | null, eventId: number | null, userId: number, status: string = 'todo') => {
    const result = await query(
      'INSERT INTO assignments (title, description, due_date, event_id, user_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, dueDate, eventId, userId, status]
    );
    return result.rows[0];
  },

  // Обновить задание
  updateAssignment: async (id: number, title: string, description: string, dueDate: Date | null, completed: boolean, status: string) => {
    const result = await query(
      'UPDATE assignments SET title = $1, description = $2, due_date = $3, completed = $4, status = $5 WHERE id = $6 RETURNING *',
      [title, description, dueDate, completed, status, id]
    );
    return result.rows[0];
  },

  // Обновить только статус и отметку о выполнении задания
  updateStatus: async (id: number, status: string, completed: boolean) => {
    const result = await query(
      'UPDATE assignments SET status = $1, completed = $2 WHERE id = $3 RETURNING *',
      [status, completed, id]
    );
    return result.rows[0];
  },

  // Пометить задание как выполненное/невыполненное
  toggleAssignmentCompletion: async (id: number, completed: boolean) => {
    const result = await query(
      'UPDATE assignments SET completed = $1 WHERE id = $2 RETURNING *',
      [completed, id]
    );
    return result.rows[0];
  },

  // Обновить статус задания
  updateAssignmentStatus: async (id: number, status: string) => {
    const result = await query(
      'UPDATE assignments SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  },

  // Удалить задание
  deleteAssignment: async (id: number) => {
    await query('DELETE FROM assignments WHERE id = $1', [id]);
  }
};

// Функции для работы с задачами (todos)
export const todoRepository = {
  // Получить все задачи пользователя
  getTodosByUserId: async (userId: number) => {
    const result = await query('SELECT * FROM todos WHERE user_id = $1', [userId]);
    return result.rows;
  },

  // Создать задачу
  createTodo: async (title: string, priority: string, userId: number) => {
    const result = await query(
      'INSERT INTO todos (title, priority, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, priority, userId]
    );
    return result.rows[0];
  },

  // Обновить задачу
  updateTodo: async (id: number, title: string, completed: boolean, priority: string) => {
    const result = await query(
      'UPDATE todos SET title = $1, completed = $2, priority = $3 WHERE id = $4 RETURNING *',
      [title, completed, priority, id]
    );
    return result.rows[0];
  },

  // Удалить задачу
  deleteTodo: async (id: number) => {
    await query('DELETE FROM todos WHERE id = $1', [id]);
  }
};

// Функции для работы с темами флеш-карточек
export const flashcardTopicRepository = {
  // Получить все темы пользователя
  getTopicsByUserId: async (userId: number) => {
    const result = await query(`
      SELECT ft.*, COUNT(f.id) as cards_count 
      FROM flashcard_topics ft
      LEFT JOIN flashcards f ON ft.id = f.topic_id
      WHERE ft.user_id = $1
      GROUP BY ft.id
    `, [userId]);
    return result.rows;
  },

  // Получить тему по ID
  getTopicById: async (id: number) => {
    const result = await query('SELECT * FROM flashcard_topics WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Создать тему
  createTopic: async (title: string, userId: number, categoryId: number | null, description?: string, color?: string) => {
    const result = await query(
      'INSERT INTO flashcard_topics (title, user_id, category_id, description, color) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, userId, categoryId, description, color]
    );
    return result.rows[0];
  },

  // Обновить тему
  updateTopic: async (id: number, title: string, categoryId: number | null, description?: string, color?: string) => {
    const result = await query(
      'UPDATE flashcard_topics SET title = $1, category_id = $2, description = $3, color = $4 WHERE id = $5 RETURNING *',
      [title, categoryId, description, color, id]
    );
    return result.rows[0];
  },

  // Удалить тему
  deleteTopic: async (id: number) => {
    await query('DELETE FROM flashcard_topics WHERE id = $1', [id]);
  }
};

// Функции для работы с флеш-карточками
export const flashcardRepository = {
  // Получить все карточки пользователя
  getCardsByUserId: async (userId: number) => {
    const result = await query('SELECT * FROM flashcards WHERE user_id = $1', [userId]);
    return result.rows;
  },

  // Получить карточки по теме
  getCardsByTopicId: async (topicId: number) => {
    const result = await query('SELECT * FROM flashcards WHERE topic_id = $1', [topicId]);
    return result.rows;
  },

  // Получить карточку по ID
  getCardById: async (id: number) => {
    const result = await query('SELECT * FROM flashcards WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Создать карточку
  createCard: async (front: string, back: string, topicId: number, userId: number, categoryId: number | null, favorite: boolean = false) => {
    const result = await query(
      'INSERT INTO flashcards (front, back, topic_id, user_id, category_id, favorite) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [front, back, topicId, userId, categoryId, favorite]
    );
    return result.rows[0];
  },

  // Обновить карточку
  updateCard: async (id: number, front: string, back: string, favorite: boolean) => {
    const result = await query(
      'UPDATE flashcards SET front = $1, back = $2, favorite = $3 WHERE id = $4 RETURNING *',
      [front, back, favorite, id]
    );
    return result.rows[0];
  },

  // Пометить карточку как избранную
  toggleFavorite: async (id: number, favorite: boolean) => {
    const result = await query(
      'UPDATE flashcards SET favorite = $1 WHERE id = $2 RETURNING *',
      [favorite, id]
    );
    return result.rows[0];
  },

  // Удалить карточку
  deleteCard: async (id: number) => {
    await query('DELETE FROM flashcards WHERE id = $1', [id]);
  }
};

export default {
  query,
  initDatabase,
  userRepository,
  categoryRepository,
  lessonRepository,
  assignmentRepository,
  todoRepository,
  flashcardTopicRepository,
  flashcardRepository
}; 