import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardService } from '../services/dashboard.service';
import { Typography, Grid, Paper, Box, CircularProgress, Divider, Button, Card, CardContent, CardActions } from '@mui/material';
import SystemAnnouncementForm from '../components/admin/SystemAnnouncementForm';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
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
  const totalValueTrend = data?.quick_stats?.total_value_trend || '0%';
  const activeAuctions = data?.quick_stats?.active_count || 0;
  const activeAuctionsTrend = data?.quick_stats?.active_count_trend || '0';
  const pendingCount = data?.quick_stats?.pending_count || 0;
  const pendingCountTrend = data?.quick_stats?.pending_count_trend || '0';

  const QuickLinkAction = ({ icon, label, path, colorClass }: any) => (
    <Button
      variant="outlined"
      startIcon={<span className="material-symbols-outlined">{icon}</span>}
      onClick={() => navigate(path)}
      className={`justify-start px-4 py-3 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left normal-case w-full rounded-xl shadow-sm hover:shadow-md transition-all ${colorClass}`}
    >
      <Box className="flex flex-col">
        <span className="font-semibold text-slate-800 dark:text-slate-100">{label}</span>
      </Box>
    </Button>
  );

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 py-10 px-4">
      {/* Page Heading */}
      <div className="flex flex-col gap-2 mb-2">
        <Typography variant="h4" className="text-slate-900 dark:text-white font-black leading-tight tracking-[-0.033em]">
          Admin Overview
        </Typography>
        <Typography variant="body1" className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
          Complete operational visibility. Monitor system performance, manage daily operations, and broadcast communications to your clients.
        </Typography>
      </div>

      {loading ? (
        <Box display="flex" justifyContent="center" p={8}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {/* Top Row: KPI Cards */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Paper className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 h-full flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 size-24 bg-emerald-100 dark:bg-emerald-900/20 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
                  <Typography variant="overline" className="text-slate-500 tracking-wider font-semibold z-10">Total System Value</Typography>
                  <Box display="flex" alignItems="baseline" gap={2} className="z-10 mt-2">
                    <Typography variant="h3" className="font-bold text-slate-900 dark:text-white">${totalValue.toLocaleString()}</Typography>
                    <Typography variant="body2" className={`font-semibold ${totalValueTrend.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>
                      {totalValueTrend}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Paper className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 h-full flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 size-24 bg-blue-100 dark:bg-blue-900/20 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
                  <Typography variant="overline" className="text-slate-500 tracking-wider font-semibold z-10">Active Auctions</Typography>
                  <Box display="flex" alignItems="baseline" gap={2} className="z-10 mt-2">
                    <Typography variant="h3" className="font-bold text-slate-900 dark:text-white">{activeAuctions}</Typography>
                    <Typography variant="body2" className={`font-semibold ${activeAuctionsTrend.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>
                      {activeAuctionsTrend} this week
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Paper className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 h-full flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 size-24 bg-amber-100 dark:bg-amber-900/20 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
                  <Typography variant="overline" className="text-slate-500 tracking-wider font-semibold z-10">Pending Parcels</Typography>
                  <Box display="flex" alignItems="baseline" gap={2} className="z-10 mt-2">
                    <Typography variant="h3" className="font-bold text-slate-900 dark:text-white">{pendingCount}</Typography>
                    <Typography variant="body2" className={`font-semibold text-slate-500`}>
                      {pendingCountTrend} since yesterday
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Bottom Row */}
          <Grid item xs={12} md={4}>
            <Paper className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 h-full flex flex-col gap-4">
              <Typography variant="h6" className="font-bold text-slate-800 dark:text-slate-200 mb-2">
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={3}>
                <QuickLinkAction icon="add_business" label="Add New Property" path="/properties/new" colorClass="" />
                <QuickLinkAction icon="gavel" label="Manage Auctions" path="/admin/auctions" colorClass="" />
                <QuickLinkAction icon="group" label="User Management" path="/settings" colorClass="" />
                <QuickLinkAction icon="settings" label="System Settings" path="/settings" colorClass="" />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper className="p-0 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 h-full flex flex-col overflow-hidden">
              <Box className="bg-slate-50 dark:bg-slate-800/50 px-6 py-5 border-b border-slate-200 dark:border-slate-700">
                <Box display="flex" alignItems="center" gap={1.5}>
                  <span className="material-symbols-outlined text-primary">campaign</span>
                  <Typography variant="h6" className="font-bold text-slate-800 dark:text-slate-200">
                    System Broadcasts
                  </Typography>
                </Box>
                <Typography variant="body2" className="text-slate-500 mt-1">
                  Create high-priority announcements that will immediately appear on all active Client Portal dashboards.
                </Typography>
              </Box>
              <Box p={6} className="flex-1 bg-white dark:bg-slate-900">
                <SystemAnnouncementForm />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </div>
  );
};