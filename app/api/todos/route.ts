import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../lib/auth';
import { todoRepository } from '../../lib/db';

// Получение всех задач пользователя
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      // Получение userId из query параметров или из токена
      const url = new URL(req.url);
      const userId = url.searchParams.get('userId') || user.id;
      
      // Получение задач из базы данных
      const todos = await todoRepository.getTodosByUserId(parseInt(userId as string));
      
      return NextResponse.json(todos);
    } catch (error) {
      console.error('Ошибка при получении задач:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
}

// Создание новой задачи
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      const { 
        title, 
        priority, 
        createdAt,
        userId 
      } = await req.json();
      
      // Проверка обязательных полей
      if (!title || !priority) {
        return NextResponse.json(
          { error: 'Необходимо указать название и приоритет' },
          { status: 400 }
        );
      }
      
      // Создание задачи
      const todo = await todoRepository.createTodo(
        title,
        priority,
        parseInt(userId || user.id)
      );
      
      // Добавляем createdAt, если он был передан (для совместимости с клиентским кодом)
      if (createdAt) {
        const result = await todoRepository.updateTodo(
          todo.id,
          todo.title,
          todo.completed,
          todo.priority
        );
        return NextResponse.json({
          ...result,
          createdAt: createdAt
        });
      }
      
      return NextResponse.json(todo);
    } catch (error) {
      console.error('Ошибка при создании задачи:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
} 