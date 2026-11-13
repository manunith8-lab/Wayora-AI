import { CANONICAL_DESTINATIONS } from '../data/canonicalKnowledge';
import { DESTINATIONS } from '../data/destinationsData';
import { ALL_INDIAN_STATES_AND_UTS } from '../data/indiaGazetteer';

// Universal Location Recognition Engine
// Provides spelling correction, phonetic matching, dynamic OpenStreetMap/Nominatim geocoding,
// Wikidata alias resolution, administrative hierarchy detection, and disambiguation.
// Zero paid AI tokens consumed: 100% deterministic algorithms.

export type RecognizedGeographicType = 
  | 'country'
  | 'state_region'
  | 'district'
  | 'city'
  | 'town'
  | 'village'
  | 'island'
  | 'mountain'
  | 'waterfall'
  | 'beach'
  | 'lake'
  | 'forest_park'
  | 'historical_monument'
  | 'landmark'
  | 'general';

export interface LocationHierarchy {
  country?: string;
  countryCode?: string;
  state?: string;
  district?: string;
  city?: string;
  town?: string;
  village?: string;
  continent?: string;
}

export interface RecognizedLocation {
  id: string;
  canonicalName: string;
  originalQuery: string;
  correctedSpelling?: string;
  displayName: string;
  geographicType: RecognizedGeographicType;
  typeLabel: string;
  coordinates: { lat: number; lng: number };
  boundingBox?: [number, number, number, number]; // [minLat, maxLat, minLng, maxLng]
  hierarchy: LocationHierarchy;
  alternativeNames: string[];
  confidenceScore: number; // 0.0 - 1.0
  isDisambiguationNeeded?: boolean;
  disambiguationOptions?: DisambiguationOption[];
  wikidataId?: string;
  osmType?: 'node' | 'way' | 'relation';
  osmId?: number;
}

export interface DisambiguationOption {
  id: string;
  name: string;
  description: string;
  country: string;
  state?: string;
  coordinates: { lat: number; lng: number };
  geographicType: RecognizedGeographicType;
}

