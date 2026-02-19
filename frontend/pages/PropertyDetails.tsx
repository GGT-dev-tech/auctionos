import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminService } from '../services/api';
import { ChevronLeft, ExternalLink, History, MapPin, Building, DollarSign } from 'lucide-react';

const PropertyDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [property, setProperty] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

    useEffect(() => {
        const fetchProperty = async () => {
            if (!id) return;
            try {
                const data = await AdminService.getProperty(id);
                setProperty(data);
            } catch (error) {
                console.error('Failed to fetch property details', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProperty();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading details...</div>;
    if (!property) return <div className="p-8 text-center text-red-500">Property not found.</div>;

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-6">
            <button
                onClick={() => navigate('/inventory')}
                className="flex items-center text-slate-500 hover:text-slate-700 mb-4 transition-colors"
            >
                <ChevronLeft size={20} />
                <span>Back to Inventory</span>
            </button>

            {/* Header */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{property.parcel_address || 'Unknown Address'}</h1>
                        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm">
                            <span className="flex items-center gap-1"><MapPin size={16} /> {property.city}, {property.state} {property.zip_code}</span>
                            <span className="flex items-center gap-1"><Building size={16} /> {property.county} County</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-slate-500 dark:text-slate-400">Total Market Value</div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {property.total_market_value ? `$${Number(property.total_market_value).toLocaleString()}` : 'N/A'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab('details')}
                    className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'details'
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                        }`}
                >
                    Details & Research
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'history'
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                        }`}
                >
                    Auction History
                </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'details' && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">Property Information</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="block text-slate-500">Parcel ID</span> {property.parcel_id}</div>
                                <div><span className="block text-slate-500">Tax Sale Year</span> {property.tax_sale_year || '-'}</div>
                                <div><span className="block text-slate-500">Acres</span> {property.lot_acres || property.acres || '-'}</div>
                                <div><span className="block text-slate-500">Occupancy</span> {property.occupancy || (property.vacancy ? 'Vacant' : 'Occupied') || '-'}</div>
                                <div><span className="block text-slate-500">Zoning</span> {property.zoning || '-'}</div>
                                <div><span className="block text-slate-500">Land Value</span> {property.land_value ? `$${Number(property.land_value).toLocaleString()}` : '-'}</div>
                                <div><span className="block text-slate-500">Improvement Value</span> {property.improvement_value ? `$${Number(property.improvement_value).toLocaleString()}` : '-'}</div>
                                <div><span className="block text-slate-500">Amount Due</span> {property.amount_due ? `$${Number(property.amount_due).toLocaleString()}` : '-'}</div>
                            </div>

                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 pt-4">Legal & Description</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{property.legal_description || property.description || 'No description available.'}</p>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <History size={20} /> Auction History
                            </h3>
                            {property.history && property.history.length > 0 ? (
                                <div className="space-y-4">
                                    {property.history.map((record: any, idx: number) => (
                                        <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-white">{record.auction_name || 'Unknown Auction'}</div>
                                                <div className="text-sm text-slate-500">{new Date(record.auction_date).toLocaleDateString()}</div>
                                            </div>
                                            <div className="text-right mt-2 sm:mt-0">
                                                <div className="text-sm font-medium text-red-600">{record.taxes_due ? `Due: $${Number(record.taxes_due).toLocaleString()}` : ''}</div>
                                                <div className="flex gap-2 mt-1 text-xs">
                                                    {record.info_link && <a href={record.info_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Info</a>}
                                                    {record.list_link && <a href={record.list_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">List</a>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-slate-500 py-8">No auction history found.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar - Research Links */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Research Links</h3>
                        <div className="space-y-3">
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address || property.parcel_address || '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                            >
                                <span className="flex items-center gap-2"><MapPin size={16} /> Google Maps</span>
                                <ExternalLink size={14} />
                            </a>
                            <a
                                href={`https://www.zillow.com/homes/${encodeURIComponent(property.address || property.parcel_address || '')}_rb/`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                            >
                                <span className="flex items-center gap-2"><Building size={16} /> Zillow</span>
                                <ExternalLink size={14} />
                            </a>
                            {property.map_link && (
                                <a
                                    href={property.map_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                                >
                                    <span className="flex items-center gap-2"><MapPin size={16} /> GIS Map</span>
                                    <ExternalLink size={14} />
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Actions</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate(`/properties/${property.parcel_id}/edit`)}
                                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Edit Property
                            </button>
                            <button
                                onClick={() => alert('Validation feature coming soon')}
                                className="w-full py-2 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Run GSI Validation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetails;
