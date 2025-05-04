import { userRepository } from './lib/db';
import bcrypt from 'bcrypt';

// Функция для добавления тестового пользователя
async function seedUser() {
  try {
    console.log('Добавление тестового пользователя...');
    
    // Проверяем, существует ли пользователь с email test@example.com
    const existingUser = await userRepository.getUserByEmail('test@example.com');
    
    if (existingUser) {
      console.log('Тестовый пользователь уже существует!');
      return;
    }
    
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    // Создаем пользователя
    const user = await userRepository.createUser('Test User', 'test@example.com', hashedPassword);
    
    console.log('Тестовый пользователь успешно создан:', {
      id: user.id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error('Ошибка при добавлении тестового пользователя:', error);
  } finally {
    process.exit();
  }
}

seedUser(); 