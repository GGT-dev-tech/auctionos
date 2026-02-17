import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { MapService } from '../services/api';
import { Property } from '../types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Layout } from '../components/Layout';
import { PropertyCard } from '../components/PropertyCard';
import { Sidebar, Map, Filter, List, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

import { SearchFilters, FilterState } from '../components/SearchFilters';

// Map Controller to handle bounds changes
const MapController: React.FC<{ onBoundsChange: (bounds: any) => void }> = ({ onBoundsChange }) => {
    const map = useMapEvents({
        moveend: () => {
            const bounds = map.getBounds();
            onBoundsChange({
                north: bounds.getNorth(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                west: bounds.getWest()
            });
        }
    });

    // Initial load
    useEffect(() => {
        const bounds = map.getBounds();
        onBoundsChange({
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
        });
    }, [map, onBoundsChange]);

    return null;
};

const MapIndex: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]); // GeoJSON features?
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<'results' | 'filters'>('results');
    const [bounds, setBounds] = useState<any>(null);
    const [filters, setFilters] = useState<FilterState>({
        status: 'active',
        // Add more filters as needed
    });

    const fetchProperties = useCallback(async (currentBounds: any) => {
        if (!currentBounds) return;
        setLoading(true);
        try {
            const data = await MapService.search(currentBounds, filters);
            // API returns FeatureCollection. Features have properties.
            // We need to map this to our Property type or use as is.
            // Let's assume the API returns GeoJSON and we extract properties.

            // Actually, my backend implementation returns GeoJSON FeatureCollection
            // features: [ { type: "Feature", geometry: ..., properties: { ...property_fields } } ]

            const props = data.features.map((f: any) => ({
                ...f.properties,
                latitude: f.geometry.coordinates[1],
                longitude: f.geometry.coordinates[0],
                id: f.properties.id // Ensure ID structure matches
            }));

            setProperties(props);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Debounce fetch
    useEffect(() => {
        const timer = setTimeout(() => {
            if (bounds) fetchProperties(bounds);
        }, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }, [bounds, fetchProperties]);

    return (
        <Layout>
            <div className="flex h-[calc(100vh-64px)] relative">
                {/* Sidebar */}
                <div
                    className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'w-96 translate-x-0' : 'w-0 -translate-x-full opacity-0 overflow-hidden'}`}
                >
                    {/* Sidebar Header / Tabs */}
                    <div className="flex border-b border-slate-200 dark:border-slate-800">
                        <button
                            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'results' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setActiveTab('results')}
                        >
                            Results ({properties.length})
                        </button>
                        <button
                            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'filters' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setActiveTab('filters')}
                        >
                            Filters
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-w-[384px]">
                        {activeTab === 'results' ? (
                            <>
                                {loading && <div className="flex justify-center p-4"><Loader2 className="animate-spin text-primary" /></div>}
                                {properties.length === 0 && !loading && (
                                    <div className="text-center py-10 text-slate-500">
                                        No properties found in this area. Move the map to search.
                                    </div>
                                )}
                                {properties.map(p => (
                                    <PropertyCard key={p.id} property={p} compact />
                                ))}
                            </>
                        ) : (
                            <SearchFilters
                                filters={filters}
                                onChange={(name, value) => setFilters(prev => ({ ...prev, [name]: value }))}
                                onSearch={() => {
                                    if (bounds) fetchProperties(bounds); // Trigger search manually
                                    setActiveTab('results'); // Switch back to results
                                }}
                                onClear={() => setFilters({})}
                            />
                        )}
                    </div>
                </div>

                {/* Toggle Button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute top-4 left-4 z-[1000] bg-white dark:bg-slate-800 p-2 rounded-md shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                    style={{ left: sidebarOpen ? '24rem' : '1rem' }} // Adjust position
                >
                    {sidebarOpen ? <ChevronLeft size={20} /> : <Filter size={20} />}
                </button>

                {/* Map */}
                <div className="flex-1 h-full z-0 relative">
                    <MapContainer center={[34.74, -92.28]} zoom={7} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapController onBoundsChange={setBounds} />

                        {properties.map(p => (
                            <Marker key={p.id} position={[p.latitude!, p.longitude!]}>
                                <Popup>
                                    <div className="min-w-[200px]">
                                        <h3 className="font-bold">{p.title}</h3>
                                        <p className="text-sm">{p.address}, {p.city}</p>
                                        <div className="mt-2">
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                {p.status}
                                            </span>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </Layout>
    );
};

export default MapIndex;
