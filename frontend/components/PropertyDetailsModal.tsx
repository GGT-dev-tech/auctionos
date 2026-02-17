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
                {/* Header Info */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                                {property.address}
                            </h2>
                            <div className="text-sm text-slate-500 dark:text-slate-400 flex flex-wrap gap-4">
                                <span>{property.city}, {property.state} {property.zip_code}</span>
                                <span className="text-slate-300">|</span>
                                <span className="font-mono">PID: {property.parcel_id}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {getStatusBadge(property.status as PropertyStatus)}
                            <button
                                onClick={handleEnrich}
                                disabled={isRefreshing}
                                className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                title="Refresh Data"
                            >
                                <span className={`material-symbols-outlined text-[20px] ${isRefreshing ? 'animate-spin' : ''}`}>sync</span>
                            </button>
                            <button
                                onClick={handleDownloadReport}
                                className="p-1.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                title="Download Report"
                            >
                                <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                            </button>
                        </div>
                    </div>

                    {/* Tags Bar */}
                    <div className="flex flex-wrap gap-2 mt-3">
                        {property.inventory_type && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-200 uppercase font-bold tracking-wider">{property.inventory_type}</span>}
                        {property.items && (property.items as any[]).map((tag: string) => (
                            <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{tag}</span>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 bg-slate-50/50 dark:bg-slate-800/50 rounded-t-lg">
                    {(['overview', 'gallery', 'notes', 'financials'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors capitalize ${activeTab === tab
                                ? 'border-blue-600 text-blue-600 bg-white dark:bg-slate-900'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                            {/* LEFT COLUMN */}
                            <div className="space-y-6">

                                {/* Snapshot / Map */}
                                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                                    <div className="h-48 relative">
                                        {property.latitude && property.longitude ? (
                                            <MapContainer center={[property.latitude, property.longitude]} zoom={17} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false}>
                                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                <Marker position={[property.latitude, property.longitude]} />
                                                {leafletPolygon && <Polygon positions={leafletPolygon} color="blue" />}
                                            </MapContainer>
                                        ) : (
                                            <div className="h-full bg-slate-100 flex items-center justify-center text-slate-400">No Map Data</div>
                                        )}
                                        <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold shadow-sm">
                                            {property.details?.lot_acres || '?'} Acres
                                        </div>
                                    </div>
                                    <div className="p-3 grid grid-cols-3 gap-2 text-center text-sm border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                        <div>
                                            <div className="text-slate-500 text-xs uppercase">Est. Value</div>
                                            <div className="font-bold text-blue-600">{property.details?.estimated_value ? `$${property.details.estimated_value.toLocaleString()}` : '-'}</div>
                                        </div>
                                        <div className="border-x border-slate-200 dark:border-slate-700">
                                            <div className="text-slate-500 text-xs uppercase">Opening Bid</div>
                                            <div className="font-bold text-emerald-600">{property.price ? `$${property.price.toLocaleString()}` : '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-slate-500 text-xs uppercase">Max Bid (70%)</div>
                                            <div className="font-bold text-orange-600">{property.details?.max_bid ? `$${property.details.max_bid.toLocaleString()}` : '-'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Property Information */}
                                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 font-bold text-sm text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                                        Property Information
                                    </div>
                                    <table className="w-full text-sm">
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            <tr>
                                                <td className="px-4 py-2 text-slate-500 w-1/3">Owner Name</td>
                                                <td className="px-4 py-2 font-medium">{property.owner_name || '-'}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 text-slate-500">Owner Address</td>
                                                <td className="px-4 py-2">{property.owner_info || '-'}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 text-slate-500">Parcel ID</td>
                                                <td className="px-4 py-2 font-mono select-all">{property.parcel_id}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 text-slate-500">Legal Desc</td>
                                                <td className="px-4 py-2 text-xs text-slate-600 line-clamp-3" title={property.legal_description}>{property.legal_description || '-'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Structure Details */}
                                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 font-bold text-sm text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                                        Structure Information
                                    </div>
                                    <div className="grid grid-cols-2 text-sm">
                                        <div className="p-3 border-b border-r border-slate-100">
                                            <div className="text-slate-500 text-xs">Living Area</div>
                                            <div className="font-bold">{property.details?.sqft ? `${property.details.sqft.toLocaleString()} sqft` : '-'}</div>
                                        </div>
                                        <div className="p-3 border-b border-slate-100">
                                            <div className="text-slate-500 text-xs">Year Built</div>
                                            <div className="font-bold">{property.details?.year_built || '-'}</div>
                                        </div>
                                        <div className="p-3 border-r border-slate-100">
                                            <div className="text-slate-500 text-xs">Bedrooms</div>
                                            <div className="font-bold">{property.details?.bedrooms || '-'}</div>
                                        </div>
                                        <div className="p-3">
                                            <div className="text-slate-500 text-xs">Bathrooms</div>
                                            <div className="font-bold">{property.details?.bathrooms || '-'}</div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* RIGHT COLUMN */}
                            <div className="space-y-6">

                                {/* Assessment & Tax */}
                                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 font-bold text-sm text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                                        Assessment & Tax
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

                                {/* Land & Location */}
                                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 font-bold text-sm text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                                        Land & Location
                                    </div>
                                    <table className="w-full text-sm">
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            <tr>
                                                <td className="px-4 py-2 text-slate-500 w-1/3">Lot Acres</td>
                                                <td className="px-4 py-2 font-medium">{property.details?.lot_acres || '-'}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 text-slate-500">Use Code</td>
                                                <td className="px-4 py-2">{property.details?.use_code || '-'} ({property.details?.use_description || 'N/A'})</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 text-slate-500">Zoning</td>
                                                <td className="px-4 py-2">{property.details?.zoning || '-'}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 text-slate-500">Flood Zone</td>
                                                <td className="px-4 py-2 flex items-center gap-2">
                                                    {property.details?.flood_zone_code || '-'}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* External Links */}
                                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 font-bold text-sm text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                                        External Resources
                                    </div>
                                    <div className="p-4 grid grid-cols-2 gap-3">
                                        {property.details?.zillow_url && (
                                            <a href={property.details.zillow_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline text-sm"><span className="material-symbols-outlined text-[16px]">open_in_new</span> Zillow</a>
                                        )}
                                        {property.details?.regrid_url && (
                                            <a href={property.details.regrid_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline text-sm"><span className="material-symbols-outlined text-[16px]">map</span> Regrid</a>
                                        )}
                                        {property.details?.fema_url && (
                                            <a href={property.details.fema_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline text-sm"><span className="material-symbols-outlined text-[16px]">water_drop</span> FEMA Map</a>
                                        )}
                                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address || '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline text-sm"><span className="material-symbols-outlined text-[16px]">pin_drop</span> Google Maps</a>
                                    </div>
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
