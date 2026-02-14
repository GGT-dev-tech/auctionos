import React from 'react';
import { Property } from '../../types';

interface Props {
    data: Partial<Property>;
    update: (data: Partial<Property>) => void;
}

export const Step3Regrid: React.FC<Props> = ({ data, update }) => {
    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
                    <span className="material-symbols-outlined">dataset</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Regrid Data</h2>
            </div>

            <div className="max-w-xl mx-auto space-y-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <p className="text-sm text-slate-600 mb-4">Provide the Regrid URL for this property. Future versions will auto-fetch data from this URL.</p>

                    <label className="block text-sm font-semibold text-slate-700 mb-2">Regrid Property URL</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400">link</span>
                        </span>
                        <input
                            className="pl-10 w-full rounded-lg border-slate-300 text-sm"
                            placeholder="https://regrid.com/..."
                            value={data.details?.regrid_url || ''}
                            onChange={e => update({ details: { ...data.details, regrid_url: e.target.value } })}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="material-symbols-outlined text-2xl">info</span>
                    <p>Regrid provides comprehensive parcel data including ownership, land use, and boundaries.</p>
                </div>
            </div>
        </div>
    );
};
