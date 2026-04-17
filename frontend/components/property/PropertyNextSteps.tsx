import React from 'react';
import { PropertyDetails as Property } from '../../types';

interface PropertyNextStepsProps {
    property: Property;
    onActionClick?: (action: string) => void;
}

export const PropertyNextSteps: React.FC<PropertyNextStepsProps> = ({ property, onActionClick }) => {
    const steps = [
        {
            id: 'owner_research',
            icon: 'person_search',
            label: 'Skip Trace Owner',
            desc: 'Find current contact info for probate/owner.',
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/20'
        },
        {
            id: 'due_diligence',
            icon: 'verified',
            label: 'Verify Title',
            desc: 'Order title search for liens/encumbrances.',
            color: 'text-emerald-500',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20'
        },
        {
            id: 'valuation',
            icon: 'analytics',
            label: 'Market Valuation',
            desc: 'Order expert ARV appraisal or local comps.',
            color: 'text-purple-500',
            bg: 'bg-purple-50 dark:bg-purple-900/20'
        },
        {
            id: 'legal',
            icon: 'gavel',
            label: 'Legal Strategy',
            desc: 'Consult regarding quiet title or probate.',
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-900/20'
        }
    ];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm h-full flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-indigo-500 text-lg">timeline</span>
                Recommended Next Steps
            </h3>
            
            <div className="space-y-3 flex-1 overflow-auto pr-1">
                {steps.map((step) => (
                    <button 
                        key={step.id}
                        onClick={() => onActionClick?.(step.id)}
                        className="w-full flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-left group"
                    >
                        <div className={`mt-0.5 w-8 h-8 rounded-lg ${step.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            <span className={`material-symbols-outlined text-[16px] ${step.color}`}>{step.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight">
                                {step.label}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                                {step.desc}
                            </p>
                        </div>
                        <span className="material-symbols-outlined text-slate-300 text-[14px] mt-1 group-hover:text-blue-500 transition-colors">chevron_right</span>
                    </button>
                ))}
            </div>
            
            <button className="w-full mt-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-lg text-[10px] font-bold text-indigo-600 hover:bg-indigo-100 transition-all uppercase tracking-widest">
                Customize Strategy
            </button>
        </div>
    );
};
