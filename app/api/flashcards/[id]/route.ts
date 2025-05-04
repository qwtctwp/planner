import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../lib/auth';
import { flashcardRepository } from '../../../lib/db';

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

// Обновление карточки
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      console.log('PUT /api/flashcards/[id] - id:', params.id);
      
      const cardId = parseInt(params.id);
      
      // Получаем тело запроса в сыром виде
      const rawBody = await req.text();
      console.log('Raw request body:', rawBody);

      // Преобразуем тело запроса в JSON
      const body = JSON.parse(rawBody);
      console.log('Тело запроса:', body);
      
      // Получаем параметры из тела запроса
      const { front, back, favorite } = body;
      
      // Получаем существующую карточку для проверки
      const existingCard = await flashcardRepository.getCardById(cardId);
      if (!existingCard) {
        return NextResponse.json(
          { error: 'Карточка не найдена' },
          { status: 404 }
        );
      }
      
      // Проверяем, что пользователь имеет право на обновление карточки
      if (existingCard.user_id.toString() !== user.id.toString()) {
        return NextResponse.json(
          { error: 'У вас нет прав на обновление этой карточки' },
          { status: 403 }
        );
      }
      
      // Подготавливаем данные для обновления
      const frontToUse = front !== undefined ? front : existingCard.front;
      const backToUse = back !== undefined ? back : existingCard.back;
      const favoriteToUse = favorite !== undefined ? !!favorite : !!existingCard.favorite;
      
      // Ensure there's content
      if (!frontToUse || !backToUse) {
        return NextResponse.json(
          { error: 'Необходимо указать вопрос и ответ карточки' },
          { status: 400 }
        );
      }
      
      // Обновление карточки
      const card = await flashcardRepository.updateCard(
        cardId,
        frontToUse,
        backToUse,
        favoriteToUse
      );
      
      if (!card) {
        return NextResponse.json(
          { error: 'Карточка не найдена' },
          { status: 404 }
        );
      }
      
      console.log('Обновлена карточка:', card);
      
      // Преобразуем ID в строку для клиентского кода
      const formattedCard = formatCard(card);
      
      // Создаем ответ с правильной кодировкой
      const response = NextResponse.json(formattedCard);
      response.headers.set('Content-Type', 'application/json; charset=utf-8');
      
      return response;
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
      console.log('DELETE /api/flashcards/[id] - id:', params.id);
      
      const cardId = parseInt(params.id);
      
      // Получаем существующую карточку для проверки
      const existingCard = await flashcardRepository.getCardById(cardId);
      if (!existingCard) {
        return NextResponse.json(
          { error: 'Карточка не найдена' },
          { status: 404 }
        );
      }
      
      // Проверяем, что пользователь имеет право на удаление карточки
      if (existingCard.user_id.toString() !== user.id.toString()) {
        return NextResponse.json(
          { error: 'У вас нет прав на удаление этой карточки' },
          { status: 403 }
        );
      }
      
      // Удаление карточки
      await flashcardRepository.deleteCard(cardId);
      
      console.log('Карточка удалена успешно');
      
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