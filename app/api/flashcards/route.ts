import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../lib/auth';
import { flashcardRepository } from '../../lib/db';

// Преобразование числовых ID в строки для клиентского кода
const formatFlashcard = (card: any) => {
  if (!card) return null;
  return {
    ...card,
    id: card.id.toString(),
    topicId: card.topic_id ? card.topic_id.toString() : '',
    categoryId: card.category_id ? card.category_id.toString() : '',
    favorite: !!card.favorite,
    createdAt: card.created_at ? card.created_at.toISOString() : new Date().toISOString()
  };
};

// Получение карточек по пользователю или теме
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      const url = new URL(req.url);
      const userId = url.searchParams.get('userId');
      const topicId = url.searchParams.get('topicId');
      
      let cards;
      
      if (topicId) {
        // Получение карточек по теме
        cards = await flashcardRepository.getCardsByTopicId(parseInt(topicId));
      } else if (userId) {
        // Получение карточек по пользователю
        cards = await flashcardRepository.getCardsByUserId(parseInt(userId));
      } else {
        return NextResponse.json(
          { error: 'Необходимо указать userId или topicId' },
          { status: 400 }
        );
      }
      
      // Форматируем карточки для клиентского кода
      const formattedCards = cards.map(formatFlashcard);
      
      return NextResponse.json(formattedCards);
    } catch (error) {
      console.error('Ошибка при получении флеш-карточек:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
}

// Добавление новой карточки
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      const body = await req.json();
      const { front, back, topicId, categoryId, favorite, userId } = body;
      
      // Валидация входных данных
      if (!front || !back) {
        return NextResponse.json(
          { error: 'Необходимо указать содержимое карточки (front и back)' },
          { status: 400 }
        );
      }
      
      if (!topicId) {
        return NextResponse.json(
          { error: 'Необходимо указать тему карточки (topicId)' },
          { status: 400 }
        );
      }
      
      if (!userId) {
        return NextResponse.json(
          { error: 'Не указан ID пользователя' },
          { status: 400 }
        );
      }
      
      // Создаем новую карточку
      const card = await flashcardRepository.createCard(
        front,
        back,
        parseInt(topicId),
        parseInt(userId),
        categoryId ? parseInt(categoryId) : null,
        favorite === true
      );
      
      // Форматируем карточку для клиентского кода
      const formattedCard = formatFlashcard(card);
      
      return NextResponse.json(formattedCard);
    } catch (error) {
      console.error('Ошибка при создании флеш-карточки:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
} 