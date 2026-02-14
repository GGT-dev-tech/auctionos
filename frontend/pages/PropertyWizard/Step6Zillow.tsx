import React from 'react';
import { Property } from '../../types';

interface Props {
    data: Partial<Property>;
    update: (data: Partial<Property>) => void;
}

export const Step6Zillow: React.FC<Props> = ({ data, update }) => {
    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                    <span className="material-symbols-outlined">home_work</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Zillow Estimates</h2>
            </div>

            <div className="max-w-xl mx-auto space-y-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Zillow URL</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400">link</span>
                                </span>
                                <input
                                    className="pl-10 w-full rounded-lg border-slate-300 text-sm"
                                    placeholder="https://zillow.com/homedetails/..."
                                    value={data.details?.zillow_url || ''}
                                    onChange={e => update({ details: { ...data.details, zillow_url: e.target.value } })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Zestimate (Estimated Value)</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400">attach_money</span>
                                </span>
                                <input
                                    type="number"
                                    className="pl-10 w-full rounded-lg border-slate-300 text-sm"
                                    value={data.details?.estimated_value || ''}
                                    onChange={e => update({ details: { ...data.details, estimated_value: parseFloat(e.target.value) } })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Rental Estimate</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400">payments</span>
                                </span>
                                <input
                                    type="number"
                                    className="pl-10 w-full rounded-lg border-slate-300 text-sm"
                                    value={data.details?.rental_value || ''}
                                    onChange={e => update({ details: { ...data.details, rental_value: parseFloat(e.target.value) } })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
