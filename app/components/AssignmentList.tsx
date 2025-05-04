'use client';

import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Typography,
  Button,
  Box,
  Chip,
  Card,
  CardContent,
  Grid,
  Avatar,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Assignment, Category, Lesson } from '../types';
import AssignmentEditDialog from './AssignmentEditDialog';
import { useLocale } from '../contexts/LocaleContext';

interface AssignmentListProps {
  assignments: Assignment[];
  categories: Category[];
  lessonId?: string;
  onAdd: (assignment: Omit<Assignment, 'id' | 'completed'>) => void;
  onEdit: (id: string, assignment: Omit<Assignment, 'id' | 'completed'>) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  lessons?: Lesson[];
}

export default function AssignmentList({
  assignments,
  categories,
  lessonId,
  onAdd,
  onEdit,
  onDelete,
  onToggleComplete,
  lessons,
}: AssignmentListProps) {
  const { t } = useLocale();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | undefined>();

  const handleAdd = () => {
    setSelectedAssignment(undefined);
    setEditDialogOpen(true);
  };

  const handleEdit = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setEditDialogOpen(true);
  };

  const handleSave = (assignmentData: Omit<Assignment, 'id' | 'completed'>) => {
    if (selectedAssignment) {
      onEdit(selectedAssignment.id, assignmentData);
    } else {
      onAdd(assignmentData);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'PPp', { locale: ru });
    } catch (error) {
      console.error('Ошибка при форматировании даты:', error);
      return dateString;
    }
  };

  // Группировка заданий по статусу (выполнено/не выполнено)
  const completedAssignments = assignments.filter(a => a.completed);
  const pendingAssignments = assignments.filter(a => !a.completed);

  // Находим категорию для задания по его связанному уроку
  const getCategoryColor = (assignment: Assignment) => {
    if (!assignment.lessonId) return '#4285F4'; // Google синий по умолчанию
    
    // Ищем связанную категорию в датасете
    const matchingCategory = categories.find(cat => {
      // Для каждого предмета проверяем, есть ли ссылка на id задания в поле assignments
      return assignments.some(a => 
        a.id === assignment.id && a.lessonId === assignment.lessonId
      );
    });
    
    return matchingCategory?.color || '#4285F4';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>{t('assignments')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{ 
            bgcolor: '#1a73e8', 
            '&:hover': { bgcolor: '#1765cc' },
            textTransform: 'none',
            borderRadius: 1
          }}
        >
          {t('add')}
        </Button>
      </Box>

      {/* Незавершенные задания */}
      <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2, mt: 3 }}>
        Незавершенные задания
      </Typography>
      <Grid container spacing={2}>
        {pendingAssignments.map((assignment) => {
          const color = getCategoryColor(assignment);
          return (
            <Grid item xs={12} sm={6} md={4} key={assignment.id}>
              <Card 
                sx={{ 
                  borderRadius: 2,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                  borderLeft: `4px solid ${color}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <Checkbox
                      checked={assignment.completed}
                      onChange={() => onToggleComplete(assignment.id)}
                      sx={{ 
                        mr: 1, 
                        p: 0.5, 
                        color: color,
                        '&.Mui-checked': {
                          color: color,
                        }
                      }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5 }}>
                        {assignment.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {assignment.description}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      icon={<EventIcon fontSize="small" />}
                      label={formatDate(assignment.dueDate)}
                      size="small"
                      sx={{ 
                        bgcolor: `${color}10`, 
                        color: color,
                        fontWeight: 500
                      }}
                    />
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => handleEdit(assignment)}
                        sx={{ mr: 0.5 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => onDelete(assignment.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        {pendingAssignments.length === 0 && (
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', my: 2 }}>
              Нет незавершенных заданий
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* Завершенные задания */}
      <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2, mt: 4 }}>
        Завершенные задания
      </Typography>
      <Grid container spacing={2}>
        {completedAssignments.map((assignment) => {
          const color = getCategoryColor(assignment);
          return (
            <Grid item xs={12} sm={6} md={4} key={assignment.id}>
              <Card 
                sx={{ 
                  borderRadius: 2,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                  borderLeft: `4px solid ${color}`,
                  opacity: 0.7,
                  bgcolor: '#f8f9fa'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <Checkbox
                      checked={assignment.completed}
                      onChange={() => onToggleComplete(assignment.id)}
                      sx={{ 
                        mr: 1, 
                        p: 0.5, 
                        color: color,
                        '&.Mui-checked': {
                          color: color,
                        }
                      }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 500, 
                          mb: 0.5,
                          textDecoration: 'line-through',
                          color: 'text.secondary'
                        }}
                      >
                        {assignment.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ mb: 1, opacity: 0.7 }}
                      >
                        {assignment.description}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton 
                      size="small" 
                      onClick={() => onDelete(assignment.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        {completedAssignments.length === 0 && (
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', my: 2 }}>
              Нет завершенных заданий
            </Typography>
          </Grid>
        )}
      </Grid>

      <AssignmentEditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleSave}
        assignment={selectedAssignment}
        lessonId={lessonId}
        lessons={lessons || []}
        categories={categories}
      />
    </Box>
  );
} 