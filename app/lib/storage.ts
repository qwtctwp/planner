import { Category, Lesson, Assignment, TodoItem, Note } from '../types';

// Ключи для localStorage
const STORAGE_KEYS = {
  CATEGORIES: 'student-planner-categories',
  LESSONS: 'student-planner-lessons',
  ASSIGNMENTS: 'student-planner-assignments',
  TODOS: 'student-planner-todos',
  NOTES: 'student-planner-notes'
};

// Загрузка категорий
export const loadCategories = (): Category[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Ошибка при загрузке категорий:', error);
    return [];
  }
};

// Сохранение категорий
export const saveCategories = (categories: Category[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (error) {
    console.error('Ошибка при сохранении категорий:', error);
  }
};

// Загрузка уроков/событий
export const loadLessons = (): Lesson[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LESSONS);
    const lessons = data ? JSON.parse(data) : [];
    
    // Преобразуем строки дат в объекты Date
    return lessons.map((lesson: any) => ({
      ...lesson,
      start: new Date(lesson.start),
      end: new Date(lesson.end)
    }));
  } catch (error) {
    console.error('Ошибка при загрузке уроков:', error);
    return [];
  }
};

// Сохранение уроков/событий
export const saveLessons = (lessons: Lesson[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
  } catch (error) {
    console.error('Ошибка при сохранении уроков:', error);
  }
};

// Загрузка заданий
export const loadAssignments = (): Assignment[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Ошибка при загрузке заданий:', error);
    return [];
  }
};

// Сохранение заданий
export const saveAssignments = (assignments: Assignment[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  } catch (error) {
    console.error('Ошибка при сохранении заданий:', error);
  }
};

// Загрузка To-Do элементов
export const loadTodos = (): TodoItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TODOS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Ошибка при загрузке задач:', error);
    return [];
  }
};

// Сохранение To-Do элементов
export const saveTodos = (todos: TodoItem[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
  } catch (error) {
    console.error('Ошибка при сохранении задач:', error);
  }
};

// Загрузка заметок
export const loadNotes = (): Note[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Ошибка при загрузке заметок:', error);
    return [];
  }
};

// Сохранение заметок
export const saveNotes = (notes: Note[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch (error) {
    console.error('Ошибка при сохранении заметок:', error);
  }
}; 