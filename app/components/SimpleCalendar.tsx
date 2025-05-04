import React, { useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';
import { Paper } from '@mui/material';
import '../fullcalendar.css';

// Simple test events
const DEMO_EVENTS = [
  {
    id: '1',
    title: 'Тестовое событие',
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 0, 0, 0)),
    backgroundColor: '#84A7C4'
  },
  {
    id: '2',
    title: 'Лекция',
    start: new Date(new Date().setHours(9, 30, 0, 0)),
    end: new Date(new Date().setHours(10, 30, 0, 0)),
    backgroundColor: '#FF9999',
    daysOfWeek: [5] // Friday
  },
  {
    id: '3',
    title: 'Практика',
    start: new Date(new Date().setHours(9, 0, 0, 0)),
    end: new Date(new Date().setHours(9, 45, 0, 0)),
    backgroundColor: '#99CCFF',
    daysOfWeek: [3] // Wednesday
  }
];

const SimpleCalendar: React.FC = () => {
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    // Force redraw after component mounts
    setTimeout(() => {
      if (calendarRef.current) {
        calendarRef.current.getApi().updateSize();
      }
    }, 100);
  }, []);

  return (
    <Paper 
      sx={{ 
        p: 0, 
        borderRadius: 2, 
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(165, 199, 228, 0.1)',
        height: 700,
        width: '100%'
      }}
    >
      <div className="calendar-wrapper" style={{ width: '100%', height: '100%', position: 'relative' }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          buttonText={{
            today: 'Сегодня',
            month: 'Месяц',
            week: 'Неделя',
            day: 'День'
          }}
          events={DEMO_EVENTS}
          locale={ruLocale}
          selectable={true}
          editable={true}
          firstDay={1} // Start from Monday
          allDaySlot={false}
          slotMinTime="08:00:00"
          slotMaxTime="22:00:00"
          nowIndicator={true}
          height="100%"
          slotDuration="00:30:00"
          expandRows={true}
          stickyHeaderDates={true}
          dayHeaderFormat={{ weekday: 'short', day: '2-digit', month: '2-digit' }}
        />
      </div>
    </Paper>
  );
};

export default SimpleCalendar; 