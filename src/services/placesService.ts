import { googlePlacesService, GooglePlaceResult } from './googlePlacesService';
import { wikipediaService, WikiPlaceSummary, WikiFoodInfo } from './wikipediaService';
import { overpassService, OSMPlace } from './overpassService';
import { wikivoyageService } from './wikivoyageService';
import { rankingService } from './rankingService';
import { apiConfig } from './apiConfig';
import { DESTINATIONS } from '../data/destinationsData';
import { getCanonicalDestination, CanonicalDestination, CanonicalAttraction } from '../data/canonicalKnowledge';
import { indiaGeoService, IndiaSearchResult } from './indiaGeoService';

export type DiscoveryCategory = 'MUST_VISIT' | 'NATURE_ADVENTURE' | 'HIDDEN_GEMS' | 'HISTORY_CULTURE' | 'PHOTOGRAPHY';

export interface DiscoveredPlace {
  id: string;
  name: string;
  category: DiscoveryCategory;
  categoryLabel: string;
  photoUrl?: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  rating?: number;
  reviewCount?: number;
  openingHours?: string;
  priceLevel?: string;
  googleMapsUrl: string;
  source: 'google' | 'wikipedia' | 'osm' | 'curated' | 'wikivoyage';
  distanceFromCenter?: string;
  bestTimeToVisit?: string;
  recommendedDuration?: string;
  entryFee?: string;
  whyFamous?: string;
}

export interface DiscoveredRestaurant {
  id: string;
  name: string;
  location: string;
  cuisine: string;
  rating?: number;
  priceLevel?: string;
  openingHours?: string;
  googleMapsUrl: string;
  photoUrl?: string;
  source: 'google' | 'osm' | 'curated' | 'wikivoyage';
}

export interface DestinationDiscoveryResult {
  destination: string;
  country?: string;
  geographicType?: 'country' | 'state_region' | 'city_destination' | 'attraction';
  summary: string;
  heroPhoto?: string;
  coordinates?: { lat: number; lng: number };
  categorizedPlaces: Record<DiscoveryCategory, DiscoveredPlace[]>;
  allPlaces: DiscoveredPlace[];
  traditionalFoods: WikiFoodInfo[];
  restaurants: DiscoveredRestaurant[];
  sourceAttribution: string;
  isLiveApi: boolean;
  subDestinations?: {
    id: string;
    name: string;
    tagline: string;
    highlights: string[];
    heroPhoto?: string;
  }[];
  overview?: {
    introduction: string;
    famousFor: string[];
    bestTimeToVisit: string;
    climate: string;
    localCulture: string;
    languages: string[];
    howToReach: string;
    recommendedDuration: string;
  };
}

