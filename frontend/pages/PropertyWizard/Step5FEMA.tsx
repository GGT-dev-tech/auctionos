import React from 'react';
import { Property } from '../../types';

interface Props {
    data: Partial<Property>;
    update: (data: Partial<Property>) => void;
}

export const Step5FEMA: React.FC<Props> = ({ data, update }) => {
    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600">
                    <span className="material-symbols-outlined">flood</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">FEMA Flood Risk</h2>
            </div>

            <div className="max-w-xl mx-auto space-y-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Flood Zone Code</label>
                            <input
                                className="w-full rounded-lg border-slate-300 text-sm"
                                placeholder="e.g. X, AE, VE"
                                value={data.details?.flood_zone_code || ''}
                                onChange={e => update({ details: { ...data.details, flood_zone_code: e.target.value } })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">FEMA Map URL</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400">map</span>
                                </span>
                                <input
                                    className="pl-10 w-full rounded-lg border-slate-300 text-sm"
                                    placeholder="https://msc.fema.gov/..."
                                    value={data.details?.fema_url || ''}
                                    onChange={e => update({ details: { ...data.details, fema_url: e.target.value } })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
