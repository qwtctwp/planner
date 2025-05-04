'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Box, Typography, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';

interface Item {
  id: string;
  content: string;
}

interface Column {
  id: string;
  title: string;
  items: Item[];
}

export default function TestDnD() {
  const router = useRouter();
  const [columns, setColumns] = useState<{ [key: string]: Column }>({
    'todo': {
      id: 'todo',
      title: 'To Do',
      items: [
        { id: 'item-1', content: 'Task 1' },
        { id: 'item-2', content: 'Task 2' },
        { id: 'item-3', content: 'Task 3' },
      ]
    },
    'done': {
      id: 'done',
      title: 'Done',
      items: [
        { id: 'item-4', content: 'Task 4' },
        { id: 'item-5', content: 'Task 5' },
      ]
    }
  });

  useEffect(() => {
    // Redirect to dashboard
    router.push('/dashboard');
  }, [router]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    console.log('Drag result:', result);

    // If dropped outside of a droppable area
    if (!destination) return;

    // If dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    // Get source and destination columns
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    
    // If moving within the same column
    if (source.droppableId === destination.droppableId) {
      const newItems = Array.from(sourceColumn.items);
      const [removed] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: newItems
        }
      });
    } 
    // If moving to a different column
    else {
      const sourceItems = Array.from(sourceColumn.items);
      const destItems = Array.from(destColumn.items);
      const [removed] = sourceItems.splice(source.index, 1);
      
      destItems.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems
        }
      });
    }
  };

  return null;
} 