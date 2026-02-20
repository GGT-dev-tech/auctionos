import React, { useState, useEffect } from 'react';
import { TextField, Select, MenuItem, Button, FormControl, InputLabel } from '@mui/material';
import { useDebounce } from 'use-debounce';

export interface AuctionFilterParams {
    name?: string;
    state?: string;
    county?: string;
    isPresencial?: boolean;
}

interface AuctionFiltersProps {
    onFilterChange: (filters: AuctionFilterParams) => void;
}

const AuctionFilters: React.FC<AuctionFiltersProps> = ({ onFilterChange }) => {
    const [filters, setFilters] = useState<AuctionFilterParams>({});
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
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <TextField
                label="Search by Name"
                variant="outlined"
                size="small"
                value={filters.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="bg-white dark:bg-slate-900"
            />
            <TextField
                label="State"
                variant="outlined"
                size="small"
                value={filters.state || ''}
                onChange={(e) => handleChange('state', e.target.value)}
                className="bg-white dark:bg-slate-900"
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
                variant="outlined"
                onClick={handleClear}
                className="ml-auto"
                color="secondary"
            >
                Clear Filters
            </Button>
        </div>
    );
};

export default AuctionFilters;
