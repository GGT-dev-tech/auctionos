import React, { useState, useEffect } from 'react';
import { AuctionService, AdminService } from '../services/api';
import { AuctionEvent } from '../types';
import { AuctionFormModal } from '../components/AuctionFormModal';

export const AuctionList: React.FC = () => {
    const [auctions, setAuctions] = useState<AuctionEvent[]>([]);
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [editingAuction, setEditingAuction] = useState<AuctionEvent | undefined>(undefined);

    const fetchAuctions = async () => {
        try {
            setIsLoading(true);
            const data = await AuctionService.getAuctionEvents();
            setAuctions(data);
        } catch (error) {
            console.error('Failed to fetch auctions', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAuctions();
    }, []);

    const handleCreateUpdate = async (data: Partial<AuctionEvent>) => {
        try {
            if (editingAuction) {
                await AuctionService.updateAuctionEvent(editingAuction.id, data);
            } else {
                await AuctionService.createAuctionEvent(data);
            }
            fetchAuctions();
            setIsModalOpen(false);
            setEditingAuction(undefined);
        } catch (error) {
            console.error('Failed to save auction', error);
            alert('Failed to save auction');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this auction?')) return;
        try {
            await AuctionService.deleteAuctionEvent(id);
            fetchAuctions();
        } catch (error) {
            console.error('Failed to delete auction', error);
            alert('Failed to delete auction');
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsImporting(true);
            import { AuctionService, AdminService } from '../services/api';

            // ... inside the component
            try {
                setIsImporting(true);
                const result = await AdminService.importAuctions(file);
                alert(`Import successful! Job ID: ${result.job_id}`);
                // Polling logic could be added here similar to CsvUpload component
                fetchAuctions();
            } catch (error: any) {
                console.error('Import failed', error);
                alert(error.message || 'Import failed');
            } finally {
                setIsImporting(false);
                e.target.value = ''; // Reset input
            }
        };

        const calendarEvents = auctions.map(auction => ({
            id: auction.id,
            title: auction.name,
            start: new Date(`${auction.auction_date}T${auction.time || '00:00:00'}`),
            extendedProps: auction
        }));

        // Group auctions by date for calendar rendering
        const auctionsByDate = auctions.reduce((acc, auction) => {
            const date = auction.auction_date;
            if (!acc[date]) acc[date] = [];
            acc[date].push(auction);
            return acc;
        }, {} as Record<string, AuctionEvent[]>);

        // Generate calendar days (simple implementation for now)
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Auction Calendar</h1>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'calendar'
                                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                    }`}
                            >
                                Calendar
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list'
                                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                    }`}
                            >
                                List
                            </button>
                        </div>

                        <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            id="auction-csv-upload"
                            onChange={handleImport}
                            disabled={isImporting}
                        />
                        <button
                            onClick={() => document.getElementById('auction-csv-upload')?.click()}
                            disabled={isImporting}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                            <span className="material-symbols-outlined text-[20px]">upload_file</span>
                            {isImporting ? 'Importing...' : 'Import CSV'}
                        </button>

                        <button
                            onClick={() => {
                                setEditingAuction(undefined);
                                setIsModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            Add Auction
                        </button>
                    </div>
                </div>

                {viewMode === 'list' ? (
                    <div className="bg-white dark:bg-[#1a2634] rounded-xl border border-[#e7ecf3] dark:border-slate-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Date</th>
                                        <th className="px-6 py-3 font-medium">Name</th>
                                        <th className="px-6 py-3 font-medium">Location</th>
                                        <th className="px-6 py-3 font-medium">Properties</th>
                                        <th className="px-6 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auctions.map((auction) => (
                                        <tr key={auction.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                {new Date(auction.auction_date).toLocaleDateString()}
                                                {auction.time && <span className="text-xs text-slate-500 block">{auction.time}</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900 dark:text-white">{auction.name}</div>
                                                {auction.short_name && <div className="text-xs text-slate-500">{auction.short_name}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                {auction.location || '-'}
                                                {auction.county && <span className="block text-xs">{auction.county}, {auction.state}</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                    {auction.properties_count || 0} Linked
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingAuction(auction);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="p-1 text-slate-400 hover:text-primary transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(auction.id)}
                                                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {auctions.length === 0 && !isLoading && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                No auctions found. Import a CSV or create one manually.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-[#1a2634] rounded-xl border border-[#e7ecf3] dark:border-slate-700 p-6">
                        <div className="grid grid-cols-7 gap-4">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
                                    {day}
                                </div>
                            ))}
                            {/* Placeholder Calendar Grid - Logic needed for proper calendar generation aligned with day of week */}
                            {days.map(day => {
                                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const dayEvents = auctionsByDate[dateStr] || [];

                                return (
                                    <div key={day} className="min-h-[100px] border border-slate-100 dark:border-slate-700 rounded-lg p-2 relative">
                                        <span className="text-sm font-medium text-slate-400">{day}</span>
                                        <div className="mt-1 space-y-1">
                                            {dayEvents.map(event => (
                                                <div
                                                    key={event.id}
                                                    className="text-xs p-1 rounded bg-primary/10 text-primary truncate cursor-pointer hover:bg-primary/20"
                                                    onClick={() => {
                                                        setEditingAuction(event);
                                                        setIsModalOpen(true);
                                                    }}
                                                    title={event.name}
                                                >
                                                    {event.time ? `${event.time} ` : ''}{event.short_name || event.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                <AuctionFormModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingAuction(undefined);
                    }}
                    onSubmit={handleCreateUpdate}
                    initialData={editingAuction}
                />
            </div>
        );
    };
