import React, { useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';
import '../fullcalendar-minimal.css';
import '../alternate-calendar.css';

// Simpler calendar interface
interface MinimalCalendarProps {
  view: 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth';
  events: any[];
  onEventClick?: (eventId: string, jsEvent: any) => void;
  onSelectSlot?: (start: Date, end: Date) => void;
  onEventDrop?: (eventId: string, newStart: Date, newEnd: Date) => void;
}

// Forceful approach to fixing the time column
const MinimalCalendar: React.FC<MinimalCalendarProps> = ({
  view,
  events,
  onEventClick,
  onSelectSlot,
  onEventDrop
}) => {
  const calendarRef = useRef<FullCalendar>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fix time column on mount and after any changes
  useEffect(() => {
    // Try to apply a fix to the time column positioning
    const applyFix = () => {
      if (!calendarRef.current) return;
      
      // Force a redraw first
      calendarRef.current.getApi().updateSize();
      
      // Get the calendar element
      const calendarEl = wrapperRef.current?.querySelector('.fc') as HTMLElement;
      if (!calendarEl) return;
      
      // Add styling directly to the calendar elements
      const timeAxis = calendarEl.querySelectorAll('.fc-timegrid-axis');
      timeAxis.forEach(el => {
        const element = el as HTMLElement;
        element.style.position = 'sticky';
        element.style.left = '0';
        element.style.width = '70px';
        element.style.minWidth = '70px';
        element.style.maxWidth = '70px';
        element.style.zIndex = '3';
      });
      
      // Adjust header and columns
      const colHeader = calendarEl.querySelector('.fc-col-header') as HTMLElement;
      if (colHeader) {
        colHeader.style.marginLeft = '70px';
        colHeader.style.width = 'calc(100% - 70px)';
      }
      
      const timeCols = calendarEl.querySelector('.fc-timegrid-cols') as HTMLElement;
      if (timeCols) {
        timeCols.style.left = '70px';
        timeCols.style.width = 'calc(100% - 70px)';
      }
    };
    
    // Apply the fix after a short delay to ensure the calendar is fully rendered
    const timeoutId = setTimeout(applyFix, 100);
    
    // Also apply on window resize
    window.addEventListener('resize', applyFix);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', applyFix);
    };
  }, [view, events]);

  return (
    <div 
      className="minimal-calendar-wrapper" 
      style={{ width: '100%', height: '100%', position: 'relative' }}
      ref={wrapperRef}
    >
      {/* Force these styles to override anything else */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Critical styles for time column positioning */
        .fc .fc-timegrid-axis {
          position: sticky !important;
          left: 0 !important;
          width: 70px !important;
          min-width: 70px !important;
          max-width: 70px !important;
          z-index: 3 !important;
          background-color: #fff !important;
        }
        
        .fc .fc-timegrid-slot-label-cushion {
          text-align: right !important;
          padding-right: 8px !important;
        }
        
        .fc .fc-col-header {
          margin-left: 70px !important;
          width: calc(100% - 70px) !important;
        }
        
        .fc .fc-timegrid-cols {
          position: absolute !important;
          left: 70px !important;
          width: calc(100% - 70px) !important;
        }
      `}} />
      
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
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
        selectable={true}
        editable={true}
        firstDay={1} // Start with Monday
        allDaySlot={false}
        slotMinTime="08:00:00"
        slotMaxTime="22:00:00"
        nowIndicator={true}
        height="100%"
        slotDuration="00:30:00"
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
          // Add right-click handler
          if (info.el) {
            info.el.addEventListener('contextmenu', (e) => {
              // Pass the contextmenu event to the click handler
              onEventClick(info.event.id, e);
            });
          }
        } : undefined}
        // Apply fix when dates or view change
        datesSet={applyFix => {
          setTimeout(() => {
            if (calendarRef.current) {
              calendarRef.current.getApi().updateSize();
            }
          }, 100);
        }}
      />
    </div>
  );
};

export default MinimalCalendar; 