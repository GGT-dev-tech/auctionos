import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Download, ChevronLeft, MapPin } from 'lucide-react';
import { Layout } from '../components/Layout';
import { AuctionService } from '../services/api';
import { AuctionEvent } from '../types';

const StateAuctionCalendar: React.FC = () => {
    const { state } = useParams<{ state: string }>();
    const navigate = useNavigate();
    const [events, setEvents] = useState<AuctionEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(2026);

    useEffect(() => {
        if (state) fetchEvents();
    }, [state, year]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const data = await AuctionService.getStateAuctionEvents(state!, year);
            setEvents(data);
        } catch (error) {
            console.error("Failed to fetch state events", error);
        } finally {
            setLoading(false);
        }
    };

    // Group events by month
    const groupedEvents = events.reduce((acc, event) => {
        const date = new Date(event.start_date);
        const monthKey = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!acc[monthKey]) acc[monthKey] = [];
        acc[monthKey].push(event);
        return acc;
    }, {} as Record<string, AuctionEvent[]>);

    const monthKeys = Object.keys(groupedEvents).sort((a, b) => {
        // Sort keys chronologically (simple version)
        return new Date(a).getTime() - new Date(b).getTime();
    });

    return (
        <Layout>
            <div className="p-6 max-w-7xl mx-auto">
                <button
                    onClick={() => navigate('/calendar')}
                    className="mb-4 text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to All States
                </button>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="text-blue-600">{state}</span> Auction Calendar
                    </h1>

                    {/* Filters Bar mimics the screenshot */}
                    <div className="bg-blue-50 dark:bg-slate-800 p-2 rounded flex gap-2 items-center border border-blue-100 dark:border-slate-700">
                        <select
                            className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-3 py-1 text-sm font-bold"
                            value={state}
                            onChange={(e) => navigate(`/calendar/${e.target.value}`)}
                        >
                            <option value={state}>{state}</option>
                            <option value="FL">FL</option>
                            <option value="AR">AR</option>
                        </select>
                        <select
                            className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-3 py-1 text-sm"
                            defaultValue="Rolling"
                        >
                            <option>Rolling</option>
                        </select>
                        <select
                            className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-3 py-1 text-sm min-w-[120px]"
                            defaultValue="Any Location"
                        >
                            <option>Any Location</option>
                        </select>
                        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded text-sm font-medium flex items-center gap-1">
                            <Download className="w-4 h-4" /> Export
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-lg shadow mb-6">
                    <div className="p-3 bg-blue-50 dark:bg-slate-800 border-b dark:border-slate-700 text-xs font-semibold text-slate-500 uppercase flex">
                        <div className="w-1/3">Auction</div>
                        <div className="w-1/6">Type</div>
                        <div className="w-1/6">Max Interest</div>
                        <div className="w-1/6">Redemption (Months)</div>
                        <div className="w-1/3">Timeline (Jan - Dec)</div>
                    </div>
                    {/* Static Header Row Example (matches screenshot logic) */}
                    <div className="p-4 border-b dark:border-slate-700 flex items-center text-sm">
                        <div className="w-1/3 flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                            <div className="w-4 h-4 bg-slate-200 rounded-full flex items-center justify-center text-[10px] text-slate-600">?</div>
                            Leftover Tax Deed Auctions
                        </div>
                        <div className="w-1/6 text-slate-600">Deed</div>
                        <div className="w-1/6 text-slate-600">-</div>
                        <div className="w-1/6 text-slate-600">0</div>
                        <div className="w-1/3 bg-blue-400 h-8 rounded-sm mx-2"></div>
                    </div>
                </div>

                <div className="space-y-4">
                    {monthKeys.map(month => (
                        <div key={month} className="bg-white dark:bg-slate-900 rounded-lg shadow overflow-hidden">
                            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 border-b dark:border-slate-700 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-500" />
                                <h3 className="font-bold text-slate-700 dark:text-slate-200">{month}</h3>
                                <span className="bg-slate-300 text-slate-700 text-xs px-2 py-0.5 rounded-full">
                                    {groupedEvents[month].length}
                                </span>
                            </div>
                            <div>
                                {groupedEvents[month].map(evt => (
                                    <div key={evt.id} className="p-4 border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex justify-between items-center group cursor-pointer" onClick={() => navigate(`/search?auction_event_id=${evt.id}`)}>
                                        <div>
                                            <h4 className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 flex items-center gap-2">
                                                {evt.county} County {evt.auction_type.replace('_', ' ').toUpperCase()}
                                                {evt.total_assets && (
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                                        {evt.total_assets} Assets
                                                    </span>
                                                )}
                                            </h4>
                                            <div className="text-sm text-slate-500 mt-1 flex items-center gap-4">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(evt.start_date).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {evt.county}, {evt.state}</span>
                                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs capitalize">{evt.status}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <button className="text-blue-600 hover:underline text-sm font-medium">View Properties</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {monthKeys.length === 0 && !loading && (
                        <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-lg">
                            No auction events found for {state} in {year}.
                        </div>
                    )}
                </div>

            </div>
        </Layout>
    );
};

export default StateAuctionCalendar;
