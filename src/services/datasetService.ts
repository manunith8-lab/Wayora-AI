// Dataset Service: Primary Knowledge Base Ingestion & Search Engine for Wayora.ai
// Manages verified destination records from Indian Tourism, Holidify, Global Tourist Destinations,
// and Travel Planner datasets (4,233+ verified records).
// Implements instant O(1) indexed retrieval, fuzzy matching, relationship traversal,
// and verified provenance guarantees.

import datasetData from '../data/datasetKnowledge.json';

export interface VerifiedAttraction {
  placeId: string;
  placeName: string;
  placeType: string;
  establishmentYear: number | null;
  visitDurationHours: number | null;
  googleRating: number | null;
  entranceFeeINR: number;
  airportWithin50km: boolean;
  weeklyOff: string;
  significance: string;
  dslrAllowed: boolean;
  googleReviewsLakhs: number | null;
  bestTimeToVisit: string;
  state: string;
  zone: string;
  sourceDataset: string;
  city?: string;
}

export interface VerifiedFoodItem {
  recommendationId: string;
  name: string;
  type: string;
  meal: string;
  sourceDataset: string;
  city?: string;
}

export interface VerifiedCity {
  cityId: string;
  city: string;
  state: string;
  zone: string;
  holidifyRating: number | null;
  description: string;
  bestTimeToVisit: string;
  sourceDatasets: string;
  touristPlaces: VerifiedAttraction[];
  foodRecommendations: VerifiedFoodItem[];
}

export interface VerifiedGlobalDestination {
  id: string;
  name: string;
  country: string;
  continent: string;
  type: string;
  avgCostUSDPerDay: number | null;
  bestSeason: string;
  avgRating: number | null;
  annualVisitorsMillion: number | null;
  unescoSite: boolean;
}

export interface VerifiedTravelPlan {
  id: string;
  destinationName: string;
  country: string;
  city: string;
  destinationType: string;
  startingPoint: string;
  distanceKm: number | null;
  travelMode: string;
  flightTransportCostUSD: number | null;
  travelDurationHours: number | null;
  accommodationOptions: string[];
  accommodationCostPerNightUSD: number | null;
  recommendedStayDays: number;
  topAttractions: string[];
  activityCostUSD: number | null;
  activityDurationHours: number | null;
  foodOptions: string[];
  foodCostPerDayUSD: number | null;
  visaRequired: boolean;
  visaCostUSD: number;
  miscellaneousCostUSD: number;
  bestSeason: string;
  peakSeasonCostMultiplier: number;
  localCurrency: string;
  exchangeRateToUSD: number | null;
}

export interface DatasetLookupResult {
  found: boolean;
  matchType: 'city' | 'attraction' | 'food' | 'global_destination' | 'travel_plan' | 'country';
  primaryName: string;
  canonicalDestination: string;
  country: string;
  state?: string;
  cityData?: VerifiedCity;
  attractionData?: VerifiedAttraction;
  foodItems?: VerifiedFoodItem[];
  globalData?: VerifiedGlobalDestination;
  travelPlans?: VerifiedTravelPlan[];
  verifiedInDataset: boolean;
  provenance: string;
  summaryText: string;
}

class DatasetService {
  private citiesMap = new Map<string, VerifiedCity>();
  private attractionsMap = new Map<string, VerifiedAttraction>();
  private globalDestMap = new Map<string, VerifiedGlobalDestination>();
  private travelPlansMap = new Map<string, VerifiedTravelPlan[]>();
  private countryMap = new Map<string, { cities: VerifiedCity[]; global: VerifiedGlobalDestination[]; plans: VerifiedTravelPlan[] }>();

  // Inverted keyword index for fast substring and partial matching
  private allSearchableEntities: { name: string; key: string; type: 'city' | 'attraction' | 'global' | 'plan'; ref: any }[] = [];

  constructor() {
    this.initializeIndices();
  }

  private normalizeKey(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  }

