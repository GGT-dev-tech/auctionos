import React, { useEffect, useState } from 'react';
import { DashboardService } from '../services/dashboard.service';
import { Property } from '../types';
import { HunterMap } from '../components/HunterMap';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // Filters
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCounty, setSelectedCounty] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardData = await DashboardService.getInitData();
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
  const pending = data?.quick_stats?.pending_count || 0;

  // Filter propertis for "Recent Activity" or if we want to show a list alongside map
  // For now, consistent with design, map is main focus.

  const mapData = data?.county_stats || [];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-10">
      {/* Page Heading */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base font-medium">
            Real-time auction data and visualization.
          </p>
        </div>

        {/* Filters Area (Mock for now until we have data to filter) */}
        <div className="flex items-center gap-2">
          <select
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            <option value="">All States</option>
            <option value="FL">Florida</option>
            <option value="TX">Texas</option>
            <option value="CA">California</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="material-symbols-outlined text-slate-400 text-[20px]">calendar_today</span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total Value (Opening Bids)', icon: 'payments', value: `$${totalValue.toLocaleString()}`, color: 'text-emerald-500' },
          { label: 'Active Auctions', icon: 'gavel', value: activeAuctions.toString(), color: 'text-blue-500' },
          { label: 'Pending / Draft', icon: 'pending_actions', value: pending.toString(), color: 'text-amber-500' },
        ].map((stat, idx) => (
          <div key={idx} className="flex flex-col gap-3 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wide">{stat.label}</p>
              <span className={`material-symbols-outlined ${stat.color}`}>{stat.icon}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-slate-900 dark:text-white text-3xl font-bold leading-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Map Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Hunter's Map</h2>
        {/* Note: HunterMap handles its own container styling */}
        <HunterMap
          data={mapData}
          onSelectRegion={(state, county) => {
            setSelectedState(state); // We might need a map from county to state if state is missing
            setSelectedCounty(county);
            console.log("Selected:", state, county);
          }}
        />
        <div className="flex gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#0A3412] rounded-full"></div>
            <span>High Activity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#EAEAEC] border border-slate-300 rounded-full"></div>
            <span>No Activity</span>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      {data?.analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Investment Distribution</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(data.analytics.status_distribution || {}).map(([name, value]) => ({ name, value }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {Object.entries(data.analytics.status_distribution || {}).map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Spend vs. Potential Equity</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.analytics.spend_vs_equity}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.analytics.spend_vs_equity.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {data?.analytics?.county_breakdown && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">County Performance (Property Volume)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.analytics.county_breakdown} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="range" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={150} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">Recent Activity</h2>
          <Link to="/properties" className="text-primary text-sm font-medium hover:underline">View All</Link>
        </div>
        <div className="p-6">
          {data?.recent_activity?.map((prop: Property) => (
            <div key={prop.id} className="grid grid-cols-[40px_1fr] gap-x-4 mb-4 border-b last:border-0 pb-2 last:pb-0 border-slate-100">
              <div className="flex flex-col items-center pt-1">
                <span className="material-symbols-outlined text-slate-400">home</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{prop.title}</p>
                <p className="text-sm text-slate-500">{prop.address}, {prop.city}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${prop.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                    {prop.status}
                  </span>
                  <span className="text-xs text-slate-400">Added {new Date(prop.created_at || '').toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
          {(!data?.recent_activity || data.recent_activity.length === 0) && !loading && <p>No recent activity found.</p>}
        </div>
      </div>
    </div>
  );
};