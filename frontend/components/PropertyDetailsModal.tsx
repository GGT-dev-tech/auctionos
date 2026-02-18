import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Property, PropertyStatus } from '../types';
import { NotesManager } from './NotesManager';
import { API_BASE_URL, AuctionService } from '../services/api';
import { MapContainer, TileLayer, Polygon, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Props {
    property: Property | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: (updated: Property) => void;
}

export const PropertyDetailsModal: React.FC<Props> = ({ property: initialProperty, isOpen, onClose, onUpdate }) => {
    const [property, setProperty] = useState<Property | null>(initialProperty);
    const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'notes' | 'financials'>('overview');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    // Update local state if prop changes
    useEffect(() => {
        setProperty(initialProperty);
    }, [initialProperty]);

    if (!property) return null;

    const handleEnrich = async () => {
        setIsRefreshing(true);
        try {
            const updated = await AuctionService.enrichProperty(property.id);
            setProperty(updated);
            if (onUpdate) onUpdate(updated);
        } catch (error) {
            console.error(error);
            alert("Enrichment failed. Please check Zillow URL or API status.");
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleDownloadReport = async () => {
        setIsGeneratingReport(true);
        try {
            const { report_url } = await AuctionService.getPropertyReport(property.id);
            window.open(`${API_BASE_URL}${report_url}`, '_blank');
        } catch (error) {
            console.error(error);
            alert("Report generation failed.");
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const getStatusBadge = (status: PropertyStatus) => {
        switch (status) {
            case PropertyStatus.Active:
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><span className="size-1.5 rounded-full bg-green-500"></span>Active</span>;
            case PropertyStatus.Pending:
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"><span className="size-1.5 rounded-full bg-yellow-500"></span>Pending</span>;
            case PropertyStatus.Sold:
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"><span className="size-1.5 rounded-full bg-slate-500"></span>Sold</span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">Draft</span>;
        }
    };

    // Parse polygon if string
    const polygonData = React.useMemo(() => {
        if (!property.polygon) return null;
        try {
            return typeof property.polygon === 'string' ? JSON.parse(property.polygon) : property.polygon;
        } catch (e) {
            return null;
        }
    }, [property.polygon]);

    // Parse market values if string
    const marketValues = React.useMemo(() => {
        if (!property.details?.market_values) return null;
        try {
            return typeof property.details.market_values === 'string' ? JSON.parse(property.details.market_values) : property.details.market_values;
        } catch (e) {
            return null;
        }
    }, [property.details?.market_values]);

    // Parse coordinates for Polygon (GeoJSON is usually [lng, lat], Leaflet wants [lat, lng])
    const leafletPolygon = React.useMemo(() => {
        if (!polygonData || !polygonData.coordinates) return null;
        // Assuming GeoJSON Polygon structure: coordinates is array of rings, first ring is outer
        // GeoJSON: [ [ [lng, lat], [lng, lat] ] ]
        try {
            return polygonData.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]);
        } catch (e) {
            return null;
        }
    }, [polygonData]);

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Property Details" size="xl">
                {/* Custom Header matching ParcelFair */}
                <div className="mb-6">
                    <div className="bg-blue-600 dark:bg-blue-800 text-white px-4 py-3 font-semibold text-lg text-center rounded-t-lg">
                        {property.county}, {property.state} : {property.parcel_id}
                    </div>
                    <div className="bg-white dark:bg-slate-900 border-x border-b border-slate-200 dark:border-slate-700 p-6 rounded-b-lg shadow-sm">
                        <div className="text-center mb-6">
                            <h2 className="text-green-600 dark:text-green-400 font-bold text-2xl flex items-center justify-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Tax Lien ({property.tax_sale_year || '2025'})
                            </h2>
                        </div>

                        {/* Action Buttons (Top for mobile, or below header) */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <button
                                onClick={() => setActiveTab('map')}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded shadow-md flex items-center justify-center gap-2 transition"
                            >
                                <span className="material-symbols-outlined">location_on</span> View on Map
                            </button>
                            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded shadow-md flex items-center justify-center gap-2 transition">
                                <span className="material-symbols-outlined">favorite_border</span> Add Favorite
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center">
                            {getStatusBadge(property.status as PropertyStatus)}
                            {property.inventory_type && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-200 uppercase font-bold tracking-wider">{property.inventory_type}</span>}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 bg-slate-50/50 dark:bg-slate-800/50 rounded-t-lg overflow-x-auto">
                    {(['overview', 'financials', 'auction', 'map', 'street_view', 'gallery', 'notes'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors capitalize whitespace-nowrap ${activeTab === tab
                                ? 'border-blue-600 text-blue-600 bg-white dark:bg-slate-900'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            {tab.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* LEFT COLUMN: Property Identifiers & Details */}
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="text-center sm:text-left">
                                        <div className="text-blue-600 dark:text-blue-400 font-bold text-2xl mb-4">
                                            {property.details?.lot_acres ? `${property.details.lot_acres} acres` : 'N/A Acres'}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between sm:justify-start sm:gap-4 text-sm border-b border-slate-100 dark:border-slate-800 py-1">
                                                <span className="text-slate-600 dark:text-slate-400 font-medium">Tax Sale Year:</span>
                                                <span className="font-bold">{property.tax_sale_year || '2025'}</span>
                                            </div>
                                            <div className="flex justify-between sm:justify-start sm:gap-4 text-sm border-b border-slate-100 dark:border-slate-800 py-1">
                                                <span className="text-slate-600 dark:text-slate-400 font-medium">Tax Delinquent:</span>
                                                <span className="font-bold">{property.tax_sale_year ? parseInt(property.tax_sale_year) + 1 : '2026'}</span>
                                            </div>
                                            <div className="flex justify-between sm:justify-start sm:gap-4 text-sm border-b border-slate-100 dark:border-slate-800 py-1">
                                                <span className="text-slate-600 dark:text-slate-400 font-medium">C/S Number:</span>
                                                <span className="font-bold">{property.auction_details?.case_number || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between sm:justify-start sm:gap-4 text-sm border-b border-slate-100 dark:border-slate-800 py-1">
                                                <span className="text-slate-600 dark:text-slate-400 font-medium">Account #:</span>
                                                <span className="font-bold">{property.parcel_id.substring(0, 8)}...</span>
                                            </div>
                                            <div className="flex justify-between sm:justify-start sm:gap-4 text-sm py-1">
                                                <span className="text-slate-600 dark:text-slate-400 font-medium">Owner:</span>
                                                <span className="font-bold truncate max-w-[200px]" title={property.owner_name}>{property.owner_name || 'Unknown'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Banners */}
                                <div className="space-y-4">
                                    <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-md p-4 text-center">
                                        <div className="text-yellow-800 dark:text-yellow-200 font-bold text-lg flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined">home</span> Addresses Unavailable During Trial
                                        </div>
                                        <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 cursor-pointer hover:underline">Click Here to Subscribe Now!</div>
                                    </div>

                                    <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-md p-4 text-center cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/40 transition">
                                        <div className="text-green-800 dark:text-green-200 font-bold text-lg">
                                            1 Tax Lien Available ({property.tax_sale_year || '2025'})
                                        </div>
                                        <div className="text-xs text-green-700 dark:text-green-300 mt-1">click for tax lien details</div>
                                    </div>

                                    <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md p-4 text-center">
                                        <div className="text-blue-800 dark:text-blue-200 font-bold text-lg flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">help</span> Occupant Status Unknown
                                        </div>
                                        <div className="text-xs text-blue-700 dark:text-blue-300 italic mt-1">(last checked on {new Date().toLocaleDateString()})</div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mt-6 text-sm text-slate-700 dark:text-slate-300 space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <p>
                                        <span className="font-bold text-slate-900 dark:text-white">Description:</span><br />
                                        {property.legal_description || 'No legal description available for this property.'}
                                    </p>
                                    <p>
                                        <span className="font-bold text-slate-900 dark:text-white">Address:</span><br />
                                        {property.address}, {property.city}, {property.state} {property.zip_code}
                                    </p>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Financials & Values */}
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-center sm:text-right">
                                    <div className="text-blue-600 dark:text-blue-400 font-bold text-2xl mb-4">
                                        {property.property_type === 'land' ? 'Land Only' : property.property_type || 'Property'}
                                    </div>

                                    <div className="space-y-2 flex flex-col items-center sm:items-end">
                                        <div className="flex justify-between sm:justify-end gap-4 text-sm w-full py-1">
                                            <span className="text-slate-600 dark:text-slate-400 font-medium">Amount Due:</span>
                                            <span className="font-bold text-red-600 dark:text-red-400">
                                                {property.amount_due ? `$${property.amount_due.toLocaleString()}` : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between sm:justify-end gap-4 text-sm w-full py-1">
                                            <span className="text-slate-600 dark:text-slate-400 font-medium">Assessed:</span>
                                            <span className="font-bold">
                                                {property.details?.assessed_value ? `$${property.details.assessed_value.toLocaleString()}` : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between sm:justify-end gap-4 text-sm w-full py-1">
                                            <span className="text-slate-600 dark:text-slate-400 font-medium">Land Value:</span>
                                            <span className="font-bold">
                                                {property.details?.land_value ? `$${property.details.land_value.toLocaleString()}` : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between sm:justify-end gap-4 text-sm w-full py-1">
                                            <span className="text-slate-600 dark:text-slate-400 font-medium">Improvements:</span>
                                            <span className="font-bold">
                                                {property.details?.improvement_value ? `$${property.details.improvement_value.toLocaleString()}` : 'N/A'}
                                            </span>
                                        </div>

                                        <div className="flex justify-between sm:justify-end gap-4 text-sm w-full py-2 mt-2 border-t border-slate-100 dark:border-slate-800 items-center">
                                            <span className="font-bold text-slate-800 dark:text-slate-200">Total Value:</span>
                                            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-3 py-1 rounded font-bold border border-green-200 dark:border-green-700">
                                                {property.details?.total_market_value || property.details?.assessed_value
                                                    ? `$${(property.details?.total_market_value || property.details?.assessed_value).toLocaleString()}`
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Placeholder for Image/Map in Right Column if desired, or keep logic simple */}
                                <div className="bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden h-64 relative border border-slate-300 dark:border-slate-600 flex items-center justify-center">
                                    {/* Using Street View if available, else Generic */}
                                    {property.latitude && property.longitude ? (
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            src={`https://maps.google.com/maps?q=${property.latitude},${property.longitude}&layer=c&z=17&output=svembed`}
                                        ></iframe>
                                    ) : (
                                        <div className="text-center text-slate-500">
                                            <span className="material-symbols-outlined text-4xl mb-2">image_not_supported</span>
                                            <div>No Street View Available</div>
                                        </div>
                                    )}
                                </div>
                                <div className="text-center text-xs text-slate-400">
                                    Google Street View (Preview)
                                </div>
                            </div>

                        </div>
                    )}

                    {activeTab === 'gallery' && (
                        <div>
                            {property.media && property.media.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {property.media.map((media, i) => {
                                        const imageUrl = media.url.startsWith('http') ? media.url : `${API_BASE_URL}${media.url}`;
                                        return (
                                            <div
                                                key={i}
                                                className="aspect-[4/3] rounded-lg bg-cover bg-center cursor-pointer hover:opacity-90 transition-opacity relative group"
                                                style={{ backgroundImage: `url('${imageUrl}')` }}
                                                onClick={() => setSelectedImage(imageUrl)}
                                            >
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-slate-50 rounded-lg text-slate-500 border border-dashed border-slate-300">
                                    <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">image_not_supported</span>
                                    <p>No images available for this property.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <NotesManager propertyId={property.id} />
                    )}

                    {activeTab === 'financials' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-600">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount Due</p>
                                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                        {property.amount_due ? `$${property.amount_due.toLocaleString()}` : '-'}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-2">Opening Bid / Tax Amount</p>
                                </div>
                                <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-600">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Estimated Value</p>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                        {property.details?.estimated_value ? `$${property.details.estimated_value.toLocaleString()}` : '-'}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-2">Zillow / Market Estimate</p>
                                </div>
                                <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-600">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Equity Spread</p>
                                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {property.details?.estimated_value && property.amount_due ?
                                            `$${(property.details.estimated_value - property.amount_due).toLocaleString()}` : '-'}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-2">Potential Margin</p>
                                </div>
                            </div>

                            {/* Assessment & Tax */}
                            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 font-bold text-sm text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                                    Assessment & Tax Details
                                </div>
                                <table className="w-full text-sm">
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        <tr>
                                            <td className="px-4 py-2 text-slate-500 w-1/3">Total Market Value</td>
                                            <td className="px-4 py-2 font-bold">{property.details?.total_market_value ? `$${property.details.total_market_value.toLocaleString()}` : '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 text-slate-500">Assessed Value</td>
                                            <td className="px-4 py-2">{property.details?.assessed_value ? `$${property.details.assessed_value.toLocaleString()}` : '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 text-slate-500">Land Value</td>
                                            <td className="px-4 py-2">{property.details?.land_value ? `$${property.details.land_value.toLocaleString()}` : '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 text-slate-500">Improvement Value</td>
                                            <td className="px-4 py-2">{property.details?.improvement_value ? `$${property.details.improvement_value.toLocaleString()}` : '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 text-slate-500">Tax Year</td>
                                            <td className="px-4 py-2">{property.details?.tax_year || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 text-slate-500">Tax Amount</td>
                                            <td className="px-4 py-2">{property.details?.tax_amount ? `$${property.details.tax_amount.toLocaleString()}` : '-'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Raw Market Data */}
                            {marketValues && (
                                <div className="mt-8">
                                    <h3 className="font-bold text-md mb-3 text-slate-700 dark:text-slate-300">Raw Market Data</h3>
                                    <div className="bg-slate-900 rounded-lg p-4 overflow-auto max-h-64 border border-slate-800">
                                        <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">{JSON.stringify(marketValues, null, 2)}</pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'auction' && (
                        <div className="space-y-6">
                            {/* Countdown Widget */}
                            <div className="bg-slate-900 text-white rounded-xl p-6 text-center shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <span className="material-symbols-outlined text-9xl">gavel</span>
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Auction Starts In</h3>
                                <div className="flex justify-center gap-4">
                                    {(() => {
                                        const auctionDate = property.auction_details?.auction_date || property.next_auction_date;
                                        if (!auctionDate) return <div className="text-2xl">Date TBD</div>;

                                        const now = new Date();
                                        const end = new Date(auctionDate);
                                        const diff = end.getTime() - now.getTime();

                                        if (diff <= 0) return <div className="text-3xl font-bold text-red-400">Auction Ended</div>;

                                        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

                                        return (
                                            <>
                                                <div className="flex flex-col">
                                                    <span className="text-4xl font-black font-mono">{days}</span>
                                                    <span className="text-xs text-slate-500 uppercase">Days</span>
                                                </div>
                                                <div className="text-4xl font-thin text-slate-600">:</div>
                                                <div className="flex flex-col">
                                                    <span className="text-4xl font-black font-mono">{hours}</span>
                                                    <span className="text-xs text-slate-500 uppercase">Hours</span>
                                                </div>
                                                <div className="text-4xl font-thin text-slate-600">:</div>
                                                <div className="flex flex-col">
                                                    <span className="text-4xl font-black font-mono">{minutes}</span>
                                                    <span className="text-xs text-slate-500 uppercase">Mins</span>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                                <div className="mt-4 text-slate-400 text-sm">
                                    {property.auction_details?.auction_date || property.next_auction_date || 'Date Not Set'}
                                </div>
                            </div>

                            {/* Bid Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
                                    <div className="text-sm text-slate-500 mb-1">Current Amount Due</div>
                                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                        {property.amount_due ? `$${property.amount_due.toLocaleString()}` : '-'}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm">
                                        <span className="text-slate-500">Opening Bid</span>
                                        <span className="font-medium">{property.auction_details?.opening_bid ? `$${property.auction_details.opening_bid.toLocaleString()}` : '-'}</span>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
                                    <div className="text-sm text-slate-500 mb-1">Your Max Bid</div>
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="$0.00" className="flex-1 border rounded px-3 py-2 bg-slate-50" disabled />
                                        <button className="bg-blue-600 text-white px-4 py-2 rounded font-bold disabled:opacity-50" disabled>Place Bid</button>
                                    </div>
                                    <div className="mt-4 text-xs text-slate-500 text-center">
                                        Bidding is currently disabled for this demo.
                                    </div>
                                </div>
                            </div>

                            {/* Auction Details */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 font-bold text-sm text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                                    Auction Details
                                </div>
                                <table className="w-full text-sm">
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        <tr>
                                            <td className="px-4 py-2 text-slate-500 w-1/3">Case Number</td>
                                            <td className="px-4 py-2 font-medium">{property.auction_details?.case_number || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 text-slate-500">Certificate #</td>
                                            <td className="px-4 py-2">{property.auction_details?.certificate_number || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 text-slate-500">Auction Type</td>
                                            <td className="px-4 py-2 capitalize">{property.auction_details?.auction_type?.replace('_', ' ') || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 text-slate-500">Status</td>
                                            <td className="px-4 py-2">{property.auction_details?.status_detail || '-'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'map' && (
                        <div className="h-[500px] rounded-lg overflow-hidden border border-slate-200 shadow-sm relative z-0">
                            {property.latitude && property.longitude ? (
                                <MapContainer center={[property.latitude, property.longitude]} zoom={18} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={[property.latitude, property.longitude]} />
                                    {leafletPolygon && <Polygon positions={leafletPolygon} color="blue" />}
                                </MapContainer>
                            ) : (
                                <div className="h-full bg-slate-100 flex items-center justify-center text-slate-400">No Map Data Available</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'street_view' && (
                        <div className="h-[500px] rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-black">
                            {property.latitude && property.longitude ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    allowFullScreen
                                    src={`https://maps.google.com/maps?q=${property.latitude},${property.longitude}&layer=c&z=17&output=svembed`}
                                ></iframe>
                            ) : (
                                <div className="h-full bg-slate-100 flex items-center justify-center text-slate-400">No Street View Data Available</div>
                            )}
                        </div>
                    )}
                </div>
            </Modal>

            {selectedImage && (
                <div
                    className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setSelectedImage(null)}
                >
                    <img
                        src={selectedImage}
                        alt="Full Preview"
                        className="max-h-[90vh] max-w-full rounded shadow-2xl"
                    />
                    <button
                        className="absolute top-4 right-4 text-white/70 hover:text-white"
                        onClick={() => setSelectedImage(null)}
                    >
                        <span className="material-symbols-outlined text-4xl">close</span>
                    </button>
                </div>
            )}
        </>
    );
};
