import React from 'react';
import SystemAnnouncementForm from '../../components/admin/SystemAnnouncementForm';

const AdminBroadcasts: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">System Broadcasts</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Send system-wide announcements that appear on the Client Portal dashboard.
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-200 flex items-start gap-3">
        <span className="material-symbols-outlined text-blue-500 mt-0.5">campaign</span>
        <div>
          <p className="font-semibold mb-1">Broadcast Reach</p>
          <p>Announcements are displayed on the Client Portal dashboard immediately upon publishing. All logged-in clients will see the message on their next page load.</p>
        </div>
      </div>

      <SystemAnnouncementForm />
    </div>
  );
};

export default AdminBroadcasts;
