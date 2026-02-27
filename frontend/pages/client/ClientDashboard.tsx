import React from 'react';
import { Typography, Paper } from '@mui/material';

// TODO: In the future, this will fetch from /api/v1/admin/announcements
const ClientDashboard: React.FC = () => {
    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <Typography variant="h4" className="font-bold text-slate-800 dark:text-white">
                Welcome to your Portal
            </Typography>
            <Paper className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                <Typography variant="h6" color="primary">System Announcements</Typography>
                <Typography variant="body1" className="mt-2 text-slate-600 dark:text-slate-300">
                    No active announcements at this time.
                </Typography>
            </Paper>
        </div>
    );
};

export default ClientDashboard;
