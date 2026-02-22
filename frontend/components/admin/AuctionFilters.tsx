import React, { useState, useEffect } from 'react';
import { TextField, Select, MenuItem, Button, FormControl, InputLabel } from '@mui/material';
import { useDebounce } from 'use-debounce';

export interface AuctionFilterParams {
    name?: string;
    state?: string;
    county?: string;
    isPresencial?: boolean;
    startDate?: string;
    endDate?: string;
    minParcels?: number;
    maxParcels?: number;
}

interface AuctionFiltersProps {
    onFilterChange: (filters: AuctionFilterParams) => void;
}

const AuctionFilters: React.FC<AuctionFiltersProps> = ({ onFilterChange }) => {
    const [filters, setFilters] = useState<AuctionFilterParams>({});
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [debouncedFilters] = useDebounce(filters, 500);

    useEffect(() => {
        onFilterChange(debouncedFilters);
    }, [debouncedFilters, onFilterChange]);

    const handleChange = (key: keyof AuctionFilterParams, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value || undefined }));
    };

    const handleClear = () => {
        setFilters({});
    };

    return (
        <div className="flex flex-col gap-4 mb-6 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <TextField
                    label="Search by Name"
                    variant="outlined"
                    size="small"
                    value={filters.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="E.g. Tax Lien 2024"
                    className="bg-white dark:bg-slate-900 min-w-[250px]"
                />
                <TextField
                    label="State"
                    variant="outlined"
                    size="small"
                    value={filters.state || ''}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="AR, FL..."
                    className="bg-white dark:bg-slate-900 w-24"
                    inputProps={{ maxLength: 2 }}
                />
                <TextField
                    label="County"
                    variant="outlined"
                    size="small"
                    value={filters.county || ''}
                    onChange={(e) => handleChange('county', e.target.value)}
                    className="bg-white dark:bg-slate-900"
                />

                <FormControl size="small" className="min-w-[150px] bg-white dark:bg-slate-900">
                    <InputLabel id="type-select-label">Auction Type</InputLabel>
                    <Select
                        labelId="type-select-label"
                        label="Auction Type"
                        value={filters.isPresencial === undefined ? '' : filters.isPresencial.toString()}
                        onChange={(e) => {
                            const val = e.target.value;
                            handleChange('isPresencial', val === '' ? undefined : val === 'true');
                        }}
                    >
                        <MenuItem value=""><em>All Types</em></MenuItem>
                        <MenuItem value="true">In-Person</MenuItem>
                        <MenuItem value="false">Online</MenuItem>
                    </Select>
                </FormControl>

                <Button
                    variant="text"
                    size="small"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-primary-600 dark:text-primary-400 font-semibold"
                >
                    {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                </Button>

                <div className="ml-auto flex gap-2">
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleClear}
                        color="secondary"
                    >
                        Clear
                    </Button>
                </div>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-300">
                    <TextField
                        label="Start Date"
                        type="date"
                        size="small"
                        value={filters.startDate || ''}
                        onChange={(e) => handleChange('startDate', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="End Date"
                        type="date"
                        size="small"
                        value={filters.endDate || ''}
                        onChange={(e) => handleChange('endDate', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="Min Parcels"
                        type="number"
                        size="small"
                        value={filters.minParcels || ''}
                        onChange={(e) => handleChange('minParcels', e.target.value)}
                    />
                    <TextField
                        label="Max Parcels"
                        type="number"
                        size="small"
                        value={filters.maxParcels || ''}
                        onChange={(e) => handleChange('maxParcels', e.target.value)}
                    />
                </div>
            )}
        </div>
    );
};

export default AuctionFilters;
