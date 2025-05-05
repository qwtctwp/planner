'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from 'react-beautiful-dnd';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { Assignment, Category, AssignmentStatus } from '../types';

interface KanbanColumn {
  id: AssignmentStatus;
  title: string;
  items: Assignment[];
}

type ColumnMap = {
  [key in AssignmentStatus]: KanbanColumn;
};

interface SimpleKanbanProps {
  assignments: Assignment[];
  categories: Category[];
  onAssignmentUpdate: (assignmentId: string, data: Partial<Assignment>) => Promise<void>;
  onAssignmentAdd: (assignment: Omit<Assignment, 'id' | 'completed'>) => Promise<void>;
  onAssignmentDelete: (assignmentId: string) => Promise<void>;
}

export default function SimpleKanban({
  assignments,
  categories,
  onAssignmentUpdate,
  onAssignmentAdd,
  onAssignmentDelete
}: SimpleKanbanProps) {
  const initialColumns: ColumnMap = {
    todo: {
      id: 'todo',
      title: 'К выполнению',
      items: []
    },
    in_progress: {
      id: 'in_progress',
      title: 'В процессе',
      items: []
    },
    on_hold: {
      id: 'on_hold',
      title: 'Отложено',
      items: []
    },
    done: {
      id: 'done',
      title: 'Завершено',
      items: []
    }
  };

  const [columns, setColumns] = useState<ColumnMap>(initialColumns);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    categoryId: '',
    status: 'todo' as AssignmentStatus
  });

  // Populate columns when assignments change
  useEffect(() => {
    const todoItems = assignments.filter(a => a.status === 'todo' || (!a.status && !a.completed));
    const inProgressItems = assignments.filter(a => a.status === 'in_progress');
    const onHoldItems = assignments.filter(a => a.status === 'on_hold');
    const doneItems = assignments.filter(a => a.status === 'done' || (!a.status && a.completed));

    setColumns({
      todo: { ...initialColumns.todo, items: todoItems },
      in_progress: { ...initialColumns.in_progress, items: inProgressItems },
      on_hold: { ...initialColumns.on_hold, items: onHoldItems },
      done: { ...initialColumns.done, items: doneItems }
    });
  }, [assignments]);

  useEffect(() => {
    if (categories.length > 0 && !newTask.categoryId) {
      setNewTask(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories]);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Find the assignment
    const assignment = assignments.find(a => a.id === draggableId);
    if (!assignment) return;

    // Get the new status
    const newStatus = destination.droppableId as AssignmentStatus;
    const completed = newStatus === 'done';

    try {
      // Call API to update the assignment
      await onAssignmentUpdate(assignment.id, {
        status: newStatus,
        completed
      });
    } catch (error) {
      console.error('Failed to update assignment status:', error);
    }
  };

  const handleAddTask = async () => {
    try {
      await onAssignmentAdd({
        title: newTask.title,
        description: newTask.description,
        categoryId: newTask.categoryId,
        status: newTask.status,
        dueDate: new Date().toISOString()
      });
      setAddDialogOpen(false);
      setNewTask({
        title: '',
        description: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        status: 'todo'
      });
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const getColumnColor = (status: AssignmentStatus) => {
    switch (status) {
      case 'todo':
        return { bg: '#f5f5f5', border: '#e0e0e0' };
      case 'in_progress':
        return { bg: '#e3f2fd', border: '#bbdefb' };
      case 'done':
        return { bg: '#e8f5e9', border: '#c8e6c9' };
      default:
        return { bg: '#f5f5f5', border: '#e0e0e0' };
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
        >
          Добавить задание
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, height: '100%', overflowX: 'auto' }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          {Object.values(columns).map(column => {
            const colors = getColumnColor(column.id);
            return (
              <Box key={column.id} sx={{ minWidth: 300, width: 300 }}>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: colors.bg,
                    borderRadius: '4px 4px 0 0',
                    border: `1px solid ${colors.border}`,
                    borderBottom: 'none',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {column.title}
                  </Typography>
                  <Typography variant="body2">
                    {column.items.length}
                  </Typography>
                </Paper>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        p: 1,
                        height: 'calc(100vh - 280px)',
                        overflowY: 'auto',
                        bgcolor: snapshot.isDraggingOver ? `${colors.bg}90` : colors.bg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '0 0 4px 4px'
                      }}
                    >
                      {column.items.length === 0 ? (
                        <Box sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          opacity: 0.5
                        }}>
                          <Typography>Нет заданий</Typography>
                        </Box>
                      ) : (
                        column.items.map((item, index) => {
                          const category = categories.find(c => c.id === item.categoryId);
                          return (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  sx={{
                                    mb: 1,
                                    boxShadow: snapshot.isDragging ? 4 : 1,
                                    borderLeft: category ? `4px solid ${category.color}` : undefined
                                  }}
                                >
                                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Box sx={{ 
                                      display: 'flex', 
                                      justifyContent: 'space-between', 
                                      alignItems: 'flex-start',
                                      mb: 1
                                    }}>
                                      <Typography variant="subtitle2" fontWeight="bold">
                                        {item.title}
                                      </Typography>
                                      <Box>
                                        <IconButton
                                          size="small"
                                          onClick={() => onAssignmentDelete(item.id)}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                    
                                    {item.description && (
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {item.description}
                                      </Typography>
                                    )}
                                    
                                    {category && (
                                      <Chip
                                        label={category.name}
                                        size="small"
                                        sx={{
                                          bgcolor: `${category.color}20`,
                                          color: category.color,
                                          fontSize: '0.75rem'
                                        }}
                                      />
                                    )}
                                  </CardContent>
                                </Card>
                              )}
                            </Draggable>
                          );
                        })
                      )}
                      {provided.placeholder}
                    </Paper>
                  )}
                </Droppable>
              </Box>
            );
          })}
        </DragDropContext>
      </Box>

      {/* Add Task Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Добавить задание</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <TextField
            fullWidth
            margin="normal"
            label="Название"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Описание"
            multiline
            rows={3}
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          <TextField
            select
            fullWidth
            margin="normal"
            label="Категория"
            value={newTask.categoryId}
            onChange={(e) => setNewTask({ ...newTask, categoryId: e.target.value })}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            margin="normal"
            label="Статус"
            value={newTask.status}
            onChange={(e) => setNewTask({ ...newTask, status: e.target.value as AssignmentStatus })}
          >
            <MenuItem value="todo">К выполнению</MenuItem>
            <MenuItem value="in_progress">В процессе</MenuItem>
            <MenuItem value="done">Завершено</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Отмена</Button>
          <Button 
            variant="contained" 
            onClick={handleAddTask}
            disabled={!newTask.title || !newTask.categoryId}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 