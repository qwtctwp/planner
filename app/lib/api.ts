'use client';

// Типы для API
import { Category, Assignment, Lesson, TodoItem } from '../types';

// API для работы с категориями
export const getCategoriesForUser = async (userId: number) => {
  try {
    console.log('getCategoriesForUser - userId:', userId);
    const response = await fetch(`/api/categories?userId=${userId}`);
    
    if (!response.ok) {
      console.error('Ошибка ответа API:', response.status, response.statusText);
      throw new Error('Ошибка при получении категорий');
    }
    
    const data = await response.json();
    console.log('getCategoriesForUser - ответ API:', data);
    return data;
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    return [];
  }
};

export const addCategory = async (userId: number, category: Omit<Category, 'id'>) => {
  try {
    console.log('addCategory - userId:', userId, 'category:', category);
    
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...category, userId })
    });
    
    if (!response.ok) {
      console.error('Ошибка ответа API:', response.status, response.statusText);
      const errorData = await response.json();
      console.error('Подробности ошибки:', errorData);
      throw new Error('Ошибка при добавлении категории');
    }
    
    const data = await response.json();
    console.log('addCategory - ответ API:', data);
    return data.id;
  } catch (error) {
    console.error('Ошибка при добавлении категории:', error);
    throw error;
  }
};

export const updateCategory = async (categoryId: string, category: Partial<Category>) => {
  try {
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category)
    });
    if (!response.ok) throw new Error('Ошибка при обновлении категории');
    return await response.json();
  } catch (error) {
    console.error('Ошибка при обновлении категории:', error);
    throw error;
  }
};

export const deleteCategory = async (categoryId: string) => {
  try {
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Ошибка при удалении категории');
    return true;
  } catch (error) {
    console.error('Ошибка при удалении категории:', error);
    throw error;
  }
};

// API для работы с уроками
export const getLessonsForUser = async (userId: number) => {
  try {
    console.log(`Запрос уроков для пользователя ${userId}`);
    const response = await fetch(`/api/lessons?userId=${userId}`);
    
    if (!response.ok) {
      console.error('Ошибка получения уроков, статус:', response.status);
      throw new Error('Ошибка при получении уроков');
    }
    
    const data = await response.json();
    console.log(`Получено ${data.length} уроков, первый урок:`, data.length > 0 ? data[0] : 'нет данных');
    
    // Преобразуем строки в объекты Date для удобства работы в клиентском коде
    const formattedLessons = data.map(lesson => ({
      ...lesson,
      start: lesson.start, // Оставляем как есть, преобразование будет в компоненте календаря
      end: lesson.end
    }));
    
    return formattedLessons;
  } catch (error) {
    console.error('Ошибка при получении уроков:', error);
    return [];
  }
};

export const addLesson = async (userId: number, lesson: Omit<Lesson, 'id'>) => {
  try {
    console.log('Добавление урока:', {userId, lesson});
    
    // Убедимся, что даты в формате ISO строк
    const lessonData = {
      ...lesson,
      start: typeof lesson.start === 'object' ? lesson.start.toISOString() : lesson.start,
      end: typeof lesson.end === 'object' ? lesson.end.toISOString() : lesson.end,
      userId
    };
    
    console.log('Подготовленные данные урока:', lessonData);
    
    const response = await fetch('/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lessonData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка добавления урока, статус:', response.status, errorText);
      throw new Error('Ошибка при добавлении урока');
    }
    
    const data = await response.json();
    console.log('Ответ сервера при создании урока:', data);
    return data.id;
  } catch (error) {
    console.error('Ошибка при добавлении урока:', error);
    throw error;
  }
};

export const updateLesson = async (lessonId: string, lesson: Partial<Lesson>) => {
  try {
    const response = await fetch(`/api/lessons/${lessonId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lesson)
    });
    if (!response.ok) throw new Error('Ошибка при обновлении урока');
    return await response.json();
  } catch (error) {
    console.error('Ошибка при обновлении урока:', error);
    throw error;
  }
};

export const deleteLesson = async (lessonId: string) => {
  try {
    const response = await fetch(`/api/lessons/${lessonId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Ошибка при удалении урока');
    return true;
  } catch (error) {
    console.error('Ошибка при удалении урока:', error);
    throw error;
  }
};

// API для работы с заданиями
export const getAssignmentsForUser = async (userId: number) => {
  try {
    const response = await fetch(`/api/assignments?userId=${userId}`);
    if (!response.ok) throw new Error('Ошибка при получении заданий');
    return await response.json();
  } catch (error) {
    console.error('Ошибка при получении заданий:', error);
    return [];
  }
};

export const addAssignment = async (userId: number, assignment: Omit<Assignment, 'id'>) => {
  try {
    console.log('addAssignment - userId:', userId, 'assignment:', assignment);
    
    const response = await fetch('/api/assignments', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({ ...assignment, userId })
    });
    
    if (!response.ok) {
      console.error('Ошибка ответа API:', response.status, response.statusText);
      const errorData = await response.json();
      console.error('Подробности ошибки:', errorData);
      throw new Error('Ошибка при добавлении задания');
    }
    
    const data = await response.json();
    console.log('addAssignment - ответ API:', data);
    return data.id;
  } catch (error) {
    console.error('Ошибка при добавлении задания:', error);
    throw error;
  }
};

export const updateAssignment = async (assignmentId: string, assignment: Partial<Assignment>) => {
  try {
    console.log('updateAssignment - assignmentId:', assignmentId, 'assignment:', assignment);
    
    // Создаем полную копию объекта assignment для отправки
    const payload = { ...assignment };
    
    console.log('Sending payload:', payload);
    
    const response = await fetch(`/api/assignments/${assignmentId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      console.error('Ошибка ответа API:', response.status, response.statusText);
      const errorData = await response.json();
      console.error('Подробности ошибки:', errorData);
      throw new Error('Ошибка при обновлении задания');
    }
    
    const data = await response.json();
    console.log('updateAssignment - ответ API:', data);
    return data;
  } catch (error) {
    console.error('Ошибка при обновлении задания:', error);
    throw error;
  }
};

export const deleteAssignment = async (assignmentId: string) => {
  try {
    const response = await fetch(`/api/assignments/${assignmentId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Ошибка при удалении задания');
    return true;
  } catch (error) {
    console.error('Ошибка при удалении задания:', error);
    throw error;
  }
};

// API для работы с задачами (todos)
export const getTodosForUser = async (userId: number) => {
  try {
    const response = await fetch(`/api/todos?userId=${userId}`);
    if (!response.ok) throw new Error('Ошибка при получении задач');
    return await response.json();
  } catch (error) {
    console.error('Ошибка при получении задач:', error);
    return [];
  }
};

export const addTodo = async (userId: number, todo: Omit<TodoItem, 'id'>) => {
  try {
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...todo, userId })
    });
    if (!response.ok) throw new Error('Ошибка при добавлении задачи');
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Ошибка при добавлении задачи:', error);
    throw error;
  }
};

export const updateTodo = async (todoId: string, todo: Partial<TodoItem>) => {
  try {
    const response = await fetch(`/api/todos/${todoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todo)
    });
    if (!response.ok) throw new Error('Ошибка при обновлении задачи');
    return await response.json();
  } catch (error) {
    console.error('Ошибка при обновлении задачи:', error);
    throw error;
  }
};

export const deleteTodo = async (todoId: string) => {
  try {
    const response = await fetch(`/api/todos/${todoId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Ошибка при удалении задачи');
    return true;
  } catch (error) {
    console.error('Ошибка при удалении задачи:', error);
    throw error;
  }
}; 