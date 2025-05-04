import React, { useState, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventDropArg } from '@fullcalendar/core';
import { Paper, Box } from '@mui/material';
import { ViewType, Lesson } from '../types';
import ruLocale from '@fullcalendar/core/locales/ru';
import EventContextMenu from './EventContextMenu';
import ConfirmationDialog from './ConfirmationDialog';
import '../fullcalendar.css';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps: {
    lesson: Lesson;
  };
}

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick: (event: Lesson, nativeEvent?: React.MouseEvent) => void;
  onSelectSlot: (start: Date, end: Date) => void;
  onEditEvent?: (lesson: Lesson) => void;
  onDeleteEvent?: (lesson: Lesson) => void;
  onEventDrop?: (lessonId: string, newStart: Date, newEnd: Date) => void;
  view: ViewType;
  headerHeight?: string;
  showNavigationButtons?: boolean;
  slotDuration?: string;
}

const Calendar: React.FC<CalendarProps> = ({
  events,
  onEventClick,
  onSelectSlot,
  onEditEvent,
  onDeleteEvent,
  onEventDrop,
  view,
  headerHeight,
  showNavigationButtons,
  slotDuration
}) => {
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const [selectedContextLesson, setSelectedContextLesson] = useState<Lesson | null>(null);
  
  // Confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  
  // Ref to access the calendar DOM
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // Handle right-click on event
  const handleEventContextMenu = useCallback((event: MouseEvent, lesson: Lesson) => {
    event.preventDefault();
    setSelectedContextLesson(lesson);
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
    });
  }, []);
  
  // Close context menu
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };
  
  // Handle edit from context menu
  const handleEditFromMenu = (lesson: Lesson) => {
    if (onEditEvent) {
      onEditEvent(lesson);
    }
  };
  
  // Handle showing delete confirmation
  const handleDeleteConfirm = (lesson: Lesson) => {
    setLessonToDelete(lesson);
    setDeleteConfirmOpen(true);
  };
  
  // Handle actual deletion
  const handleDeleteEvent = () => {
    if (lessonToDelete && onDeleteEvent) {
      onDeleteEvent(lessonToDelete);
      setDeleteConfirmOpen(false);
      setLessonToDelete(null);
    }
  };
  
  return (
    <Paper 
      sx={{ 
        p: 0, 
        borderRadius: 2, 
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(165, 199, 228, 0.1)',
        backgroundColor: '#FFFFFF',
        border: '1px solid rgba(165, 199, 228, 0.08)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ 
        height: '100%', 
        flex: 1,
        display: 'flex',
        position: 'relative',
      }}>
        <div style={{ width: '100%', height: '100%' }} className="calendar-container" ref={calendarRef}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={view === 'month' ? 'dayGridMonth' : view === 'week' ? 'timeGridWeek' : 'timeGridDay'}
            headerToolbar={{
              left: showNavigationButtons !== false ? 'prev,next today' : '',
              center: 'title',
              right: showNavigationButtons !== false ? 'dayGridMonth,timeGridWeek,timeGridDay' : ''
            }}
            buttonText={{
              today: 'Сегодня',
              month: 'Месяц',
              week: 'Неделя',
              day: 'День'
            }}
            events={events}
            locale={ruLocale}
            selectable={true}
            weekends={true}
            editable={true}
            firstDay={1}
            allDaySlot={false}
            slotMinTime="08:00:00"
            slotMaxTime="22:00:00"
            slotDuration={slotDuration || "00:30:00"}
            nowIndicator={true}
            height="100%"
            select={(arg) => onSelectSlot(arg.start, arg.end)}
            eventClick={(arg) => {
              const lesson = events.find(e => e.id === arg.event.id)?.extendedProps.lesson;
              if (lesson) {
                onEventClick(lesson, { 
                  ctrlKey: arg.jsEvent.ctrlKey, 
                  metaKey: arg.jsEvent.metaKey 
                } as React.MouseEvent);
              }
            }}
            eventDrop={(arg: EventDropArg) => {
              if (onEventDrop && arg.event.id) {
                const newStart = arg.event.start || new Date();
                const newEnd = arg.event.end || new Date(newStart.getTime() + 60 * 60 * 1000);
                onEventDrop(arg.event.id, newStart, newEnd);
              }
            }}
            eventDidMount={(arg) => {
              const lesson = events.find(e => e.id === arg.event.id)?.extendedProps.lesson;
              if (lesson) {
                // Add right-click handler to event
                const el = arg.el;
                const handleRightClick = (e: MouseEvent) => handleEventContextMenu(e, lesson);
                el.addEventListener('contextmenu', handleRightClick);
                
                // Clean up event listeners when component unmounts
                return () => {
                  el.removeEventListener('contextmenu', handleRightClick);
                };
              }
            }}
          />
        </div>
      </Box>
      
      {/* Context Menu */}
      <EventContextMenu
        open={Boolean(contextMenu)}
        anchorPosition={contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : null}
        selectedLesson={selectedContextLesson}
        onClose={handleCloseContextMenu}
        onEdit={handleEditFromMenu}
        onDelete={handleDeleteConfirm}
        onAssignments={(lesson) => onEventClick(lesson)}
      />
      
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        title="Удаление события"
        message={`Вы уверены, что хотите удалить событие "${lessonToDelete?.title}"? Это действие невозможно отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={handleDeleteEvent}
        onCancel={() => setDeleteConfirmOpen(false)}
        type="danger"
      />
    </Paper>
  );
};

export default Calendar; 