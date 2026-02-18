import React from 'react';
import { X, Calendar, MapPin, Info, List, ExternalLink } from 'lucide-react';
import { AuctionEvent } from '../types';

interface AuctionDetailsModalProps {
    auction: AuctionEvent | null;
    onClose: () => void;
}

export const AuctionDetailsModal: React.FC<AuctionDetailsModalProps> = ({ auction, onClose }) => {
    if (!auction) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                {/* Modal panel */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">

                    <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl leading-6 font-bold text-blue-600 dark:text-blue-400" id="modal-title">
                                {auction.state}: {auction.county} Auction
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            {/* Notes/Description */}
                            <div className="text-sm text-gray-500 dark:text-gray-300">
                                {auction.notes || "No specific notes for this auction."}
                            </div>

                            {/* When */}
                            <div className="flex items-start gap-2">
                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <span className="font-bold text-gray-700 dark:text-gray-200">When: </span>
                                    <span className="text-gray-600 dark:text-gray-300">
                                        {new Date(auction.start_date).toLocaleDateString(undefined, {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                        {auction.time ? ` @ ${auction.time}` : ''}
                                    </span>
                                </div>
                            </div>

                            {/* Where */}
                            <div className="flex items-start gap-2">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <span className="font-bold text-gray-700 dark:text-gray-200">Where: </span>
                                    <span className="text-gray-600 dark:text-gray-300">
                                        {auction.location || "Online / TBD"}
                                    </span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-start gap-2">
                                <List className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <span className="font-bold text-gray-700 dark:text-gray-200">Active Parcels: </span>
                                    <span className="text-gray-600 dark:text-gray-300">
                                        {auction.property_count || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-slate-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                        <a href="#" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Register
                        </a>
                        <a href="#" className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-500 text-base font-medium text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                            <Info className="w-4 h-4 mr-2" />
                            Source Info
                        </a>
                        <a href="#" className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                            <List className="w-4 h-4 mr-2" />
                            Advertised List
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
