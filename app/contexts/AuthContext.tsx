'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Проверяем авторизацию при загрузке
    const checkAuth = async () => {
      try {
        // Запрос к API для проверки авторизации
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          setUserData(data);
        } else {
          setUser(null);
          setUserData(null);
        }
      } catch (error) {
        console.error('Ошибка при проверке авторизации:', error);
        setUser(null);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Вызов API для входа
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка при входе');
      }
      
      const data = await response.json();
      setUser(data);
      setUserData(data);
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Ошибка при входе:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // Вызов API для регистрации
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка при регистрации');
      }
      
      // После успешной регистрации входим в систему
      await login(email, password);
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Вызов API для выхода
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      setUser(null);
      setUserData(null);
      router.push('/login');
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
      throw error;
    }
  };

  const value = {
    user,
    userData,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 