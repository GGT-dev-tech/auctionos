import React from 'react';

export interface FilterState {
    keyword?: string;
    state?: string;
    county?: string;
    zip_code?: string;
    status?: string; // For Availability
    inventory_type?: string;
    min_appraisal?: string | number;
    max_appraisal?: string | number;
    min_amount_due?: string | number;
    max_amount_due?: string | number;
    min_acreage?: string | number;
    max_acreage?: string | number;
    occupancy?: string;
    owner_state?: string;
    improvements?: string;
    min_date?: string;
    max_date?: string;
    // Advanced
    added_since?: string;
    exclude_unavailable?: boolean;
    max_results?: number;
}

interface Props {
    filters: FilterState;
    onChange: (name: string, value: any) => void;
    onSearch: () => void;
    onClear: () => void;
    className?: string;
}

export const SearchFilters: React.FC<Props> = ({ filters, onChange, onSearch, onClear, className }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onChange(name, value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch();
    };

    return (
        <form onSubmit={handleSubmit} className={`bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-4 ${className || ''}`}>

            {/* Top Bar: Tabs & Main Location */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
                <button type="button" className="px-4 py-2 text-blue-600 border-b-2 border-blue-600 font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">search</span> Search Filters
                </button>
                <button type="button" className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">flash_on</span> Quick Searches
                </button>
            </div>

            {/* State / County Selects */}
            <div className="flex gap-4 mb-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg items-center">
                <input type="text" name="state" placeholder="State (FL)" value={filters.state || ''} onChange={handleChange} className="flex-1 rounded border-slate-300 shadow-sm" />
                <input type="text" name="county" placeholder="All Counties" value={filters.county || ''} onChange={handleChange} className="flex-1 rounded border-slate-300 shadow-sm" />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow-sm">
                    GO
                </button>
            </div>

            {/* Optional Filters Header */}
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">filter_alt</span> Optional Filters:
                </h3>
                <button type="button" onClick={onClear} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded border border-slate-300">
                    Clear Filters
                </button>
            </div>

            {/* 3-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">

                {/* Column 1 */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-blue-500">help</span> Inventory
                        </label>
                        <select name="inventory_type" value={filters.inventory_type || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm">
                            <option value="">All Inventories</option>
                            <option value="auction">Auction Only</option>
                            <option value="otc">OTC / Land Bank</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-blue-500">help</span> County Appraisal from
                        </label>
                        <div className="flex gap-2 items-center">
                            <input type="number" name="min_appraisal" placeholder="min $" value={filters.min_appraisal || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm" />
                            <span className="text-slate-400">to</span>
                            <input type="number" name="max_appraisal" placeholder="max $" value={filters.max_appraisal || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-blue-500">help</span> Occupancy
                        </label>
                        <select name="occupancy" value={filters.occupancy || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm">
                            <option value="">All Occupancy Types</option>
                            <option value="vacant">Vacant</option>
                            <option value="occupied">Occupied</option>
                            <option value="unknown">Unknown</option>
                        </select>
                    </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-blue-500">help</span> Improvements
                        </label>
                        <select name="improvements" value={filters.improvements || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm">
                            <option value="">All Parcel Types</option>
                            <option value="yes">Improved (Building)</option>
                            <option value="no">Vacant Land</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-blue-500">help</span> Amount Due from
                        </label>
                        <div className="flex gap-2 items-center">
                            <input type="number" name="min_amount_due" placeholder="min $" value={filters.min_amount_due || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm" />
                            <span className="text-slate-400">to</span>
                            <input type="number" name="max_amount_due" placeholder="max $" value={filters.max_amount_due || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-blue-500">help</span> Owner Location
                        </label>
                        <select name="owner_state" value={filters.owner_state || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm">
                            <option value="">All Owner Locations</option>
                            <option value="in_state">In State</option>
                            <option value="out_of_state">Out of State</option>
                        </select>
                    </div>
                </div>

                {/* Column 3 */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-blue-500">help</span> Availability
                        </label>
                        <select name="status" value={filters.status || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm">
                            <option value="">All Available</option>
                            <option value="active">Active Only</option>
                            <option value="sold">Sold / Redeemed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-blue-500">help</span> Acreage from
                        </label>
                        <div className="flex gap-2 items-center">
                            <input type="number" name="min_acreage" placeholder="min #" step="0.1" value={filters.min_acreage || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm" />
                            <span className="text-slate-400">to</span>
                            <input type="number" name="max_acreage" placeholder="max #" step="0.1" value={filters.max_acreage || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-blue-500">help</span> Keyword Search
                        </label>
                        <input
                            type="text"
                            name="keyword"
                            value={filters.keyword || ''}
                            onChange={handleChange}
                            className="w-full rounded border-slate-300 text-sm"
                            placeholder="parcel #, zip, pin, own"
                        />
                    </div>
                </div>

            </div>

            <hr className="my-4 border-slate-200 dark:border-slate-700" />

            {/* Advanced Filters */}
            <div className="mb-2">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 text-sm">
                    <span className="material-symbols-outlined text-[18px]">filter_list</span> Advanced Filters:
                </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-blue-500">help</span> Added
                    </label>
                    <select name="added_since" value={filters.added_since || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm">
                        <option value="">Whenever</option>
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-blue-500">help</span> Unavailable
                    </label>
                    <select name="exclude_unavailable" value={filters.exclude_unavailable === true ? 'true' : 'false'} onChange={handleChange} className="w-full rounded border-slate-300 text-sm">
                        <option value="true">Do Not Include</option>
                        <option value="false">Include All</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-blue-500">help</span> Located Within
                    </label>
                    <select className="w-full rounded border-slate-300 text-sm" disabled>
                        <option>Unlimited</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-blue-500">help</span> Max Results
                    </label>
                    <select name="max_results" value={filters.max_results || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm">
                        <option value="100">100</option>
                        <option value="500">500</option>
                        <option value="1000">1000</option>
                    </select>
                </div>
            </div>

        </form>
    );
};
