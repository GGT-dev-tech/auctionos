import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AuctionService } from '../../services/auction.service';
import { AuctionDetailsModal } from './AuctionDetailsModal';
import { useNavigate } from 'react-router-dom';

const AuctionCalendar: React.FC = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        AuctionService.getCalendarEvents()
            .then(data => {
                setEvents(data.map((item: any) => ({
                    title: `${item.event_title} (${item.property_count})`,
                    start: `${item.event_date}T${item.event_time || '00:00:00'}`,
                    extendedProps: {
                        location: item.event_location,
                        notes: item.event_notes,
                        linked_properties: item.linked_properties,
                        statuses: item.statuses,
                        property_count: item.property_count,
                        register_link: item.register_link,
                        list_link: item.list_link,
                        tax_status: item.tax_status
                    }
                })));
            })
            .catch(err => console.error("Failed to load calendar", err));
    }, []);

    const handleEventClick = (info: any) => {
        setSelectedEvent(info.event);
    };

    const handleCloseModal = () => {
        setSelectedEvent(null);
    };

    const handleViewProperties = (auctionName: string) => {
        // This is a placeholder for the next phase. It will navigate to the properties view with a filter.
        // navigate(`/admin/properties?auction=${encodeURIComponent(auctionName)}`);
        handleCloseModal();
        alert(`Navigating to Properties List filtered by Auction: ${auctionName} (Coming in next iteration)`);
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm h-[600px] relative">
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
                eventColor="#3b82f6"
            />

            <AuctionDetailsModal
                open={!!selectedEvent}
                onClose={handleCloseModal}
                eventData={selectedEvent}
                onViewProperties={handleViewProperties}
            />
        </div>
    );
};

export default AuctionCalendar;
