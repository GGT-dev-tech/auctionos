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
    const ownerNameFallback = property.owner_name || property.details?.owner_name || '';

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Research Links</h3>
            
            <div className="space-y-4">
                {ownerNameFallback && (
                    <>
                        <div>
                            <strong className="block text-slate-700 dark:text-slate-300 mb-1">Owner Research:</strong>
                            <ul className="space-y-1 text-blue-600 dark:text-blue-400 text-xs list-disc pl-4">
                                <li><a href={`https://www.google.com/search?q=${encodeURIComponent(ownerNameFallback)}`} target="_blank" rel="noreferrer" className="hover:underline">Google Search</a></li>
                                <li><a href={`https://news.google.com/search?q=${encodeURIComponent(ownerNameFallback)}`} target="_blank" rel="noreferrer" className="hover:underline">Google News</a></li>
                                <li><a href={`https://www.google.com/search?q=${encodeURIComponent(ownerNameFallback + ' obituary')}`} target="_blank" rel="noreferrer" className="hover:underline">Obituary Search</a></li>
                            </ul>
                        </div>
                        <div>
                            <strong className="block text-slate-700 dark:text-slate-300 mb-1">Owner Skip Trace:</strong>
                            <ul className="space-y-1 text-blue-600 dark:text-blue-400 text-xs list-disc pl-4">
                                <li><a href={`https://www.fastpeoplesearch.com/name/${encodeURIComponent(ownerNameFallback)}`} target="_blank" rel="noreferrer" className="hover:underline">Fast People Search</a></li>
                                <li><a href={`https://www.truepeoplesearch.com/results?name=${encodeURIComponent(ownerNameFallback)}`} target="_blank" rel="noreferrer" className="hover:underline">True People Search</a></li>
                                <li><a href={`https://www.cyberbackgroundchecks.com/people/${encodeURIComponent(ownerNameFallback.replace(/ /g, '-'))}`} target="_blank" rel="noreferrer" className="hover:underline">Cyber Background Checks</a></li>
                            </ul>
                        </div>
                    </>
                )}
                
                <div>
                    <strong className="block text-slate-700 dark:text-slate-300 mb-1">Property Research:</strong>
                    <ul className="space-y-1 text-blue-600 dark:text-blue-400 text-xs list-disc pl-4">
                        <li><a href={`https://www.zillow.com/homes/${encodeURIComponent(property.address || '')}_rb`} target="_blank" rel="noreferrer" className="hover:underline">Zillow Property Report</a></li>
                        <li><a href={`https://www.epa.gov/enviro/myenvironment`} target="_blank" rel="noreferrer" className="hover:underline">EPA Report</a></li>
                        <li><a href={`https://news.google.com/search?q=${encodeURIComponent(property.address || property.parcel_id)}`} target="_blank" rel="noreferrer" className="hover:underline">Google News</a></li>
                        <li><a href={`https://msc.fema.gov/portal/search?AddressQuery=${encodeURIComponent(property.address || '')}`} target="_blank" rel="noreferrer" className="hover:underline">FEMA Flood Map Details</a></li>
                        {property.map_link && (
                            <li>
                                <a href={property.map_link} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                    <span className="material-symbols-outlined text-[16px]">map</span> View Official GIS Map
                                </a>
                            </li>
                        )}
                        <li>
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${addressQuery ? fullQuery : property.latitude && property.longitude ? `${property.latitude},${property.longitude}` : locationQuery}`}
                                target="_blank" rel="noreferrer" className="hover:underline"
                            >
                                Google Maps View
                            </a>
                        </li>
                    </ul>
                </div>
                
                <div>
                    <strong className="block text-slate-700 dark:text-slate-300 mb-1">Research Comparables:</strong>
                    <ul className="space-y-1 text-blue-600 dark:text-blue-400 text-xs list-disc pl-4">
                        <li><a href={`https://www.realtor.com/realestateandhomes-search/${encodeURIComponent(property.zip_code || property.city || '')}`} target="_blank" rel="noreferrer" className="hover:underline">Realtor.com Comps</a></li>
                        <li><a href={`https://www.redfin.com/city/${encodeURIComponent(property.city || '')}/${property.state}`} target="_blank" rel="noreferrer" className="hover:underline">Redfin Comps</a></li>
                        {property.redfin_url && (
                            <li>
                                <a href={property.redfin_url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                                    Redfin Value: {property.redfin_estimate ? `$${Number(property.redfin_estimate).toLocaleString()}` : 'Link'}
                                </a>
                            </li>
                        )}
                        <li><a href={`https://www.trulia.com/${property.state}/${encodeURIComponent(property.city || '')}/`} target="_blank" rel="noreferrer" className="hover:underline">Trulia Comps</a></li>
                        <li><a href={`https://www.zillow.com/homes/${encodeURIComponent(property.zip_code || property.city || '')}_rb/`} target="_blank" rel="noreferrer" className="hover:underline">Zillow Comps</a></li>
                    </ul>
                </div>
                
                <div>
                    <strong className="block text-slate-700 dark:text-slate-300 mb-1">Research Local Housing Market:</strong>
                    <ul className="space-y-1 text-blue-600 dark:text-blue-400 text-xs list-disc pl-4">
                        <li><a href={`https://www.realtor.com/realestateandhomes-search/${encodeURIComponent(property.zip_code || property.city || '')}/overview`} target="_blank" rel="noreferrer" className="hover:underline">Realtor.com Market Report</a></li>
                        <li><a href={`https://www.redfin.com/city/${encodeURIComponent(property.city || '')}/${property.state}/housing-market`} target="_blank" rel="noreferrer" className="hover:underline">Redfin Market Report</a></li>
                        <li><a href={`https://www.zillow.com/home-values/`} target="_blank" rel="noreferrer" className="hover:underline">Zillow Property Value Report</a></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
