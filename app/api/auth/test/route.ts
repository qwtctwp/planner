import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { userRepository } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    // Тестируем получение пользователя simple@example.com
    const user = await userRepository.getUserByEmail('simple@example.com');
    
    // Проверка результата
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь simple@example.com не найден в базе данных' },
        { status: 404 }
      );
    }
    
    // Очищаем пароль из результата
    const { password, ...userData } = user;
    
    return NextResponse.json({
      message: 'Тестирование соединения с базой данных',
      user: userData,
      foundUser: true
    });
  } catch (error) {
    console.error('Ошибка при тестировании:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Проверка наличия всех полей
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Необходимо указать электронную почту и пароль' },
        { status: 400 }
      );
    }
    
    // Поиск пользователя по email
    const user = await userRepository.getUserByEmail(email);
    
    // Результат поиска
    if (!user) {
      return NextResponse.json({
        found: false,
        message: `Пользователь с email ${email} не найден`
      });
    }
    
    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    // Очищаем пароль из результата
    const { password: _, ...userData } = user;
    
    return NextResponse.json({
      found: true,
      passwordValid: isPasswordValid,
      user: userData,
      message: isPasswordValid ? 'Аутентификация успешна' : 'Неверный пароль'
    });
  } catch (error) {
    console.error('Ошибка при тестировании аутентификации:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 