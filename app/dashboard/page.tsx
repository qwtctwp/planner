'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar,
  Typography,
  Fab,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Assignment as AssignmentIcon,
  Category as CategoryIcon,
  Add as AddIcon,
  AccountCircle,
  ExitToApp,
  Book as BookIcon,
  CalendarMonth as CalendarIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import Calendar from '../components/Calendar';
import SimpleCalendar from '../components/SimpleCalendar';
import ResourceCalendar from '../components/ResourceCalendar';
import SimpleTimeCalendar from '../components/SimpleTimeCalendar';
import BasicCalendar from '../components/BasicCalendar';
import FixedTimeCalendar from '../components/FixedTimeCalendar';
import WorkingCalendar from '../components/WorkingCalendar';
import LoadChart from '../components/LoadChart';
import AssignmentList from '../components/AssignmentList';
import CategoryManager from '../components/CategoryManager';
import LessonDialog from '../components/LessonDialog';
import AssignmentDialog from '../components/AssignmentDialog';
import TodoList from '../components/TodoList';
import UpcomingAssignments from '../components/UpcomingAssignments';
import SideBar from '../components/SideBar';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { useAuth } from '../contexts/AuthContext';
import { ViewType, Lesson, Category, Assignment, TodoItem } from '../types';
import useClientOnly from '../hooks/useClientOnly';
import useURLState from '../hooks/useURLState';
import {
  getCategoriesForUser,
  getLessonsForUser,
  getAssignmentsForUser,
  getTodosForUser,
  addCategory,
  updateCategory,
  deleteCategory,
  addLesson,
  updateLesson,
  deleteLesson,
  addAssignment,
  updateAssignment,
  deleteAssignment,
  addTodo,
  updateTodo,
  deleteTodo
} from '../lib/api';

