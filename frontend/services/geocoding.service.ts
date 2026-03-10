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
        return new Promise((resolve) => {
            try {
                // @ts-ignore - plugin extension
                const geocoder = L.Control.Geocoder.nominatim();
                geocoder.geocode(address, (results: any[]) => {
                    if (results && results.length > 0) {
                        const coords = { lat: results[0].center.lat, lng: results[0].center.lng };
                        setCache(address, coords);
                        console.log('Geocoded fresh address:', address, coords);
                        resolve(coords);
                    } else {
                        console.warn('Nominatim returned no results for:', address);
                        resolve(null);
                    }
                });
            } catch (error) {
                console.error('Geocoding error:', error);
                resolve(null);
            }
        });
    });
};
