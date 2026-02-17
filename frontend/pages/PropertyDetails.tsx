import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { InventoryService, AuctionService } from '../services/api';
import { Property } from '../types';
import { HunterMap } from '../components/HunterMap';

export const PropertyDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (id) {
            loadProperty(id);
        }
    }, [id]);

    const loadProperty = async (propId: string) => {
        try {
            // Adjust API call if needed, currently reusing getProperty from Wizard context or creating new service method
            // Assuming we have a getProperty in API
            const data = await AuctionService.getProperty(propId);
            setProperty(data);
        } catch (e) {
            console.error("Failed to load property", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading Property Details...</div>;
    if (!property) return <div className="p-8 text-center text-red-500">Property Not Found</div>;

    return (
        <div className="bg-slate-50 min-h-screen pb-10">
            {/* Header / Breadcrumb */}
            <div className="bg-white border-b border-slate-200 py-3 px-4 shadow-sm sticky top-0 z-20">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Link to="/map" className="hover:text-blue-600">Map Search</Link>
                        <span>/</span>
                        <Link to="/parcel" className="hover:text-blue-600">Results</Link>
                        <span>/</span>
                        <span className="font-semibold text-slate-800">Details</span>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn btn-sm btn-outline gap-2">
                            <span className="material-symbols-outlined text-sm">favorite</span> Save
                        </button>
                        <button className="btn btn-sm btn-primary gap-2">
                            <span className="material-symbols-outlined text-sm">print</span> Report
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto mt-6 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Details & Map */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Title & Headline */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">{property.owner_name}</h1>
                                <div className="text-lg text-slate-600 mt-1">{property.address || 'No Address'}, {property.city}, {property.state} {property.zip_code}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-green-600">${property.amount_due?.toLocaleString() || '0.00'}</div>
                                <div className="text-xs uppercase font-bold text-slate-500">Total Amount Due</div>
                            </div>
                        </div>

                        {/* Key Attributes Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
                            <div className="p-3 bg-slate-50 rounded">
                                <div className="text-xs text-slate-500 font-bold uppercase">Parcel Number</div>
                                <div className="font-mono font-bold text-slate-800">{property.parcel_number}</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded">
                                <div className="text-xs text-slate-500 font-bold uppercase">Tax Sale Year</div>
                                <div className="font-bold text-slate-800">{property.tax_sale_year || 'N/A'}</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded">
                                <div className="text-xs text-slate-500 font-bold uppercase">Total Value</div>
                                <div className="font-bold text-slate-800">${property.total_value?.toLocaleString()}</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded">
                                <div className="text-xs text-slate-500 font-bold uppercase">Acreage</div>
                                <div className="font-bold text-slate-800">{property.acreage || 'N/A'}</div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="mt-8 border-b border-slate-200">
                            <div className="flex gap-6">
                                {['Overview', 'Valuation'].map(tab => (
                                    <button
                                        key={tab}
                                        className={`pb-3 px-1 font-bold text-sm border-b-2 transition-colors ${activeTab === tab.toLowerCase() ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                                        onClick={() => setActiveTab(tab.toLowerCase())}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="mt-6">
                            <h3 className="font-bold text-lg mb-4 text-slate-800">Property Description</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">
                                {property.legal_description || 'No legal description available for this property.'}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-6 text-sm">
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-500">Parcel Type</span>
                                    <span className="font-medium">{property.parcel_type}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-500">Land Value</span>
                                    <span className="font-medium">${property.land_value?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-500">Improvement Value</span>
                                    <span className="font-medium">${property.improvement_value?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-500">Opportunity Zone</span>
                                    <span className="font-medium">{property.opportunity_zone || 'No'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Validated Map */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden h-96">
                        <div className="bg-slate-100 p-2 text-xs font-bold text-center border-b border-slate-200 text-slate-500">PROPERTY LOCATION</div>
                        {/* Placeholder for Map Component - pass coordinates */}
                        <div className="h-full w-full bg-slate-200 flex items-center justify-center text-slate-400">
                            {property.coordinates ? (
                                <HunterMap
                                    center={{ lat: parseFloat(property.coordinates.split(',')[0]), lng: parseFloat(property.coordinates.split(',')[1]) }}
                                    zoom={16}
                                    markers={[{ position: { lat: parseFloat(property.coordinates.split(',')[0]), lng: parseFloat(property.coordinates.split(',')[1]) } }]}
                                />
                            ) : (
                                <span>No Coordinates Available</span>
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Column: Actions & Tools */}
                <div className="flex flex-col gap-6">

                    {/* Status Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <div className="text-center mb-6">
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase tracking-wide">
                                {property.status || 'Active'}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <button className="w-full btn btn-primary py-3 font-bold shadow-md bg-gradient-to-r from-blue-600 to-blue-700 border-none text-white">
                                Purchase Options
                            </button>
                            <button className="w-full btn btn-outline border-slate-300 hover:bg-slate-50 text-slate-700">
                                Add to List
                            </button>
                            <button className="w-full btn btn-outline border-slate-300 hover:bg-slate-50 text-slate-700">
                                Contact County
                            </button>
                        </div>
                    </div>

                    {/* Research Links */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Research Tools</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#" className="flex items-center gap-2 text-blue-600 hover:underline">
                                    <span className="material-symbols-outlined text-base">description</span>
                                    View County Records
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center gap-2 text-blue-600 hover:underline">
                                    <span className="material-symbols-outlined text-base">map</span>
                                    GIS Map
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center gap-2 text-blue-600 hover:underline">
                                    <span className="material-symbols-outlined text-base">gavel</span>
                                    Zillow Estimates
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

            </div>
        </div>
    );
};
