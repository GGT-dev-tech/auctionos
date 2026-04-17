import React, { useState } from 'react';

const ChangePasswordPage: React.FC = () => {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: will call /api/v1/auth/change-password
    setStatus('success');
    setForm({ current: '', next: '', confirm: '' });
    setTimeout(() => setStatus('idle'), 4000);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Change Password</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Update your account password below.</p>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {(['current', 'next', 'confirm'] as const).map((field, i) => (
            <div key={field}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {['Current Password', 'New Password', 'Confirm New Password'][i]}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="password"
                value={form[field]}
                onChange={(e) => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                required
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-full mt-2 py-2.5 px-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            Update Password
          </button>
          {status === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-800 text-sm">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Password updated successfully.
            </div>
          )}
        </form>
      </div>

      <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-800 dark:text-amber-200">
        <span className="font-semibold">Note:</span> Backend integration in progress. Changes are not saved yet.
      </div>
    </div>
  );
};

export default ChangePasswordPage;
