import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AuctionService } from '../../services/auction.service';
import type { AuctionEvent } from '../../types';
import { AuctionDetailsModal } from './AuctionDetailsModal';
import AuctionList from './AuctionList';
import { Dialog, DialogTitle, DialogContent, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

interface AuctionCalendarProps {
    filters?: any;
    onDateTypeSelect?: (date: string, type: string) => void;
}

const AuctionCalendar: React.FC<AuctionCalendarProps> = ({ filters = {}, onDateTypeSelect }) => {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const [groupedDialogOpen, setGroupedDialogOpen] = useState(false);
    const [groupedDateType, setGroupedDateType] = useState<{date: string, type: string} | null>(null);
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
                    else type = item.event_title || 'Auction'; 
                    
                    const cleanDate = item.event_date ? item.event_date.split('T')[0] : '';
                    if (!cleanDate) return;

                    const groupKey = `${cleanDate}-${type}`;
                    if (!groups[groupKey]) {
                        groups[groupKey] = { date: cleanDate, type, auctionCount: 0, propertyCount: 0 };
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
            // Display internal modal list instead of external parameter routing
            setGroupedDateType({ date: props.date, type: props.type });
            setGroupedDialogOpen(true);
        } else {
            setSelectedEvent(info.event);
        }
    };

    const handleDateClick = (arg: any) => {
        // Handle clicking the empty day box
        if (onDateTypeSelect) {
            onDateTypeSelect(arg.dateStr, ''); 
        } else {
            const params = new URLSearchParams(window.location.search);
            params.set('startDate', arg.dateStr);
            params.set('endDate', arg.dateStr);
            params.delete('q'); // Clear search query to show all types for that date
            window.location.search = '?' + params.toString();
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
                timeZone="UTC"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek'
                }}
                events={events}
                eventClick={handleEventClick}
                dateClick={handleDateClick}
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

            <Dialog 
                open={groupedDialogOpen} 
                onClose={() => setGroupedDialogOpen(false)} 
                maxWidth="lg" 
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, minHeight: '600px' } }}
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
                    <Typography variant="h6" className="font-bold text-slate-800">
                        {groupedDateType ? `${groupedDateType.type} Auctions on ${new Date(groupedDateType.date).toLocaleDateString()}` : 'Auctions'}
                    </Typography>
                    <IconButton onClick={() => setGroupedDialogOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers className="p-0 bg-slate-50">
                    {groupedDateType && (
                        <AuctionList 
                            filters={{ 
                                startDate: groupedDateType.date, 
                                endDate: groupedDateType.date, 
                                q: groupedDateType.type === 'Other' ? '' : groupedDateType.type 
                            }} 
                            readOnly={true} 
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AuctionCalendar;
