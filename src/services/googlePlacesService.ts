import { apiConfig } from './apiConfig';

export interface GooglePlaceResult {
  id: string;
  name: string;
  formattedAddress: string;
  location: { lat: number; lng: number };
  rating?: number;
  userRatingCount?: number;
  types?: string[];
  photoUrl?: string;
  googleMapsUri?: string;
  websiteUri?: string;
  openNow?: boolean;
  priceLevel?: string;
}

const memoryCache = new Map<string, any>();

export const googlePlacesService = {
  // Text Search (New Places API)
  async searchText(query: string, locationBias?: { lat: number; lng: number; radiusMeters?: number }): Promise<GooglePlaceResult[]> {
    const apiKey = apiConfig.getGoogleMapsKey();
    if (!apiKey) return [];

    const cacheKey = `gp_text_${query.toLowerCase()}_${locationBias?.lat || 0}`;
    if (memoryCache.has(cacheKey)) {
      return memoryCache.get(cacheKey);
    }

    try {
      const url = 'https://places.googleapis.com/v1/places:searchText';

      const requestBody: any = {
        textQuery: query,
        maxResultCount: 15,
      };

      if (locationBias) {
        requestBody.locationBias = {
          circle: {
            center: { latitude: locationBias.lat, longitude: locationBias.lng },
            radius: locationBias.radiusMeters || 20000.0,
          },
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.photos,places.types,places.regularOpeningHours,places.websiteUri,places.googleMapsUri,places.priceLevel',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.warn('Google Places API response not ok', response.status, await response.text());
        return [];
      }

      const data = await response.json();
      const rawPlaces = data.places || [];

      const results: GooglePlaceResult[] = rawPlaces.map((p: any) => {
        let photoUrl: string | undefined = undefined;
        if (p.photos && p.photos.length > 0) {
          const photoName = p.photos[0].name;
          photoUrl = `https://places.googleapis.com/v1/${photoName}/media?key=${apiKey}&maxWidthPx=800`;
        }

        return {
          id: p.id,
          name: p.displayName?.text || 'Point of Interest',
          formattedAddress: p.formattedAddress || '',
          location: {
            lat: p.location?.latitude || 0,
            lng: p.location?.longitude || 0,
          },
          rating: p.rating,
          userRatingCount: p.userRatingCount,
          types: p.types,
          photoUrl,
          googleMapsUri: p.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.displayName?.text || query)}`,
          websiteUri: p.websiteUri,
          openNow: p.regularOpeningHours?.openNow,
          priceLevel: p.priceLevel,
        };
      });

      memoryCache.set(cacheKey, results);
      return results;
    } catch (e) {
      console.warn('Google Places searchText error', e);
      return [];
    }
  },

  // Nearby Search (New Places API)
  async searchNearby(
    lat: number,
    lng: number,
    includedTypes: string[] = ['tourist_attraction', 'historical_landmark', 'restaurant'],
    radiusMeters: number = 10000
  ): Promise<GooglePlaceResult[]> {
    const apiKey = apiConfig.getGoogleMapsKey();
    if (!apiKey) return [];

    const cacheKey = `gp_nearby_${lat.toFixed(2)}_${lng.toFixed(2)}_${includedTypes.join('_')}`;
    if (memoryCache.has(cacheKey)) {
      return memoryCache.get(cacheKey);
    }

    try {
      const url = 'https://places.googleapis.com/v1/places:searchNearby';

      const requestBody = {
        includedTypes,
        maxResultCount: 15,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radiusMeters,
          },
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.photos,places.types,places.regularOpeningHours,places.websiteUri,places.googleMapsUri',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) return [];
      const data = await response.json();
      const rawPlaces = data.places || [];

      const results: GooglePlaceResult[] = rawPlaces.map((p: any) => {
        let photoUrl: string | undefined = undefined;
        if (p.photos && p.photos.length > 0) {
          const photoName = p.photos[0].name;
          photoUrl = `https://places.googleapis.com/v1/${photoName}/media?key=${apiKey}&maxWidthPx=800`;
        }

        return {
          id: p.id,
          name: p.displayName?.text || 'Point of Interest',
          formattedAddress: p.formattedAddress || '',
          location: {
            lat: p.location?.latitude || 0,
            lng: p.location?.longitude || 0,
          },
          rating: p.rating,
          userRatingCount: p.userRatingCount,
          types: p.types,
          photoUrl,
          googleMapsUri: p.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.displayName?.text || '')}`,
          websiteUri: p.websiteUri,
          openNow: p.regularOpeningHours?.openNow,
        };
      });

      memoryCache.set(cacheKey, results);
      return results;
    } catch (e) {
      console.warn('Google Places searchNearby error', e);
      return [];
    }
  },
};