  private initializeIndices() {
    const rawCities = (datasetData.cities || []) as VerifiedCity[];
    const rawGlobal = (datasetData.globalDestinations || []) as VerifiedGlobalDestination[];
    const rawPlans = (datasetData.travelPlans || []) as VerifiedTravelPlan[];

    // 1. Index Cities
    rawCities.forEach((c) => {
      const key = this.normalizeKey(c.city);
      this.citiesMap.set(key, c);
      this.citiesMap.set(c.city.toLowerCase(), c);

      this.allSearchableEntities.push({
        name: c.city,
        key,
        type: 'city',
        ref: c,
      });

      // Index Country & State groups
      const countryKey = 'india';
      if (!this.countryMap.has(countryKey)) {
        this.countryMap.set(countryKey, { cities: [], global: [], plans: [] });
      }
      this.countryMap.get(countryKey)!.cities.push(c);

      // 2. Index Attractions inside City
      if (Array.isArray(c.touristPlaces)) {
        c.touristPlaces.forEach((p) => {
          const pWithCity: VerifiedAttraction = { ...p, city: c.city };
          const pKey = this.normalizeKey(p.placeName);
          this.attractionsMap.set(pKey, pWithCity);
          this.attractionsMap.set(p.placeName.toLowerCase(), pWithCity);

          this.allSearchableEntities.push({
            name: p.placeName,
            key: pKey,
            type: 'attraction',
            ref: pWithCity,
          });
        });
      }
    });

    // 3. Index Global Destinations
    rawGlobal.forEach((g) => {
      const gKey = this.normalizeKey(g.name);
      this.globalDestMap.set(gKey, g);
      this.globalDestMap.set(g.name.toLowerCase(), g);

      this.allSearchableEntities.push({
        name: g.name,
        key: gKey,
        type: 'global',
        ref: g,
      });

      const cKey = this.normalizeKey(g.country);
      if (!this.countryMap.has(cKey)) {
        this.countryMap.set(cKey, { cities: [], global: [], plans: [] });
      }
      this.countryMap.get(cKey)!.global.push(g);
    });

    // 4. Index Travel Plans
    rawPlans.forEach((pl) => {
      const plKey = this.normalizeKey(pl.destinationName);
      if (!this.travelPlansMap.has(plKey)) {
        this.travelPlansMap.set(plKey, []);
      }
      this.travelPlansMap.get(plKey)!.push(pl);

      this.allSearchableEntities.push({
        name: pl.destinationName,
        key: plKey,
        type: 'plan',
        ref: pl,
      });

      const cKey = this.normalizeKey(pl.country);
      if (!this.countryMap.has(cKey)) {
        this.countryMap.set(cKey, { cities: [], global: [], plans: [] });
      }
      this.countryMap.get(cKey)!.plans.push(pl);
    });
  }

  /**
   * Levenshtein Distance for fuzzy matching
   */
  private levenshtein(a: string, b: string): number {
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
  }

