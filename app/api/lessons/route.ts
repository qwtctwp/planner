import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../lib/auth';
import { lessonRepository } from '../../lib/db';

// Преобразование числовых ID в строки для клиентского кода
const formatLesson = (lesson: any) => {
  if (!lesson) return null;
  
  console.log('Форматирование урока с сервера:', lesson);
  console.log('Тип start_time:', typeof lesson.start_time, 'Значение:', lesson.start_time);
  console.log('Тип end_time:', typeof lesson.end_time, 'Значение:', lesson.end_time);
  
  // Преобразуем начало и конец в ISO-строки, если это объекты Date
  const start = lesson.start_time ? (
    typeof lesson.start_time === 'object' ? lesson.start_time.toISOString() : lesson.start_time
  ) : null;
  
  const end = lesson.end_time ? (
    typeof lesson.end_time === 'object' ? lesson.end_time.toISOString() : lesson.end_time
  ) : null;
  
  // Для совместимости с клиентским кодом
  const assignments = lesson.assignments || [];
  
  const formattedLesson = {
    id: lesson.id.toString(),
    title: lesson.title,
    start: start,
    end: end,
    categoryId: lesson.category_id ? lesson.category_id.toString() : '',
    location: lesson.location || '',
    description: lesson.description || '',
    assignments: Array.isArray(assignments) 
      ? assignments.map(id => id.toString()) 
      : []
  };
  
  console.log('Отформатированный урок для клиента:', formattedLesson);
  
  return formattedLesson;
};

// Получение всех уроков пользователя
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      // Получение userId из query параметров или из токена
      const url = new URL(req.url);
      const userId = url.searchParams.get('userId') || user.id;
      
      console.log('GET /api/lessons - userId:', userId);
      
      // Получение уроков из базы данных
      const lessons = await lessonRepository.getEventsByUserId(parseInt(userId as string));
      
      console.log('Найдено уроков:', lessons.length);
      
      // Преобразуем ID в строки и форматируем поля для клиентского кода
      const formattedLessons = lessons.map(formatLesson);
      
      return NextResponse.json(formattedLessons);
    } catch (error) {
      console.error('Ошибка при получении уроков:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
}

// Создание нового урока
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      const rawBody = await req.text();
      console.log('POST /api/lessons - сырое тело запроса:', rawBody);
      
      const body = JSON.parse(rawBody);
      console.log('POST /api/lessons - парсированное тело запроса:', body);
      
      const { 
        title, 
        start, 
        end, 
        categoryId, 
        location, 
        description, 
        userId 
      } = body;
      
      console.log('Разобранные поля:');
      console.log('title:', title);
      console.log('start:', start, 'тип:', typeof start);
      console.log('end:', end, 'тип:', typeof end);
      console.log('categoryId:', categoryId, 'тип:', typeof categoryId);
      
      // Проверка обязательных полей
      if (!title || !start || !end || !categoryId) {
        console.error('Отсутствуют обязательные поля:', { title, start, end, categoryId });
        return NextResponse.json(
          { error: 'Необходимо указать название, время начала и окончания, и категорию' },
          { status: 400 }
        );
      }
      
      console.log('Преобразование дат перед созданием урока:');
      console.log('start в объект Date:', new Date(start));
      console.log('end в объект Date:', new Date(end));
      
      // Создание урока
      const lesson = await lessonRepository.createEvent(
        title,
        new Date(start),
        new Date(end),
        parseInt(categoryId),
        parseInt(userId || user.id),
        location,
        description
      );
      
      console.log('Создан урок из БД:', lesson);
      
      // Преобразуем форматы для клиентского кода
      const formattedLesson = formatLesson(lesson);
      
      return NextResponse.json(formattedLesson);
    } catch (error) {
      console.error('Ошибка при создании урока:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
} 