import { NextRequest, NextResponse } from 'next/server';
import { userRepository } from '../../../lib/db';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('Попытка входа:', { email, password });

    // Проверка наличия всех полей
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Необходимо указать электронную почту и пароль' },
        { status: 400 }
      );
    }

    // Поиск пользователя по email
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      console.log('Пользователь не найден');
      return NextResponse.json(
        { error: 'Неверная электронная почта или пароль' },
        { status: 401 }
      );
    }
    
    console.log('Пользователь найден:', { id: user.id, email: user.email });
    console.log('Пароль из БД:', user.password);
    console.log('Введенный пароль:', password);

    // Проверка пароля напрямую (без хеширования)
    const isPasswordValid = (password === user.password);
    console.log('Результат проверки пароля:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Пароль неверный');
      return NextResponse.json(
        { error: 'Неверная электронная почта или пароль' },
        { status: 401 }
      );
    }

    // Создание JWT токена
    const token = sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );
    
    console.log('Токен создан');

    // Установка куки с токеном
    cookies().set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 дней
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });
    
    console.log('Куки установлены');

    // Создаем безопасный объект для JSON-сериализации
    const safeUserObject = {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at ? user.created_at.toISOString() : null
    };
    
    console.log('Отправка данных пользователя:', safeUserObject);
    return NextResponse.json(safeUserObject);
  } catch (error) {
    console.error('Ошибка при аутентификации:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 