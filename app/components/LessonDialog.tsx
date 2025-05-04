import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Avatar,
  Typography,
  IconButton,
  Divider,
  InputAdornment
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { Category, Lesson } from '../types';
import {
  EventNote as EventIcon,
  Close as CloseIcon,
  Note as NoteIcon
} from '@mui/icons-material';

interface LessonDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (lesson: Omit<Lesson, 'id' | 'assignments'>, existingLessonId?: string) => void;
  categories: Category[];
  initialData?: Lesson;
  initialDate?: { start: Date; end: Date } | null;
}

const LessonDialog: React.FC<LessonDialogProps> = ({
  open,
  onClose,
  onSave,
  categories,
  initialData,
  initialDate
}) => {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState<Date>(new Date());
  const [end, setEnd] = useState<Date>(new Date());
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setStart(new Date(initialData.start));
      setEnd(new Date(initialData.end));
      setCategoryId(initialData.categoryId);
      setDescription(initialData.description || '');
    } else if (initialDate) {
      setTitle('');
      setStart(initialDate.start);
      setEnd(initialDate.end);
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setDescription('');
    } else {
      setTitle('');
      const now = new Date();
      const later = new Date(now.getTime() + 60 * 60 * 1000); // +1 час
      setStart(now);
      setEnd(later);
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setDescription('');
    }
  }, [initialData, initialDate, categories]);

  const handleSave = () => {
    const lessonData = {
      title,
      start,
      end,
      categoryId,
      description
    };

    // If editing an existing lesson, pass the ID
    if (initialData) {
      onSave(lessonData, initialData.id);
    } else {
      onSave(lessonData);
    }
    onClose();
  };

  const selectedCategory = categories.find(cat => cat.id === categoryId);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          backgroundColor: 'var(--paper-color)',
          boxShadow: '0 2px 10px rgba(127, 120, 210, 0.15)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '16px 24px',
        bgcolor: selectedCategory ? selectedCategory.color + '15' : 'transparent',
        borderBottom: '1px solid rgba(127, 120, 210, 0.1)',
        color: 'rgb(var(--foreground-rgb))'
      }}>
        <Avatar 
          sx={{ 
            bgcolor: selectedCategory?.color || 'var(--primary-color)',
            mr: 1.5,
            width: 32,
            height: 32 
          }}
        >
          <EventIcon fontSize="small" />
        </Avatar>
        <Typography variant="h6" sx={{ flex: 1, fontWeight: 500 }}>
          {initialData ? 'Редактировать занятие' : 'Новое занятие'}
        </Typography>
        <IconButton onClick={onClose} edge="end" size="small" sx={{ color: 'var(--dark-gray)' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, color: 'rgb(var(--foreground-rgb))' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Добавьте название"
            placeholder="Например: Лекция по математике"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            variant="outlined"
            autoFocus
            InputProps={{
              sx: { borderRadius: 1 }
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(127, 120, 210, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(127, 120, 210, 0.4)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'var(--primary-color)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'var(--dark-gray)',
              },
              '& .MuiInputBase-input': {
                color: 'rgb(var(--foreground-rgb))',
              }
            }}
          />

          <FormControl fullWidth variant="outlined" sx={{ mb: 1 }}>
            <InputLabel sx={{ color: 'var(--dark-gray)' }}>Категория</InputLabel>
            <Select
              value={categoryId}
              label="Категория"
              onChange={(e) => setCategoryId(e.target.value)}
              sx={{ 
                borderRadius: 1,
                "& .MuiSelect-select": {
                  display: 'flex',
                  alignItems: 'center',
                  color: 'rgb(var(--foreground-rgb))'
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(127, 120, 210, 0.2)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(127, 120, 210, 0.4)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--primary-color)',
                },
                '& .MuiSvgIcon-root': {
                  color: 'var(--dark-gray)',
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: 'var(--paper-color)',
                    backgroundImage: 'none',
                    boxShadow: '0 2px 10px rgba(127, 120, 210, 0.15)',
                    '& .MuiMenuItem-root': {
                      color: 'rgb(var(--foreground-rgb))'
                    },
                    '& .MuiMenuItem-root:hover': {
                      backgroundColor: 'rgba(127, 120, 210, 0.05)'
                    }
                  }
                }
              }}
            >
              {categories.map((category) => (
                <MenuItem
                  key={category.id}
                  value={category.id}
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <Box 
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: category.color,
                      mr: 1.5
                    }} 
                  />
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
            <DateTimePicker
              label="Начало"
              value={start}
              onChange={(newValue) => newValue && setStart(newValue)}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  fullWidth: true,
                  InputProps: {
                    sx: { borderRadius: 1 }
                  },
                  sx: { 
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(127, 120, 210, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(127, 120, 210, 0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--primary-color)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--dark-gray)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'rgb(var(--foreground-rgb))',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'var(--dark-gray)',
                    }
                  }
                }
              }}
            />
            <DateTimePicker
              label="Окончание"
              value={end}
              onChange={(newValue) => newValue && setEnd(newValue)}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  fullWidth: true,
                  InputProps: {
                    sx: { borderRadius: 1 }
                  },
                  sx: { 
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(127, 120, 210, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(127, 120, 210, 0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--primary-color)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--dark-gray)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'rgb(var(--foreground-rgb))',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'var(--dark-gray)',
                    }
                  }
                }
              }}
            />
          </LocalizationProvider>

          <TextField
            label="Описание"
            placeholder="Добавьте описание"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <NoteIcon fontSize="small" sx={{ color: 'var(--primary-color-light)' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 1 }
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(127, 120, 210, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(127, 120, 210, 0.4)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'var(--primary-color)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'var(--dark-gray)',
              },
              '& .MuiInputBase-input': {
                color: 'rgb(var(--foreground-rgb))',
              }
            }}
          />
        </Box>
      </DialogContent>

      <Divider sx={{ borderColor: 'rgba(127, 120, 210, 0.1)' }} />
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose}
          sx={{ 
            color: 'var(--dark-gray)',
            textTransform: 'none'
          }}
        >
          Отмена
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!title || !start || !end || !categoryId}
          sx={{ 
            bgcolor: 'var(--primary-color)',
            '&:hover': { bgcolor: 'var(--primary-color-dark)' },
            textTransform: 'none',
            borderRadius: 1,
            '&.Mui-disabled': { 
              bgcolor: 'rgba(127, 120, 210, 0.1)', 
              color: 'rgba(0, 0, 0, 0.3)' 
            }
          }}
        >
          {initialData ? 'Сохранить' : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LessonDialog; 