import React, { useState, useEffect } from 'react';
import { TextField, Select, MenuItem, Button, FormControl, InputLabel, Grid } from '@mui/material';
import { useDebounce } from 'use-debounce';

export interface PropertyFilterParams {
    county?: string;
    state?: string;
    auction_name?: string;
    min_amount_due?: number;
    max_amount_due?: number;
    property_category?: string;
    occupancy?: string;
    tax_year?: number;
    property_type?: string;
}

interface PropertyFiltersProps {
    onFilterChange: (filters: PropertyFilterParams) => void;
}

const PropertyFilters: React.FC<PropertyFiltersProps> = ({ onFilterChange }) => {
    const [filters, setFilters] = useState<PropertyFilterParams>({});
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [debouncedFilters] = useDebounce(filters, 500);

    useEffect(() => {
        onFilterChange(debouncedFilters);
    }, [debouncedFilters, onFilterChange]);

    const handleChange = (key: keyof PropertyFilterParams, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value || undefined }));
    };

    const handleClear = () => {
        setFilters({});
    };

    return (
        <div className="flex flex-col gap-4 mb-6 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            {/* Quick Search Row */}
            <div className="flex flex-wrap gap-4 items-center">
                <TextField
                    label="County"
                    variant="outlined"
                    size="small"
                    value={filters.county || ''}
                    onChange={(e) => handleChange('county', e.target.value)}
                    placeholder="E.g. Pulaski"
                    className="bg-white dark:bg-slate-900"
                />
                <TextField
                    label="State"
                    variant="outlined"
                    size="small"
                    value={filters.state || ''}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="AR"
                    className="bg-white dark:bg-slate-900 w-20"
                    inputProps={{ maxLength: 2 }}
                />
                <TextField
                    label="Auction Name"
                    variant="outlined"
                    size="small"
                    value={filters.auction_name || ''}
                    onChange={(e) => handleChange('auction_name', e.target.value)}
                    placeholder="Filter by Auction..."
                    className="bg-white dark:bg-slate-900 min-w-[200px]"
                />

                <Button
                    variant="text"
                    size="small"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-primary-600 dark:text-primary-400 font-semibold"
                >
                    {showAdvanced ? 'Hide Advanced' : 'More Filters'}
                </Button>

                <div className="ml-auto flex gap-2">
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleClear}
                        color="secondary"
                    >
                        Reset
                    </Button>
                </div>
            </div>

            {/* Advanced Filters Row */}
            {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-300">
                    <TextField
                        label="Min Amount Due ($)"
                        type="number"
                        size="small"
                        value={filters.min_amount_due || ''}
                        onChange={(e) => handleChange('min_amount_due', e.target.value)}
                    />
                    <TextField
                        label="Max Amount Due ($)"
                        type="number"
                        size="small"
                        value={filters.max_amount_due || ''}
                        onChange={(e) => handleChange('max_amount_due', e.target.value)}
                    />
                    <FormControl size="small">
                        <InputLabel>Occupancy</InputLabel>
                        <Select
                            label="Occupancy"
                            value={filters.occupancy || ''}
                            onChange={(e) => handleChange('occupancy', e.target.value)}
                        >
                            <MenuItem value=""><em>Any</em></MenuItem>
                            <MenuItem value="Occupied">Occupied</MenuItem>
                            <MenuItem value="Vacant Lot">Vacant Lot</MenuItem>
                            <MenuItem value="Vacant Structure">Vacant Structure</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Tax Year"
                        type="number"
                        size="small"
                        value={filters.tax_year || ''}
                        onChange={(e) => handleChange('tax_year', e.target.value)}
                    />
                    <TextField
                        label="Property Type"
                        variant="outlined"
                        size="small"
                        value={filters.property_type || ''}
                        onChange={(e) => handleChange('property_type', e.target.value)}
                        placeholder="Residential, Land..."
                    />
                    <FormControl size="small">
                        <InputLabel>Category</InputLabel>
                        <Select
                            label="Category"
                            value={filters.property_category || ''}
                            onChange={(e) => handleChange('property_category', e.target.value)}
                        >
                            <MenuItem value=""><em>Any</em></MenuItem>
                            <MenuItem value="Residential">Residential</MenuItem>
                            <MenuItem value="Commercial">Commercial</MenuItem>
                            <MenuItem value="Industrial">Industrial</MenuItem>
                            <MenuItem value="Land">Land</MenuItem>
                        </Select>
                    </FormControl>
                </div>
            )}
        </div>
    );
};

export default PropertyFilters;
