-- Создание базы данных (выполнить в psql)
CREATE DATABASE student_planner;

-- Подключение к базе данных
\c student_planner;

-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы категорий
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы уроков
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
);

-- Создание таблицы заданий
CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  completed BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'todo',
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы задач (todos)
CREATE TABLE IF NOT EXISTS todos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  due_date TIMESTAMP,
  priority VARCHAR(50) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для оптимизации запросов
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_lessons_user_id ON lessons(user_id);
CREATE INDEX idx_lessons_category_id ON lessons(category_id);
CREATE INDEX idx_assignments_user_id ON assignments(user_id);
CREATE INDEX idx_assignments_lesson_id ON assignments(lesson_id);
CREATE INDEX idx_todos_user_id ON todos(user_id);

-- Создание тестового пользователя (пароль: test123)
INSERT INTO users (name, email, password) 
VALUES ('Тестовый пользователь', 'test@example.com', '$2b$10$A7cwGRgS.Vkwb.gzK.HOzuvyRfR7oHvZcCJCxMN.dQgCa3VgReiIa');

-- Добавление тестовых категорий
INSERT INTO categories (name, color, type, user_id) 
VALUES 
  ('Математика', '#f44336', 'subject', 1),
  ('Физика', '#2196f3', 'subject', 1),
  ('Информатика', '#4caf50', 'subject', 1),
  ('Спортивная секция', '#ff9800', 'club', 1);

-- Добавление тестовых уроков
INSERT INTO lessons (title, start_time, end_time, category_id, user_id, location) 
VALUES 
  ('Алгебра', '2023-05-01 10:00:00', '2023-05-01 11:30:00', 1, 1, 'Аудитория 205'),
  ('Геометрия', '2023-05-02 13:00:00', '2023-05-02 14:30:00', 1, 1, 'Аудитория 301'),
  ('Механика', '2023-05-03 09:00:00', '2023-05-03 10:30:00', 2, 1, 'Лаборатория физики');

-- Добавление тестовых заданий
INSERT INTO assignments (title, description, due_date, lesson_id, user_id, status) 
VALUES 
  ('Решить задачи 1-5', 'Страница 42 в учебнике', '2023-05-05 23:59:59', 1, 1, 'todo'),
  ('Подготовить доклад', 'Тема: Теорема Пифагора', '2023-05-10 23:59:59', 2, 1, 'in_progress');

-- Добавление тестовых задач
INSERT INTO todos (title, priority, user_id, due_date) 
VALUES 
  ('Подготовиться к контрольной', 'high', 1, '2023-05-07 23:59:59'),
  ('Купить новую тетрадь', 'medium', 1, '2023-05-03 23:59:59'),
  ('Записаться на консультацию', 'low', 1, NULL); 