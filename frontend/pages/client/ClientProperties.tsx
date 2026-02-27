import React, { useState } from 'react';
import PropertyList from '../../components/admin/PropertyList';
import PropertyFilters, { PropertyFilterParams } from '../../components/admin/PropertyFilters';
import { Typography } from '@mui/material';

const ClientProperties: React.FC = () => {
    const [filters, setFilters] = useState<PropertyFilterParams>({});

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <Typography variant="h4" className="font-bold text-slate-800 dark:text-white">
                Property Search
            </Typography>
            <PropertyFilters onFilterChange={setFilters} />
            <div className="w-full bg-white dark:bg-slate-800 shadow-sm rounded-xl">
                <PropertyList filters={filters} readOnly={true} />
            </div>
        </div>
    );
};

export default ClientProperties;
