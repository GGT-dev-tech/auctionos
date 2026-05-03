/**
 * Utility to generate Google Street View Static API URLs.
 * Requires VITE_GOOGLE_STREET_VIEW_KEY to be set in .env
 */

export const getStreetViewUrl = (property: any): string | null => {
    const key = import.meta.env.VITE_GOOGLE_STREET_VIEW_KEY;
    if (!key) {
        console.warn("Google Street View API Key missing (VITE_GOOGLE_STREET_VIEW_KEY)");
        return null;
    }

    const address = property.address || "";
    const city = property.city || "";
    const state = property.state || property.state_code || "";
    const zip = property.zip_code || "";

    // If no address at all, return null
    if (!address && !city) return null;

    const fullLocation = [address, city, state, zip]
        .map(s => s?.toString().trim())
        .filter(s => s && s.length > 0)
        .join(', ')
        .replace(/, ,/g, ',') // Clean up redundant commas
        .trim();
    
    const baseUrl = "https://maps.googleapis.com/maps/api/streetview";
    const params = new URLSearchParams({
        size: "600x400",
        location: fullLocation,
        key: key,
        fov: "90",
        pitch: "10"
    });

    return `${baseUrl}?${params.toString()}`;
};
