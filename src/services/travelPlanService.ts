// Travel Planning Service
// Synthesizes practical, realistic travel blueprints:
// - Overview & Recommended Duration
// - 3-Tier Realistic Cost Estimations (Budget, Mid-Range, Luxury)
// - Practical Day-wise Itineraries (Morning, Afternoon, Evening, Travel Time, Meals)
// - Accommodation Neighborhood Guides & Transit Blueprints
// - Photography and Local Cuisine Guides

import { 
  CANONICAL_DESTINATIONS, 
  CanonicalDestination, 
  DayItineraryPlan 
} from '../data/canonicalKnowledge';
import { placesService } from './placesService';
import { locationRecognitionEngine } from './locationRecognitionEngine';
import { destinationInfoEngine } from './destinationInfoEngine';
import { datasetService, DatasetLookupResult } from './datasetService';
import { imageRetrievalService } from './imageRetrievalService';
import { 
  TravelPlanData, 
  TravelPlanDay, 
  TravelPlanDaySlot, 
  TravelPlanCostTier 
} from '../types/travel';

export class TravelPlanService {
  /**
   * Generates a comprehensive, practical travel plan for any destination.
   */
  async generateTravelPlan(
    query: string,
    requestedDays?: number,
    preferredTier: 'budget' | 'midRange' | 'luxury' = 'midRange'
  ): Promise<TravelPlanData> {
    const cleanQuery = (query || '').trim().toLowerCase();
    
    // 0. Check Primary Verified Datasets (Seasonal, Travel Planner, City Information, Tourist Places, Attractions)
    const datasetMatch = datasetService.lookup(query);
    if (datasetMatch && (datasetMatch.seasonalData || datasetMatch.travelPlans?.length || datasetMatch.cityData || datasetMatch.attractionData)) {
      return this.buildFromVerifiedDataset(datasetMatch, requestedDays, preferredTier);
    }

    // 1. Check Canonical Destinations
    const canonicalMatch = this.findCanonicalDestination(cleanQuery);
    if (canonicalMatch) {
      return this.buildFromCanonical(canonicalMatch, requestedDays, preferredTier);
    }

    // 2. Query Universal Location Recognition & Destination Information Engines
    const recognized = await locationRecognitionEngine.recognizeLocation(query);
    if (recognized) {
      const profile = await destinationInfoEngine.getDestinationProfile(recognized, requestedDays, preferredTier);
      return profile.travelPlan;
    }

    // 3. Fallback to places service
    const livePlace = await placesService.discoverDestination(query);
    return this.buildFromLivePlace(livePlace, query, requestedDays, preferredTier);
  }

  /**
   * Quick matching against canonical database
   */
  private findCanonicalDestination(query: string): CanonicalDestination | null {
    if (!query) return null;

    // Direct key match
    if (CANONICAL_DESTINATIONS[query]) {
      return CANONICAL_DESTINATIONS[query];
    }

    // Search keys and aliases
    for (const [key, dest] of Object.entries(CANONICAL_DESTINATIONS)) {
      if (key === query || dest.name.toLowerCase() === query) {
        return dest;
      }
      if (dest.aliases?.some(a => a.toLowerCase() === query || query.includes(a.toLowerCase()))) {
        return dest;
      }
      // Query contains destination name
      if (query.includes(dest.name.toLowerCase())) {
        return dest;
      }
    }

    return null;
  }

  /**
   * Builds TravelPlanData from verified Canonical Destination
   */
  private buildFromCanonical(
    dest: CanonicalDestination,
    requestedDays?: number,
    preferredTier: 'budget' | 'midRange' | 'luxury' = 'midRange'
  ): TravelPlanData {
    // Parse recommended duration days
    const defaultDays = this.extractRecommendedDays(dest.overview.recommendedDuration);
    const durationDays = requestedDays && requestedDays > 0 ? requestedDays : defaultDays;

    // Cost tiers calculation
    const costTiers = this.calculateCostTiers(dest.costTier, durationDays);

    // Build day-wise itinerary
    const itinerary = this.buildCanonicalItinerary(dest, durationDays);

    // Build neighborhood guides
    const neighborhoodGuides = this.extractNeighborhoodGuides(dest);

    // Photography spots
    const photographySpots = dest.attractions
      ?.filter(a => a.category === 'PHOTOGRAPHY' || a.category === 'MUST_VISIT')
      .slice(0, 4)
      .map(a => ({
        spot: a.name,
        bestTime: a.bestTimeToVisit || 'Golden Hour / Early Morning',
        tip: a.accessibilityNotice || a.whyFamous || `Vantage point for panoramic views of ${a.name}.`
      }));

    // Local dishes
    const localDishes = dest.foodAndCuisine?.traditionalDishes.map(d => ({
      name: d.name,
      category: 'traditional' as const,
      description: d.description,
      priceRangeUSD: dest.costTier === 'high' ? '$12 - $35' : dest.costTier === 'mid' ? '$5 - $15' : '$2 - $7'
    })) || [];

    // Flag emoji
    const flagEmoji = this.getCountryFlag(dest.country);

    return {
      destinationId: dest.id,
      destinationName: dest.name,
      country: dest.country,
      flagEmoji,
      bannerPhoto: dest.heroPhoto,
      tagline: dest.overview.famousFor.slice(0, 3).join(' • '),
      recommendedDurationDays: defaultDays,
      planDurationDays: durationDays,
      bestTimeToVisit: {
        season: dest.overview.bestTimeToVisit.split('(')[0]?.trim() || dest.overview.bestTimeToVisit,
        months: dest.overview.bestTimeToVisit,
        weatherSummary: dest.overview.climate,
        avoidMonths: dest.seasonalAccessibilityNotes?.[0]?.seasonOrMonth
      },
      transitGuide: {
        nearestAirports: dest.transportationInfo?.nearestAirport ? [dest.transportationInfo.nearestAirport] : [],
        railwayConnectivity: dest.transportationInfo?.nearestRailway ? [dest.transportationInfo.nearestRailway] : [],
        localTransportTips: dest.transportationInfo?.localTransit || [
          'Metro and public buses are the most cost-effective.',
          'Rideshare and metered taxis available for late evening journeys.'
        ],
        airportToCityEstimateUSD: dest.costTier === 'high' ? 45 : dest.costTier === 'mid' ? 25 : 12
      },
      neighborhoodGuides,
      costTiers,
      itinerary,
      photographySpots,
      localDishes,
      seasonalAdvisory: dest.seasonalAccessibilityNotes?.[0]?.note
    };
  }

