import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../lib/auth';
import { flashcardTopicRepository } from '../../lib/db';

// Преобразование числовых ID в строки для клиентского кода
const formatTopic = (topic: any) => {
  if (!topic) return null;
  return {
    ...topic,
    id: topic.id.toString(),
    categoryId: topic.category_id ? topic.category_id.toString() : null,
    createdAt: topic.created_at ? topic.created_at.toISOString() : new Date().toISOString(),
    cardsCount: topic.cards_count || 0
  };
};

// Получение тем для флеш-карточек
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      console.log('GET /api/flashcard-topics');
      
      // Получаем userId из запроса или используем ID текущего пользователя
      const { searchParams } = new URL(req.url);
      const userId = searchParams.get('userId') || user.id;
      
      console.log('ID пользователя для запроса тем:', userId);
      
      // Получение тем из базы данных
      const topics = await flashcardTopicRepository.getTopicsByUserId(parseInt(userId as string));
      
      console.log('Найдено тем:', topics.length);
      
      // Преобразуем ID в строки для клиентского кода
      const formattedTopics = topics.map(formatTopic);
      
      // Создаем ответ с правильной кодировкой
      const response = NextResponse.json(formattedTopics);
      response.headers.set('Content-Type', 'application/json; charset=utf-8');
      
      return response;
    } catch (error) {
      console.error('Ошибка при получении тем:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
}

// Создание новой темы
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      // Получаем тело запроса в сыром виде
      const rawBody = await req.text();
      console.log('Raw request body:', rawBody);

      // Преобразуем тело запроса в JSON
      const body = JSON.parse(rawBody);
      console.log('POST /api/flashcard-topics - тело запроса:', body);
      
      const { 
        title, 
        description = '', 
        categoryId,
        color,
        userId
      } = body;
      
      // Проверка обязательных полей
      if (!title) {
        return NextResponse.json(
          { error: 'Необходимо указать название темы' },
          { status: 400 }
        );
      }
      
      const userIdForTopic = parseInt(userId || user.id);
      console.log('ID пользователя для темы:', userIdForTopic);
      
      // Преобразуем categoryId в number или null
      let categoryIdNumber = null;
      if (categoryId && categoryId.trim() !== '') {
        categoryIdNumber = parseInt(categoryId);
      }
      
      // Создание темы
      const topic = await flashcardTopicRepository.createTopic(
        title,
        userIdForTopic,
        categoryIdNumber,
        description,
        color
      );
      
      console.log('Создана тема:', topic);
      
      // Преобразуем ID в строку для клиентского кода
      const formattedTopic = formatTopic(topic);
      
      // Создаем ответ с правильной кодировкой
      const response = NextResponse.json(formattedTopic);
      response.headers.set('Content-Type', 'application/json; charset=utf-8');
      
      return response;
    } catch (error) {
      console.error('Ошибка при создании темы:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
} 