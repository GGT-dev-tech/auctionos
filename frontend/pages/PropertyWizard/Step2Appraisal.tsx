import React from 'react';
import { Property } from '../../types';

interface Props {
    data: Partial<Property>;
    update: (data: Partial<Property>) => void;
}

export const Step2Appraisal: React.FC<Props> = ({ data, update }) => {
    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-emerald-600">
                    <span className="material-symbols-outlined">request_quote</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Appraisal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="text-sm font-bold border-b pb-2">Structure Details</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-xs text-slate-500">Year Built</label><input type="number" className="w-full rounded text-sm border-slate-300" value={data.details?.year_built || ''} onChange={e => update({ details: { ...data.details, year_built: parseInt(e.target.value) } })} /></div>
                        <div><label className="text-xs text-slate-500">SqFt</label><input type="number" className="w-full rounded text-sm border-slate-300" value={data.details?.sqft || ''} onChange={e => update({ details: { ...data.details, sqft: parseInt(e.target.value) } })} /></div>
                        <div><label className="text-xs text-slate-500">Stories</label><input type="number" className="w-full rounded text-sm border-slate-300" value={data.details?.num_stories || ''} onChange={e => update({ details: { ...data.details, num_stories: parseInt(e.target.value) } })} /></div>
                        <div><label className="text-xs text-slate-500">Units</label><input type="number" className="w-full rounded text-sm border-slate-300" value={data.details?.num_units || ''} onChange={e => update({ details: { ...data.details, num_units: parseInt(e.target.value) } })} /></div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-bold border-b pb-2">Valuation (County)</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-xs text-slate-500">Assessed Value</label><input type="number" className="w-full rounded text-sm border-slate-300" value={data.details?.assessed_value || ''} onChange={e => update({ details: { ...data.details, assessed_value: parseFloat(e.target.value) } })} /></div>
                        <div><label className="text-xs text-slate-500">Land Value</label><input type="number" className="w-full rounded text-sm border-slate-300" value={data.details?.land_value || ''} onChange={e => update({ details: { ...data.details, land_value: parseFloat(e.target.value) } })} /></div>
                        <div><label className="text-xs text-slate-500">Improvement Value</label><input type="number" className="w-full rounded text-sm border-slate-300" value={data.details?.improvement_value || ''} onChange={e => update({ details: { ...data.details, improvement_value: parseFloat(e.target.value) } })} /></div>
                        <div><label className="text-xs text-slate-500">Tax Amount</label><input type="number" className="w-full rounded text-sm border-slate-300" value={data.details?.tax_amount || ''} onChange={e => update({ details: { ...data.details, tax_amount: parseFloat(e.target.value) } })} /></div>
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-4">
                    <h3 className="text-sm font-bold border-b pb-2">Appraisal Notes</h3>
                    <textarea className="w-full rounded border-slate-300 text-sm p-3 h-32" placeholder="Enter appraisal description or notes..." value={data.details?.appraisal_desc || ''} onChange={e => update({ details: { ...data.details, appraisal_desc: e.target.value } })} />
                </div>
            </div>
        </div>
    );
};
