import React, { useRef, useEffect, useState } from 'react';
import mapboxgl, { Map as MapboxMap } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { API_BASE_URL } from '../services/api';

// Access token from environment variable
// Note: In Vite, env vars must start with VITE_
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

mapboxgl.accessToken = MAPBOX_TOKEN;

interface PropertyMapProps {
    parcelId: string | null;
    className?: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ parcelId, className }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<MapboxMap | null>(null);
    const [geojson, setGeojson] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize Map
    useEffect(() => {
        if (!mapContainer.current) return;
        if (map.current) return; // Initialize only once

        if (!MAPBOX_TOKEN) {
            setError("Mapbox Token missing");
            return;
        }

        try {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/satellite-v9', // Satellite view
                center: [-98.5795, 39.8283], // Center of USA roughly
                zoom: 3,
            });

            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        } catch (e) {
            console.error("Error initializing map:", e);
            setError("Failed to load map");
        }

        // Cleanup
        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // Fetch GeoJSON when parcelId changes
    useEffect(() => {
        if (!parcelId) return;

        const fetchGeoJSON = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/api/v1/gis/${parcelId}/geojson`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure auth if needed
                    }
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        console.warn("GeoJSON not found for parcel");
                        setGeojson(null);
                        return;
                    }
                    throw new Error("Failed to fetch GIS data");
                }

                const data = await response.json();
                setGeojson(data.geojson);
            } catch (err) {
                console.error(err);
                // Don't show error to user vigorously if just missing data, maybe just log
                // setError("Could not load property boundaries"); 
            } finally {
                setLoading(false);
            }
        };

        fetchGeoJSON();
    }, [parcelId]);

    // Update map layer when GeoJSON data is available
    useEffect(() => {
        if (!map.current || !geojson) return;

        const updateMapLayer = () => {
            const mapInstance = map.current!;

            if (!mapInstance.isStyleLoaded()) {
                mapInstance.once('style.load', updateMapLayer);
                return;
            }

            // Remove existing layers/sources
            if (mapInstance.getSource('property')) {
                if (mapInstance.getLayer('property-outline')) mapInstance.removeLayer('property-outline');
                if (mapInstance.getLayer('property-fill')) mapInstance.removeLayer('property-fill');
                mapInstance.removeSource('property');
            }

            try {
                // Add source
                mapInstance.addSource('property', {
                    type: 'geojson',
                    data: geojson
                });

                // Add fill layer
                mapInstance.addLayer({
                    id: 'property-fill',
                    type: 'fill',
                    source: 'property',
                    paint: {
                        'fill-color': '#0080ff', // Blue-ish
                        'fill-opacity': 0.4
                    }
                });

                // Add outline layer
                mapInstance.addLayer({
                    id: 'property-outline',
                    type: 'line',
                    source: 'property',
                    paint: {
                        'line-color': '#ffffff',
                        'line-width': 2
                    }
                });

                // Fit bounds
                const coordinates = geojson.geometry.coordinates;
                // Handle Polygon (depth 3) vs MultiPolygon (depth 4)
                // Simple implementation for Polygon
                if (geojson.geometry.type === 'Polygon') {
                    const bounds = new mapboxgl.LngLatBounds();
                    coordinates[0].forEach((coord: [number, number]) => {
                        bounds.extend(coord);
                    });
                    mapInstance.fitBounds(bounds, { padding: 50 });
                } else if (geojson.geometry.type === 'MultiPolygon') {
                    // For MultiPolygon, coordinates is array of Polygons
                    const bounds = new mapboxgl.LngLatBounds();
                    coordinates.forEach((polygon: any) => {
                        polygon[0].forEach((coord: [number, number]) => {
                            bounds.extend(coord);
                        });
                    });
                    mapInstance.fitBounds(bounds, { padding: 50 });
                }

            } catch (e) {
                console.error("Error adding map layers:", e);
            }
        };

        updateMapLayer();

    }, [geojson]);

    return (
        <div className={`relative w-full h-full rounded-xl overflow-hidden ${className}`}>
            <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 z-10">
                    <p className="text-red-500 bg-white px-3 py-1 rounded shadow text-sm font-medium">{error}</p>
                </div>
            )}

            {(!loading && !geojson && !error && parcelId) && (
                <div className="absolute top-4 left-4 z-10">
                    <span className="bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur">Boundary data not available</span>
                </div>
            )}
        </div>
    );
};

export default PropertyMap;
