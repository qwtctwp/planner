import React, { useEffect, useRef } from 'react';
import { Calendar } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';

interface BasicCalendarProps {
  view: 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth';
  events: any[];
  onEventClick?: (eventId: string, jsEvent: any) => void;
  onSelectSlot?: (start: Date, end: Date) => void;
  onEventDrop?: (eventId: string, newStart: Date, newEnd: Date) => void;
}

const BasicCalendar: React.FC<BasicCalendarProps> = ({ 
  view, 
  events, 
  onEventClick, 
  onSelectSlot, 
  onEventDrop 
}) => {
  const calendarElRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<Calendar | null>(null);
  
  // Initialize calendar when component mounts
  useEffect(() => {
    if (!calendarElRef.current) return;
    
    // Define the function to apply fixes before it's used
    const applyTimeColumnFix = () => {
      if (!calendarElRef.current) return;
      
      const container = calendarElRef.current;
      
      // Time axis
      const timeAxisElements = container.querySelectorAll('.fc-timegrid-axis-frame, .fc-timegrid-axis');
      timeAxisElements.forEach(el => {
        const element = el as HTMLElement;
        element.style.position = 'sticky';
        element.style.left = '0';
        element.style.width = '70px';
        element.style.zIndex = '3';
        element.style.background = 'white';
      });
      
      // Slot labels
      const slotLabelElements = container.querySelectorAll('.fc-timegrid-slot-label');
      slotLabelElements.forEach(el => {
        const element = el as HTMLElement;
        element.style.position = 'sticky';
        element.style.left = '0';
        element.style.zIndex = '3';
        element.style.background = 'white';
      });
      
      // Header
      const colHeaderWrapper = container.querySelector('.fc-col-header');
      if (colHeaderWrapper) {
        const element = colHeaderWrapper as HTMLElement;
        element.style.marginLeft = '70px';
        element.style.width = 'calc(100% - 70px)';
      }
      
      // Columns
      const timeGridCols = container.querySelector('.fc-timegrid-cols');
      if (timeGridCols) {
        const element = timeGridCols as HTMLElement;
        element.style.left = '70px';
        element.style.width = 'calc(100% - 70px)';
      }
    };
    
    // Initialize calendar directly without using the React component
    calendarRef.current = new Calendar(calendarElRef.current, {
      plugins: [timeGridPlugin, dayGridPlugin, interactionPlugin],
      initialView: view,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      buttonText: {
        today: 'Сегодня',
        month: 'Месяц',
        week: 'Неделя',
        day: 'День'
      },
      events,
      locale: ruLocale,
      firstDay: 1,
      allDaySlot: false,
      slotMinTime: '08:00:00',
      slotMaxTime: '22:00:00',
      height: '100%',
      slotDuration: '00:30:00',
      selectable: true,
      editable: true,
      select: onSelectSlot ? (arg) => onSelectSlot(arg.start, arg.end) : undefined,
      eventClick: onEventClick ? (arg) => onEventClick(arg.event.id, arg.jsEvent) : undefined,
      eventDrop: onEventDrop ? (arg) => {
        if (arg.event.id && arg.event.start) {
          const newStart = arg.event.start;
          const newEnd = arg.event.end || new Date(newStart.getTime() + 60 * 60 * 1000);
          onEventDrop(arg.event.id, newStart, newEnd);
        }
      } : undefined,
      eventDidMount: onEventClick ? (info) => {
        if (info.el) {
          info.el.addEventListener('contextmenu', (e) => {
            onEventClick(info.event.id, e);
          });
        }
      } : undefined,
      datesSet: () => {
        // Apply fixes when view changes
        setTimeout(applyTimeColumnFix, 100);
      }
    });
    
    // Render the calendar
    calendarRef.current.render();
    
    // Apply fixes after a slight delay
    setTimeout(applyTimeColumnFix, 100);
    setTimeout(applyTimeColumnFix, 500);
    
    // Cleanup function
    return () => {
      if (calendarRef.current) {
        calendarRef.current.destroy();
      }
    };
  }, [view, events, onEventClick, onSelectSlot, onEventDrop]);
  
  // Update view and events when props change
  useEffect(() => {
    if (!calendarRef.current) return;
    
    // Update view
    calendarRef.current.changeView(view);
    
    // Update events
    calendarRef.current.removeAllEvents();
    calendarRef.current.addEventSource(events);
    
    // Apply fixes after update
    setTimeout(() => {
      if (!calendarElRef.current) return;
      
      const container = calendarElRef.current;
      
      // Time axis
      const timeAxisElements = container.querySelectorAll('.fc-timegrid-axis-frame, .fc-timegrid-axis');
      timeAxisElements.forEach(el => {
        const element = el as HTMLElement;
        element.style.position = 'sticky';
        element.style.left = '0';
        element.style.zIndex = '3';
      });
      
      // Header
      const colHeaderWrapper = container.querySelector('.fc-col-header');
      if (colHeaderWrapper) {
        const element = colHeaderWrapper as HTMLElement;
        element.style.marginLeft = '70px';
        element.style.width = 'calc(100% - 70px)';
      }
    }, 100);
  }, [view, events]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <div ref={calendarElRef} style={{ height: '100%', width: '100%' }}></div>
    </div>
  );
};

export default BasicCalendar; 