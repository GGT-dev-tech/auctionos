import React from 'react';
import { Property } from '../../types';

interface Props {
    property: Property;
}

export const PropertyResearchLinks: React.FC<Props> = ({ property }) => {
    
    // Safely construct search queries
    const addressQuery = encodeURIComponent(property.address || property.parcel_address || '');
    const locationQuery = encodeURIComponent(`${property.city || ''} ${property.state || ''} ${property.zip_code || ''}`);
    const fullQuery = encodeURIComponent(`${property.address || property.parcel_address || ''} ${property.city || ''} ${property.state || ''}`);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Research Links</h3>
            
            <div className="space-y-3">
                {/* Google Maps View */}
                <a
                    href={`https://www.google.com/maps/search/?api=1&query=${addressQuery ? fullQuery : property.latitude && property.longitude ? `${property.latitude},${property.longitude}` : locationQuery}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 group"
                >
                    <span className="flex items-center gap-2 font-medium">
                        <span className="material-symbols-outlined text-red-500">pin_drop</span>
                        Google Maps
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-blue-500">open_in_new</span>
                </a>

                {/* Zillow */}
                <a
                    href={property.details?.zillow_url || `https://www.zillow.com/homes/${fullQuery}_rb/`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 group"
                >
                    <span className="flex items-center gap-2 font-medium">
                        <span className="material-symbols-outlined text-blue-500">home</span>
                        Zillow
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-blue-500">open_in_new</span>
                </a>

                {/* Redfin Estimate (If Available) */}
                {property.redfin_url && (
                    <a
                        href={property.redfin_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 group"
                    >
                        <div className="flex items-center gap-2 font-medium">
                            <span className="material-symbols-outlined text-red-600">trending_up</span>
                            Redfin Estimate
                            {property.redfin_estimate && (
                                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                    ${property.redfin_estimate.toLocaleString()}
                                </span>
                            )}
                        </div>
                        <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-blue-500">open_in_new</span>
                    </a>
                )}

                {/* Local GIS Map */}
                {property.map_link && (
                    <a
                        href={property.map_link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 group"
                    >
                        <span className="flex items-center gap-2 font-medium">
                            <span className="material-symbols-outlined text-emerald-600">map</span>
                            County GIS Map
                        </span>
                        <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-blue-500">open_in_new</span>
                    </a>
                )}
            </div>
        </div>
    );
};
