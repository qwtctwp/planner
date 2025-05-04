import React from 'react';
import { Box, Typography, LinearProgress, Paper, Grid, Chip } from '@mui/material';
import { TodoItem } from '../types';
import { CheckCircle as CheckCircleIcon, AccessTime as AccessTimeIcon, Flag as FlagIcon } from '@mui/icons-material';

interface TasksStatsProps {
  todos: TodoItem[];
}

const TasksStats: React.FC<TasksStatsProps> = ({ todos }) => {
  // Рассчитываем статистику
  const completedTasks = todos.filter(todo => todo.completed).length;
  const totalTasks = todos.length;
  const completionPercentage = totalTasks > 0 ? Math.floor((completedTasks / totalTasks) * 100) : 0;
  
  const highPriorityTasks = todos.filter(todo => todo.priority === 'high' && !todo.completed).length;
  const mediumPriorityTasks = todos.filter(todo => todo.priority === 'medium' && !todo.completed).length;
  const lowPriorityTasks = todos.filter(todo => todo.priority === 'low' && !todo.completed).length;
  
  return (
    <Paper elevation={0} sx={{ 
      mt: 2, 
      p: 2, 
      borderRadius: 2,
      backgroundColor: 'rgba(127, 120, 210, 0.03)',
      border: '1px solid rgba(127, 120, 210, 0.05)'
    }}>
      <Typography variant="subtitle2" fontWeight={500} color="primary.main" gutterBottom>
        Прогресс выполнения
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {completedTasks} из {totalTasks} задач выполнено
          </Typography>
          <Typography variant="body2" fontWeight={500} color="primary.main">
            {completionPercentage}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={completionPercentage} 
          sx={{ 
            height: 6, 
            borderRadius: 3,
            backgroundColor: 'rgba(127, 120, 210, 0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: 'var(--primary-color)'
            }
          }}
        />
      </Box>
      
      <Grid container spacing={1}>
        <Grid item xs={4}>
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Chip 
              icon={<FlagIcon sx={{ fontSize: '0.9rem !important', color: 'error.main !important' }} />}
              label={highPriorityTasks}
              size="small"
              sx={{ 
                fontWeight: 600,
                backgroundColor: 'rgba(239, 118, 122, 0.1)',
                color: 'error.main',
                width: '100%'
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              Важных
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Chip 
              icon={<AccessTimeIcon sx={{ fontSize: '0.9rem !important', color: 'warning.main !important' }} />}
              label={mediumPriorityTasks}
              size="small"
              sx={{ 
                fontWeight: 600,
                backgroundColor: 'rgba(255, 209, 102, 0.1)',
                color: 'warning.main',
                width: '100%'
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              Средних
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Chip 
              icon={<CheckCircleIcon sx={{ fontSize: '0.9rem !important', color: 'success.main !important' }} />}
              label={lowPriorityTasks}
              size="small"
              sx={{ 
                fontWeight: 600,
                backgroundColor: 'rgba(139, 196, 138, 0.1)',
                color: 'success.main',
                width: '100%'
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              Простых
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TasksStats; 