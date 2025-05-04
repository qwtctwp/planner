'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Snackbar,
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
import { Assignment, Lesson, Category, AssignmentStatus } from '../types';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { ru } from 'date-fns/locale';
import { useLocale } from '../contexts/LocaleContext';
import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import {
  Assignment as AssignmentIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  Event as EventIcon
} from '@mui/icons-material';

interface AssignmentEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (assignment: Omit<Assignment, 'id' | 'completed'>) => void;
  assignment?: Assignment;
  lessonId?: string;
  lessons?: Lesson[];
  categories?: Category[];
}

export default function AssignmentEditDialog({
  open,
  onClose,
  onSave,
  assignment,
  lessonId: initialLessonId,
  lessons = [],
  categories = []
}: AssignmentEditDialogProps) {
  const { t } = useLocale();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [lessonId, setLessonId] = useState<string>('');
  const [status, setStatus] = useState<AssignmentStatus>('todo');
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (assignment) {
      setTitle(assignment.title);
      setDescription(assignment.description);
      setLessonId(assignment.lessonId || '');
      setStatus(assignment.status || 'todo');
      try {
        // Правильное преобразование строки даты в объект Date
        const date = parseISO(assignment.dueDate);
        setDueDate(date);
      } catch (e) {
        console.error('Ошибка при парсинге даты:', e);
        setDueDate(new Date());
      }
    } else {
      setTitle('');
      setDescription('');
      setDueDate(new Date());
      setLessonId(initialLessonId || '');
      setStatus('todo');
    }
  }, [assignment, initialLessonId]);

  // Автоматическое обновление названия по выбранному занятию
  useEffect(() => {
    if (lessonId && !assignment) {
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
  }, [lessonId, lessons, assignment]);

  const handleSave = () => {
    if (!isValid) return;
    
    try {
      // Форматирование даты с учетом часового пояса
      const formattedDate = formatInTimeZone(
        dueDate,
        'Europe/Moscow', // Или можно использовать динамическое определение часового пояса
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
      );
      
      const assignmentData = {
        title,
        description,
        dueDate: formattedDate,
        status,
        categoryId: assignment?.categoryId || (selectedLesson?.categoryId || categories[0]?.id || '')
      };
      
      // Добавляем lessonId только если он предоставлен и не пустой
      if (lessonId && lessonId.trim() !== '') {
        Object.assign(assignmentData, { lessonId });
      }
      
      console.log('Сохранение задания с данными:', assignmentData);
      
      onSave(assignmentData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении задания:', error);
      setError(t('errorOccurred'));
      setShowError(true);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate(new Date());
    setLessonId('');
    setStatus('todo');
  };

  const isValid = title.trim() !== '' && dueDate instanceof Date && !isNaN(dueDate.getTime());

  // Найдем категорию для выбранного урока
  const selectedLesson = lessons.find(lesson => lesson.id === lessonId);
  const selectedCategory = selectedLesson 
    ? categories.find(cat => cat.id === selectedLesson.categoryId)
    : null;

  return (
    <>
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
            {assignment ? 'Редактировать задание' : 'Новое домашнее задание'}
          </Typography>
          <IconButton 
            onClick={() => {
              resetForm();
              onClose();
            }} 
            edge="end" 
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {lessons.length > 0 && (
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
                    <em>Без привязки</em>
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
              placeholder={lessonId ? "Название наследуется из выбранного занятия" : "Добавьте название задания"}
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
              disabled={!!lessonId && !assignment}
              autoFocus
              InputProps={{
                sx: { borderRadius: 1 }
              }}
            />
            
            <TextField
              label="Описание"
              placeholder="Опишите задание подробнее"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DescriptionIcon fontSize="small" sx={{ color: '#5F6368' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 1 }
              }}
            />
            
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>Статус</InputLabel>
              <Select
                value={status}
                label="Статус"
                onChange={(e) => setStatus(e.target.value as AssignmentStatus)}
              >
                <MenuItem value="todo">К выполнению</MenuItem>
                <MenuItem value="in_progress">В процессе</MenuItem>
                <MenuItem value="on_hold">Отложено</MenuItem>
                <MenuItem value="done">Выполнено</MenuItem>
              </Select>
            </FormControl>
            
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
              <DateTimePicker
                label="Срок сдачи"
                value={dueDate}
                onChange={(newValue) => newValue && setDueDate(newValue)}
                slotProps={{
                  textField: {
                    variant: 'outlined',
                    fullWidth: true,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EventIcon fontSize="small" sx={{ color: '#5F6368' }} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 1 }
                    },
                    helperText: lessonId ? "Срок по умолчанию - следующий день после занятия, 23:59" : ""
                  }
                }}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>

        <Divider />
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => {
              resetForm();
              onClose();
            }}
            sx={{ 
              color: '#5F6368',
              textTransform: 'none'
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isValid} 
            variant="contained"
            sx={{ 
              bgcolor: '#1a73e8',
              '&:hover': { bgcolor: '#1765cc' },
              textTransform: 'none',
              borderRadius: 1
            }}
          >
            {assignment ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={showError} 
        autoHideDuration={6000} 
        onClose={() => setShowError(false)}
      >
        <Alert 
          onClose={() => setShowError(false)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
} 