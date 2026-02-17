import React from 'react';

export interface FilterState {
    keyword?: string;
    state?: string;
    county?: string;
    zip_code?: string;
    status?: string;
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
        <form onSubmit={handleSubmit} className={`space-y-3 ${className || ''}`}>
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-slate-900 dark:text-white">Filters</h3>
                <button type="button" onClick={onClear} className="text-xs text-blue-600 hover:text-blue-700">Clear All</button>
            </div>

            {/* Keyword */}
            <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Keyword / PID</label>
                <input
                    type="text"
                    name="keyword"
                    value={filters.keyword || ''}
                    onChange={handleChange}
                    className="w-full rounded border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-sm py-1.5"
                    placeholder="Search..."
                />
            </div>

            {/* Location */}
            <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-900 dark:text-white border-b pb-1">Location</label>
                <div className="grid grid-cols-2 gap-2">
                    <input type="text" name="state" placeholder="State" value={filters.state || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm py-1.5" />
                    <input type="text" name="county" placeholder="County" value={filters.county || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm py-1.5" />
                </div>
                <input type="text" name="zip_code" placeholder="Zip Code" value={filters.zip_code || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm py-1.5" />
            </div>

            {/* Auction Date Range */}
            <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-900 dark:text-white border-b pb-1">Auction Date</label>
                <div className="flex flex-col gap-2">
                    <input
                        type="date"
                        name="min_date"
                        value={filters.min_date || ''}
                        onChange={handleChange}
                        className="w-full rounded border-slate-300 text-sm py-1.5"
                    />
                    <input
                        type="date"
                        name="max_date"
                        value={filters.max_date || ''}
                        onChange={handleChange}
                        className="w-full rounded border-slate-300 text-sm py-1.5"
                    />
                </div>
            </div>

            {/* Financial Ranges - Min/Max */}
            <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-900 dark:text-white border-b pb-1">Appraised Value</label>
                <div className="flex gap-2">
                    <input type="number" name="min_appraisal" placeholder="Min" value={filters.min_appraisal || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm py-1.5" />
                    <input type="number" name="max_appraisal" placeholder="Max" value={filters.max_appraisal || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm py-1.5" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-900 dark:text-white border-b pb-1">Amount Due / Bid</label>
                <div className="flex gap-2">
                    <input type="number" name="min_amount_due" placeholder="Min" value={filters.min_amount_due || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm py-1.5" />
                    <input type="number" name="max_amount_due" placeholder="Max" value={filters.max_amount_due || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm py-1.5" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-900 dark:text-white border-b pb-1">Acreage</label>
                <div className="flex gap-2">
                    <input type="number" name="min_acreage" placeholder="Min" step="0.1" value={filters.min_acreage || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm py-1.5" />
                    <input type="number" name="max_acreage" placeholder="Max" step="0.1" value={filters.max_acreage || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm py-1.5" />
                </div>
            </div>

            {/* Property Attributes */}
            <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-900 dark:text-white border-b pb-1">Attributes</label>

                <select name="occupancy" value={filters.occupancy || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm py-1.5">
                    <option value="">Any Occupancy</option>
                    <option value="vacant">Vacant</option>
                    <option value="occupied">Occupied</option>
                </select>

                <select name="improvements" value={filters.improvements || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm py-1.5">
                    <option value="">Improvements (Any)</option>
                    <option value="yes">Yes (Building)</option>
                    <option value="no">No (Land Only)</option>
                </select>

                <select name="inventory_type" value={filters.inventory_type || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm py-1.5">
                    <option value="">All Inventory Types</option>
                    <option value="auction">Auction</option>
                    <option value="otc">OTC / Land Bank</option>
                </select>

                <select name="status" value={filters.status || ''} onChange={handleChange} className="w-full rounded border-slate-300 text-sm py-1.5">
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="sold">Sold</option>
                    <option value="pending">Pending</option>
                </select>
            </div>

            <button type="submit" className="w-full bg-primary text-white py-2 rounded font-bold hover:bg-primary/90 transition-colors text-sm">
                Apply Filters
            </button>
        </form>
    );
};
