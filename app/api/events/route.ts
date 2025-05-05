import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../lib/auth';
import { eventRepository } from '../../lib/db';

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
  
  console.log('Форматирование урока с сервера:', event);
  console.log('Тип start_time:', typeof event.start_time, 'Значение:', event.start_time);
  console.log('Тип end_time:', typeof event.end_time, 'Значение:', event.end_time);
  
  const formattedEvent = {
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
  
  console.log('Отформатированный урок для клиента:', formattedEvent);
  
  return formattedEvent;
};

export async function GET(request: NextRequest) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      const url = new URL(req.url);
      const userId = url.searchParams.get('userId');
      
      console.log('GET /api/events - userId:', userId);
      
      if (!userId) {
        return NextResponse.json(
          { error: 'userId is required' },
          { status: 400 }
        );
      }
      
      console.log('Текущая база данных:', process.env.POSTGRES_DB);
      
      const events = await eventRepository.getEventsByUserId(parseInt(userId));
      console.log('Найдено уроков:', events.length);
      
      // Format events for the client
      const formattedEvents = events.map(formatEvent);
      
      return NextResponse.json(formattedEvents);
    } catch (error) {
      console.error('Ошибка при получении событий:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      const body = await req.json();
      console.log('POST /api/events - тело запроса:', body);
      
      const { 
        userId, 
        title, 
        start, 
        end, 
        categoryId, 
        location, 
        description 
      } = body;
      
      // Проверка обязательных полей
      if (!userId || !title || !start || !end || !categoryId) {
        return NextResponse.json(
          { error: 'Необходимо указать userId, название, время начала и окончания, и категорию' },
          { status: 400 }
        );
      }
      
      // Создание события
      const event = await eventRepository.createEvent(
        title,
        new Date(start),
        new Date(end),
        parseInt(categoryId),
        parseInt(userId),
        location,
        description
      );
      
      console.log('Создано событие:', event);
      
      // Преобразуем форматы для клиентского кода
      const formattedEvent = formatEvent(event);
      
      return NextResponse.json(formattedEvent);
    } catch (error) {
      console.error('Ошибка при добавлении события:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
} 