import React, { useState, useEffect, useRef } from 'react';
import { 
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  IconButton,
  Stack,
  styled
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { 
  format, 
  addDays, 
  startOfWeek, 
  startOfMonth,
  endOfMonth,
  addWeeks, 
  subWeeks, 
  addMonths,
  subMonths,
  isSameMonth,
  isToday, 
  isSameDay,
  setHours,
  setMinutes,
  addHours
} from 'date-fns';
import { ru } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  backgroundColor?: string;
  [key: string]: any;
}

interface WorkingCalendarProps {
  view?: 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth';
  events: Event[];
  onEventClick?: (eventId: string, jsEvent: React.MouseEvent) => void;
  onSelectSlot?: (start: Date, end: Date) => void;
  onEventDrop?: (eventId: string, newStart: Date, newEnd: Date) => void;
}

// Custom styled components
const CalendarContainer = styled(Box)({
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

const CalendarHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 16px',
  borderBottom: '1px solid #eee',
});

const TimeCell = styled(TableCell)({
  width: '70px',
  position: 'sticky',
  left: 0,
  background: 'white',
  zIndex: 2,
  borderRight: '1px solid #ddd',
  textAlign: 'right',
  padding: '4px 8px',
  fontSize: '0.8rem',
  color: '#555',
});

const DayCell = styled(TableCell)({
  width: 'calc((100% - 70px) / 7)',
  padding: '4px',
  position: 'relative',
  height: '60px',
  borderLeft: 'none',
  borderRight: '1px solid #eee',
});

const HeaderCell = styled(TableCell)(({ istoday }: { istoday?: boolean }) => ({
  borderBottom: '1px solid #ddd',
  background: istoday ? '#f0f8ff' : 'white',
  fontWeight: istoday ? 'bold' : 'normal',
  padding: '8px 4px',
  textAlign: 'center',
}));

const MonthCell = styled(TableCell)(({ istoday, iscurrentmonth }: { istoday?: boolean, iscurrentmonth?: boolean }) => ({
  height: '100px',
  width: 'calc(100% / 7)',
  padding: '4px',
  verticalAlign: 'top',
  background: istoday ? '#f0f8ff' : (iscurrentmonth ? 'white' : '#f9f9f9'),
  color: iscurrentmonth ? 'inherit' : '#999',
  position: 'relative',
}));

