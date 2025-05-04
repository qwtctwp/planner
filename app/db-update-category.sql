-- Начинаем транзакцию для безопасности
BEGIN;

-- 1. Сначала создаем временную таблицу для данных категорий (только id, name, color)
CREATE TEMPORARY TABLE temp_categories AS
SELECT id, name, color, user_id, created_at
FROM categories;

-- 2. Удаляем существующие ограничения внешнего ключа из таблицы lessons
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_category_id_fkey;

-- 3. Удаляем старую таблицу categories
DROP TABLE categories;

-- 4. Создаем новую таблицу categories только с нужными полями
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(50) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Восстанавливаем данные из временной таблицы
INSERT INTO categories (id, name, color, user_id, created_at)
SELECT id, name, color, user_id, created_at FROM temp_categories;

-- 6. Восстанавливаем ограничение внешнего ключа в таблице lessons
ALTER TABLE lessons ADD CONSTRAINT lessons_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- 7. Создаем индекс для оптимизации запросов по user_id
CREATE INDEX idx_categories_user_id ON categories(user_id);

-- Фиксируем изменения
COMMIT; 