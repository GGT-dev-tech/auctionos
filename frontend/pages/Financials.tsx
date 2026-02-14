import React, { useEffect, useState } from 'react';
import { AuctionService } from '../services/api';

export const Financials: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        AuctionService.getStats()
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-10 text-center">Loading financials...</div>;

    if (!stats || stats.total_properties === 0) {
        return (
            <div className="max-w-7xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Overview</h2>
                <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">analytics</span>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Financial Data Available</h3>
                    <p className="text-slate-500 mb-6 text-center max-w-md">
                        Import properties via CSV or create them manually to see financial insights and ROI predictions.
                    </p>
                </div>
            </div>
        )
    }

    const totalAssetValue = stats?.total_assessed_value || 0;
    const capitalRequired = stats?.total_opening_bids || 0;

    // Simple ROI: (Assessed - OpeningBid) / OpeningBid (if we bought everything at opening bid)
    // This is "Potential ROI" across all active/draft inventory
    const potentialSpread = totalAssetValue - capitalRequired;
    const roi = capitalRequired > 0 ? (potentialSpread / capitalRequired) * 100 : 0;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Total Assessed Value" value={totalAssetValue} icon="real_estate_agent" color="emerald" />
                <StatCard label="Total Capital Invested" value={capitalRequired} sub="Opening Bids + Expenses" icon="paid" color="blue" />
                <StatCard label="Total Expenses" value={stats?.total_expenses || 0} icon="receipt_long" color="orange" />
                <StatCard
                    label="Net Profit (Est)"
                    value={stats?.net_profit || 0}
                    icon="trending_up"
                    color={(stats?.net_profit || 0) >= 0 ? "green" : "red"}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">ROI Analysis</h3>
                    <div className="flex items-center justify-center p-8">
                        <div className="text-center">
                            <p className="text-sm text-slate-500">Predicted ROI</p>
                            <p className="text-5xl font-bold text-blue-600">{roi.toFixed(1)}%</p>
                            <p className="text-xs text-slate-400 mt-2">Based on Assessed Value vs Cost</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Expense Breakdown</h3>
                    <div className="flex items-center justify-center p-8 text-slate-500">
                        Chart visualization coming soon
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, sub, icon, color }: any) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className={`w-10 h-10 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center text-${color}-600 dark:text-${color}-400 mb-4`}>
            <span className="material-symbols-outlined">{icon}</span>
        </div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">${value.toLocaleString()}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
);
