'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
  Fab
} from '@mui/material';
import {
  Menu as MenuIcon,
  Add as AddIcon,
  ExitToApp,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import Calendar from '../components/Calendar';
import LessonDialog from '../components/LessonDialog';
import AssignmentDialog from '../components/AssignmentDialog';
import SideBar from '../components/SideBar';
import { useAuth } from '../contexts/AuthContext';
import { ViewType, Lesson, Category, Assignment } from '../types';
import {
  getCategoriesForUser,
  getEventsForUser,
  getAssignmentsForUser,
  addEvent,
  updateEvent,
  deleteEvent,
  addAssignment,
} from '../lib/api';
import SimpleCalendar from '../components/SimpleCalendar';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';
import MinimalCalendar from '../components/MinimalCalendar';
import FixedCalendar from '../components/FixedCalendar';
import ResourceCalendar from '../components/ResourceCalendar';
import SimpleTimeCalendar from '../components/SimpleTimeCalendar';
import BasicCalendar from '../components/BasicCalendar';
import FixedTimeCalendar from '../components/FixedTimeCalendar';
import WorkingCalendar from '../components/WorkingCalendar';

export default function CalendarPage() {
  const { user, userData, logout } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isClient, setIsClient] = useState(false);

  const [view, setView] = useState<ViewType>('week');
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ start: Date; end: Date } | null>(null);
  
  // Состояние для меню пользователя
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Use a ref for the calendar
  const calendarRef = useRef<FullCalendar>(null);

  // Track event for context menu
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    lesson: Lesson | null;
  } | null>(null);
  
  // Новое состояние для модального меню действий с событием
  const [eventActionMenu, setEventActionMenu] = useState<{
    mouseX: number;
    mouseY: number;
    lesson: Lesson | null;
  } | null>(null);

  // Log state for debugging
  useEffect(() => {
    if (isClient) {
      console.log('Rendering calendar with:', {
        view,
        lessonsLength: lessons.length,
        categories,
      });
    }
  }, [isClient, view, lessons, categories]);

  // Load user data with better error handling
  useEffect(() => {
    if (user) {
      const loadUserData = async () => {
        try {
          console.log('Fetching user data for:', user.id);
          const userCategories = await getCategoriesForUser(user.id);
          console.log('Categories loaded:', userCategories);
          
          const userLessons = await getEventsForUser(user.id);
          console.log('Lessons loaded:', userLessons);
          console.log('Lessons data structure check:', userLessons.length > 0 ? 
            {firstLesson: userLessons[0], startType: typeof userLessons[0]?.start, endType: typeof userLessons[0]?.end} : 'No lessons');
          
          const userAssignments = await getAssignmentsForUser(user.id);
          console.log('Assignments loaded:', userAssignments);
          
          setCategories(userCategories);
          setLessons(userLessons);
          setAssignments(userAssignments);
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      };
      
      loadUserData();
    }
  }, [user]);

  // Проверка на клиентский рендеринг
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Add effect to refresh calendar after loading
  useEffect(() => {
    if (isClient && calendarRef.current) {
      setTimeout(() => {
        calendarRef.current?.getApi().updateSize();
      }, 100);
    }
  }, [isClient, view, lessons]);

  // Handle event click - отображение меню выбора действий вместо сразу открытия диалога задания
  const handleEventClick = (lesson: Lesson, mouseX: number, mouseY: number) => {
    // Открываем меню выбора действий вместо сразу диалога
    setEventActionMenu({
      mouseX,
      mouseY,
      lesson
    });
  };
  
  // Закрытие меню выбора действий
  const handleCloseEventActionMenu = () => {
    setEventActionMenu(null);
  };
  
  // Обработка выбора "Добавить задание"
  const handleAddAssignmentOption = () => {
    if (eventActionMenu?.lesson && eventActionMenu.lesson.id) {
      setSelectedLesson(eventActionMenu.lesson);
      setAssignmentDialogOpen(true);
    }
    handleCloseEventActionMenu();
  };
  
  // Обработка выбора "Редактировать событие"
  const handleEditEventOption = () => {
    if (eventActionMenu?.lesson) {
      setSelectedLesson(eventActionMenu.lesson);
      setLessonDialogOpen(true);
    }
    handleCloseEventActionMenu();
  };
  
  // Обработка выбора "Удалить событие"
  const handleDeleteEventOption = () => {
    if (eventActionMenu?.lesson) {
      handleDeleteLesson(eventActionMenu.lesson);
    }
    handleCloseEventActionMenu();
  };

  const handleDateSelect = (start: Date, end: Date) => {
    setSelectedDate({ start, end });
    setSelectedLesson(null);
    setLessonDialogOpen(true);
  };

  const handleAddLesson = async (lessonData: Omit<Lesson, 'id' | 'assignments'>) => {
    if (!user) return;
    
    try {
      const newLessonData = {
        ...lessonData,
        assignments: []
      };
      
      const lessonId = await addEvent(user.id, newLessonData);
      const newLesson: Lesson = {
        ...newLessonData,
        id: lessonId
      };
      
      setLessons([...lessons, newLesson]);
      setSelectedLesson(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('Ошибка при добавлении урока:', error);
    }
  };
  
  const handleUpdateLesson = async (lessonId: string, lessonData: Omit<Lesson, 'id' | 'assignments'> | Partial<Lesson>) => {
    if (!user) return;
    
    try {
      console.log('Обновление урока:', lessonId, lessonData);
      
      // Find the existing lesson to preserve its assignments
      const existingLesson = lessons.find(l => l.id === lessonId);
      if (!existingLesson) {
        console.error('Урок для обновления не найден:', lessonId);
        return;
      }
      
      // Отправляем данные на сервер через API
      await updateEvent(lessonId, lessonData);
      
      // После успешного обновления на сервере обновляем локальное состояние
      // Создаем новый объект с обновленными данными, сохраняя существующие assignments
      const updatedLesson: Lesson = {
        ...existingLesson,
        ...lessonData,
        id: lessonId
      };
      
      setLessons(lessons.map(l => l.id === lessonId ? updatedLesson : l));
      setLessonDialogOpen(false);
      setSelectedLesson(null);
    } catch (error) {
      console.error('Ошибка при обновлении урока:', error);
    }
  };
  
  const handleDeleteLesson = async (lesson: Lesson) => {
    if (!user) return;
    
    try {
      await deleteEvent(lesson.id);
      setLessons(lessons.filter(l => l.id !== lesson.id));
    } catch (error) {
      console.error('Ошибка при удалении урока:', error);
    }
  };

  const handleAddAssignment = async (assignmentData: Omit<Assignment, 'id' | 'completed'>) => {
    if (!user) return;
    
    try {
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
      
      // Update the lesson with the new assignment ID
      if (assignmentData.lessonId) {
        const lesson = lessons.find(l => l.id === assignmentData.lessonId);
        if (lesson) {
          const updatedLesson = {
            ...lesson,
            assignments: [...lesson.assignments, assignmentId]
          };
          
          await updateEvent(lesson.id, updatedLesson);
          setLessons(lessons.map(l =>
            l.id === assignmentData.lessonId ? updatedLesson : l
          ));
        }
      }
    } catch (error) {
      console.error('Ошибка при добавлении задания:', error);
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

  // Prepare events for the calendar with better error handling
  const calendarEvents = React.useMemo(() => {
    try {
      console.log('Преобразование уроков в события календаря, количество:', lessons.length);
      
      const events = lessons.map(lesson => {
        // Find category for this lesson
        const category = categories.find(c => c.id === lesson.categoryId);
        console.log('Обработка урока:', lesson.id, 'с началом:', lesson.start, 'типа:', typeof lesson.start);
        
        try {
          const startDate = new Date(lesson.start);
          const endDate = new Date(lesson.end);
          console.log('Преобразованные даты:', startDate, endDate, 'Валидность:', !isNaN(startDate.getTime()), !isNaN(endDate.getTime()));
          
          return {
            id: lesson.id,
            title: lesson.title,
            start: startDate,
            end: endDate,
            backgroundColor: category ? category.color : '#84A7C4',
            extendedProps: { lesson }
          };
        } catch (dateError) {
          console.error('Ошибка при преобразовании дат для урока:', lesson.id, dateError);
          return null;
        }
      }).filter(Boolean) as any[]; // Исправлено для типизации
      
      console.log('События календаря после преобразования:', events.length);
      return events;
    } catch (error) {
      console.error('Error mapping lessons to events:', error);
      return [];
    }
  }, [lessons, categories]);

  // Handle right-click on event
  const handleEventRightClick = (event: React.MouseEvent, lesson: Lesson) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      lesson: lesson
    });
  };
  
  // Close context menu
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
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
        width={240}
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
          {/* Calendar */}
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
            {!user ? (
              <Box sx={{ p: 3, textAlign: 'center', color: '#5E7E99' }}>
                Пожалуйста, войдите в систему для просмотра календаря.
              </Box>
            ) : (
              <WorkingCalendar
                events={calendarEvents}
                onEventClick={(eventId, jsEvent) => {
                  const lesson = lessons.find(l => l.id === eventId);
                  if (lesson) {
                    if (jsEvent.type === 'contextmenu') {
                      jsEvent.preventDefault();
                      setContextMenu({
                        mouseX: jsEvent.clientX,
                        mouseY: jsEvent.clientY,
                        lesson: lesson
                      });
                    } else {
                      // Вместо сразу диалога, показываем меню с выбором действий
                      handleEventClick(lesson, jsEvent.clientX, jsEvent.clientY);
                    }
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
                    handleUpdateLesson(lesson.id, updatedLesson);
                  }
                }}
              />
            )}
          </Paper>

          {/* Контекстное меню (при правом клике) */}
          <Menu
            open={contextMenu !== null}
            onClose={handleCloseContextMenu}
            anchorReference="anchorPosition"
            anchorPosition={
              contextMenu !== null
                ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                : undefined
            }
          >
            <MenuItem
              onClick={() => {
                if (contextMenu?.lesson) {
                  setSelectedLesson(contextMenu.lesson);
                  setLessonDialogOpen(true);
                  handleCloseContextMenu();
                }
              }}
            >
              <Typography variant="body2">Редактировать</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (contextMenu?.lesson) {
                  handleDeleteLesson(contextMenu.lesson);
                  handleCloseContextMenu();
                }
              }}
            >
              <Typography variant="body2" sx={{ color: 'error.main' }}>Удалить</Typography>
            </MenuItem>
          </Menu>
          
          {/* Новое меню выбора действий (при обычном клике) */}
          <Menu
            open={eventActionMenu !== null}
            onClose={handleCloseEventActionMenu}
            anchorReference="anchorPosition"
            anchorPosition={
              eventActionMenu !== null
                ? { top: eventActionMenu.mouseY, left: eventActionMenu.mouseX }
                : undefined
            }
            PaperProps={{
              sx: { 
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(165, 199, 228, 0.15)',
                width: 240
              }
            }}
          >
            <MenuItem
              onClick={handleAddAssignmentOption}
              sx={{ 
                py: 1.5, 
                '&:hover': { 
                  backgroundColor: 'rgba(165, 199, 228, 0.1)' 
                },
                gap: 1.5 
              }}
            >
              <AssignmentIcon fontSize="small" sx={{ color: '#84A7C4' }} />
              <Typography variant="body2">Добавить домашнее задание</Typography>
            </MenuItem>
            <Divider sx={{ borderColor: 'rgba(165, 199, 228, 0.15)' }} />
            <MenuItem
              onClick={handleEditEventOption}
              sx={{ 
                py: 1.5,
                '&:hover': { 
                  backgroundColor: 'rgba(165, 199, 228, 0.1)' 
                },
                gap: 1.5
              }}
            >
              <EditIcon fontSize="small" sx={{ color: '#84A7C4' }} />
              <Typography variant="body2">Редактировать событие</Typography>
            </MenuItem>
            <MenuItem
              onClick={handleDeleteEventOption}
              sx={{ 
                py: 1.5,
                '&:hover': { 
                  backgroundColor: 'rgba(255, 200, 200, 0.1)' 
                },
                gap: 1.5
              }}
            >
              <DeleteIcon fontSize="small" sx={{ color: '#e57373' }} />
              <Typography variant="body2" sx={{ color: 'error.main' }}>Удалить событие</Typography>
            </MenuItem>
          </Menu>

          {/* Dialogs */}
          <LessonDialog
            open={lessonDialogOpen}
            onClose={() => {
              setLessonDialogOpen(false);
              setSelectedLesson(null);
              setSelectedDate(null);
            }}
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
            onClose={() => {
              setAssignmentDialogOpen(false);
              setSelectedLesson(null);
            }}
            onSave={handleAddAssignment}
            categories={categories}
            lessons={lessons}
            initialLesson={selectedLesson}
          />
          
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
              setSelectedLesson(null);
              setLessonDialogOpen(true);
            }}
          >
            <AddIcon />
          </Fab>
        </Box>
      ) : null}
    </Box>
  );
} 