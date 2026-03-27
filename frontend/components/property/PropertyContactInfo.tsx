import React from 'react';
import { PropertyDetails as Property } from '../../types';

interface PropertyContactInfoProps {
    property: Property;
}

export const PropertyContactInfo: React.FC<PropertyContactInfoProps> = ({ property }) => {
    const detail = property.details || {};
    
    const infoItems = [
        {
            label: 'Owner Name',
            value: property.owner_name || 'Unavailable',
            subtitle: 'Verified Owner of Record',
            icon: 'person'
        },
        {
            label: 'Owner Address',
            value: detail.owner_address || 'Unavailable',
            subtitle: 'Last Reported Mailing Address',
            icon: 'home'
        },
        {
            label: 'Property Address',
            value: property.address || detail.property_address || 'Unavailable',
            subtitle: 'Primary Location',
            icon: 'location_on'
        },
        {
            label: 'Tax Payer',
            value: detail.tax_payer_name || property.owner_name || 'Unavailable',
            subtitle: 'Current Registered Payer',
            icon: 'receipt'
        }
    ];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm h-full flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-blue-500 text-lg">contact_page</span>
                Ownership & Contact
            </h3>
            
            <div className="space-y-4 flex-1">
                {infoItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                        <div className="mt-0.5 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-[16px] text-slate-500">{item.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                {item.label}
                            </p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate leading-tight">
                                {item.value}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1 italic">
                                {item.subtitle}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[10px] text-slate-400">person</span>
                        </div>
                    ))}
                    <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-blue-500 flex items-center justify-center text-[8px] text-white font-bold">
                        +2
                    </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400">Contact History</span>
            </div>
        </div>
    );
};
