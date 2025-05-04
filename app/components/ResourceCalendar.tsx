import React, { useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';
import '../fullcalendar-minimal.css';

interface ResourceCalendarProps {
  view: 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth';
  events: any[];
  onEventClick?: (eventId: string, jsEvent: any) => void;
  onSelectSlot?: (start: Date, end: Date) => void;
  onEventDrop?: (eventId: string, newStart: Date, newEnd: Date) => void;
}

const ResourceCalendar: React.FC<ResourceCalendarProps> = ({ 
  view, 
  events, 
  onEventClick, 
  onSelectSlot, 
  onEventDrop 
}) => {
  const calendarRef = useRef<FullCalendar>(null);
  
  // Ensure proper initialization with multiple resize calls
  useEffect(() => {
    if (calendarRef.current) {
      // Multiple timeouts to ensure it resizes properly after all DOM updates
      setTimeout(() => {
        calendarRef.current?.getApi().updateSize();
      }, 50);
      
      setTimeout(() => {
        calendarRef.current?.getApi().updateSize();
      }, 200);
    }
  }, [view, events]);
  
  return (
    <div 
      style={{ 
        height: '100%', 
        width: '100%',
        position: 'relative' 
      }}
      className="resource-calendar-container"
    >
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

export default ResourceCalendar; 