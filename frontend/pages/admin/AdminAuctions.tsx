
import React, { useState } from 'react';
import AuctionCalendar from '../../components/admin/AuctionCalendar';
import CsvUpload from '../../components/admin/CsvUpload';
import PropertyForm from '../../components/admin/PropertyForm';
import PropertyList from '../../components/admin/PropertyList';

const AdminAuctions: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'calendar' | 'properties' | 'import_props' | 'import_auctions'>('calendar');

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Admin Module</h1>

            <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                <TabButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} label="Auction Calendar" />
                <TabButton active={activeTab === 'properties'} onClick={() => setActiveTab('properties')} label="Property Manager" />
                <TabButton active={activeTab === 'import_props'} onClick={() => setActiveTab('import_props')} label="Import Properties (CSV)" />
                <TabButton active={activeTab === 'import_auctions'} onClick={() => setActiveTab('import_auctions')} label="Import Auctions (CSV)" />
            </div>

            {activeTab === 'calendar' && <AuctionCalendar />}

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
                    <CsvUpload type="auctions" onSuccess={() => setActiveTab('calendar')} />
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