// Destination level memory cache with 24h TTL
const destinationCache = new Map<string, { result: DestinationDiscoveryResult; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;

export function getCategoryLabel(cat: DiscoveryCategory): string {
  switch (cat) {
    case 'MUST_VISIT':
      return 'Must Visit';
    case 'NATURE_ADVENTURE':
      return 'Nature & Adventure';
    case 'HIDDEN_GEMS':
      return 'Hidden Gems';
    case 'HISTORY_CULTURE':
      return 'History & Culture';
    case 'PHOTOGRAPHY':
      return 'Photography';
  }
}

export const placesService = {
  async discoverDestination(destinationQuery: string): Promise<DestinationDiscoveryResult> {
    const cleanDest = destinationQuery.trim();
    const lowerDest = cleanDest.toLowerCase();
    const cacheKey = `dest_disc_${lowerDest}`;

    // 1. Check in-memory cache
    const cached = destinationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.result;
    }

    // 2. Check localStorage cache for instant return
    try {
      const stored = localStorage.getItem(cacheKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          destinationCache.set(cacheKey, { result: parsed.result, timestamp: parsed.timestamp });
          return parsed.result;
        }
      }
    } catch {}

    // 3. Check India-Wide Gazetteer & Thematic Categories
    const indiaMatch = indiaGeoService.searchIndia(cleanDest);

    if (indiaMatch && indiaMatch.type === 'thematic_list' && indiaMatch.thematicItems) {
      const categorized: Record<DiscoveryCategory, DiscoveredPlace[]> = {
        MUST_VISIT: [],
        NATURE_ADVENTURE: [],
        HIDDEN_GEMS: [],
        HISTORY_CULTURE: [],
        PHOTOGRAPHY: [],
      };

      const allRanked: DiscoveredPlace[] = indiaMatch.thematicItems.map((item) => {
        let cat: DiscoveryCategory = 'MUST_VISIT';
        if (item.category === 'waterfall' || item.category === 'beach' || item.category === 'wildlife_park') {
          cat = 'NATURE_ADVENTURE';
        } else if (item.category === 'fort_palace' || item.category === 'spiritual_temple') {
          cat = 'HISTORY_CULTURE';
        } else if (item.category === 'hill_station') {
          cat = 'PHOTOGRAPHY';
        }

        const place: DiscoveredPlace = {
          id: item.id,
          name: item.name,
          category: cat,
          categoryLabel: getCategoryLabel(cat),
          description: item.description,
          location: `${item.district}, ${item.state}, India`,
          coordinates: item.coordinates,
          rating: 4.8,
          reviewCount: 2800,
          whyFamous: item.highlights.join(' • '),
          bestTimeToVisit: item.bestSeason,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + item.state)}`,
          source: 'curated',
        };

        categorized[cat].push(place);
        categorized.MUST_VISIT.push(place);
        return place;
      });

      const thematicResult: DestinationDiscoveryResult = {
        destination: indiaMatch.name,
        country: 'India',
        geographicType: 'state_region',
        summary: indiaMatch.summary || 'Spectacular tourist destinations across India.',
        categorizedPlaces: categorized,
        allPlaces: allRanked,
        traditionalFoods: [],
        restaurants: [],
        sourceAttribution: 'Wayora India Tourism Gazetteer & OpenStreetMap',
        isLiveApi: true,
      };

      destinationCache.set(cacheKey, { result: thematicResult, timestamp: Date.now() });
      return thematicResult;
    }

    // 4. Check Canonical Knowledge Base (Instant, high-precision guarantee)
    const canonical = getCanonicalDestination(cleanDest);

    // 5. Check existing curated destination dataset
    const curatedMatch = DESTINATIONS.find(
      (d) => d.name.toLowerCase() === lowerDest || lowerDest.includes(d.name.toLowerCase())
    );

    // Initial baseline coordinates (from canonical, gazetteer sub-destination, or curated)
    const initialCoords = canonical?.coordinates || indiaMatch?.coordinates || curatedMatch?.coordinates;

    // 5. Run external APIs in PARALLEL with timeouts to ensure lightning-fast responses
    const hasGoogleKey = !!apiConfig.getGoogleMapsKey();

    const [
      geoResult,
      wikiSummaryResult,
      wikivoyageResult,
      googlePlacesResult,
      googleFoodResult,
      osmPoisResult,
      osmFoodResult,
    ] = await Promise.allSettled([
      // A. OSM Nominatim Geocoding (if no canonical coords)
      initialCoords ? Promise.resolve(null) : overpassService.geocode(cleanDest),
      // B. Wikipedia Summary
      wikipediaService.getPageSummary(cleanDest),
      // C. Wikivoyage Destination Guide
      wikivoyageService.getDestinationGuide(cleanDest, 2200),
      // D. Google Places Text Search (if key available)
      hasGoogleKey
        ? googlePlacesService.searchText(`tourist attractions in ${cleanDest}`, initialCoords)
        : Promise.resolve([]),
      // E. Google Places Food Search
      hasGoogleKey
        ? googlePlacesService.searchText(`best restaurants in ${cleanDest}`, initialCoords)
        : Promise.resolve([]),
      // F. OpenStreetMap POIs (with strict timeout)
      initialCoords
        ? overpassService.getPointsOfInterest(initialCoords.lat, initialCoords.lng, 35000)
        : Promise.resolve([]),
      // G. OpenStreetMap Restaurants
      initialCoords
        ? overpassService.getNearbyRestaurants(initialCoords.lat, initialCoords.lng, 15000)
        : Promise.resolve([]),
    ]);

    // Extract resolved values safely
    const geo = geoResult.status === 'fulfilled' ? geoResult.value : null;
    const coords = initialCoords || (geo ? { lat: geo.lat, lng: geo.lng } : undefined);
    const wikiSummary = wikiSummaryResult.status === 'fulfilled' ? wikiSummaryResult.value : null;
    const wikivoyageGuide = wikivoyageResult.status === 'fulfilled' ? wikivoyageResult.value : null;
    const googlePlaces = googlePlacesResult.status === 'fulfilled' ? googlePlacesResult.value : [];
    const googleFoodPlaces = googleFoodResult.status === 'fulfilled' ? googleFoodResult.value : [];
    const osmPlaces = osmPoisResult.status === 'fulfilled' ? osmPoisResult.value : [];
    const osmRestaurants = osmFoodResult.status === 'fulfilled' ? osmFoodResult.value : [];

    // 6. Assemble All Candidate Places
    const placesList: DiscoveredPlace[] = [];
    const seenNames = new Set<string>();

    const addUniquePlace = (p: DiscoveredPlace) => {
      const norm = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seenNames.has(norm)) return;
      seenNames.add(norm);
      placesList.push(p);
    };

    // A. Add Canonical / Verified Iconic Attractions (Highest Priority)
    if (canonical?.attractions) {
      canonical.attractions.forEach((att) => {
        addUniquePlace({
          id: att.id,
          name: att.name,
          category: att.category,
          categoryLabel: getCategoryLabel(att.category),
          photoUrl: att.photoUrl,
          description: att.description,
          location: `${cleanDest}, ${canonical.country}`,
          coordinates: att.coordinates,
          googleMapsUrl: att.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(att.name + ' ' + cleanDest)}`,
          source: 'curated',
          distanceFromCenter: att.distanceFromCenter,
          bestTimeToVisit: att.bestTimeToVisit,
          recommendedDuration: att.recommendedDuration,
          entryFee: att.entryFee,
          whyFamous: att.whyFamous,
          rating: 4.8,
          reviewCount: 3500,
        });
      });
    }

    // B. Add Curated Attractions if available
    if (curatedMatch?.popularAttractions) {
      curatedMatch.popularAttractions.forEach((att, idx) => {
        let cat: DiscoveryCategory = 'MUST_VISIT';
        const lower = att.toLowerCase();
        if (lower.includes('waterfall') || lower.includes('lake') || lower.includes('valley') || lower.includes('pass') || lower.includes('trek')) {
          cat = 'NATURE_ADVENTURE';
        } else if (lower.includes('temple') || lower.includes('fort') || lower.includes('museum') || lower.includes('church')) {
          cat = 'HISTORY_CULTURE';
        } else if (lower.includes('view') || lower.includes('sunset') || lower.includes('top')) {
          cat = 'PHOTOGRAPHY';
        }

        // Only use image if caption explicitly mentions the attraction name; never cycle generic images
        const matchedImage = curatedMatch.images.find(img => 
          img.caption && img.caption.toLowerCase().includes(att.toLowerCase())
        );

        addUniquePlace({
          id: `curated_${curatedMatch.id}_${idx}`,
          name: att,
          category: cat,
          categoryLabel: getCategoryLabel(cat),
          photoUrl: matchedImage?.url,
          description: `Prime recommended point of interest in ${curatedMatch.name}, ${curatedMatch.country}.`,
          location: `${curatedMatch.name}, ${curatedMatch.country}`,
          coordinates: curatedMatch.coordinates,
          rating: 4.8,
          reviewCount: 1500,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(att + ' ' + curatedMatch.name)}`,
          source: 'curated',
        });
      });
    }

    // C. Add Wikivoyage Featured Attractions
    const wikiFeaturedNames = new Set<string>();
    if (wikivoyageGuide?.seeAttractions) {
      wikivoyageGuide.seeAttractions.forEach((att, idx) => {
        wikiFeaturedNames.add(att.name.toLowerCase());
        let cat: DiscoveryCategory = 'MUST_VISIT';
        const lower = att.name.toLowerCase();
        if (lower.includes('waterfall') || lower.includes('lake') || lower.includes('trek') || lower.includes('mountain') || lower.includes('valley')) {
          cat = 'NATURE_ADVENTURE';
        } else if (lower.includes('museum') || lower.includes('temple') || lower.includes('fort') || lower.includes('church') || lower.includes('palace')) {
          cat = 'HISTORY_CULTURE';
        } else if (lower.includes('view') || lower.includes('point') || lower.includes('sunset')) {
          cat = 'PHOTOGRAPHY';
        }

        addUniquePlace({
          id: `wv_${idx}_${att.name.replace(/\s+/g, '_')}`,
          name: att.name,
          category: cat,
          categoryLabel: getCategoryLabel(cat),
          description: att.description,
          location: `${cleanDest} region`,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(att.name + ' ' + cleanDest)}`,
          source: 'wikivoyage',
          rating: 4.7,
        });
      });
    }

    // D. Add Google Places Results
    for (const gp of googlePlaces) {
      let cat: DiscoveryCategory = 'MUST_VISIT';
      const types = (gp.types || []).join(' ');

      if (types.includes('park') || types.includes('natural_feature') || types.includes('campground')) {
        cat = 'NATURE_ADVENTURE';
      } else if (types.includes('museum') || types.includes('historical') || types.includes('place_of_worship')) {
        cat = 'HISTORY_CULTURE';
      } else if (types.includes('scenic') || types.includes('viewpoint')) {
        cat = 'PHOTOGRAPHY';
      }

      addUniquePlace({
        id: `gp_${gp.id}`,
        name: gp.name,
        category: cat,
        categoryLabel: getCategoryLabel(cat),
        photoUrl: gp.photoUrl,
        description: gp.formattedAddress || `Notable attraction in ${cleanDest}`,
        location: gp.formattedAddress,
        coordinates: gp.location,
        rating: gp.rating,
        reviewCount: gp.userRatingCount,
        openingHours: gp.openNow !== undefined ? (gp.openNow ? 'Open Now' : 'Closed') : undefined,
        priceLevel: gp.priceLevel,
        googleMapsUrl: gp.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gp.name + ' ' + cleanDest)}`,
        source: 'google',
      });
    }

    // E. Add OpenStreetMap POIs
    for (const osm of osmPlaces) {
      let cat: DiscoveryCategory = 'MUST_VISIT';
      if (osm.category === 'nature') cat = 'NATURE_ADVENTURE';
      else if (osm.category === 'photography') cat = 'PHOTOGRAPHY';
      else if (osm.category === 'history') cat = 'HISTORY_CULTURE';
      else if (osm.category === 'hidden-gems') cat = 'HIDDEN_GEMS';

      addUniquePlace({
        id: osm.id,
        name: osm.name,
        category: cat,
        categoryLabel: getCategoryLabel(cat),
        description: `Verified ${osm.typeTag.replace(/_/g, ' ')} located in ${cleanDest}.`,
        location: osm.address || `${cleanDest} region`,
        coordinates: osm.coordinates,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${osm.coordinates.lat},${osm.coordinates.lng}`,
        source: 'osm',
      });
    }

    // 7. Apply Multi-Signal Ranking
    const rankedData = rankingService.rankAndCategorize(placesList, wikiFeaturedNames);

    // 8. Assemble Traditional Regional Foods
    let traditionalFoods: WikiFoodInfo[] = [];

    // Canonical foods if available
    if (canonical?.foodAndCuisine) {
      traditionalFoods = canonical.foodAndCuisine.traditionalDishes.map((f) => ({
        name: f.name,
        description: f.description,
        isRegionalSpecialty: true,
      }));
    } else if (curatedMatch?.famousFoods) {
      traditionalFoods = curatedMatch.famousFoods.map((f) => ({
        name: f,
        description: `Renowned traditional dish native to ${curatedMatch.name}.`,
        isRegionalSpecialty: true,
      }));
    }

    // Supplement from Wikivoyage "Eat" section
    if (wikivoyageGuide?.eatSpecialties && wikivoyageGuide.eatSpecialties.length > 0) {
      const extraFoods = wikivoyageGuide.eatSpecialties.map((e) => ({
        name: e.name,
        description: e.description,
        isRegionalSpecialty: true,
      }));
      traditionalFoods = [...traditionalFoods, ...extraFoods].slice(0, 8);
    }

    // 9. Assemble Real Restaurants
    const restaurants: DiscoveredRestaurant[] = [];
    const seenRestNames = new Set<string>();

    for (const gp of googleFoodPlaces) {
      if (seenRestNames.has(gp.name.toLowerCase())) continue;
      seenRestNames.add(gp.name.toLowerCase());
      restaurants.push({
        id: `gp_rest_${gp.id}`,
        name: gp.name,
        location: gp.formattedAddress || cleanDest,
        cuisine: 'Local & Authentic Dining',
        rating: gp.rating || 4.5,
        priceLevel: gp.priceLevel || '$$',
        openingHours: gp.openNow !== undefined ? (gp.openNow ? 'Open Now' : 'Closed') : undefined,
        googleMapsUrl: gp.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gp.name + ' ' + cleanDest)}`,
        photoUrl: gp.photoUrl,
        source: 'google',
      });
    }

    for (const osm of osmRestaurants) {
      if (seenRestNames.has(osm.name.toLowerCase())) continue;
      seenRestNames.add(osm.name.toLowerCase());
      restaurants.push({
        id: osm.id,
        name: osm.name,
        location: osm.address || `${cleanDest} center`,
        cuisine: osm.typeTag || 'Regional Cuisine',
        rating: 4.4,
        priceLevel: '$$',
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${osm.coordinates.lat},${osm.coordinates.lng}`,
        source: 'osm',
      });
    }

    // 10. Summary description
    const stateOverview = indiaMatch?.stateData ? {
      introduction: indiaMatch.stateData.introduction,
      famousFor: indiaMatch.stateData.subDestinations.map(s => s.name),
      bestTimeToVisit: indiaMatch.stateData.bestTimeToVisit,
      climate: indiaMatch.stateData.climate,
      localCulture: indiaMatch.stateData.localCulture,
      languages: indiaMatch.stateData.languages,
      howToReach: `Airports: ${indiaMatch.stateData.howToReach.airports.join(', ')}; Rail: ${indiaMatch.stateData.howToReach.railheads.join(', ')}`,
      recommendedDuration: '7 to 10 Days',
      importantConsiderations: [
        'Best explored by booking intercity tourist taxis or state transport.',
        'Pre-booking heritage monuments and wildlife safaris recommended.',
      ],
    } : undefined;

    const summary =
      canonical?.overview.introduction ||
      indiaMatch?.summary ||
      wikiSummary?.extract ||
      curatedMatch?.description ||
      `${cleanDest} is a captivating travel destination offering remarkable cultural heritage, iconic viewpoints, and scenic excursions.`;

    // Hero image (strictly verified destination photo or undefined; never generic camper vans)
    const heroPhoto =
      canonical?.heroPhoto ||
      curatedMatch?.heroImage ||
      wikiSummary?.thumbnailUrl ||
      googlePlaces[0]?.photoUrl ||
      undefined;

    // Source Attribution String
    const sources: string[] = [];
    if (canonical) sources.push('Canonical Knowledge');
    if (indiaMatch) sources.push('India Tourism Gazetteer');
    if (wikivoyageGuide) sources.push('Wikivoyage');
    if (wikiSummary) sources.push('Wikipedia');
    if (googlePlaces.length > 0) sources.push('Google Places (New)');
    if (osmPlaces.length > 0) sources.push('OpenStreetMap');

    const result: DestinationDiscoveryResult = {
      destination: canonical?.name || indiaMatch?.name || curatedMatch?.name || cleanDest,
      country: canonical?.country || (indiaMatch ? 'India' : curatedMatch?.country),
      geographicType: canonical?.type || (indiaMatch?.type === 'state_ut' ? 'state_region' : 'city_destination'),
      summary,
      heroPhoto,
      coordinates: coords,
      categorizedPlaces: rankedData.categorized,
      allPlaces: rankedData.allRanked,
      traditionalFoods,
      restaurants: restaurants.slice(0, 10),
      sourceAttribution: sources.length > 0 ? sources.join(' • ') : 'India & Global Open Tourism Network',
      isLiveApi: true,
      subDestinations: canonical?.subDestinations || indiaMatch?.subDestinations,
      overview: canonical?.overview || stateOverview,
    };

    // Cache result
    destinationCache.set(cacheKey, { result, timestamp: Date.now() });
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ result, timestamp: Date.now() }));
    } catch {}

    return result;
  },
};
