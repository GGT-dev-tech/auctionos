import React from 'react';
import { Property } from '../../types';

interface Props {
    property: Property;
    onOpenFinancials: () => void;
    onOpenMetadata: () => void;
}

export const PropertyBasicInfo: React.FC<Props> = ({ property, onOpenFinancials, onOpenMetadata }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                        {property.title || property.address || 'Unknown Property'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        {[property.city, property.state, property.zip_code].filter(Boolean).join(', ')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={onOpenFinancials}
                        className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200 dark:border-emerald-800"
                    >
                        View Financials
                    </button>
                    <button 
                        onClick={onOpenMetadata}
                        className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 dark:border-blue-800 flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-[14px]">info</span> All Data
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">County / State</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {property.details?.county || '-'} / {property.state || property.details?.state || '-'}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Parcel ID</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white break-all">
                        {property.parcel_id || '-'}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Auction Type</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                        {property.smart_tag || 'Auction'}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Occupancy</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {property.occupancy || '-'}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Acreage</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {property.details?.lot_acres || '-'}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">C/S Number</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {property.cs_number || '-'}
                    </p>
                </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Description</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-h-32 overflow-y-auto pr-2 scrollbar-thin">
                    {property.description || property.details?.legal_description || "No description available."}
                </p>
            </div>
        </div>
    );
};