  /**
   * Primary Search & Retrieval: Finds exact or fuzzy matches across all integrated datasets.
   */
  public lookup(query: string): DatasetLookupResult | null {
    if (!query || typeof query !== 'string') return null;
    const clean = query.trim().toLowerCase();
    const cleanKey = this.normalizeKey(clean);

    // 1. Direct City match
    if (this.citiesMap.has(cleanKey)) {
      const city = this.citiesMap.get(cleanKey)!;
      return this.buildCityResult(city);
    }

    // 2. Direct Attraction match
    if (this.attractionsMap.has(cleanKey)) {
      const attraction = this.attractionsMap.get(cleanKey)!;
      return this.buildAttractionResult(attraction);
    }

    // 3. Direct Travel Plan match
    if (this.travelPlansMap.has(cleanKey)) {
      const plans = this.travelPlansMap.get(cleanKey)!;
      return this.buildTravelPlanResult(plans[0].destinationName, plans);
    }

    // 4. Direct Global Destination match
    if (this.globalDestMap.has(cleanKey)) {
      const global = this.globalDestMap.get(cleanKey)!;
      return this.buildGlobalResult(global);
    }

    // 5. Country match
    if (this.countryMap.has(cleanKey)) {
      const countryGroup = this.countryMap.get(cleanKey)!;
      return this.buildCountryResult(clean, countryGroup);
    }

    // 6. Substring match across all entities
    for (const item of this.allSearchableEntities) {
      if (item.name.toLowerCase().includes(clean) || clean.includes(item.name.toLowerCase())) {
        if (item.type === 'city') return this.buildCityResult(item.ref);
        if (item.type === 'attraction') return this.buildAttractionResult(item.ref);
        if (item.type === 'plan') return this.buildTravelPlanResult(item.name, this.travelPlansMap.get(item.key) || [item.ref]);
        if (item.type === 'global') return this.buildGlobalResult(item.ref);
      }
    }

    // 7. Fuzzy match (Levenshtein distance <= 2 for words >= 4 chars, <= 1 for 3 chars)
    let bestCandidate: typeof this.allSearchableEntities[0] | null = null;
    let minDistance = Infinity;

    for (const item of this.allSearchableEntities) {
      const maxAllowed = item.name.length <= 4 ? 1 : 2;
      const dist = this.levenshtein(cleanKey, item.key);
      if (dist <= maxAllowed && dist < minDistance) {
        minDistance = dist;
        bestCandidate = item;
      }
    }

    if (bestCandidate) {
      if (bestCandidate.type === 'city') return this.buildCityResult(bestCandidate.ref);
      if (bestCandidate.type === 'attraction') return this.buildAttractionResult(bestCandidate.ref);
      if (bestCandidate.type === 'plan') {
        return this.buildTravelPlanResult(bestCandidate.name, this.travelPlansMap.get(bestCandidate.key) || [bestCandidate.ref]);
      }
      if (bestCandidate.type === 'global') return this.buildGlobalResult(bestCandidate.ref);
    }

    return null;
  }

  private buildCityResult(city: VerifiedCity): DatasetLookupResult {
    const plans = this.travelPlansMap.get(this.normalizeKey(city.city));
    const sightsCount = city.touristPlaces?.length || 0;
    const foodCount = city.foodRecommendations?.length || 0;

    let summaryText = `### 📍 ${city.city}, ${city.state} (Zone: ${city.zone})\n\n`;
    if (city.description) {
      summaryText += `${city.description}\n\n`;
    }
    summaryText += `* **Holidify Tourist Rating:** ${city.holidifyRating ? `⭐ ${city.holidifyRating} / 5.0` : 'Not specified in dataset'}\n`;
    summaryText += `* **Best Time to Visit:** ${city.bestTimeToVisit || 'Available across peak seasons'}\n`;
    summaryText += `* **Verified Attractions on Record:** ${sightsCount} attractions\n`;
    summaryText += `* **Verified Food & Dining Places:** ${foodCount} recommendations\n\n`;

    if (sightsCount > 0) {
      summaryText += `#### 🏛️ Top Verified Tourist Places:\n`;
      city.touristPlaces.slice(0, 5).forEach((p) => {
        summaryText += `• **${p.placeName}** (${p.placeType}) — Rating: ⭐ ${p.googleRating || 'N/A'}, Entry: ₹${p.entranceFeeINR}, Timing: ${p.visitDurationHours || 1.5} hrs, Weekly Off: ${p.weeklyOff}\n`;
      });
      summaryText += `\n`;
    }

    if (foodCount > 0) {
      summaryText += `#### 🍴 Verified Food & Culinary Recommendations:\n`;
      city.foodRecommendations.slice(0, 5).forEach((f) => {
        summaryText += `• **${f.name}** — *${f.meal}* (${f.type})\n`;
      });
      summaryText += `\n`;
    }

    return {
      found: true,
      matchType: 'city',
      primaryName: city.city,
      canonicalDestination: city.city,
      country: 'India',
      state: city.state,
      cityData: city,
      travelPlans: plans,
      verifiedInDataset: true,
      provenance: `Verified Datasets: ${city.sourceDatasets || 'city_information.csv, tourist_places.csv, food_recommendations.csv'}`,
      summaryText,
    };
  }

