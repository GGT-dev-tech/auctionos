import React, { useState } from 'react';
import { Property } from '../../types';
import { Modal } from '../Modal';
import { estimateARV } from '../../intelligence/arvEstimator';
import { estimateRent } from '../../intelligence/rentEstimator';

interface Props {
    property: Property;
}

export const PropertyComps: React.FC<Props> = ({ property }) => {
    const [isArvOpen, setIsArvOpen] = useState(false);
    const [isRentOpen, setIsRentOpen] = useState(false);

    // Calculate dynamic intelligence estimates
    const arvEstimate = estimateARV(property);
    const rentEstimate = estimateRent(property);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-blue-500">analytics</span>
                Estimates & Comps
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {/* ARV Button */}
                <button 
                    onClick={() => setIsArvOpen(true)}
                    className="flex flex-col items-start p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-left group h-full relative"
                >
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Estimated ARV</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {arvEstimate.value > 0 ? `$${arvEstimate.value.toLocaleString()}` : 'N/A'}
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${arvEstimate.confidence === 'High' ? 'bg-green-100 text-green-700' : arvEstimate.confidence === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                            {arvEstimate.confidence} Confidence
                        </span>
                    </div>
                    <span className="text-xs text-slate-400 mt-auto pt-4 flex items-center gap-1">
                        View Comp Logic <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </span>
                </button>

                {/* Rent Button */}
                <button 
                    onClick={() => setIsRentOpen(true)}
                    className="flex flex-col items-start p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-left group h-full relative"
                >
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Estimated Rent</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                        {rentEstimate.monthlyRent > 0 ? `$${rentEstimate.monthlyRent.toLocaleString()}/mo` : 'N/A'}
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                        {rentEstimate.yieldPercentage > 0 && (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                {rentEstimate.yieldPercentage}% Yield
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-slate-400 mt-auto pt-4 flex items-center gap-1">
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
