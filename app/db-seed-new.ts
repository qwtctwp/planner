import { userRepository } from './lib/db';
import bcrypt from 'bcrypt';

// Функция для добавления тестового пользователя
async function seedUser() {
  try {
    console.log('Добавление нового тестового пользователя...');
    
    const email = 'admin@example.com';
    const password = 'admin123';
    
    // Проверяем, существует ли пользователь с email admin@example.com
    const existingUser = await userRepository.getUserByEmail(email);
    
    if (existingUser) {
      console.log('Этот пользователь уже существует!');
      return;
    }
    
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Создан хеш пароля:', hashedPassword);
    
    // Создаем пользователя
    const user = await userRepository.createUser('Admin User', email, hashedPassword);
    
    console.log('Новый тестовый пользователь успешно создан:', {
      id: user.id,
      name: user.name,
      email: user.email,
      password: password // показываем пароль в незашифрованном виде
    });
  } catch (error) {
    console.error('Ошибка при добавлении тестового пользователя:', error);
  } finally {
    process.exit();
  }
}

seedUser(); 