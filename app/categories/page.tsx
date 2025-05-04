'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { HexColorPicker } from 'react-colorful';
import SideBar from '../components/SideBar';
import { useAuth } from '../contexts/AuthContext';
import { Category } from '../types';
import { 
  getCategoriesForUser, 
  addCategory, 
  updateCategory, 
  deleteCategory 
} from '../lib/api';

export default function CategoriesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const drawerWidth = 240;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Form state
  const [formValues, setFormValues] = useState({
    name: '',
    color: '#4285F4'
  });
  
  // Fetch categories on component mount
  useEffect(() => {
    if (user) {
      const fetchCategories = async () => {
        try {
          setLoading(true);
          const data = await getCategoriesForUser(user.id);
          setCategories(data);
          setError(null);
        } catch (err) {
          console.error('Error fetching categories:', err);
          setError('Failed to load categories. Please try again later.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchCategories();
    }
  }, [user]);
  
  const handleAddClick = () => {
    setSelectedCategory(null);
    setFormValues({
      name: '',
      color: '#4285F4'
    });
    setDialogOpen(true);
  };

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setFormValues({
      name: category.name,
      color: category.color
    });
    setDialogOpen(true);
  };
  
  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };
  
  const handleFormChange = (field: string, value: string) => {
    setFormValues({
      ...formValues,
      [field]: value
    });
  };
  
  const handleSaveCategory = async () => {
    if (!user) return;
    
    try {
      if (selectedCategory) {
        // Update existing category
        await updateCategory(selectedCategory.id, {
          ...selectedCategory,
          name: formValues.name,
          color: formValues.color
        });
        
        setCategories(categories.map(c => 
          c.id === selectedCategory.id 
            ? { ...c, name: formValues.name, color: formValues.color }
            : c
        ));
      } else {
        // Add new category
        const newCategory = {
          name: formValues.name,
          color: formValues.color,
          userId: user.id.toString()
        };
        
        const categoryId = await addCategory(user.id, newCategory);
        setCategories([...categories, { id: categoryId, ...newCategory }]);
      }
      
      setDialogOpen(false);
      setError(null);
    } catch (err) {
      console.error('Error saving category:', err);
      setError('Failed to save category. Please try again.');
    }
  };
  
  const handleDeleteCategory = async () => {
    if (!selectedCategory || !user) return;
    
    try {
      await deleteCategory(selectedCategory.id);
      setCategories(categories.filter(c => c.id !== selectedCategory.id));
      setDeleteDialogOpen(false);
      setError(null);
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category. Please try again.');
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: 'background.default',
    }}>
      {/* AppBar with the header */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h5" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'primary.main'
            }}
          >
            Личный планер
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Side drawer */}
      <SideBar
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={drawerWidth}
      />

      {/* Main content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          p: 3, 
          pt: 0,
          overflow: 'auto',
          marginTop: '64px', // Height of the AppBar
        }}
      >
        {/* Page title */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 3 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: 'text.primary',
              letterSpacing: '-0.025em'
            }}
          >
            Категории
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            sx={{ 
              bgcolor: 'var(--primary-color)',
              '&:hover': { bgcolor: 'var(--primary-color-dark)' },
              textTransform: 'none',
              borderRadius: 1
            }}
          >
            Добавить категорию
          </Button>
        </Box>

        {/* Loading state */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : categories.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="body1" color="text.secondary">
              У вас пока нет категорий. Создайте первую категорию, нажав на кнопку выше.
            </Typography>
          </Paper>
        ) : (
          /* Categories grid */
          <Grid container spacing={3}>
            {categories.map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category.id}>
                <Card 
                  sx={{ 
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    overflow: 'hidden',
                    position: 'relative',
                    height: '100%',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '5px',
                      backgroundColor: category.color,
                    }
                  }}
                >
                  <CardContent sx={{ pt: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: '50%', 
                          bgcolor: category.color,
                          mr: 2
                        }} 
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {category.name}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEditClick(category)}
                      aria-label="edit category"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteClick(category)}
                      aria-label="delete category"
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* Add/Edit Category Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)}
          aria-labelledby="category-dialog-title"
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: '12px' }
          }}
        >
          <DialogTitle id="category-dialog-title" sx={{ fontWeight: 700, pt: 3 }}>
            {selectedCategory ? 'Редактировать категорию' : 'Добавить категорию'}
          </DialogTitle>
          <DialogContent sx={{ pb: 3 }}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Название категории"
              type="text"
              fullWidth
              variant="outlined"
              value={formValues.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              sx={{ mb: 3, mt: 1 }}
            />
            
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
              Цвет
            </Typography>

            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              mb: 3 
            }}>
              <HexColorPicker 
                color={formValues.color} 
                onChange={(color) => handleFormChange('color', color)} 
                style={{ width: '100%', maxWidth: '300px', marginBottom: '20px' }}
              />
              
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Box sx={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  backgroundColor: formValues.color,
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.1) inset'
                }} />
                
                <TextField
                  margin="dense"
                  id="color"
                  label="HEX код цвета"
                  type="text"
                  size="small"
                  value={formValues.color}
                  onChange={(e) => handleFormChange('color', e.target.value)}
                  sx={{ width: '140px' }}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)} sx={{ color: 'text.secondary' }}>
              Отмена
            </Button>
            <Button onClick={handleSaveCategory} variant="contained">
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          aria-labelledby="delete-dialog-title"
          PaperProps={{
            sx: { borderRadius: '12px' }
          }}
        >
          <DialogTitle id="delete-dialog-title" sx={{ fontWeight: 700, pt: 3 }}>
            Удалить категорию
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Вы уверены, что хотите удалить категорию "{selectedCategory?.name}"?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: 'text.secondary' }}>
              Отмена
            </Button>
            <Button onClick={handleDeleteCategory} variant="contained" color="error">
              Удалить
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Error Snackbar */}
        {error && (
          <Snackbar 
            open={!!error} 
            autoHideDuration={6000} 
            onClose={() => setError(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>
        )}
      </Box>
    </Box>
  );
} 