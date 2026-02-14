import React, { useEffect, useState } from 'react';
import { AuctionService } from '../services/api';

export const Analysis: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        AuctionService.getStats()
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-10 text-center">Loading analysis...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analysis & Reports</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Properties" value={stats?.total_properties} icon="home" />
                <StatCard label="Total Value" value={`$${(stats?.total_value || 0).toLocaleString()}`} icon="attach_money" />
                <StatCard label="Active Auctions" value={stats?.active_count} icon="gavel" />
                <StatCard label="Sold Properties" value={stats?.sold_count} icon="verified" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Top Counties</h3>
                    <div className="space-y-4">
                        {stats?.county_stats?.map((c: any, i: number) => (
                            <div key={i} className="flex items-center justify-between">
                                <span className="text-slate-600 dark:text-slate-300">{c.name}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${(c.count / (stats.total_properties || 1)) * 100}%` }}></div>
                                    </div>
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{c.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon }: any) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
        <div className="min-w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    </div>
);
