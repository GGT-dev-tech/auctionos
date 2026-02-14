import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configuração do ícone do Leaflet (correção para React)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Constante do Token (Vem do .env conforme boas práticas)
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface LocationPickerMapProps {
    initialLatitude?: number;
    initialLongitude?: number;
    initialAddress?: string;
    onLocationSelect: (data: {
        lat: number;
        lng: number;
        address?: string;
        city?: string;
        state?: string;
        zip?: string;
        county?: string;
    }) => void;
}

// Sub-componente para controlar o centro do mapa (FlyTo)
const MapController = ({ lat, lng }: { lat: number, lng: number }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], 17); // Quando tem coordenada exata (busca ou prop), zoom alto
        }
    }, [lat, lng, map]);
    return null;
};

// Sub-componente do Marcador Arrastável
const DraggableMarker = ({ lat, lng, onDragEnd, address }: { lat: number, lng: number, onDragEnd: (lat: number, lng: number) => void, address?: string }) => {
    const markerRef = useRef<L.Marker>(null);
    const eventHandlers = useMemo(() => ({
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                const { lat, lng } = marker.getLatLng();
                onDragEnd(lat, lng);
            }
        },
    }), [onDragEnd]);

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={[lat, lng]}
            ref={markerRef}
        >
            <Popup>
                <b>Local Selecionado</b><br />
                {address || "Endereço desconhecido"}<br />
                <span className="text-xs text-gray-500">Arraste para ajustar</span>
            </Popup>
        </Marker>
    );
};

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
    initialLatitude,
    initialLongitude,
    initialAddress,
    onLocationSelect
}) => {
    // 8. Default Center: US View (Neutral)
    const defaultCenter: [number, number] = [37.0902, -95.7129];
    const defaultZoom = 4;

    const [position, setPosition] = useState<[number, number]>(
        (initialLatitude && initialLongitude) ? [initialLatitude, initialLongitude] : defaultCenter
    );
    const [addressDisplay, setAddressDisplay] = useState(initialAddress || '');
    const [zoom, setZoom] = useState(defaultZoom);

    // Sync props to state (Fly to new location when parent updates)
    useEffect(() => {
        if (initialLatitude && initialLongitude) {
            setPosition([initialLatitude, initialLongitude]);
            if (initialAddress) setAddressDisplay(initialAddress);
            setZoom(17); // Zoom in when looking at a specific property
        }
    }, [initialLatitude, initialLongitude, initialAddress]);

    // 7. Reverter Geocoding (Reverse) ao arrastar
    const handleMarkerDragEnd = async (lat: number, lng: number) => {
        setPosition([lat, lng]);
        setZoom(17);

        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,poi`
            );
            const data = await response.json();

            let feature = null;
            if (data.features && data.features.length > 0) {
                feature = data.features[0];
                setAddressDisplay(feature.place_name);
            }

            triggerUpdate(lat, lng, feature);
        } catch (error) {
            console.error("Erro no reverse geocoding:", error);
            onLocationSelect({ lat, lng });
        }
    };

    // Helper: Notify Parent
    const triggerUpdate = (lat: number, lng: number, feature: any) => {
        const updateData: any = { lat, lng, address: feature?.place_name };

        if (feature && feature.context) {
            feature.context.forEach((ctx: any) => {
                if (ctx.id.startsWith('place')) updateData.city = ctx.text;
                if (ctx.id.startsWith('region')) updateData.state = ctx.text;
                if (ctx.id.startsWith('postcode')) updateData.zip = ctx.text;
                if (ctx.id.startsWith('district')) updateData.county = ctx.text;
            });
        }
        onLocationSelect(updateData);
    };

    return (
        <div className="w-full flex flex-col gap-4">
            {/* 9. Map Structure */}
            <div id="map" style={{ height: '400px', width: '100%', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
                <MapContainer
                    center={position}
                    zoom={zoom}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapController lat={position[0]} lng={position[1]} />

                    <DraggableMarker
                        lat={position[0]}
                        lng={position[1]}
                        onDragEnd={handleMarkerDragEnd}
                        address={addressDisplay}
                    />
                </MapContainer>
            </div>

            {/* Info Footer */}
            {addressDisplay && (
                <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                    <div className="mt-0.5 text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <span className="font-semibold block text-slate-700">Local Selecionado via Pin:</span>
                        {addressDisplay}
                        <div className="font-mono text-[10px] mt-0.5 opacity-70">
                            {position[0].toFixed(6)}, {position[1].toFixed(6)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
