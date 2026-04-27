import React, { useEffect, useState } from 'react';
import { CircularProgress, Chip } from '@mui/material';
import { ConsultantService } from '../../services/company.service';
import { InvestorTaskService } from '../../services/consultant_task.service';

interface Listing {
  id: number;
  parcel_id?: string;
  address?: string;
  county?: string;
  state?: string;
  property_type?: string;
  assessed_value?: number;
  amount_due?: number;
  lot_acres?: number;
  owner_name?: string;
  availability_status: string;
}

interface ExportedListing extends Listing {
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  notes?: string;
  exported_at?: string;
  is_exported?: boolean;
}

const PropertyCard: React.FC<{ p: ExportedListing }> = ({ p }) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:border-emerald-400/50 hover:shadow-md transition-all flex flex-col gap-3">
    <div>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold text-slate-800 dark:text-white truncate flex-1">{p.address || p.parcel_id}</p>
        {p.is_exported && (
          <span className="shrink-0 text-[9px] font-black uppercase bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Owner Export
          </span>
        )}
      </div>
      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">
        {p.county}, {p.state}
      </p>
    </div>

    <div className="flex flex-wrap gap-1.5">
      {p.assessed_value && (
        <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg">
          ARV: ${Number(p.assessed_value).toLocaleString()}
        </span>
      )}
      {p.amount_due && (
        <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-lg">
          Due: ${Number(p.amount_due).toLocaleString()}
        </span>
      )}
      {p.property_type && (
        <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-lg">
          {p.property_type}
        </span>
      )}
    </div>

    {/* Owner/Investor Contact (only for exports) */}
    {p.is_exported && (p.contact_name || p.contact_phone || p.contact_email) && (
      <div className="border-t border-slate-100 dark:border-slate-700 pt-3 space-y-1">
        <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Investor Contact</p>
        {p.contact_name && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span className="material-symbols-outlined text-[14px]">person</span>
            {p.contact_name}
          </div>
        )}
        {p.contact_phone && (
          <a href={`tel:${p.contact_phone}`} className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
            <span className="material-symbols-outlined text-[14px]">phone</span>
            {p.contact_phone}
          </a>
        )}
        {p.contact_email && (
          <a href={`mailto:${p.contact_email}`} className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline">
            <span className="material-symbols-outlined text-[14px]">mail</span>
            {p.contact_email}
          </a>
        )}
      </div>
    )}

    {p.owner_name && !p.is_exported && (
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="material-symbols-outlined text-[14px]">person</span>
        {p.owner_name}
      </div>
    )}
  </div>
);

const PropertyListings: React.FC = () => {
  const [systemListings, setSystemListings] = useState<Listing[]>([]);
  const [exportedListings, setExportedListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'exported' | 'system'>('exported');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [sys, exp] = await Promise.all([
          ConsultantService.getListings({ limit: 50 }).then(r => r.items || []),
          fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/investor/exports`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }).then(r => r.ok ? r.json() : []).catch(() => []),
        ]);
        setSystemListings(sys);
        setExportedListings(exp);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const exportedMapped: ExportedListing[] = exportedListings.map((e: any) => ({
    id: e.property_id,
    parcel_id: e.parcel_id,
    address: e.address,
    county: e.county,
    state: e.state,
    assessed_value: e.assessed_value,
    amount_due: e.amount_due,
    availability_status: 'available',
    contact_name: e.contact_name,
    contact_phone: e.contact_phone,
    contact_email: e.contact_email,
    notes: e.notes,
    exported_at: e.exported_at,
    is_exported: true,
  }));

  const displayList = tab === 'exported' ? exportedMapped : systemListings.map(p => ({ ...p, is_exported: false }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Property Listings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Properties available for partnership and owner outreach.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 gap-1">
        {[
          { key: 'exported', label: 'Owner Exports', icon: 'upload', count: exportedMapped.length },
          { key: 'system', label: 'System Listings', icon: 'home_work', count: systemListings.length },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
              tab === t.key
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
            {t.label}
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black px-1.5 py-0.5 rounded-full">
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><CircularProgress color="success" /></div>
      ) : displayList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <span className="material-symbols-outlined text-[48px] mb-3 opacity-40">home_search</span>
          <p className="text-sm font-medium">
            {tab === 'exported'
              ? 'No properties exported by investors yet.'
              : 'No system listings available.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayList.map(p => (
            <PropertyCard key={`${p.is_exported ? 'exp' : 'sys'}-${p.id}`} p={p as ExportedListing} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyListings;
