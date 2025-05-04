'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Stack,
  Tooltip,
  Fade,
  Slide,
  alpha,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FlagOutlined as FlagIcon
} from '@mui/icons-material';
import { TodoItem } from '../types';

// Pastel blue color palette
const PASTEL_BLUE = {
  main: '#A5C7E4',  // Main pastel blue
  light: '#C9DDF0', // Lighter pastel blue
  dark: '#84A7C4',  // Darker pastel blue
  contrast: '#FFFFFF' // White text for contrast
};

interface TodoListProps {
  todos: TodoItem[];
  onAdd: (todo: Omit<TodoItem, 'id' | 'createdAt'>) => void;
  onToggleComplete: (id: string) => void;
  onEdit: (id: string, todo: Partial<TodoItem>) => void;
  onDelete: (id: string) => void;
  isCompactView?: boolean;
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
  onAdd,
  onToggleComplete,
  onEdit,
  onDelete,
  isCompactView = false
}) => {
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Фильтрация задач
  const filteredTodos = todos.filter(todo => showCompleted || !todo.completed);
  
  // Сортировка задач: сначала по приоритету, затем незавершенные вверху
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    // Сначала по статусу завершения
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Затем по приоритету (high > medium > low)
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  const handleOpenDialog = (todo?: TodoItem) => {
    if (todo) {
      setEditingTodo(todo);
      setNewTodoTitle(todo.title);
      setNewTodoPriority(todo.priority);
    } else {
      setEditingTodo(null);
      setNewTodoTitle('');
      setNewTodoPriority('medium');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTodo(null);
  };

  const handleSaveTodo = () => {
    if (newTodoTitle.trim() === '') return;
    
    if (editingTodo) {
      onEdit(editingTodo.id, {
        title: newTodoTitle,
        priority: newTodoPriority
      });
    } else {
      onAdd({
        title: newTodoTitle,
        completed: false,
        priority: newTodoPriority
      });
    }
    
    handleCloseDialog();
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return '#FF7D7D'; // Soft red
      case 'medium': return '#7DAFFF'; // Soft blue (instead of orange)
      case 'low': return '#90D17E'; // Soft green
      default: return '#C8C8C8';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch(priority) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return '';
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'white',
      borderRadius: 4,
      overflow: 'hidden',
      boxShadow: 'rgba(149, 157, 165, 0.1) 0px 8px 24px',
    }}>
      {/* Заголовок и кнопки управления */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
          borderBottom: `1px solid ${alpha('#A5C7E4', 0.2)}`,
          background: 'linear-gradient(to right, #f8fbff, #edf4fa)',
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            color: '#2a5a84',
            fontSize: '1.1rem',
            letterSpacing: '-0.01em'
          }}
        >
          Задачи
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            onClick={() => handleOpenDialog()}
            startIcon={<AddIcon />}
            sx={{ 
              textTransform: 'none',
              borderRadius: 2,
              fontSize: '0.85rem',
              fontWeight: 500,
              backgroundColor: PASTEL_BLUE.main,
              '&:hover': {
                backgroundColor: PASTEL_BLUE.dark,
              },
              minWidth: 0,
              px: 1.5
            }}
          >
            Добавить
          </Button>
        </Box>
      </Box>
      
      {/* Список задач */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto',
          p: 2,
          backgroundColor: '#F8FAFC',
          '&::-webkit-scrollbar': {
            width: '6px',
            backgroundColor: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(PASTEL_BLUE.main, 0.3),
            borderRadius: '3px'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: alpha(PASTEL_BLUE.main, 0.5)
          }
        }}
      >
        <Stack spacing={1.5}>
          {sortedTodos.length > 0 ? (
            sortedTodos.map((todo, index) => (
              <Fade in key={todo.id} timeout={300} style={{ transitionDelay: `${index * 50}ms` }}>
                <Card
                  variant="outlined"
                  sx={{ 
                    borderRadius: 3,
                    boxShadow: todo.completed 
                      ? 'none' 
                      : '0 2px 10px rgba(0, 0, 0, 0.03)',
                    border: '1px solid',
                    borderColor: todo.completed 
                      ? alpha('#000', 0.06) 
                      : alpha('#000', 0.04),
                    borderLeft: `3px solid ${getPriorityColor(todo.priority)}`,
                    backdropFilter: 'blur(8px)',
                    backgroundColor: todo.completed 
                      ? alpha('#FFF', 0.85) 
                      : '#FFF',
                    opacity: todo.completed ? 0.75 : 1,
                    transform: 'translateZ(0)',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: todo.completed 
                        ? '0 1px 5px rgba(0, 0, 0, 0.03)' 
                        : '0 3px 12px rgba(0, 0, 0, 0.06)',
                      transform: 'translateY(-1px) scale(1.002)',
                      borderLeft: `4px solid ${getPriorityColor(todo.priority)}`,
                    }
                  }}
                >
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Checkbox
                        checked={todo.completed}
                        onChange={() => onToggleComplete(todo.id)}
                        icon={<RadioButtonUncheckedIcon fontSize="small" />}
                        checkedIcon={<CheckCircleIcon fontSize="small" />}
                        sx={{
                          color: alpha('#000', 0.25),
                          '&.Mui-checked': {
                            color: PASTEL_BLUE.main,
                          },
                          '&:hover': {
                            backgroundColor: alpha(PASTEL_BLUE.main, 0.05),
                          },
                          transition: 'all 0.15s ease'
                        }}
                      />
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 500,
                          flex: 1,
                          color: todo.completed ? alpha('#000', 0.4) : alpha('#000', 0.8),
                          textDecoration: todo.completed ? 'line-through' : 'none',
                          transition: 'all 0.15s ease',
                          lineHeight: 1.3,
                          fontSize: '0.95rem',
                          letterSpacing: '-0.01em'
                        }}
                      >
                        {todo.title}
                      </Typography>
                      
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        opacity: 0.8,
                        transition: 'opacity 0.2s ease',
                        '&:hover': { opacity: 1 }
                      }}>
                        <Tooltip title={getPriorityLabel(todo.priority)}>
                          <Box 
                            component="span" 
                            sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: '0.75rem',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 3,
                              backgroundColor: alpha(getPriorityColor(todo.priority), 0.12),
                              color: alpha(getPriorityColor(todo.priority), 0.8),
                              fontWeight: 600,
                              mr: 1,
                              transition: 'all 0.15s ease',
                              '&:hover': {
                                backgroundColor: alpha(getPriorityColor(todo.priority), 0.18),
                              }
                            }}
                          >
                            <FlagIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                            {getPriorityLabel(todo.priority)}
                          </Box>
                        </Tooltip>
                        
                        <Box sx={{ 
                          display: 'flex',
                          gap: 0.5,
                          opacity: 0.7,
                          transition: 'opacity 0.2s ease',
                          '&:hover': { opacity: 1 }
                        }}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(todo)}
                            sx={{ 
                              p: 0.5,
                              color: alpha('#000', 0.6),
                              '&:hover': {
                                backgroundColor: alpha(PASTEL_BLUE.main, 0.1),
                                color: PASTEL_BLUE.dark
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => onDelete(todo.id)}
                            sx={{ 
                              p: 0.5,
                              color: alpha('#000', 0.6),
                              '&:hover': {
                                backgroundColor: alpha('#f44336', 0.1),
                                color: '#f44336'
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            ))
          ) : (
            <Fade in timeout={500}>
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: 6,
                  px: 2,
                  color: alpha('#000', 0.4),
                  backgroundColor: alpha('#FFF', 0.6),
                  borderRadius: 3,
                  border: `1px dashed ${alpha(PASTEL_BLUE.main, 0.3)}`,
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                  Список задач пуст
                </Typography>
                <Typography variant="body2">
                  Нажмите «Добавить» для создания новой задачи
                </Typography>
              </Box>
            </Fade>
          )}
        </Stack>
      </Box>
      
      {/* Диалог добавления/редактирования задачи */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' } as any}
        PaperProps={{
          elevation: 8,
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          py: 2.5,
          px: 3,
          fontSize: '1.2rem',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          color: '#2a5a84',
          borderBottom: `1px solid ${alpha('#000', 0.06)}`,
          backgroundColor: '#F2F7FB'
        }}>
          {editingTodo ? 'Редактировать задачу' : 'Новая задача'}
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                label="Название задачи"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                fullWidth
                variant="outlined"
                InputProps={{
                  sx: {
                    borderRadius: 2,
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    letterSpacing: '-0.01em',
                    '&.Mui-focused': {
                      boxShadow: `0 0 0 3px ${alpha(PASTEL_BLUE.main, 0.15)}`
                    },
                    transition: 'box-shadow 0.2s ease'
                  }
                }}
                InputLabelProps={{
                  sx: {
                    fontWeight: 500,
                    fontSize: '0.95rem'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel sx={{ fontWeight: 500, fontSize: '0.95rem' }}>
                  Приоритет
                </InputLabel>
                <Select
                  value={newTodoPriority}
                  onChange={(e) => setNewTodoPriority(e.target.value as 'low' | 'medium' | 'high')}
                  label="Приоритет"
                  sx={{ 
                    borderRadius: 2,
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    letterSpacing: '-0.01em',
                    '&.Mui-focused': {
                      boxShadow: `0 0 0 3px ${alpha(PASTEL_BLUE.main, 0.15)}`
                    },
                    transition: 'box-shadow 0.2s ease'
                  }}
                >
                  <MenuItem value="low" sx={{ py: 1.5, px: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        sx={{ 
                          width: 10, 
                          height: 10, 
                          borderRadius: '50%', 
                          bgcolor: '#90D17E',
                          mr: 1.5
                        }} 
                      />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>Низкий</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="medium" sx={{ py: 1.5, px: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        sx={{ 
                          width: 10, 
                          height: 10, 
                          borderRadius: '50%', 
                          bgcolor: '#7DAFFF',
                          mr: 1.5
                        }} 
                      />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>Средний</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="high" sx={{ py: 1.5, px: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        sx={{ 
                          width: 10, 
                          height: 10, 
                          borderRadius: '50%', 
                          bgcolor: '#FF7D7D',
                          mr: 1.5
                        }} 
                      />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>Высокий</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${alpha('#000', 0.06)}` }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              px: 2,
              borderRadius: 2,
              color: alpha('#000', 0.6)
            }}
          >
            Отмена
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveTodo}
            disabled={newTodoTitle.trim() === ''}
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              px: 3,
              borderRadius: 2,
              boxShadow: 'none',
              transition: 'all 0.2s ease',
              backgroundColor: PASTEL_BLUE.main,
              '&:hover': {
                backgroundColor: PASTEL_BLUE.dark,
                boxShadow: `0 4px 12px ${alpha(PASTEL_BLUE.main, 0.3)}`
              }
            }}
          >
            {editingTodo ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TodoList;