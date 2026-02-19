
import React from 'react';
import { UploadWizard } from '../components/UploadWizard';

export default function AdminImport() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Data Import</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Section 1: Property Import */}
                <UploadWizard
                    endpoint="/admin/import-properties"
                    title="Import Properties"
                    onComplete={() => console.log("Properties Imported")}
                />

                {/* Section 2: Auction Import */}
                <UploadWizard
                    endpoint="/admin/import-auctions"
                    title="Import Auctions"
                    onComplete={() => console.log("Auctions Imported")}
                />
            </div>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Instructions</h4>
                <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li><strong>Properties CSV:</strong> Must contain 'Parcel ID', 'Address', 'Amount Due', etc.</li>
                    <li><strong>Auctions CSV:</strong> Must contain 'Auction Name', 'Date', 'Parcels' column for linking.</li>
                    <li>Large files will be processed in the background. You can navigate away safely.</li>
                </ul>
            </div>
        </div>
    );
}
