import React from 'react';
import { AuctionService, API_BASE_URL } from '../services/api';

export const Reports: React.FC = () => {

    // Mock report list for now, can be dynamic later
    const reports = [
        { id: 'inventory-summary', title: 'Inventory Summary', desc: 'Overview of all active and sold properties.', type: 'PDF' },
        { id: 'financial-breakdown', title: 'Financial Breakdown', desc: 'Detailed analysis of assessed values vs. opening bids.', type: 'CSV' },
        { id: 'recent-sales', title: 'Recent Sales', desc: 'List of properties sold in the last 30 days.', type: 'PDF' },
    ];

    const handleDownload = async (reportTitle: string) => {
        try {
            // For now, mapping all to summary. Future: switch based on ID.
            const { url } = await AuctionService.generateAggregateReport('summary');
            const fullUrl = `${API_BASE_URL}${url}`;
            window.open(fullUrl, '_blank');
        } catch (e) {
            console.error(e);
            alert("Failed to generate report. Please try again.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reports Center</h2>
            <p className="text-slate-500">Generate and download standard reports for your inventory.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                    <div key={report.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                                <span className="material-symbols-outlined">{report.type === 'PDF' ? 'picture_as_pdf' : 'table_chart'}</span>
                            </div>
                            <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                                {report.type}
                            </span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{report.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 min-h-[40px]">
                            {report.desc}
                        </p>
                        <button
                            onClick={() => handleDownload(report.title)}
                            className="w-full py-2 px-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            Download
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
