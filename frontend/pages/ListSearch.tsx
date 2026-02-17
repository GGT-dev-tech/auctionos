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
        keyword: ''
    });

    const [limit, setLimit] = useState(50);
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

            // Numbers parsing handled by API Service or Backend usually, but good to be safe if strictly typed
            if (filters.min_appraisal) params.min_appraisal = parseFloat(String(filters.min_appraisal));
            if (filters.max_appraisal) params.max_appraisal = parseFloat(String(filters.max_appraisal));

            const data = await AuctionService.search(params);
            setProperties(data);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial load and URL param parsing
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const newFilters: any = { ...filters };

        let hasChanges = false;

        // Map URL params to filters
        ['state', 'county', 'zip_code', 'status', 'inventory_type', 'occupancy', 'owner_state', 'keyword'].forEach(key => {
            const val = params.get(key);
            if (val) {
                newFilters[key] = val;
                hasChanges = true;
            }
        });

        // Handle numeric/boolean URL params if needed in future, essentially everything in URL is string until submit
        // But our state uses strings for inputs usually.

        if (hasChanges) {
            setFilters(newFilters);
            // The existing useEffect dependent on [limit] will likely run. 
            // We should ideally trigger fetchProperties with these new filters.
            // But fetchProperties uses 'filters' state which might be stale in this closure if we just called setFilters.
            // Actually, because we update state, a re-render happens. 
            // We need to ensure fetch runs with new filters.
        } else {
            // If no params, we just run default fetch (handled by the other useEffect or here?)
        }
    }, []); // Run once on mount

    // Fetch when filters or pagination changes - actually we only want to fetch when user clicks Search OR on mount/param load.
    // The previous useEffect had [limit].

    // Let's change the pattern: 
    // 1. On mount, load params, then fetch.

    useEffect(() => {
        // We need to fetch AFTER filters are set from URL (if any).
        // To avoid double fetch, we can use a ref or just rely on the fact that setFilters triggers re-render.
        // But we don't have a useEffect on [filters].

        // Simple approach: parse params, set filters, then fetch.
        const params = new URLSearchParams(window.location.search);
        const initialFilters: any = { ...filters };

        ['state', 'county', 'zip_code', 'status', 'inventory_type', 'occupancy', 'owner_state', 'keyword'].forEach(key => {
            const val = params.get(key);
            if (val) initialFilters[key] = val;
        });

        // Also handle min_date / max_date if we want to support them in filters state??
        // Wait, FilterState interface defined in SearchFilters.tsx might not have min_date/max_date yet?
        // Let's check FilterState.
        // It has min_appraisal etc. It does NOT have date.
        // If I want to filter by Auction Date, I need to add date fields to SearchFilters/FilterState.

        // For now, let's assume I need to Add Date inputs to SearchFilters too?
        // Yes, likely.

        if (params.get('min_date')) initialFilters.min_date = params.get('min_date');
        if (params.get('max_date')) initialFilters.max_date = params.get('max_date');

        setFilters(initialFilters);

        // Now fetch
        // We need to pass these specific filters to search, because state update 'setFilters' is async and 'filters' here is old.
        // We'll create a helper to fetch.

        const doFetch = async () => {
            setLoading(true);
            try {
                const apiParams: any = { ...initialFilters, limit, skip };
                // ... conversions ...
                if (initialFilters.improvements === 'yes') apiParams.improvements = true;
                if (initialFilters.improvements === 'no') apiParams.improvements = false;
                if (initialFilters.min_appraisal) apiParams.min_appraisal = parseFloat(initialFilters.min_appraisal);
                if (initialFilters.max_appraisal) apiParams.max_appraisal = parseFloat(initialFilters.max_appraisal);

                const data = await AuctionService.search(apiParams);
                setProperties(data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };

        doFetch();

    }, [limit]); // And maybe empty dependency if we only want mount? But limit change should re-fetch.
    // Ideally we remove the other useEffect/fetchProperties to avoid confusion.


    const handleSearch = () => {
        fetchProperties();
    };

    const clearFilters = () => {
        setFilters({});
        setSkip(0);
        // We can trigger fetch or wait for user
        setTimeout(fetchProperties, 0);
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            {/* Sidebar Filters */}
            <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto p-4 shrink-0">
                <SearchFilters
                    filters={filters}
                    onChange={handleFilterChange}
                    onSearch={handleSearch}
                    onClear={clearFilters}
                />
            </div>

            {/* Results Area */}
            <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                        Results <span className="text-slate-400 font-normal text-base">({properties.length} loaded)</span>
                    </h1>
                    <div className="flex items-center gap-2">
                        {/* View Toggles could go here (Grid/List) */}
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4">
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
                                        <th className="p-3 text-center">Status</th>
                                        <th className="p-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {properties.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="p-8 text-center text-slate-500">
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
                                                <td className="p-3 font-mono text-xs select-all">{p.parcel_id}</td>
                                                <td className="p-3 max-w-[200px] truncate" title={p.address || ''}>
                                                    {p.address || 'N/A'}
                                                </td>
                                                <td className="p-3 max-w-[150px] truncate" title={p.owner_name || ''}>
                                                    {p.owner_name || '-'}
                                                </td>
                                                <td className="p-3 text-right font-mono">
                                                    {p.details?.total_market_value
                                                        ? `$${p.details.total_market_value.toLocaleString()}`
                                                        : '-'}
                                                </td>
                                                <td className="p-3 text-right font-mono font-medium text-emerald-600">
                                                    {p.amount_due ? `$${p.amount_due.toLocaleString()}` : (p.price ? `$${p.price.toLocaleString()}` : '-')}
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
