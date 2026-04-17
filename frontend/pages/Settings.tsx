import React, { useState, useRef } from 'react';
import { AuthService } from '../services/auth.service';
import { AdminService } from '../services/admin.service';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { UserManagement } from './Settings/UserManagement';

type Tab = 'general' | 'users' | 'companies';

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

    const { companies, activeCompany, createCompany, selectCompany, deleteCompany } = useCompany();
    const [newCompanyName, setNewCompanyName] = useState('');


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
                <button
                    onClick={() => setActiveTab('companies')}
                    className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'companies'
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                        }`}
                >
                    Companies
                </button>
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

            {activeTab === 'companies' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">My Connected Companies</h3>
                        </div>

                        <div className="space-y-4">
                            {companies.map(company => (
                                <div key={company.id} className={`p-4 rounded-xl border flex items-center justify-between ${company.is_active ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${company.is_active ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                            <span className="material-symbols-outlined">{company.is_active ? 'domain_verification' : 'domain'}</span>
                                        </div>
                                        <div>
                                            <h4 className={`text-sm font-bold ${company.is_active ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>{company.name}</h4>
                                            <p className="text-xs text-slate-500">ID: {company.id} {company.is_active && '• Active Context'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {!company.is_active && (
                                            <button 
                                                onClick={() => selectCompany(company.id)}
                                                className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                                            >
                                                Switch Context
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => {
                                                if (window.confirm(`Delete company ${company.name}? This will unlink lists associated with it.`)) {
                                                    deleteCompany(company.id);
                                                }
                                            }}
                                            className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {companies.length === 0 && (
                                <div className="text-center py-6 text-sm text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                    You haven't created any companies yet. Actions will default to your personal profile.
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Register New Company</h4>
                            <div className="flex gap-3">
                                <input 
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                                    value={newCompanyName}
                                    onChange={e => setNewCompanyName(e.target.value)}
                                    placeholder="Company Legal Name (e.g., Summit Holdings LLC)"
                                />
                                <button 
                                    disabled={!newCompanyName.trim()}
                                    onClick={async () => {
                                        await createCompany(newCompanyName);
                                        setNewCompanyName('');
                                    }}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                                >
                                    Create Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
