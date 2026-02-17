import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, Filter, Download } from 'lucide-react';
import { Layout } from '../components/Layout';
import { AuctionService } from '../services/api';

const AuctionCalendarStateView: React.FC = () => {
    const navigate = useNavigate();
    const [year, setYear] = useState(2026);
    const [heatmapData, setHeatmapData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOverview();
    }, [year]);

    const fetchOverview = async () => {
        try {
            setLoading(true);
            const data = await AuctionService.getAuctionCalendarOverview(year);
            setHeatmapData(data);
        } catch (error) {
            console.error("Failed to fetch calendar overview", error);
        } finally {
            setLoading(false);
        }
    };

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Helper to generate rows based on data presence
    const generateRows = () => {
        if (!heatmapData) return [];

        const rows: any[] = [];
        const states = Object.keys(heatmapData).sort();

        states.forEach(state => {
            // Check which types exist for this state across all months
            const typesInState = new Set<string>();
            Object.values(heatmapData[state]).forEach((monthData: any) => {
                Object.keys(monthData).forEach(type => typesInState.add(type));
            });

            // Default rows if no specific data but we want to show the state (optional, or just show active types)
            // For now, only show rows where we have data or at least one default
            if (typesInState.size === 0) return;

            typesInState.forEach(type => {
                rows.push({
                    state,
                    type,
                    name: `${state} ${formatType(type)} Auctions`, // e.g. Florida Tax Deed Auctions
                    maxInterest: getMaxInterest(state, type),
                    redemption: getRedemption(state, type)
                });
            });
        });
        return rows;
    };

    const formatType = (type: string) => {
        if (type === 'tax_deed') return 'Tax Deed';
        if (type === 'tax_lien') return 'Tax Lien';
        if (type === 'foreclosure') return 'Foreclosure';
        if (type === 'sheriff_sale') return 'Sheriff Sale';
        return type;
    };

    const getMaxInterest = (state: string, type: string) => {
        // Placeholder logic - this should come from metadata ideally
        if (type === 'tax_lien') {
            if (state === 'NJ') return '18%';
            if (state === 'MO') return '10%';
        }
        if (type === 'tax_deed') {
            if (state === 'MA') return '16%';
            if (state === 'CT') return '18%';
            if (state === 'HI') return '12%';
        }
        return '-';
    };

    const getRedemption = (state: string, type: string) => {
        if (type === 'tax_lien') {
            if (state === 'NJ') return '24';
            if (state === 'MO') return '3';
        }
        if (type === 'tax_deed') {
            if (state === 'CT') return '6';
            if (state === 'MA') return '6';
            if (state === 'HI') return '12';
        }
        return '0';
    };

    const getCellColor = (type: string, count: number) => {
        if (!count) return 'bg-transparent';
        if (type === 'tax_deed') return 'bg-blue-500 text-white';
        if (type === 'tax_lien') return 'bg-green-500 text-white';
        if (type === 'foreclosure') return 'bg-purple-400 text-white';
        return 'bg-gray-400';
    };

    const rows = generateRows();

    return (
        <Layout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Calendar className="w-6 h-6" />
                        All States Auction Calendar
                    </h1>
                    <div className="text-sm text-slate-500 font-medium">
                        Note: Auction dates are subject to change!
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-blue-50 dark:bg-slate-800 p-4 rounded-lg mb-6 flex gap-4 items-center border border-blue-100 dark:border-slate-700">
                    <select
                        className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm min-w-[150px]"
                        defaultValue="All States"
                    >
                        <option>All States</option>
                        {/* Populate dynamically */}
                    </select>
                    <select
                        className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm min-w-[150px]"
                        defaultValue="All Auction Types"
                    >
                        <option>All Auction Types</option>
                        <option>Tax Deed</option>
                        <option>Tax Lien</option>
                        <option>Foreclosure</option>
                    </select>
                </div>

                {/* Heatmap Table */}
                <div className="bg-white dark:bg-slate-900 rounded-lg shadow overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-400 font-bold border-b dark:border-slate-700">
                            <tr>
                                <th className="px-4 py-3 sticky left-0 bg-slate-50 dark:bg-slate-800 z-10 w-24">State</th>
                                <th className="px-4 py-3 w-64">Auction</th>
                                <th className="px-2 py-3 text-center w-20">Type</th>
                                <th className="px-2 py-3 text-center w-20">Max Int</th>
                                <th className="px-2 py-3 text-center w-20">Redempt</th>
                                {months.map(m => (
                                    <th key={m} className="px-2 py-3 text-center w-12">{m}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={17} className="p-8 text-center text-slate-500">Loading calendar data...</td></tr>
                            ) : rows.length === 0 ? (
                                <tr><td colSpan={17} className="p-8 text-center text-slate-500">No auction data found for {year}. Try importing data.</td></tr>
                            ) : (
                                rows.map((row, idx) => (
                                    <tr key={idx} className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 sticky left-0 bg-white dark:bg-slate-900 z-10 cursor-pointer hover:underline" onClick={() => navigate(`/calendar/${row.state}`)}>
                                            {row.stateName || row.state}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                            <div className="w-4 h-4 bg-slate-200 rounded-full flex items-center justify-center text-[10px] text-slate-600">?</div>
                                            {row.name}
                                        </td>
                                        <td className="px-2 py-3 text-center">{formatType(row.type)}</td>
                                        <td className="px-2 py-3 text-center text-slate-500">{row.maxInterest}</td>
                                        <td className="px-2 py-3 text-center text-slate-500">{row.redemption}</td>
                                        {months.map((_, mIdx) => {
                                            const monthKey = (mIdx + 1).toString();
                                            const monthData = heatmapData[row.state]?.[monthKey];
                                            const count = monthData?.[row.type] || 0;
                                            return (
                                                <td key={mIdx} className={`px-1 py-1 h-12 border-l border-slate-100 dark:border-slate-800`}>
                                                    <div className={`w-full h-full rounded-sm ${getCellColor(row.type, count)}`} title={`${count} auctions`}></div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default AuctionCalendarStateView;
