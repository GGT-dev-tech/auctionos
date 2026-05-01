import React, { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';

const BillingPage: React.FC = () => {
    const [usage, setUsage] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsage = async () => {
            try {
                const response = await fetch('/api/v1/billing/usage', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsage(data);
                }
            } catch (err) {
                console.error("Failed to fetch billing", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsage();
    }, []);

    if (loading) return <div className="flex justify-center p-12"><CircularProgress /></div>;

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 w-full">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Billing & Subscription</h1>
                <p className="text-base text-slate-500 mt-1">Manage your plan and monitor usage limits.</p>
            </div>

            {/* Current Plan Overview */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Current Plan</h3>
                            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider">Active</span>
                        </div>
                        <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 capitalize">
                            {usage?.limit_bytes > 5*1024*1024*1024 ? 'Pro' : 'Trial'}
                        </p>
                        <p className="text-sm text-slate-500 mt-2">You are currently on the trial plan. Upgrade to unlock more limits.</p>
                    </div>
                    
                    <div className="w-full md:w-1/2">
                        <h4 className="text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">Cloud Storage Usage</h4>
                        <div className="flex justify-between text-xs mb-2 font-semibold">
                            <span className="text-blue-600 dark:text-blue-400">{formatBytes(usage?.total_bytes || 0)} Used</span>
                            <span className="text-slate-500">{formatBytes(usage?.limit_bytes || 0)} Limit</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 mb-2">
                            <div 
                                className="bg-blue-600 h-3 rounded-full transition-all" 
                                style={{ width: `${Math.min(usage?.usage_percent || 0, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pricing Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Trial Plan */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Trial</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-black text-slate-900 dark:text-white">$0</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                        <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <span className="material-symbols-outlined text-[18px] text-emerald-500">check_circle</span> 1 Week Access
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <span className="material-symbols-outlined text-[18px] text-emerald-500">check_circle</span> Max 5 Searches
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <span className="material-symbols-outlined text-[18px] text-emerald-500">check_circle</span> Max 5 Property Details
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <span className="material-symbols-outlined text-[18px] text-emerald-500">check_circle</span> 1 Company Allowed
                        </li>
                    </ul>
                    <button disabled className="w-full py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 font-bold rounded-xl">Current Plan</button>
                </div>

                {/* Pro Plan */}
                <div className="bg-blue-600 rounded-2xl border border-blue-500 p-6 flex flex-col shadow-lg shadow-blue-900/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-lg">Recommended</div>
                    <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                    <div className="flex items-baseline gap-1 mb-6 text-white">
                        <span className="text-4xl font-black">$130</span>
                        <span className="text-sm opacity-80">/month</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1 text-blue-100">
                        <li className="flex items-center gap-2 text-sm">
                            <span className="material-symbols-outlined text-[18px] text-blue-300">check_circle</span> 5,000 Searches
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                            <span className="material-symbols-outlined text-[18px] text-blue-300">check_circle</span> 5,000 Property Details
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                            <span className="material-symbols-outlined text-[18px] text-blue-300">check_circle</span> Multiple Companies
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                            <span className="material-symbols-outlined text-[18px] text-blue-300">check_circle</span> Standard Support
                        </li>
                    </ul>
                    <button className="w-full py-2.5 bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl transition-colors shadow-sm">Upgrade to Pro</button>
                </div>

                {/* Enterprise Plan */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Enterprise</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-black text-slate-900 dark:text-white">$350</span>
                        <span className="text-sm text-slate-500">/month</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                        <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <span className="material-symbols-outlined text-[18px] text-emerald-500">check_circle</span> <b>Unlimited</b> Searches
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <span className="material-symbols-outlined text-[18px] text-emerald-500">check_circle</span> <b>Unlimited</b> Property Details
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <span className="material-symbols-outlined text-[18px] text-emerald-500">check_circle</span> Priority API Access
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <span className="material-symbols-outlined text-[18px] text-emerald-500">check_circle</span> 24/7 Priority Support
                        </li>
                    </ul>
                    <button className="w-full py-2.5 bg-slate-800 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-100 font-bold rounded-xl transition-colors">Contact Sales</button>
                </div>
            </div>
        </div>
    );
};

export default BillingPage;
