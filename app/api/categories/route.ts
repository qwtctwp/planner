import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../lib/auth';
import { categoryRepository } from '../../lib/db';

// Преобразование числовых ID в строки для клиентского кода
const formatCategory = (category: any) => {
  if (!category) return null;
  return {
    ...category,
    id: category.id.toString()
  };
};

// Получение всех категорий пользователя
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      // Получение userId из query параметров или из токена
      const url = new URL(req.url);
      const userId = url.searchParams.get('userId') || user.id;
      
      console.log('GET /api/categories - userId:', userId);
      
      // Получение категорий из базы данных
      const categories = await categoryRepository.getCategoriesByUserId(parseInt(userId as string));
      
      console.log('Найдено категорий:', categories.length);
      
      // Преобразуем все ID в строки для клиентского кода
      const formattedCategories = categories.map(formatCategory);
      
      return NextResponse.json(formattedCategories);
    } catch (error) {
      console.error('Ошибка при получении категорий:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
}

// Создание новой категории
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: NextRequest, user: any) => {
    try {
      const body = await req.json();
      console.log('POST /api/categories - тело запроса:', body);
      
      const { name, color, userId } = body;
      
      // Проверка обязательных полей
      if (!name || !color) {
        console.log('Отсутствуют обязательные поля:', { name, color });
        return NextResponse.json(
          { error: 'Необходимо указать название и цвет категории' },
          { status: 400 }
        );
      }
      
      // Получаем ID пользователя
      const actualUserId = parseInt(userId || user.id);
      console.log('ID пользователя для категории:', actualUserId);
      
      // Создание категории
      const category = await categoryRepository.createCategory(
        name,
        color,
        actualUserId
      );
      
      console.log('Создана категория:', category);
      
      // Преобразуем ID в строку для клиентского кода
      const formattedCategory = formatCategory(category);
      
      return NextResponse.json(formattedCategory);
    } catch (error) {
      console.error('Ошибка при создании категории:', error);
      return NextResponse.json(
        { error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
} 