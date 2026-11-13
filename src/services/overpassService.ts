export interface OSMPlace {
  id: string;
  name: string;
  category: 'must-visit' | 'nature' | 'hidden-gems' | 'history' | 'photography' | 'restaurant';
  typeTag: string;
  coordinates: { lat: number; lng: number };
  address?: string;
  osmUrl: string;
}

const memoryCache = new Map<string, any>();
let lastRequestTime = 0;

export const overpassService = {
  // Geocode destination name using OpenStreetMap Nominatim
  async geocode(destination: string): Promise<{ lat: number; lng: number; displayName: string; bbox?: number[] } | null> {
    const cacheKey = `osm_geo_${destination.toLowerCase()}`;
    if (memoryCache.has(cacheKey)) {
      return memoryCache.get(cacheKey);
    }

    try {
      // Throttle Nominatim requests (1 request per second policy)
      const now = Date.now();
      if (now - lastRequestTime < 1000) {
        await new Promise((r) => setTimeout(r, 1000 - (now - lastRequestTime)));
      }
      lastRequestTime = Date.now();

      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        destination
      )}&format=json&limit=1&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'WayoraTravelConcierge/1.0',
        },
      });

      if (!response.ok) return null;
      const data = await response.json();
      if (!data || data.length === 0) return null;

      const first = data[0];
      const result = {
        lat: parseFloat(first.lat),
        lng: parseFloat(first.lon),
        displayName: first.display_name,
        bbox: first.boundingbox ? first.boundingbox.map((b: string) => parseFloat(b)) : undefined,
      };

      memoryCache.set(cacheKey, result);
      return result;
    } catch (e) {
      console.warn('Nominatim geocode error for', destination, e);
      return null;
    }
  },

  // Query tourist attractions, natural sights, and viewpoints using Overpass API
  async getPointsOfInterest(lat: number, lng: number, radiusMeters: number = 15000): Promise<OSMPlace[]> {
    const cacheKey = `osm_pois_${lat.toFixed(2)}_${lng.toFixed(2)}_${radiusMeters}`;
    if (memoryCache.has(cacheKey)) {
      return memoryCache.get(cacheKey);
    }

    try {
      // Overpass query for tourism, historic, natural and viewpoint nodes/ways
      const query = `
        [out:json][timeout:15];
        (
          node["tourism"~"attraction|viewpoint|museum"](around:${radiusMeters},${lat},${lng});
          node["historic"](around:${radiusMeters},${lat},${lng});
          node["natural"~"waterfall|peak"](around:${radiusMeters},${lat},${lng});
          way["tourism"~"attraction|viewpoint|museum"](around:${radiusMeters},${lat},${lng});
        );
        out center 25;
      `;

      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
      });

      if (!res.ok) return [];
      const data = await res.json();
      const elements = data.elements || [];

      const places: OSMPlace[] = [];
      for (const el of elements) {
        const tags = el.tags || {};
        const name = tags.name || tags['name:en'];
        if (!name) continue;

        const pLat = el.lat || el.center?.lat;
        const pLng = el.lon || el.center?.lon;
        if (!pLat || !pLng) continue;

        let category: OSMPlace['category'] = 'must-visit';
        let typeTag = tags.tourism || tags.historic || tags.natural || 'attraction';

        if (tags.natural === 'waterfall' || tags.natural === 'peak') {
          category = 'nature';
        } else if (tags.tourism === 'viewpoint') {
          category = 'photography';
        } else if (tags.historic || tags.tourism === 'museum') {
          category = 'history';
        } else if (tags.tourism === 'attraction') {
          category = 'must-visit';
        } else {
          category = 'hidden-gems';
        }

        places.push({
          id: `osm_${el.id}`,
          name,
          category,
          typeTag,
          coordinates: { lat: pLat, lng: pLng },
          address: tags['addr:street'] ? `${tags['addr:street']}, ${tags['addr:city'] || ''}` : undefined,
          osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
        });
      }

      memoryCache.set(cacheKey, places);
      return places;
    } catch (e) {
      console.warn('Overpass API error', e);
      return [];
    }
  },

  // Query nearby restaurants using Overpass
  async getNearbyRestaurants(lat: number, lng: number, radiusMeters: number = 8000): Promise<OSMPlace[]> {
    const cacheKey = `osm_rest_${lat.toFixed(2)}_${lng.toFixed(2)}`;
    if (memoryCache.has(cacheKey)) {
      return memoryCache.get(cacheKey);
    }

    try {
      const query = `
        [out:json][timeout:12];
        (
          node["amenity"~"restaurant|cafe"](around:${radiusMeters},${lat},${lng});
        );
        out center 15;
      `;

      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
      });

      if (!res.ok) return [];
      const data = await res.json();
      const elements = data.elements || [];

      const restaurants: OSMPlace[] = [];
      for (const el of elements) {
        const tags = el.tags || {};
        const name = tags.name || tags['name:en'];
        if (!name) continue;

        const pLat = el.lat || el.center?.lat;
        const pLng = el.lon || el.center?.lon;
        if (!pLat || !pLng) continue;

        restaurants.push({
          id: `osm_food_${el.id}`,
          name,
          category: 'restaurant',
          typeTag: tags.cuisine || tags.amenity || 'Local Dining',
          coordinates: { lat: pLat, lng: pLng },
          address: tags['addr:street'] || undefined,
          osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
        });
      }

      memoryCache.set(cacheKey, restaurants);
      return restaurants;
    } catch (e) {
      console.warn('Overpass restaurant query error', e);
      return [];
    }
  },

  // Query nearby hotels, hostels, and guest houses using Overpass API
  async getNearbyAccommodations(lat: number, lng: number, radiusMeters: number = 12000): Promise<{
    id: string;
    name: string;
    type: 'hotel' | 'hostel' | 'guesthouse' | 'resort' | 'stay';
    typeTag: string;
    coordinates: { lat: number; lng: number };
    address?: string;
    website?: string;
    phone?: string;
    osmUrl: string;
  }[]> {
    const cacheKey = `osm_accom_${lat.toFixed(2)}_${lng.toFixed(2)}_${radiusMeters}`;
    if (memoryCache.has(cacheKey)) {
      return memoryCache.get(cacheKey);
    }

    try {
      const query = `
        [out:json][timeout:12];
        (
          node["tourism"~"hotel|guest_house|hostel|camp_site|motel|chalet"](around:${radiusMeters},${lat},${lng});
          way["tourism"~"hotel|guest_house|hostel|camp_site|motel|chalet"](around:${radiusMeters},${lat},${lng});
        );
        out center 15;
      `;

      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
      });

      if (!res.ok) return [];
      const data = await res.json();
      const elements = data.elements || [];

      const stays: any[] = [];
      const seenNames = new Set<string>();

      for (const el of elements) {
        const tags = el.tags || {};
        const name = tags.name || tags['name:en'];
        if (!name) continue;
        if (seenNames.has(name.toLowerCase())) continue;
        seenNames.add(name.toLowerCase());

        const pLat = el.lat || el.center?.lat;
        const pLng = el.lon || el.center?.lon;
        if (!pLat || !pLng) continue;

        let type: 'hotel' | 'hostel' | 'guesthouse' | 'resort' | 'stay' = 'hotel';
        if (tags.tourism === 'hostel') type = 'hostel';
        else if (tags.tourism === 'guest_house') type = 'guesthouse';
        else if (tags.tourism === 'camp_site') type = 'stay';
        else if (name.toLowerCase().includes('resort')) type = 'resort';

        stays.push({
          id: `osm_stay_${el.id}`,
          name,
          type,
          typeTag: tags.tourism || 'accommodation',
          coordinates: { lat: pLat, lng: pLng },
          address: tags['addr:street'] ? `${tags['addr:street']}, ${tags['addr:city'] || ''}` : undefined,
          website: tags.website || tags['contact:website'],
          phone: tags.phone || tags['contact:phone'],
          osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
        });
      }

      memoryCache.set(cacheKey, stays);
      return stays;
    } catch (e) {
      console.warn('Overpass accommodation query error', e);
      return [];
    }
  },

  // Query nearest airports and railway stations using Overpass API
  async getTransitHubs(lat: number, lng: number, radiusMeters: number = 50000): Promise<{
    airports: string[];
    railways: string[];
  }> {
    const cacheKey = `osm_transit_${lat.toFixed(2)}_${lng.toFixed(2)}`;
    if (memoryCache.has(cacheKey)) {
      return memoryCache.get(cacheKey);
    }

    try {
      const query = `
        [out:json][timeout:10];
        (
          node["aeroway"="aerodrome"](around:${radiusMeters},${lat},${lng});
          node["railway"="station"]["station"!="subway"](around:25000,${lat},${lng});
        );
        out 8;
      `;

      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
      });

      if (!res.ok) return { airports: [], railways: [] };
      const data = await res.json();
      const elements = data.elements || [];

      const airports: string[] = [];
      const railways: string[] = [];

      for (const el of elements) {
        const tags = el.tags || {};
        const name = tags.name || tags['name:en'];
        if (!name) continue;

        if (tags.aeroway === 'aerodrome' && !airports.includes(name)) {
          airports.push(name);
        } else if (tags.railway === 'station' && !railways.includes(name)) {
          railways.push(name);
        }
      }

      const result = { airports: airports.slice(0, 3), railways: railways.slice(0, 3) };
      memoryCache.set(cacheKey, result);
      return result;
    } catch (e) {
      return { airports: [], railways: [] };
    }
  },
};
