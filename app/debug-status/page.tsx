'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  TextField,
  Alert,
  Snackbar 
} from '@mui/material';
import { updateAssignment } from '../lib/api';
import { AssignmentStatus } from '../types';

export default function DebugStatusPage() {
  const [assignmentId, setAssignmentId] = useState<string>('');
  const [status, setStatus] = useState<AssignmentStatus>('in_progress');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [requestResult, setRequestResult] = useState<any>(null);
  
  const handleUpdateStatus = async () => {
    if (!assignmentId) {
      setErrorMessage('Пожалуйста, введите ID задания');
      return;
    }
    
    try {
      console.log(`Updating assignment ${assignmentId} status to ${status}`);
      
      // Создаем минимальные данные для обновления
      const updateData = {
        status,
        completed: status === 'done'
      };
      
      console.log('Update data:', updateData);
      
      // Вызываем API для обновления
      const result = await updateAssignment(assignmentId, updateData);
      
      console.log('API response:', result);
      setRequestResult(result);
      setSuccessMessage(`Статус задания ${assignmentId} успешно обновлен на ${status}`);
    } catch (error) {
      console.error('Error updating assignment status:', error);
      setErrorMessage(`Ошибка при обновлении статуса: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      setRequestResult(error);
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Отладка обновления статуса задания
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Обновить статус задания
        </Typography>
        
        <TextField
          label="ID задания"
          fullWidth
          margin="normal"
          value={assignmentId}
          onChange={(e) => setAssignmentId(e.target.value)}
        />
        
        <TextField
          select
          label="Статус"
          fullWidth
          margin="normal"
          value={status}
          onChange={(e) => setStatus(e.target.value as AssignmentStatus)}
          SelectProps={{
            native: true,
          }}
        >
          <option value="todo">К выполнению</option>
          <option value="in_progress">В процессе</option>
          <option value="on_hold">Отложено</option>
          <option value="done">Выполнено</option>
        </TextField>
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleUpdateStatus}
          sx={{ mt: 2 }}
        >
          Обновить статус
        </Button>
      </Paper>
      
      {requestResult && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Результат запроса
          </Typography>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(requestResult, null, 2)}
          </pre>
        </Paper>
      )}
      
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