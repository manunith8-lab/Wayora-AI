import { DESTINATIONS, TRAVEL_PACKAGES, HOTELS } from '../data/destinationsData';
import { Destination, SupportedLanguage } from '../types/travel';
import { placesService, DestinationDiscoveryResult } from './placesService';
import { travelPlanService } from './travelPlanService';
import { authService } from './authService';
import { getCanonicalDestination, CANONICAL_DESTINATIONS } from '../data/canonicalKnowledge';
import { indiaGeoService } from './indiaGeoService';
import { locationRecognitionEngine, RecognizedLocation } from './locationRecognitionEngine';
import { destinationInfoEngine } from './destinationInfoEngine';
import { usageMonitorService } from './usageMonitorService';
import { datasetService, DatasetLookupResult } from './datasetService';

export interface AIResponse {
  text: string;
  intent: 'general' | 'destination' | 'package' | 'hotel' | 'itinerary' | 'comparison' | 'budget' | 'food';
  destinationFound?: Destination | { id: string; name: string; country?: string };
  destinationMentioned?: string;
  cards?: {
    type: 'destinations' | 'packages' | 'packageComparison' | 'hotels' | 'itinerary' | 'weather' | 'attractions' | 'discovery' | 'foodDiscovery' | 'travelPlan';
    data: any;
  };
  suggestedFollowUps?: string[];
  liveDataLoaded?: boolean;
}

export interface ConversationContext {
  destination?: Destination;
  destinationName?: string;
  parentRegion?: string;
  geographicType?: 'country' | 'state_region' | 'city_destination' | 'attraction';
  days?: number;
  budgetUSD?: number;
  travelers?: number;
  tierPreference?: 'budget' | 'standard' | 'luxury';
  travelDates?: string;
  departureCity?: string;
}

