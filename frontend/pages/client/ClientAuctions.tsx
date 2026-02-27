import React, { useState } from 'react';
import AuctionList from '../../components/admin/AuctionList';
import AuctionCalendar from '../../components/admin/AuctionCalendar';
import AuctionFilters, { AuctionFilterParams } from '../../components/admin/AuctionFilters';
import { Box, Typography } from '@mui/material';

const ClientAuctions: React.FC = () => {
    const [filters, setFilters] = useState<AuctionFilterParams>({});

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <Typography variant="h4" className="font-bold text-slate-800 dark:text-white">
                Live Auctions
            </Typography>
            <AuctionFilters onFilterChange={setFilters} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Box className="w-full bg-white dark:bg-slate-800 shadow-sm rounded-xl">
                    <AuctionList filters={filters} readOnly={true} />
                </Box>
                <Box className="w-full">
                    <AuctionCalendar filters={filters} />
                </Box>
            </div>
        </div>
    );
};

export default ClientAuctions;
