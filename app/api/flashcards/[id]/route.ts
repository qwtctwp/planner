import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../lib/auth';
import { flashcardRepository } from '../../../lib/db';

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

// Получение карточки по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      const cardId = parseInt(params.id);
      
      const card = await flashcardRepository.getCardById(cardId);
      
      if (!card) {
        return NextResponse.json(
          { error: 'Карточка не найдена' },
          { status: 404 }
        );
      }
      
      // Форматируем карточку для клиентского кода
      const formattedCard = formatFlashcard(card);
      
      return NextResponse.json(formattedCard);
    } catch (error) {
      console.error('Ошибка при получении карточки:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
}

// Обновление карточки
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      const cardId = parseInt(params.id);
      const body = await req.json();
      const { front, back, favorite } = body;
      
      // Проверяем, существует ли карточка
      const existingCard = await flashcardRepository.getCardById(cardId);
      
      if (!existingCard) {
        return NextResponse.json(
          { error: 'Карточка не найдена' },
          { status: 404 }
        );
      }
      
      // Если в теле запроса только favorite, выполняем только обновление статуса избранного
      if (favorite !== undefined && !front && !back) {
        const updatedCard = await flashcardRepository.toggleFavorite(cardId, favorite);
        return NextResponse.json(formatFlashcard(updatedCard));
      }
      
      // Для полного обновления требуется front и back
      if (!front || !back) {
        return NextResponse.json(
          { error: 'Необходимо указать содержимое карточки (front и back)' },
          { status: 400 }
        );
      }
      
      // Обновляем карточку
      const updatedCard = await flashcardRepository.updateCard(
        cardId,
        front,
        back,
        favorite === undefined ? existingCard.favorite : favorite
      );
      
      // Форматируем карточку для клиентского кода
      const formattedCard = formatFlashcard(updatedCard);
      
      return NextResponse.json(formattedCard);
    } catch (error) {
      console.error('Ошибка при обновлении карточки:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
}

// Удаление карточки
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      const cardId = parseInt(params.id);
      
      // Проверяем, существует ли карточка
      const existingCard = await flashcardRepository.getCardById(cardId);
      
      if (!existingCard) {
        return NextResponse.json(
          { error: 'Карточка не найдена' },
          { status: 404 }
        );
      }
      
      // Удаляем карточку
      await flashcardRepository.deleteCard(cardId);
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Ошибка при удалении карточки:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
} 