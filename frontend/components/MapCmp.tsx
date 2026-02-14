import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Property } from '../types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapCmpProps {
    properties: Property[];
}

const MapController: React.FC<{ properties: Property[] }> = ({ properties }) => {
    const map = useMap();

    useEffect(() => {
        if (properties.length > 0) {
            // Find valid coords
            const validProps = properties.filter(p => p.latitude && p.longitude);
            if (validProps.length === 1) {
                // Single property (Wizard mode)
                const p = validProps[0];
                map.setView([p.latitude!, p.longitude!], 15);
            } else if (validProps.length > 1) {
                // Multiple properties (Dashboard mode) - Fit bounds
                const bounds = L.latLngBounds(validProps.map(p => [p.latitude!, p.longitude!]));
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [properties, map]);

    return null;
};

export const MapCmp: React.FC<MapCmpProps> = ({ properties }) => {
    // Default center (Denver, CO as fallback)
    const defaultPosition: [number, number] = [39.7392, -104.9903];

    return (
        <MapContainer center={defaultPosition} zoom={10} style={{ height: '100%', width: '100%', minHeight: '300px' }}>
            <TileLayer
                attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
                url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`}
            />
            <MapController properties={properties} />
            {properties.map(prop => {
                if (prop.latitude && prop.longitude) {
                    return (
                        <Marker key={prop.id} position={[prop.latitude, prop.longitude]}>
                            <Popup>
                                <b>{prop.title || prop.address}</b><br />
                                {prop.address}<br />
                                {prop.city}, {prop.state}<br />
                                {prop.smart_tag && <span className="text-xs bg-slate-100 text-slate-600 px-1 rounded">{prop.smart_tag}</span>}
                            </Popup>
                        </Marker>
                    );
                }
                return null;
            })}
        </MapContainer>
    );
};
