'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent,
  Chip
} from '@mui/material';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from 'react-beautiful-dnd';
import { useRouter } from 'next/navigation';

// Упрощенная версия типов
type Status = 'todo' | 'in_progress' | 'on_hold' | 'done';

interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
}

interface Column {
  id: Status;
  title: string;
  items: Task[];
}

export default function TestKanbanPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to dashboard
    router.push('/dashboard');
  }, [router]);
  
  // Изначальное состояние с тестовыми задачами
  const [columns, setColumns] = useState<{ [key in Status]: Column }>({
    todo: {
      id: 'todo',
      title: 'К выполнению',
      items: [
        { id: 'task-1', title: 'Задача 1', description: 'Описание задачи 1', status: 'todo' },
        { id: 'task-2', title: 'Задача 2', description: 'Описание задачи 2', status: 'todo' },
      ]
    },
    in_progress: {
      id: 'in_progress',
      title: 'В процессе',
      items: [
        { id: 'task-3', title: 'Задача 3', description: 'Описание задачи 3', status: 'in_progress' },
      ]
    },
    on_hold: {
      id: 'on_hold',
      title: 'Отложено',
      items: [
        { id: 'task-4', title: 'Задача 4', description: 'Описание задачи 4', status: 'on_hold' },
      ]
    },
    done: {
      id: 'done',
      title: 'Выполнено',
      items: [
        { id: 'task-5', title: 'Задача 5', description: 'Описание задачи 5', status: 'done' },
      ]
    }
  });

  // Функция для обработки перетаскивания
  const onDragEnd = (result: DropResult) => {
    console.log('Drag end result:', result);
    const { source, destination } = result;

    // Если перетащили за пределы области
    if (!destination) return;

    // Если перетащили на то же самое место
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    // Получаем исходную и целевую колонки
    const sourceCol = columns[source.droppableId as Status];
    const destCol = columns[destination.droppableId as Status];
    
    // Если перемещение внутри той же колонки
    if (source.droppableId === destination.droppableId) {
      const newItems = Array.from(sourceCol.items);
      const [removed] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, removed);
      
      const newColumn = {
        ...sourceCol,
        items: newItems
      };
      
      setColumns({
        ...columns,
        [source.droppableId]: newColumn
      });
    } 
    // Если перемещение между колонками
    else {
      const sourceItems = Array.from(sourceCol.items);
      const destItems = Array.from(destCol.items);
      
      // Удаляем из исходной колонки
      const [removed] = sourceItems.splice(source.index, 1);
      
      // Обновляем статус задачи
      const updatedTask = {
        ...removed,
        status: destination.droppableId as Status
      };
      
      // Добавляем в целевую колонку с обновленным статусом
      destItems.splice(destination.index, 0, updatedTask);
      
      // Обновляем состояние
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceCol,
          items: sourceItems
        },
        [destination.droppableId]: {
          ...destCol,
          items: destItems
        }
      });
    }
  };

  const getColumnColor = (columnId: Status) => {
    switch (columnId) {
      case 'todo':
        return { light: '#FFF7E6', border: '#FFF0D1' };
      case 'in_progress':
        return { light: '#E8F0FE', border: '#D2E3FC' };
      case 'on_hold':
        return { light: '#FCE8E6', border: '#FADAD9' };
      case 'done':
        return { light: '#E6F4EA', border: '#D7EDE1' };
      default:
        return { light: '#F1F3F4', border: '#E8EAED' };
    }
  };

  return null;
} 