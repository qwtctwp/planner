import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Chip, 
  IconButton, 
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useTheme
} from '@mui/material';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from 'react-beautiful-dnd';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon
} from '@mui/icons-material';
import { Assignment, Category } from '../types';

// Определяем типы статусов для заданий
export type AssignmentStatus = 'todo' | 'in_progress' | 'on_hold' | 'done';

interface KanbanColumn {
  id: AssignmentStatus;
  title: string;
  items: Assignment[];
}

interface KanbanBoardProps {
  assignments: Assignment[];
  categories: Category[];
  onAssignmentUpdate: (assignmentId: string, data: Partial<Assignment>) => Promise<void>;
  onAssignmentAdd: (assignment: Omit<Assignment, 'id' | 'completed'>) => Promise<void>;
  onAssignmentDelete: (assignmentId: string) => Promise<void>;
  hideTitle?: boolean; // Скрыть встроенный заголовок
  customTitle?: string; // Кастомный заголовок
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  assignments,
  categories,
  onAssignmentUpdate,
  onAssignmentAdd,
  onAssignmentDelete,
  hideTitle = false,
  customTitle
}) => {
  const theme = useTheme();
  
  // Инициализация колонок с разными статусами
  const [columns, setColumns] = useState<{ [key in AssignmentStatus]: KanbanColumn }>({
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
      title: 'Выполнено',
      items: []
    }
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [newAssignment, setNewAssignment] = useState<{
    title: string;
    description: string;
    categoryId: string;
    status: AssignmentStatus;
  }>({
    title: '',
    description: '',
    categoryId: categories.length > 0 ? categories[0].id : '',
    status: 'todo'
  });

  // Обновление колонок при изменении списка заданий
  React.useEffect(() => {
    const updatedColumns = {
      todo: {
        ...columns.todo,
        items: assignments.filter(a => a.status === 'todo' || (!a.status && !a.completed))
      },
      in_progress: {
        ...columns.in_progress,
        items: assignments.filter(a => a.status === 'in_progress')
      },
      on_hold: {
        ...columns.on_hold,
        items: assignments.filter(a => a.status === 'on_hold')
      },
      done: {
        ...columns.done,
        items: assignments.filter(a => a.status === 'done' || (!a.status && a.completed))
      }
    };
    
    setColumns(updatedColumns);
  }, [assignments]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // If dropped outside of droppable area
    if (!destination) return;

    // If dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    // Get source and destination columns
    const sourceColumn = columns[source.droppableId as AssignmentStatus];
    const destColumn = columns[destination.droppableId as AssignmentStatus];
    
    // If moving within the same column
    if (source.droppableId === destination.droppableId) {
      const newItems = Array.from(sourceColumn.items);
      const [removed] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, removed);
      
      const newColumn = {
        ...sourceColumn,
        items: newItems
      };
      
      setColumns({
        ...columns,
        [source.droppableId]: newColumn
      });
    } 
    // If moving to a different column - update assignment status
    else {
      const sourceItems = Array.from(sourceColumn.items);
      const destItems = Array.from(destColumn.items);
      const [removed] = sourceItems.splice(source.index, 1);
      
      // Update assignment status
      const newStatus = destination.droppableId as AssignmentStatus;
      const updatedAssignment = {
        ...removed,
        status: newStatus,
        completed: newStatus === 'done' // Maintain backward compatibility
      };
      
      console.log('Updating assignment during drag:', updatedAssignment.id, {
        title: updatedAssignment.title,
        description: updatedAssignment.description,
        categoryId: updatedAssignment.categoryId,
        status: updatedAssignment.status,
        completed: updatedAssignment.completed,
        dueDate: updatedAssignment.dueDate
      });
      
      // Call API to update in the backend
      onAssignmentUpdate(updatedAssignment.id, { 
        title: updatedAssignment.title,
        description: updatedAssignment.description,
        categoryId: updatedAssignment.categoryId,
        dueDate: updatedAssignment.dueDate,
        status: updatedAssignment.status,
        completed: updatedAssignment.completed
      });
      
      destItems.splice(destination.index, 0, updatedAssignment);
      
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

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setNewAssignment({
      title: assignment.title,
      description: assignment.description || '',
      categoryId: assignment.categoryId,
      status: assignment.status || (assignment.completed ? 'done' : 'todo')
    });
    setDialogOpen(true);
  };

  const handleAddAssignment = () => {
    setEditingAssignment(null);
    setNewAssignment({
      title: '',
      description: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      status: 'todo'
    });
    setDialogOpen(true);
  };

  const handleSaveAssignment = async () => {
    if (editingAssignment) {
      // Update existing assignment
      await onAssignmentUpdate(editingAssignment.id, {
        title: newAssignment.title,
        description: newAssignment.description,
        categoryId: newAssignment.categoryId,
        status: newAssignment.status,
        completed: newAssignment.status === 'done'
      });
    } else {
      // Add new assignment
      await onAssignmentAdd({
        title: newAssignment.title,
        description: newAssignment.description,
        categoryId: newAssignment.categoryId,
        status: newAssignment.status,
        dueDate: new Date().toISOString(),
        lessonId: null
      });
    }
    
    setDialogOpen(false);
  };

  const getColumnColor = (columnId: AssignmentStatus) => {
    switch (columnId) {
      case 'todo':
        return {
          light: '#FFF7E6',
          medium: '#FBBC05',
          border: '#FFF0D1',
          text: '#B07800',
          chip: 'rgba(251, 188, 5, 0.1)'
        };
      case 'in_progress':
        return {
          light: '#E8F0FE',
          medium: '#4285F4',
          border: '#D2E3FC',
          text: '#1967D2',
          chip: 'rgba(66, 133, 244, 0.1)'
        };
      case 'on_hold':
        return {
          light: '#FCE8E6',
          medium: '#EA4335',
          border: '#FADAD9',
          text: '#C5221F',
          chip: 'rgba(234, 67, 53, 0.1)'
        };
      case 'done':
        return {
          light: '#E6F4EA',
          medium: '#34A853',
          border: '#D7EDE1',
          text: '#137333',
          chip: 'rgba(52, 168, 83, 0.1)'
        };
      default:
        return {
          light: '#F1F3F4',
          medium: '#5F6368',
          border: '#E8EAED',
          text: '#3C4043',
          chip: 'rgba(95, 99, 104, 0.1)'
        };
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2 
      }}>
        {!hideTitle && (
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {customTitle || "Канбан-доска заданий"}
          </Typography>
        )}
        {hideTitle && <Box />}
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddAssignment}
          sx={{ 
            borderRadius: '8px', 
            textTransform: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          Добавить
        </Button>
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        flexGrow: 1,
        height: 'calc(100% - 50px)', 
        gap: 2,
        overflow: 'auto',
        pb: 2
      }}>
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.values(columns).map(column => {
            const colors = getColumnColor(column.id);
            return (
              <Box 
                key={column.id} 
                sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: 260,
                  maxWidth: 300
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    border: `1px solid ${colors.border}`,
                    borderRadius: 2,
                    bgcolor: colors.light,
                    overflow: 'hidden'
                  }}
                >
                  {/* Column Header */}
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderBottom: `1px solid ${colors.border}`,
                      bgcolor: colors.light,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between' 
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: colors.medium
                        }}
                      />
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 600,
                          color: colors.text
                        }}
                      >
                        {column.title}
                      </Typography>
                    </Box>
                    <Chip 
                      label={column.items.length} 
                      size="small"
                      sx={{ 
                        backgroundColor: colors.chip, 
                        color: colors.medium,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 24,
                        minWidth: 30
                      }} 
                    />
                  </Box>
                  
                  {/* Droppable Area */}
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <Box
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        sx={{ 
                          flex: '1 1 auto',
                          overflowY: 'auto',
                          p: 1.5,
                          transition: 'background-color 0.2s ease',
                          bgcolor: snapshot.isDraggingOver 
                            ? colors.border
                            : 'transparent',
                          minHeight: '100px'
                        }}
                      >
                        {column.items.length === 0 && !snapshot.isDraggingOver && (
                          <Box 
                            sx={{ 
                              height: '100%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              flexDirection: 'column',
                              p: 2,
                              color: 'text.secondary',
                              opacity: 0.7
                            }}
                          >
                            <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>
                              {column.id === 'todo' ? 'Нет заданий к выполнению' :
                               column.id === 'in_progress' ? 'Нет заданий в работе' :
                               column.id === 'on_hold' ? 'Нет отложенных заданий' :
                               'Нет выполненных заданий'}
                            </Typography>
                            {column.id === 'todo' && (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={handleAddAssignment}
                                sx={{ 
                                  borderRadius: '8px', 
                                  textTransform: 'none',
                                  mt: 1
                                }}
                              >
                                Создать задание
                              </Button>
                            )}
                          </Box>
                        )}
                        
                        {column.items.map((assignment, index) => {
                          const category = categories.find(c => c.id === assignment.categoryId);
                          return (
                            <Draggable 
                              key={assignment.id} 
                              draggableId={assignment.id} 
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  sx={{
                                    mb: 1.5,
                                    borderRadius: 1.5,
                                    boxShadow: snapshot.isDragging
                                      ? '0 8px 16px rgba(0,0,0,0.15)'
                                      : '0 1px 3px rgba(0,0,0,0.05)',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    transform: snapshot.isDragging 
                                      ? 'rotate(2deg) !important' 
                                      : 'none !important',
                                    transition: theme.transitions.create(
                                      ['box-shadow', 'transform'], 
                                      { duration: theme.transitions.duration.shortest }
                                    ),
                                    position: 'relative',
                                    overflow: 'visible',
                                    bgcolor: 'white',
                                    '&:hover': {
                                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                    },
                                    '&:hover .drag-handle': {
                                      opacity: 0.5
                                    }
                                  }}
                                >
                                  {/* Drag handle icon, only shows on hover */}
                                  <Box 
                                    {...provided.dragHandleProps}
                                    className="drag-handle"
                                    sx={{
                                      position: 'absolute',
                                      top: '50%',
                                      left: -16,
                                      transform: 'translateY(-50%)',
                                      opacity: 0,
                                      transition: 'opacity 0.2s',
                                      display: 'flex',
                                      alignItems: 'center',
                                      color: 'text.secondary'
                                    }}
                                  >
                                    <DragIndicatorIcon fontSize="small" />
                                  </Box>
                                  
                                  {/* Category indicator */}
                                  {category && (
                                    <Box 
                                      sx={{ 
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: 4,
                                        bgcolor: category.color,
                                        borderTopLeftRadius: 6,
                                        borderTopRightRadius: 6
                                      }}
                                    />
                                  )}
                                  
                                  <CardContent sx={{ pb: '10px !important', pt: 2.5 }}>
                                    <Typography 
                                      gutterBottom 
                                      variant="subtitle2" 
                                      sx={{ 
                                        fontWeight: 600,
                                        mb: 0.5,
                                        lineHeight: 1.3
                                      }}
                                    >
                                      {assignment.title}
                                    </Typography>
                                    
                                    {assignment.description && (
                                      <Typography 
                                        variant="body2" 
                                        color="text.secondary" 
                                        sx={{ mb: 1.5 }}
                                      >
                                        {assignment.description.length > 100
                                          ? `${assignment.description.slice(0, 100)}...`
                                          : assignment.description}
                                      </Typography>
                                    )}
                                    
                                    <Box sx={{ 
                                      display: 'flex', 
                                      justifyContent: 'space-between', 
                                      alignItems: 'center', 
                                      mt: 1.5 
                                    }}>
                                      <Chip
                                        label={category?.name || 'Без категории'}
                                        size="small"
                                        sx={{
                                          backgroundColor: category ? `${category.color}15` : '#E0E0E0',
                                          color: category ? category.color : '#616161',
                                          fontWeight: 500,
                                          fontSize: '0.7rem',
                                          height: 22,
                                          borderRadius: '4px'
                                        }}
                                      />
                                      
                                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleEditAssignment(assignment)}
                                          sx={{ p: 0.5 }}
                                        >
                                          <EditIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: '1rem' }} />
                                        </IconButton>
                                        <IconButton
                                          size="small"
                                          onClick={() => onAssignmentDelete(assignment.id)}
                                          sx={{ p: 0.5 }}
                                        >
                                          <DeleteIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: '1rem' }} />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                  </CardContent>
                                </Card>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </Paper>
              </Box>
            );
          })}
        </DragDropContext>
      </Box>
      
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAssignment ? 'Редактировать задание' : 'Новое задание'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название"
            fullWidth
            variant="outlined"
            value={newAssignment.title}
            onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Описание"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newAssignment.description}
            onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            margin="dense"
            label="Категория"
            fullWidth
            variant="outlined"
            value={newAssignment.categoryId}
            onChange={(e) => setNewAssignment({ ...newAssignment, categoryId: e.target.value })}
            SelectProps={{
              native: true
            }}
            sx={{ mb: 2 }}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </TextField>
          <TextField
            select
            margin="dense"
            label="Статус"
            fullWidth
            variant="outlined"
            value={newAssignment.status}
            onChange={(e) => setNewAssignment({ 
              ...newAssignment, 
              status: e.target.value as AssignmentStatus 
            })}
            SelectProps={{
              native: true
            }}
          >
            <option value="todo">К выполнению</option>
            <option value="in_progress">В процессе</option>
            <option value="on_hold">Отложено</option>
            <option value="done">Выполнено</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleSaveAssignment} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KanbanBoard; 