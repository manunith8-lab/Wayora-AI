export type PackageCategory = 'budget' | 'standard' | 'luxury';

export type AccommodationCategory = 
  | 'hostel' 
  | 'budget' 
  | 'homestay' 
  | 'guesthouse' 
  | 'standard' 
  | 'premium' 
  | 'luxury' 
  | 'resort';

export type AttractionCategory = 
  | 'attraction' 
  | 'restaurant' 
  | 'cafe' 
  | 'shopping' 
  | 'market' 
  | 'historical' 
  | 'museum' 
  | 'beach' 
  | 'adventure' 
  | 'cultural' 
  | 'transport'
  | 'nature';

export type TravelStyle = 
  | 'adventure' 
  | 'family' 
  | 'solo' 
  | 'couple' 
  | 'relaxation' 
  | 'cultural' 
  | 'nature' 
  | 'shopping' 
  | 'luxury' 
  | 'budget' 
  | 'photography' 
  | 'spiritual';

export type Season = 'summer' | 'winter' | 'monsoon' | 'spring' | 'autumn';

export interface WeatherInfo {
  tempC: number;
  condition: string;
  humidity: number;
  windKm: number;
  icon: string;
}

export interface DestinationPhoto {
  url: string;
  caption: string;
  category: 'landmark' | 'hotel' | 'activity' | 'food' | 'nature';
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: string;
  tagline: string;
  description: string;
  heroImage: string;
  images: DestinationPhoto[];
  rating: number;
  reviewCount: number;
  coordinates: { lat: number; lng: number };
  bestTimeToVisit: string;
  season: Season[];
  weather: WeatherInfo;
  popularAttractions: string[];
  famousLandmarks: string[];
  bestPlaces: string[];
  seasonalInfo: string;
  accommodationHighlights: string[];
  localRestaurants: string[];
  famousFoods: string[];
  localTransportation: string[];
  shoppingLocations: string[];
  adventureActivities: string[];
  culturalExperiences: string[];
  estimatedExpenses: {
    budget: number; // in USD base
    standard: number;
    luxury: number;
  };
  safetyTips: string[];
  featured?: boolean;
  trending?: boolean;
}

export interface DayItinerary {
  day: number;
  title: string;
  description: string;
  morning: string;
  afternoon: string;
  evening: string;
  meals: string;
  hotel: string;
}

export interface TravelPackage {
  id: string;
  destinationId: string;
  destinationName: string;
  destinationImage: string;
  name: string;
  category: PackageCategory;
  durationDays: number;
  durationNights: number;
  travelersCount: number;
  priceTotalUSD: number;
  pricePerPersonUSD: number;
  accommodation: {
    name: string;
    type: string;
    rating: number;
    photo: string;
    description: string;
    distanceToAttractions: string;
  };
  transportationCostsUSD: number;
  foodExpensesUSD: number;
  sightseeingCostsUSD: number;
  activityCostsUSD: number;
  dayByDayItinerary: DayItinerary[];
  includedFacilities: string[];
  excludedFacilities: string[];
  isVerifiedPrice: boolean;
  highlightBadge: string;
}

export interface Hotel {
  id: string;
  destinationId: string;
  destinationName: string;
  name: string;
  category: AccommodationCategory;
  photo: string;
  gallery: string[];
  location: string;
  distanceToCenter: string;
  distanceToAttractions: string;
  pricePerNightUSD: number;
  rating: number;
  reviewCount: number;
  facilities: string[];
  checkInTime: string;
  checkOutTime: string;
  bookingUrl: string;
  providerName: string;
  verified: boolean;
}

export interface LocalAttraction {
  id: string;
  destinationId: string;
  destinationName: string;
  name: string;
  category: AttractionCategory;
  photo: string;
  description: string;
  location: string;
  coordinates: { lat: number; lng: number };
  rating: number;
  reviewsCount: number;
  estimatedCostUSD: number;
  openingHours: string;
  directionsUrl: string;
}

export interface ItineraryActivity {
  id: string;
  time: string;
  title: string;
  type: 'sightseeing' | 'food' | 'transport' | 'activity' | 'relaxation';
  costUSD: number;
  notes: string;
}

