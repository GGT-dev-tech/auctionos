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
                <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {property.title}
                            </h2>
                            <button
                                onClick={handleEnrich}
                                disabled={isRefreshing || !property.details?.zillow_url}
                                className={`p-1.5 rounded-lg border transition-all ${isRefreshing
                                    ? 'bg-slate-100 text-slate-400 border-slate-200'
                                    : 'bg-white hover:bg-slate-50 text-blue-600 border-slate-200 hover:border-blue-200 shadow-sm'
                                    }`}
                                title="Auto-Enrich from Zillow"
                            >
                                <span className={`material-symbols-outlined text-[20px] ${isRefreshing ? 'animate-spin' : ''}`}>
                                    {isRefreshing ? 'sync' : 'auto_fix'}
                                </span>
                            </button>
                            <button
                                onClick={async () => {
                                    setIsRefreshing(true);
                                    try {
                                        const res = await AuctionService.validateGSI(property.id);
                                        // Update property data if needed, or just show success
                                        alert(`GSI Status: ${res.gsi_status}`);
                                        // Refresh property
                                        const updated = await AuctionService.getProperty(property.id);
                                        setProperty(updated);
                                    } catch (e) {
                                        alert("GSI Validation failed.");
                                    } finally {
                                        setIsRefreshing(false);
                                    }
                                }}
                                disabled={isRefreshing}
                                className="p-1.5 rounded-lg border bg-white hover:bg-slate-50 text-emerald-600 border-slate-200 hover:border-emerald-200 shadow-sm transition-all"
                                title="Validate GSI Parcel"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    verified_user
                                </span>
                            </button>
                            <button
                                onClick={handleDownloadReport}
                                disabled={isGeneratingReport}
                                className="p-1.5 rounded-lg border bg-white hover:bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 shadow-sm transition-all"
                                title="Download PDF Report"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {isGeneratingReport ? 'hourglass_bottom' : 'picture_as_pdf'}
                                </span>
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <span className="material-symbols-outlined text-[18px]">location_on</span>
                            {property.address}, {property.city}, {property.state} {property.zip_code}
                        </div>
                        {/* Additional Header Badges */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {property.inventory_type && (
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-200">
                                    {property.inventory_type}
                                </span>
                            )}
                            {property.tax_status && (
                                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                                    {property.tax_status}
                                </span>
                            )}
                            {property.next_auction_date && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">calendar_month</span>
                                    {new Date(property.next_auction_date).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(property.status as PropertyStatus)}
                        {property.smart_tag && (
                            <span className="font-mono text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">
                                {property.smart_tag}
                            </span>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
                    {(['overview', 'gallery', 'notes', 'financials'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab
                                ? 'border-primary text-primary-dark'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="min-h-[300px]">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                {/* Key Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase font-semibold">Price / Value</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                                            {property.price ? `$${property.price.toLocaleString()}` : (property.marketValue ? `$${property.marketValue.toLocaleString()}` : '-')}
                                        </p>
                                        {property.amount_due && (
                                            <p className="text-xs text-red-500 font-medium">Due: ${property.amount_due.toLocaleString()}</p>
                                        )}
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase font-semibold">Max Bid (70% Est)</p>
                                        <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                            {property.details?.max_bid ? `$${property.details.max_bid.toLocaleString()}` : '-'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs text-slate-500 uppercase font-semibold">Parcel ID</p>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(property.parcel_id || '');
                                                }}
                                                className="text-[14px] material-symbols-outlined text-slate-400 hover:text-primary transition-colors"
                                                title="Copy Parcel ID"
                                            >
                                                content_copy
                                            </button>
                                        </div>
                                        <p className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300 truncate" title={property.parcel_id || ''}>
                                            {property.parcel_id || '-'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs text-slate-500 uppercase font-semibold">Zillow Est. Value</p>
                                            {property.details?.gsi_data && (
                                                <span className="material-symbols-outlined text-emerald-500 text-[18px]" title="GSI Validated">verified</span>
                                            )}
                                        </div>
                                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                            {property.details?.estimated_value ? `$${property.details.estimated_value.toLocaleString()}` : '-'}
                                        </p>
                                    </div>
                                </div>

                                {/* Legal & Risk */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase font-semibold">Flood Zone</p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                            {property.details?.flood_zone_code || '-'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase font-semibold">Market Analysis</p>
                                        {property.details?.market_value_url ? (
                                            <a
                                                href={property.details.market_value_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
                                            >
                                                View Link <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                            </a>
                                        ) : (
                                            <p className="text-sm font-medium text-slate-400">-</p>
                                        )}
                                    </div>
                                </div>

                                {/* Description & Legal */}
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Description</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                                            {property.description || "No description available."}
                                        </p>
                                    </div>
                                    {property.legal_description && (
                                        <div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Legal Description</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-mono bg-slate-50 p-2 rounded border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                                                {property.legal_description}
                                            </p>
                                        </div>
                                    )}
                                    {property.owner_info && (
                                        <div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Owner Info</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {property.owner_info}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Map Section */}
                            <div className="h-[400px] md:h-full bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden relative border border-slate-200 dark:border-slate-700">
                                {property.latitude && property.longitude ? (
                                    <MapContainer
                                        center={[property.latitude, property.longitude]}
                                        zoom={16}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <Marker position={[property.latitude, property.longitude]}>
                                            <Popup>{property.address}</Popup>
                                        </Marker>
                                        {leafletPolygon && (
                                            <Polygon positions={leafletPolygon} color="blue" />
                                        )}
                                    </MapContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-slate-400 flex-col gap-2">
                                        <span className="material-symbols-outlined text-4xl">map</span>
                                        <span className="text-sm">No coordinates available</span>
                                    </div>
                                )}
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
                                                className="aspect-[4/3] rounded-lg bg-cover bg-center cursor-pointer hover:opacity-90 transition-opacity"
                                                style={{ backgroundImage: `url('${imageUrl}')` }}
                                                onClick={() => setSelectedImage(imageUrl)}
                                            ></div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    <span className="material-symbols-outlined text-4xl mb-2">image_not_supported</span>
                                    <p>No images available for this property.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <NotesManager propertyId={property.id} />
                    )}

                    {activeTab === 'financials' && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-600">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Calculated Max Bid</p>
                                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                        {property.details?.max_bid ? `$${property.details.max_bid.toLocaleString()}` : '-'}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-2">Based on 70% of Market Value</p>
                                </div>
                                <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-600">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount Due</p>
                                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                        {property.amount_due ? `$${property.amount_due.toLocaleString()}` : '-'}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-2">Total Tax/Lien Amount</p>
                                </div>
                                <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-600">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Equity Spread</p>
                                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {property.details?.estimated_value && property.price ?
                                            `$${(property.details.estimated_value - property.price).toLocaleString()}` : '-'}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-2">Market Vol - Opening Bid</p>
                                </div>
                            </div>

                            {marketValues && (
                                <div>
                                    <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[20px]">equalizer</span>
                                        Market Value Data
                                    </h3>
                                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden p-4">
                                        <pre className="text-xs text-slate-600 dark:text-slate-300 overflow-auto whitespace-pre-wrap font-mono">
                                            {JSON.stringify(marketValues, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                                    Linked Expenses
                                </h3>
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    {property.price ? (
                                        <div className="p-4 flex items-center justify-between border-b last:border-0 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <div className="flex flex-col">
                                                <span className="font-semibold dark:text-white">Initial Opening Bid</span>
                                                <span className="text-xs text-slate-400 uppercase">Acquisition</span>
                                            </div>
                                            <span className="font-bold dark:text-white">${property.price.toLocaleString()}</span>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-slate-500 italic">No acquisition cost recorded.</div>
                                    )}
                                </div>
                            </div>
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