// Destination extraction with hierarchy and pronoun resolution
export function extractDestinationName(query: string, context?: ConversationContext): string | null {
  const lower = query.toLowerCase().trim();

  // 1. Contextual Pronouns and Follow-up patterns ("there", "near there", "what about food", "what if I have only 3 days")
  const isContextualFollowUp =
    lower.includes('there') ||
    lower.includes('that place') ||
    lower.includes('around it') ||
    lower.includes('nearby') ||
    lower.startsWith('what if i have') ||
    lower.startsWith('what if we have') ||
    lower.startsWith('what will it cost') ||
    lower.startsWith('how much will it cost') ||
    lower.startsWith('what is the cost') ||
    lower.startsWith('suggest cheaper') ||
    lower.startsWith('cheaper hotels') ||
    lower.startsWith('places for photography') ||
    lower.startsWith('best photography') ||
    lower === 'what about food' ||
    lower === 'what about food?' ||
    lower === 'food' ||
    lower === 'hotels' ||
    lower === 'what about hotels' ||
    lower === 'what about hotels?' ||
    lower === 'famous places' ||
    lower === 'show me the famous places' ||
    lower === 'show me hidden gems' ||
    lower.startsWith('show me hidden gems');

  if (isContextualFollowUp && context?.destinationName) {
    return context.destinationName;
  }

  // 2. Landmark triggers mapped to canonical destinations
  if (lower.includes('rohtang') || lower.includes('solang') || lower.includes('hadimba') || lower.includes('atal tunnel') || lower.includes('vashisht')) {
    return 'Manali';
  }
  if (lower.includes('eravikulam') || lower.includes('mattupetty') || lower.includes('top station')) {
    return 'Munnar';
  }
  if (lower.includes('eiffel') || lower.includes('louvre') || lower.includes('versailles') || lower.includes('montmartre')) {
    return 'Paris';
  }
  if (lower.includes('fuji') || lower.includes('shibuya') || lower.includes('senso-ji')) {
    return 'Tokyo';
  }
  if (lower.includes('burj khalifa')) {
    return 'Dubai';
  }
  if (lower.includes('colosseum') || lower.includes('vatican') || lower.includes('trevi')) {
    return 'Rome';
  }

  // 3. Check for specific destination switch ("what about bali", "now plan for tokyo")
  const switchMatch = lower.match(/(?:what about|now plan for|switch to|how about|what of)\s+([a-zA-Z\s]+)/i);
  if (switchMatch && switchMatch[1]) {
    const candidate = switchMatch[1].replace(/[?.!]/g, '').trim();
    if (candidate.length > 2) {
      return candidate.charAt(0).toUpperCase() + candidate.slice(1);
    }
  }

  // 4. Canonical Knowledge Direct Match
  const canonicalDirect = getCanonicalDestination(lower);
  if (canonicalDirect) {
    return canonicalDirect.name;
  }

  // 5. Check all canonical destinations and aliases inside query text
  for (const [key, dest] of Object.entries(CANONICAL_DESTINATIONS)) {
    if (lower.includes(key) || lower.includes(dest.name.toLowerCase())) {
      return dest.name;
    }
    if (dest.aliases.some((a) => lower.includes(a))) {
      return dest.name;
    }
    if (dest.subDestinations) {
      for (const sub of dest.subDestinations) {
        if (lower.includes(sub.name.toLowerCase()) || lower.includes(sub.id)) {
          return sub.name;
        }
      }
    }
  }

  // 6. Check India-Wide Gazetteer (States, Union Territories, Thematic Searches, Cities)
  const indiaMatch = indiaGeoService.searchIndia(lower);
  if (indiaMatch) {
    return indiaMatch.name;
  }

  // 7. Check known curated destinations list
  for (const d of DESTINATIONS) {
    if (lower.includes(d.id) || lower.includes(d.name.toLowerCase()) || lower.includes(d.country.toLowerCase())) {
      return d.name;
    }
  }

  // 7. Regex patterns for dynamic places (e.g. "visit Kozhikode", "places in Munnar", "trip to Goa")
  const patterns = [
    /(?:in|to|explore|visit|around|near|about)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)(?:\?|\.|$|\s+for|\s+under|\s+with)/i,
    /(?:trip to|travel to|vacation in|places in|hotels in|food in|attractions in|itinerary for|plan for)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/i,
    /([a-zA-Z]+)\s+(?:itinerary|packages|attractions|hotels|restaurants|food|trip|plan)/i,
  ];

  for (const pat of patterns) {
    const match = query.match(pat);
    if (match && match[1]) {
      const candidate = match[1].trim();
      const stopwords = [
        'the', 'my', 'a', 'an', 'some', 'me', 'our', 'cheap', 'budget', 'luxury', 
        'best', 'top', 'good', 'affordable', 'hidden', 'famous', 'there', 'it', 
        'december', 'january', 'winter', 'summer', '3 days', 'only 3 days'
      ];
      if (!stopwords.includes(candidate.toLowerCase()) && candidate.length > 2) {
        return candidate.charAt(0).toUpperCase() + candidate.slice(1);
      }
    }
  }

  // 8. Fallback to conversation context
  if (context?.destinationName) return context.destinationName;
  if (context?.destination?.name) return context.destination.name;

  return null;
}

