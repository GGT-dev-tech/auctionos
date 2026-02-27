import React, { useEffect, useState } from 'react';
import { DashboardService } from '../services/dashboard.service';
import { Typography, Grid, Paper, Box, CircularProgress, Divider } from '@mui/material';
import SystemAnnouncementForm from '../components/admin/SystemAnnouncementForm';

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Can pass empty filters, we just want quick stats
        const dashboardData = await DashboardService.getInitData({});
        setData(dashboardData);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalValue = data?.quick_stats?.total_value || 0;
  const activeAuctions = data?.quick_stats?.active_count || 0;
  const pendingCount = data?.quick_stats?.pending_count || 0;

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-10 px-4 mt-6">
      {/* Page Heading */}
      <div className="flex flex-col gap-1 mb-4">
        <Typography variant="h4" className="text-slate-900 dark:text-white font-black leading-tight tracking-[-0.033em]">
          System Overview
        </Typography>
        <Typography variant="body1" className="text-slate-500 dark:text-slate-400 font-medium">
          Manage properties, auctions, and active client broadcasts.
        </Typography>
      </div>

      {loading ? (
        <Box display="flex" justifyContent="center" p={8}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {/* Left Column: Quick Stats */}
          <Grid item xs={12} md={5} lg={4}>
            <Paper className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 h-full flex flex-col gap-6">
              <Typography variant="h6" className="font-bold text-slate-800 dark:text-slate-200">
                Global Metrics
              </Typography>
              <Divider />

              <Box>
                <Typography variant="overline" className="text-slate-500 tracking-wider">
                  Total System Value
                </Typography>
                <Typography variant="h3" className="font-bold text-emerald-600 dark:text-emerald-400">
                  ${totalValue.toLocaleString()}
                </Typography>
              </Box>

              <Box>
                <Typography variant="overline" className="text-slate-500 tracking-wider">
                  Active Auctions
                </Typography>
                <Typography variant="h3" className="font-bold text-blue-600 dark:text-blue-400">
                  {activeAuctions}
                </Typography>
              </Box>

              <Box>
                <Typography variant="overline" className="text-slate-500 tracking-wider">
                  Pending Parcels
                </Typography>
                <Typography variant="h3" className="font-bold text-amber-600 dark:text-amber-400">
                  {pendingCount}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column: System Announcements Control */}
          <Grid item xs={12} md={7} lg={8}>
            <Paper className="p-0 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 h-full overflow-hidden">
              <Box className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <Typography variant="h6" className="font-bold text-slate-800 dark:text-slate-200">
                  Client Broadcasts
                </Typography>
                <Typography variant="body2" className="text-slate-500">
                  Create and manage announcements visible on the Client Portal dashboard.
                </Typography>
              </Box>
              <Box p={4}>
                <SystemAnnouncementForm />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </div>
  );
};