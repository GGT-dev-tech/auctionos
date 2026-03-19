import React, { useState } from 'react';
import AuctionList from '../../components/admin/AuctionList';
import AuctionCalendar from '../../components/admin/AuctionCalendar';
import AuctionFilters, { AuctionFilterParams } from '../../components/admin/AuctionFilters';
import { Box, Typography } from '@mui/material';

const ClientAuctions: React.FC = () => {
    const [filters, setFilters] = useState<AuctionFilterParams>({});

    const handleDateTypeSelect = (date: string, type: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set('startDate', date);
        params.set('endDate', date);
        params.set('q', type);
        window.location.search = params.toString();
    };

    const hasActiveFilters = Object.values(filters).some(val => val !== undefined && val !== '');

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <Typography variant="h4" className="font-bold text-slate-800 dark:text-white">
                Live Auctions
            </Typography>
            <AuctionFilters onFilterChange={setFilters} />
            
            <Box className="w-full bg-white dark:bg-slate-800 shadow-sm rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <AuctionCalendar filters={filters} onDateTypeSelect={handleDateTypeSelect} />
            </Box>

            {hasActiveFilters && (
                <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Typography variant="h6" className="font-bold text-slate-800 dark:text-white mb-4">
                        Search Results
                    </Typography>
                    <Box className="w-full bg-white dark:bg-slate-800 shadow-sm rounded-xl">
                        <AuctionList filters={filters} readOnly={true} />
                    </Box>
                </div>
            )}
        </div>
    );
};

export default ClientAuctions;