  /**
   * Builds TravelPlanData from Primary Verified Datasets
   * (Travel Planner Dataset, City Information, and Tourist Places)
   */
  private buildFromVerifiedDataset(
    match: DatasetLookupResult,
    requestedDays?: number,
    preferredTier: 'budget' | 'midRange' | 'luxury' = 'midRange'
  ): TravelPlanData {
    // Scenario 0: Verified Seasonal India Destination (Wayora_India_Seasonal_Destinations.csv)
    if (match.seasonalData) {
      const s = match.seasonalData;
      const defaultDays = parseInt(s.suggestedDuration, 10) || 3;
      const durationDays = requestedDays && requestedDays > 0 ? requestedDays : defaultDays;
      const verifiedImg = match.verifiedImage || imageRetrievalService.getVerifiedImage(s.destinationName, s.imageCategory);

      // Convert daily budget from INR to USD (~84 INR per USD)
      const budgetDailyUSD = Math.round(s.budgetBudgetInt.min / 84) || 22;
      const midDailyUSD = Math.round(s.budgetMidRangeInt.min / 84) || 45;
      const luxuryDailyUSD = Math.round((s.budgetMidRangeInt.max * 1.5) / 84) || 95;

      const costTiers = {
        budget: {
          tier: 'budget' as const,
          label: 'Budget Explorer',
          perDayPerPersonUSD: budgetDailyUSD,
          totalPerPersonUSD: budgetDailyUSD * durationDays,
          accommodationExample: `Budget guesthouse / homestay in ${s.destinationName}`,
          diningStyle: 'Local eateries, traditional cafes and street food',
          breakdown: {
            accommodationPerDayUSD: Math.round(budgetDailyUSD * 0.45),
            foodPerDayUSD: Math.round(budgetDailyUSD * 0.30),
            localTransitPerDayUSD: Math.round(budgetDailyUSD * 0.15),
            activitiesPerDayUSD: Math.round(budgetDailyUSD * 0.10),
            miscPerDayUSD: 4,
          },
        },
        midRange: {
          tier: 'midRange' as const,
          label: 'Comfort & Value',
          perDayPerPersonUSD: midDailyUSD,
          totalPerPersonUSD: midDailyUSD * durationDays,
          accommodationExample: `Boutique resort / estate stay in ${s.destinationName}`,
          diningStyle: 'Multi-cuisine restaurants and specialty local dining',
          breakdown: {
            accommodationPerDayUSD: Math.round(midDailyUSD * 0.45),
            foodPerDayUSD: Math.round(midDailyUSD * 0.28),
            localTransitPerDayUSD: Math.round(midDailyUSD * 0.17),
            activitiesPerDayUSD: Math.round(midDailyUSD * 0.10),
            miscPerDayUSD: 8,
          },
        },
        luxury: {
          tier: 'luxury' as const,
          label: 'Luxury & Indulgence',
          perDayPerPersonUSD: luxuryDailyUSD,
          totalPerPersonUSD: luxuryDailyUSD * durationDays,
          accommodationExample: 'Heritage 5-star mountain chalet / luxury resort',
          diningStyle: 'Fine dining, private culinary experiences and curated tastings',
          breakdown: {
            accommodationPerDayUSD: Math.round(luxuryDailyUSD * 0.50),
            foodPerDayUSD: Math.round(luxuryDailyUSD * 0.25),
            localTransitPerDayUSD: Math.round(luxuryDailyUSD * 0.15),
            activitiesPerDayUSD: Math.round(luxuryDailyUSD * 0.10),
            miscPerDayUSD: 15,
          },
        },
      };

      const attractionsList = s.keyAttractions.split(',').map((a) => a.trim()).filter((a) => a.length > 0);
      const itinerary: TravelPlanDay[] = [];

      for (let day = 1; day <= durationDays; day++) {
        const a1 = attractionsList[(day - 1) * 2 % attractionsList.length] || `${s.destinationName} Scenic Viewpoint`;
        const a2 = attractionsList[((day - 1) * 2 + 1) % attractionsList.length] || `${s.destinationName} Heritage & Nature Trail`;

        itinerary.push({
          dayNumber: day,
          title: `Day ${day}: ${a1} & ${a2}`,
          theme: day === 1 ? 'Arrival & Iconic Landscapes' : day === durationDays ? 'Leisure, Panorama & Local Markets' : 'Deep Nature & Regional Exploration',
          slots: [
            {
              timeSlot: 'Morning',
              activity: `Explore ${a1}`,
              attractionName: a1,
              durationHours: 2.5,
              travelTimeMinutes: 20,
              order: 1,
              mealRecommendation: {
                dish: `Traditional regional breakfast in ${s.stateOrUT}`,
                description: `Fresh morning delicacies in ${s.destinationName}`,
                estimatedCostUSD: 3,
              },
              tips: 'Optimal lighting and morning tranquility; dress comfortably for mountain/coastal terrain.',
            },
            {
              timeSlot: 'Afternoon',
              activity: `Discover ${a2}`,
              attractionName: a2,
              durationHours: 2.5,
              travelTimeMinutes: 25,
              order: 2,
              mealRecommendation: {
                dish: 'Authentic regional lunch specialties',
                description: `Local dining in ${s.destinationName}`,
                estimatedCostUSD: 5,
              },
              tips: 'Keep waterproof layers or sun protection ready; follow local park guidelines.',
            },
            {
              timeSlot: 'Evening',
              activity: `Golden hour sunset & twilight walk around ${s.destinationName}`,
              durationHours: 2.0,
              travelTimeMinutes: 15,
              order: 3,
              mealRecommendation: {
                dish: 'Regional dinner experience',
                description: `Warm local dinner in ${s.destinationName}`,
                estimatedCostUSD: 6,
              },
              tips: 'Browse local artisanal shops for authentic regional teas, spices, and handicrafts.',
            },
          ],
          dayTotalEstimatedUSD: midDailyUSD,
          highlights: [a1, a2],
        });
      }

      return {
        destinationId: `seasonal_${s.destinationId.toLowerCase()}`,
        destinationName: s.destinationName,
        country: s.country,
        flagEmoji: '🇮🇳',
        tagline: s.destinationType,
        bannerPhoto: verifiedImg ? verifiedImg.imageUrl : undefined,
        recommendedDurationDays: defaultDays,
        planDurationDays: durationDays,
        bestTimeToVisit: {
          season: s.suitableSeasons.join(', '),
          months: s.recommendedMonths,
          weatherSummary: s.seasonalCautions,
        },
        transitGuide: {
          nearestAirports: [`Regional / International airport servicing ${s.stateOrUT}`],
          railwayConnectivity: [`Railhead connectivity in ${s.stateOrUT}`],
          localTransportTips: [
            `Indicative budget at destination: ${s.budgetBudgetInt.raw}/day (Budget) | ${s.budgetMidRangeInt.raw}/day (Mid-range).`,
            'Pre-paid taxis and state RTC mountain/coastal buses are readily available.',
            `Travel Caution: ${s.seasonalCautions}`,
          ],
          airportToCityEstimateUSD: 25,
        },
        neighborhoodGuides: [
          {
            name: `${s.destinationName} Central & Viewpoints`,
            bestFor: 'First-time visitors & sightseeing',
            vibe: s.destinationType,
            avgPricePerNightUSD: Math.round(midDailyUSD * 0.45),
          },
        ],
        costTiers,
        itinerary,
        photographySpots: attractionsList.slice(0, 3).map((spot) => ({
          spot,
          bestTime: 'Golden Hour (Sunrise & Sunset)',
          tip: `Iconic vantage point for panoramic landscape photography of ${spot}.`,
        })),
        localDishes: [
          {
            name: `Specialties of ${s.stateOrUT}`,
            category: 'traditional' as const,
            description: `Authentic regional cuisine in ${s.destinationName}`,
            priceRangeUSD: '$3 - $8',
          },
        ],
        seasonalAdvisory: `${s.recommendedMonths} is the recommended visiting window (${s.suitableSeasons.join(', ')}). ${s.seasonalCautions}`,
      };
    }

    // Scenario 0.5: Verified Attraction Record (India Tourism Foundation Database)
    if (match.attractionData) {
      const a = match.attractionData;
      const defaultDays = 2;
      const durationDays = requestedDays && requestedDays > 0 ? requestedDays : defaultDays;
      const verifiedImg = match.verifiedImage || imageRetrievalService.getVerifiedImage(a.placeName, 'heritage');

      const budgetDailyUSD = 25;
      const midDailyUSD = 50;
      const luxuryDailyUSD = 110;

      const costTiers = {
        budget: {
          tier: 'budget' as const,
          label: 'Budget Explorer',
          perDayPerPersonUSD: budgetDailyUSD,
          totalPerPersonUSD: budgetDailyUSD * durationDays,
          accommodationExample: `Comfortable homestay in ${a.city || a.state}`,
          diningStyle: 'Local thalis, regional eateries and tea stalls',
          breakdown: {
            accommodationPerDayUSD: 12,
            foodPerDayUSD: 8,
            localTransitPerDayUSD: 3,
            activitiesPerDayUSD: Math.round(a.entranceFeeINR / 84) || 2,
            miscPerDayUSD: 3,
          },
        },
        midRange: {
          tier: 'midRange' as const,
          label: 'Comfort & Value',
          perDayPerPersonUSD: midDailyUSD,
          totalPerPersonUSD: midDailyUSD * durationDays,
          accommodationExample: `Heritage hotel / boutique resort in ${a.city || a.state}`,
          diningStyle: 'Accredited restaurants and traditional specialty cafes',
          breakdown: {
            accommodationPerDayUSD: 25,
            foodPerDayUSD: 15,
            localTransitPerDayUSD: 6,
            activitiesPerDayUSD: Math.round(a.entranceFeeINR / 84) + 5,
            miscPerDayUSD: 5,
          },
        },
        luxury: {
          tier: 'luxury' as const,
          label: 'Luxury & Indulgence',
          perDayPerPersonUSD: luxuryDailyUSD,
          totalPerPersonUSD: luxuryDailyUSD * durationDays,
          accommodationExample: `5-Star luxury resort / palace stay in ${a.city || a.state}`,
          diningStyle: 'Fine dining, private tastings, and chef-curated dining',
          breakdown: {
            accommodationPerDayUSD: 65,
            foodPerDayUSD: 30,
            localTransitPerDayUSD: 15,
            activitiesPerDayUSD: 15,
            miscPerDayUSD: 10,
          },
        },
      };

      const itinerary: TravelPlanDay[] = [
        {
          dayNumber: 1,
          title: `Day 1: ${a.placeName} Exploration & Heritage`,
          theme: 'Arrival, Iconic Sightseeing & Scenic Exploration',
          slots: [
            {
              timeSlot: 'Morning',
              activity: `Visit ${a.placeName} (${a.openingHours || '08:00 AM onwards'}). Entry fee: ₹${a.entranceFeeINR}. Ideal duration: ${a.visitDurationHours || 2} hours.`,
              attractionName: a.placeName,
              durationHours: a.visitDurationHours || 2,
              order: 1,
              tips: `DSLR photography ${a.dslrAllowed ? 'allowed' : 'restricted'}. Best visited in morning light.`,
            },
            {
              timeSlot: 'Afternoon',
              activity: `Explore surrounding viewpoints, gardens, and cultural landmarks of ${a.city || a.state}.`,
              durationHours: 2.5,
              travelTimeMinutes: 15,
              order: 2,
              mealRecommendation: {
                dish: `Authentic regional lunch in ${a.city || a.state}`,
                description: 'Traditional thali and local specialties',
                estimatedCostUSD: 5,
              },
              tips: 'Carry drinking water and comfortable walking shoes.',
            },
            {
              timeSlot: 'Evening',
              activity: `Twilight stroll through traditional bazaars, sunset vistas, and authentic dinner.`,
              durationHours: 2.0,
              travelTimeMinutes: 15,
              order: 3,
              tips: 'Browse local shops for authentic regional teas, spices, and handicrafts.',
            },
          ],
          dayTotalEstimatedUSD: preferredTier === 'budget' ? budgetDailyUSD : preferredTier === 'luxury' ? luxuryDailyUSD : midDailyUSD,
          highlights: [a.placeName, `${a.city || a.state} Heritage`],
        },
      ];

      if (durationDays > 1) {
        for (let d = 2; d <= durationDays; d++) {
          itinerary.push({
            dayNumber: d,
            title: `Day ${d}: ${a.city || a.state} Extended Discovery`,
            theme: 'Nature Trails, Local Culture & Leisure',
            slots: [
              {
                timeSlot: 'Morning',
                activity: `Scenic excursion and local sightseeing around ${a.city || a.state}.`,
                durationHours: 3.0,
                order: 1,
              },
              {
                timeSlot: 'Afternoon',
                activity: 'Artisan craft shopping and regional museum visits.',
                durationHours: 2.5,
                travelTimeMinutes: 15,
                order: 2,
                mealRecommendation: {
                  dish: 'Regional specialty meal',
                  description: 'Authentic local delicacies',
                  estimatedCostUSD: 6,
                },
              },
              {
                timeSlot: 'Evening',
                activity: 'Evening leisure, local delicacies, and cultural relaxation.',
                durationHours: 2.0,
                travelTimeMinutes: 10,
                order: 3,
              },
            ],
            dayTotalEstimatedUSD: preferredTier === 'budget' ? budgetDailyUSD : preferredTier === 'luxury' ? luxuryDailyUSD : midDailyUSD,
            highlights: [`${a.city || a.state} Countryside`, 'Local Culture'],
          });
        }
      }

      return {
        destinationId: a.placeId,
        destinationName: a.placeName,
        country: 'India',
        flagEmoji: '🇮🇳',
        bannerPhoto: verifiedImg?.imageUrl || 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80',
        tagline: `${a.placeType} in ${a.city || a.state} • ${a.significance.slice(0, 75)}`,
        recommendedDurationDays: defaultDays,
        planDurationDays: durationDays,
        bestTimeToVisit: {
          season: a.bestTimeToVisit,
          months: a.bestTimeToVisit,
          weatherSummary: `Ideal visiting months: ${a.bestTimeToVisit}. Weekly off: ${a.weeklyOff}.`,
        },
        transitGuide: {
          nearestAirports: a.transport?.airportName ? [`${a.transport.airportName} (${a.transport.airportCode}) - ${a.transport.airportRoadKm} km (~${a.transport.airportDriveTimeMin} mins)`] : [],
          railwayConnectivity: a.transport?.railwayStation ? [`${a.transport.railwayStation} (${a.transport.railwayCode}) - ${a.transport.railwayRoadKm} km (~${a.transport.railwayDriveTimeMin} mins)`] : [],
          localTransportTips: a.transport?.publicTransport ? [a.transport.publicTransport, 'Taxis and auto-rickshaws available for point-to-point travel.'] : ['State transport buses and taxis available.'],
          airportToCityEstimateUSD: 15,
        },
        neighborhoodGuides: [
          {
            name: `${a.city || a.state} Central`,
            vibe: 'Convenient base with access to sightseeing, transit, and local dining',
            bestFor: 'Couples, families, and solo travelers',
            avgPricePerNightUSD: Math.round(midDailyUSD * 0.45),
          },
        ],
        costTiers,
        itinerary,
        photographySpots: [
          {
            spot: `${a.placeName} Main Viewpoint`,
            bestTime: 'Morning or Golden Hour',
            tip: `DSLR allowed: ${a.dslrAllowed ? 'Yes' : 'No'}. Capture architectural symmetry and morning lighting.`,
          },
        ],
        localDishes: [
          {
            name: `Specialties of ${a.state}`,
            category: 'traditional' as const,
            description: `Authentic regional recipes and traditional flavors of ${a.state}`,
            priceRangeUSD: '$2 - $6',
          },
        ],
        seasonalAdvisory: `Best months to plan your visit: ${a.bestTimeToVisit}. Check opening hours (${a.openingHours || '06:00 - 18:00'}) and weekly off (${a.weeklyOff}).`,
      };
    }

    // Scenario 1: Comprehensive Travel Planner Dataset record
    if (match.travelPlans && match.travelPlans.length > 0) {
      const pl = match.travelPlans[0];
      const defaultDays = pl.recommendedStayDays || 4;
      const durationDays = requestedDays && requestedDays > 0 ? requestedDays : defaultDays;

      const baseFlight = pl.flightTransportCostUSD || 450;
      const baseStayPerNight = pl.accommodationCostPerNightUSD || 70;
      const baseFoodPerDay = pl.foodCostPerDayUSD || 30;
      const baseActivity = pl.activityCostUSD || 25;
      const baseMiscPerDay = (pl.miscellaneousCostUSD || 20) / defaultDays;

      const midDailyRate = Math.round((baseStayPerNight / 2) + baseFoodPerDay + (baseActivity / durationDays) + baseMiscPerDay);
      const budgetDailyRate = Math.round(midDailyRate * 0.6);
      const luxuryDailyRate = Math.round(midDailyRate * 1.9);

      const costTiers = {
        budget: {
          tier: 'budget' as const,
          label: 'Budget Explorer',
          perDayPerPersonUSD: budgetDailyRate,
          totalPerPersonUSD: budgetDailyRate * durationDays + Math.round(baseFlight * 0.8),
          accommodationExample: pl.accommodationOptions[0] || 'Budget Hotel / Hostel',
          diningStyle: pl.foodOptions[0] || 'Street food & local cafes',
          breakdown: {
            accommodationPerDayUSD: Math.round(baseStayPerNight * 0.5),
            foodPerDayUSD: Math.round(baseFoodPerDay * 0.6),
            localTransitPerDayUSD: 10,
            activitiesPerDayUSD: Math.round(baseActivity / durationDays),
            miscPerDayUSD: 8,
          },
        },
        midRange: {
          tier: 'midRange' as const,
          label: 'Comfort & Value',
          perDayPerPersonUSD: midDailyRate,
          totalPerPersonUSD: midDailyRate * durationDays + baseFlight,
          accommodationExample: pl.accommodationOptions[1] || pl.accommodationOptions[0] || 'Comfort Hotel / Resort',
          diningStyle: pl.foodOptions.join(' & ') || 'Traditional dining & cafes',
          breakdown: {
            accommodationPerDayUSD: Math.round(baseStayPerNight / 2),
            foodPerDayUSD: baseFoodPerDay,
            localTransitPerDayUSD: 18,
            activitiesPerDayUSD: Math.round(baseActivity / durationDays),
            miscPerDayUSD: 15,
          },
        },
        luxury: {
          tier: 'luxury' as const,
          label: 'Luxury & Indulgence',
          perDayPerPersonUSD: luxuryDailyRate,
          totalPerPersonUSD: luxuryDailyRate * durationDays + Math.round(baseFlight * 1.5),
          accommodationExample: pl.accommodationOptions[pl.accommodationOptions.length - 1] || '5-Star Luxury Resort',
          diningStyle: pl.foodOptions[pl.foodOptions.length - 1] || 'Fine dining & private culinary tours',
          breakdown: {
            accommodationPerDayUSD: Math.round(baseStayPerNight * 1.6),
            foodPerDayUSD: Math.round(baseFoodPerDay * 1.8),
            localTransitPerDayUSD: 40,
            activitiesPerDayUSD: Math.round((baseActivity / durationDays) * 2),
            miscPerDayUSD: 30,
          },
        },
      };

      const attractionsList = pl.topAttractions.length > 0
        ? pl.topAttractions
        : ['City Center & Iconic Landmarks', 'Historic Old Town & Cultural Sights', 'Scenic Waterfront & Panoramic Viewpoint'];
      
      const itinerary: TravelPlanDay[] = [];
      for (let day = 1; day <= durationDays; day++) {
        const attrIndex = (day - 1) % attractionsList.length;
        const currentAttraction = attractionsList[attrIndex];
        const nextAttraction = attractionsList[(attrIndex + 1) % attractionsList.length];

        itinerary.push({
          dayNumber: day,
          title: `Day ${day}: ${currentAttraction} & Local Sights`,
          theme: day === 1 ? 'Arrival & Landmark Highlights' : day === durationDays ? 'Leisure, Souvenirs & Twilight Views' : 'Deep Cultural Immersion',
          slots: [
            {
              timeSlot: 'Morning',
              activity: `Explore ${currentAttraction}`,
              attractionName: currentAttraction,
              durationHours: pl.activityDurationHours || 2.5,
              travelTimeMinutes: 20,
              order: 1,
              mealRecommendation: {
                dish: pl.foodOptions[0] || 'Regional Morning Breakfast',
                description: 'Authentic local breakfast specialty',
                estimatedCostUSD: Math.round(baseFoodPerDay * 0.25),
              },
              tips: 'Arrive early to avoid peak queues and capture optimal soft lighting.',
            },
            {
              timeSlot: 'Afternoon',
              activity: `Visit ${nextAttraction} and explore surrounding district`,
              attractionName: nextAttraction,
              durationHours: 3.0,
              travelTimeMinutes: 25,
              order: 2,
              mealRecommendation: {
                dish: pl.foodOptions[1] || 'Traditional Lunch Specialty',
                description: 'Popular dining venue in central area',
                estimatedCostUSD: Math.round(baseFoodPerDay * 0.35),
              },
              tips: 'Carry water and wear comfortable walking shoes.',
            },
            {
              timeSlot: 'Evening',
              activity: `Sunset promenade and dinner in ${pl.city || pl.destinationName}`,
              durationHours: 2.0,
              travelTimeMinutes: 15,
              order: 3,
              mealRecommendation: {
                dish: pl.foodOptions[pl.foodOptions.length - 1] || 'Signature Evening Dining',
                description: 'Atmospheric dining with regional flavors',
                estimatedCostUSD: Math.round(baseFoodPerDay * 0.4),
              },
              tips: 'Reservations recommended during high season.',
            },
          ],
          dayTotalEstimatedUSD: midDailyRate,
          highlights: [currentAttraction, nextAttraction],
        });
      }

      return {
        destinationId: `dataset_${match.canonicalDestination.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        destinationName: pl.destinationName,
        country: pl.country,
        flagEmoji: this.getCountryFlag(pl.country),
        tagline: `${pl.destinationType} in ${pl.country} • Currency: ${pl.localCurrency} (1 ${pl.localCurrency} = $${pl.exchangeRateToUSD || 'N/A'} USD)`,
        recommendedDurationDays: defaultDays,
        planDurationDays: durationDays,
        bestTimeToVisit: {
          season: pl.bestSeason,
          months: pl.bestSeason,
          weatherSummary: `Peak season multiplier: ${pl.peakSeasonCostMultiplier}x`,
        },
        transitGuide: {
          nearestAirports: [`International Airport servicing ${pl.city || pl.destinationName}`],
          railwayConnectivity: [`Rail & transit network across ${pl.city || pl.destinationName}`],
          localTransportTips: [
            `Flight/Transit from ${pl.startingPoint}: ~$${pl.flightTransportCostUSD || 'N/A'} USD (${pl.travelDurationHours || 'N/A'} hrs via ${pl.travelMode}).`,
            'Licensed taxis and public metro/transit recommended for city navigation.',
            pl.visaRequired ? `Visa is REQUIRED: ~$${pl.visaCostUSD} USD.` : 'Visa-free or on-arrival entry available.',
          ],
          airportToCityEstimateUSD: Math.round((pl.accommodationCostPerNightUSD || 50) * 0.35),
        },
        neighborhoodGuides: [
          {
            name: `${pl.city || pl.destinationName} Central`,
            bestFor: 'First-time visitors & sightseeing',
            vibe: 'Vibrant, walkable, with easy access to transit hubs and attractions',
            avgPricePerNightUSD: pl.accommodationCostPerNightUSD || 75,
          },
        ],
        costTiers,
        itinerary,
        photographySpots: attractionsList.slice(0, 3).map((spot) => ({
          spot,
          bestTime: 'Golden Hour (Sunrise & Sunset)',
          tip: `Iconic vantage point for panoramic shots of ${spot}.`,
        })),
        localDishes: pl.foodOptions.map((f) => ({
          name: f,
          category: 'traditional' as const,
          description: `Authentic culinary choice in ${pl.destinationName}`,
          priceRangeUSD: `$${Math.round(baseFoodPerDay * 0.3)} - $${Math.round(baseFoodPerDay * 0.6)}`,
        })),
        seasonalAdvisory: `${pl.bestSeason} is recommended. Peak multiplier: ${pl.peakSeasonCostMultiplier}x.`,
      };
    }

    // Scenario 2: Verified Indian City from city_information.csv & tourist_places.csv
    const city = match.cityData!;
    const places = city.touristPlaces || [];
    const food = city.foodRecommendations || [];
    const defaultDays = places.length >= 4 ? 3 : 2;
    const durationDays = requestedDays && requestedDays > 0 ? requestedDays : defaultDays;

    const midDailyUSD = 45;
    const costTiers = this.calculateCostTiers('budget', durationDays);

    const itinerary: TravelPlanDay[] = [];
    for (let day = 1; day <= durationDays; day++) {
      const p1 = places[(day - 1) * 2 % places.length] || {
        placeName: 'Historic City Center',
        placeType: 'Heritage',
        entranceFeeINR: 0,
        dslrAllowed: true,
        weeklyOff: 'Open All Days',
        visitDurationHours: 2.0,
      };
      const p2 = places[((day - 1) * 2 + 1) % places.length] || {
        placeName: 'Local Bazaar & Viewpoint',
        placeType: 'Sightseeing',
        entranceFeeINR: 0,
        dslrAllowed: true,
        weeklyOff: 'Open All Days',
        visitDurationHours: 2.0,
      };

      const bFood = food.find((f) => f.meal === 'breakfast') || food[0] || { name: 'Local Indian Breakfast specialty', meal: 'breakfast' };
      const dFood = food.find((f) => f.meal === 'dinner') || food[food.length - 1] || { name: 'Traditional Indian Thali & Specialties', meal: 'dinner' };

      itinerary.push({
        dayNumber: day,
        title: `Day ${day}: ${p1.placeName} & ${p2.placeName}`,
        theme: day === 1 ? 'City Heritage & Architectural Wonders' : 'Cultural Exploration & Sights',
        slots: [
          {
            timeSlot: 'Morning',
            activity: `Explore ${p1.placeName} (${p1.placeType})`,
            attractionName: p1.placeName,
            durationHours: p1.visitDurationHours || 2.0,
            travelTimeMinutes: 20,
            order: 1,
            mealRecommendation: {
              dish: bFood.name,
              description: `Verified breakfast recommendation in ${city.city}`,
              estimatedCostUSD: 3,
            },
            tips: `Entrance: ₹${p1.entranceFeeINR} INR | DSLR: ${p1.dslrAllowed ? 'Allowed' : 'Restricted'} | Weekly Off: ${p1.weeklyOff}.`,
          },
          {
            timeSlot: 'Afternoon',
            activity: `Visit ${p2.placeName} (${p2.placeType})`,
            attractionName: p2.placeName,
            durationHours: p2.visitDurationHours || 2.0,
            travelTimeMinutes: 25,
            order: 2,
            mealRecommendation: {
              dish: 'Authentic regional lunch thali',
              description: `Popular dining in ${city.city}`,
              estimatedCostUSD: 5,
            },
            tips: `Entrance: ₹${p2.entranceFeeINR} INR | DSLR: ${p2.dslrAllowed ? 'Allowed' : 'Restricted'} | Weekly Off: ${p2.weeklyOff}.`,
          },
          {
            timeSlot: 'Evening',
            activity: `Evening stroll & local markets in ${city.city}`,
            durationHours: 2.0,
            travelTimeMinutes: 15,
            order: 3,
            mealRecommendation: {
              dish: dFood.name,
              description: `Verified evening dining recommendation in ${city.city}`,
              estimatedCostUSD: 6,
            },
            tips: 'Explore local handicraft markets and enjoy street food stalls.',
          },
        ],
        dayTotalEstimatedUSD: midDailyUSD,
        highlights: [p1.placeName, p2.placeName],
      });
    }

    return {
      destinationId: `dataset_${city.city.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      destinationName: city.city,
      country: 'India',
      flagEmoji: '🇮🇳',
      tagline: city.description ? `${city.description.substring(0, 140)}...` : `Verified tourist destination in ${city.state}, India`,
      recommendedDurationDays: defaultDays,
      planDurationDays: durationDays,
      bestTimeToVisit: {
        season: city.bestTimeToVisit || 'October to March',
        months: city.bestTimeToVisit || 'October to March',
        weatherSummary: `Holidify rating: ⭐ ${city.holidifyRating || '4.5'} / 5.0`,
      },
      transitGuide: {
        nearestAirports: [`Domestic/International Airport servicing ${city.city} region`],
        railwayConnectivity: [`${city.city} Railway Junction (Indian Railways Network)`],
        localTransportTips: [
          'Prepaid auto-rickshaws, app cabs (Ola/Uber), and local buses available.',
          'Negotiate fares or insist on metered transit for auto-rickshaws.',
        ],
        airportToCityEstimateUSD: 12,
      },
      neighborhoodGuides: [
        {
          name: `${city.city} City Center / Station Area`,
          bestFor: 'Budget stays, connectivity & heritage sightseeing',
          vibe: 'Busy, lively, with numerous hotels and restaurants',
          avgPricePerNightUSD: 35,
        },
      ],
      costTiers,
      itinerary,
      photographySpots: places.slice(0, 4).map((p) => ({
        spot: p.placeName,
        bestTime: p.bestTimeToVisit || 'Morning / Golden Hour',
        tip: `DSLR: ${p.dslrAllowed ? 'Allowed' : 'Restricted'} • Significance: ${p.significance}`,
      })),
      localDishes: food.map((f) => ({
        name: f.name,
        category: 'traditional' as const,
        description: `Verified ${f.meal} recommendation in ${city.city}`,
        priceRangeUSD: '$2 - $8',
      })),
    };
  }

  /**
   * Builds TravelPlanData from dynamic live places (OpenStreetMap, Wikivoyage, Wikidata)
   */
  private buildFromLivePlace(
    livePlace: any,
    query: string,
    requestedDays?: number,
    preferredTier: 'budget' | 'midRange' | 'luxury' = 'midRange'
  ): TravelPlanData {
    const destName = livePlace?.destination || this.toTitleCase(query);
    const country = livePlace?.country || 'International';
    const costTierLevel = this.estimateCostTierByCountry(country);
    const durationDays = requestedDays && requestedDays > 0 ? requestedDays : 3;

    const costTiers = this.calculateCostTiers(costTierLevel, durationDays);

    // Build itinerary from live attractions
    const attractions = livePlace?.allPlaces || [];
    const itinerary: TravelPlanDay[] = [];

    for (let dayNum = 1; dayNum <= durationDays; dayNum++) {
      const startIndex = (dayNum - 1) * 2;
      const morningAttraction = attractions[startIndex];
      const afternoonAttraction = attractions[startIndex + 1];

      const slots: TravelPlanDaySlot[] = [];

      // Morning slot
      slots.push({
        timeSlot: 'Morning',
        activity: morningAttraction 
          ? `Explore ${morningAttraction.name}` 
          : `Historic center walk & orientation in ${destName}`,
        attractionName: morningAttraction?.name,
        attractionPhoto: morningAttraction?.photoUrl,
        durationHours: 3,
        travelTimeMinutes: 20,
        order: 1,
        mealRecommendation: {
          dish: 'Local breakfast & freshly brewed coffee',
          description: 'Traditional morning bite at a local cafe',
          estimatedCostUSD: costTierLevel === 'high' ? 14 : costTierLevel === 'mid' ? 7 : 3
        },
        tips: morningAttraction?.description || 'Arrive early to beat peak tour groups and enjoy mild morning light.'
      });

      // Afternoon slot
      slots.push({
        timeSlot: 'Afternoon',
        activity: afternoonAttraction 
          ? `Visit ${afternoonAttraction.name}` 
          : `Cultural exploration & artisan shopping in central ${destName}`,
        attractionName: afternoonAttraction?.name,
        attractionPhoto: afternoonAttraction?.photoUrl,
        durationHours: 3.5,
        travelTimeMinutes: 25,
        order: 2,
        mealRecommendation: {
          dish: 'Regional specialty lunch',
          description: 'Authentic local tavern or food market lunch',
          estimatedCostUSD: costTierLevel === 'high' ? 24 : costTierLevel === 'mid' ? 12 : 5
        },
        tips: afternoonAttraction?.description || 'Hydrate well and explore nearby pedestrian alleys.'
      });

      // Evening slot
      slots.push({
        timeSlot: 'Evening',
        activity: dayNum === 1 
          ? `Scenic sunset walk & atmospheric dinner in ${destName}` 
          : dayNum === 2 
            ? `Night market or cultural performance & riverside stroll`
            : `Panoramic viewpoint and celebratory farewell dinner`,
        durationHours: 2.5,
        travelTimeMinutes: 15,
        order: 3,
        mealRecommendation: {
          dish: 'Signature dinner experience',
          description: 'Atmospheric dining featuring local chef specialties',
          estimatedCostUSD: costTierLevel === 'high' ? 40 : costTierLevel === 'mid' ? 20 : 8
        },
        tips: 'Reservations recommended for popular heritage restaurants.'
      });

      const dayTotalCost = costTiers[preferredTier].perDayPerPersonUSD;

      itinerary.push({
        dayNumber: dayNum,
        title: `Day ${dayNum}: ${morningAttraction?.name || 'Iconic Highlights'} & ${destName} Culture`,
        theme: dayNum === 1 ? 'Orientation & Heritage' : dayNum === 2 ? 'Cultural Deep-Dive' : 'Local Vistas & Discovery',
        slots,
        dayTotalEstimatedUSD: dayTotalCost,
        highlights: [
          morningAttraction?.name || 'Historic Center',
          afternoonAttraction?.name || 'Local Neighborhoods',
          'Sunset & Dining'
        ]
      });
    }

    return {
      destinationId: `live_${destName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      destinationName: destName,
      country,
      flagEmoji: this.getCountryFlag(country),
      bannerPhoto: livePlace?.heroPhoto,
      tagline: livePlace?.overview?.famousFor?.slice(0, 3).join(' • ') || `Explore the timeless beauty of ${destName}`,
      recommendedDurationDays: 3,
      planDurationDays: durationDays,
      bestTimeToVisit: {
        season: 'Spring / Autumn',
        months: 'March–May & September–November',
        weatherSummary: 'Moderate temperatures and optimal conditions for walking tours.'
      },
      transitGuide: {
        nearestAirports: [`Regional International Airport servicing ${destName}`],
        localTransportTips: [
          'Download local transit app for ticketing and real-time routes.',
          'Walking is the best way to experience historic city centers.',
          'Agree on fares before boarding unmetered taxis or use rideshare.'
        ],
        airportToCityEstimateUSD: costTierLevel === 'high' ? 40 : costTierLevel === 'mid' ? 20 : 10
      },
      neighborhoodGuides: [
        {
          name: 'Old Town / City Centre',
          bestFor: 'First-time visitors & sightseeing',
          vibe: 'Walkable, surrounded by historic landmarks and dining',
          avgPricePerNightUSD: costTierLevel === 'high' ? 180 : costTierLevel === 'mid' ? 85 : 35
        },
        {
          name: 'Arts / Modern District',
          bestFor: 'Nightlife, dining & trendy cafes',
          vibe: 'Boutique hotels, lively cafes, and modern conveniences',
          avgPricePerNightUSD: costTierLevel === 'high' ? 140 : costTierLevel === 'mid' ? 65 : 25
        }
      ],
      costTiers,
      itinerary
    };
  }

  /**
   * Slices or builds canonical day-wise itinerary
   */
  private buildCanonicalItinerary(dest: CanonicalDestination, durationDays: number): TravelPlanDay[] {
    const sample = dest.sampleItinerary || [];
    const itinerary: TravelPlanDay[] = [];

    for (let i = 0; i < durationDays; i++) {
      const dayNum = i + 1;
      const sampleDay = sample[i % sample.length]; // cycle or adjust if requested more days

      const slots: TravelPlanDaySlot[] = [];

      // Morning
      const morningAttraction = dest.attractions?.find(a => 
        sampleDay?.recommendedRoutingOrder?.includes(a.name) ||
        sampleDay?.morning.activity.toLowerCase().includes(a.name.toLowerCase())
      ) || dest.attractions?.[i * 2];

      slots.push({
        timeSlot: 'Morning',
        activity: sampleDay?.morning.activity || `Visit ${morningAttraction?.name || 'Iconic Monuments'}`,
        attractionName: morningAttraction?.name,
        attractionPhoto: morningAttraction?.photoUrl,
        durationHours: 3,
        travelTimeMinutes: 20,
        order: 1,
        tips: sampleDay?.morning.tips || morningAttraction?.accessibilityNotice || 'Arrive early to avoid queues.'
      });

      // Afternoon
      const afternoonAttraction = dest.attractions?.find(a => 
        sampleDay?.afternoon.activity.toLowerCase().includes(a.name.toLowerCase())
      ) || dest.attractions?.[i * 2 + 1];

      slots.push({
        timeSlot: 'Afternoon',
        activity: sampleDay?.afternoon.activity || `Discover ${afternoonAttraction?.name || 'Cultural Quarter'}`,
        attractionName: afternoonAttraction?.name,
        attractionPhoto: afternoonAttraction?.photoUrl,
        durationHours: 3.5,
        travelTimeMinutes: 25,
        order: 2,
        mealRecommendation: {
          dish: sampleDay?.afternoon.mealSuggestion || 'Local specialty lunch',
          description: 'Hearty traditional cuisine at nearby bistros/cafes',
          estimatedCostUSD: dest.costTier === 'high' ? 25 : dest.costTier === 'mid' ? 12 : 5
        },
        tips: afternoonAttraction?.description || 'Take time to stroll surrounding garden promenades.'
      });

      // Evening
      slots.push({
        timeSlot: 'Evening',
        activity: sampleDay?.evening.activity || `Sunset views and atmospheric dining`,
        durationHours: 2.5,
        travelTimeMinutes: 15,
        order: 3,
        mealRecommendation: {
          dish: sampleDay?.evening.mealSuggestion || 'Regional gourmet dinner',
          description: 'Authentic dinner experience',
          estimatedCostUSD: dest.costTier === 'high' ? 45 : dest.costTier === 'mid' ? 22 : 9
        },
        tips: 'Advance reservations recommended for scenic terrace tables.'
      });

      itinerary.push({
        dayNumber: dayNum,
        title: sampleDay ? `Day ${dayNum}: ${sampleDay.title}` : `Day ${dayNum}: ${dest.name} Discovery`,
        theme: sampleDay?.title || 'Heritage & Cultural Highlights',
        slots,
        dayTotalEstimatedUSD: sampleDay?.estimatedDailyCostUSD.midRange || (dest.costTier === 'high' ? 180 : dest.costTier === 'mid' ? 90 : 35),
        highlights: sampleDay?.recommendedRoutingOrder || [slots[0].activity, slots[1].activity]
      });
    }

    return itinerary;
  }

  /**
   * Neighborhood guides builder
   */
  private extractNeighborhoodGuides(dest: CanonicalDestination) {
    const acc = dest.accommodationGuide;
    if (!acc) return [];

    const isHigh = dest.costTier === 'high';
    const isMid = dest.costTier === 'mid';

    return [
      {
        name: acc.budgetNeighborhoods || 'Budget Transit Hub',
        bestFor: 'Backpackers, solo travelers & budget-conscious explorers',
        vibe: 'Youthful hostels, vibrant street food, direct train connections',
        avgPricePerNightUSD: isHigh ? 75 : isMid ? 35 : 18
      },
      {
        name: acc.midRangeNeighborhoods || 'Central Character District',
        bestFor: 'Couples, families & culture enthusiasts',
        vibe: 'Charming boutique hotels, neighborhood cafes, walkable to sights',
        avgPricePerNightUSD: isHigh ? 190 : isMid ? 90 : 45
      },
      {
        name: acc.luxuryNeighborhoods || 'Exclusive Luxury Enclave',
        bestFor: 'Luxury seekers & romantic milestone trips',
        vibe: 'Palace hotels, high-end fine dining, serene manicured avenues',
        avgPricePerNightUSD: isHigh ? 650 : isMid ? 320 : 150
      }
    ];
  }

  /**
   * Calculates realistic 3-tier costs based on destination cost tier and trip length
   */
  private calculateCostTiers(
    costTier: 'budget' | 'mid' | 'high',
    days: number
  ): { budget: TravelPlanCostTier; midRange: TravelPlanCostTier; luxury: TravelPlanCostTier } {
    let budgetPerDay = 35;
    let midPerDay = 95;
    let luxuryPerDay = 320;

    let budgetAccom = 18;
    let budgetFood = 10;
    let budgetTransit = 3;
    let budgetActivities = 3;
    let budgetMisc = 1;

    let midAccom = 50;
    let midFood = 25;
    let midTransit = 10;
    let midActivities = 8;
    let midMisc = 2;

    let luxAccom = 190;
    let luxFood = 75;
    let luxTransit = 30;
    let luxActivities = 20;
    let luxMisc = 5;

    if (costTier === 'high') {
      budgetPerDay = 90;
      midPerDay = 240;
      luxuryPerDay = 750;

      budgetAccom = 50;
      budgetFood = 25;
      budgetTransit = 7;
      budgetActivities = 5;
      budgetMisc = 3;

      midAccom = 135;
      midFood = 60;
      midTransit = 20;
      midActivities = 18;
      midMisc = 7;

      luxAccom = 460;
      luxFood = 170;
      luxTransit = 65;
      luxActivities = 40;
      luxMisc = 15;
    } else if (costTier === 'mid') {
      budgetPerDay = 55;
      midPerDay = 145;
      luxuryPerDay = 450;

      budgetAccom = 28;
      budgetFood = 16;
      budgetTransit = 5;
      budgetActivities = 4;
      budgetMisc = 2;

      midAccom = 80;
      midFood = 38;
      midTransit = 14;
      midActivities = 10;
      midMisc = 3;

      luxAccom = 270;
      luxFood = 105;
      luxTransit = 42;
      luxActivities = 25;
      luxMisc = 8;
    }

    return {
      budget: {
        tier: 'budget',
        label: 'Budget Explorer',
        totalPerPersonUSD: budgetPerDay * days,
        perDayPerPersonUSD: budgetPerDay,
        breakdown: {
          accommodationPerDayUSD: budgetAccom,
          foodPerDayUSD: budgetFood,
          localTransitPerDayUSD: budgetTransit,
          activitiesPerDayUSD: budgetActivities,
          miscPerDayUSD: budgetMisc
        },
        accommodationExample: 'Hostel dorms, guesthouses, clean shared-bath b&bs',
        diningStyle: 'Street food markets, bakeries, casual local diners'
      },
      midRange: {
        tier: 'midRange',
        label: 'Comfort & Value',
        totalPerPersonUSD: midPerDay * days,
        perDayPerPersonUSD: midPerDay,
        breakdown: {
          accommodationPerDayUSD: midAccom,
          foodPerDayUSD: midFood,
          localTransitPerDayUSD: midTransit,
          activitiesPerDayUSD: midActivities,
          miscPerDayUSD: midMisc
        },
        accommodationExample: '3-star to 4-star boutique hotels, cozy private Airbnb apartments',
        diningStyle: 'Bistros, family-run trattorias, sit-down local favorites'
      },
      luxury: {
        tier: 'luxury',
        label: 'Luxury & Indulgence',
        totalPerPersonUSD: luxuryPerDay * days,
        perDayPerPersonUSD: luxuryPerDay,
        breakdown: {
          accommodationPerDayUSD: luxAccom,
          foodPerDayUSD: luxFood,
          localTransitPerDayUSD: luxTransit,
          activitiesPerDayUSD: luxActivities,
          miscPerDayUSD: luxMisc
        },
        accommodationExample: '5-star heritage hotels, luxury palace resorts, suites',
        diningStyle: 'Michelin-starred dining, private wine cellars, fine tasting menus'
      }
    };
  }

  /**
   * Helper to estimate cost tier by country name
   */
  private estimateCostTierByCountry(country: string): 'budget' | 'mid' | 'high' {
    const c = (country || '').toLowerCase();
    const highCostCountries = [
      'france', 'switzerland', 'united states', 'usa', 'united kingdom', 'uk', 
      'japan', 'norway', 'iceland', 'denmark', 'sweden', 'singapore', 'australia', 
      'canada', 'italy', 'germany', 'netherlands', 'austria', 'new zealand'
    ];
    const budgetCountries = [
      'india', 'nepal', 'vietnam', 'thailand', 'indonesia', 'cambodia', 'laos', 
      'sri lanka', 'egypt', 'philippines', 'bolivia', 'morocco', 'turkey'
    ];

    if (highCostCountries.some(h => c.includes(h))) return 'high';
    if (budgetCountries.some(b => c.includes(b))) return 'budget';
    return 'mid';
  }

  /**
   * Helper to extract recommended duration number from string like "4 to 6 Days"
   */
  private extractRecommendedDays(str?: string): number {
    if (!str) return 4;
    const match = str.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 4;
  }

  /**
   * Helper to format title case
   */
  private toTitleCase(str: string): string {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  }

  /**
   * Country code / flag emoji helper
   */
  private getCountryFlag(country: string): string {
    const c = (country || '').toLowerCase();
    if (c.includes('france')) return '🇫🇷';
    if (c.includes('india')) return '🇮🇳';
    if (c.includes('japan')) return '🇯🇵';
    if (c.includes('indonesia') || c.includes('bali')) return '🇮🇩';
    if (c.includes('italy')) return '🇮🇹';
    if (c.includes('spain')) return '🇪🇸';
    if (c.includes('united states') || c.includes('usa')) return '🇺🇸';
    if (c.includes('united kingdom') || c.includes('uk')) return '🇬🇧';
    if (c.includes('germany')) return '🇩🇪';
    if (c.includes('switzerland')) return '🇨🇭';
    if (c.includes('australia')) return '🇦🇺';
    if (c.includes('singapore')) return '🇸🇬';
    if (c.includes('thailand')) return '🇹🇭';
    return '🌍';
  }

  /**
   * Reslices an existing plan to a new number of days and updates cost calculations
   */
  reslicePlanDays(originalPlan: TravelPlanData, newDays: number): TravelPlanData {
    if (newDays <= 0) newDays = 3;
    const costTiers = this.calculateCostTiers(
      originalPlan.costTiers.luxury.perDayPerPersonUSD > 600 ? 'high' : 
      originalPlan.costTiers.luxury.perDayPerPersonUSD > 350 ? 'mid' : 'budget',
      newDays
    );

    // Slice or replicate itinerary
    let newItinerary: TravelPlanDay[] = [];
    if (newDays <= originalPlan.itinerary.length) {
      newItinerary = originalPlan.itinerary.slice(0, newDays);
    } else {
      newItinerary = [...originalPlan.itinerary];
      for (let i = originalPlan.itinerary.length; i < newDays; i++) {
        const base = originalPlan.itinerary[i % originalPlan.itinerary.length];
        newItinerary.push({
          ...base,
          dayNumber: i + 1,
          title: `Day ${i + 1}: Extended Discovery & Scenic Leisure`
        });
      }
    }

    return {
      ...originalPlan,
      planDurationDays: newDays,
      costTiers,
      itinerary: newItinerary
    };
  }
}

export const travelPlanService = new TravelPlanService();
