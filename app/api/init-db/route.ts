import { NextRequest, NextResponse } from 'next/server';
import { testDatabaseConnection, initDatabase } from '../../lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('Запрошена инициализация базы данных');
    
    // Проверка подключения
    const isConnected = await testDatabaseConnection();
    
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Не удалось подключиться к базе данных' },
        { status: 500 }
      );
    }
    
    // Инициализация базы данных
    console.log('Подключение успешно, начинаем инициализацию базы данных');
    await initDatabase();
    
    return NextResponse.json(
      { success: true, message: 'База данных успешно инициализирована' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 