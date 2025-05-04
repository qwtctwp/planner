import { NextResponse, NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  // Страницы, которые не требуют аутентификации
  const publicPaths = ['/login', '/register'];

  // Проверяем, является ли текущий путь публичным
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Если пользователь не авторизован и пытается получить доступ к защищенной странице
  if (!token && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Если пользователь авторизован и пытается получить доступ к публичной странице
  if (token && isPublicPath) {
    try {
      // Проверка валидности токена
      verify(token, process.env.JWT_SECRET || 'default_secret');
      
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    } catch (error) {
      // Если токен невалидный, удаляем его
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

// Пути, к которым применяется middleware
export const config = {
  matcher: ['/', '/dashboard/:path*', '/calendar', '/login', '/register'],
}; 