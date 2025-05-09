import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../lib/auth';
import { lessonRepository, eventRepository } from '../../../lib/db';

// Преобразование числовых ID в строки для клиентского кода
const formatLesson = (lesson: any) => {
  if (!lesson) return null;
  
  // Преобразуем начало и конец в ISO-строки, если это объекты Date
  const start = lesson.start_time ? (
    typeof lesson.start_time === 'object' ? lesson.start_time.toISOString() : lesson.start_time
  ) : null;
  
  const end = lesson.end_time ? (
    typeof lesson.end_time === 'object' ? lesson.end_time.toISOString() : lesson.end_time
  ) : null;
  
  // Для совместимости с клиентским кодом
  const assignments = lesson.assignments || [];
  
  return {
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
};

// Обновление урока
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      console.log('PUT /api/lessons/[id] - id:', params.id);
      
      const lessonId = parseInt(params.id);
      const body = await req.json();
      console.log('Тело запроса:', body);
      
      const { 
        title, 
        start, 
        end, 
        categoryId, 
        location, 
        description 
      } = body;
      
      // Проверка обязательных полей
      if (!title || !start || !end || !categoryId) {
        console.error('Отсутствуют обязательные поля:', { title, start, end, categoryId });
        return NextResponse.json(
          { error: 'Необходимо указать название, время начала и окончания, и категорию' },
          { status: 400 }
        );
      }
      
      console.log('Преобразование дат для API:');
      console.log('Start (исходный):', start, 'Тип:', typeof start);
      console.log('End (исходный):', end, 'Тип:', typeof end);
      
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      console.log('Start (преобразованный):', startDate, 'Валидный:', !isNaN(startDate.getTime()));
      console.log('End (преобразованный):', endDate, 'Валидный:', !isNaN(endDate.getTime()));
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('Некорректный формат даты');
        return NextResponse.json(
          { error: 'Некорректный формат даты' },
          { status: 400 }
        );
      }
      
      // Обновление урока
      const lesson = await eventRepository.updateEvent(
        lessonId,
        title,
        startDate,
        endDate,
        parseInt(categoryId),
        location,
        description
      );
      
      if (!lesson) {
        return NextResponse.json(
          { error: 'Урок не найден' },
          { status: 404 }
        );
      }
      
      console.log('Обновлен урок:', lesson);
      
      // Преобразуем форматы для клиентского кода
      const formattedLesson = formatLesson(lesson);
      
      return NextResponse.json(formattedLesson);
    } catch (error) {
      console.error('Ошибка при обновлении урока:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
}

// Удаление урока
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      console.log('DELETE /api/lessons/[id] - id:', params.id);
      
      const lessonId = parseInt(params.id);
      
      // Удаление урока
      await eventRepository.deleteEvent(lessonId);
      
      console.log('Урок удален успешно');
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Ошибка при удалении урока:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
} 