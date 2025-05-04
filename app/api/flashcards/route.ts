import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../lib/auth';
import { flashcardRepository } from '../../lib/db';

// Преобразование числовых ID в строки для клиентского кода
const formatCard = (card: any) => {
  if (!card) return null;
  return {
    ...card,
    id: card.id.toString(),
    topicId: card.topic_id ? card.topic_id.toString() : '',
    categoryId: card.category_id ? card.category_id.toString() : '',
    createdAt: card.created_at ? card.created_at.toISOString() : new Date().toISOString(),
    favorite: !!card.favorite
  };
};

// Получение карточек (по пользователю или по теме)
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      console.log('GET /api/flashcards');
      
      // Получаем параметры из запроса
      const { searchParams } = new URL(req.url);
      const userId = searchParams.get('userId') || user.id;
      const topicId = searchParams.get('topicId');
      
      console.log('Параметры запроса:', { userId, topicId });
      
      let cards;
      
      // Получение карточек по теме или по пользователю
      if (topicId) {
        cards = await flashcardRepository.getCardsByTopicId(parseInt(topicId));
        console.log(`Найдено ${cards.length} карточек для темы ${topicId}`);
      } else {
        cards = await flashcardRepository.getCardsByUserId(parseInt(userId as string));
        console.log(`Найдено ${cards.length} карточек для пользователя ${userId}`);
      }
      
      // Преобразуем ID в строки для клиентского кода
      const formattedCards = cards.map(formatCard);
      
      // Создаем ответ с правильной кодировкой
      const response = NextResponse.json(formattedCards);
      response.headers.set('Content-Type', 'application/json; charset=utf-8');
      
      return response;
    } catch (error) {
      console.error('Ошибка при получении карточек:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
}

// Создание новой карточки
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      // Получаем тело запроса в сыром виде
      const rawBody = await req.text();
      console.log('Raw request body:', rawBody);

      // Преобразуем тело запроса в JSON
      const body = JSON.parse(rawBody);
      console.log('POST /api/flashcards - тело запроса:', body);
      
      const { 
        front, 
        back, 
        topicId,
        categoryId,
        favorite = false,
        userId
      } = body;
      
      // Проверка обязательных полей
      if (!front || !back || !topicId) {
        return NextResponse.json(
          { error: 'Необходимо указать вопрос, ответ и тему карточки' },
          { status: 400 }
        );
      }
      
      const userIdForCard = parseInt(userId || user.id);
      console.log('ID пользователя для карточки:', userIdForCard);
      
      // Преобразуем topicId и categoryId в number
      const topicIdNumber = parseInt(topicId);
      
      // Преобразуем categoryId в number или null
      let categoryIdNumber = null;
      if (categoryId && categoryId.trim() !== '') {
        categoryIdNumber = parseInt(categoryId);
      }
      
      // Создание карточки
      const card = await flashcardRepository.createCard(
        front,
        back,
        topicIdNumber,
        userIdForCard,
        categoryIdNumber,
        !!favorite
      );
      
      console.log('Создана карточка:', card);
      
      // Преобразуем ID в строку для клиентского кода
      const formattedCard = formatCard(card);
      
      // Создаем ответ с правильной кодировкой
      const response = NextResponse.json(formattedCard);
      response.headers.set('Content-Type', 'application/json; charset=utf-8');
      
      return response;
    } catch (error) {
      console.error('Ошибка при создании карточки:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
} 