import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../lib/auth';
import { todoRepository } from '../../../lib/db';

// Обновление задачи
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      const todoId = parseInt(params.id);
      const { 
        title, 
        completed, 
        priority, 
        createdAt
      } = await req.json();
      
      // Проверка обязательных полей
      if (!title || !priority) {
        return NextResponse.json(
          { error: 'Необходимо указать название и приоритет' },
          { status: 400 }
        );
      }
      
      // Обновление задачи
      const todo = await todoRepository.updateTodo(
        todoId,
        title,
        completed === true,
        priority
      );
      
      if (!todo) {
        return NextResponse.json(
          { error: 'Задача не найдена' },
          { status: 404 }
        );
      }
      
      // Добавляем createdAt, если он был передан (для совместимости с клиентским кодом)
      if (createdAt) {
        return NextResponse.json({
          ...todo,
          createdAt: createdAt
        });
      }
      
      return NextResponse.json(todo);
    } catch (error) {
      console.error('Ошибка при обновлении задачи:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
}

// Удаление задачи
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      const todoId = parseInt(params.id);
      
      // Удаление задачи
      await todoRepository.deleteTodo(todoId);
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
} 