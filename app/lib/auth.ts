import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Интерфейс для JWT payload
export interface JwtPayload {
  id: number;
  email: string;
}

// Получить JWT токен из cookie
export const getTokenFromCookies = () => {
  return cookies().get('token')?.value;
};

// Верифицировать JWT токен
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return verify(token, process.env.JWT_SECRET || 'default_secret') as JwtPayload;
  } catch (error) {
    console.error('Ошибка при верификации токена:', error);
    return null;
  }
};

// Middleware для проверки авторизации
export const withAuth = async (request: NextRequest, handler: Function) => {
  const token = getTokenFromCookies();
  
  if (!token) {
    return NextResponse.json(
      { error: 'Требуется авторизация' },
      { status: 401 }
    );
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: 'Неверный или истёкший токен' },
      { status: 401 }
    );
  }

  return handler(request, payload);
}; 