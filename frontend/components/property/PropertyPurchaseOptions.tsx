import React, { useState } from 'react';
import { Property } from '../../types';
import { Modal } from '../Modal';

interface Props {
    property: Property;
}

export const PropertyPurchaseOptions: React.FC<Props> = ({ property }) => {
    const [isApplyOpen, setIsApplyOpen] = useState(false);

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-emerald-500">shopping_cart_checkout</span>
                Purchase Options
            </h3>

            {/* Structured Auction Data */}
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">Auction Status</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {property.availability_status || property.details?.availability_status || 'Active'}
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
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {property.auction_history && property.auction_history[0] ? property.auction_history[0].listed_as : property.parcel_id || '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">Taxes Due</p>
                        <p className="text-sm font-bold text-red-600 dark:text-red-400">
                            {property.amount_due ? `$${property.amount_due.toLocaleString()}` : '-'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                <button 
                    onClick={() => setIsApplyOpen(true)}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                    <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                    Apply Online
                </button>
                <button 
                    onClick={() => alert('View Auction logic tied to mapping system coming soon')}
                    className="flex-1 py-2.5 px-4 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold transition-colors flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-[18px]">gavel</span>
                    View Auction
                </button>
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
