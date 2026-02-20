import React, { useState, useRef } from 'react';
import { AuthService } from '../services/auth.service';
import { AdminService } from '../services/admin.service';
import { useAuth } from '../context/AuthContext';
import { UserManagement } from './Settings/UserManagement';

type Tab = 'general' | 'users';

export const Settings: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [theme, setTheme] = useState('system');
    const [notifications, setNotifications] = useState(true);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleLogout = () => {
        AuthService.logout();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
            const result = await AdminService.importProperties(file);
            alert(`Import started! Job ID: ${result.job_id}`);
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

    const isAdmin = user?.role === 'admin' || user?.is_superuser;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'general'
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                        }`}
                >
                    General
                </button>
                {isAdmin && (
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'users'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                            }`}
                    >
                        Users
                    </button>
                )}
            </div>

            {/* Tab Content */}
            {activeTab === 'general' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                                        className={`px-4 py-2 rounded-lg border capitalize ${theme === t
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                            }`}
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
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50">
                            <button onClick={handleLogout} className="text-red-600 hover:text-red-700 font-medium text-sm">
                                Log out of all devices
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && isAdmin && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <UserManagement />
                </div>
            )}
        </div>
    );
};
