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

const initialColumns = {
  'column1': {
    id: 'column1',
    title: 'Column 1',
    items: [
      { id: 'item-1', content: 'Item 1' },
      { id: 'item-2', content: 'Item 2' },
      { id: 'item-3', content: 'Item 3' },
    ]
  },
  'column2': {
    id: 'column2',
    title: 'Column 2',
    items: [
      { id: 'item-4', content: 'Item 4' },
      { id: 'item-5', content: 'Item 5' },
    ]
  }
};

export default function TestDnDColumns() {
  const router = useRouter();
  const [columns, setColumns] = useState<{ [key: string]: Column }>(initialColumns);

  useEffect(() => {
    // Redirect to dashboard
    router.push('/dashboard');
  }, [router]);

  const onDragEnd = (result: DropResult) => {
    console.log('Drag result:', result);
    const { source, destination } = result;

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

  const resetState = () => {
    setColumns(initialColumns);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Multi-column Drag and Drop Test
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <button onClick={resetState}>Reset</button>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.values(columns).map(column => (
            <Box key={column.id} sx={{ width: 250 }}>
              <Paper 
                sx={{ 
                  p: 2, 
                  bgcolor: column.id === 'column1' ? '#f5f5f5' : '#e8f5e9',
                  mb: 1
                }}
              >
                <Typography variant="h6">{column.title}</Typography>
              </Paper>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <Paper
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{ 
                      p: 2, 
                      minHeight: 300,
                      bgcolor: snapshot.isDraggingOver 
                        ? (column.id === 'column1' ? '#eeeeee' : '#c8e6c9')
                        : 'white'
                    }}
                  >
                    {column.items.map((item, index) => (
                      <Draggable 
                        key={item.id} 
                        draggableId={item.id} 
                        index={index}
                      >
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
            </Box>
          ))}
        </DragDropContext>
      </Box>
    </Box>
  );
} 