import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../lib/auth';
import { eventRepository } from '../../../lib/db';

// Преобразование числовых ID в строки для клиентского кода
const formatEvent = (event: any) => {
  if (!event) return null;
  
  // Преобразуем начало и конец в ISO-строки, если это объекты Date
  const start = event.start_time ? (
    typeof event.start_time === 'object' ? event.start_time.toISOString() : event.start_time
  ) : null;
  
  const end = event.end_time ? (
    typeof event.end_time === 'object' ? event.end_time.toISOString() : event.end_time
  ) : null;
  
  // Для совместимости с клиентским кодом
  const assignments = event.assignments || [];
  
  return {
    id: event.id.toString(),
    title: event.title,
    start: start,
    end: end,
    categoryId: event.category_id ? event.category_id.toString() : '',
    location: event.location || '',
    description: event.description || '',
    assignments: Array.isArray(assignments) 
      ? assignments.map(id => id.toString()) 
      : []
  };
};

// Обновление события
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      console.log('PUT /api/events/[id] - id:', params.id);
      
      const eventId = parseInt(params.id);
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
      
      // Обновление события
      const event = await eventRepository.updateEvent(
        eventId,
        title,
        startDate,
        endDate,
        parseInt(categoryId),
        location,
        description
      );
      
      if (!event) {
        return NextResponse.json(
          { error: 'Событие не найдено' },
          { status: 404 }
        );
      }
      
      console.log('Обновлено событие:', event);
      
      // Преобразуем форматы для клиентского кода
      const formattedEvent = formatEvent(event);
      
      return NextResponse.json(formattedEvent);
    } catch (error) {
      console.error('Ошибка при обновлении события:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
}

// Удаление события
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      console.log('DELETE /api/events/[id] - id:', params.id);
      
      const eventId = parseInt(params.id);
      
      // Удаление события
      await eventRepository.deleteEvent(eventId);
      
      console.log('Событие удалено успешно');
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Ошибка при удалении события:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
} 