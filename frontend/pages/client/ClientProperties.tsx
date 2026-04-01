import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyList from '../../components/admin/PropertyList';
import PropertyFilters, { PropertyFilterParams } from '../../components/admin/PropertyFilters';
import { Typography } from '@mui/material';

const ClientProperties: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [filters, setFilters] = useState<PropertyFilterParams>({});

    // Sync URL params to filter state on mount
    useEffect(() => {
        const stateParam = searchParams.get('state');
        const topParam = searchParams.get('top');
        const initialFilters: PropertyFilterParams = {};
        
        if (stateParam) initialFilters.state = stateParam;
        if (topParam === 'true') {
            initialFilters.min_score = 70;
        }
        
        if (Object.keys(initialFilters).length > 0) {
            // Only update if actually different to prevent flickering loops
            setFilters(prev => {
                const isDifferent = JSON.stringify(prev) !== JSON.stringify({ ...prev, ...initialFilters });
                return isDifferent ? { ...prev, ...initialFilters } : prev;
            });
        }
    }, [searchParams]);

    const hasActiveFilters = Object.values(filters).some(val => val !== undefined && val !== '');

    return (
        <div className="p-6 w-full space-y-6 px-4 sm:px-8 lg:px-12">
            <Typography variant="h4" className="font-bold text-slate-800 dark:text-white">
                Property Search
            </Typography>
            <div className="sticky top-0 z-40 pt-2 pb-1 bg-[#F8FAFC] dark:bg-slate-950/80 backdrop-blur-md -mx-4 px-4 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
                <PropertyFilters 
                    onFilterChange={setFilters} 
                    readOnly={true} 
                    initialFilters={filters}
                />
            </div>
            
            {hasActiveFilters ? (
                <div className="w-full bg-white dark:bg-slate-800 shadow-sm rounded-xl min-h-[800px]">
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
