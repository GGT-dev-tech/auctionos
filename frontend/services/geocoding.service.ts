import * as L from 'leaflet';
import 'leaflet-control-geocoder';

const CACHE_KEY = 'auctionos_geocoding_cache';
const DELAY_MS = 1200; // Nominatim compliance (1 request per second)

// Load cache from localStorage
const getCache = (): Record<string, { lat: number, lng: number }> => {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        return cached ? JSON.parse(cached) : {};
    } catch {
        return {};
    }
};

// Save cache to localStorage
const setCache = (address: string, coords: { lat: number, lng: number }) => {
    try {
        const cache = getCache();
        cache[address] = coords;
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
        console.error('Failed to save to geocoding cache', e);
    }
};

// Global queue to prevent hitting rate limits when multiple components request at once
class GeocodingQueue {
    private queue: Array<() => Promise<void>> = [];
    private isProcessing = false;

    async add<T>(task: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await task();
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            });
            this.process();
        });
    }

    private async process() {
        if (this.isProcessing || this.queue.length === 0) return;
        this.isProcessing = true;

        while (this.queue.length > 0) {
            const task = this.queue.shift();
            if (task) {
                await task();
                if (this.queue.length > 0) {
                    await new Promise(r => setTimeout(r, DELAY_MS));
                }
            }
        }
        this.isProcessing = false;
    }
}

const geocoderQueue = new GeocodingQueue();

/**
 * Geocodes an address. Uses LocalStorage cache first.
 * If not cached, it queues the network request to comply with Nominatim rate limits.
 */
export const geocodeAddress = async (address: string): Promise<{ lat: number, lng: number } | null> => {
    if (!address) return null;

    // 1. Check persistent cache
    const cache = getCache();
    if (cache[address]) {
        return cache[address];
    }

    // 2. Add to throttling queue
    return geocoderQueue.add(async () => {
        try {
            console.log('Geocoding fresh address via fetch:', address);
            const encodedAddr = encodeURIComponent(address);
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddr}&limit=1`;

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'AuctionOS-App/1.0'
                }
            });

            if (!response.ok) {
                console.error('Nominatim API error:', response.status, response.statusText);
                return null;
            }

            const data = await response.json();
            if (data && data.length > 0) {
                const coords = {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
                setCache(address, coords);
                console.log('Geocoded successfully:', address, coords);
                return coords;
            } else {
                console.warn('Nominatim returned no results for:', address);
                return null;
            }
        } catch (error) {
            console.error('Geocoding exception:', error);
            return null;
        }
    });
};
