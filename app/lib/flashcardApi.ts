'use client';

import { FlashcardTopic, Flashcard } from '../types';

// API для работы с темами для флеш-карточек
export const getTopicsForUser = async (userId: number) => {
  try {
    console.log('getTopicsForUser - userId:', userId);
    const response = await fetch(`/api/flashcard-topics?userId=${userId}`);
    
    if (!response.ok) {
      console.error('Ошибка ответа API:', response.status, response.statusText);
      throw new Error('Ошибка при получении тем для флеш-карточек');
    }
    
    const data = await response.json();
    console.log('getTopicsForUser - ответ API:', data);
    return data;
  } catch (error) {
    console.error('Ошибка при получении тем для флеш-карточек:', error);
    return [];
  }
};

export const addTopic = async (userId: number, topic: Omit<FlashcardTopic, 'id' | 'cardsCount' | 'createdAt'>) => {
  try {
    console.log('addTopic - userId:', userId, 'topic:', topic);
    
    const response = await fetch('/api/flashcard-topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...topic, userId })
    });
    
    if (!response.ok) {
      console.error('Ошибка ответа API:', response.status, response.statusText);
      const errorData = await response.json();
      console.error('Подробности ошибки:', errorData);
      throw new Error('Ошибка при добавлении темы');
    }
    
    const data = await response.json();
    console.log('addTopic - ответ API:', data);
    return data;
  } catch (error) {
    console.error('Ошибка при добавлении темы:', error);
    throw error;
  }
};

export const updateTopic = async (topicId: string, topic: Partial<FlashcardTopic>) => {
  try {
    console.log('updateTopic - topicId:', topicId, 'topic:', topic);
    
    const response = await fetch(`/api/flashcard-topics/${topicId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topic)
    });
    
    if (!response.ok) {
      console.error('Ошибка ответа API:', response.status, response.statusText);
      throw new Error('Ошибка при обновлении темы');
    }
    
    const data = await response.json();
    console.log('updateTopic - ответ API:', data);
    return data;
  } catch (error) {
    console.error('Ошибка при обновлении темы:', error);
    throw error;
  }
};

export const deleteTopic = async (topicId: string) => {
  try {
    console.log('deleteTopic - topicId:', topicId);
    
    const response = await fetch(`/api/flashcard-topics/${topicId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      console.error('Ошибка ответа API:', response.status, response.statusText);
      throw new Error('Ошибка при удалении темы');
    }
    
    console.log('Тема удалена успешно');
    return true;
  } catch (error) {
    console.error('Ошибка при удалении темы:', error);
    throw error;
  }
};

// API для работы с флеш-карточками
export const getCardsForTopic = async (topicId: string) => {
  try {
    console.log('getCardsForTopic - topicId:', topicId);
    const response = await fetch(`/api/flashcards?topicId=${topicId}`);
    
    if (!response.ok) {
      console.error('Ошибка ответа API:', response.status, response.statusText);
      throw new Error('Ошибка при получении карточек');
    }
    
    const data = await response.json();
    console.log('getCardsForTopic - ответ API:', data);
    return data;
  } catch (error) {
    console.error('Ошибка при получении карточек:', error);
    return [];
  }
};

export const getCardsForUser = async (userId: number) => {
  try {
    console.log('getCardsForUser - userId:', userId);
    const response = await fetch(`/api/flashcards?userId=${userId}`);
    
    if (!response.ok) {
      console.error('Ошибка ответа API:', response.status, response.statusText);
      throw new Error('Ошибка при получении карточек');
    }
    
    const data = await response.json();
    console.log('getCardsForUser - ответ API:', data);
    return data;
  } catch (error) {
    console.error('Ошибка при получении карточек:', error);
    return [];
  }
};

export const addCard = async (userId: number, card: Omit<Flashcard, 'id' | 'createdAt'>) => {
  try {
    console.log('addCard - userId:', userId, 'card:', card);
    
    const response = await fetch('/api/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...card, userId })
    });
    
    if (!response.ok) {
      console.error('Ошибка ответа API:', response.status, response.statusText);
      const errorData = await response.json();
      console.error('Подробности ошибки:', errorData);
      throw new Error('Ошибка при добавлении карточки');
    }
    
    const data = await response.json();
    console.log('addCard - ответ API:', data);
    return data;
  } catch (error) {
    console.error('Ошибка при добавлении карточки:', error);
    throw error;
  }
};

export const updateCard = async (cardId: string, card: Partial<Flashcard>) => {
  try {
    console.log('updateCard - cardId:', cardId, 'card:', card);
    
    const response = await fetch(`/api/flashcards/${cardId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card)
    });
    
    if (!response.ok) {
      console.error('Ошибка ответа API:', response.status, response.statusText);
      throw new Error('Ошибка при обновлении карточки');
    }
    
    const data = await response.json();
    console.log('updateCard - ответ API:', data);
    return data;
  } catch (error) {
    console.error('Ошибка при обновлении карточки:', error);
    throw error;
  }
};

export const deleteCard = async (cardId: string) => {
  try {
    console.log('deleteCard - cardId:', cardId);
    
    const response = await fetch(`/api/flashcards/${cardId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      console.error('Ошибка ответа API:', response.status, response.statusText);
      throw new Error('Ошибка при удалении карточки');
    }
    
    console.log('Карточка удалена успешно');
    return true;
  } catch (error) {
    console.error('Ошибка при удалении карточки:', error);
    throw error;
  }
};

// Обновить статус избранного для карточки
export const toggleCardFavorite = async (cardId: string, favorite: boolean) => {
  try {
    console.log('toggleCardFavorite - cardId:', cardId, 'favorite:', favorite);
    
    const response = await fetch(`/api/flashcards/${cardId}/favorite`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorite })
    });
    
    if (!response.ok) {
      console.error('Ошибка ответа API:', response.status, response.statusText);
      throw new Error('Ошибка при обновлении статуса избранного');
    }
    
    const data = await response.json();
    console.log('toggleCardFavorite - ответ API:', data);
    return data;
  } catch (error) {
    console.error('Ошибка при обновлении статуса избранного:', error);
    throw error;
  }
}; 