export interface ItineraryDayPlan {
  day: number;
  date: string;
  title: string;
  items: ItineraryActivity[];
}

export interface CustomTripPlan {
  id: string;
  destination: string;
  destinationId?: string;
  startingLocation: string;
  departureDate: string;
  returnDate: string;
  travelers: {
    adults: number;
    children: number;
  };
  totalBudgetUSD: number;
  preferredCurrency: string;
  accommodationPreference: AccommodationCategory;
  transportationPreference: string;
  foodPreference: string;
  preferredAttractions: string[];
  travelStyle: TravelStyle;
  days: ItineraryDayPlan[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  intent?: 'general' | 'destination' | 'package' | 'hotel' | 'itinerary' | 'comparison' | 'budget' | 'food';
  cards?: {
    type: 'destinations' | 'packages' | 'packageComparison' | 'hotels' | 'itinerary' | 'weather' | 'attractions' | 'discovery' | 'foodDiscovery' | 'travelPlan';
    data: any;
  };
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  isArchived: boolean;
  destinationMentioned?: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  type: 'destination' | 'hotel' | 'package' | 'attraction' | 'query';
  timestamp: string;
  count?: number;
}

export interface SavedItem {
  id: string;
  type: 'destination' | 'hotel' | 'package' | 'itinerary';
  itemId: string;
  title: string;
  subtitle: string;
  image: string;
  savedAt: string;
  data: any;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  rateToUSD: number; // 1 USD = rate * Currency
  flag: string;
}

export type SupportedLanguage = 
  | 'en' // English
  | 'hi' // Hindi
  | 'ml' // Malayalam
  | 'kn' // Kannada
  | 'ta' // Tamil
  | 'ar' // Arabic (RTL)
  | 'es' // Spanish
  | 'ja' // Japanese
  | 'zh' // Chinese Simplified
  | 'fr' // French
  | 'de' // German
  | 'pt'; // Portuguese

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  flag: string;
}

export interface TravelPlanCostTier {
  tier: 'budget' | 'midRange' | 'luxury';
  label: string;
  totalPerPersonUSD: number;
  perDayPerPersonUSD: number;
  breakdown: {
    accommodationPerDayUSD: number;
    foodPerDayUSD: number;
    localTransitPerDayUSD: number;
    activitiesPerDayUSD: number;
    miscPerDayUSD: number;
  };
  accommodationExample: string;
  diningStyle: string;
}

export interface TravelPlanDaySlot {
  timeSlot: 'Morning' | 'Afternoon' | 'Evening';
  activity: string;
  attractionName?: string;
  attractionPhoto?: string;
  durationHours: number;
  travelTimeMinutes?: number;
  order: number;
  mealRecommendation?: {
    dish: string;
    description: string;
    estimatedCostUSD: number;
  };
  tips?: string;
  photographyTip?: string;
}

export interface TravelPlanDay {
  dayNumber: number;
  title: string;
  theme: string;
  slots: TravelPlanDaySlot[];
  dayTotalEstimatedUSD: number;
  highlights: string[];
}

export interface TravelPlanData {
  destinationId: string;
  destinationName: string;
  country: string;
  flagEmoji: string;
  bannerPhoto?: string;
  tagline: string;
  recommendedDurationDays: number;
  planDurationDays: number;
  bestTimeToVisit: {
    season: string;
    months: string;
    weatherSummary: string;
    avoidMonths?: string;
  };
  transitGuide: {
    nearestAirports: string[];
    railwayConnectivity?: string[];
    localTransportTips: string[];
    airportToCityEstimateUSD: number;
  };
  neighborhoodGuides: {
    name: string;
    bestFor: string;
    vibe: string;
    avgPricePerNightUSD: number;
  }[];
  costTiers: {
    budget: TravelPlanCostTier;
    midRange: TravelPlanCostTier;
    luxury: TravelPlanCostTier;
  };
  itinerary: TravelPlanDay[];
  photographySpots?: {
    spot: string;
    bestTime: string;
    tip: string;
  }[];
  localDishes?: {
    name: string;
    category: 'street' | 'traditional' | 'fine' | 'beverage';
    description: string;
    priceRangeUSD: string;
  }[];
  seasonalAdvisory?: string;
}
