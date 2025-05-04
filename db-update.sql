-- Начинаем транзакцию для безопасности
BEGIN;

-- 1. Переименование таблицы lessons в events
ALTER TABLE lessons RENAME TO events;

-- 2. Обновляем внешние ключи, которые ссылаются на lessons
ALTER TABLE assignments 
    DROP CONSTRAINT assignments_lesson_id_fkey;
    
ALTER TABLE assignments 
    RENAME COLUMN lesson_id TO event_id;
    
ALTER TABLE assignments 
    ADD CONSTRAINT assignments_event_id_fkey
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- 3. Переименовываем индексы
ALTER INDEX idx_lessons_user_id RENAME TO idx_events_user_id;
ALTER INDEX idx_lessons_category_id RENAME TO idx_events_category_id;

-- 4. Создание таблицы тем для карточек
CREATE TABLE IF NOT EXISTS flashcard_topics (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  color VARCHAR(50),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Создание таблицы флеш-карточек
CREATE TABLE IF NOT EXISTS flashcards (
  id SERIAL PRIMARY KEY,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  topic_id INTEGER REFERENCES flashcard_topics(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  favorite BOOLEAN DEFAULT FALSE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Создание индексов для оптимизации запросов
CREATE INDEX idx_flashcard_topics_user_id ON flashcard_topics(user_id);
CREATE INDEX idx_flashcard_topics_category_id ON flashcard_topics(category_id);
CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX idx_flashcards_topic_id ON flashcards(topic_id);
CREATE INDEX idx_flashcards_category_id ON flashcards(category_id);

-- Фиксируем изменения
COMMIT; 