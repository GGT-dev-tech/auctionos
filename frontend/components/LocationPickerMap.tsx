import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corrigir ícones padrão do Leaflet no React
// Isso é necessário porque o webpack/vite às vezes perde a referência das imagens
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerMapProps {
    latitude?: number;
    longitude?: number;
    onLocationSelect: (lat: number, lng: number) => void;
}

// Componente para controlar o centro do mapa (FlyTo)
const MapController = ({ lat, lng }: { lat?: number, lng?: number }) => {
    const map = useMap();

    useEffect(() => {
        if (lat && lng) {
            // Requisito: Zoom ideal 16 ou 17 quando houver endereço
            map.flyTo([lat, lng], 17);
        }
    }, [lat, lng, map]);

    return null;
};

// Componente do Marcador Arrastável
const DraggableMarker = ({ lat, lng, onDragEnd }: { lat: number, lng: number, onDragEnd: (lat: number, lng: number) => void }) => {
    const markerRef = useRef<L.Marker>(null);

    const eventHandlers = useMemo(() => ({
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                const { lat, lng } = marker.getLatLng();
                // Requisito: Atualizar latitude/longitude ao soltar
                onDragEnd(lat, lng);
            }
        },
    }), [onDragEnd]);

    return (
        <Marker
            draggable={true} // Requisito: Marcador deve ser arrastável
            eventHandlers={eventHandlers}
            position={[lat, lng]}
            ref={markerRef}
        >
            <Popup>
                {/* Requisito: Popup mostrando instrução ou endereço */}
                <b>Propriedade Selecionada</b><br />
                Arraste para ajustar a posição.
            </Popup>
        </Marker>
    );
};

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({ latitude, longitude, onLocationSelect }) => {
    // Requisito: Localização padrão se vazio (ex: Miami, já que é o contexto do app)
    const defaultCenter: [number, number] = [25.7617, -80.1918];
    const defaultZoom = 12;

    const hasLocation = !!(latitude && longitude);

    return (
        <div id="map" style={{ height: '100%', width: '100%', minHeight: '400px' }}>
            <MapContainer
                center={hasLocation ? [latitude!, longitude!] : defaultCenter}
                zoom={hasLocation ? 17 : defaultZoom}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`}
                />

                <MapController lat={latitude} lng={longitude} />

                {hasLocation && (
                    <DraggableMarker
                        lat={latitude!}
                        lng={longitude!}
                        onDragEnd={onLocationSelect}
                    />
                )}
            </MapContainer>
        </div>
    );
};
