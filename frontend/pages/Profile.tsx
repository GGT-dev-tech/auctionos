import React from 'react';

export const Profile: React.FC = () => {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">User Profile</h1>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500">
                        <span className="material-symbols-outlined text-[40px]">person</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Admin User</h2>
                        <p className="text-slate-500">admin@example.com</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <p className="text-slate-500 dark:text-slate-400">Profile settings and preferences.</p>
                    {/* Add form for password change, etc. */}
                </div>
            </div>
        </div>
    );
};
