import React from 'react';
import { Property } from '../../types';

interface Props {
    property: Property;
    isTabContent?: boolean;
}

export const PropertyStructureCard: React.FC<Props> = ({ property, isTabContent = false }) => {
    const d = property.details || (property as any);

    // If we have literally no structural data, maybe hide or show a placeholder
    const hasData = d.year_built || d.effective_year_built || d.stories || d.property_type || d.quality || d.condition;
    
    if (!hasData) return null;

    const DataRow = ({ label, value }: { label: string, value: string | number | null | undefined }) => {
        if (!value) return null;
        return (
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 text-right">{value}</span>
            </div>
        );
    };

    const getQualityColor = (quality: string) => {
        const q = quality.toUpperCase();
        if (q.startsWith('A') || q === 'EXCELLENT' || q === 'GOOD') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
        if (q.startsWith('B') || q.startsWith('C') || q === 'AVERAGE') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
        if (q.startsWith('D') || q === 'FAIR') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'; // E+, POOR
    };

    const wrapperStyle = isTabContent 
        ? "p-6" 
        : "bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700";

    return (
        <div className={wrapperStyle}>
            {!isTabContent && (
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500">architecture</span>
                    Structure Details
                </h3>
            )}

            {(d.quality || d.condition) && (
                <div className="flex gap-2 mb-4">
                    {d.quality && (
                        <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wide ${getQualityColor(d.quality)}`}>
                            Quality: {d.quality}
                        </span>
                    )}
                    {d.condition && (
                        <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wide ${getQualityColor(d.condition)}`}>
                            Condition: {d.condition}
                        </span>
                    )}
                </div>
            )}

            <div className="space-y-0.5 mt-2">
                <DataRow label="Year Built" value={d.effective_year_built ? `${d.year_built} (Renovated: ${d.effective_year_built})` : d.year_built} />
                <DataRow label="Stories" value={d.stories || d.num_stories} />
                <DataRow label="Total Rooms" value={d.rooms_count} />
                <DataRow label="Bed/Bath" value={d.bedrooms && d.bathrooms ? `${d.bedrooms} / ${d.bathrooms} ${d.partial_baths_count ? `(+${d.partial_baths_count} partial)` : ''}` : null} />
                <DataRow label="Architecture" value={d.architecture_type || d.structure_style} />
                <DataRow label="Construction" value={d.construction_type} />
                <DataRow label="Exterior Wall" value={d.exterior_wall_type} />
                <DataRow label="Foundation" value={d.foundation_type} />
                <DataRow label="Roof" value={d.roof_material_type ? `${d.roof_style_type || ''} ${d.roof_material_type}` : d.roof_style_type} />
                <DataRow label="Heating" value={d.heating_type ? `${d.heating_type} (${d.heating_fuel_type || 'Unknown Fuel'})` : null} />
                <DataRow label="Cooling (A/C)" value={d.air_conditioning_type} />
                <DataRow label="Fireplaces" value={d.fireplaces} />
                <DataRow label="Basement" value={d.basement_type} />
                <DataRow label="Pool" value={d.pool_type} />
                <DataRow label="Parking" value={d.parking_type ? `${d.parking_type} (${d.parking_spaces_count || 0} spaces)` : null} />
                <DataRow label="Water / Sewer" value={d.water_type || d.sewer_type ? `${d.water_type || '?'} / ${d.sewer_type || '?'}` : null} />
            </div>
        </div>
    );
};
