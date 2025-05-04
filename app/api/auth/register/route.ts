import { NextRequest, NextResponse } from 'next/server';
import { userRepository } from '../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Проверка наличия всех полей
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Все поля обязательны для заполнения' },
        { status: 400 }
      );
    }

    // Проверка, существует ли пользователь с таким email
    const existingUser = await userRepository.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с такой электронной почтой уже существует' },
        { status: 409 }
      );
    }

    // Сохраняем пароль в открытом виде (без хеширования)
    const plainPassword = password;

    // Создание пользователя
    const newUser = await userRepository.createUser(name, email, plainPassword);

    // Ответ с данными нового пользователя
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 