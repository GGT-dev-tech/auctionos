import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AuctionService } from '../../services/auction.service';
import { AuctionDetailsModal } from './AuctionDetailsModal';
import { useNavigate } from 'react-router-dom';

interface AuctionCalendarProps {
    filters?: any;
    onDateTypeSelect?: (date: string, type: string) => void;
}

const AuctionCalendar: React.FC<AuctionCalendarProps> = ({ filters = {}, onDateTypeSelect }) => {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        AuctionService.getCalendarEvents(filters)
            .then(data => {
                const groups: Record<string, { date: string, type: string, auctionCount: number, propertyCount: number }> = {};

                data.forEach((item: any) => {
                    const titleLower = (item.event_title || '').toLowerCase();
                    let type = 'Other';
                    if (titleLower.includes('tax deed') || titleLower.includes('taxdeed')) type = 'Tax Deed';
                    else if (titleLower.includes('foreclosure')) type = 'Foreclosure';
                    else if (titleLower.includes('lien')) type = 'Tax Lien';
                    else if (titleLower.includes('sheriff')) type = 'Sheriff Sale';
                    else type = item.event_title || 'Auction'; // fallback to existing title if heuristics miss
                    
                    const groupKey = `${item.event_date}-${type}`;
                    if (!groups[groupKey]) {
                        groups[groupKey] = { date: item.event_date, type, auctionCount: 0, propertyCount: 0 };
                    }
                    groups[groupKey].auctionCount += 1;
                    groups[groupKey].propertyCount += (item.property_count || 1);
                });

                const aggregatedEvents = Object.values(groups).map(g => ({
                    title: `${g.type} (${g.auctionCount})`,
                    start: g.date,
                    allDay: true,
                    extendedProps: {
                        isGrouped: true,
                        type: g.type,
                        date: g.date,
                        auctionCount: g.auctionCount,
                        propertyCount: g.propertyCount
                    }
                }));

                setEvents(aggregatedEvents);
            })
            .catch(err => console.error("Failed to load calendar", err));
    }, [filters]);

    const handleEventClick = (info: any) => {
        const props = info.event.extendedProps;
        if (props.isGrouped) {
            if (onDateTypeSelect) {
                onDateTypeSelect(props.date, props.type);
            } else {
                const params = new URLSearchParams(window.location.search);
                params.set('startDate', props.date);
                params.set('endDate', props.date);
                params.set('q', props.type);
                window.location.search = params.toString();
            }
        } else {
            setSelectedEvent(info.event);
        }
    };

    const handleCloseModal = () => {
        setSelectedEvent(null);
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
                dayCellClassNames={(arg) => {
                    if (arg.isPast) {
                        return ['bg-slate-100', 'dark:bg-slate-800', 'opacity-60', 'grayscale'];
                    }
                    return [];
                }}
            />

            <AuctionDetailsModal
                open={!!selectedEvent}
                onClose={handleCloseModal}
                eventData={selectedEvent}
            />
        </div>
    );
};

export default AuctionCalendar;
