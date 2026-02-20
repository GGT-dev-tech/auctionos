
import React, { useState } from 'react';
import AuctionCalendar from '../../components/admin/AuctionCalendar';
import AuctionList from '../../components/admin/AuctionList';
import AuctionFilters, { AuctionFilterParams } from '../../components/admin/AuctionFilters';
import CsvUpload from '../../components/admin/CsvUpload';
import PropertyForm from '../../components/admin/PropertyForm';
import PropertyList from '../../components/admin/PropertyList';
import { Box } from '@mui/material';

const AdminAuctions: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'auctions' | 'properties' | 'import_props' | 'import_auctions'>('auctions');
    const [filters, setFilters] = useState<AuctionFilterParams>({});

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Admin Module</h1>

            <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                <TabButton active={activeTab === 'auctions'} onClick={() => setActiveTab('auctions')} label="Auctions Dashboard" />
                <TabButton active={activeTab === 'properties'} onClick={() => setActiveTab('properties')} label="Property Manager" />
                <TabButton active={activeTab === 'import_props'} onClick={() => setActiveTab('import_props')} label="Import Properties (CSV)" />
                <TabButton active={activeTab === 'import_auctions'} onClick={() => setActiveTab('import_auctions')} label="Import Auctions (CSV)" />
            </div>

            {activeTab === 'auctions' && (
                <div className="flex flex-col gap-4">
                    <AuctionFilters onFilterChange={setFilters} />

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                        <Box className="w-full bg-white dark:bg-slate-800 shadow-sm rounded-xl">
                            <AuctionList filters={filters} />
                        </Box>

                        <Box className="w-full">
                            <AuctionCalendar filters={filters} />
                        </Box>
                    </div>
                </div>
            )}

            {activeTab === 'properties' && (
                <div className="space-y-8">
                    <PropertyForm onSuccess={() => { }} />
                    <PropertyList />
                </div>
            )}

            {activeTab === 'import_props' && (
                <div className="max-w-2xl">
                    <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">Import Properties CSV</h2>
                    <CsvUpload type="properties" onSuccess={() => setActiveTab('properties')} />
                </div>
            )}

            {activeTab === 'import_auctions' && (
                <div className="max-w-2xl">
                    <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">Import Auctions CSV</h2>
                    <CsvUpload type="auctions" onSuccess={() => setActiveTab('auctions')} />
                </div>
            )}
        </div>
    );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`pb-2 px-4 whitespace-nowrap transition-colors ${active ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
    >
        {label}
    </button>
);

export default AdminAuctions;
