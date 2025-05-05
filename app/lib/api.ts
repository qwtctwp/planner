'use client';

// Типы для API
import { Category, Assignment, Lesson, TodoItem, FlashcardTopic, Flashcard } from '../types';

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
// Эти функции были заменены на функции для работы с событиями
// Для обратной совместимости добавляем их в конце файла

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

// API для работы с темами флеш-карточек
export const getFlashcardTopicsForUser = async (userId: number) => {
  try {
    const response = await fetch(`/api/flashcard-topics?userId=${userId}`);
    if (!response.ok) throw new Error('Ошибка при получении тем флеш-карточек');
    return await response.json();
  } catch (error) {
    console.error('Ошибка при получении тем флеш-карточек:', error);
    return [];
  }
};

export const getFlashcardTopicById = async (topicId: string) => {
  try {
    const response = await fetch(`/api/flashcard-topics/${topicId}`);
    if (!response.ok) throw new Error('Ошибка при получении темы флеш-карточек');
    return await response.json();
  } catch (error) {
    console.error('Ошибка при получении темы флеш-карточек:', error);
    return null;
  }
};

export const addFlashcardTopic = async (userId: number, topic: Omit<FlashcardTopic, 'id' | 'cardsCount' | 'createdAt'>) => {
  try {
    const response = await fetch('/api/flashcard-topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...topic, userId })
    });
    if (!response.ok) throw new Error('Ошибка при добавлении темы флеш-карточек');
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Ошибка при добавлении темы флеш-карточек:', error);
    throw error;
  }
};

export const updateFlashcardTopic = async (topicId: string, topic: Partial<FlashcardTopic>) => {
  try {
    const response = await fetch(`/api/flashcard-topics/${topicId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topic)
    });
    if (!response.ok) throw new Error('Ошибка при обновлении темы флеш-карточек');
    return await response.json();
  } catch (error) {
    console.error('Ошибка при обновлении темы флеш-карточек:', error);
    throw error;
  }
};

export const deleteFlashcardTopic = async (topicId: string) => {
  try {
    const response = await fetch(`/api/flashcard-topics/${topicId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Ошибка при удалении темы флеш-карточек');
    return true;
  } catch (error) {
    console.error('Ошибка при удалении темы флеш-карточек:', error);
    throw error;
  }
};

// API для работы с флеш-карточками
export const getFlashcardsForUser = async (userId: number) => {
  try {
    const response = await fetch(`/api/flashcards?userId=${userId}`);
    if (!response.ok) throw new Error('Ошибка при получении флеш-карточек');
    return await response.json();
  } catch (error) {
    console.error('Ошибка при получении флеш-карточек:', error);
    return [];
  }
};

export const getFlashcardsForTopic = async (topicId: string) => {
  try {
    const response = await fetch(`/api/flashcards?topicId=${topicId}`);
    if (!response.ok) throw new Error('Ошибка при получении флеш-карточек для темы');
    return await response.json();
  } catch (error) {
    console.error('Ошибка при получении флеш-карточек для темы:', error);
    return [];
  }
};

export const addFlashcard = async (userId: number, card: Omit<Flashcard, 'id' | 'createdAt'>) => {
  try {
    const response = await fetch('/api/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...card, userId })
    });
    if (!response.ok) throw new Error('Ошибка при добавлении флеш-карточки');
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Ошибка при добавлении флеш-карточки:', error);
    throw error;
  }
};

export const updateFlashcard = async (cardId: string, card: Partial<Flashcard>) => {
  try {
    const response = await fetch(`/api/flashcards/${cardId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card)
    });
    if (!response.ok) throw new Error('Ошибка при обновлении флеш-карточки');
    return await response.json();
  } catch (error) {
    console.error('Ошибка при обновлении флеш-карточки:', error);
    throw error;
  }
};

export const toggleFlashcardFavorite = async (cardId: string, favorite: boolean) => {
  try {
    const response = await fetch(`/api/flashcards/${cardId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorite })
    });
    if (!response.ok) throw new Error('Ошибка при обновлении статуса избранного');
    return await response.json();
  } catch (error) {
    console.error('Ошибка при обновлении статуса избранного:', error);
    throw error;
  }
};

export const deleteFlashcard = async (cardId: string) => {
  try {
    const response = await fetch(`/api/flashcards/${cardId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Ошибка при удалении флеш-карточки');
    return true;
  } catch (error) {
    console.error('Ошибка при удалении флеш-карточки:', error);
    throw error;
  }
};

// API для работы с событиями
export const getEventsForUser = async (userId: number) => {
  try {
    console.log(`Запрос событий для пользователя ${userId}`);
    const response = await fetch(`/api/events?userId=${userId}`);
    
    if (!response.ok) {
      console.error('Ошибка получения событий, статус:', response.status);
      throw new Error('Ошибка при получении событий');
    }
    
    const data = await response.json();
    console.log(`Получено ${data.length} событий, первое событие:`, data.length > 0 ? data[0] : 'нет данных');
    
    // Преобразуем строки в объекты Date для удобства работы в клиентском коде
    const formattedEvents = data.map(event => ({
      ...event,
      start: event.start, // Оставляем как есть, преобразование будет в компоненте календаря
      end: event.end
    }));
    
    return formattedEvents;
  } catch (error) {
    console.error('Ошибка при получении событий:', error);
    return [];
  }
};

export const addEvent = async (userId: number, event: Omit<Lesson, 'id'>) => {
  try {
    console.log('Добавление события:', {userId, event});
    
    // Убедимся, что даты в формате ISO строк
    const eventData = {
      ...event,
      start: typeof event.start === 'object' ? event.start.toISOString() : event.start,
      end: typeof event.end === 'object' ? event.end.toISOString() : event.end,
      userId
    };
    
    console.log('Подготовленные данные события:', eventData);
    
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка добавления события, статус:', response.status, errorText);
      throw new Error('Ошибка при добавлении события');
    }
    
    const data = await response.json();
    console.log('Ответ сервера при создании события:', data);
    return data.id;
  } catch (error) {
    console.error('Ошибка при добавлении события:', error);
    throw error;
  }
};

export const updateEvent = async (eventId: string, event: Partial<Lesson>) => {
  try {
    console.log('Отправка запроса на обновление события:', eventId, event);
    
    // Подготовим данные, убедившись что даты в правильном формате
    const payload = {
      ...event,
      start: event.start instanceof Date ? event.start.toISOString() : event.start,
      end: event.end instanceof Date ? event.end.toISOString() : event.end
    };
    
    console.log('Подготовленные данные для обновления:', payload);
    
    const response = await fetch(`/api/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка при обновлении события, статус:', response.status, errorText);
      throw new Error('Ошибка при обновлении события');
    }
    
    const data = await response.json();
    console.log('Ответ сервера при обновлении события:', data);
    return data;
  } catch (error) {
    console.error('Ошибка при обновлении события:', error);
    throw error;
  }
};

export const deleteEvent = async (eventId: string) => {
  try {
    const response = await fetch(`/api/events/${eventId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Ошибка при удалении события');
    return true;
  } catch (error) {
    console.error('Ошибка при удалении события:', error);
    throw error;
  }
};

// Для обратной совместимости
export const getLessonsForUser = getEventsForUser;
export const addLesson = addEvent;
export const updateLesson = updateEvent;
export const deleteLesson = deleteEvent; 