
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminService } from '../services/api';
import { Download, Filter, Plus, Search, Upload } from 'lucide-react';

const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');

  const fetchProperties = async () => {
    setLoading(true);
    try {
      // Use AdminService to get raw property data
      const data = await AdminService.listProperties();
      setProperties(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const result = await AdminService.importProperties(file);
      alert(`Import started! Job ID: ${result.job_id}`);
      // Refresh after a short delay or poll (simple for now)
      setTimeout(fetchProperties, 2000);
    } catch (error: any) {
      console.error('Import failed', error);
      alert(error.message || 'Import failed');
    } finally {
      e.target.value = '';
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(p =>
    (p.parcel_id?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
    (p.county?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
    (p.owner_address?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
    (p.address?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
    (p.state?.toLowerCase() || '').includes(filterText.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Property Inventory</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your real estate assets and auction listings.</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".csv"
            className="hidden"
            id="property-csv-upload"
            onChange={handleImport}
          />
          <button
            onClick={() => document.getElementById('property-csv-upload')?.click()}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Upload size={18} /> Import CSV
          </button>
          <button
            onClick={() => navigate('/properties/new')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={18} /> Add Property
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by Parcel ID, Owner, County, State..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium">
            <Filter size={16} /> Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-semibold uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Parcel Number</th>
                <th className="px-4 py-3">C/S#</th>
                <th className="px-4 py-3">PIN</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">County</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-4 py-3">Sale Year</th>
                <th className="px-4 py-3 text-right">Amount Due</th>
                <th className="px-4 py-3 text-right">Acres</th>
                <th className="px-4 py-3 text-right">Total Value</th>
                <th className="px-4 py-3 text-right">Land</th>
                <th className="px-4 py-3 text-right">Building</th>
                <th className="px-4 py-3">Parcel Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Next Auction</th>
                <th className="px-4 py-3">Occupancy</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={19} className="px-4 py-12 text-center text-slate-500">Loading inventory...</td></tr>
              ) : filteredProperties.length === 0 ? (
                <tr><td colSpan={19} className="px-4 py-12 text-center text-slate-500">No properties found.</td></tr>
              ) : (
                filteredProperties.map((p, idx) => (
                  <tr key={p.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{p.parcel_id}</td>
                    <td className="px-4 py-3">{p.cs_number || '-'}</td>
                    <td className="px-4 py-3">{p.parcel_code || '-'}</td>
                    <td className="px-4 py-3 max-w-[150px] truncate" title={p.owner_name}>{p.owner_name || p.title || '-'}</td>
                    <td className="px-4 py-3">{p.county}</td>
                    <td className="px-4 py-3">{p.state}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {p.status || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{p.tax_sale_year || '-'}</td>
                    <td className="px-4 py-3 text-right font-medium text-red-600">{p.amount_due ? `$${Number(p.amount_due).toLocaleString()}` : '-'}</td>
                    <td className="px-4 py-3 text-right">{p.lot_acres || '-'}</td>
                    <td className="px-4 py-3 text-right">{p.total_market_value ? `$${Number(p.total_market_value).toLocaleString()}` : '-'}</td>
                    <td className="px-4 py-3 text-right">{p.land_value ? `$${Number(p.land_value).toLocaleString()}` : '-'}</td>
                    <td className="px-4 py-3 text-right">{p.improvement_value || '-'}</td>
                    <td className="px-4 py-3">{p.property_type || '-'}</td>
                    <td className="px-4 py-3">{p.status || '-'}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate" title={p.address}>{p.address || '-'}</td>
                    <td className="px-4 py-3">{p.next_auction_date || '-'}</td>
                    <td className="px-4 py-3">{p.occupancy || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => navigate(`/properties/${p.parcel_id}/edit`)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-between items-center text-sm text-slate-500">
          <span>Showing {filteredProperties.length} properties</span>
          <div className="flex gap-2">
            <button disabled className="px-3 py-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50">Previous</button>
            <button disabled className="px-3 py-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;