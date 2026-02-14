import React, { useState } from 'react';
import { Modal } from './Modal';
import { Property, PropertyStatus } from '../types';
import { NotesManager } from './NotesManager';
import { API_BASE_URL } from '../services/api';

interface Props {
    property: Property | null;
    isOpen: boolean;
    onClose: () => void;
}

export const PropertyDetailsModal: React.FC<Props> = ({ property, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'notes'>('overview');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (!property) return null;

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

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Property Details" size="xl">
                {/* Header Info */}
                <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                            {property.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <span className="material-symbols-outlined text-[18px]">location_on</span>
                            {property.address}, {property.city}, {property.state} {property.zip_code}
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
                    {(['overview', 'gallery', 'notes'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
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
                                        <p className="text-xs text-slate-500 uppercase font-semibold">Price</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                                            {property.price ? `$${property.price.toLocaleString()}` : '-'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase font-semibold">Assessed Value</p>
                                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                            {property.details?.assessed_value ? `$${property.details.assessed_value.toLocaleString()}` : '-'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase font-semibold">Parcel ID</p>
                                        <p className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300 truncate" title={property.parcel_id || ''}>
                                            {property.parcel_id || '-'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase font-semibold">Est. Value</p>
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

                                {/* Description */}
                                <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Description</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                                        {property.description || "No description available."}
                                    </p>
                                </div>
                            </div>

                            {/* Map Placeholder or Mini Map */}
                            <div className="h-64 md:h-full bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden relative">
                                {property.latitude && property.longitude ? (
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        scrolling="no"
                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${property.longitude - 0.01}%2C${property.latitude - 0.01}%2C${property.longitude + 0.01}%2C${property.latitude + 0.01}&layer=mapnik&marker=${property.latitude}%2C${property.longitude}`}
                                        style={{ border: 0 }}
                                    ></iframe>
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
                </div>
            </Modal>

            {/* Image Preview Modal */}
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
