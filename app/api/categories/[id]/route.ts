import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../lib/auth';
import { categoryRepository } from '../../../lib/db';

// Преобразование числовых ID в строки для клиентского кода
const formatCategory = (category: any) => {
  if (!category) return null;
  return {
    ...category,
    id: category.id.toString()
  };
};

// Обновление категории
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      console.log('PUT /api/categories/[id] - id:', params.id);
      
      const categoryId = parseInt(params.id);
      const body = await req.json();
      console.log('Тело запроса:', body);
      
      const { name, color } = body;
      
      // Проверка обязательных полей
      if (!name || !color) {
        return NextResponse.json(
          { error: 'Необходимо указать название и цвет категории' },
          { status: 400 }
        );
      }
      
      // Обновление категории
      const category = await categoryRepository.updateCategory(categoryId, name, color);
      
      if (!category) {
        return NextResponse.json(
          { error: 'Категория не найдена' },
          { status: 404 }
        );
      }
      
      console.log('Обновлена категория:', category);
      
      // Преобразуем ID в строку для клиентского кода
      const formattedCategory = formatCategory(category);
      
      return NextResponse.json(formattedCategory);
    } catch (error) {
      console.error('Ошибка при обновлении категории:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
}

// Удаление категории
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      console.log('DELETE /api/categories/[id] - id:', params.id);
      
      const categoryId = parseInt(params.id);
      
      // Удаление категории
      await categoryRepository.deleteCategory(categoryId);
      
      console.log('Категория удалена успешно');
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Ошибка при удалении категории:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
} 