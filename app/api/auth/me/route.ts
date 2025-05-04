import { NextRequest, NextResponse } from 'next/server';
import { withAuth, JwtPayload } from '../../../lib/auth';
import { userRepository } from '../../../lib/db';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req: NextRequest, user: JwtPayload) => {
    try {
      // Получение данных пользователя из базы данных
      const userData = await userRepository.getUserById(user.id);
      
      if (!userData) {
        return NextResponse.json(
          { error: 'Пользователь не найден' },
          { status: 404 }
        );
      }
      
      // Отправка данных пользователя без пароля
      const { password, ...userWithoutPassword } = userData;
      
      // Добавляем id как числовое поле, если оно ещё не определено
      if (typeof userWithoutPassword.id === 'string') {
        userWithoutPassword.id = parseInt(userWithoutPassword.id);
      }
      
      return NextResponse.json(userWithoutPassword);
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
} 