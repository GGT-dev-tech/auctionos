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
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 w-full">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Billing & Subscription</h1>
                <p className="text-sm text-slate-500 mt-1">Manage your plan and monitor usage limits.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cloud Storage Widget */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Cloud Storage Limit</h3>
                    <div className="flex justify-between text-sm mb-2 font-semibold">
                        <span className="text-blue-600 dark:text-blue-400">{formatBytes(usage?.total_bytes || 0)} Used</span>
                        <span className="text-slate-500">{formatBytes(usage?.limit_bytes || 0)} Limit</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 mb-2">
                        <div 
                            className="bg-blue-600 h-3 rounded-full transition-all" 
                            style={{ width: `${Math.min(usage?.usage_percent || 0, 100)}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-500">{usage?.usage_percent}% of your current plan limits used.</p>
                </div>

                {/* Current Plan Widget */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Current Plan</h3>
                            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full uppercase">Active</span>
                        </div>
                        <p className="text-3xl font-extrabold text-slate-900 dark:text-white capitalize">{usage?.limit_bytes > 5*1024*1024*1024 ? 'Pro' : 'Trial'}</p>
                        <p className="text-sm text-slate-500 mt-2">Upgrade to increase your search limits and storage capacity.</p>
                    </div>
                    <button className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition">
                        Upgrade Plan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BillingPage;
