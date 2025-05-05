import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../lib/auth';
import { flashcardTopicRepository } from '../../lib/db';

// Преобразование числовых ID в строки для клиентского кода
const formatTopic = (topic: any) => {
  if (!topic) return null;
  return {
    ...topic,
    id: topic.id.toString(),
    categoryId: topic.category_id ? topic.category_id.toString() : '',
    cardsCount: topic.cards_count || 0,
    createdAt: topic.created_at ? topic.created_at.toISOString() : new Date().toISOString(),
    color: topic.color || '#84A7C4' // Дефолтный цвет
  };
};

// Получение всех тем для пользователя
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      const url = new URL(req.url);
      const userId = url.searchParams.get('userId');
      
      if (!userId) {
        return NextResponse.json(
          { error: 'Не указан ID пользователя' },
          { status: 400 }
        );
      }
      
      const topics = await flashcardTopicRepository.getTopicsByUserId(parseInt(userId));
      
      // Форматируем темы для клиентского кода
      const formattedTopics = topics.map(formatTopic);
      
      return NextResponse.json(formattedTopics);
    } catch (error) {
      console.error('Ошибка при получении тем флеш-карточек:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
}

// Добавление новой темы
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      const body = await req.json();
      const { title, description, categoryId, color, userId } = body;
      
      // Валидация входных данных
      if (!title) {
        return NextResponse.json(
          { error: 'Необходимо указать название темы' },
          { status: 400 }
        );
      }
      
      if (!userId) {
        return NextResponse.json(
          { error: 'Не указан ID пользователя' },
          { status: 400 }
        );
      }
      
      // Создаем новую тему
      const topic = await flashcardTopicRepository.createTopic(
        title,
        parseInt(userId),
        categoryId ? parseInt(categoryId) : null,
        description || null,
        color || null
      );
      
      // Форматируем тему для клиентского кода
      const formattedTopic = formatTopic(topic);
      
      return NextResponse.json(formattedTopic);
    } catch (error) {
      console.error('Ошибка при создании темы флеш-карточек:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
} 