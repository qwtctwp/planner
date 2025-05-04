import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  Avatar,
  IconButton,
  InputAdornment
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { Assignment, Lesson, Category } from '../types';
import { format } from 'date-fns';
import {
  Assignment as AssignmentIcon,
  Close as CloseIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

interface AssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (assignment: Omit<Assignment, 'id' | 'completed'>) => void;
  categories: Category[];
  lessons: Lesson[];
  initialData?: Assignment;
}

const AssignmentDialog: React.FC<AssignmentDialogProps> = ({
  open,
  onClose,
  onSave,
  categories,
  lessons,
  initialData
}) => {
  const [lessonId, setLessonId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  
  // Initialize form with initial data if provided
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setDueDate(new Date(initialData.dueDate));
      setLessonId(initialData.lessonId || '');
    } else {
      resetForm();
    }
  }, [initialData, open]);
  
  // Автоматическое обновление названия и срока сдачи при выборе урока
  useEffect(() => {
    if (lessonId && !initialData) {
      const selectedLesson = lessons.find(lesson => lesson.id === lessonId);
      if (selectedLesson) {
        setTitle(selectedLesson.title);
        
        // Устанавливаем срок сдачи на следующий день после занятия
        const nextDay = new Date(selectedLesson.end);
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(23, 59, 0, 0); // Устанавливаем время на 23:59
        setDueDate(nextDay);
      }
    }
  }, [lessonId, lessons, initialData]);

  const handleSave = () => {
    // Больше не нужно определять categoryId, так как его нет в таблице заданий
    
    onSave({
      title,
      description,
      dueDate: dueDate.toISOString(),
      lessonId: lessonId || null
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate(new Date());
    setLessonId('');
  };

  // Найдем категорию для выбранного урока
  const selectedLesson = lessons.find(lesson => lesson.id === lessonId);
  const effectiveCategoryId = selectedLesson?.categoryId || '';
  const selectedCategory = categories.find(cat => cat.id === effectiveCategoryId);
  
  return (
    <Dialog 
      open={open} 
      onClose={() => {
        resetForm();
        onClose();
      }}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '16px 24px',
        bgcolor: selectedCategory ? selectedCategory.color + '20' : 'transparent',
        borderBottom: '1px solid #f1f3f4',
      }}>
        <Avatar 
          sx={{ 
            bgcolor: selectedCategory?.color || '#4285F4',
            mr: 1.5,
            width: 32,
            height: 32 
          }}
        >
          <AssignmentIcon fontSize="small" />
        </Avatar>
        <Typography variant="h6" sx={{ flex: 1, fontWeight: 500 }}>
          {initialData ? 'Редактировать задание' : 'Новое домашнее задание'}
        </Typography>
        <IconButton onClick={onClose} edge="end" size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {!initialData && (
          <FormControl fullWidth variant="outlined" sx={{ mb: 1 }}>
            <InputLabel>Привязать к занятию</InputLabel>
            <Select
              value={lessonId}
              label="Привязать к занятию"
              onChange={(e) => setLessonId(e.target.value as string)}
              sx={{ 
                borderRadius: 1,
                "& .MuiSelect-select": {
                  display: 'flex',
                  alignItems: 'center'
                }
              }}
            >
                <MenuItem value="">
                  <em>Не привязывать к занятию</em>
                </MenuItem>
              {lessons.map((lesson) => {
                const category = categories.find(c => c.id === lesson.categoryId);
                return (
                  <MenuItem
                    key={lesson.id}
                    value={lesson.id}
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: category?.color || '#4285F4',
                        mr: 1.5
                      }} 
                    />
                    <Box>
                      <Typography variant="body1">{lesson.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(lesson.start), 'dd.MM.yyyy, HH:mm')}
                      </Typography>
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          )}

          <TextField
            label="Название задания"
            placeholder={!initialData && lessonId ? "Название наследуется из выбранного занятия" : "Введите название задания"}
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            variant="outlined"
            disabled={!initialData && !!lessonId}
            InputProps={{
              sx: { borderRadius: 1 }
            }}
          />
          
          <TextField
            label="Описание"
            placeholder="Введите описание задания"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="outlined"
            InputProps={{
              sx: { borderRadius: 1 },
              startAdornment: (
                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                  <DescriptionIcon color="action" />
                </InputAdornment>
              )
            }}
          />
          
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
            <DateTimePicker
              label="Срок сдачи"
              value={dueDate}
              onChange={(newValue) => newValue && setDueDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                  InputProps: {
                    sx: { borderRadius: 1 }
                  }
                }
              }}
            />
          </LocalizationProvider>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Отмена
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={!title.trim()}
          sx={{ 
            bgcolor: selectedCategory?.color || '#4285F4',
            '&:hover': {
              bgcolor: selectedCategory?.color ? selectedCategory.color + 'dd' : '#3367d6',
            }
          }}
        >
          {initialData ? 'Сохранить' : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignmentDialog; 