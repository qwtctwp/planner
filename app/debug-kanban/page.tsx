'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress,
  TextField,
  Card,
  CardContent,
  Divider,
  Grid,
  Alert,
  Snackbar 
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { 
  getCategoriesForUser, 
  getAssignmentsForUser,
  updateAssignment,
  addAssignment,
  deleteAssignment
} from '../lib/api';
import { Category, Assignment, AssignmentStatus } from '../types';
import { useRouter } from 'next/navigation';

export default function DebugKanbanPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>('');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Debug data for creating a new assignment
  const [newAssignment, setNewAssignment] = useState<{
    title: string;
    description: string;
    categoryId: string;
    status: AssignmentStatus;
  }>({
    title: 'Тестовое задание',
    description: 'Описание тестового задания',
    categoryId: '',
    status: 'todo'
  });
  
  // Debug data for updating assignment
  const [updateData, setUpdateData] = useState<{
    assignmentId: string;
    status: AssignmentStatus;
  }>({
    assignmentId: '',
    status: 'in_progress'
  });

  // Check authentication
  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
      setUserId(user.id.toString());
      console.log('User authenticated:', user);
    } else {
      setIsAuthenticated(false);
      setUserId('');
      console.log('User not authenticated');
    }
  }, [user]);
  
  // Get data when user changes
  useEffect(() => {
    if (isAuthenticated && userId) {
      loadUserData();
    }
  }, [isAuthenticated, userId]);
  
  useEffect(() => {
    // Redirect to dashboard
    router.push('/dashboard');
  }, [router]);
  
  const loadUserData = async () => {
    try {
      setLoading(true);
      console.log('Loading data for user ID:', userId);
      
      // Get categories
      const userCategories = await getCategoriesForUser(parseInt(userId));
      console.log('Loaded categories:', userCategories);
      setCategories(userCategories);
      
      if (userCategories.length > 0) {
        setNewAssignment(prev => ({
          ...prev,
          categoryId: userCategories[0].id
        }));
      }
      
      // Get assignments
      const userAssignments = await getAssignmentsForUser(parseInt(userId));
      console.log('Loaded assignments:', userAssignments);
      setAssignments(userAssignments);
      
      if (userAssignments.length > 0) {
        setUpdateData(prev => ({
          ...prev,
          assignmentId: userAssignments[0].id
        }));
      }
      
      setSuccessMessage('Данные успешно загружены');
    } catch (error) {
      console.error('Error loading data:', error);
      setErrorMessage('Ошибка при загрузке данных: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateAssignment = async () => {
    try {
      console.log('Creating new assignment:', newAssignment);
      
      const result = await addAssignment(parseInt(userId), {
        ...newAssignment,
        dueDate: new Date().toISOString(),
        lessonId: undefined
      });
      
      console.log('Assignment created with ID:', result);
      setSuccessMessage(`Задание успешно создано с ID: ${result}`);
      
      // Reload assignments
      loadUserData();
    } catch (error) {
      console.error('Error creating assignment:', error);
      setErrorMessage('Ошибка при создании задания: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    }
  };
  
  const handleUpdateAssignment = async () => {
    try {
      console.log('Updating assignment:', updateData);
      
      const result = await updateAssignment(updateData.assignmentId, {
        status: updateData.status,
        completed: updateData.status === 'done'
      });
      
      console.log('Assignment updated:', result);
      setSuccessMessage('Задание успешно обновлено');
      
      // Reload assignments
      loadUserData();
    } catch (error) {
      console.error('Error updating assignment:', error);
      setErrorMessage('Ошибка при обновлении задания: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    }
  };
  
  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      console.log('Deleting assignment:', assignmentId);
      
      await deleteAssignment(assignmentId);
      
      console.log('Assignment deleted');
      setSuccessMessage('Задание успешно удалено');
      
      // Reload assignments
      loadUserData();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setErrorMessage('Ошибка при удалении задания: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Отладка Канбан-доски
      </Typography>
      
      {/* Authentication status */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Статус аутентификации
        </Typography>
        {isAuthenticated ? (
          <Alert severity="success">
            Вы авторизованы. ID пользователя: {userId}
          </Alert>
        ) : (
          <Alert severity="warning">
            Вы не авторизованы. Пожалуйста, войдите в систему.
          </Alert>
        )}
      </Paper>
      
      {isAuthenticated && (
        <>
          {/* Data display */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Данные
            </Typography>
            
            <Button 
              variant="contained" 
              onClick={loadUserData} 
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Загрузить данные'}
            </Button>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Категории ({categories.length})
                </Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {categories.map(category => (
                    <Box key={category.id} sx={{ mb: 1 }}>
                      <Typography>
                        ID: {category.id}, Название: {category.name}, Цвет: {category.color}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Задания ({assignments.length})
                </Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {assignments.map(assignment => (
                    <Card key={assignment.id} sx={{ mb: 1 }}>
                      <CardContent>
                        <Typography variant="body1">
                          ID: {assignment.id}
                        </Typography>
                        <Typography variant="body1">
                          Название: {assignment.title}
                        </Typography>
                        <Typography variant="body2">
                          Статус: {assignment.status || (assignment.completed ? 'done' : 'todo')}
                        </Typography>
                        <Typography variant="body2">
                          Завершено: {assignment.completed ? 'Да' : 'Нет'}
                        </Typography>
                        <Button 
                          size="small" 
                          color="error" 
                          onClick={() => handleDeleteAssignment(assignment.id)}
                        >
                          Удалить
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Create assignment */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Создать задание
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Название"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Описание"
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Категория"
                  value={newAssignment.categoryId}
                  onChange={(e) => setNewAssignment({ ...newAssignment, categoryId: e.target.value })}
                  fullWidth
                  margin="normal"
                  SelectProps={{
                    native: true,
                  }}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Статус"
                  value={newAssignment.status}
                  onChange={(e) => setNewAssignment({ ...newAssignment, status: e.target.value as AssignmentStatus })}
                  fullWidth
                  margin="normal"
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="todo">К выполнению</option>
                  <option value="in_progress">В процессе</option>
                  <option value="on_hold">Отложено</option>
                  <option value="done">Выполнено</option>
                </TextField>
              </Grid>
            </Grid>
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleCreateAssignment}
              sx={{ mt: 2 }}
            >
              Создать задание
            </Button>
          </Paper>
          
          {/* Update assignment */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Обновить задание
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Задание"
                  value={updateData.assignmentId}
                  onChange={(e) => setUpdateData({ ...updateData, assignmentId: e.target.value })}
                  fullWidth
                  margin="normal"
                  SelectProps={{
                    native: true,
                  }}
                >
                  {assignments.map(assignment => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.title} (ID: {assignment.id})
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Новый статус"
                  value={updateData.status}
                  onChange={(e) => setUpdateData({ ...updateData, status: e.target.value as AssignmentStatus })}
                  fullWidth
                  margin="normal"
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="todo">К выполнению</option>
                  <option value="in_progress">В процессе</option>
                  <option value="on_hold">Отложено</option>
                  <option value="done">Выполнено</option>
                </TextField>
              </Grid>
            </Grid>
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleUpdateAssignment}
              sx={{ mt: 2 }}
              disabled={!updateData.assignmentId}
            >
              Обновить задание
            </Button>
          </Paper>
        </>
      )}
      
      {/* Message handling */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
      >
        <Alert severity="error" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
      >
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
} 