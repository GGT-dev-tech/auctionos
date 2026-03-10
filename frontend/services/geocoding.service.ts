import * as L from 'leaflet';
import 'leaflet-control-geocoder';

// This uses Nominatim via leaflet-control-geocoder to fetch coordinates
export const geocodeAddress = async (address: string): Promise<{ lat: number, lng: number } | null> => {
    return new Promise((resolve) => {
        try {
            // @ts-ignore - plugin extension
            const geocoder = L.Control.Geocoder.nominatim();
            geocoder.geocode(address, (results: any[]) => {
                if (results && results.length > 0) {
                    const { center } = results[0];
                    resolve({ lat: center.lat, lng: center.lng });
                } else {
                    resolve(null);
                }
            });
        } catch (error) {
            console.error('Geocoding error:', error);
            resolve(null);
        }
    });
};