export async function processUserQuery(
  rawQuery: string,
  context: ConversationContext = {},
  language: SupportedLanguage = 'en'
): Promise<AIResponse> {
  const query = rawQuery.toLowerCase().trim();

  // 1. Identify destination (with context preservation)
  let destinationName = extractDestinationName(rawQuery, context);
  let recognizedLoc: RecognizedLocation | null = null;
  let spellingNotice = '';

  const candidate = locationRecognitionEngine.extractLocationCandidate(rawQuery);
  const targetToRecognize = destinationName || (candidate.length > 2 ? candidate : null);

  // 1a. Check Primary Verified Dataset Knowledge Base (4,233+ verified records)
  const datasetMatch = datasetService.lookup(targetToRecognize || rawQuery);
  if (datasetMatch && datasetMatch.found) {
    destinationName = datasetMatch.canonicalDestination;
  }

  // 1b. If not resolved or if checking for typos/phonetics, query Universal Location Recognition Engine
  if (targetToRecognize) {
    try {
      recognizedLoc = await locationRecognitionEngine.recognizeLocation(targetToRecognize);
      if (recognizedLoc) {
        destinationName = destinationName || recognizedLoc.canonicalName;
        if (
          recognizedLoc.correctedSpelling &&
          recognizedLoc.correctedSpelling.toLowerCase() !== rawQuery.toLowerCase() &&
          recognizedLoc.correctedSpelling.toLowerCase() !== candidate.toLowerCase()
        ) {
          spellingNotice = `> 💡 Showing results for **${recognizedLoc.canonicalName}** (corrected from *"${candidate}"*)\n\n`;
        }
      }
    } catch (e) {
      console.warn('Universal location recognition failed:', e);
    }
  }

  // 1c. Handle Disambiguation when multiple geographical locations match across different regions (e.g., "Springfield", "Hyderabad")
  if (!datasetMatch?.found && recognizedLoc && recognizedLoc.isDisambiguationNeeded && recognizedLoc.disambiguationOptions && recognizedLoc.disambiguationOptions.length > 1 && !context.destinationName) {
    const optionsList = recognizedLoc.disambiguationOptions
      .slice(0, 4)
      .map((opt, i) => `${i + 1}. **${opt.name}** — *${opt.state ? `${opt.state}, ` : ''}${opt.country}* (${opt.geographicType})`)
      .join('\n');
    
    const disambiguationFollowUps = recognizedLoc.disambiguationOptions
      .slice(0, 4)
      .map((opt) => `Plan a trip to ${opt.name}, ${opt.country}`);

    return {
      text: `### 🧭 Multiple Locations Found for "${rawQuery}"\n\nI discovered several recognised places matching **${recognizedLoc.canonicalName}**. Which destination would you like to explore?\n\n${optionsList}\n\n*Select or reply with your preferred location to get a full travel blueprint:*`,
      intent: 'general',
      suggestedFollowUps: disambiguationFollowUps,
      liveDataLoaded: true,
    };
  }

  // 2. Extract days if specified (e.g., "only 3 days", "3-day itinerary", "5 days")
  const daysMatch = query.match(/(\d+)\s*[- ]*(day|days|night|nights)/);
  const detectedDays = daysMatch ? parseInt(daysMatch[1], 10) : (context.days || 4);

  // ==========================================
  // SCENARIO 00: DIRECT VERIFIED ATTRACTION LOOKUP FROM DATASET
  // E.g., "Taj Mahal", "India Gate", "Qutub Minar", "Hawa Mahal", "Humayun's Tomb", "Mysore Palace"
  // ==========================================
  if (datasetMatch && datasetMatch.matchType === 'attraction' && datasetMatch.attractionData) {
    const attr = datasetMatch.attractionData;
    const plan = await travelPlanService.generateTravelPlan(attr.city || attr.placeName, detectedDays);
    return {
      text: `${spellingNotice}${datasetMatch.summaryText}\n*Data Source: ${datasetMatch.provenance}*`,
      intent: 'destination',
      destinationFound: { id: attr.placeId, name: attr.placeName, country: 'India' },
      destinationMentioned: attr.city || attr.placeName,
      cards: {
        type: 'travelPlan',
        data: plan,
      },
      suggestedFollowUps: [
        `What other tourist places to visit in ${attr.city || 'the area'}?`,
        `What is the famous food in ${attr.city || 'the area'}?`,
        `What will a trip to ${attr.city || attr.placeName} cost?`,
        `Plan a ${detectedDays}-day itinerary for ${attr.city || attr.placeName}`,
      ],
      liveDataLoaded: true,
    };
  }

  // ==========================================
  // SCENARIO 0: INDIA-WIDE THEMATIC QUERIES
  // E.g., "Find waterfalls across India", "Show beaches in India", "Hill stations in India", "Forts across India", "National parks in India", "Spiritual destinations"
  // ==========================================
  const indiaThematic = indiaGeoService.searchIndia(rawQuery);
  if (indiaThematic && indiaThematic.type === 'thematic_list') {
    const discovery = await placesService.discoverDestination(rawQuery);
    return {
      text: `### 🇮🇳 ${indiaThematic.name}\n\n${indiaThematic.summary}\n\nHere are the top highlighted destinations discovered across India:`,
      intent: 'destination',
      destinationFound: { id: 'india_thematic', name: indiaThematic.name, country: 'India' },
      destinationMentioned: indiaThematic.name,
      cards: {
        type: 'discovery',
        data: discovery,
      },
      suggestedFollowUps: [
        'Find waterfalls across India',
        'Show beaches in India',
        'Discover hill stations across India',
        'Explore historical forts and palaces',
        'Find wildlife destinations and tiger reserves',
        'Sacred spiritual and temple destinations',
      ],
      liveDataLoaded: true,
    };
  }

  // ==========================================
  // SCENARIO A: SEASONAL ACCESSIBILITY / WEATHER INQUIRY
  // E.g., "Can I visit Rohtang in December?", "Rohtang Pass in winter"
  // ==========================================
  const isSeasonalQuery = 
    (query.includes('december') || query.includes('winter') || query.includes('january') || query.includes('snow') || query.includes('season') || query.includes('weather')) &&
    (query.includes('rohtang') || query.includes('visit') || query.includes('open') || query.includes('accessible') || query.includes('pass'));

  if (isSeasonalQuery && (query.includes('rohtang') || destinationName?.toLowerCase() === 'manali')) {
    return {
      text: `### ❄️ Rohtang Pass Winter Travel Advisory (December - May)

**No, Rohtang Pass is closed to tourist vehicles in December.**

Here is the practical reality and alternatives for winter travellers:
- **Official Closure:** The Border Roads Organisation (BRO) officially shuts Rohtang Pass (13,058 ft) around late November or early December each year due to severe blizzards, heavy snow accumulation, and sub-zero black ice.
- **Top Winter Alternative (Atal Tunnel & Sissu):** You can easily take the world-record **Atal Tunnel (Rohtang)** at 10,000 ft, which stays open year-round. This brings you directly to the snowy wonderland of **Sissu and Lahaul Valley** in about 45 minutes from Manali!
- **Snow Activities (Solang Valley):** For skiing, tube rides, snowboarding, and snowmobiles, head to **Solang Valley** (14 km from Manali), fully accessible in December.
- **Essential Tip:** Rent a 4x4 vehicle with snow chains if heading past Solang towards Atal Tunnel after fresh snowfall.`,
      intent: 'general',
      destinationFound: { id: 'manali', name: 'Manali', country: 'India' },
      destinationMentioned: 'Manali',
      suggestedFollowUps: [
        'Show 3-day winter itinerary for Manali',
        'Find hotels in Old Manali',
        'What food to try in Manali?',
        'Suggest budget stays in Manali',
      ],
      liveDataLoaded: true,
    };
  }

  // ==========================================
  // SCENARIO B: PHOTOGRAPHY SPOTS INQUIRY
  // E.g., "Places for photography in Paris", "Best photography spots"
  // ==========================================
  const isPhotographyQuery = 
    query.includes('photography') || 
    query.includes('camera') || 
    query.includes('photo spot') || 
    query.includes('instagram') ||
    query.includes('vantage point');

  if (isPhotographyQuery && destinationName) {
    const plan = await travelPlanService.generateTravelPlan(destinationName, detectedDays);
    const spots = plan.photographySpots || [];

    const spotsList = spots.length > 0
      ? spots.map(s => `• **${s.spot}** (${s.bestTime}): ${s.tip}`).join('\n')
      : `• **Historic Center & Old Town**: Early morning (7:00 AM – 9:00 AM) for golden soft light without tour crowds.\n• **High Vantage Viewpoints**: Sunset & twilight for panoramic skyline silhouettes.\n• **Riverside or Promenade**: Blue hour reflections on the water.`;

    return {
      text: `### 📸 Premier Photography Spots in ${plan.destinationName}

Capture iconic angles and optimal lighting across **${plan.destinationName}**:

${spotsList}

*Tip: Golden Hour (sunrise and the 45 minutes before sunset) offers the finest soft illumination and minimal crowd obstruction.*`,
      intent: 'destination',
      destinationFound: { id: plan.destinationId, name: plan.destinationName, country: plan.country },
      destinationMentioned: plan.destinationName,
      cards: {
        type: 'travelPlan',
        data: plan,
      },
      suggestedFollowUps: [
        `What will a trip to ${plan.destinationName} cost?`,
        `What if I have only 3 days in ${plan.destinationName}?`,
        `Where to eat authentic food in ${plan.destinationName}`,
      ],
      liveDataLoaded: true,
    };
  }

  // ==========================================
  // SCENARIO C: FOOD & RESTAURANT INTENT
  // E.g., "What about food?", "Famous food in Paris", "Where to eat in Manali"
  // ==========================================
  const isFoodQuery =
    query.includes('food') ||
    query.includes('eat') ||
    query.includes('restaurant') ||
    query.includes('dining') ||
    query.includes('biryani') ||
    query.includes('sushi') ||
    query.includes('halwa') ||
    query.includes('cuisine') ||
    query.includes('dishes') ||
    query.includes('cafes') ||
    query.includes('trout') ||
    query.includes('siddu');

  if (isFoodQuery && destinationName) {
    const dsCity = datasetService.lookup(destinationName);
    if (dsCity && dsCity.cityData && dsCity.cityData.foodRecommendations && dsCity.cityData.foodRecommendations.length > 0) {
      const foodItems = dsCity.cityData.foodRecommendations;
      const foodList = foodItems.map((f) => `• **${f.name}** — *${f.meal}* (${f.type})`).join('\n');
      return {
        text: `### 🍴 Verified Culinary Guide for ${dsCity.primaryName}

Here are the signature regional dishes and dining venues verified in our integrated tourism datasets:

${foodList}

*Source: ${dsCity.provenance}*`,
        intent: 'food',
        destinationFound: { id: destinationName.toLowerCase(), name: dsCity.primaryName, country: dsCity.country },
        destinationMentioned: dsCity.primaryName,
        cards: {
          type: 'foodDiscovery',
          data: await placesService.discoverDestination(destinationName),
        },
        suggestedFollowUps: [
          `Plan a ${detectedDays}-day trip to ${dsCity.primaryName}`,
          `What are the top attractions in ${dsCity.primaryName}?`,
          `What will it cost to visit ${dsCity.primaryName}?`,
        ],
        liveDataLoaded: true,
      };
    }

    const discovery = await placesService.discoverDestination(destinationName);

    return {
      text: `### 🍴 Culinary Guide for ${discovery.destination}

Here are the signature regional dishes and authentic dining venues in **${discovery.destination}**:

I have curated local street staples, traditional culinary favorites, and recommended dining spots below:`,
      intent: 'food',
      destinationFound: { id: destinationName.toLowerCase(), name: discovery.destination, country: discovery.country },
      destinationMentioned: discovery.destination,
      cards: {
        type: 'foodDiscovery',
        data: discovery,
      },
      suggestedFollowUps: [
        `Plan a ${detectedDays}-day trip to ${discovery.destination}`,
        `What will it cost to visit ${discovery.destination}?`,
        `Suggest cheaper hotels in ${discovery.destination}`,
      ],
      liveDataLoaded: true,
    };
  }

  // ==========================================
  // SCENARIO D: HOTEL & ACCOMMODATION INTENT
  // E.g., "Suggest cheaper hotels", "Where to stay in Paris", "Hostels in Manali"
  // ==========================================
  const isHotelQuery =
    query.includes('hotel') ||
    query.includes('stay') ||
    query.includes('resort') ||
    query.includes('hostel') ||
    query.includes('accommodation') ||
    query.includes('lodging') ||
    query.includes('where to stay');

  if (isHotelQuery && destinationName) {
    const plan = await travelPlanService.generateTravelPlan(destinationName, detectedDays);
    const curatedHotels = HOTELS.filter(
      (h) => h.destinationName.toLowerCase() === destinationName.toLowerCase()
    );

    const isCheapQuery = query.includes('cheap') || query.includes('budget') || query.includes('hostel') || query.includes('affordable');

    let hotelAdvice = `### 🏨 Accommodation Guide for ${plan.destinationName}

`;
    if (isCheapQuery) {
      const budgetNh = plan.neighborhoodGuides[0];
      hotelAdvice += `For **budget-conscious travellers**, the best area to stay is **${budgetNh?.name || 'Central Transit Hub'}** (~$${budgetNh?.avgPricePerNightUSD || 35}/night).\n- **Vibe:** ${budgetNh?.vibe || 'Walkable, hostel-friendly, with great street dining'}\n- **Top Stays:** Look for social backpacker hostels or family-run guesthouses along metro/transit routes.`;
    } else {
      hotelAdvice += `Recommended areas to stay based on your travel style:
${plan.neighborhoodGuides.map(nh => `• **${nh.name}** (~$${nh.avgPricePerNightUSD}/night) - *${nh.bestFor}*: ${nh.vibe}`).join('\n')}`;
    }

    return {
      text: hotelAdvice,
      intent: 'hotel',
      destinationFound: { id: plan.destinationId, name: plan.destinationName, country: plan.country },
      destinationMentioned: plan.destinationName,
      cards: curatedHotels.length > 0 ? {
        type: 'hotels',
        data: curatedHotels,
      } : {
        type: 'travelPlan',
        data: plan,
      },
      suggestedFollowUps: [
        `What will a trip to ${plan.destinationName} cost?`,
        `Plan a ${detectedDays}-day itinerary for ${plan.destinationName}`,
        `What food is famous in ${plan.destinationName}?`,
      ],
      liveDataLoaded: true,
    };
  }

  // ==========================================
  // SCENARIO E: BUDGET & COST INQUIRY
  // E.g., "What will it cost?", "How much budget do I need?", "Cost breakdown"
  // ==========================================
  const isBudgetQuery =
    query.includes('cost') ||
    query.includes('budget') ||
    query.includes('expense') ||
    query.includes('how much') ||
    query.includes('price');

  if (isBudgetQuery && destinationName) {
    const dsPlan = datasetService.lookup(destinationName);
    if (dsPlan && dsPlan.travelPlans && dsPlan.travelPlans.length > 0) {
      const pl = dsPlan.travelPlans[0];
      return {
        text: `### 💰 Verified Travel Cost Breakdown for ${pl.destinationName} (${detectedDays} Days)

From our verified travel planner dataset (originating from **${pl.startingPoint}**):

1. **✈️ Transit & Flights:** ~$${pl.flightTransportCostUSD || 'N/A'} USD (${pl.travelDurationHours || 'N/A'} hrs via ${pl.travelMode})
2. **🏨 Accommodation:** ~$${pl.accommodationCostPerNightUSD || 'N/A'} USD/night (${pl.accommodationOptions.join(', ')})
3. **🍴 Daily Food:** ~$${pl.foodCostPerDayUSD || 'N/A'} USD/day (${pl.foodOptions.join(', ')})
4. **🎟️ Activities & Sights:** ~$${pl.activityCostUSD || 'N/A'} USD (${pl.topAttractions.join(', ')})
5. **🛂 Visa Requirements:** ${pl.visaRequired ? `Required (~$${pl.visaCostUSD} USD)` : 'Visa Free / On Arrival'}
6. **💵 Local Currency:** **${pl.localCurrency}** (Exchange rate: 1 ${pl.localCurrency} = $${pl.exchangeRateToUSD} USD)
7. **📊 Recommended Stay:** ${pl.recommendedStayDays} days (Peak season multiplier: ${pl.peakSeasonCostMultiplier}x in ${pl.bestSeason})

*Source: ${dsPlan.provenance}*`,
        intent: 'budget',
        destinationFound: { id: destinationName.toLowerCase(), name: pl.destinationName, country: pl.country },
        destinationMentioned: pl.destinationName,
        cards: {
          type: 'travelPlan',
          data: await travelPlanService.generateTravelPlan(destinationName, detectedDays),
        },
        suggestedFollowUps: [
          `What if I have only 3 days in ${pl.destinationName}?`,
          `Suggest cheaper hotels in ${pl.destinationName}`,
          `Show iconic attractions in ${pl.destinationName}`,
        ],
        liveDataLoaded: true,
      };
    }

    const plan = await travelPlanService.generateTravelPlan(destinationName, detectedDays);
    const b = plan.costTiers.budget;
    const m = plan.costTiers.midRange;
    const l = plan.costTiers.luxury;

    return {
      text: `### 💰 Realistic Travel Cost Breakdown for ${plan.destinationName} (${plan.planDurationDays} Days)

Here are estimated daily and trip costs per person (excluding international flights):

1. **🎒 Budget Explorer (~$${b.perDayPerPersonUSD}/day • Total: $${b.totalPerPersonUSD})**
   - Stay: ~$${b.breakdown.accommodationPerDayUSD}/night (${b.accommodationExample})
   - Food: ~$${b.breakdown.foodPerDayUSD}/day (${b.diningStyle})
   - Transit: ~$${b.breakdown.localTransitPerDayUSD}/day

2. **✨ Comfort & Value (~$${m.perDayPerPersonUSD}/day • Total: $${m.totalPerPersonUSD})**
   - Stay: ~$${m.breakdown.accommodationPerDayUSD}/night (${m.accommodationExample})
   - Food: ~$${m.breakdown.foodPerDayUSD}/day (${m.diningStyle})
   - Transit: ~$${m.breakdown.localTransitPerDayUSD}/day

3. **💎 Luxury & Indulgence (~$${l.perDayPerPersonUSD}/day • Total: $${l.totalPerPersonUSD})**
   - Stay: ~$${l.breakdown.accommodationPerDayUSD}/night (${l.accommodationExample})
   - Food: ~$${l.breakdown.foodPerDayUSD}/day (${l.diningStyle})
   - Transit: ~$${l.breakdown.localTransitPerDayUSD}/day`,
      intent: 'budget',
      destinationFound: { id: plan.destinationId, name: plan.destinationName, country: plan.country },
      destinationMentioned: plan.destinationName,
      cards: {
        type: 'travelPlan',
        data: plan,
      },
      suggestedFollowUps: [
        `What if I have only 3 days in ${plan.destinationName}?`,
        `Suggest cheaper hotels in ${plan.destinationName}`,
        `Show iconic attractions in ${plan.destinationName}`,
      ],
      liveDataLoaded: true,
    };
  }

  // ==========================================
  // SCENARIO F: DURATION RESLICING
  // E.g., "What if I have only 3 days?", "Make it 2 days", "Plan 4 days"
  // ==========================================
  const isResliceQuery = query.includes('only') || query.includes('what if i have') || query.match(/\b\d+\s*days?\b/);

  if (isResliceQuery && destinationName && daysMatch) {
    const plan = await travelPlanService.generateTravelPlan(destinationName, detectedDays);

    return {
      text: `### ⏱️ Focused ${detectedDays}-Day Travel Plan for ${plan.destinationName}

I have customized your itinerary to a sharp **${detectedDays}-day duration**, optimizing routing between top sights to minimize transit time and maximize your experience:

- **Optimal Duration:** ${plan.recommendedDurationDays} days recommended, customized to **${detectedDays} days**.
- **Estimated Mid-Range Budget:** ~$${plan.costTiers.midRange.totalPerPersonUSD} total (~$${plan.costTiers.midRange.perDayPerPersonUSD}/day).
- **Highlights Covered:** ${plan.itinerary.map(d => d.title.split(':')[1]?.trim() || d.title).join(', ')}.`,
      intent: 'itinerary',
      destinationFound: { id: plan.destinationId, name: plan.destinationName, country: plan.country },
      destinationMentioned: plan.destinationName,
      cards: {
        type: 'travelPlan',
        data: plan,
      },
      suggestedFollowUps: [
        `What will a budget trip to ${plan.destinationName} cost?`,
        `Suggest cheaper hotels in ${plan.destinationName}`,
        `Best places for photography in ${plan.destinationName}`,
      ],
      liveDataLoaded: true,
    };
  }

  // ==========================================
  // SCENARIO G: STATE / REGION DISCOVERY
  // E.g., "Himachal Pradesh", "Kerala", "Rajasthan", "Tamil Nadu", "Japan"
  // ==========================================
  if (destinationName) {
    const canonical = getCanonicalDestination(destinationName.toLowerCase());
    const indiaSearch = indiaGeoService.searchIndia(destinationName);
    const isStateOrCountry =
      canonical?.type === 'state_region' ||
      canonical?.type === 'country' ||
      indiaSearch?.type === 'state_ut' ||
      recognizedLoc?.geographicType === 'country' ||
      recognizedLoc?.geographicType === 'state_region';

    if (isStateOrCountry && (query.includes('tell me about') || query.includes('explore') || !query.includes('plan a trip'))) {
      const discovery = await placesService.discoverDestination(destinationName);

      return {
        text: `${spellingNotice}### 🌄 Discover ${discovery.destination} (${discovery.country || 'Global'})

${discovery.summary}

**Top Regional Destinations to Explore:**
${discovery.subDestinations?.map(s => `• **${s.name}**: ${s.tagline}`).join('\n') || ''}

*Click any sub-destination below to explore detailed day-wise travel plans, authentic stays, and costs:*`,
        intent: 'destination',
        destinationFound: { id: destinationName.toLowerCase(), name: discovery.destination, country: discovery.country },
        destinationMentioned: discovery.destination,
        cards: {
          type: 'discovery',
          data: discovery,
        },
        suggestedFollowUps: [
          ...(discovery.subDestinations?.slice(0, 3).map((s) => `Plan a trip to ${s.name}`) || []),
          `What is the best food in ${discovery.destination}?`,
          `Best time to visit ${discovery.destination}`,
        ],
        liveDataLoaded: true,
      };
    }

    // ==========================================
    // SCENARIO H: PRACTICAL TRAVEL PLAN FOR CITY / ANY GLOBAL DESTINATION
    // E.g., "Paris", "Manali", "Munnar", "Rome", "Tokyo", "Bali", "Shillong", "Reykjavik"
    // ==========================================
    const plan = await travelPlanService.generateTravelPlan(destinationName, detectedDays);
    const dsLookup = datasetService.lookup(destinationName);
    const verifiedBadge = dsLookup?.verifiedInDataset ? `> 🛡️ **Verified Knowledge Base Record** (${dsLookup.provenance})\n\n` : '';

    return {
      text: `${spellingNotice}${verifiedBadge}### ✈️ Complete Travel Blueprint for ${plan.destinationName} (${plan.planDurationDays} Days)

Here is your comprehensive travel plan for **${plan.destinationName}**, featuring realistic day-by-day schedules, 3-tier expense estimations, transit tips, and local dining:

- **Geographic Classification:** ${recognizedLoc?.typeLabel || 'Destination'} in ${plan.country}
- **Recommended Trip Length:** ${plan.recommendedDurationDays} Days (Planned for **${plan.planDurationDays} Days**)
- **Best Season to Visit:** ${plan.bestTimeToVisit.season} (${plan.bestTimeToVisit.weatherSummary})
- **Estimated Mid-Range Cost:** ~$${plan.costTiers.midRange.totalPerPersonUSD} per person (~$${plan.costTiers.midRange.perDayPerPersonUSD}/day)
- **Nearest Transit Hub:** ${plan.transitGuide.nearestAirports[0] || 'International Airport'}`,
      intent: 'itinerary',
      destinationFound: { id: plan.destinationId, name: plan.destinationName, country: plan.country },
      destinationMentioned: plan.destinationName,
      cards: {
        type: 'travelPlan',
        data: plan,
      },
      suggestedFollowUps: [
        `What if I have only 3 days in ${plan.destinationName}?`,
        `What will a budget trip to ${plan.destinationName} cost?`,
        `Suggest cheaper hotels in ${plan.destinationName}`,
        `Best places for photography in ${plan.destinationName}?`,
      ],
      liveDataLoaded: true,
    };
  }

  // ==========================================
  // SCENARIO I: UNVERIFIED DESTINATION NOTIFICATION
  // When user asks for a place not found in datasets or registries
  // ==========================================
  const isGreetingWord = ['hi', 'hello', 'hey', 'start', 'help', 'good morning', 'good afternoon', 'good evening', 'who are you', 'what can you do'].includes(query);
  if (!isGreetingWord && rawQuery.trim().length > 2) {
    return {
      text: `### 🔍 Destination Record Not Found\n\nI could not locate verified destination records for **"${rawQuery}"** in our integrated datasets or trusted global geographical registries.\n\n*Suggestions:*\n• Check the spelling of the destination.\n• Search for an Indian city (e.g. *Agra, Jaipur, Mumbai, Varanasi, Kozhikode*).\n• Search for a global destination (e.g. *Dubai, Paris, Tokyo, Bali, Rome, London*).\n• Search for an iconic attraction (e.g. *Taj Mahal, Qutub Minar, India Gate*).`,
      intent: 'general',
      suggestedFollowUps: [
        'Explore Agra tourist places',
        'Plan a 5-day trip to Dubai',
        'Tell me about Taj Mahal',
        'Famous food in Mumbai',
        'Explore Paris travel plan',
      ],
      liveDataLoaded: false,
    };
  }

  // ==========================================
  // SCENARIO J: GENERAL GREETING OR ONBOARDING
  // ==========================================
  const greeting = authService.getGreeting();
  return {
    text: `${greeting.main} I'm **Wayora**, your dedicated AI travel concierge.

Ask me about any destination worldwide — for example:
• *"Plan a 5-day trip to Paris"*
• *"Show me the best places to visit in Manali"*
• *"Explore Himachal Pradesh destinations"*
• *"Can I visit Rohtang Pass in December?"*
• *"What will a 4-day trip to Bali cost?"*
• *"What is the best food in Kerala?"*`,
    intent: 'general',
    suggestedFollowUps: [
      'Plan a 5-day trip to Paris',
      'Show me the best places to visit in Manali',
      'Explore Himachal Pradesh destinations',
      'Can I visit Rohtang Pass in December?',
      'Plan a trip to Bali',
    ],
    liveDataLoaded: false,
  };
}
