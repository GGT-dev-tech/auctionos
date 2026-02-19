
import React, { useState } from 'react';
import AuctionCalendar from '../../components/admin/AuctionCalendar';
import CsvUpload from '../../components/admin/CsvUpload';

const AdminAuctions: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'calendar' | 'import'>('calendar');

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Auction Administration</h1>

            <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab('calendar')}
                    className={`pb-2 px-4 ${activeTab === 'calendar' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-slate-500'}`}
                >
                    Calendar
                </button>
                <button
                    onClick={() => setActiveTab('import')}
                    className={`pb-2 px-4 ${activeTab === 'import' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-slate-500'}`}
                >
                    Import Data
                </button>
            </div>

            {activeTab === 'calendar' && (
                <AuctionCalendar />
            )}

            {activeTab === 'import' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">Import Properties</h2>
                        <CsvUpload type="properties" onSuccess={() => console.log("Properties imported")} />
                        <p className="mt-2 text-sm text-slate-500">
                            Upload a CSV with property details using columns like "Parcel ID", "Address", "Amount Due", etc.
                        </p>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">Import Auctions</h2>
                        <CsvUpload type="auctions" onSuccess={() => console.log("Auctions imported")} />
                        <p className="mt-2 text-sm text-slate-500">
                            Upload a CSV with auction events. Can include linked parcels in a "Parcels" column (comma-separated).
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAuctions;
