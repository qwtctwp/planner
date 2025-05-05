export type ViewType = 'day' | 'week' | 'month';

export type AssignmentStatus = 'todo' | 'in_progress' | 'done' | 'on_hold';

export interface Assignment {
  id: string;
  lessonId?: string;
  categoryId?: string; // Делаем опциональным, т.к. отсутствует в базе данных
  title: string;
  description: string;
  dueDate: string; // ISO date string
  completed: boolean;
  status?: AssignmentStatus; // Статус задания
}

export interface Category {
  id: string;
  name: string;
  color: string;
  userId: string; // ID пользователя, которому принадлежит категория
}

export interface Lesson {
  id: string;
  title: string;
  start: Date;
  end: Date;
  categoryId: string;
  assignments: string[]; // Array of assignment IDs
  location?: string; // Место проведения (опционально)
  description?: string; // Описание (опционально)
}

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string; // ISO date string
  priority: 'low' | 'medium' | 'high'; // Приоритет
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  color?: string; // Цвет заметки (опционально)
}

export interface LoadData {
  date: Date;
  hours: number;
}

export interface FlashcardTopic {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  color?: string;
  createdAt: string;
  cardsCount: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topicId: string;
  categoryId: string;
  favorite: boolean;
  createdAt: string;
} 