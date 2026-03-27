import React, { useState } from 'react';
import { Property } from '../../types';
import { Modal } from '../Modal';

interface Props {
    property: Property;
}

export const PropertyComps: React.FC<Props> = ({ property }) => {
    const [isArvOpen, setIsArvOpen] = useState(false);
    const [isRentOpen, setIsRentOpen] = useState(false);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-blue-500">analytics</span>
                Estimates & Comps
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                    onClick={() => setIsArvOpen(true)}
                    className="flex flex-col items-start p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-left group"
                >
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Estimated ARV</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {property.details?.estimated_value ? `$${property.details.estimated_value.toLocaleString()}` : 'View Details'}
                    </span>
                    <span className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        View Comparable Sales <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </span>
                </button>

                <button 
                    onClick={() => setIsRentOpen(true)}
                    className="flex flex-col items-start p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-left group"
                >
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Estimated Rent</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                        {property.details?.rental_value ? `$${property.details.rental_value.toLocaleString()}/mo` : 'View Details'}
                    </span>
                    <span className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        View Rent Report <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </span>
                </button>
            </div>

            {/* Placeholder Modals for Comps */}
            <Modal isOpen={isArvOpen} onClose={() => setIsArvOpen(false)} title="Comparable Sales Report" size="3xl">
                <div className="text-center py-12">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">query_stats</span>
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Sales Comps Data Coming Soon</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
                        The matching logic for pulling distance, property type, side similarity, and price range proximity is currently being structured. 
                    </p>
                </div>
            </Modal>

            <Modal isOpen={isRentOpen} onClose={() => setIsRentOpen(false)} title="Comparable Rent Report" size="3xl">
                <div className="text-center py-12">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">real_estate_agent</span>
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Rental Comps Data Coming Soon</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
                        The matching logic for local market rental comparables is currently being structured.
                    </p>
                </div>
            </Modal>
        </div>
    );
};
