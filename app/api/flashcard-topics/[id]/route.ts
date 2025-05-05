import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../lib/auth';
import { flashcardTopicRepository } from '../../../lib/db';

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

// Получение темы по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      const topicId = parseInt(params.id);
      
      const topic = await flashcardTopicRepository.getTopicById(topicId);
      
      if (!topic) {
        return NextResponse.json(
          { error: 'Тема не найдена' },
          { status: 404 }
        );
      }
      
      // Форматируем тему для клиентского кода
      const formattedTopic = formatTopic(topic);
      
      return NextResponse.json(formattedTopic);
    } catch (error) {
      console.error('Ошибка при получении темы:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
}

// Обновление темы
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      const topicId = parseInt(params.id);
      const body = await req.json();
      const { title, description, categoryId, color } = body;
      
      // Проверяем, существует ли тема
      const existingTopic = await flashcardTopicRepository.getTopicById(topicId);
      
      if (!existingTopic) {
        return NextResponse.json(
          { error: 'Тема не найдена' },
          { status: 404 }
        );
      }
      
      // Валидация названия
      if (!title) {
        return NextResponse.json(
          { error: 'Необходимо указать название темы' },
          { status: 400 }
        );
      }
      
      // Обновляем тему
      const updatedTopic = await flashcardTopicRepository.updateTopic(
        topicId,
        title,
        categoryId ? parseInt(categoryId) : null,
        description,
        color
      );
      
      // Форматируем тему для клиентского кода
      const formattedTopic = formatTopic(updatedTopic);
      
      return NextResponse.json(formattedTopic);
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
      const topicId = parseInt(params.id);
      
      // Проверяем, существует ли тема
      const existingTopic = await flashcardTopicRepository.getTopicById(topicId);
      
      if (!existingTopic) {
        return NextResponse.json(
          { error: 'Тема не найдена' },
          { status: 404 }
        );
      }
      
      // Удаляем тему
      await flashcardTopicRepository.deleteTopic(topicId);
      
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