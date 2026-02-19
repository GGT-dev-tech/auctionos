import React, { useState, useEffect } from 'react';
import { AuctionEvent } from '../types';

interface AuctionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<AuctionEvent>) => Promise<void>;
    initialData?: AuctionEvent;
    isLoading?: boolean;
}

export const AuctionFormModal: React.FC<AuctionFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isLoading
}) => {
    const [formData, setFormData] = useState<Partial<AuctionEvent>>({});

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || {
                name: '',
                auction_date: '',
                time: '',
                location: '',
                county: '',
                state: '',
                notes: ''
            });
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {initialData ? 'Edit Auction Event' : 'New Auction Event'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name || ''}
                                onChange={handleChange}
                                className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Short Name
                            </label>
                            <input
                                type="text"
                                name="short_name"
                                value={formData.short_name || ''}
                                onChange={handleChange}
                                className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Auction Date *
                            </label>
                            <input
                                type="date"
                                name="auction_date"
                                required
                                value={formData.auction_date || ''}
                                onChange={handleChange}
                                className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Time
                            </label>
                            <input
                                type="time"
                                name="time"
                                value={formData.time || ''}
                                onChange={handleChange}
                                className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                County
                            </label>
                            <input
                                type="text"
                                name="county"
                                value={formData.county || ''}
                                onChange={handleChange}
                                className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                State
                            </label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state || ''}
                                onChange={handleChange}
                                className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Location
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location || ''}
                            onChange={handleChange}
                            className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            rows={3}
                            value={formData.notes || ''}
                            onChange={handleChange}
                            className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Search Link
                            </label>
                            <input
                                type="url"
                                name="search_link"
                                value={formData.search_link || ''}
                                onChange={handleChange}
                                className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Register Link
                            </label>
                            <input
                                type="url"
                                name="register_link"
                                value={formData.register_link || ''}
                                onChange={handleChange}
                                className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : 'Save Auction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
