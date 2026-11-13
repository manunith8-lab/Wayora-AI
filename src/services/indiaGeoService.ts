// India Geographical Search & Gazetteer Service
// Provides fuzzy matching, entity identification, thematic queries, and
// live fallback geocoding across all 28 states, 8 union territories, and towns in India.

import { 
  ALL_INDIAN_STATES_AND_UTS, 
  THEMATIC_INDIAN_DESTINATIONS, 
  IndianStateOrUT, 
  ThematicDestination 
} from '../data/indiaGazetteer';

export interface IndiaSearchResult {
  type: 'state_ut' | 'sub_destination' | 'thematic_list' | 'live_geocode';
  name: string;
  state?: string;
  district?: string;
  tagline?: string;
  coordinates?: { lat: number; lng: number };
  stateData?: IndianStateOrUT;
  thematicItems?: ThematicDestination[];
  summary?: string;
  famousFor?: string[];
  subDestinations?: {
    id: string;
    name: string;
    tagline: string;
    highlights: string[];
    heroPhoto?: string;
  }[];
}

const geoMemoryCache = new Map<string, any>();

export const indiaGeoService = {
  /**
   * Search across the comprehensive India gazetteer and thematic indexes
   */
  searchIndia(query: string): IndiaSearchResult | null {
    if (!query) return null;
    const clean = query.trim().toLowerCase();

    // ==========================================
    // 1. THEMATIC CATEGORY QUERIES ACROSS INDIA
    // ==========================================
    if (clean.includes('waterfall') || clean.includes('waterfalls')) {
      const items = THEMATIC_INDIAN_DESTINATIONS.filter(d => d.category === 'waterfall');
      return {
        type: 'thematic_list',
        name: 'Iconic Waterfalls Across India',
        summary: 'India is blessed with spectacular cascade and plunge waterfalls across the Western Ghats, Eastern Ghats, and the North-East.',
        thematicItems: items,
        famousFor: items.map(i => i.name),
      };
    }

    if (clean.includes('beach') || clean.includes('beaches')) {
      const items = THEMATIC_INDIAN_DESTINATIONS.filter(d => d.category === 'beach');
      return {
        type: 'thematic_list',
        name: 'Breathtaking Beaches Across India',
        summary: 'Along its 7,500+ km coastline and tropical islands, India features serene Blue Flag sands, dramatic sea cliffs, and tranquil coves.',
        thematicItems: items,
        famousFor: items.map(i => i.name),
      };
    }

    if (clean.includes('hill station') || clean.includes('hill stations') || clean.includes('mountains in india')) {
      // Gather hill stations from states
      const hillStations: any[] = [];
      ALL_INDIAN_STATES_AND_UTS.forEach(s => {
        s.subDestinations.filter(sub => sub.type === 'hill_station').forEach(sub => {
          hillStations.push({
            id: sub.id,
            name: `${sub.name} (${s.name})`,
            category: 'hill_station',
            state: s.name,
            district: sub.district,
            description: sub.tagline,
            highlights: sub.famousFor,
            coordinates: sub.coordinates,
            nearestTransit: s.howToReach.airports[0] || s.howToReach.railheads[0] || 'State Highway',
            bestSeason: s.bestTimeToVisit,
          });
        });
      });

      return {
        type: 'thematic_list',
        name: 'Premier Hill Stations Across India',
        summary: 'From the snow-clad Himalayas of Kashmir and Himachal to the misty Nilgiris and Western Ghats of South India.',
        thematicItems: hillStations,
        famousFor: hillStations.map(h => h.name),
      };
    }

    if (clean.includes('fort') || clean.includes('forts') || clean.includes('palace') || clean.includes('palaces') || clean.includes('monument')) {
      const items = THEMATIC_INDIAN_DESTINATIONS.filter(d => d.category === 'fort_palace');
      return {
        type: 'thematic_list',
        name: 'Historic Forts & Palaces Across India',
        summary: 'Towering hill forts of Rajasthan, Maratha warrior citadels, and magnificent royal palaces echoing centuries of royal heritage.',
        thematicItems: items,
        famousFor: items.map(i => i.name),
      };
    }

    if (clean.includes('wildlife') || clean.includes('national park') || clean.includes('safari') || clean.includes('tiger')) {
      const items = THEMATIC_INDIAN_DESTINATIONS.filter(d => d.category === 'wildlife_park');
      return {
        type: 'thematic_list',
        name: 'Premier Wildlife Sanctuaries & National Parks in India',
        summary: 'Home to the Royal Bengal Tiger, the Great Indian One-Horned Rhinoceros, Asiatic Lions, and wild elephant corridors.',
        thematicItems: items,
        famousFor: items.map(i => i.name),
      };
    }

    if (clean.includes('temple') || clean.includes('spiritual') || clean.includes('pilgrimage') || clean.includes('jyotirlinga')) {
      const items = THEMATIC_INDIAN_DESTINATIONS.filter(d => d.category === 'spiritual_temple');
      return {
        type: 'thematic_list',
        name: 'Sacred Spiritual & Temple Destinations Across India',
        summary: 'Millennia of devotion, world-renowned Dravidian gopurams, sacred ghats of Varanasi, and Himalayan Char Dham pilgrimage shrines.',
        thematicItems: items,
        famousFor: items.map(i => i.name),
      };
    }

    // ==========================================
    // 2. STATE OR UNION TERRITORY EXACT / FUZZY MATCH
    // ==========================================
    for (const state of ALL_INDIAN_STATES_AND_UTS) {
      const stateNameLower = state.name.toLowerCase();
      const stateIdLower = state.id.replace(/_/g, ' ');

      if (
        clean === stateNameLower ||
        clean === stateIdLower ||
        clean.includes(stateNameLower) ||
        clean.includes(stateIdLower)
      ) {
        return {
          type: 'state_ut',
          name: state.name,
          state: state.name,
          tagline: state.tagline,
          stateData: state,
          summary: state.introduction,
          famousFor: state.subDestinations.map(s => s.name),
          subDestinations: state.subDestinations.map(s => ({
            id: s.id,
            name: s.name,
            tagline: s.tagline,
            highlights: s.famousFor,
          })),
        };
      }
    }

    // ==========================================
    // 3. SUB-DESTINATION / TOWN / CITY MATCH
    // ==========================================
    for (const state of ALL_INDIAN_STATES_AND_UTS) {
      for (const sub of state.subDestinations) {
        const subNameLower = sub.name.toLowerCase();
        if (
          clean === subNameLower ||
          clean === sub.id ||
          clean.includes(subNameLower) ||
          subNameLower.includes(clean)
        ) {
          return {
            type: 'sub_destination',
            name: sub.name,
            state: state.name,
            district: sub.district,
            tagline: sub.tagline,
            coordinates: sub.coordinates,
            famousFor: sub.famousFor,
            summary: `${sub.name} is a premier ${sub.type.replace('_', ' ')} located in the ${sub.district} district of ${state.name}. ${sub.tagline}.`,
          };
        }
      }
    }

    // ==========================================
    // 4. THEMATIC SINGLE DESTINATION MATCH (e.g. "Jog Falls", "Radhanagar Beach")
    // ==========================================
    for (const item of THEMATIC_INDIAN_DESTINATIONS) {
      const itemNameLower = item.name.toLowerCase();
      if (clean === itemNameLower || clean.includes(itemNameLower) || itemNameLower.includes(clean)) {
        return {
          type: 'sub_destination',
          name: item.name,
          state: item.state,
          district: item.district,
          tagline: item.description,
          coordinates: item.coordinates,
          famousFor: item.highlights,
          summary: `${item.name} is a world-renowned ${item.category.replace('_', ' ')} in ${item.district}, ${item.state}. ${item.description}`,
        };
      }
    }

    return null;
  },

  /**
   * Geocode ANY village, town, or remote location in India using Nominatim with country code filter
   */
  async geocodeIndiaLocation(query: string): Promise<{
    name: string;
    displayName: string;
    state?: string;
    district?: string;
    coordinates: { lat: number; lng: number };
  } | null> {
    const clean = query.trim();
    const cacheKey = `in_geo_${clean.toLowerCase()}`;
    if (geoMemoryCache.has(cacheKey)) {
      return geoMemoryCache.get(cacheKey);
    }

    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        clean + ', India'
      )}&format=json&limit=1&addressdetails=1&countrycodes=in`;

      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'WayoraIndiaTravelAssistant/2.0',
        },
      });

      if (!response.ok) return null;
      const data = await response.json();
      if (!data || data.length === 0) return null;

      const first = data[0];
      const addr = first.address || {};
      const result = {
        name: addr.city || addr.town || addr.village || addr.suburb || clean,
        displayName: first.display_name,
        state: addr.state,
        district: addr.state_district || addr.county,
        coordinates: {
          lat: parseFloat(first.lat),
          lng: parseFloat(first.lon),
        },
      };

      geoMemoryCache.set(cacheKey, result);
      return result;
    } catch (e) {
      console.warn('India Nominatim geocoding error', e);
      return null;
    }
  },
};