  private buildAttractionResult(attraction: VerifiedAttraction): DatasetLookupResult {
    const parentCity = attraction.city ? this.citiesMap.get(this.normalizeKey(attraction.city)) : undefined;

    let summaryText = `### 🏛️ ${attraction.placeName} — ${attraction.city || 'India'}, ${attraction.state}\n\n`;
    summaryText += `**Type & Significance:** ${attraction.placeType} • ${attraction.significance}\n\n`;
    summaryText += `* **Google Rating:** ⭐ ${attraction.googleRating || 'N/A'} (${attraction.googleReviewsLakhs ? `${attraction.googleReviewsLakhs} Lakh reviews` : 'Verified place'})\n`;
    summaryText += `* **Entrance Fee:** ₹${attraction.entranceFeeINR} ${attraction.entranceFeeINR === 0 ? '(Free Entry)' : 'per person'}\n`;
    summaryText += `* **Establishment / Historical Era:** ${attraction.establishmentYear ? `Established in ${attraction.establishmentYear}` : 'Heritage landmark'}\n`;
    summaryText += `* **Visit Duration:** ~${attraction.visitDurationHours || 1.5} hours recommended\n`;
    summaryText += `* **Best Time to Visit:** ${attraction.bestTimeToVisit || 'Daytime'}\n`;
    summaryText += `* **Weekly Schedule:** ${attraction.weeklyOff}\n`;
    summaryText += `* **DSLR Camera Allowed:** ${attraction.dslrAllowed ? '✅ Yes' : '❌ Restricted'}\n`;
    summaryText += `* **Nearest Airport:** ${attraction.airportWithin50km ? 'Within 50 km' : 'More than 50 km'}\n\n`;

    if (parentCity) {
      summaryText += `> **Located in ${parentCity.city}:** ${parentCity.description?.substring(0, 180)}...\n\n`;
    }

    return {
      found: true,
      matchType: 'attraction',
      primaryName: attraction.placeName,
      canonicalDestination: attraction.city || attraction.placeName,
      country: 'India',
      state: attraction.state,
      attractionData: attraction,
      cityData: parentCity,
      verifiedInDataset: true,
      provenance: `Verified Dataset: Top Indian Places to Visit (${attraction.sourceDataset || 'tourist_places.csv'})`,
      summaryText,
    };
  }

  private buildTravelPlanResult(destName: string, plans: VerifiedTravelPlan[]): DatasetLookupResult {
    const p = plans[0];
    let summaryText = `### ✈️ Travel Blueprint for ${p.destinationName} (${p.country})\n\n`;
    summaryText += `**Destination Classification:** ${p.destinationType} • Local Currency: **${p.localCurrency}** (1 ${p.localCurrency} = $${p.exchangeRateToUSD || 'N/A'} USD)\n\n`;
    summaryText += `* **Recommended Stay Duration:** **${p.recommendedStayDays} Days**\n`;
    summaryText += `* **Best Season to Visit:** ${p.bestSeason} (Peak Multiplier: ${p.peakSeasonCostMultiplier}x)\n`;
    summaryText += `* **Flight / Transit from ${p.startingPoint}:** ~$${p.flightTransportCostUSD || 'N/A'} USD (${p.travelDurationHours || 'N/A'} hrs via ${p.travelMode})\n`;
    summaryText += `* **Accommodation Cost:** ~$${p.accommodationCostPerNightUSD || 'N/A'} USD/night (${p.accommodationOptions.join(', ') || 'Hotels, Stays'})\n`;
    summaryText += `* **Daily Food Cost:** ~$${p.foodCostPerDayUSD || 'N/A'} USD/day (${p.foodOptions.join(', ') || 'Local dining'})\n`;
    summaryText += `* **Activities & Sights:** ~$${p.activityCostUSD || 0} USD (${p.topAttractions.join(', ') || 'Main sights'})\n`;
    summaryText += `* **Visa Status:** ${p.visaRequired ? `Required (~$${p.visaCostUSD} USD)` : 'Visa Free / On Arrival'}\n`;
    summaryText += `* **Misc Daily Reserve:** ~$${p.miscellaneousCostUSD || 20} USD\n\n`;

    return {
      found: true,
      matchType: 'travel_plan',
      primaryName: p.destinationName,
      canonicalDestination: p.destinationName,
      country: p.country,
      travelPlans: plans,
      verifiedInDataset: true,
      provenance: 'Verified Dataset: Travel_Planner_Dataset.csv (1,025 verified itinerary plans)',
      summaryText,
    };
  }

