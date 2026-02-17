import React, { useState, useEffect } from 'react';
import { AuctionService } from '../services/api'; // Using AuctionService.search or getProperties
import { Property } from '../types';
import { Link } from 'react-router-dom';
import { PropertyDetailsModal } from '../components/PropertyDetailsModal';
import { SearchFilters, FilterState } from '../components/SearchFilters';

export const ListSearch: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Filters State
    const [filters, setFilters] = useState<FilterState>({
        state: '',
        county: '',
        zip_code: '',
        status: '',
        inventory_type: '',
        min_appraisal: '',
        max_appraisal: '',
        min_amount_due: '',
        max_amount_due: '',
        min_acreage: '',
        max_acreage: '',
        occupancy: '',
        owner_state: '',
        improvements: '',
        keyword: '',
        added_since: '',
        exclude_unavailable: false,
        max_results: 100
    });

    const [limit, setLimit] = useState(100);
    const [skip, setSkip] = useState(0);

    const handleFilterChange = (name: string, value: any) => {
        setFilters(prev => ({ ...prev, [name]: value }));
        setSkip(0);
    };

    const fetchProperties = async () => {
        setLoading(true);
        try {
            // Prepare params
            const params: any = { ...filters, limit, skip };

            // Convert 'improvements' to boolean if needed
            if (filters.improvements === 'yes') params.improvements = true;
            if (filters.improvements === 'no') params.improvements = false;

            // Numbers parsing
            if (filters.min_appraisal) params.min_appraisal = parseFloat(String(filters.min_appraisal));
            if (filters.max_appraisal) params.max_appraisal = parseFloat(String(filters.max_appraisal));

            const data = await AuctionService.search(params);
            setProperties(data);
            setShowFilters(false); // Close filters on search
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial load and URL param parsing
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const initialFilters: any = { ...filters };

        ['state', 'county', 'zip_code', 'status', 'inventory_type', 'occupancy', 'owner_state', 'keyword'].forEach(key => {
            const val = params.get(key);
            if (val) initialFilters[key] = val;
        });

        if (params.get('min_date')) initialFilters.min_date = params.get('min_date');
        if (params.get('max_date')) initialFilters.max_date = params.get('max_date');

        setFilters(initialFilters);

        const doFetch = async () => {
            setLoading(true);
            try {
                const apiParams: any = { ...initialFilters, limit, skip };
                if (initialFilters.improvements === 'yes') apiParams.improvements = true;
                if (initialFilters.improvements === 'no') apiParams.improvements = false;

                const data = await AuctionService.search(apiParams);
                setProperties(data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };

        doFetch();
    }, []);

    const handleSearch = () => {
        fetchProperties();
    };

    const clearFilters = () => {
        setFilters({ max_results: 100 });
        setSkip(0);
        // Optional: auto-fetch or wait
    };

    return (
        <div className="relative flex h-[calc(100vh-64px)] overflow-hidden flex-col">

            {/* Top Bar */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-2 font-bold rounded flex items-center gap-2 transition-colors ${showFilters ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                        <span className="material-symbols-outlined">filter_list</span>
                        Search Filters
                    </button>
                    <div className="h-6 w-px bg-slate-300 dark:bg-slate-700"></div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Results <span className="text-slate-400 font-normal text-base">({properties.length} loaded)</span>
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100">
                        <span className="material-symbols-outlined">grid_view</span>
                    </button>
                    <button className="p-2 text-blue-600 bg-blue-50 rounded border border-blue-200">
                        <span className="material-symbols-outlined">view_list</span>
                    </button>
                    <button className="p-2 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100">
                        <span className="material-symbols-outlined">map</span>
                    </button>
                </div>
            </div>

            {/* Filters Modal Overlay */}
            {showFilters && (
                <div className="absolute top-[73px] left-0 w-full z-40 p-4 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm h-full overflow-y-auto">
                    <div className="max-w-5xl mx-auto shadow-2xl rounded-lg overflow-hidden ring-1 ring-slate-900/5">
                        <SearchFilters
                            filters={filters}
                            onChange={handleFilterChange}
                            onSearch={handleSearch}
                            onClear={clearFilters}
                            className="h-full"
                        />
                    </div>
                </div>
            )}

            {/* Results Area */}
            <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 p-4">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-medium">
                                <tr>
                                    <th className="p-3">State/County</th>
                                    <th className="p-3">Parcel ID</th>
                                    <th className="p-3">Address</th>
                                    <th className="p-3">Owner</th>
                                    <th className="p-3 text-right">Appraised</th>
                                    <th className="p-3 text-right">Amt Due/Bid</th>
                                    <th className="p-3 text-right">Acres</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {properties.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="p-8 text-center text-slate-500">
                                            No properties found matching filters.
                                        </td>
                                    </tr>
                                ) : (
                                    properties.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="p-3">
                                                <div className="font-medium text-slate-900 dark:text-white">{p.state}</div>
                                                <div className="text-xs text-slate-500">{p.county}</div>
                                            </td>
                                            <td className="p-3 font-mono text-xs select-all text-blue-600 hover:underline cursor-pointer" onClick={() => setSelectedProperty(p)}>{p.parcel_id}</td>
                                            <td className="p-3 max-w-[200px] truncate" title={p.address || ''}>
                                                {p.address || 'N/A'}
                                            </td>
                                            <td className="p-3 max-w-[150px] truncate" title={p.owner_name || ''}>
                                                {p.owner_name || '-'}
                                            </td>
                                            <td className="p-3 text-right font-mono">
                                                {p.details?.total_market_value
                                                    ? `$${p.details.total_market_value.toLocaleString()}`
                                                    : (p.details?.assessed_value ? `$${p.details.assessed_value.toLocaleString()}` : '-')}
                                            </td>
                                            <td className="p-3 text-right font-mono font-bold text-emerald-600">
                                                {p.amount_due ? `$${p.amount_due.toLocaleString()}` : (p.price ? `$${p.price.toLocaleString()}` : '-')}
                                            </td>
                                            <td className="p-3 text-right font-mono text-slate-500">
                                                {p.details?.lot_acres ? `${p.details.lot_acres} ac` : '-'}
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                                    ${p.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        p.status === 'sold' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                                    {p.status}
                                                </span>
                                                {p.inventory_type === 'otc' && (
                                                    <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">OTC</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-center">
                                                <button
                                                    onClick={() => setSelectedProperty(p)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100"
                                                >
                                                    Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {selectedProperty && (
                <PropertyDetailsModal
                    property={selectedProperty}
                    onClose={() => setSelectedProperty(null)}
                    onUpdate={() => {
                        fetchProperties(); // Refresh list if updated
                    }}
                />
            )}
        </div>
    );
};
