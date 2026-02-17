import React, { useState, useEffect } from 'react';
import { InventoryService } from '../services/api';
import { Property } from '../types';
import { Link } from 'react-router-dom';

export const ParcelSearch: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        state: 'AR', // Defaulting to AR as per data
        county: '',
        parcel_number: ''
    });

    useEffect(() => {
        loadProperties();
    }, [filters.state]);

    const loadProperties = async () => {
        setLoading(true);
        try {
            // Using existing list endpoint, might need refinement for search params
            const data = await InventoryService.getList(1, 100);
            setProperties(data.items);
        } catch (e) {
            console.error("Failed to load properties", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header / Filter Bar */}
            <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-20 shadow-sm">
                <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">Parcel Search</h1>
                        <span className="material-symbols-outlined text-blue-500 text-3xl">search</span>
                        <span className="text-xl font-light text-gray-500">{properties.length} parcels</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="text"
                            placeholder="Filter by Parcel #..."
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            value={filters.parcel_number}
                            onChange={e => setFilters({ ...filters, parcel_number: e.target.value })}
                        />
                        <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded shadow-sm text-sm font-medium flex items-center transition-colors">
                            <span className="material-symbols-outlined text-base mr-1">file_download</span> Export CSV
                        </button>
                        <button className="bg-sky-500 hover:bg-sky-600 text-white py-2 px-4 rounded shadow-sm text-sm font-medium flex items-center transition-colors">
                            <span className="material-symbols-outlined text-base mr-1">map</span> Map View
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="flex-grow overflow-auto bg-gray-50 p-4">
                <div className="max-w-[1920px] mx-auto bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-3 text-left font-bold text-gray-700 uppercase tracking-wider sticky left-0 z-10 bg-gray-50">Parcel Number</th>
                                <th className="px-3 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">C/S #</th>
                                <th className="px-3 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Name</th>
                                <th className="px-3 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">County</th>
                                <th className="px-3 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">State</th>
                                <th className="px-3 py-3 text-right font-bold text-gray-700 uppercase tracking-wider">Amount Due</th>
                                <th className="px-3 py-3 text-right font-bold text-gray-700 uppercase tracking-wider">Total Value</th>
                                <th className="px-3 py-3 text-right font-bold text-gray-700 uppercase tracking-wider">Land Value</th>
                                <th className="px-3 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Type</th>
                                <th className="px-3 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Next Auction</th>
                                <th className="px-3 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {properties.map((p: any) => (
                                <tr key={p.id} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-3 py-4 whitespace-nowrap sticky left-0 bg-white z-10 font-medium text-blue-600">
                                        <Link to={`/properties/${p.id}`} className="hover:underline">{p.parcel_number || 'N/A'}</Link>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-gray-500">{p.cs_number || '-'}</td>
                                    <td className="px-3 py-4 text-gray-900 max-w-xs truncate" title={p.owner_name}>{p.owner_name}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-gray-500">{p.county}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-gray-500">{p.state}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-right text-gray-900 font-mono">
                                        {p.amount_due ? `$${p.amount_due.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-right text-gray-900 font-mono">
                                        {p.total_value ? `$${p.total_value.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-right text-gray-500 font-mono">
                                        {p.land_value ? `$${p.land_value.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-gray-500">{p.parcel_type}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-green-600 font-medium">
                                        {p.next_auction_date ? new Date(p.next_auction_date).toLocaleDateString() : 'Available'}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-gray-500">
                                        <Link to={`/properties/${p.id}`} className="text-blue-600 hover:text-blue-800">Details</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
