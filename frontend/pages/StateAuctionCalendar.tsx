import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Download, ChevronLeft, MapPin, HelpCircle, AlertTriangle } from 'lucide-react';
import { AuctionService } from '../services/api';
import { AuctionEvent, AuctionEventType } from '../types';

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

    // Helper: Map AuctionEventType to display name
    const getAuctionTypeName = (type: AuctionEventType | string): string => {
        switch (type) {
            case AuctionEventType.TAX_DEED: return "Tax Deed";
            case AuctionEventType.TAX_LIEN: return "Tax Lien";
            case AuctionEventType.FORECLOSURE: return "Foreclosure";
            case AuctionEventType.SHERIFF_SALE: return "Sheriff Sale";
            default: return (type as string) || "Other";
        }
    };

    // Helper: Get color based on Auction Type
    const getTypeColor = (type: AuctionEventType | string) => {
        switch (type) {
            case AuctionEventType.TAX_DEED: return "bg-blue-500";
            case AuctionEventType.TAX_LIEN: return "bg-green-500";
            case AuctionEventType.FORECLOSURE: return "bg-purple-500";
            default: return "bg-gray-500";
        }
    };

    // 1. Identification of available auction types in the fetched events
    const availableTypes = Array.from(new Set(events.map(e => e.auction_type)));

    // 2. Data aggregation for the heatmap (Type -> Month -> Boolean/Count)
    const heatmapData: Record<string, Record<number, number>> = {};

    events.forEach(event => {
        const date = new Date(event.start_date);
        const month = date.getMonth(); // 0-11
        const type = event.auction_type as string;

        if (!heatmapData[type]) heatmapData[type] = {};
        if (!heatmapData[type][month]) heatmapData[type][month] = 0;
        heatmapData[type][month]++;
    });

    // 3. Data aggregation for the Month Grid (Month -> Total Count)
    const monthCounts = new Array(12).fill(0);
    events.forEach(event => {
        const date = new Date(event.start_date);
        monthCounts[date.getMonth()]++;
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const fullMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Mock Data for "Max Interest" and "Redemption" (In a real app, this comes from a metadata endpoint)
    const getMetadata = (type: string) => {
        // Defaults
        return { interest: '-', redemption: '0' };
    };

    const getStateName = (abbr: string) => {
        const names: Record<string, string> = {
            "AR": "Arkansas",
            "FL": "Florida",
            "CA": "California",
            "TX": "Texas"
        };
        return names[abbr] || abbr;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 md:mb-0">
                    {getStateName(state || '')} Auction Calendar
                </h1>
                <div className="flex items-center text-blue-600 font-medium dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-md border border-blue-100 dark:border-blue-800">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <span>Note: Auction dates are subject to change!</span>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-blue-50 dark:bg-slate-800 rounded-lg p-4 mb-8 border border-blue-100 dark:border-slate-700 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <select
                            className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
                            value={state}
                            onChange={(e) => navigate(`/calendar/${e.target.value}`)}
                        >
                            <option value="AR">Arkansas</option>
                            <option value="FL">Florida</option>
                            <option value="CA">California</option>
                        </select>
                    </div>
                    <div className="relative">
                        <select className="block w-32 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm dark:bg-gray-700 dark:text-white">
                            <option>Rolling</option>
                        </select>
                    </div>
                    <div className="relative">
                        <select className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm dark:bg-gray-700 dark:text-white">
                            <option>Any Location</option>
                        </select>
                    </div>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-sm flex items-center font-medium transition-colors ml-auto">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                </div>
            </div>

            {/* Main Table (Heatmap) */}
            <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Parcels</th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Links</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {events.length === 0 && !loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                        No auctions found for this state in {year}.
                                    </td>
                                </tr>
                            ) : (
                                events.map(event => {
                                    const typeName = getAuctionTypeName(event.auction_type);

                                    return (
                                        <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                                                    {event.county} {typeName}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">{event.notes}</div>
                                            </td>
                                            <td className="px-3 py-4 text-center whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                <div>{new Date(event.start_date).toLocaleDateString()}</div>
                                                <div className="text-xs text-gray-400">{event.auction_time || '-'}</div>
                                            </td>
                                            <td className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                                                <div className="flex items-center justify-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {event.location || 'Online'}
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 text-center text-sm text-gray-900 dark:text-white font-semibold">
                                                {event.parcels_count || '-'}
                                            </td>
                                            <td className="px-3 py-4 text-center text-sm">
                                                <div className="flex flex-col gap-1 items-center">
                                                    {event.registration_link && (
                                                        <a href={event.registration_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Register</a>
                                                    )}
                                                    {event.purchase_link && (
                                                        <a href={event.purchase_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Info</a>
                                                    )}
                                                    {event.list_link && (
                                                        <a href={event.list_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">List</a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Month Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {fullMonths.map((month, idx) => {
                    const count = monthCounts[idx];
                    const isComplete = idx < new Date().getMonth(); // Mock "past" logic

                    return (
                        <div
                            key={month}
                            onClick={() => {
                                if (count > 0) {
                                    // Navigate to search filtered by this month
                                    // We need to pass a date range to the search page
                                    const startDate = `${year}-${String(idx + 1).padStart(2, '0')}-01`;
                                    // Simple end date logic (approx)
                                    const endDate = `${year}-${String(idx + 1).padStart(2, '0')}-31`;
                                    navigate(`/search?state=${state}&min_date=${startDate}&max_date=${endDate}`);
                                }
                            }}
                            className={`
                                rounded-md border p-4 flex items-center shadow-sm transition-all
                                ${count > 0 ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 hover:shadow-md cursor-pointer' : 'bg-gray-50 dark:bg-slate-900 border-gray-100 dark:border-slate-800 opacity-60 cursor-default'}
                            `}
                        >
                            <Calendar className={`w-5 h-5 mr-3 ${count > 0 ? 'text-blue-500' : 'text-gray-400'}`} />
                            <span className={`font-semibold mr-2 ${count > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                                {month} {year}
                            </span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${count > 0 ? 'bg-gray-600 text-white' : 'bg-gray-300 text-gray-500'}`}>
                                {count}
                            </span>
                            {isComplete && count > 0 && (
                                <span className="ml-auto text-xs text-green-600 font-medium">(active)</span>
                            )}
                        </div>
                    );
                })}
            </div>

        </div>
    );
};

export default StateAuctionCalendar;