  private buildGlobalResult(global: VerifiedGlobalDestination): DatasetLookupResult {
    const plans = this.travelPlansMap.get(this.normalizeKey(global.name));

    let summaryText = `### 🌍 ${global.name} — ${global.country} (${global.continent})\n\n`;
    summaryText += `* **Destination Type:** ${global.type}\n`;
    summaryText += `* **Estimated Average Daily Cost:** ~$${global.avgCostUSDPerDay ? `${global.avgCostUSDPerDay} USD/day` : 'N/A'}\n`;
    summaryText += `* **Best Travel Season:** ${global.bestSeason}\n`;
    summaryText += `* **Traveller Rating:** ⭐ ${global.avgRating ? `${global.avgRating} / 5.0` : 'N/A'}\n`;
    summaryText += `* **Annual Tourist Volume:** ${global.annualVisitorsMillion ? `${global.annualVisitorsMillion} Million visitors/year` : 'N/A'}\n`;
    summaryText += `* **UNESCO World Heritage Status:** ${global.unescoSite ? '🏆 Recognized UNESCO World Heritage Site' : 'No'}\n\n`;

    return {
      found: true,
      matchType: 'global_destination',
      primaryName: global.name,
      canonicalDestination: global.name,
      country: global.country,
      globalData: global,
      travelPlans: plans,
      verifiedInDataset: true,
      provenance: 'Verified Dataset: Tourist_Destinations.csv (2,000 global destinations)',
      summaryText,
    };
  }

  private buildCountryResult(
    countryName: string,
    group: { cities: VerifiedCity[]; global: VerifiedGlobalDestination[]; plans: VerifiedTravelPlan[] }
  ): DatasetLookupResult {
    let summaryText = `### 🗺️ Verified Destinations in ${countryName.toUpperCase()}\n\n`;
    summaryText += `Our verified knowledge base contains records for destinations across **${countryName}**:\n\n`;

    if (group.cities.length > 0) {
      summaryText += `#### 🏙️ Key Cities on Record (${group.cities.length} cities):\n`;
      summaryText += group.cities.slice(0, 10).map((c) => `• **${c.city}** (${c.state}): ⭐ ${c.holidifyRating || 'N/A'}`).join('\n');
      summaryText += `\n\n`;
    }

    if (group.global.length > 0) {
      summaryText += `#### 🌟 Notable Tourist Sights (${group.global.length} destinations):\n`;
      summaryText += group.global.slice(0, 10).map((g) => `• **${g.name}** (${g.type}): ~$${g.avgCostUSDPerDay || 'N/A'}/day, Best: ${g.bestSeason}`).join('\n');
      summaryText += `\n\n`;
    }

    return {
      found: true,
      matchType: 'country',
      primaryName: countryName,
      canonicalDestination: countryName,
      country: countryName,
      travelPlans: group.plans,
      verifiedInDataset: true,
      provenance: 'Verified Datasets: Global Tourist Destinations & City Information',
      summaryText,
    };
  }

  /**
   * Helper to return all cities in dataset
   */
  public getAllCities(): VerifiedCity[] {
    return Array.from(this.citiesMap.values());
  }

  /**
   * Helper to return all attractions in a specific city
   */
  public getAttractionsInCity(cityName: string): VerifiedAttraction[] {
    const city = this.citiesMap.get(this.normalizeKey(cityName));
    return city?.touristPlaces || [];
  }

  /**
   * Helper to return all food recommendations in a specific city
   */
  public getFoodInCity(cityName: string): VerifiedFoodItem[] {
    const city = this.citiesMap.get(this.normalizeKey(cityName));
    return city?.foodRecommendations || [];
  }

  /**
   * Get metadata summary
   */
  public getMetadata() {
    return datasetData.metadata;
  }
}

export const datasetService = new DatasetService();
