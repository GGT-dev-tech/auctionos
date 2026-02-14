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
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analysis & Performance</h2>
                <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-500">
                    Real-time Data Active
                </div>
            </div>

            {/* Property Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Properties" value={stats?.total_properties} icon="home" color="blue" />
                <StatCard label="Active/Draft" value={stats?.active_count + stats?.draft_count} icon="gavel" color="amber" />
                <StatCard label="Pending" value={stats?.pending_count} icon="schedule" color="indigo" />
                <StatCard label="Total Sold" value={stats?.sold_count} icon="verified" color="green" />
            </div>

            {/* Financial Overview */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">analytics</span>
                    Financial Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-1">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Assessed Value</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">${(stats?.total_assessed_value || 0).toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Expenses</p>
                        <p className="text-2xl font-bold text-red-600">-${(stats?.total_expenses || 0).toLocaleString()}</p>
                    </div>
                    <div className="space-y-1 border-l border-slate-100 dark:border-slate-700 pl-8">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Net Profit</p>
                        <p className="text-2xl font-bold text-green-600">${(stats?.net_profit || 0).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* County Distribution */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Regional Distribution (Top Counties)</h3>
                    <div className="space-y-5">
                        {stats?.county_stats?.map((c: any, i: number) => (
                            <div key={i} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-300 font-medium">{c.name}</span>
                                    <span className="text-slate-900 dark:text-white font-bold">{c.count} properties</span>
                                </div>
                                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-1000 ease-out"
                                        style={{ width: `${(c.count / (stats.total_properties || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {(!stats?.county_stats || stats.county_stats.length === 0) && (
                            <p className="text-center py-10 text-slate-400 italic">No regional data available yet.</p>
                        )}
                    </div>
                </div>

                {/* Performance Summary Card */}
                <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-xl border border-primary/10 flex flex-col justify-center">
                    <h3 className="font-bold text-lg text-primary mb-2">Performance Insights</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                        Based on your current inventory, {stats?.sold_count} out of {stats?.total_properties} properties have been successfully liquidated.
                        Your current net profit stands at <span className="font-bold text-green-600">${(stats?.net_profit || 0).toLocaleString()}</span>.
                    </p>
                    <div className="flex gap-4 mt-2">
                        <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 flex-1">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Success Rate</p>
                            <p className="text-xl font-bold text-primary">{Math.round((stats?.sold_count / (stats?.total_properties || 1)) * 100)}%</p>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 flex-1">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Active Yield</p>
                            <p className="text-xl font-bold text-primary">${(stats?.total_opening_bids / (stats?.active_count || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon, color }: any) => {
    const colors: any = {
        blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
        green: 'text-green-600 bg-green-50 dark:bg-green-900/20',
        amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
        indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
        primary: 'text-primary bg-primary/10'
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 hover:shadow-lg transition-shadow">
            <div className={`min-w-12 h-12 rounded-full flex items-center justify-center ${colors[color] || colors.primary}`}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
            </div>
        </div>
    );
};
