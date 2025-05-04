import React, { useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';
import '../time-column.css';

interface SimpleTimeCalendarProps {
  view: 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth';
  events: any[];
  onEventClick?: (eventId: string, jsEvent: any) => void;
  onSelectSlot?: (start: Date, end: Date) => void;
  onEventDrop?: (eventId: string, newStart: Date, newEnd: Date) => void;
}

const SimpleTimeCalendar: React.FC<SimpleTimeCalendarProps> = ({ 
  view, 
  events, 
  onEventClick, 
  onSelectSlot, 
  onEventDrop 
}) => {
  const calendarRef = useRef<FullCalendar>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Apply DOM modifications after render to fix any remaining issues
  useEffect(() => {
    if (!calendarRef.current || !containerRef.current) return;
    
    const applyFinalFixes = () => {
      // Force calendar to refresh and update size
      calendarRef.current?.getApi().updateSize();
      
      // Apply any additional direct DOM manipulations if needed
      const container = containerRef.current;
      if (!container) return;
      
      // Ensure all time axis elements are fixed
      const timeElements = container.querySelectorAll('.fc-timegrid-axis, .fc-timegrid-axis-frame');
      timeElements.forEach(el => {
        const element = el as HTMLElement;
        element.style.position = 'sticky';
        element.style.left = '0';
        element.style.zIndex = '3';
      });
    };
    
    // Apply after render and window resize
    setTimeout(applyFinalFixes, 100);
    setTimeout(applyFinalFixes, 500); // Apply again after a longer delay
    
    const handleResize = () => {
      setTimeout(applyFinalFixes, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [view, events]);

  return (
    <div ref={containerRef} style={{ height: '100%', width: '100%', position: 'relative' }}>
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
        // Add datesSet handler to reapply fixes when view changes
        datesSet={() => {
          setTimeout(() => {
            if (!calendarRef.current || !containerRef.current) return;
            const container = containerRef.current;
            const timeElements = container.querySelectorAll('.fc-timegrid-axis, .fc-timegrid-axis-frame');
            timeElements.forEach(el => {
              const element = el as HTMLElement;
              element.style.position = 'sticky';
              element.style.left = '0';
              element.style.zIndex = '3';
            });
            
            const colHeaderWrapper = container.querySelector('.fc-col-header');
            if (colHeaderWrapper) {
              const element = colHeaderWrapper as HTMLElement;
              element.style.marginLeft = '70px';
              element.style.width = 'calc(100% - 70px)';
            }
          }, 100);
        }}
      />
    </div>
  );
};

export default SimpleTimeCalendar; 