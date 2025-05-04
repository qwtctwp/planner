import React, { useState } from 'react';
import {
  Paper,
  Grid,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import { Category } from '../types';

// Цвета для выбора
const PRESET_COLORS = [
  '#4285F4', // Синий
  '#EA4335', // Красный
  '#34A853', // Зеленый
  '#FBBC05', // Желтый
  '#00897B', // Бирюзовый
  '#9C27B0', // Фиолетовый
  '#FF7043', // Оранжевый
  '#EC407A', // Розовый
  '#616161', // Серый
  '#795548', // Коричневый
  '#A5C7E4'  // Пастельный синий (новый основной цвет)
];

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (category: Omit<Category, 'id'>) => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onAdd,
  onEdit,
  onDelete
}) => {
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]); // Default blue

  const handleOpen = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setColor(category.color);
    } else {
      setEditingCategory(null);
      setName('');
      setColor(PRESET_COLORS[0]); // Default blue
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCategory(null);
  };

  const handleSave = () => {
    if (editingCategory) {
      // При редактировании обновляем только имя и цвет
      onEdit({ ...editingCategory, name, color });
    } else {
      // При создании новой категории
      onAdd({ name, color, userId: '1' });
    }
    handleClose();
  };

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
          <Grid item>
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#A5C7E4' }}>
              Ваши категории
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
              sx={{ 
                bgcolor: '#A5C7E4', 
                '&:hover': { bgcolor: '#84A7C4' } 
              }}
            >
              Добавить категорию
            </Button>
          </Grid>
        </Grid>
        
        <Grid container spacing={2}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Paper 
                sx={{
                  p: 2,
                  borderLeft: `4px solid ${category.color}`,
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'var(--paper-color)',
                  boxShadow: '0 1px 5px rgba(165, 199, 228, 0.1)',
                  border: '1px solid rgba(165, 199, 228, 0.08)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(165, 199, 228, 0.15)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        width: 24, 
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: category.color,
                        marginRight: 2,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Typography variant="subtitle1" fontWeight={500} sx={{ color: 'rgb(var(--foreground-rgb))' }}>
                      {category.name}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(category)}
                      sx={{ mr: 1, color: '#A5C7E4' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(category.id)}
                      sx={{ color: '#e57373' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'var(--paper-color)',
            color: 'rgb(var(--foreground-rgb))',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(165, 199, 228, 0.15)'
          }
        }}
      >
        <DialogTitle sx={{ color: '#A5C7E4', fontWeight: 500 }}>
          {editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название категории"
            placeholder="Например: Математика, Английский язык, Робототехника"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="outlined"
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(165, 199, 228, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(165, 199, 228, 0.4)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#A5C7E4',
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
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="color-select-label">Цвет</InputLabel>
            <Select
              labelId="color-select-label"
              id="color-select"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              label="Цвет"
              IconComponent={ArrowDownIcon}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(165, 199, 228, 0.2)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(165, 199, 228, 0.4)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#A5C7E4',
                },
              }}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 20, 
                      height: 20, 
                      borderRadius: '50%', 
                      bgcolor: selected, 
                      mr: 1,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Typography>{selected}</Typography>
                </Box>
              )}
            >
              {PRESET_COLORS.map((presetColor) => (
                <MenuItem key={presetColor} value={presetColor}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box 
                      sx={{ 
                        width: 20, 
                        height: 20, 
                        borderRadius: '50%', 
                        bgcolor: presetColor, 
                        mr: 1,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Typography>{presetColor}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'rgba(165, 199, 228, 0.05)' }}>
          <Button 
            onClick={handleClose}
            sx={{ color: 'rgba(0, 0, 0, 0.6)' }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={!name}
            sx={{ 
              bgcolor: '#A5C7E4', 
              '&:hover': { bgcolor: '#84A7C4' },
              '&.Mui-disabled': {
                bgcolor: 'rgba(165, 199, 228, 0.3)',
                color: 'rgba(255, 255, 255, 0.7)'
              }
            }}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CategoryManager; 