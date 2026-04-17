import React from 'react';
import { Property } from '../../types';

interface Props {
    property: Property;
}

export const PropertyOwnerCard: React.FC<Props> = ({ property }) => {
    const d = property.details || (property as any);

    const ownerName = d.owner_name || property.owner_name;
    const ownerSecondName = d.owner_second_name;
    
    // Combining address components
    const formatAddress = () => {
        if (d.owner_formatted_street_address) {
            const parts = [
                d.owner_formatted_street_address, 
                [d.owner_city, d.owner_state, d.owner_zip_code].filter(Boolean).join(' ')
            ].filter(Boolean);
            return parts.join(', ');
        }
        return property.owner_address || d.owner_address || '—';
    };

    const ownerOccupied = d.owner_occupied;
    
    // Defaulting logic
    const hasData = ownerName || d.owner_formatted_street_address || property.owner_address;

    if (!hasData) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-violet-500">account_circle</span>
                Owner Information
            </h3>
            
            <div className="space-y-4">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Primary Owner</label>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {ownerName || '—'}
                    </p>
                    {ownerSecondName && (
                        <p className="text-xs text-slate-500 mt-0.5">{ownerSecondName} (Co-owner)</p>
                    )}
                </div>

                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Mailing Address</label>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        {formatAddress()}
                    </p>
                </div>

                {ownerOccupied && (
                    <div className="pt-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            ownerOccupied.toUpperCase() === 'YES' || ownerOccupied.toUpperCase() === 'PROBABLE'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                            <span className="material-symbols-outlined text-[14px]">
                                {ownerOccupied.toUpperCase() === 'YES' || ownerOccupied.toUpperCase() === 'PROBABLE' ? 'home' : 'domain'}
                            </span>
                            {ownerOccupied.toUpperCase() === 'YES' ? 'Owner Occupied' : 
                             ownerOccupied.toUpperCase() === 'PROBABLE' ? 'Probably Owner Occupied' : 'Not Owner Occupied'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
