import { NextRequest, NextResponse } from 'next/server';
import { userRepository } from '../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();
    
    console.log('Начало регистрации пользователя:', { name, email });

    // Проверка наличия всех полей
    if (!name || !email || !password) {
      console.log('Отсутствуют обязательные поля');
      return NextResponse.json(
        { error: 'Все поля обязательны для заполнения' },
        { status: 400 }
      );
    }

    // Проверка, существует ли пользователь с таким email
    console.log('Проверка существующего пользователя с email:', email);
    const existingUser = await userRepository.getUserByEmail(email);
    
    if (existingUser) {
      console.log('Пользователь уже существует:', { email });
      return NextResponse.json(
        { error: 'Пользователь с такой электронной почтой уже существует' },
        { status: 409 }
      );
    }

    console.log('Пользователь не найден, создаем нового');
    
    // Сохраняем пароль в открытом виде (без хеширования)
    const plainPassword = password;

    // Создание пользователя
    console.log('Вызов метода createUser');
    const newUser = await userRepository.createUser(name, email, plainPassword);
    console.log('Пользователь создан:', { id: newUser.id, email: newUser.email });

    // Создаем безопасный объект для JSON-сериализации
    const safeUserObject = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      created_at: newUser.created_at ? newUser.created_at.toISOString() : null
    };

    // Ответ с данными нового пользователя
    return NextResponse.json(safeUserObject, { status: 201 });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 