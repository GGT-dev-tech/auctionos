import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { AuctionService } from '../services/api';
import { Calendar, ChevronLeft, ChevronRight, MapPin, ExternalLink, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuctionCalendar: React.FC = () => {
    const [calendarData, setCalendarData] = useState<any>(null); // { "YYYY-MM-DD": [Auction, Auction] }
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await AuctionService.getCalendar();
            setCalendarData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const renderCalendarGrid = () => {
        if (!calendarData) return null;

        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

        const days = [];
        // Empty cells for previous month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />);
        }

        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const auctions = calendarData[dateStr] || [];

            days.push(
                <div key={day} className="h-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 overflow-y-auto">
                    <div className="font-semibold mb-1 text-slate-700 dark:text-slate-300">{day}</div>
                    <div className="space-y-1">
                        {auctions.map((auc: any) => (
                            <div key={auc.id} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 p-1 rounded truncate hover:bg-blue-200 cursor-pointer" title={auc.name}>
                                {auc.short_name || auc.name}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return days;
    };

    const renderUpcomingList = () => {
        if (!calendarData) return null;

        // Flatten and sort upcoming
        const upcoming = Object.entries(calendarData)
            .flatMap(([date, auctions]: [string, any]) => auctions)
            .filter((a: any) => new Date(a.auction_date) >= new Date())
            .sort((a: any, b: any) => new Date(a.auction_date).getTime() - new Date(b.auction_date).getTime())
            .slice(0, 10); // Next 10

        return (
            <div className="space-y-4">
                {upcoming.map((auc: any) => (
                    <div key={auc.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{auc.name}</h3>
                                <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={16} /> {auc.auction_date}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin size={16} /> {auc.county}, {auc.state}
                                    </div>
                                    {auc.time && (
                                        <div className="flex items-center gap-1">
                                            <Clock size={16} /> {auc.time}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                {auc.info_link && (
                                    <a href={auc.info_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                                        Info <ExternalLink size={14} />
                                    </a>
                                )}
                                {auc.search_link && (
                                    <a href={auc.search_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                                        Search <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Layout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Calendar className="text-blue-500" /> Auction Calendar
                    </h1>
                    <div className="flex gap-2">
                        <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeft /></button>
                        <h2 className="text-xl font-semibold w-48 text-center">
                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full"><ChevronRight /></button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Calendar Grid */}
                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-7 mb-2 text-center font-medium text-slate-500">
                            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                        </div>
                        <div className="grid grid-cols-7 border-t border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm rounded-lg overflow-hidden">
                            {loading ? <div className="col-span-7 h-96 flex items-center justify-center">Loading...</div> : renderCalendarGrid()}
                        </div>
                    </div>

                    {/* Upcoming List */}
                    <div>
                        <h2 className="text-lg font-bold mb-4">Next Upcoming Auctions</h2>
                        {loading ? <div>Loading...</div> : renderUpcomingList()}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AuctionCalendar;