const locationMemoryCache = new Map<string, { result: RecognizedLocation; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days persistent cache
let lastNominatimRequestTime = 0;

// Common query prefixes and stop phrases to extract core location
const LOCATION_STOP_PREFIXES = [
  /^(?:plan\s+a\s+(?:trip|vacation|itinerary|tour|travel)\s+(?:to|for|in|around)\s+)/i,
  /^(?:how\s+(?:is|to|can\s+i\s+visit)\s+)/i,
  /^(?:tell\s+me\s+about\s+)/i,
  /^(?:what\s+(?:to\s+see|are\s+the\s+best\s+places|is\s+famous)\s+(?:in|at|around)\s+)/i,
  /^(?:places\s+(?:to\s+visit|in|around|near)\s+)/i,
  /^(?:tourist\s+attractions\s+(?:in|around|of)\s+)/i,
  /^(?:hotels\s+(?:in|near|around)\s+)/i,
  /^(?:food\s+(?:in|around)\s+)/i,
  /^(?:best\s+time\s+to\s+visit\s+)/i,
  /^(?:explore\s+)/i,
  /^(?:visit\s+)/i,
  /^(?:trip\s+to\s+)/i,
  /^(?:travel\s+to\s+)/i,
  /^(?:in\s+)/i,
  /^(?:to\s+)/i,
];

// Common conversational words that should never be geocoded as places
const CONVERSATIONAL_WORDS = new Set([
  'hi', 'hello', 'hey', 'help', 'thanks', 'thank you', 'bye', 'goodbye',
  'who are you', 'what can you do', 'how are you', 'good morning', 'good afternoon', 'good evening',
  'ok', 'okay', 'yes', 'no', 'cool', 'great', 'awesome', 'nice', 'test', 'where', 'what', 'why', 'how', 'when',
  'travel', 'trip', 'vacation', 'holiday', 'explore', 'tour', 'itinerary', 'guide',
  'food', 'dishes', 'cuisine', 'restaurant', 'restaurants', 'eat', 'dining',
  'hotel', 'hotels', 'stay', 'stays', 'resort', 'resorts', 'hostel', 'hostels', 'accommodation',
  'cost', 'costs', 'budget', 'expense', 'expenses', 'price', 'pricing',
  'photo', 'photos', 'photography', 'camera', 'flight', 'flights', 'train', 'trains',
  'bus', 'buses', 'transport', 'connectivity'
]);

export const locationRecognitionEngine = {
  /**
   * Main entry point: Parses a query, normalizes it, corrects typos,
   * queries open geographical registries, and returns structured location data.
   */
  async recognizeLocation(rawQuery: string): Promise<RecognizedLocation | null> {
    if (!rawQuery || typeof rawQuery !== 'string') return null;

    const cleanedQuery = this.extractLocationCandidate(rawQuery);
    if (!cleanedQuery || cleanedQuery.length < 2) return null;

    if (CONVERSATIONAL_WORDS.has(cleanedQuery.toLowerCase())) {
      return null;
    }

    const cacheKey = `loc_rec_${cleanedQuery.toLowerCase()}`;
    const cached = locationMemoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.result;
    }

    // Try persistent localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(cacheKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
            locationMemoryCache.set(cacheKey, parsed);
            return parsed.result;
          }
        }
      }
    } catch {}

    // Stage 0: Fuzzy matching against prominent travel destinations
    const fuzzyCandidate = this.findFuzzyCandidate(cleanedQuery);
    let correctedSpelling: string | undefined;

    // Stage 1: Nominatim OpenStreetMap Geocoding (Direct & Multilingual)
    let nominatimResult = await this.queryNominatim(cleanedQuery);

    const isAmenityOrSchool = nominatimResult && (nominatimResult.class === 'amenity' || nominatimResult.type === 'school' || nominatimResult.type === 'bus_stop');
    const isLowImportance = nominatimResult && parseFloat(nominatimResult.importance || '0') < 0.25;

    // If fuzzy candidate exists and differs, prefer it if Nominatim returned nothing or low-relevance match
    if (fuzzyCandidate && fuzzyCandidate.toLowerCase() !== cleanedQuery.toLowerCase()) {
      if (!nominatimResult || isAmenityOrSchool || isLowImportance) {
        correctedSpelling = fuzzyCandidate;
        nominatimResult = await this.queryNominatim(fuzzyCandidate);
      }
    }

    // Stage 2: If no direct match, attempt spelling correction via Wikidata entity lookup
    if (!nominatimResult || isAmenityOrSchool) {
      const wikidataMatch = await this.queryWikidataEntity(cleanedQuery);
      if (wikidataMatch) {
        correctedSpelling = wikidataMatch.label;
        // Re-query Nominatim with corrected canonical name
        nominatimResult = await this.queryNominatim(wikidataMatch.label);
      }
    }

    // Stage 3: Phonetic fallback check
    if (!nominatimResult && !correctedSpelling) {
      const phoneticVariant = this.generatePhoneticVariant(cleanedQuery);
      if (phoneticVariant && phoneticVariant !== cleanedQuery) {
        nominatimResult = await this.queryNominatim(phoneticVariant);
        if (nominatimResult) {
          correctedSpelling = phoneticVariant;
        }
      }
    }

    // Stage 4: If still no result, but fuzzyCandidate was found, query Nominatim with it
    if (!nominatimResult && fuzzyCandidate) {
      correctedSpelling = fuzzyCandidate;
      nominatimResult = await this.queryNominatim(fuzzyCandidate);
    }

    if (!nominatimResult) {
      return null;
    }

    // Parse geographical type and administrative hierarchy
    const geographicType = this.classifyGeographicType(nominatimResult);
    const hierarchy = this.extractHierarchy(nominatimResult.address || {});
    const canonicalName = this.determineCanonicalName(nominatimResult, hierarchy, geographicType);

    // Check for multiple plausible candidates (disambiguation)
    const disambiguationOptions = await this.findDisambiguationCandidates(cleanedQuery, nominatimResult);
    const isDisambiguationNeeded = disambiguationOptions.length > 1;

    const recognized: RecognizedLocation = {
      id: `geo_${nominatimResult.osm_type || 'p'}_${nominatimResult.osm_id || Math.abs(this.simpleHash(canonicalName))}`,
      canonicalName,
      originalQuery: rawQuery,
      correctedSpelling,
      displayName: nominatimResult.display_name,
      geographicType,
      typeLabel: this.getTypeLabel(geographicType),
      coordinates: {
        lat: parseFloat(nominatimResult.lat),
        lng: parseFloat(nominatimResult.lon),
      },
      boundingBox: nominatimResult.boundingbox
        ? [
            parseFloat(nominatimResult.boundingbox[0]),
            parseFloat(nominatimResult.boundingbox[1]),
            parseFloat(nominatimResult.boundingbox[2]),
            parseFloat(nominatimResult.boundingbox[3]),
          ]
        : undefined,
      hierarchy,
      alternativeNames: this.extractAlternativeNames(nominatimResult),
      confidenceScore: correctedSpelling ? 0.88 : 0.98,
      isDisambiguationNeeded,
      disambiguationOptions: isDisambiguationNeeded ? disambiguationOptions : undefined,
      osmType: nominatimResult.osm_type,
      osmId: nominatimResult.osm_id,
    };

    // Save to memory and persistent cache
    locationMemoryCache.set(cacheKey, { result: recognized, timestamp: Date.now() });
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify({ result: recognized, timestamp: Date.now() }));
      }
    } catch {}

    return recognized;
  },

  /**
   * Strips conversational fluff and prepositions to get the core geographic query
   */
  extractLocationCandidate(query: string): string {
    let clean = query.trim();

    // Remove punctuation at the end (? ! .)
    clean = clean.replace(/[?!.]+$/, '').trim();

    // Remove stop prefixes
    for (const prefix of LOCATION_STOP_PREFIXES) {
      if (prefix.test(clean)) {
        clean = clean.replace(prefix, '').trim();
        break;
      }
    }

    // Handle trailing modifiers like "for 3 days", "in december", "under 1000"
    clean = clean.replace(/\s+(?:for\s+\d+\s+days?|in\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|winter|summer|spring|autumn)|under\s+[\$₹€£]?\d+.*)$/i, '').trim();

    return clean;
  },

  /**
   * Throttled OpenStreetMap Nominatim Search
   */
  async queryNominatim(query: string, limit: number = 3): Promise<any | null> {
    try {
      // Respect Nominatim usage policy (1 request/sec max)
      const now = Date.now();
      const elapsed = now - lastNominatimRequestTime;
      if (elapsed < 1000) {
        await new Promise((r) => setTimeout(r, 1000 - elapsed));
      }
      lastNominatimRequestTime = Date.now();

      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json&limit=${limit}&addressdetails=1&extratags=1&namedetails=1`;

      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'WayoraUniversalTravelAssistant/2.0 (contact@wayora.ai)',
        },
      });

      if (!res.ok) return null;
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return null;

      return data[0];
    } catch (e) {
      console.warn('Nominatim geocode query error for:', query, e);
      return null;
    }
  },

  /**
   * Discovers multiple matching candidates for ambiguous names (e.g. "Hyderabad", "Springfield")
   */
  async findDisambiguationCandidates(query: string, primaryMatch: any): Promise<DisambiguationOption[]> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json&limit=4&addressdetails=1`;

      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'WayoraUniversalTravelAssistant/2.0',
        },
      });

      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data) || data.length <= 1) return [];

      const options: DisambiguationOption[] = [];
      const seenLocs = new Set<string>();
      const primaryImportance = parseFloat(primaryMatch?.importance || '0.5');

      for (const item of data) {
        const addr = item.address || {};
        const country = addr.country || 'International';
        const state = addr.state || addr.region;
        const key = `${addr.city || addr.town || item.name}_${state}_${country}`;

        if (seenLocs.has(key)) continue;
        seenLocs.add(key);

        const itemImportance = parseFloat(item.importance || '0');
        // When primary match is a world capital or megacity (>= 0.85), exclude negligible towns with huge importance gap
        if (options.length > 0 && primaryImportance >= 0.85 && (primaryImportance - itemImportance) > 0.3) {
          continue;
        }

        const type = this.classifyGeographicType(item);
        options.push({
          id: `opt_${item.osm_id || Math.random()}`,
          name: item.name || query,
          description: item.display_name,
          country,
          state,
          coordinates: { lat: parseFloat(item.lat), lng: parseFloat(item.lon) },
          geographicType: type,
        });
      }

      if (options.length <= 1) return [];

      return options;
    } catch {
      return [];
    }
  },

  /**
   * Wikidata multilingual alias & spelling correction lookup
   */
  async queryWikidataEntity(query: string): Promise<{ label: string; description: string; id: string } | null> {
    try {
      const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
        query
      )}&language=en&type=item&limit=3&format=json&origin=*`;

      const res = await fetch(url, {
        headers: { 'Api-User-Agent': 'WayoraTravelAssistant/2.0' },
      });

      if (!res.ok) return null;
      const data = await res.json();
      if (!data.search || data.search.length === 0) return null;

      // Filter for place/location entities
      const candidate = data.search.find((item: any) => {
        const desc = (item.description || '').toLowerCase();
        return (
          desc.includes('city') ||
          desc.includes('town') ||
          desc.includes('capital') ||
          desc.includes('country') ||
          desc.includes('state') ||
          desc.includes('province') ||
          desc.includes('island') ||
          desc.includes('mountain') ||
          desc.includes('lake') ||
          desc.includes('waterfall') ||
          desc.includes('district') ||
          desc.includes('village') ||
          desc.includes('monument') ||
          desc.includes('human settlement')
        );
      }) || data.search[0];

      return {
        label: candidate.label,
        description: candidate.description || '',
        id: candidate.id,
      };
    } catch {
      return null;
    }
  },

  /**
   * Classifies OpenStreetMap results into a specific geographical type
   */
  classifyGeographicType(osm: any): RecognizedGeographicType {
    const addr = osm.address || {};
    const osmClass = (osm.class || '').toLowerCase();
    const osmType = (osm.type || '').toLowerCase();
    const extratags = osm.extratags || {};
    const place = (extratags.place || osmType || '').toLowerCase();

    // 1. Country
    if (osmType === 'country' || addr.country === osm.name) {
      return 'country';
    }

    // 2. State or Province
    if (
      osmType === 'state' ||
      osmType === 'province' ||
      place === 'state' ||
      place === 'province' ||
      osm.admin_level === '4'
    ) {
      return 'state_region';
    }

    // 3. Natural Features
    if (osmType === 'waterfall' || osmClass === 'waterway' || osm.name?.toLowerCase().includes('falls')) {
      return 'waterfall';
    }
    if (osmType === 'peak' || osmType === 'volcano' || place === 'mountain' || osmClass === 'natural' && osmType === 'mountain_range') {
      return 'mountain';
    }
    if (osmType === 'beach' || place === 'beach' || osm.name?.toLowerCase().includes('beach')) {
      return 'beach';
    }
    if (osmType === 'water' || osmType === 'lake' || osm.name?.toLowerCase().includes('lake')) {
      return 'lake';
    }
    if (place === 'island' || place === 'islet' || osmType === 'island') {
      return 'island';
    }
    if (osmType === 'national_park' || osmType === 'nature_reserve' || osmType === 'forest') {
      return 'forest_park';
    }

    // 4. Historical & Landmarks
    if (
      osmClass === 'historic' ||
      osmType === 'monument' ||
      osmType === 'castle' ||
      osmType === 'fort' ||
      osmType === 'archaeological_site' ||
      osmType === 'ruins'
    ) {
      return 'historical_monument';
    }

    // 5. Urban & Settlements
    if (place === 'city' || osmType === 'city' || addr.city === osm.name) {
      return 'city';
    }
    if (place === 'town' || osmType === 'town' || addr.town === osm.name) {
      return 'town';
    }
    if (place === 'village' || place === 'hamlet' || osmType === 'village') {
      return 'village';
    }
    if (osmType === 'administrative' && (osm.admin_level === '5' || osm.admin_level === '6')) {
      return 'district';
    }

    return 'general';
  },

  /**
   * Formats administrative hierarchy
   */
  extractHierarchy(addr: any): LocationHierarchy {
    return {
      country: addr.country,
      countryCode: addr.country_code ? addr.country_code.toUpperCase() : undefined,
      state: addr.state || addr.province || addr.region,
      district: addr.state_district || addr.county || addr.district,
      city: addr.city,
      town: addr.town,
      village: addr.village || addr.hamlet,
      continent: addr.continent,
    };
  },

  /**
   * Canonical clean name determination
   */
  determineCanonicalName(osm: any, hierarchy: LocationHierarchy, type: RecognizedGeographicType): string {
    if (type === 'country') {
      return hierarchy.country || osm.name;
    }
    if (type === 'state_region') {
      return hierarchy.state || osm.name;
    }
    return osm.name || hierarchy.city || hierarchy.town || hierarchy.village || 'Destination';
  },

  /**
   * Human readable type label
   */
  getTypeLabel(type: RecognizedGeographicType): string {
    switch (type) {
      case 'country': return 'Country';
      case 'state_region': return 'State / Region';
      case 'district': return 'District / County';
      case 'city': return 'City';
      case 'town': return 'Town';
      case 'village': return 'Village';
      case 'island': return 'Island';
      case 'mountain': return 'Mountain / Peak';
      case 'waterfall': return 'Waterfall';
      case 'beach': return 'Beach';
      case 'lake': return 'Lake';
      case 'forest_park': return 'National Park / Forest';
      case 'historical_monument': return 'Historic Landmark / Fort';
      case 'landmark': return 'Iconic Landmark';
      default: return 'Destination';
    }
  },

  /**
   * Collects alternative names and transliterations from OSM namedetails
   */
  extractAlternativeNames(osm: any): string[] {
    const names = new Set<string>();
    const details = osm.namedetails || {};

    if (details['alt_name']) names.add(details['alt_name']);
    if (details['int_name']) names.add(details['int_name']);
    if (details['loc_name']) names.add(details['loc_name']);
    if (details['name:en']) names.add(details['name:en']);
    if (details['official_name']) names.add(details['official_name']);

    return Array.from(names);
  },

  /**
   * Soundex phonetic encoding algorithm
   */
  soundex(s: string): string {
    const a = s.toLowerCase().replace(/[^a-z]/g, '').split('');
    if (a.length === 0) return '0000';
    const first = a.shift() || '';
    const codes: Record<string, string> = {
      b: '1', f: '1', p: '1', v: '1',
      c: '2', g: '2', j: '2', k: '2', q: '2', s: '2', x: '2', z: '2',
      d: '3', t: '3',
      l: '4',
      m: '5', n: '5',
      r: '6',
    };
    const res = [first.toUpperCase()];
    let prev = codes[first] || '';
    for (const c of a) {
      const code = codes[c];
      if (code) {
        if (code !== prev) {
          res.push(code);
          prev = code;
        }
      } else {
        prev = '';
      }
      if (res.length === 4) break;
    }
    while (res.length < 4) res.push('0');
    return res.join('');
  },

  /**
   * Fast fuzzy candidate finder across known major world & Indian destinations
   */
  findFuzzyCandidate(query: string): string | null {
    const qLower = query.toLowerCase().trim();
    if (qLower.length < 3) return null;
    const qSoundex = this.soundex(qLower);

    let bestMatch: string | null = null;
    let minDistance = Infinity;

    const candidates = new Set<string>();

    for (const d of Object.values(CANONICAL_DESTINATIONS)) {
      candidates.add(d.name);
      for (const a of d.aliases) candidates.add(a);
    }
    for (const d of DESTINATIONS) {
      candidates.add(d.name);
    }
    for (const state of ALL_INDIAN_STATES_AND_UTS) {
      candidates.add(state.name);
      if (state.capital) candidates.add(state.capital);
      if (state.largestCity) candidates.add(state.largestCity);
      if (Array.isArray(state.subDestinations)) {
        for (const sub of state.subDestinations) {
          candidates.add(sub.name);
        }
      }
    }

    const GLOBAL_HUBS = [
      'Paris', 'Rome', 'London', 'Tokyo', 'Dubai', 'Kyoto', 'Bali', 'Singapore',
      'Barcelona', 'Amsterdam', 'Bangkok', 'Istanbul', 'Sydney', 'New York',
      'Venice', 'Florence', 'Prague', 'Vienna', 'Budapest', 'Athens', 'Lisbon',
      'Cairo', 'Marrakech', 'Cape Town', 'Reykjavik', 'Zurich', 'Seoul',
      'Bangalore', 'Mumbai', 'Delhi', 'Jaipur', 'Agra', 'Goa', 'Kolkata', 'Chennai', 'Manali'
    ];
    for (const hub of GLOBAL_HUBS) candidates.add(hub);

    for (const cand of candidates) {
      const cLower = cand.toLowerCase();
      if (cLower === qLower) return cand;

      const dist = this.levenshteinDistance(qLower, cLower);
      const isSoundexMatch = this.soundex(cLower) === qSoundex;
      const maxAllowedDist = qLower.length <= 4 ? 1 : 2;

      if ((dist <= maxAllowedDist || (isSoundexMatch && dist <= 2)) && dist < minDistance) {
        minDistance = dist;
        bestMatch = cand;
      }
    }

    return bestMatch;
  },

  /**
   * Generates soundex/phonetic replacement for obvious typos
   * (e.g. "Dubaai" -> "Dubai", "Parris" -> "Paris", "Kashmeer" -> "Kashmir")
   */
  generatePhoneticVariant(word: string): string {
    // 1. Remove duplicate characters (e.g. "Dubbaai" -> "Dubai")
    let cleaned = word.replace(/([a-zA-Z])\1+/g, '$1');

    // 2. Common vowels/diphthongs phonetic normalizations
    cleaned = cleaned
      .replace(/ee/g, 'i')
      .replace(/oo/g, 'u')
      .replace(/ph/g, 'f')
      .replace(/gh/g, 'g');

    return cleaned;
  },

  /**
   * Simple string hash code helper
   */
  simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  },

  /**
   * Levenshtein Distance implementation for fast fuzzy string comparison
   */
  levenshteinDistance(a: string, b: string): number {
    const an = a.length;
    const bn = b.length;
    if (an === 0) return bn;
    if (bn === 0) return an;

    const matrix = Array.from({ length: bn + 1 }, (_, i) => [i]);
    for (let j = 0; j <= an; j++) matrix[0][j] = j;

    for (let i = 1; i <= bn; i++) {
      for (let j = 1; j <= an; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[bn][an];
  },

  /**
   * Normalized similarity between 0.0 and 1.0
   */
  calculateSimilarity(a: string, b: string): number {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    if (aLower === bLower) return 1.0;
    const maxLen = Math.max(aLower.length, bLower.length);
    if (maxLen === 0) return 1.0;
    const distance = this.levenshteinDistance(aLower, bLower);
    return 1.0 - distance / maxLen;
  },
};
