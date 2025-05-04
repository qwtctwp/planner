'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ruLocale } from '../locales/ru';

// Типы локализации
type LocaleType = 'ru' | 'en';

// Интерфейс контекста
interface LocaleContextType {
  locale: LocaleType;
  t: (key: keyof typeof ruLocale) => string;
  changeLocale: (locale: LocaleType) => void;
}

// Создание контекста с начальными значениями
const LocaleContext = createContext<LocaleContextType>({
  locale: 'ru',
  t: (key) => key.toString(),
  changeLocale: () => {}
});

// Провайдер контекста
export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<LocaleType>('ru');
  
  // Функция для получения перевода по ключу
  const t = (key: keyof typeof ruLocale): string => {
    if (locale === 'ru') {
      return ruLocale[key] || key.toString();
    }
    
    // В будущем, когда добавим другие языки, можно будет переключаться между ними
    return key.toString();
  };
  
  // Функция для изменения локали
  const changeLocale = (newLocale: LocaleType) => {
    setLocale(newLocale);
  };
  
  return (
    <LocaleContext.Provider value={{ locale, t, changeLocale }}>
      {children}
    </LocaleContext.Provider>
  );
};

// Хук для использования локализации
export const useLocale = () => useContext(LocaleContext); 