import React, { useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';

interface FixedCalendarProps {
  view: 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth';
  events: any[];
  onEventClick?: (eventId: string, jsEvent: any) => void;
  onSelectSlot?: (start: Date, end: Date) => void;
  onEventDrop?: (eventId: string, newStart: Date, newEnd: Date) => void;
}

const FixedCalendar: React.FC<FixedCalendarProps> = ({ 
  view, 
  events, 
  onEventClick, 
  onSelectSlot, 
  onEventDrop 
}) => {
  const calendarRef = useRef<FullCalendar>(null);
  
  // Custom CSS to fix the time column using !important flags
  const customCSS = `
    .fc .fc-timegrid-axis {
      position: absolute !important;
      left: 0 !important;
      width: 70px !important;
      min-width: 70px !important;
      max-width: 70px !important;
      z-index: 3 !important;
      background-color: #fff !important;
    }
    
    .fc .fc-timegrid-axis-cushion,
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
    
    .fc .fc-timegrid-col {
      min-width: 0 !important;
    }
  `;
  
  // Apply the fix when the component mounts or view changes
  useEffect(() => {
    if (calendarRef.current) {
      // Force a redraw to ensure all elements are properly sized
      setTimeout(() => {
        calendarRef.current?.getApi().updateSize();
      }, 50);
    }
  }, [view, events]);
  
  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* Inject critical CSS */}
      <style dangerouslySetInnerHTML={{ __html: customCSS }} />
      
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
        
        // Core functionality
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
        
        // Right-click support
        eventDidMount={onEventClick ? (info) => {
          if (info.el) {
            info.el.addEventListener('contextmenu', (e) => {
              onEventClick(info.event.id, e);
            });
          }
        } : undefined}
      />
    </div>
  );
};

export default FixedCalendar; 