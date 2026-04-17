import React, { useState } from 'react';
import { Property } from '../../types';
import { PropertyStructureCard } from './PropertyStructureCard';

interface Props {
    property: Property;
}

export const PropertyExtendedTabs: React.FC<Props> = ({ property }) => {
    const [activeTab, setActiveTab] = useState<'structure' | 'parcel' | 'amenities'>('structure');
    const d = property.details || (property as any);

    // Parcel DataRow component
    const DataRow = ({ label, value }: { label: string, value: string | number | null | undefined }) => {
        if (!value) return null;
        return (
            <div className="flex justify-between items-start py-2.5 border-b border-slate-100 dark:border-slate-800/50 last:border-0 gap-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap pt-0.5">{label}</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 text-right">{value}</span>
            </div>
        );
    };

    // Render amenities from JSONB/arrays
    const renderAmenities = () => {
        const hasFeatures = d.other_areas || d.other_features || d.amenities || (d.flooring_types && d.flooring_types.length > 0) || d.other_rooms;
        if (!hasFeatures) return <div className="p-4 text-sm font-bold text-slate-500 text-center">No extended features or amenities data available.</div>;

        const renderJsonTags = (data: any, title: string) => {
            if (!data) return null;
            // Handle array or object
            let items: string[] = [];
            if (Array.isArray(data)) {
                items = data.map(String);
            } else if (typeof data === 'object') {
                items = Object.entries(data).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`);
            } else if (typeof data === 'string') {
                try {
                    const parsed = JSON.parse(data);
                    if (Array.isArray(parsed)) items = parsed.map(String);
                    else if (typeof parsed === 'object') items = Object.entries(parsed).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`);
                    else items = [data]; // scalar string inside string
                } catch (e) {
                    items = [data]; // normal string
                }
            }
            if (items.length === 0) return null;

            return (
                <div className="mb-6 last:mb-0">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">{title}</h4>
                    <div className="flex flex-wrap gap-2">
                        {items.map((item, i) => (
                            <span key={i} className="px-2.5 py-1.5 text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-md capitalize">
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            );
        };

        return (
            <div className="p-2">
                {renderJsonTags(d.amenities, 'General Amenities')}
                {renderJsonTags(d.other_features, 'Other Features')}
                {renderJsonTags(d.other_areas, 'Extended Areas')}
                {renderJsonTags(d.other_improvements, 'Additional Improvements')}
                {renderJsonTags(d.flooring_types, 'Flooring Types')}
                {renderJsonTags(d.other_rooms, 'Other Rooms')}
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mt-6">
            <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
                <button 
                    onClick={() => setActiveTab('structure')}
                    className={`flex-1 py-3 text-[10px] md:text-xs font-black uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'structure' ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                    <span className="flex items-center justify-center gap-1.5"><span className="material-symbols-outlined text-[16px]">architecture</span> Structure</span>
                </button>
                <button 
                    onClick={() => setActiveTab('parcel')}
                    className={`flex-1 py-3 text-[10px] md:text-xs font-black uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'parcel' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                    <span className="flex items-center justify-center gap-1.5"><span className="material-symbols-outlined text-[16px]">landscape</span> Parcel Data</span>
                </button>
                <button 
                    onClick={() => setActiveTab('amenities')}
                    className={`flex-1 py-3 text-[10px] md:text-xs font-black uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'amenities' ? 'border-violet-500 text-violet-600 dark:text-violet-400 bg-white dark:bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                    <span className="flex items-center justify-center gap-1.5"><span className="material-symbols-outlined text-[16px]">lists</span> Amenities</span>
                </button>
            </div>

            <div className="p-0">
                {activeTab === 'structure' && (
                    <div className="p-0">
                        <PropertyStructureCard property={property} isTabContent={true} />
                    </div>
                )}
                
                {activeTab === 'parcel' && (
                    <div className="p-6">
                        <div className="space-y-0.5">
                            <DataRow label="Legal Description" value={d.legal_description} />
                            <DataRow label="Land Use (Std Category)" value={d.standardized_land_use_category} />
                            <DataRow label="Land Use (Std Type)" value={d.standardized_land_use_type} />
                            <DataRow label="County Land Use Code" value={d.county_land_use_code} />
                            <DataRow label="County Land Use Desc" value={d.county_land_use_description} />
                            <DataRow label="Subdivision / Tract" value={d.subdivision} />
                            <DataRow label="Lot Number" value={d.lot_number} />
                            <DataRow label="Municipality" value={d.municipality} />
                            <DataRow label="Township / Range" value={d.section_township_range} />
                            <DataRow label="Zoning" value={d.zoning || property.zoning} />
                        </div>
                    </div>
                )}

                {activeTab === 'amenities' && (
                    <div className="p-6">
                        {renderAmenities()}
                    </div>
                )}
            </div>
        </div>
    );
};