const EventItem = styled(Box)(({ bgcolor }: { bgcolor: string }) => ({
  position: 'absolute',
  width: 'calc(100% - 8px)',
  borderRadius: '4px',
  backgroundColor: bgcolor || '#84A7C4',
  color: 'white',
  fontSize: '0.8rem',
  padding: '2px 4px',
  overflow: 'hidden',
  cursor: 'move',
  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  zIndex: 1,
  '&:hover': {
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  '&.dragging': {
    opacity: 0.5,
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  }
}));

const MonthEventItem = styled(Box)(({ bgcolor }: { bgcolor: string }) => ({
  margin: '1px 0',
  padding: '1px 4px',
  fontSize: '0.7rem',
  borderRadius: '2px',
  backgroundColor: bgcolor || '#84A7C4',
  color: 'white',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  cursor: 'move',
  '&:hover': {
    opacity: 0.9,
  },
  '&.dragging': {
    opacity: 0.5,
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  }
}));

const ViewButton = styled(Button)<{ active?: boolean }>(({ active }) => ({
  backgroundColor: active ? '#84A7C4' : 'transparent',
  color: active ? 'white' : '#666',
  minWidth: '60px',
  '&:hover': {
    backgroundColor: active ? '#84A7C4' : '#f0f0f0',
  }
}));

// Main component
const WorkingCalendar: React.FC<WorkingCalendarProps> = ({ 
  view = 'timeGridWeek',
  events,
  onEventClick,
  onSelectSlot,
  onEventDrop
}) => {
  const [currentView, setCurrentView] = useState(view);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [firstDayOfWeek, setFirstDayOfWeek] = useState(startOfWeek(currentDate, { weekStartsOn: 1 }));
  const [monthStart, setMonthStart] = useState(startOfMonth(currentDate));
  
  // Drag and drop state
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [droppableHighlight, setDroppableHighlight] = useState<string | null>(null);
  
  useEffect(() => {
    setCurrentView(view);
  }, [view]);

  useEffect(() => {
    setFirstDayOfWeek(startOfWeek(currentDate, { weekStartsOn: 1 }));
    setMonthStart(startOfMonth(currentDate));
  }, [currentDate]);

  // Navigation handlers
  const handlePrev = () => {
    if (currentView === 'dayGridMonth') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (currentView === 'dayGridMonth') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(firstDayOfWeek, i));

  // Generate month grid
  const generateMonthGrid = () => {
    const firstDay = startOfMonth(currentDate);
    const start = startOfWeek(firstDay, { weekStartsOn: 1 });
    
    // Create 6 weeks (42 days) to ensure we cover all possibilities
    const daysArray = [];
    for (let i = 0; i < 42; i++) {
      daysArray.push(addDays(start, i));
    }
    
    // Split into weeks
    const weeksArray = [];
    for (let i = 0; i < 6; i++) {
      weeksArray.push(daysArray.slice(i * 7, (i + 1) * 7));
    }
    
    return weeksArray;
  };

  // Hours for the day (8am to 9pm)
  const hours = Array.from({ length: 14 }, (_, i) => i + 8);

  // Filter events for the current week
  const weekEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    return weekDays.some(day => isSameDay(day, eventDate));
  });

  // Get events for a specific day (month view)
  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return isSameDay(day, eventDate);
    });
  };

  // Get events for a specific day and hour
  const getEventsForTimeSlot = (day: Date, hour: number) => {
    return weekEvents.filter(event => {
      const eventDate = new Date(event.start);
      const eventHour = eventDate.getHours();
      return isSameDay(day, eventDate) && eventHour === hour;
    });
  };

  // Handle click on an empty cell to create new event
  const handleCellClick = (day: Date, hour?: number) => {
    if (onSelectSlot) {
      const start = new Date(day);
      if (hour !== undefined) {
        start.setHours(hour, 0, 0, 0);
      } else {
        start.setHours(12, 0, 0, 0); // Default to noon for month view
      }
      
      const end = new Date(start);
      if (hour !== undefined) {
        end.setHours(hour + 1, 0, 0, 0);
      } else {
        end.setHours(13, 0, 0, 0); // 1 hour duration by default
      }
      
      onSelectSlot(start, end);
    }
  };

  const handleViewChange = (newView: 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth') => {
    setCurrentView(newView);
  };
  
  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, event: Event) => {
    // Set the drag data - we'll use the event ID
    e.dataTransfer.setData('text/plain', event.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Visual indication
    if (e.currentTarget.classList) {
      e.currentTarget.classList.add('dragging');
    }
    
    // Store the dragged event
    setDraggedEvent(event);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLTableCellElement>, day: Date, hour?: number) => {
    // Prevent default to allow drop
    e.preventDefault();
    
    // Set visual indication
    const cellId = hour !== undefined ? `${day.toISOString()}-${hour}` : day.toISOString();
    setDroppableHighlight(cellId);
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLTableCellElement>) => {
    // Prevent default to allow drop
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDragLeave = () => {
    setDroppableHighlight(null);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLTableCellElement>, day: Date, hour?: number) => {
    e.preventDefault();
    
    // Get the event ID from drag data
    const eventId = e.dataTransfer.getData('text/plain');
    
    if (draggedEvent && onEventDrop) {
      // Create new start time
      const newStart = new Date(day);
      const originalStart = new Date(draggedEvent.start);
      const originalEnd = new Date(draggedEvent.end);
      
      if (hour !== undefined) {
        // Week view - preserve the original minutes
        const originalMinutes = originalStart.getMinutes();
        newStart.setHours(hour, originalMinutes, 0, 0);
      } else {
        // Month view - preserve original time of day
        const originalHours = originalStart.getHours();
        const originalMinutes = originalStart.getMinutes();
        newStart.setHours(originalHours, originalMinutes, 0, 0);
      }
      
      // Calculate duration and create new end time
      const duration = originalEnd.getTime() - originalStart.getTime();
      const newEnd = new Date(newStart.getTime() + duration);
      
      // Invoke drop callback
      onEventDrop(eventId, newStart, newEnd);
    }
    
    // Reset states
    setDraggedEvent(null);
    setDroppableHighlight(null);
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    // Clear visual indication
    if (e.currentTarget.classList) {
      e.currentTarget.classList.remove('dragging');
    }
    
    // Reset states if not dropped in a valid target
    setDraggedEvent(null);
    setDroppableHighlight(null);
  };

  const renderWeekView = () => (
    <TableContainer component={Paper} sx={{ flexGrow: 1, overflow: 'auto', boxShadow: 'none' }}>
      <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
        <TableHead>
          <TableRow>
            <TimeCell sx={{ backgroundColor: '#f9f9f9' }}></TimeCell>
            {weekDays.map((day, index) => (
              <HeaderCell 
                key={index} 
                istoday={isToday(day)}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: isToday(day) ? 'bold' : 'normal' }}>
                  {format(day, 'EEE', { locale: ru })}
                </Typography>
                <Typography variant="body2">
                  {format(day, 'd', { locale: ru })}
                </Typography>
              </HeaderCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {hours.map((hour) => (
            <TableRow key={hour} sx={{ height: '60px' }}>
              <TimeCell>
                {hour}:00
              </TimeCell>
              {weekDays.map((day, dayIndex) => {
                const eventsForSlot = getEventsForTimeSlot(day, hour);
                const cellId = `${day.toISOString()}-${hour}`;
                const isHighlighted = droppableHighlight === cellId;
                
                return (
                  <DayCell 
                    key={dayIndex}
                    onClick={() => handleCellClick(day, hour)}
                    sx={{ 
                      backgroundColor: isToday(day) ? '#fafcff' : 'white',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#f5f5f5'
                      },
                      ...(isHighlighted ? {
                        backgroundColor: '#e6f7ff',
                        border: '1px dashed #1890ff'
                      } : {})
                    }}
                    onDragOver={(e) => handleDragOver(e, day, hour)}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, day, hour)}
                  >
                    {eventsForSlot.map((event, eventIndex) => {
                      // Calculate event duration in minutes
                      const startTime = new Date(event.start);
                      const endTime = new Date(event.end);
                      const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
                      const durationHeight = (durationMinutes / 60) * 60; // 60px per hour
                      
                      return (
                        <EventItem
                          key={eventIndex}
                          bgcolor={event.backgroundColor || '#84A7C4'}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onEventClick) onEventClick(event.id, e);
                          }}
                          sx={{
                            top: ((startTime.getMinutes() / 60) * 60) + 'px',
                            height: durationHeight + 'px',
                          }}
                          draggable="true"
                          onDragStart={(e) => handleDragStart(e, event)}
                          onDragEnd={handleDragEnd}
                        >
                          {event.title}
                        </EventItem>
                      );
                    })}
                  </DayCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderMonthView = () => {
    const monthWeeks = generateMonthGrid();
    
    return (
      <TableContainer component={Paper} sx={{ flexGrow: 1, overflow: 'auto', boxShadow: 'none' }}>
        <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => (
                <HeaderCell key={index}>
                  <Typography variant="subtitle2">
                    {day}
                  </Typography>
                </HeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {monthWeeks.map((week, weekIndex) => (
              <TableRow key={weekIndex}>
                {week.map((day, dayIndex) => {
                  const eventsForDay = getEventsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const cellId = day.toISOString();
                  const isHighlighted = droppableHighlight === cellId;
                  
                  return (
                    <MonthCell
                      key={dayIndex}
                      istoday={isToday(day)}
                      iscurrentmonth={isCurrentMonth}
                      onClick={() => handleCellClick(day)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: isToday(day) ? '#e6f2ff' : (isCurrentMonth ? '#f5f5f5' : '#f0f0f0')
                        },
                        ...(isHighlighted ? {
                          backgroundColor: '#e6f7ff',
                          border: '1px dashed #1890ff'
                        } : {})
                      }}
                      onDragOver={(e) => handleDragOver(e, day)}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, day)}
                    >
                      <Typography variant="body2" sx={{ fontWeight: isToday(day) ? 'bold' : 'normal' }}>
                        {format(day, 'd')}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {eventsForDay.slice(0, 3).map((event, eventIndex) => (
                          <MonthEventItem
                            key={eventIndex}
                            bgcolor={event.backgroundColor || '#84A7C4'}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onEventClick) onEventClick(event.id, e);
                            }}
                            draggable="true"
                            onDragStart={(e) => handleDragStart(e, event)}
                            onDragEnd={handleDragEnd}
                          >
                            {event.title}
                          </MonthEventItem>
                        ))}
                        {eventsForDay.length > 3 && (
                          <Typography variant="caption" sx={{ display: 'block', color: '#666', ml: 1 }}>
                            +{eventsForDay.length - 3} ещё
                          </Typography>
                        )}
                      </Box>
                    </MonthCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <CalendarContainer>
      <CalendarHeader>
        <Stack direction="row" spacing={1}>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleToday}
          >
            Сегодня
          </Button>
          <IconButton size="small" onClick={handlePrev}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton size="small" onClick={handleNext}>
            <ChevronRightIcon />
          </IconButton>
        </Stack>
        
        <Typography variant="h6">
          {currentView === 'dayGridMonth' 
            ? format(monthStart, 'LLLL yyyy', { locale: ru })
            : format(firstDayOfWeek, 'LLLL yyyy', { locale: ru })
          }
        </Typography>
        
        <Stack direction="row" spacing={0.5}>
          <ViewButton 
            size="small" 
            active={currentView === 'dayGridMonth'}
            onClick={() => handleViewChange('dayGridMonth')}
          >
            Месяц
          </ViewButton>
          <ViewButton 
            size="small" 
            active={currentView === 'timeGridWeek'}
            onClick={() => handleViewChange('timeGridWeek')}
          >
            Неделя
          </ViewButton>
          <ViewButton 
            size="small" 
            active={currentView === 'timeGridDay'}
            onClick={() => handleViewChange('timeGridDay')}
          >
            День
          </ViewButton>
        </Stack>
      </CalendarHeader>
      
      {currentView === 'dayGridMonth' ? renderMonthView() : renderWeekView()}
    </CalendarContainer>
  );
};

export default WorkingCalendar; 