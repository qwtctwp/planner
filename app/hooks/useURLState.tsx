import { useState, useEffect } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

// Простой синхронизатор для URL-параметров
const createURLStateManager = (param: string) => {
  // Список подписчиков
  const listeners: Array<() => void> = [];

  // Функция для получения текущего значения параметра
  const getSnapshot = () => {
    if (typeof window === 'undefined') return null;
    
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
  };

  // Функция для подписки на изменения
  const subscribe = (listener: () => void) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  };

  // Функция для установки нового значения
  const setURLParam = (value: string | null) => {
    if (typeof window === 'undefined') return;
    
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    
    if (value === null) {
      params.delete(param);
    } else {
      params.set(param, value);
    }
    
    url.search = params.toString();
    window.history.pushState({}, '', url.toString());
    
    // Уведомляем всех подписчиков
    listeners.forEach(listener => listener());
  };

  return {
    getSnapshot,
    subscribe,
    setURLParam
  };
};

// Хук для использования URL-параметра как состояния
export default function useURLState(param: string, defaultValue: string | null = null) {
  const manager = createURLStateManager(param);
  
  // Используем useSyncExternalStore для синхронизации с URL
  const value = useSyncExternalStore(
    manager.subscribe,
    manager.getSnapshot,
    // Серверное значение по умолчанию
    () => defaultValue
  );
  
  return [value || defaultValue, manager.setURLParam] as const;
} 