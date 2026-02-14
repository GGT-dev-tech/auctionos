import React from 'react';
import { Property } from '../../types';

interface Props {
    data: Partial<Property>;
    update: (data: Partial<Property>) => void;
}

export const Step4Validation: React.FC<Props> = ({ data, update }) => {
    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600">
                    <span className="material-symbols-outlined">verified</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">GSI Validation</h2>
            </div>

            <div className="max-w-xl mx-auto space-y-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">GSI Map Validation URL</label>
                    <div className="relative mb-4">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400">link</span>
                        </span>
                        <input
                            className="pl-10 w-full rounded-lg border-slate-300 text-sm"
                            placeholder="https://..."
                            value={data.details?.gsi_url || ''}
                            onChange={e => update({ details: { ...data.details, gsi_url: e.target.value } })}
                        />
                    </div>

                    <label className="block text-sm font-semibold text-slate-700 mb-2">Validation Data (JSON/Notes)</label>
                    <textarea
                        className="w-full rounded-lg border-slate-300 text-sm h-32"
                        placeholder="Enter validation results or raw data..."
                        value={data.details?.gsi_data || ''}
                        onChange={e => update({ details: { ...data.details, gsi_data: e.target.value } })}
                    />
                </div>
            </div>
        </div>
    );
};
