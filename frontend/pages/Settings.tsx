import React, { useState, useRef } from 'react';
import { AuctionService } from '../services/api';

export const Settings: React.FC = () => {
    const [theme, setTheme] = useState('system');
    const [notifications, setNotifications] = useState(true);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleScrape = async () => {
        try {
            setLoading(true);
            await AuctionService.scrape();
            alert('Scraping started in background!');
        } catch (e) {
            console.error(e);
            alert('Failed to start scraping.');
        } finally {
            setLoading(false);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
            const result = await AuctionService.uploadCSV(file);
            alert(result.message || 'Import successful!');
        } catch (e: any) {
            console.error(e);
            alert(`Import failed: ${e.message}`);
        } finally {
            setLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Reset
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>

            {/* Data Ingestion Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                        <span className="material-symbols-outlined">cloud_sync</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Data Ingestion</h3>
                </div>

                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Manage data collection pipelines. Scraping runs in the background and may take several minutes.
                </p>

                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={handleScrape}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined">public</span>
                        {loading ? 'Processing...' : 'Trigger Cloud Scraper'}
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".csv"
                        className="hidden"
                    />
                    <button
                        onClick={handleImportClick}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined">publish</span>
                        {loading ? 'Uploading...' : 'Upload CSV'}
                    </button>
                </div>
            </div>

            {/* Preferences Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Preferences</h3>

                {/* Appearance */}
                <div className="pb-6 border-b border-slate-200 dark:border-slate-700">
                    <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-2">Appearance</h4>
                    <div className="flex gap-4">
                        {['light', 'dark', 'system'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTheme(t)}
                                className={`px-4 py-2 rounded-lg border capitalize ${theme === t ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Notifications</h3>
                            <p className="text-sm text-slate-500">Receive email updates about new auctions.</p>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50">
                    <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                        Log out of all devices
                    </button>
                </div>
            </div>
        </div>
    );
};