export default function Dashboard() {
  const { user, userData, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isClient, setIsClient] = useState(false);
  
  // Используем useURLState для синхронизации активной страницы с URL-параметром
  const [viewParam, setViewParam] = useURLState('view', null);
  const [activePage, setActivePage] = useState('dashboard');

  const [view, setView] = useState<ViewType>('week');
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loadData, setLoadData] = useState<{ date: Date; hours: number }[]>([]);
  
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ start: Date; end: Date } | null>(null);
  
  // Состояние для меню пользователя
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Безопасная проверка, находимся ли мы на клиенте
  useEffect(() => {
    setIsClient(true);
    
    // Определение активной страницы на основе URL
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as ViewType | null;
    
    if (viewParam && ['day', 'week', 'month'].includes(viewParam)) {
      setView(viewParam);
      setActivePage('calendar');
    } else {
      setActivePage('dashboard');
    }
  }, []);

  // Update URL when view changes (только на клиенте)
  useEffect(() => {
    if (!isClient) return;
    
    if (activePage === 'calendar') {
      setViewParam(view);
    } else {
      setViewParam(null);
    }
  }, [view, activePage, isClient, setViewParam]);

  // Load user data
  useEffect(() => {
    if (user) {
      const loadUserData = async () => {
        try {
          const userCategories = await getCategoriesForUser(user.id);
          const userLessons = await getLessonsForUser(user.id);
          const userAssignments = await getAssignmentsForUser(user.id);
          const userTodos = await getTodosForUser(user.id);
          
          setCategories(userCategories);
          setLessons(userLessons);
          setAssignments(userAssignments);
          setTodos(userTodos);
          
          // Calculate and set loadData with fresh lessons data
          const newLoadData = userLessons.reduce((acc, lesson) => {
            const date = new Date(lesson.start);
            const dateStr = date.toISOString().split('T')[0];
            const hours = (new Date(lesson.end).getTime() - new Date(lesson.start).getTime()) / (1000 * 60 * 60);
            
            const existingDay = acc.find(d => d.date.toISOString().split('T')[0] === dateStr);
            if (existingDay) {
              existingDay.hours += hours;
            } else {
              acc.push({ date, hours });
            }
            return acc;
          }, [] as { date: Date; hours: number }[]);
          
          setLoadData(newLoadData);
        } catch (error) {
          console.error('Ошибка при загрузке данных:', error);
        }
      };
      
      loadUserData();
    }
  }, [user]);

  // Update loadData when lessons change
  useEffect(() => {
    // Calculate and set loadData with fresh lessons data
    const newLoadData = lessons.reduce((acc, lesson) => {
      const date = new Date(lesson.start);
      const dateStr = date.toISOString().split('T')[0];
      const hours = (new Date(lesson.end).getTime() - new Date(lesson.start).getTime()) / (1000 * 60 * 60);
      
      const existingDay = acc.find(d => d.date.toISOString().split('T')[0] === dateStr);
      if (existingDay) {
        existingDay.hours += hours;
      } else {
        acc.push({ date, hours });
      }
      return acc;
    }, [] as { date: Date; hours: number }[]);
    
    setLoadData(newLoadData);
  }, [lessons]);

  // Create a method to switch between views from the sidebar
  const handlePageChange = (page: string) => {
    setActivePage(page);
    if (page === 'calendar') {
      // Update URL with the current view
      setViewParam(view);
    } else {
      // Clear view parameter for other pages
      setViewParam(null);
    }
  };

  const handleAddCategory = async (category: Omit<Category, 'id'>) => {
    if (!user) return;
    
    try {
      const categoryId = await addCategory(user.id, category);
      const newCategory = {
        ...category,
        id: categoryId
      };
      setCategories([...categories, newCategory]);
    } catch (error) {
      console.error('Ошибка при добавлении категории:', error);
    }
  };

  const handleEditCategory = async (category: Category) => {
    if (!user) return;
    
    try {
      await updateCategory(category.id, category);
      setCategories(categories.map(c => c.id === category.id ? category : c));
    } catch (error) {
      console.error('Ошибка при обновлении категории:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!user) return;
    
    try {
      await deleteCategory(categoryId);
      setCategories(categories.filter(c => c.id !== categoryId));
    } catch (error) {
      console.error('Ошибка при удалении категории:', error);
    }
  };

  const handleToggleAssignment = async (assignmentId: string) => {
    if (!user) return;
    
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    
    try {
      const updatedAssignment = { ...assignment, completed: !assignment.completed };
      await updateAssignment(assignmentId, updatedAssignment);
      setAssignments(assignments.map(a =>
        a.id === assignmentId ? updatedAssignment : a
      ));
    } catch (error) {
      console.error('Ошибка при обновлении задания:', error);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!user) return;
    
    try {
      await deleteAssignment(assignmentId);
      setAssignments(assignments.filter(a => a.id !== assignmentId));
    } catch (error) {
      console.error('Ошибка при удалении задания:', error);
    }
  };

  const handleAddLesson = async (lessonData: Omit<Lesson, 'id' | 'assignments'>) => {
    if (!user) return;
    
    try {
      const newLessonData = {
        ...lessonData,
        assignments: []
      };
      
      const lessonId = await addLesson(user.id, newLessonData);
      const newLesson: Lesson = {
        ...newLessonData,
        id: lessonId
      };
      
      setLessons([...lessons, newLesson]);
    } catch (error) {
      console.error('Ошибка при добавлении урока:', error);
    }
  };
  
  // Обновление существующего урока
  const handleUpdateLesson = async (lessonId: string, lessonData: Omit<Lesson, 'id' | 'assignments'>) => {
    if (!user) return;
    
    try {
      console.log('Обновление урока:', lessonId, lessonData);
      await updateLesson(lessonId, lessonData);
      
      // Find the existing lesson to preserve its assignments
      const existingLesson = lessons.find(l => l.id === lessonId);
      
      const updatedLesson: Lesson = {
        ...lessonData,
        id: lessonId,
        assignments: existingLesson?.assignments || []
      };
      
      setLessons(lessons.map(l => l.id === lessonId ? updatedLesson : l));
      setLessonDialogOpen(false);
    } catch (error) {
      console.error('Ошибка при обновлении урока:', error);
    }
  };
  
  // Удаление урока
  const handleDeleteLesson = async (lesson: Lesson) => {
    if (!user) return;
    
    try {
      console.log('Удаление урока:', lesson.id);
      await deleteLesson(lesson.id);
      setLessons(lessons.filter(l => l.id !== lesson.id));
    } catch (error) {
      console.error('Ошибка при удалении урока:', error);
    }
  };

  const handleAddAssignment = async (assignmentData: Omit<Assignment, 'id' | 'completed'>) => {
    if (!user) return;
    
    try {
      console.log('Добавление задания:', assignmentData);
      
      const newAssignmentData = {
        ...assignmentData,
        completed: false
      };
      
      console.log('Отправка данных:', newAssignmentData);
      
      const assignmentId = await addAssignment(user.id, newAssignmentData);
      console.log('Получен ID задания:', assignmentId);
      
      const newAssignment: Assignment = {
        ...newAssignmentData,
        id: assignmentId
      };
      
      console.log('Новое задание:', newAssignment);
      
      setAssignments([...assignments, newAssignment]);
      
      // Update the lesson with the new assignment ID
      if (assignmentData.lessonId) {
        const lesson = lessons.find(l => l.id === assignmentData.lessonId);
        if (lesson) {
          const updatedLesson = {
            ...lesson,
            assignments: [...lesson.assignments, assignmentId]
          };
          
          await updateLesson(lesson.id, updatedLesson);
          setLessons(lessons.map(l =>
            l.id === assignmentData.lessonId ? updatedLesson : l
          ));
        }
      }
    } catch (error) {
      console.error('Ошибка при добавлении задания:', error);
    }
  };

  const handleEventClick = (lesson: Lesson, event?: React.MouseEvent) => {
    // Regular click now always opens assignments dialog
    setSelectedLesson(lesson);
    setAssignmentDialogOpen(true);
  };

  const handleDateSelect = (start: Date, end: Date) => {
    setSelectedDate({ start, end });
    setLessonDialogOpen(true);
  };

  const handleAddTodo = async (todo: Omit<TodoItem, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      // Добавляем текущую дату для createdAt
      const todoData = {
        ...todo,
        createdAt: new Date().toISOString()
      };
      
      const todoId = await addTodo(user.id, todoData);
      const newTodo: TodoItem = {
        ...todoData,
        id: todoId
      };
      
      setTodos([...todos, newTodo]);
    } catch (error) {
      console.error('Ошибка при добавлении задачи:', error);
    }
  };

  const handleToggleTodo = async (id: string) => {
    if (!user) return;
    
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    try {
      const updatedTodo = { ...todo, completed: !todo.completed };
      await updateTodo(id, updatedTodo);
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
    } catch (error) {
      console.error('Ошибка при обновлении задачи:', error);
    }
  };

  const handleEditTodo = async (id: string, todoData: Partial<TodoItem>) => {
    if (!user) return;
    
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    try {
      const updatedTodo = { ...todo, ...todoData };
      await updateTodo(id, updatedTodo);
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
    } catch (error) {
      console.error('Ошибка при обновлении задачи:', error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!user) return;
    
    try {
      await deleteTodo(id);
      setTodos(todos.filter(t => t.id !== id));
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error);
    }
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    try {
      await logout();
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  const handleAddAssignmentClick = () => {
    setSelectedLesson(null);
    setAssignmentDialogOpen(true);
  };

  const drawerWidth = 240;

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
          boxShadow: '0 2px 10px rgba(165, 199, 228, 0.1)',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2, color: '#2A5A84' }}
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
              color: '#84A7C4' // Using the dark pastel blue color
            }}
          >
            Личный планер
          </Typography>
          
          <IconButton
            onClick={handleOpenUserMenu}
            color="inherit"
          >
            <Avatar 
              sx={{ 
                bgcolor: '#A5C7E4', // Main pastel blue
                width: 36,
                height: 36
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'У'}
            </Avatar>
          </IconButton>
          
          <Menu
            id="user-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleCloseUserMenu}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{
              '& .MuiPaper-root': {
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(165, 199, 228, 0.15)',
                mt: 1.5,
                width: 200,
              }
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2A5A84' }}>
                {user?.name || 'Пользователь'}
              </Typography>
              <Typography variant="body2" color="#5E7E99">
                {user?.email || 'user@example.com'}
              </Typography>
            </Box>
            
            <Divider sx={{ borderColor: 'rgba(165, 199, 228, 0.15)' }} />
            
            <MenuItem onClick={handleLogout} sx={{ gap: 1.5 }}>
              <ExitToApp fontSize="small" sx={{ color: '#84A7C4' }} />
              <Typography variant="body2" sx={{ color: '#5E7E99' }}>Выйти</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Side drawer */}
      <SideBar
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={drawerWidth}
      />

      {/* Main content */}
      {isClient ? (
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
          {/* Only show calendar controls when needed */}
          {activePage === 'calendar' && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 2 }}>
              <div></div> {/* Пустой div для сохранения выравнивания */}
              <ToggleButtonGroup
                value={view}
                exclusive
                onChange={(event, newValue) => {
                  if (newValue !== null) {
                    setView(newValue);
                    // Update URL with the current view using our useURLState hook
                    if (isClient) {
                      setViewParam(newValue);
                    }
                  }
                }}
                aria-label="calendar view"
                sx={{ 
                  '& .MuiToggleButton-root': { 
                    border: '1px solid rgba(165, 199, 228, 0.2)',
                    borderRadius: '8px !important',
                    mx: 0.5,
                    color: '#5E7E99',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&.Mui-selected': {
                      backgroundColor: '#A5C7E4',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#84A7C4',
                      }
                    }
                  }
                }}
              >
                <ToggleButton value="day">День</ToggleButton>
                <ToggleButton value="week">Неделя</ToggleButton>
                <ToggleButton value="month">Месяц</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}

          {/* Main Content Area */}
          <Grid container spacing={2} sx={{ mt: activePage === 'dashboard' ? 1 : 0 }}>
            {/* Calendar View */}
            {activePage === 'calendar' && (
              <Grid item xs={12} sx={{ width: '100%' }}>
                <Paper 
                  sx={{ 
                    p: 0,
                    overflow: 'hidden', 
                    height: {
                      xs: 700,
                      md: 800
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    boxShadow: '0 2px 10px rgba(165, 199, 228, 0.1)',
                    width: '100%',
                  }}
                >
                  <WorkingCalendar
                    events={lessons.map(lesson => {
                      const category = categories.find(c => c.id === lesson.categoryId);
                      return {
                        id: lesson.id,
                        title: lesson.title,
                        start: new Date(lesson.start),
                        end: new Date(lesson.end),
                        backgroundColor: category ? category.color : '#84A7C4'
                      };
                    })}
                    onEventClick={(eventId, jsEvent) => {
                      const lesson = lessons.find(l => l.id === eventId);
                      if (lesson) {
                        handleEventClick(lesson, jsEvent);
                      }
                    }}
                    onSelectSlot={(start, end) => handleDateSelect(start, end)}
                    onEventDrop={(eventId, newStart, newEnd) => {
                      const lesson = lessons.find(l => l.id === eventId);
                      if (lesson && user) {
                        const updatedLesson = {
                          ...lesson,
                          start: newStart,
                          end: newEnd
                        };
                        handleUpdateLesson(eventId, updatedLesson);
                      }
                    }}
                  />
                </Paper>
              </Grid>
            )}
            
            {/* Dashboard View */}
            {activePage === 'dashboard' && (
              <>
                {/* Left Column - Calendar and Chart */}
                <Grid item xs={12} md={8}>
                  {/* Calendar */}
                  <Paper 
                    sx={{ 
                      p: 0, 
                      mb: 2.5,
                      overflow: 'hidden',
                      borderRadius: 2,
                      boxShadow: '0 2px 10px rgba(165, 199, 228, 0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                      height: { xs: 450, md: 500 },
                      width: '100%',
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 2, 
                        backgroundColor: '#F2F7FB',
                        borderBottom: '1px solid',
                        borderColor: 'rgba(165, 199, 228, 0.15)'
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          color: '#2A5A84'
                        }}
                      >
                        <CalendarIcon sx={{ color: '#84A7C4' }} fontSize="small" />
                        Расписание занятий
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      flex: 1, 
                      display: 'flex',
                      overflow: 'hidden',
                      minHeight: 0, // Important for flex child to prevent overflow issues
                      width: '100%', // Ensure full width
                    }}
                    className="dashboard-calendar"
                    >
                      <WorkingCalendar
                        events={lessons.map(lesson => {
                          const category = categories.find(c => c.id === lesson.categoryId);
                          return {
                            id: lesson.id,
                            title: lesson.title,
                            start: new Date(lesson.start),
                            end: new Date(lesson.end),
                            backgroundColor: category ? category.color : '#84A7C4'
                          };
                        })}
                        onEventClick={(eventId, jsEvent) => {
                          const lesson = lessons.find(l => l.id === eventId);
                          if (lesson) {
                            handleEventClick(lesson, jsEvent);
                          }
                        }}
                        onSelectSlot={(start, end) => handleDateSelect(start, end)}
                        onEventDrop={(eventId, newStart, newEnd) => {
                          const lesson = lessons.find(l => l.id === eventId);
                          if (lesson && user) {
                            const updatedLesson = {
                              ...lesson,
                              start: newStart,
                              end: newEnd
                            };
                            handleUpdateLesson(eventId, updatedLesson);
                          }
                        }}
                      />
                    </Box>
                  </Paper>
                  
                  {/* Load Chart */}
                  <Paper 
                    sx={{ 
                      p: 0,
                      overflow: 'hidden',
                      borderRadius: 2,
                      boxShadow: '0 2px 10px rgba(165, 199, 228, 0.1)',
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 2, 
                        backgroundColor: '#F2F7FB',
                        borderBottom: '1px solid',
                        borderColor: 'rgba(165, 199, 228, 0.15)'
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          color: '#2A5A84'
                        }}
                      >
                        <DashboardIcon sx={{ color: '#84A7C4' }} fontSize="small" />
                        Нагрузка по дням
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2, height: { xs: 300, md: 250 } }}>
                      <LoadChart data={loadData} />
                    </Box>
                  </Paper>
                </Grid>
                
                {/* Right Column - Todo list */}
                <Grid item xs={12} md={4}>
                  <Paper 
                    sx={{ 
                      p: 0,
                      height: {
                        xs: 'auto',
                        md: '730px'
                      }, // Высота соответствует сумме календаря и графика
                      maxHeight: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      borderRadius: 2,
                      boxShadow: '0 2px 10px rgba(165, 199, 228, 0.1)',
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 2, 
                        backgroundColor: '#F2F7FB',
                        borderBottom: '1px solid',
                        borderColor: 'rgba(165, 199, 228, 0.15)'
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600, 
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          color: '#2A5A84'
                        }}
                      >
                        <AssignmentIcon sx={{ color: '#84A7C4' }} fontSize="small" />
                        Мои задачи
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      p: 0,
                      flexGrow: 1,
                      overflow: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '60%' // Корректируем пропорцию для более сбалансированного вида
                    }}>
                      <TodoList
                        todos={todos}
                        onAdd={handleAddTodo}
                        onToggleComplete={handleToggleTodo}
                        onEdit={handleEditTodo}
                        onDelete={handleDeleteTodo}
                        isCompactView={false}
                      />
                    </Box>
                    
                    {/* Предстоящие задания */}
                    <Box sx={{ pb: 0 }}>
                      <UpcomingAssignments
                        assignments={assignments}
                        categories={categories}
                        onToggleComplete={handleToggleAssignment}
                        onViewAllAssignments={() => handlePageChange('assignments')}
                      />
                    </Box>
                  </Paper>
                </Grid>
              </>
            )}
            
            {/* Assignments View */}
            {activePage === 'assignments' && (
              <Grid item xs={12}>
                <Paper 
                  sx={{ p: 0, overflow: 'hidden', borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}
                >
                  <Box 
                    sx={{ 
                      p: 2, 
                      backgroundColor: '#F9FAFC',
                      borderBottom: '1px solid',
                      borderColor: 'rgba(0,0,0,0.05)'
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <AssignmentIcon color="primary" fontSize="small" />
                      Задания по предметам
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <AssignmentList
                      assignments={assignments}
                      categories={categories}
                      onToggleComplete={handleToggleAssignment}
                      onEdit={(id, data) => {
                        console.log('Edit assignment', id, data);
                        // You could implement this with updateAssignment(id, data) if needed
                      }}
                      onDelete={handleDeleteAssignment}
                      onAdd={handleAddAssignment}
                      lessons={lessons}
                    />
                  </Box>
                </Paper>
              </Grid>
            )}
            
            {/* Categories View */}
            {activePage === 'categories' && (
              <Grid item xs={12}>
                <Paper 
                  sx={{ p: 0, overflow: 'hidden', borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}
                >
                  <Box 
                    sx={{ 
                      p: 2, 
                      backgroundColor: '#F9FAFC',
                      borderBottom: '1px solid',
                      borderColor: 'rgba(0,0,0,0.05)'
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <CategoryIcon color="primary" fontSize="small" />
                      Управление категориями
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <CategoryManager
                      categories={categories}
                      onAdd={handleAddCategory}
                      onEdit={handleEditCategory}
                      onDelete={handleDeleteCategory}
                    />
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
          
          {/* Floating Action Button */}
          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              boxShadow: '0 6px 15px rgba(165, 199, 228, 0.4)',
              backgroundColor: '#A5C7E4',
              '&:hover': {
                backgroundColor: '#84A7C4'
              }
            }}
            onClick={() => {
              if (activePage === 'calendar') {
                setSelectedLesson(null);
                setLessonDialogOpen(true);
              } else if (activePage === 'assignments') {
                handleAddAssignmentClick();
              }
            }}
          >
            <AddIcon />
          </Fab>
          
          {/* Dialogs */}
          <LessonDialog
            open={lessonDialogOpen}
            onClose={() => setLessonDialogOpen(false)}
            onSave={(lessonData, existingLessonId) => {
              if (existingLessonId) {
                handleUpdateLesson(existingLessonId, lessonData);
              } else {
                handleAddLesson(lessonData);
              }
            }}
            categories={categories}
            initialData={selectedLesson ?? undefined}
            initialDate={selectedDate ?? undefined}
          />
          
          <AssignmentDialog
            open={assignmentDialogOpen}
            onClose={() => setAssignmentDialogOpen(false)}
            onSave={handleAddAssignment}
            categories={categories}
            lessons={lessons}
          />
        </Box>
      ) : null}
    </Box>
  );
} 