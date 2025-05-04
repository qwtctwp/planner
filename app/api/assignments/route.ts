import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../lib/auth';
import { assignmentRepository } from '../../lib/db';

// Преобразование числовых ID в строки для клиентского кода
const formatAssignment = (assignment: any) => {
  if (!assignment) return null;
  return {
    ...assignment,
    id: assignment.id.toString(),
    lessonId: assignment.event_id ? assignment.event_id.toString() : '',
    dueDate: assignment.due_date ? assignment.due_date.toISOString() : null,
    completed: !!assignment.completed,
    status: assignment.status || (assignment.completed ? 'done' : 'todo'), // Default status based on completed flag
    description: assignment.description || '',
    title: assignment.title || ''
  };
};

// Получение всех заданий пользователя
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      // Получение userId из query параметров или из токена
      const url = new URL(req.url);
      const userId = url.searchParams.get('userId') || user.id;
      
      console.log('GET /api/assignments - userId:', userId);
      
      // Получение заданий из базы данных
      const assignments = await assignmentRepository.getAssignmentsByUserId(parseInt(userId as string));
      
      console.log('Найдено заданий:', assignments.length);
      
      // Преобразуем все ID в строки для клиентского кода
      const formattedAssignments = assignments.map(formatAssignment);
      
      // Создаем ответ с правильной кодировкой
      const response = NextResponse.json(formattedAssignments);
      response.headers.set('Content-Type', 'application/json; charset=utf-8');
      
      return response;
    } catch (error) {
      console.error('Ошибка при получении заданий:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
}

// Создание нового задания
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      // Получаем тело запроса в сыром виде
      const rawBody = await req.text();
      console.log('Raw request body:', rawBody);

      // Преобразуем тело запроса в JSON
      const body = JSON.parse(rawBody);
      console.log('POST /api/assignments - тело запроса:', body);
      
      const { 
        title, 
        lessonId, 
        description, 
        dueDate, 
        userId,
        categoryId, // Мы получаем categoryId из запроса, но не используем его при создании
        status = 'todo' // Default status is 'todo'
      } = body;
      
      console.log('Извлеченные поля:', {
        title, 
        lessonId,
        categoryId, // Для логирования оставляем
        description, 
        dueDate, 
        userId,
        status
      });

      // Проверка обязательных полей
      if (!title) {
        return NextResponse.json(
          { error: 'Необходимо указать название задания' },
          { status: 400 }
        );
      }
      
      const userIdForAssignment = parseInt(userId || user.id);
      console.log('ID пользователя для задания:', userIdForAssignment);
      
      let eventIdNumber = null;
      if (lessonId && lessonId.trim() !== '') {
        eventIdNumber = parseInt(lessonId);
        console.log('Преобразованный ID события (урока):', eventIdNumber);
      } else {
        console.log('Задание создается без привязки к событию (уроку)');
      }
      
      // Создание задания без использования categoryId
      const assignment = await assignmentRepository.createAssignment(
        title,
        description,
        dueDate ? new Date(dueDate) : undefined,
        eventIdNumber,
        userIdForAssignment,
        status
      );
      
      console.log('Создано задание:', assignment);
      
      // Преобразуем ID в строку для клиентского кода
      const formattedAssignment = formatAssignment(assignment);
      
      // Создаем ответ с правильной кодировкой
      const response = NextResponse.json(formattedAssignment);
      response.headers.set('Content-Type', 'application/json; charset=utf-8');
      
      return response;
    } catch (error) {
      console.error('Ошибка при создании задания:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
} 