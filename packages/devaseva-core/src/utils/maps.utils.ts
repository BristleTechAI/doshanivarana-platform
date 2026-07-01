/**
 * Shared utility for generating Google Maps Directions URLs.
 * 
 * TODO Phase 2:
 * Replace manual coordinate entry with Google Places Autocomplete.
 * Firestore schema remains unchanged.
 */

export function buildGoogleMapsDirectionsUrl(latitude: number | string, longitude: number | string): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

export function buildGoogleMapsSearchUrl(latitude: number | string, longitude: number | string): string {
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}
