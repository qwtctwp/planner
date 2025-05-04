'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';

const TestDndMinimal = () => {
  const [items, setItems] = useState([
    { id: 'item-1', content: 'Item 1' },
    { id: 'item-2', content: 'Item 2' },
    { id: 'item-3', content: 'Item 3' },
  ]);

  const router = useRouter();
  
  useEffect(() => {
    // Redirect to dashboard
    router.push('/dashboard');
  }, [router]);

  const onDragEnd = (result: DropResult) => {
    console.log('Drag result:', result);
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // If the item didn't move positions, don't do anything
    if (source.index === destination.index) {
      return;
    }

    // Reorder the list
    const newItems = Array.from(items);
    const [removed] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, removed);
    
    console.log('Items reordered:', newItems);
    setItems(newItems);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Simple Drag and Drop Test
      </Typography>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <Paper
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{ 
                p: 2, 
                minHeight: 300,
                bgcolor: snapshot.isDraggingOver ? '#f0f0f0' : 'white',
                width: '300px'
              }}
            >
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      sx={{
                        p: 2,
                        mb: 2,
                        backgroundColor: snapshot.isDragging ? '#bbdefb' : 'white',
                        boxShadow: snapshot.isDragging ? 3 : 1
                      }}
                    >
                      {item.content}
                    </Paper>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Paper>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
};

export default TestDndMinimal; 