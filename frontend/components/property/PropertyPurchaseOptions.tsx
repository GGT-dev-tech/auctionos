import React, { useState } from 'react';
import { Property } from '../../types';
import { Modal } from '../Modal';

interface Props {
    property: Property;
    readOnly?: boolean;
    actionLoading?: boolean;
    onSimulatePurchase?: () => void;
}

export const PropertyPurchaseOptions: React.FC<Props> = ({ 
    property, 
    readOnly, 
    actionLoading, 
    onSimulatePurchase 
}) => {
    const [isApplyOpen, setIsApplyOpen] = useState(false);

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    const isAvailable = property.availability_status === 'available' || property.details?.availability_status === 'available';
    const isPurchased = property.availability_status === 'purchased' || property.details?.availability_status === 'purchased';

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-emerald-500">shopping_cart_checkout</span>
                Purchase Options
            </h3>

            {/* Structured Auction Data */}
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600 flex-1">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">Auction Status</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {property.availability_status || property.details?.availability_status || 'Active'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">Taxes Due</p>
                        <p className="text-sm font-bold text-red-600 dark:text-red-400">
                            {property.amount_due ? `$${property.amount_due.toLocaleString()}` : '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">Date</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {property.auction_history && property.auction_history[0] ? formatDate(property.auction_history[0].auction_date) : '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">Listed Parcel</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {property.auction_history && property.auction_history[0] ? property.auction_history[0].listed_as : property.parcel_id || '-'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-auto">
                <button 
                    onClick={() => setIsApplyOpen(true)}
                    className="w-full py-2.5 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                    <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                    Apply Online Instructions
                </button>
                
                {/* Simulated Purchase Button (Admins only, if available) */}
                {!readOnly && isAvailable && onSimulatePurchase && (
                    <button 
                        onClick={actionLoading ? undefined : onSimulatePurchase}
                        disabled={actionLoading}
                        className={`w-full py-2.5 px-4 border text-center rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${actionLoading ? 'border-slate-200 text-slate-400 bg-slate-50' : 'border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-900/20'}`}
                    >
                        {actionLoading ? (
                            <>
                                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                                Processing...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">payments</span>
                                Purchase (Simulate OTC)
                            </>
                        )}
                    </button>
                )}

                {/* Purchased Status Indicator */}
                {!readOnly && isPurchased && (
                    <div className="w-full py-2.5 px-4 border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-not-allowed">
                        <span className="material-symbols-outlined text-[18px]">block</span>
                        Already Purchased
                    </div>
                )}
            </div>

            {/* Apply Online Modal */}
            <Modal isOpen={isApplyOpen} onClose={() => setIsApplyOpen(false)} title="Apply Online" size="2xl">
                <div className="space-y-6">
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
                        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 mt-0.5">warning</span>
                        <div className="text-sm text-amber-800 dark:text-amber-300">
                            <strong>Disclaimer:</strong> You are about to leave the AuctionOS platform. AuctionOS is not responsible for external systems. The application process, including all documentation and payments, is handled exclusively by the respective state or county authority.
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">Instructions (Alabama Example)</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300">
                            <li>Visit the state portal using the link below.</li>
                            <li>Search for CS Number: <strong className="text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-1 rounded">{property.cs_number || 'UNKNOWN'}</strong></li>
                            <li>Verify the Parcel ID: <strong>{property.parcel_id}</strong></li>
                            <li>Complete the application and submit the required documentation.</li>
                        </ol>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                        <a 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); alert('External link opening simulation.'); }}
                            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                            Proceed to State Portal <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                        </a>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
