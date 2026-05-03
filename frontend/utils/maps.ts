/**
 * Utility to generate Google Maps related URLs
 */

export const getStreetViewUrl = (address?: string, city?: string, state?: string, zip?: string) => {
    const KEY = import.meta.env.VITE_GOOGLE_STREET_VIEW_KEY;
    
    if (!KEY) {
        return null;
    }

    // Comprehensive location builder
    // Some addresses come with newlines or extra spaces, clean them up
    const cleanAddress = address?.replace(/\n/g, ', ').trim();
    const fullLocation = [cleanAddress, city, state, zip]
        .map(s => s?.toString().trim())
        .filter(s => s && s.length > 0)
        .join(', ');

    // If the location string is too short, it's likely invalid or incomplete
    if (!fullLocation || fullLocation.length < 5) {
        return null;
    }

    const locationParam = encodeURIComponent(fullLocation);
    
    // Zillow style: Focus on the house (pitch, fov)
    // size: 600x400 is a standard aspect ratio for previews
    return `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${locationParam}&key=${KEY}&fov=90&pitch=10`;
};

export const getGoogleMapsLink = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
};
