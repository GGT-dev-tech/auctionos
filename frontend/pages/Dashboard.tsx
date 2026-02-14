import React, { useEffect, useState } from 'react';
import { AuctionService } from '../services/api';
import { Property } from '../types';
import { MapCmp } from '../components/MapCmp';

export const Dashboard: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [propsData, statsData] = await Promise.all([
          AuctionService.getProperties(),
          AuctionService.getStats()
        ]);
        setProperties(propsData);
        setStats(statsData);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Calculate stats from backend or fallback
  const totalValue = stats?.total_value || 0;
  const activeAuctions = stats?.active_count || 0;
  const pending = (stats?.pending_count || 0) + (stats?.draft_count || 0);

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
          { label: 'Total Value (Opening Bids)', icon: 'payments', value: `$${totalValue.toLocaleString()}`, color: 'text-emerald-500', badge: 'bg-emerald-50 text-emerald-600' },
          { label: 'Active Auctions', icon: 'gavel', value: activeAuctions.toString(), color: 'text-blue-500', badge: 'bg-blue-50 text-blue-600' },
          { label: 'Pending / Draft', icon: 'pending_actions', value: pending.toString(), color: 'text-amber-500', badge: 'bg-amber-50 text-amber-600' },
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
      <div className="w-full h-[500px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-1">
        <div className="w-full h-full rounded-lg overflow-hidden relative z-0">
          <MapCmp properties={properties.filter(p => p.status !== 'draft' && p.status !== 'inactive')} />
        </div>
      </div>

      {/* Recent Activity (Still mocked mostly, but could be real if we define activity log) */}
      <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">Latest Properties</h2>
        </div>
        <div className="p-6">
          {properties.slice(0, 5).map((prop) => (
            <div key={prop.id} className="grid grid-cols-[40px_1fr] gap-x-4 mb-4 border-b last:border-0 pb-2 last:pb-0 border-slate-100">
              <div className="flex flex-col items-center pt-1">
                <span className="material-symbols-outlined text-slate-400">home</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{prop.title}</p>
                <p className="text-sm text-slate-500">{prop.address}, {prop.city}</p>
                <p className="text-xs text-slate-400">Status: {prop.status}</p>
              </div>
            </div>
          ))}
          {properties.length === 0 && !loading && <p>No properties found.</p>}
        </div>
      </div>
    </div>
  );
};