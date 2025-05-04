import React, { useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';

interface FixedTimeCalendarProps {
  view: 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth';
  events: any[];
  onEventClick?: (eventId: string, jsEvent: any) => void;
  onSelectSlot?: (start: Date, end: Date) => void;
  onEventDrop?: (eventId: string, newStart: Date, newEnd: Date) => void;
}

const FixedTimeCalendar: React.FC<FixedTimeCalendarProps> = ({ 
  view, 
  events, 
  onEventClick, 
  onSelectSlot, 
  onEventDrop 
}) => {
  const calendarRef = useRef<FullCalendar>(null);
  
  // Apply direct DOM styles after render
  useEffect(() => {
    // Define a style tag with our CSS fixes
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      /* Hardcoded CSS fixes for FullCalendar time column */
      .fc .fc-timegrid-axis-frame {
        position: sticky !important;
        left: 0 !important;
        width: 70px !important;
        z-index: 3 !important;
        background: white !important;
      }
      
      .fc .fc-timegrid-axis {
        position: sticky !important;
        left: 0 !important;
        width: 70px !important;
        z-index: 3 !important;
        background: white !important;
      }
      
      .fc .fc-timegrid-slot-label {
        position: sticky !important;
        left: 0 !important;
        z-index: 3 !important;
        background: white !important;
      }
      
      .fc .fc-timegrid-axis-cushion {
        text-align: right !important;
        padding-right: 8px !important;
      }
      
      .fc .fc-timegrid-slots td:first-child {
        position: sticky !important;
        left: 0 !important;
        z-index: 2 !important;
        background: white !important;
      }
      
      .fc .fc-timegrid-cols {
        left: 70px !important;
        width: calc(100% - 70px) !important;
      }
      
      .fc .fc-col-header {
        margin-left: 70px !important;
        width: calc(100% - 70px) !important;
      }
      
      .fc-timegrid-axis-chunk {
        position: sticky !important;
        left: 0 !important;
        z-index: 3 !important;
        background: white !important;
      }
    `;
    document.head.appendChild(styleTag);
    
    return () => {
      // Clean up when component unmounts
      document.head.removeChild(styleTag);
    };
  }, []);
  
  // Update calendar size when changing views
  useEffect(() => {
    const updateSize = () => {
      calendarRef.current?.getApi().updateSize();
    };
    
    setTimeout(updateSize, 100);
    
    window.addEventListener('resize', updateSize);
    
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [view, events]);

  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
      initialView={view}
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
      events={events}
      locale={ruLocale}
      firstDay={1}
      allDaySlot={false}
      slotMinTime="08:00:00"
      slotMaxTime="22:00:00"
      height="100%"
      slotDuration="00:30:00"
      selectable={true}
      editable={true}
      select={onSelectSlot ? (arg) => onSelectSlot(arg.start, arg.end) : undefined}
      eventClick={onEventClick ? (arg) => onEventClick(arg.event.id, arg.jsEvent) : undefined}
      eventDrop={onEventDrop ? (arg) => {
        if (arg.event.id && arg.event.start) {
          const newStart = arg.event.start;
          const newEnd = arg.event.end || new Date(newStart.getTime() + 60 * 60 * 1000);
          onEventDrop(arg.event.id, newStart, newEnd);
        }
      } : undefined}
      eventDidMount={onEventClick ? (info) => {
        if (info.el) {
          info.el.addEventListener('contextmenu', (e) => {
            onEventClick(info.event.id, e);
          });
        }
      } : undefined}
      datesSet={() => {
        // Force update when view changes
        setTimeout(() => {
          calendarRef.current?.getApi().updateSize();
        }, 100);
      }}
    />
  );
};

export default FixedTimeCalendar; 