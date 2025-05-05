import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Chip,
  Button,
  Checkbox
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { Assignment, Category } from '../types';
import { format, parseISO, isBefore, addDays, isAfter } from 'date-fns';
import { ru } from 'date-fns/locale';

interface UpcomingAssignmentsProps {
  assignments: Assignment[];
  categories: Category[];
  onToggleComplete: (assignmentId: string) => void;
  onViewAllAssignments: () => void;
}

const UpcomingAssignments: React.FC<UpcomingAssignmentsProps> = ({ 
  assignments,
  categories,
  onToggleComplete,
  onViewAllAssignments
}) => {
  // Filter assignments that are due in the next 7 days and not completed
  const now = new Date();
  const nextWeek = addDays(now, 7);
  
  // Ограничиваем количество отображаемых заданий для компактности
  const MAX_ASSIGNMENTS_SHOWN = 3;
  
  const upcomingAssignments = assignments
    .filter(assignment => 
      !assignment.completed && 
      assignment.dueDate && 
      !isBefore(parseISO(assignment.dueDate), now) &&
      !isAfter(parseISO(assignment.dueDate), nextWeek)
    )
    .sort((a, b) => {
      const dateA = parseISO(a.dueDate);
      const dateB = parseISO(b.dueDate);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, MAX_ASSIGNMENTS_SHOWN);

  // Filter today's assignments
  const todayAssignments = assignments
    .filter(assignment => 
      !assignment.completed && 
      assignment.dueDate && 
      parseISO(assignment.dueDate).toDateString() === now.toDateString()
    )
    .sort((a, b) => {
      const dateA = parseISO(a.dueDate);
      const dateB = parseISO(b.dueDate);
      return dateA.getTime() - dateB.getTime();
    });

  // Ensure we have a color for each category
  const getCategoryColor = (categoryId?: string): string => {
    if (!categoryId) return '#4285F4';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : '#4285F4';
  };

  // Get category name
  const getCategoryName = (categoryId?: string): string => {
    if (!categoryId) return 'Без категории';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Без категории';
  };

  // Calculate days until assignment
  const getDaysUntil = (dateString: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDayLabel = (days: number): string => {
    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Завтра';
    return `${days} ${days === 1 ? 'день' : days > 1 && days < 5 ? 'дня' : 'дней'}`;
  };

  return (
    <Paper elevation={0} sx={{ 
      mt: 0, 
      p: 0, 
      borderRadius: 0,
      backgroundColor: 'white',
      borderTop: '1px solid rgba(0, 0, 0, 0.05)',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        px: 2,
        py: 1.5,
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        borderBottom: 1, 
        borderColor: 'divider'
      }}>
        <AssignmentIcon color="primary" fontSize="small" />
        <Typography variant="subtitle2" fontWeight={600} color="primary.main">
          Ближайшие задания
        </Typography>
      </Box>
      
      <Box sx={{ p: 1.5 }}>
        {todayAssignments.length > 0 && (
          <>
            <Typography variant="subtitle2" fontWeight={500} color="text.secondary" gutterBottom>
              На сегодня
            </Typography>
            
            <List dense disablePadding sx={{ mb: 2 }}>
              {todayAssignments.map((assignment) => (
                <ListItem
                  key={assignment.id}
                  disablePadding
                  sx={{
                    py: 1,
                    borderRadius: 1,
                    mb: 0.5,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.01)'
                    }
                  }}
                >
                  <Checkbox
                    checked={assignment.completed}
                    onChange={() => onToggleComplete(assignment.id)}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={500}>
                        {assignment.title}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Chip
                          label={getCategoryName(assignment.categoryId)}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.6875rem',
                            backgroundColor: `${getCategoryColor(assignment.categoryId)}20`,
                            color: getCategoryColor(assignment.categoryId),
                            mr: 1
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {format(parseISO(assignment.dueDate), 'HH:mm')}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
        
        <Typography variant="subtitle2" fontWeight={500} color="text.secondary" gutterBottom>
          Предстоящие
        </Typography>
        
        {upcomingAssignments.length > 0 ? (
          <List dense disablePadding>
            {upcomingAssignments.map((assignment) => {
              const daysUntil = getDaysUntil(assignment.dueDate);
              
              return (
                <ListItem
                  key={assignment.id}
                  disablePadding
                  sx={{
                    py: 1,
                    borderRadius: 1,
                    mb: 0.5,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.01)'
                    }
                  }}
                >
                  <Checkbox
                    checked={assignment.completed}
                    onChange={() => onToggleComplete(assignment.id)}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight={500}>
                          {assignment.title}
                        </Typography>
                        <Chip
                          label={getDayLabel(daysUntil)}
                          size="small"
                          color={daysUntil <= 1 ? "error" : daysUntil <= 3 ? "warning" : "primary"}
                          variant="outlined"
                          sx={{
                            height: 22,
                            fontSize: '0.6875rem'
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Chip
                          label={getCategoryName(assignment.categoryId)}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.6875rem',
                            backgroundColor: `${getCategoryColor(assignment.categoryId)}20`,
                            color: getCategoryColor(assignment.categoryId)
                          }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            Нет предстоящих заданий на ближайшие 7 дней
          </Typography>
        )}
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="text" 
            color="primary" 
            size="small" 
            onClick={onViewAllAssignments}
            endIcon={<ChevronRightIcon />}
          >
            Все задания
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default UpcomingAssignments; 