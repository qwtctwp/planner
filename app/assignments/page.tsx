'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Chip,
  Divider,
  Button,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Event as EventIcon,
  Book as BookIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import SideBar from '../components/SideBar';
import AssignmentDialog from '../components/AssignmentDialog';
import { useAuth } from '../contexts/AuthContext';
import { 
  getAssignmentsForUser, 
  getCategoriesForUser,
  getLessonsForUser,
  updateAssignment,
  deleteAssignment,
  addAssignment
} from '../lib/api';
import { Assignment, Category, Lesson } from '../types';

export default function AssignmentsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const drawerWidth = 240;
  const [tabValue, setTabValue] = useState(0);
  const { user } = useAuth();
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Load data
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        try {
          setLoading(true);
          const [userAssignments, userCategories, userLessons] = await Promise.all([
            getAssignmentsForUser(user.id),
            getCategoriesForUser(user.id),
            getLessonsForUser(user.id)
          ]);
          
          setAssignments(userAssignments);
          setCategories(userCategories);
          setLessons(userLessons);
          setError(null);
        } catch (err) {
          console.error('Error loading data:', err);
          setError('Failed to load assignments. Please try again later.');
        } finally {
          setLoading(false);
        }
      };
      
      loadData();
    }
  }, [user]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      hour: '2-digit', 
      minute: '2-digit' 
    }).format(date);
  };
  
  const handleToggleComplete = async (assignment: Assignment) => {
    if (!user) return;
    
    try {
      const updatedAssignment = { 
        ...assignment, 
        completed: !assignment.completed 
      };
      
      await updateAssignment(assignment.id, updatedAssignment);
      
      setAssignments(assignments.map(a => 
        a.id === assignment.id ? updatedAssignment : a
      ));
    } catch (err) {
      console.error('Error toggling assignment completion:', err);
      setError('Failed to update assignment. Please try again.');
    }
  };
  
  const handleAddAssignment = () => {
    setSelectedAssignment(null);
    setAssignmentDialogOpen(true);
  };
  
  const handleEditAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setAssignmentDialogOpen(true);
  };
  
  const handleDeleteClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteAssignment = async () => {
    if (!selectedAssignment || !user) return;
    
    try {
      await deleteAssignment(selectedAssignment.id);
      setAssignments(assignments.filter(a => a.id !== selectedAssignment.id));
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error deleting assignment:', err);
      setError('Failed to delete assignment. Please try again.');
    }
  };
  
  const handleSaveAssignment = async (assignmentData: Omit<Assignment, 'id' | 'completed'>) => {
    if (!user) return;
    
    try {
      // If editing existing assignment
      if (selectedAssignment) {
        const updatedAssignment = {
          ...selectedAssignment,
          ...assignmentData
        };
        
        await updateAssignment(selectedAssignment.id, updatedAssignment);
        
        setAssignments(assignments.map(a => 
          a.id === selectedAssignment.id ? updatedAssignment : a
        ));
      } else {
        // Add new assignment
        const newAssignmentData = {
          ...assignmentData,
          completed: false
        };
        
        const assignmentId = await addAssignment(user.id, newAssignmentData);
        const newAssignment: Assignment = {
          ...newAssignmentData,
          id: assignmentId
        };
        
        setAssignments([...assignments, newAssignment]);
      }
      
      setAssignmentDialogOpen(false);
    } catch (err) {
      console.error('Error saving assignment:', err);
      setError('Failed to save assignment. Please try again.');
    }
  };

  const handleUpdateAssignment = async (assignmentId: string, data: Partial<Assignment>) => {
    if (!user) return;
    
    try {
      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment) {
        console.error('Assignment not found:', assignmentId);
        return;
      }
      
      const updatedAssignment = { ...assignment, ...data };
      
      // First update local state to give immediate feedback
      setAssignments(prev => prev.map(a => a.id === assignmentId ? updatedAssignment : a));
      
      // Then update in the backend
      const result = await updateAssignment(assignmentId, data);
      
      // If there was an error or the result is different from what we expected, update again with server data
      if (result) {
        setAssignments(prev => prev.map(a => a.id === assignmentId ? result : a));
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      // Revert to original state in case of error
      const originalAssignments = [...assignments];
      setAssignments(originalAssignments);
    }
  };

  const pendingAssignments = assignments.filter(a => !a.completed);
  const completedAssignments = assignments.filter(a => a.completed);

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
            Домашние задания
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddAssignment}
            sx={{ 
              bgcolor: 'var(--primary-color)',
              '&:hover': { bgcolor: 'var(--primary-color-dark)' },
              textTransform: 'none',
              borderRadius: 1
            }}
          >
            Добавить задание
          </Button>
        </Box>

        {/* Assignments section */}
        <Paper 
          sx={{ 
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
              <CircularProgress size={40} />
            </Box>
          ) : (
            <>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange}
                  sx={{ 
                    '& .MuiTabs-indicator': {
                      backgroundColor: 'var(--primary-color)',
                    },
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 500,
                      '&.Mui-selected': {
                        color: 'var(--primary-color)',
                        fontWeight: 600,
                      }
                    }
                  }}
                >
                  <Tab 
                    label={`Активные (${pendingAssignments.length})`} 
                    sx={{ py: 2, px: 3 }}
                  />
                  <Tab 
                    label={`Выполненные (${completedAssignments.length})`} 
                    sx={{ py: 2, px: 3 }}
                  />
                </Tabs>
              </Box>
              
              <Box>
                {tabValue === 0 && (
                  <List>
                    {pendingAssignments.map((assignment, index) => {
                      const category = categories.find(c => c.id === assignment.categoryId);
                      return (
                        <React.Fragment key={assignment.id}>
                          {index > 0 && <Divider />}
                          <ListItem 
                            sx={{ 
                              py: 2, 
                              borderLeft: `4px solid ${category?.color || '#808080'}`,
                              transition: 'background-color 0.2s',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                              }
                            }}
                          >
                            <ListItemIcon>
                              <Checkbox 
                                edge="start"
                                checked={assignment.completed}
                                onChange={() => handleToggleComplete(assignment)}
                                sx={{ 
                                  color: category?.color || '#808080',
                                  '&.Mui-checked': {
                                    color: category?.color || '#808080',
                                  }
                                }}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {assignment.title}
                                  </Typography>
                                  {category && (
                                    <Chip 
                                      size="small"
                                      label={category.name}
                                      sx={{ 
                                        bgcolor: `${category.color}15`,
                                        color: category.color,
                                        fontWeight: 500,
                                        fontSize: '0.75rem'
                                      }}
                                    />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  {assignment.description && (
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                      {assignment.description}
                                    </Typography>
                                  )}
                                  {assignment.dueDate && (
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                      <EventIcon fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                      Срок: {formatDate(assignment.dueDate)}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                            <Box sx={{ display: 'flex' }}>
                              <IconButton onClick={() => handleEditAssignment(assignment)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton onClick={() => handleDeleteClick(assignment)} color="error">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </ListItem>
                        </React.Fragment>
                      );
                    })}
                  </List>
                )}
                
                {tabValue === 1 && (
                  <List>
                    {completedAssignments.map((assignment, index) => {
                      const category = categories.find(c => c.id === assignment.categoryId);
                      return (
                        <React.Fragment key={assignment.id}>
                          {index > 0 && <Divider />}
                          <ListItem 
                            sx={{ 
                              py: 2, 
                              borderLeft: `4px solid ${category?.color || '#808080'}`,
                              transition: 'background-color 0.2s',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                              }
                            }}
                          >
                            <ListItemIcon>
                              <Checkbox 
                                edge="start"
                                checked={assignment.completed}
                                onChange={() => handleToggleComplete(assignment)}
                                sx={{ 
                                  color: category?.color || '#808080',
                                  '&.Mui-checked': {
                                    color: category?.color || '#808080',
                                  }
                                }}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <Typography 
                                    variant="subtitle1" 
                                    sx={{ 
                                      fontWeight: 600,
                                      textDecoration: 'line-through',
                                      color: 'text.secondary'
                                    }}
                                  >
                                    {assignment.title}
                                  </Typography>
                                  {category && (
                                    <Chip 
                                      size="small"
                                      label={category.name}
                                      sx={{ 
                                        bgcolor: `${category.color}15`,
                                        color: category.color,
                                        fontWeight: 500,
                                        fontSize: '0.75rem'
                                      }}
                                    />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  {assignment.description && (
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        color: 'text.secondary',
                                        textDecoration: 'line-through'
                                      }}
                                    >
                                      {assignment.description}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                            <Box sx={{ display: 'flex' }}>
                              <IconButton onClick={() => handleDeleteClick(assignment)} color="error">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </ListItem>
                        </React.Fragment>
                      );
                    })}
                  </List>
                )}
              </Box>
            </>
          )}
        </Paper>
        
        {/* Assignment dialog */}
        <AssignmentDialog
          open={assignmentDialogOpen}
          onClose={() => setAssignmentDialogOpen(false)}
          onSave={handleSaveAssignment}
          initialData={selectedAssignment || undefined}
          categories={categories}
          lessons={lessons}
        />
        
        {/* Delete confirmation dialog */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Удалить задание</DialogTitle>
          <DialogContent>
            <Typography>
              Вы уверены, что хотите удалить задание "{selectedAssignment?.title}"? Это действие нельзя отменить.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
            <Button 
              onClick={handleDeleteAssignment} 
              variant="contained" 
              color="error"
            >
              Удалить
            </Button>
          </DialogActions>
        </Dialog>
        
      </Box>
    </Box>
  );
} 