import React, { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { UserService } from '../../services/user.service';

const ActivityLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // We will call the /users/team/logs endpoint we created
        const fetchLogs = async () => {
            try {
                // We'll need to add this method to UserService
                const response = await fetch('/api/v1/users/team/logs', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setLogs(data);
                }
            } catch (err) {
                console.error("Failed to load logs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 w-full">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Team Activity Logs</h1>
                <p className="text-sm text-slate-500 mt-1">Monitor the actions performed by your team members in real-time.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center p-12"><CircularProgress /></div>
                ) : logs.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">No activity recorded yet.</div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {logs.map(log => (
                            <div key={log.id} className="p-4 flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-white capitalize">{log.action_type.replace(/_/g, ' ')}</p>
                                    <p className="text-xs text-slate-500">{log.action_details}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{log.user_email}</p>
                                    <p className="text-[10px] text-slate-400">{new Date(log.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogsPage;
