import { NextRequest, NextResponse } from 'next/server';
import { initDatabase } from '../../lib/db';

export async function GET(request: NextRequest) {
  try {
    await initDatabase();
    return NextResponse.json({ message: 'База данных успешно инициализирована' });
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 