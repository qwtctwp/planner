-- Начинаем транзакцию для безопасности
BEGIN;

-- 1. Переименование таблицы lessons в events
ALTER TABLE lessons RENAME TO events;

-- 2. Обновляем внешние ключи, которые ссылаются на lessons
ALTER TABLE assignments 
    DROP CONSTRAINT IF EXISTS assignments_lesson_id_fkey;
    
ALTER TABLE assignments 
    RENAME COLUMN lesson_id TO event_id;
    
ALTER TABLE assignments 
    ADD CONSTRAINT assignments_event_id_fkey
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- 3. Создаем необходимые индексы (вместо переименования)
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_category_id ON events(category_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_event_id ON assignments(event_id);

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

-- Добавление поля для статуса в таблицу assignments, если его нет
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='assignments' AND column_name='status'
  ) THEN
    ALTER TABLE assignments ADD COLUMN status VARCHAR(20) DEFAULT 'todo';
  END IF;
END $$;

-- Добавление поля category_id в таблицу assignments, если его нет
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='assignments' AND column_name='category_id'
  ) THEN
    ALTER TABLE assignments ADD COLUMN category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;
    CREATE INDEX idx_assignments_category_id ON assignments(category_id);
  END IF;
END $$;

-- Фиксируем изменения
COMMIT; 