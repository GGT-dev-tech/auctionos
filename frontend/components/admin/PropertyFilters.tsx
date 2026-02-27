import React, { useState, useEffect } from 'react';
import { TextField, Select, MenuItem, Button, FormControl, InputLabel, Divider, Checkbox, FormControlLabel, Tooltip } from '@mui/material';
import { useDebounce } from 'use-debounce';
import SearchIcon from '@mui/icons-material/Search';

export interface PropertyFilterParams {
    county?: string;
    state?: string;
    keyword?: string;

    // Optional Filters
    auction_name?: string;
    inventory?: string;
    min_improvements?: number;
    max_improvements?: number;
    availability?: string;
    min_county_appraisal?: number;
    max_county_appraisal?: number;
    min_amount_due?: number;
    max_amount_due?: number;
    min_acreage?: number;
    max_acreage?: number;
    occupancy?: string;
    owner_location?: string;

    // Advanced Filters
    added_since?: string;
    is_unavailable?: boolean;
    located_within?: string;
    max_results?: number;
    property_category?: string;
    property_type?: string;
    tax_year?: number;
}

interface PropertyFiltersProps {
    onFilterChange: (filters: PropertyFilterParams) => void;
}

const PropertyFilters: React.FC<PropertyFiltersProps> = ({ onFilterChange }) => {
    const [filters, setFilters] = useState<PropertyFilterParams>({});
    const [showFilters, setShowFilters] = useState(false);
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
        <div className="flex flex-col gap-4 mb-6 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 w-full transition-all">
            {/* Primary Search Row */}
            <div className="flex flex-wrap gap-4 items-center w-full">
                <TextField
                    label="Keyword Search"
                    variant="outlined"
                    size="small"
                    value={filters.keyword || ''}
                    onChange={(e) => handleChange('keyword', e.target.value)}
                    placeholder="Parcel ID, Zip, Address..."
                    className="bg-white dark:bg-slate-900 flex-grow min-w-[250px]"
                    InputProps={{
                        startAdornment: <SearchIcon className="text-slate-400 mr-2" fontSize="small" />
                    }}
                />
                <TextField
                    label="County"
                    variant="outlined"
                    size="small"
                    value={filters.county || ''}
                    onChange={(e) => handleChange('county', e.target.value)}
                    className="bg-white dark:bg-slate-900 w-[150px]"
                />
                <TextField
                    label="State"
                    variant="outlined"
                    size="small"
                    value={filters.state || ''}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="bg-white dark:bg-slate-900 w-[100px]"
                    inputProps={{ maxLength: 2 }}
                />

                <Button
                    variant={showFilters ? "contained" : "outlined"}
                    size="small"
                    onClick={() => setShowFilters(!showFilters)}
                    className="ml-auto"
                >
                    {showFilters ? 'Hide Filters' : 'Refine Filters'}
                </Button>

                <Button
                    variant="text"
                    size="small"
                    onClick={handleClear}
                    color="secondary"
                >
                    Clear All
                </Button>
            </div>

            {/* Expanded Filters Section */}
            {showFilters && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <Divider className="my-6" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Optional Filters */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Optional Filters</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Availability</InputLabel>
                                    <Select
                                        label="Availability"
                                        value={filters.availability || ''}
                                        onChange={(e) => handleChange('availability', e.target.value)}
                                    >
                                        <MenuItem value=""><em>Any</em></MenuItem>
                                        <MenuItem value="available">Available</MenuItem>
                                        <MenuItem value="sold">Sold</MenuItem>
                                        <MenuItem value="pending">Pending</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl size="small" fullWidth>
                                    <InputLabel>Occupancy</InputLabel>
                                    <Select
                                        label="Occupancy"
                                        value={filters.occupancy || ''}
                                        onChange={(e) => handleChange('occupancy', e.target.value)}
                                    >
                                        <MenuItem value=""><em>Any</em></MenuItem>
                                        <MenuItem value="Occupied">Occupied</MenuItem>
                                        <MenuItem value="Vacant">Vacant</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Owner Location"
                                    size="small"
                                    value={filters.owner_location || ''}
                                    onChange={(e) => handleChange('owner_location', e.target.value)}
                                    className="col-span-2"
                                    placeholder="Search owner address..."
                                />

                                <div className="col-span-2 flex gap-2">
                                    <TextField label="Min Amount Due ($)" type="number" size="small" fullWidth value={filters.min_amount_due || ''} onChange={(e) => handleChange('min_amount_due', e.target.value)} />
                                    <TextField label="Max Amount Due ($)" type="number" size="small" fullWidth value={filters.max_amount_due || ''} onChange={(e) => handleChange('max_amount_due', e.target.value)} />
                                </div>

                                <div className="col-span-2 flex gap-2">
                                    <TextField label="Min County Appr ($)" type="number" size="small" fullWidth value={filters.min_county_appraisal || ''} onChange={(e) => handleChange('min_county_appraisal', e.target.value)} />
                                    <TextField label="Max County Appr ($)" type="number" size="small" fullWidth value={filters.max_county_appraisal || ''} onChange={(e) => handleChange('max_county_appraisal', e.target.value)} />
                                </div>

                                <div className="col-span-2 flex gap-2">
                                    <TextField label="Min Acreage" type="number" size="small" fullWidth value={filters.min_acreage || ''} onChange={(e) => handleChange('min_acreage', e.target.value)} />
                                    <TextField label="Max Acreage" type="number" size="small" fullWidth value={filters.max_acreage || ''} onChange={(e) => handleChange('max_acreage', e.target.value)} />
                                </div>

                                <div className="col-span-2 flex gap-2">
                                    <TextField label="Min Improvements ($)" type="number" size="small" fullWidth value={filters.min_improvements || ''} onChange={(e) => handleChange('min_improvements', e.target.value)} />
                                    <TextField label="Max Improvements ($)" type="number" size="small" fullWidth value={filters.max_improvements || ''} onChange={(e) => handleChange('max_improvements', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Advanced Filters</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Inventory Status</InputLabel>
                                    <Select
                                        label="Inventory Status"
                                        value={filters.inventory || ''}
                                        onChange={(e) => handleChange('inventory', e.target.value)}
                                    >
                                        <MenuItem value=""><em>Any</em></MenuItem>
                                        <MenuItem value="State Inventory">State Inventory</MenuItem>
                                        <MenuItem value="OTC">OTC (Over the Counter)</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Auction Name"
                                    size="small"
                                    fullWidth
                                    value={filters.auction_name || ''}
                                    onChange={(e) => handleChange('auction_name', e.target.value)}
                                />

                                <TextField
                                    label="Added Since (Date)"
                                    type="date"
                                    size="small"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={filters.added_since || ''}
                                    onChange={(e) => handleChange('added_since', e.target.value)}
                                />

                                <TextField
                                    label="Located Within (Miles)"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    value={filters.located_within || ''}
                                    onChange={(e) => handleChange('located_within', e.target.value)}
                                />

                                <FormControlLabel
                                    className="col-span-2"
                                    control={
                                        <Checkbox
                                            checked={filters.is_unavailable || false}
                                            onChange={(e) => handleChange('is_unavailable', e.target.checked)}
                                        />
                                    }
                                    label="Show Unavailable Properties Only"
                                />

                                <FormControl size="small" fullWidth>
                                    <InputLabel>Category</InputLabel>
                                    <Select label="Category" value={filters.property_category || ''} onChange={(e) => handleChange('property_category', e.target.value)}>
                                        <MenuItem value=""><em>Any</em></MenuItem>
                                        <MenuItem value="Residential">Residential</MenuItem>
                                        <MenuItem value="Commercial">Commercial</MenuItem>
                                        <MenuItem value="Land">Land</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField label="Tax Year" type="number" size="small" fullWidth value={filters.tax_year || ''} onChange={(e) => handleChange('tax_year', e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertyFilters;

