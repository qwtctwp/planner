import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../lib/auth';
import { flashcardTopicRepository } from '../../../lib/db';

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

// Обновление темы
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      console.log('PUT /api/flashcard-topics/[id] - id:', params.id);
      
      const topicId = parseInt(params.id);
      
      // Получаем тело запроса в сыром виде
      const rawBody = await req.text();
      console.log('Raw request body:', rawBody);

      // Преобразуем тело запроса в JSON
      const body = JSON.parse(rawBody);
      console.log('Тело запроса:', body);
      
      // Получаем параметры из тела запроса
      const { title, description, categoryId, color } = body;
      
      // Получаем существующую тему для проверки
      const existingTopic = await flashcardTopicRepository.getTopicById(topicId);
      if (!existingTopic) {
        return NextResponse.json(
          { error: 'Тема не найдена' },
          { status: 404 }
        );
      }
      
      // Проверяем, что пользователь имеет право на обновление темы
      if (existingTopic.user_id.toString() !== user.id.toString()) {
        return NextResponse.json(
          { error: 'У вас нет прав на обновление этой темы' },
          { status: 403 }
        );
      }
      
      // Подготавливаем данные для обновления
      const titleToUse = title || existingTopic.title;
      const descriptionToUse = description !== undefined ? description : existingTopic.description;
      
      // Преобразуем categoryId в number или null
      let categoryIdNumber = existingTopic.category_id;
      if (categoryId !== undefined) {
        categoryIdNumber = categoryId && categoryId.trim() !== '' ? parseInt(categoryId) : null;
      }
      
      const colorToUse = color !== undefined ? color : existingTopic.color;
      
      // Ensure there's a title
      if (!titleToUse) {
        return NextResponse.json(
          { error: 'Необходимо указать название темы' },
          { status: 400 }
        );
      }
      
      // Обновление темы
      const topic = await flashcardTopicRepository.updateTopic(
        topicId,
        titleToUse,
        categoryIdNumber,
        descriptionToUse,
        colorToUse
      );
      
      if (!topic) {
        return NextResponse.json(
          { error: 'Тема не найдена' },
          { status: 404 }
        );
      }
      
      console.log('Обновлена тема:', topic);
      
      // Преобразуем ID в строку для клиентского кода
      const formattedTopic = formatTopic(topic);
      
      // Создаем ответ с правильной кодировкой
      const response = NextResponse.json(formattedTopic);
      response.headers.set('Content-Type', 'application/json; charset=utf-8');
      
      return response;
    } catch (error) {
      console.error('Ошибка при обновлении темы:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
}

// Удаление темы
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      console.log('DELETE /api/flashcard-topics/[id] - id:', params.id);
      
      const topicId = parseInt(params.id);
      
      // Получаем существующую тему для проверки
      const existingTopic = await flashcardTopicRepository.getTopicById(topicId);
      if (!existingTopic) {
        return NextResponse.json(
          { error: 'Тема не найдена' },
          { status: 404 }
        );
      }
      
      // Проверяем, что пользователь имеет право на удаление темы
      if (existingTopic.user_id.toString() !== user.id.toString()) {
        return NextResponse.json(
          { error: 'У вас нет прав на удаление этой темы' },
          { status: 403 }
        );
      }
      
      // Удаление темы (каскадно удалит все карточки этой темы)
      await flashcardTopicRepository.deleteTopic(topicId);
      
      console.log('Тема удалена успешно');
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Ошибка при удалении темы:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
} 