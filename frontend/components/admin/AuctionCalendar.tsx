
import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AdminService } from '../../services/api';

const AuctionCalendar: React.FC = () => {
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        AdminService.getCalendarEvents()
            .then(data => {
                setEvents(data.map((item: any) => ({
                    title: `${item.event_title} (${item.property_count})`,
                    start: `${item.event_date}T${item.event_time || '00:00:00'}`,
                    extendedProps: {
                        location: item.event_location,
                        notes: item.event_notes,
                        linked_properties: item.linked_properties,
                        statuses: item.statuses
                    }
                })));
            })
            .catch(err => console.error("Failed to load calendar", err));
    }, []);

    const handleEventClick = (info: any) => {
        const props = info.event.extendedProps;
        alert(`
            Event: ${info.event.title}
            Location: ${props.location}
            Properties: ${props.linked_properties}
            Statuses: ${props.statuses}
            Notes: ${props.notes}
        `);
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm h-[600px]">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek'
                }}
                events={events}
                eventClick={handleEventClick}
                height="100%"
            />
        </div>
    );
};

export default AuctionCalendar;
