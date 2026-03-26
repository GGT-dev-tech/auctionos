import React, { useState } from 'react';
import PropertyList from '../../components/admin/PropertyList';
import PropertyFilters, { PropertyFilterParams } from '../../components/admin/PropertyFilters';
import { Typography } from '@mui/material';

const ClientProperties: React.FC = () => {
    const [filters, setFilters] = useState<PropertyFilterParams>({});

    const hasActiveFilters = Object.values(filters).some(val => val !== undefined && val !== '');

    return (
        <div className="p-6 max-w-full mx-auto space-y-6 px-4 sm:px-8 lg:px-12">
            <Typography variant="h4" className="font-bold text-slate-800 dark:text-white">
                Property Search
            </Typography>
            <PropertyFilters onFilterChange={setFilters} readOnly={true} />
            
            {hasActiveFilters ? (
                <div className="w-full bg-white dark:bg-slate-800 shadow-sm rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <PropertyList filters={filters} readOnly={true} />
                </div>
            ) : (
                <div className="w-full h-[400px] bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-500">
                    <span className="material-symbols-outlined text-6xl mb-4 text-slate-300 dark:text-slate-700">search</span>
                    <Typography variant="h6" className="font-semibold text-slate-600 dark:text-slate-400">Search Properties</Typography>
                    <Typography variant="body2" className="mt-1">Use the filters above to find what you are looking for.</Typography>
                </div>
            )}
        </div>
    );
};

export default ClientProperties;
