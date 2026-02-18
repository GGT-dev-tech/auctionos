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

            // Clean params: remove empty strings and undefined/null
            const cleanParams: any = {};
            Object.keys(params).forEach(key => {
                const val = params[key];
                if (val !== '' && val !== null && val !== undefined) {
                    cleanParams[key] = val;
                }
            });

            const data = await AuctionService.search(cleanParams);
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

                // Clean params
                const cleanParams: any = {};
                Object.keys(apiParams).forEach(key => {
                    const val = apiParams[key];
                    if (val !== '' && val !== null && val !== undefined) {
                        cleanParams[key] = val;
                    }
                });

                const data = await AuctionService.search(cleanParams);
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
                {/* Header Actions matching ParcelFair */}
                <div className="flex flex-wrap items-center gap-2">
                    <button className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white py-2 px-4 rounded shadow-sm text-sm font-medium flex items-center transition-colors">
                        <span className="material-symbols-outlined text-base mr-1">file_download</span> Export to CSV
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white py-2 px-4 rounded shadow-sm text-sm font-medium flex items-center transition-colors">
                        <span className="material-symbols-outlined text-base mr-1">save_alt</span> Save Results to List
                    </button>
                    <button className="bg-sky-400 hover:bg-sky-500 dark:bg-sky-600 dark:hover:bg-sky-700 text-white py-2 px-4 rounded shadow-sm text-sm font-medium flex items-center transition-colors">
                        <span className="material-symbols-outlined text-base mr-1">location_on</span> Show Results on Map
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
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap sticky left-0 z-10 bg-slate-50 dark:bg-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Parcel Number</th>
                                        <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">C/S#</th>
                                        <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">PIN</th>
                                        <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">Name</th>
                                        <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">County</th>
                                        <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">State</th>
                                        <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">Availability</th>
                                        <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">Sale Year</th>
                                        <th className="px-3 py-3 text-right text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">Amount Due</th>
                                        <th className="px-3 py-3 text-right text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">Acres</th>
                                        <th className="px-3 py-3 text-right text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">Total Value</th>
                                        <th className="px-3 py-3 text-right text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">Land</th>
                                        <th className="px-3 py-3 text-right text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">Building</th>
                                        <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">Parcel Type</th>
                                        <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">Status</th>
                                        <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">Address</th>
                                        <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">Next Auction</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                                    {properties.length === 0 ? (
                                        <tr>
                                            <td colSpan={17} className="p-8 text-center text-slate-500">
                                                No properties found matching filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        properties.map(p => (
                                            <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-3 py-4 whitespace-nowrap sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                                    <span
                                                        className="text-blue-600 dark:text-blue-400 hover:underline font-bold font-mono cursor-pointer"
                                                        onClick={() => setSelectedProperty(p)}
                                                    >
                                                        {p.parcel_id}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs">
                                                    {p.auction_details?.case_number || p.auction_details?.certificate_number || '-'}
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs"></td>
                                                <td className="px-3 py-4 text-slate-900 dark:text-slate-200 max-w-xs truncate text-xs font-medium" title={p.owner_name || ''}>
                                                    {p.owner_name || 'Unknown'}
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs">{p.county}</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs">{p.state}</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-green-600 dark:text-green-400 font-bold text-xs">Available</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs">{p.tax_sale_year || '-'}</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-right text-slate-900 dark:text-slate-200 font-mono text-xs font-bold">
                                                    {p.amount_due ? `$${p.amount_due.toLocaleString()}` : '-'}
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-right text-slate-900 dark:text-slate-200 text-xs text-xs">
                                                    {p.details?.lot_acres || '-'}
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-right text-slate-900 dark:text-slate-200 text-xs font-medium">
                                                    {p.details?.total_market_value || p.details?.assessed_value ? `$${(p.details?.total_market_value || p.details?.assessed_value).toLocaleString()}` : '-'}
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-right text-slate-500 dark:text-slate-400 text-xs">
                                                    {p.details?.land_value ? `$${p.details.land_value.toLocaleString()}` : '-'}
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-right text-slate-500 dark:text-slate-400 text-xs">
                                                    {p.details?.improvement_value ? `$${p.details.improvement_value.toLocaleString()}` : '-'}
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs capitalize">
                                                    {p.property_type || 'Land Only'}
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs">
                                                    Lien
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs max-w-[150px] truncate" title={p.address || ''}>
                                                    {p.address || ''}
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs">
                                                    {p.next_auction_date || '-'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table >
                        </div>
                    </div >
                )}
            </div >

            {/* Details Modal */}
            {
                selectedProperty && (
                    <PropertyDetailsModal
                        property={selectedProperty}
                        onClose={() => setSelectedProperty(null)}
                        onUpdate={() => {
                            fetchProperties(); // Refresh list if updated
                        }}
                    />
                )
            }
        </div >
    );
};
