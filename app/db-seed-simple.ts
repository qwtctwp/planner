import { userRepository } from './lib/db';
import bcrypt from 'bcrypt';

// Функция для добавления тестового пользователя с простым паролем
async function seedUser() {
  try {
    console.log('Добавление тестового пользователя с простым паролем...');
    
    const email = 'simple@example.com';
    const password = '123456';
    
    // Проверяем, существует ли пользователь
    const existingUser = await userRepository.getUserByEmail(email);
    
    if (existingUser) {
      console.log('Этот пользователь уже существует!');
      return;
    }
    
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Создан хеш пароля:', hashedPassword);
    
    // Создаем пользователя
    const user = await userRepository.createUser('Simple User', email, hashedPassword);
    
    console.log('Тестовый пользователь с простым паролем успешно создан:', {
      id: user.id,
      name: user.name,
      email: user.email,
      password: password
    });
    
    // Дополнительно проверяем работу bcrypt.compare
    const isMatch = await bcrypt.compare(password, hashedPassword);
    console.log(`Проверка пароля bcrypt.compare('${password}', '${hashedPassword}') = ${isMatch}`);
    
  } catch (error) {
    console.error('Ошибка при добавлении тестового пользователя:', error);
  } finally {
    process.exit();
  }
}

seedUser(); 