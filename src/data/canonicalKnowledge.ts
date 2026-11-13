// Canonical Global Destination & Attraction Knowledge Database
// Provides verified, high-accuracy destination hierarchies, iconic attractions, verified photography,
// and practical travel-planning blueprints (costs, day-wise itineraries, transit, neighborhoods) worldwide.

export type GeographicType = 'country' | 'state_region' | 'city_destination' | 'attraction';

export interface CanonicalAttraction {
  id: string;
  name: string;
  category: 'MUST_VISIT' | 'NATURE_ADVENTURE' | 'HIDDEN_GEMS' | 'HISTORY_CULTURE' | 'PHOTOGRAPHY';
  description: string;
  whyFamous: string;
  coordinates: { lat: number; lng: number };
  distanceFromCenter?: string;
  bestTimeToVisit?: string;
  recommendedDuration?: string;
  entryFee?: string;
  openingHours?: string;
  photoUrl?: string; // Strictly verified photograph only; undefined if not verified
  googleMapsUrl?: string;
  aliases?: string[];
  sitelinksCount?: number;
  accessibilityNotice?: string;
}

export interface DayItineraryPlan {
  day: number;
  title: string;
  morning: { activity: string; duration: string; tips?: string };
  afternoon: { activity: string; duration: string; mealSuggestion: string };
  evening: { activity: string; duration: string; mealSuggestion: string };
  estimatedDailyCostUSD: { budget: number; midRange: number; luxury: number };
  recommendedRoutingOrder: string[];
}

export interface CanonicalDestination {
  id: string;
  name: string;
  type: GeographicType;
  country: string;
  stateOrRegion?: string;
  parentDestinationId?: string;
  aliases: string[];
  costTier: 'budget' | 'mid' | 'high'; // Economical index of destination
  overview: {
    introduction: string;
    famousFor: string[];
    bestTimeToVisit: string;
    climate: string;
    localCulture: string;
    languages: string[];
    howToReach: string;
    recommendedDuration: string;
    importantConsiderations: string[];
  };
  coordinates: { lat: number; lng: number };
  heroPhoto?: string;
  subDestinations?: {
    id: string;
    name: string;
    tagline: string;
    highlights: string[];
    heroPhoto?: string;
  }[];
  attractions?: CanonicalAttraction[];
  foodAndCuisine?: {
    traditionalDishes: { name: string; description: string; isVegetarian?: boolean }[];
    popularFoodStreetsOrSpots: string[];
  };
  transportationInfo?: {
    nearestAirport: string;
    nearestRailway?: string;
    intercityConnectivity: string;
    localTransit: string[];
    approxTravelTimes: string[];
  };
  accommodationGuide?: {
    budgetNeighborhoods: string;
    midRangeNeighborhoods: string;
    luxuryNeighborhoods: string;
    indicativeDailyPriceUSD: { budget: string; midRange: string; luxury: string };
  };
  sampleItinerary?: DayItineraryPlan[];
  seasonalAccessibilityNotes?: { seasonOrMonth: string; note: string }[];
}

export const CANONICAL_DESTINATIONS: Record<string, CanonicalDestination> = {
  // ==========================================
  // HIMACHAL PRADESH, INDIA (STATE / REGION)
  // ==========================================
  'himachal_pradesh': {
    id: 'himachal_pradesh',
    name: 'Himachal Pradesh',
    type: 'state_region',
    country: 'India',
    aliases: ['himachal', 'himachal pradesh', 'hp', 'devbhoomi', 'himachal india'],
    costTier: 'budget',
    coordinates: { lat: 31.1048, lng: 77.1734 },
    heroPhoto: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    overview: {
      introduction: 'Himachal Pradesh, renowned as "Devbhoomi" (Land of the Gods), is a Himalayan state in Northern India celebrated for snow-capped alpine peaks, rushing river valleys, pine-scented hill stations, Tibetan Buddhist monasteries, and world-class adventure sports.',
      famousFor: ['Rohtang Pass & Atal Tunnel', 'Solang Valley skiing & paragliding', 'Shimla colonial Mall Road & UNESCO Toy Train', 'Dharamshala & McLeodGanj (Home of the Dalai Lama)', 'Parvati Valley & Kasol trekking', 'High-altitude cold desert of Spiti Valley'],
      bestTimeToVisit: 'March to June (Pleasant spring/summer weather) & October to February (Snowfall, winter sports, and frozen landscapes)',
      climate: 'Varies from temperate in lower valleys to sub-arctic alpine in Spiti and high mountain passes',
      localCulture: 'Rich Pahari folk traditions, Himachali cap and shawls, wooden Kath Kuni architecture, and peaceful Tibetan Buddhist spirituality',
      languages: ['Hindi', 'Pahari dialects (Kangri, Mandeali, Kulvi)', 'English'],
      howToReach: 'Kullu-Manali Airport at Bhuntar (KUU); Kangra Airport at Gaggal (DHM); Shimla Airport at Jubbarhatti (SLV); Broad-gauge rail terminus at Chandigarh (CDG) and Kalka (KLK UNESCO toy train connection)',
      recommendedDuration: '7 to 12 Days to cover major circuits (e.g. Shimla-Kullu-Manali or Dharamshala-Dalhousie)',
      importantConsiderations: [
        'Rohtang Pass is closed in winter (late November to May); Atal Tunnel provides year-round access to Lahaul and Sissu.',
        'High-altitude destinations like Spiti require gradual acclimatization to avoid Acute Mountain Sickness (AMS).',
        'Pre-booking permits online via the Himachal Tourism portal is mandatory for vehicular entry to Rohtang Pass.',
      ],
    },
    transportationInfo: {
      nearestAirport: 'Bhuntar Airport (KUU) for Kullu-Manali; Chandigarh International Airport (IXC) 270 km south (6–8 hrs drive)',
      nearestRailway: 'Chandigarh Junction (CDG) & Kalka (KLK) with Shatabdi and Vande Bharat connectivity from New Delhi',
      intercityConnectivity: 'Himachal Road Transport Corporation (HRTC) operates luxury Volvo and Scania buses connecting Delhi, Chandigarh, Shimla, and Manali continuously',
      localTransit: [
        'Dedicated tourist taxis (Innova, Ertiga, Alto) booked through local taxi unions',
        'Self-drive rental cars and Royal Enfield motorbikes widely available in Manali, Shimla, and Dharamshala',
        'Local HRTC mountain buses connecting interior villages',
      ],
      approxTravelTimes: [
        'Chandigarh to Shimla: 3.5 to 4 hrs via Himalayan Expressway',
        'Chandigarh to Manali: 6.5 to 7.5 hrs via Kiratpur-Nerchowk 4-lane expressway',
        'Manali to Atal Tunnel & Sissu: 45–60 mins',
        'Manali to Dharamshala: 6 to 7 hrs',
      ],
    },
    accommodationGuide: {
      budgetNeighborhoods: 'Old Manali, Kasol backpacker camps, Bhagsu Nag / Dharamkot (Dharamshala)',
      midRangeNeighborhoods: 'Naggar (apple orchard boutique cottages), Vashisht (hot spring lodges), Chotta Shimla, Mashobra',
      luxuryNeighborhoods: 'Wildflower Hall (Oberoi Shimla), The Himalayan (Castle hotel Manali), Norwood Green (Palampur tea estate)',
      indicativeDailyPriceUSD: {
        budget: '$15–$30 (Hostels and wooden riverside homestays)',
        midRange: '$50–$110 (Boutique mountain retreats and 4-star hotels)',
        luxury: '$220–$550+ (Heritage 5-star mountain estates and luxury forest glamping)',
      },
    },
    subDestinations: [
      {
        id: 'manali',
        name: 'Manali',
        tagline: 'Adventure & Snow Capital with Rohtang Pass, Solang Valley, apple orchards, and bohemian Old Manali',
        highlights: ['Atal Tunnel', 'Solang Valley paragliding', 'Rohtang Pass', 'Hadimba Temple', 'Old Manali cafes'],
        heroPhoto: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'shimla',
        name: 'Shimla',
        tagline: 'Colonial British Summer Capital set across pine ridges with the iconic Mall Road, Ridge, and Kalka Toy Train',
        highlights: ['The Ridge & Christ Church', 'UNESCO Kalka-Shimla Toy Train', 'Jakhoo Hill & Hanuman Temple', 'Viceregal Lodge', 'Mall Road'],
        heroPhoto: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'dharamshala',
        name: 'Dharamshala & McLeodGanj',
        tagline: 'Little Lhasa in the Himalayas: Spiritual seat of His Holiness the Dalai Lama and gateway to the Triund trek',
        highlights: ['Tsuglagkhang Complex (Dalai Lama Temple)', 'Triund Mountain Trek', 'Bhagsunag Waterfall', 'Norbulingka Tibetan Cultural Institute', 'St. John in the Wilderness'],
        heroPhoto: 'https://images.unsplash.com/photo-1605649487212-47bdab064df8?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'kasol-parvati',
        name: 'Kasol & Parvati Valley',
        tagline: 'Backpacker haven along the pristine Parvati River surrounded by cedar forests, hot springs, and alpine trekking trails',
        highlights: ['Kheerganga natural sulfur hot springs trek', 'Tosh village vistas', 'Chalal riverside pine trail', 'Malana heritage village'],
        heroPhoto: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'spiti-valley',
        name: 'Spiti Valley',
        tagline: 'The Middle Land: Trans-Himalayan cold mountain desert with 1000-year-old cliffside monasteries and turquoise Chandratal lake',
        highlights: ['Key Monastery (1000+ yrs old)', 'Chandratal Lake (Moon Lake)', 'Hikkim (World\'s Highest Post Office)', 'Komic & Langza fossil villages'],
        heroPhoto: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
      },
    ],
    foodAndCuisine: {
      traditionalDishes: [
        { name: 'Siddu with Ghee', description: 'Steamed wheat flour dumpling stuffed with ground walnuts, poppy seeds, and spices, served drenched in melted desi ghee.' },
        { name: 'Himachali Dhaam', description: 'Festive satvik feast of Madra (chickpeas in yogurt gravy), Sepu Vadi, Kadi, and sweet Meetha cooked without onion or garlic in copper vessels.' },
        { name: 'Pan-Fried Himalayan Trout', description: 'Fresh trout from the icy Tirthan or Beas rivers lightly dusted with spices and pan-fried with lemon herb butter.' },
        { name: 'Chha Gosht', description: 'Tender marinated mountain mutton slow-cooked in a tangy spiced yogurt and gram flour gravy with cardamom.' },
      ],
      popularFoodStreetsOrSpots: ['Old Manali Cafe Strip', 'Shimla Mall Road & Lakkar Bazar', 'McLeodGanj Temple Road bakeries'],
    },
  },

  // ==========================================
  // KERALA, INDIA (STATE / REGION)
  // ==========================================
  'kerala': {
    id: 'kerala',
    name: 'Kerala',
    type: 'state_region',
    country: 'India',
    aliases: ['gods own country', 'kerala india', 'god\'s own country', 'malabar'],
    costTier: 'budget',
    coordinates: { lat: 10.8505, lng: 76.2711 },
    heroPhoto: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    overview: {
      introduction: 'Kerala, known worldwide as "God’s Own Country", is a tropical paradise in Southern India famous for tranquil emerald backwaters, rolling tea estates of Munnar, ayurvedic wellness retreats, golden Arabian Sea beaches, and spice-scented heritage towns.',
      famousFor: ['Alleppey backwater houseboats', 'Munnar rolling tea plantations & Anamudi Peak', 'Fort Kochi Chinese fishing nets & colonial architecture', 'Wayanad rainforests & wildlife sanctuaries', 'Authentic Ayurvedic rejuvenation', 'Varkala cliff beach sunsets'],
      bestTimeToVisit: 'September to March (Pleasant tropical warmth, backwater cruises, and festival season) & June to August (Ayurvedic rejuvenation during lush monsoons)',
      climate: 'Tropical wet maritime; temperatures stay between 23°C and 32°C year-round with abundant rainfall',
      localCulture: 'Kathakali classical dance drama, Kalaripayattu martial arts, Theyyam ritual performances, and temple boat races (Vallam Kali)',
      languages: ['Malayalam', 'English (widely spoken and high literacy)', 'Tamil', 'Hindi'],
      howToReach: 'Cochin International Airport (COK - world\'s first fully solar-powered airport); Trivandrum (TRV); Calicut (CCJ); Kannur (CNN); Excellent railway connectivity on Southern Railway along the coastal corridor',
      recommendedDuration: '7 to 10 Days for classic circuit (Kochi - Munnar - Thekkady - Alleppey - Marari/Varkala)',
      importantConsiderations: [
        'Book premium private houseboats in Alleppey/Kumarakom with verified air conditioning and chef on board.',
        'Carry light cottons and waterproof layers; rain showers can be sudden and lush.',
      ],
    },
    transportationInfo: {
      nearestAirport: 'Cochin International Airport (COK) - major international and domestic hub',
      nearestRailway: 'Ernakulam Junction (ERS) / Ernakulam Town (ERN) with high-speed Vande Bharat and Rajdhani express trains',
      intercityConnectivity: 'State KSRTC buses, prepaid intercity private cars with English-speaking chauffeurs, and state water transport ferries in backwaters',
      localTransit: [
        'Kochi Water Metro and modern Metro rail in Ernakulam',
        'State Water Transport Department (SWTD) public ferries in Alleppey (scenic and very cheap: ₹10–₹25)',
        'Prepaid auto-rickshaws and Uber/Ola in urban centers',
      ],
      approxTravelTimes: [
        'Kochi Airport to Fort Kochi: 1 to 1.5 hrs',
        'Kochi to Munnar: 3.5 to 4 hrs scenic mountain ascent (130 km)',
        'Munnar to Thekkady (Periyar): 3 to 3.5 hrs (90 km)',
        'Thekkady to Alleppey: 3.5 to 4 hrs (140 km)',
      ],
    },
    accommodationGuide: {
      budgetNeighborhoods: 'Fort Kochi heritage homestays, Varkala cliff guesthouses, Old Munnar town',
      midRangeNeighborhoods: 'Munnar tea estate bungalows, Alleppey backwater boutique canal resorts (Punnamada, Lake Palace)',
      luxuryNeighborhoods: 'Kumarakom Lake Resort, Brunton Boatyard (CGH Earth Fort Kochi), The Leela Kovalam',
      indicativeDailyPriceUSD: {
        budget: '$15–$35 (Heritage homestays and beach cliff huts)',
        midRange: '$55–$130 (Tea estate private chalets and boutique backwater resorts)',
        luxury: '$220–$600+ (5-star private pool villas and premier luxury houseboats)',
      },
    },
    subDestinations: [
      {
        id: 'munnar',
        name: 'Munnar',
        tagline: 'Misty rolling hills covered in endless tea gardens, cool mountain breezes, and endangered Nilgiri Tahr',
        highlights: ['Eravikulam National Park', 'Mattupetty Dam & Eco Point', 'Tea Museum & Tata Tea Estate', 'Top Station viewpoint', 'Attukad Waterfalls'],
        heroPhoto: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'alleppey',
        name: 'Alleppey (Alappuzha)',
        tagline: 'Venice of the East: Labyrinth of palm-fringed backwater canals, traditional kettuvallam houseboats, and paddy fields below sea level',
        highlights: ['Overnight private houseboat cruise', 'Vembanad Lake sunset', 'Marari white sand beach', 'Kuttanad below-sea-level farming'],
        heroPhoto: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'fort-kochi',
        name: 'Fort Kochi',
        tagline: 'Historic seaside town blending Portuguese, Dutch, British, and Jewish heritage with iconic cantilevered Chinese fishing nets',
        highlights: ['Chinese Fishing Nets at sunset', 'Jew Town & Paradesi Synagogue', 'Mattancherry Dutch Palace', 'St. Francis Church', 'Kathakali evening show'],
        heroPhoto: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'wayanad',
        name: 'Wayanad',
        tagline: 'Lush green highland paradise of prehistoric rock art caves, spice plantations, mist-covered peaks, and elephant corridors',
        highlights: ['Edakkal Caves (Stone Age petroglyphs)', 'Banasura Sagar Dam (largest earthen dam in India)', 'Chembra Peak heart-shaped lake', 'Kuruva Island bamboo rafting'],
        heroPhoto: 'https://images.unsplash.com/photo-1606210174045-0180aff5c68b?auto=format&fit=crop&w=800&q=80',
      },
    ],
    foodAndCuisine: {
      traditionalDishes: [
        { name: 'Appam with Vegetable / Chicken Stew (Ishtu)', description: 'Crisp-edged fluffy fermented rice pancakes paired with creamy coconut milk stew scented with ginger, curry leaves, and black pepper.' },
        { name: 'Karimeen Pollichathu (Pearl Spot Fish)', description: 'Fresh pearl spot fish marinated in shallots, green chillies, and ginger paste, wrapped in a banana leaf and pan-roasted to tender perfection.' },
        { name: 'Traditional Kerala Sadya', description: 'Grand vegetarian banquet of 24+ dishes served on a fresh plantain leaf including Avial, Sambar, Olan, Thoran, Payasam, and red rice.' },
        { name: 'Malabar Dum Biryani', description: 'Fragrant short-grain Khyma rice slow-cooked with tender spiced chicken, fried onions, cashews, and sultanas in sealed handi.' },
      ],
      popularFoodStreetsOrSpots: ['Fort Kochi seafood cafes', 'Kozhikode SM Street (Halwa & Biryani)', 'Munnar town tea stalls'],
    },
  },

  // ==========================================
  // PARIS, FRANCE
  // ==========================================
  'paris': {
    id: 'paris',
    name: 'Paris',
    type: 'city_destination',
    country: 'France',
    stateOrRegion: 'Île-de-France',
    aliases: ['city of light', 'paris france', 'paname', 'ville lumiere'],
    costTier: 'high',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    heroPhoto: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    overview: {
      introduction: 'Paris, the capital of France, is an international center for art, fashion, gastronomy, and architectural heritage. The city is celebrated for its historic 19th-century boulevards, world-class art collections, cafe culture, and iconic landmarks along the River Seine.',
      famousFor: ['Eiffel Tower', 'Louvre Museum art collections', 'Haussmannian architecture', 'Haute cuisine & bistros', 'Seine riverbanks', 'Fashion & luxury boutiques'],
      bestTimeToVisit: 'April to June (Spring blooms & outdoor terraces) & September to November (Pleasant autumn weather)',
      climate: 'Oceanic climate; warm summers (20°C–26°C), cool winters (3°C–8°C), rainfall distributed evenly throughout the year',
      localCulture: 'Artisan boulangeries, sidewalk terrace dining, museum hopping, and leisurely evening strolls (flânerie)',
      languages: ['French', 'English (widely understood in tourism areas)'],
      howToReach: 'Charles de Gaulle Airport (CDG) 25 km north; Paris-Orly Airport (ORY) 15 km south; Eurostar and TGV high-speed rail at Gare du Nord and Gare de Lyon',
      recommendedDuration: '4 to 6 Days for a well-rounded visit; 2–3 days for key highlights',
      importantConsiderations: [
        'Pre-book Louvre and Eiffel Tower summit tickets 3–4 weeks in advance to avoid 2-hour lines.',
        'Beware of pickpockets on Metro Line 1 and near major monuments.',
        'Most museums and major sites offer discounted/free entry under the Paris Museum Pass.',
      ],
    },
    transportationInfo: {
      nearestAirport: 'Paris Charles de Gaulle (CDG) - 45 mins via RER B train; Orly Airport (ORY) - 30 mins via OrlyBus/Metro Line 14',
      nearestRailway: 'Gare du Nord (Eurostar/Thalys), Gare de Lyon (TGV to Switzerland/South)',
      intercityConnectivity: 'Direct TGV high-speed trains to Lyon, Marseille, Brussels, Amsterdam, London, and Geneva',
      localTransit: [
        'Paris Métro (16 numbered lines spanning the entire city)',
        'RER Regional Express Trains (Lines A, B, C connecting suburbs & Versailles)',
        'Vélib’ public bike-sharing network',
        'Bateaux-Mouches and Batobus river shuttles on the Seine',
      ],
      approxTravelTimes: [
        'Eiffel Tower to Louvre: 15–20 mins by Metro Line 8/1 or 35 mins scenic river walk',
        'Center Paris to Palace of Versailles: 45–55 mins by RER Line C',
        'Louvre to Montmartre/Sacré-Cœur: 25 mins by Metro Line 12',
      ],
    },
    accommodationGuide: {
      budgetNeighborhoods: '11th & 20th Arrondissements (Bastille, Belleville), 13th Arrondissement (Place d’Italie), Montmartre hostels',
      midRangeNeighborhoods: '9th Arrondissement (Opéra/South Pigalle), 14th (Montparnasse), 5th (Latin Quarter), 4th (Le Marais edge)',
      luxuryNeighborhoods: '1st & 8th Arrondissements (Champs-Élysées, Place Vendôme), 7th Arrondissement (Eiffel Tower views)',
      indicativeDailyPriceUSD: {
        budget: '$45–$80 (Hostels & simple guesthouses)',
        midRange: '$160–$280 (3–4 star boutique hotels)',
        luxury: '$550–$1,400+ (5-star luxury palaces e.g. Ritz, Plaza Athénée)',
      },
    },
    attractions: [
      {
        id: 'paris-eiffel-tower',
        name: 'Eiffel Tower',
        category: 'MUST_VISIT',
        description: 'Gustave Eiffel’s world-famous 330-metre wrought-iron lattice monument erected for the 1889 Exposition Universelle, offering 3 tiers of panoramic observation platforms.',
        whyFamous: 'The definitive universal symbol of Paris, featuring sweeping 360-degree skyline views and sparkling light displays every evening after dusk.',
        coordinates: { lat: 48.8584, lng: 2.2945 },
        distanceFromCenter: 'Champ de Mars, 7th Arrondissement',
        bestTimeToVisit: 'Late afternoon to sunset (5:30 PM–7:30 PM); book summit tickets online weeks ahead',
        recommendedDuration: '2 to 3 Hours',
        entryFee: '€21.50–€35.30 (Summit lift ticket)',
        openingHours: '9:00 AM – 11:45 PM',
        photoUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Eiffel+Tower+Paris',
        sitelinksCount: 160,
      },
      {
        id: 'paris-louvre',
        name: 'Louvre Museum (Musée du Louvre)',
        category: 'MUST_VISIT',
        description: 'The world\'s most renowned art museum housed in the former royal fortress palace, entered via I.M. Pei\'s iconic glass pyramid and housing over 35,000 precious works.',
        whyFamous: 'Permanent home of Leonardo da Vinci’s Mona Lisa, the Venus de Milo, the Winged Victory of Samothrace, and majestic French crown jewels.',
        coordinates: { lat: 48.8606, lng: 2.3376 },
        distanceFromCenter: '1st Arrondissement (Right Bank)',
        bestTimeToVisit: 'Wednesday and Friday evenings (open until 9:45 PM with fewer crowds)',
        recommendedDuration: '3 to 5 Hours',
        entryFee: '€22 (Advance online reservation mandatory)',
        openingHours: '9:00 AM – 6:00 PM (Closed Tuesdays)',
        photoUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Louvre+Museum+Paris',
        sitelinksCount: 145,
      },
      {
        id: 'paris-notre-dame',
        name: 'Notre-Dame Cathedral (Cathédrale Notre-Dame de Paris)',
        category: 'MUST_VISIT',
        description: 'Triumph of French Gothic sacred architecture dating to 1163 CE on the historic Île de la Cité, celebrated for its soaring twin towers, stained-glass rose windows, and flying buttresses.',
        whyFamous: 'Heart of medieval Paris immortalized in Victor Hugo’s literature, meticulously rebuilt and reopened following the heroic 2019 restoration.',
        coordinates: { lat: 48.8530, lng: 2.3499 },
        distanceFromCenter: 'Île de la Cité, 4th Arrondissement',
        bestTimeToVisit: 'Morning 9:00 AM–11:00 AM for soft stained-glass light',
        recommendedDuration: '1.5 to 2 Hours',
        entryFee: 'Free entry to main nave; tower climb ticket separate',
        openingHours: '8:00 AM – 6:45 PM',
        // Verified Notre Dame facade photo
        photoUrl: 'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=800&q=80',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Notre+Dame+Cathedral+Paris',
        sitelinksCount: 130,
      },
      {
        id: 'paris-arc-de-triomphe',
        name: 'Arc de Triomphe',
        category: 'MUST_VISIT',
        description: 'Monumental triumphal arch commissioned by Napoleon in 1806 standing atop the Champs-Élysées at the center of the radiating Étoile roundel.',
        whyFamous: 'Tomb of the Unknown Soldier with the Eternal Flame, and rooftop views looking straight down the Avenue des Champs-Élysées toward the Louvre and La Défense.',
        coordinates: { lat: 48.8738, lng: 2.2950 },
        distanceFromCenter: 'Place Charles de Gaulle, 8th Arrondissement',
        bestTimeToVisit: 'Sunset to blue hour (6:00 PM–7:30 PM)',
        recommendedDuration: '1 to 1.5 Hours',
        entryFee: '€16 adult (Free under 18 and for EU residents under 26)',
        openingHours: '10:00 AM – 10:30 PM',
        photoUrl: 'https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=800&q=80',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Arc+de+Triomphe+Paris',
        sitelinksCount: 110,
      },
      {
        id: 'paris-sacre-coeur-montmartre',
        name: 'Montmartre & Sacré-Cœur Basilica',
        category: 'HISTORY_CULTURE',
        description: 'Romantic hillside village of cobblestone streets and artist studios topped by the Byzantine-Romanesque white travertine Basilica of Sacré-Cœur.',
        whyFamous: 'Highest natural vantage point in Paris overlooking the whole metropolis, Place du Tertre portrait painters, and storied bohemian history.',
        coordinates: { lat: 48.8867, lng: 2.3431 },
        distanceFromCenter: '18th Arrondissement',
        bestTimeToVisit: 'Late afternoon through twilight for street musicians on the steps',
        recommendedDuration: '2 to 3 Hours',
        entryFee: 'Free basilica entry; €8 dome panorama climb',
        openingHours: '6:30 AM – 10:30 PM',
        photoUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sacre+Coeur+Montmartre+Paris',
        sitelinksCount: 95,
      },
      {
        id: 'paris-versailles',
        name: 'Palace of Versailles (Château de Versailles)',
        category: 'MUST_VISIT',
        description: 'The supreme royal residence of the Sun King Louis XIV, encompassing the breathtaking Hall of Mirrors, King’s Grand Apartments, and 800 hectares of classical fountains and parkland.',
        whyFamous: 'Peerless royal French baroque opulence, site of the 1919 Treaty of Versailles, and grand musical fountain garden shows.',
        coordinates: { lat: 48.8049, lng: 2.1204 },
        distanceFromCenter: '20 km southwest of Paris (RER C train 45 mins)',
        bestTimeToVisit: 'Tuesday to Friday morning 9:00 AM (Passport ticket with timed slot)',
        recommendedDuration: 'Full Day Excursion (4 to 6 Hours)',
        entryFee: '€24–€32 (Passport ticket including Gardens and Trianon estates)',
        openingHours: '9:00 AM – 6:30 PM (Closed Mondays)',
        photoUrl: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=800&q=80',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Palace+of+Versailles',
        sitelinksCount: 120,
      },
      {
        id: 'paris-sainte-chapelle',
        name: 'Sainte-Chapelle',
        category: 'HISTORY_CULTURE',
        description: '13th-century Gothic royal chapel built by King Saint Louis on the Île de la Cité to house Christ\'s Crown of Thorns, famed for 15-metre soaring stained-glass windows.',
        whyFamous: 'Considered one of the greatest artistic achievements of the Christian world, with 1,113 biblical scenes bathed in kaleidoscopic jewel tones.',
        coordinates: { lat: 48.8554, lng: 2.3450 },
        distanceFromCenter: 'Île de la Cité, 1st Arrondissement',
        bestTimeToVisit: 'Midday on a clear sunny day for maximum stained-glass luminosity',
        recommendedDuration: '1 Hour',
        entryFee: '€13 (Combined ticket with Conciergerie available)',
        openingHours: '9:00 AM – 7:00 PM',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sainte+Chapelle+Paris',
        sitelinksCount: 65,
      },
      {
        id: 'paris-luxembourg-gardens',
        name: 'Luxembourg Gardens (Jardin du Luxembourg)',
        category: 'PHOTOGRAPHY',
        description: '23-hectare formal landscaped palace garden commissioned in 1612 by Marie de\' Medici, featuring geometric lawns, chestnut groves, Medici Fountain, and vintage toy sailboats.',
        whyFamous: 'The archetypal Parisian park relaxation spot with green metal chairs around the Grand Bassin and statues of French queens.',
        coordinates: { lat: 48.8462, lng: 2.3372 },
        distanceFromCenter: '6th Arrondissement (Left Bank / Latin Quarter)',
        bestTimeToVisit: 'Sunny afternoon 2:00 PM – 5:00 PM',
        recommendedDuration: '1 to 2 Hours',
        entryFee: 'Free entry',
        openingHours: '7:30 AM – Sunset',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Jardin+du+Luxembourg+Paris',
      },
    ],
    sampleItinerary: [
      {
        day: 1,
        title: 'Iconic Landmarks & The Romantic Seine',
        morning: {
          activity: 'Ascend the Eiffel Tower (Summit or 2nd floor platform) and take morning photographs across the Champ de Mars.',
          duration: '2.5 Hours',
          tips: 'Pre-book the 9:30 AM lift slot online 3 weeks prior.',
        },
        afternoon: {
          activity: 'Stroll across Pont de Bir-Hakeim to Trocadéro Gardens, then take a scenic Seine River cruise (Bateaux Parisiens).',
          duration: '2 Hours',
          mealSuggestion: 'Lunch at a traditional Left Bank bistro (Café de l’Alma or Les Cocottes on Rue Saint-Dominique).',
        },
        evening: {
          activity: 'Walk up the Champs-Élysées to the Arc de Triomphe rooftop to watch Paris illuminate at twilight.',
          duration: '2 Hours',
          mealSuggestion: 'Classic French onion soup and steak frites in the 8th Arrondissement.',
        },
        estimatedDailyCostUSD: { budget: 45, midRange: 120, luxury: 380 },
        recommendedRoutingOrder: ['Eiffel Tower', 'Champ de Mars', 'Seine River Cruise', 'Champs-Élysées', 'Arc de Triomphe'],
      },
      {
        day: 2,
        title: 'Art Masterpieces & Historic Medieval Islands',
        morning: {
          activity: 'Explore the Louvre Museum (Denon Wing for Mona Lisa & Winged Victory, Sully Wing for Venus de Milo).',
          duration: '3.5 Hours',
          tips: 'Enter via Porte des Lions or Carrousel du Louvre underground mall to skip main pyramid queues.',
        },
        afternoon: {
          activity: 'Cross Pont Neuf onto the Île de la Cité to marvel at the restored Cathédrale Notre-Dame and Sainte-Chapelle stained glass.',
          duration: '2.5 Hours',
          mealSuggestion: 'Artisan sandwiches or savory galettes near Saint-Michel / Latin Quarter.',
        },
        evening: {
          activity: 'Browse vintage bookstalls (Bouquinistes) along the Seine, then wander the narrow cobblestone alleys of the Latin Quarter.',
          duration: '2 Hours',
          mealSuggestion: 'Traditional dinner at Le Coupe-Chou or Bouillon Racine.',
        },
        estimatedDailyCostUSD: { budget: 40, midRange: 110, luxury: 320 },
        recommendedRoutingOrder: ['Louvre Museum', 'Pont Neuf', 'Île de la Cité', 'Notre-Dame', 'Sainte-Chapelle', 'Latin Quarter'],
      },
      {
        day: 3,
        title: 'Royal Grandeur: Versailles Day Excursion',
        morning: {
          activity: 'Take RER C train from Saint-Michel to Versailles-Château-Rive-Gauche (45 mins). Tour the Royal State Apartments and Hall of Mirrors.',
          duration: '3 Hours',
          tips: 'Passport ticket with 9:30 AM entry gives full estate access.',
        },
        afternoon: {
          activity: 'Walk the Grand Canal gardens, explore Marie Antoinette’s picturesque Queen’s Hamlet and the Grand Trianon.',
          duration: '2.5 Hours',
          mealSuggestion: 'Crepes or lunch at La Flottille by the Grand Canal in Versailles.',
        },
        evening: {
          activity: 'Return to Paris for sunset drinks and garden relaxation at the Jardin du Luxembourg.',
          duration: '2 Hours',
          mealSuggestion: 'Duck confit and red wine in Saint-Germain-des-Prés.',
        },
        estimatedDailyCostUSD: { budget: 50, midRange: 130, luxury: 420 },
        recommendedRoutingOrder: ['RER C Train', 'Château de Versailles', 'Hall of Mirrors', 'Gardens & Hamlet', 'Jardin du Luxembourg'],
      },
      {
        day: 4,
        title: 'Bohemian Heights & Trendy Le Marais',
        morning: {
          activity: 'Climb the stairs of Montmartre to Sacré-Cœur Basilica, visit Place du Tertre portrait artists, and see Moulin de la Galette.',
          duration: '3 Hours',
          tips: 'Visit early at 8:30 AM to enjoy silent cobbled streets before tour groups arrive.',
        },
        afternoon: {
          activity: 'Explore Le Marais historic district, visit Place des Vosges (Victor Hugo’s house), and browse independent design boutiques.',
          duration: '2.5 Hours',
          mealSuggestion: 'Famous warm pita falafel from L’As du Fallafel on Rue des Rosiers.',
        },
        evening: {
          activity: 'Walk along the illuminated Pont des Arts and enjoy a relaxed evening listening to jazz along the Seine.',
          duration: '2 Hours',
          mealSuggestion: 'Celebratory French dinner at historic Bouillon Chartier or a Michelin-starred bistro.',
        },
        estimatedDailyCostUSD: { budget: 35, midRange: 105, luxury: 340 },
        recommendedRoutingOrder: ['Montmartre', 'Sacré-Cœur', 'Place du Tertre', 'Le Marais', 'Place des Vosges', 'Pont des Arts'],
      },
    ],
    foodAndCuisine: {
      traditionalDishes: [
        { name: 'Traditional French Butter Croissant', description: 'Multi-layered flaky golden viennoiserie made with pure churned Charentes butter.', isVegetarian: true },
        { name: 'Boeuf Bourguignon', description: 'Charolais beef slowly braised in red Burgundy wine with pearl onions, lardons, and fresh thyme.' },
        { name: 'French Onion Soup (Soupe à l\'Oignon)', description: 'Caramelized sweet onion broth topped with crusty baguette and melted aged Comté cheese.' },
        { name: 'Macarons from Ladurée & Pierre Hermé', description: 'Delicate crisp almond meringue confections filled with chocolate ganache, pistachio, or salted butter caramel.', isVegetarian: true },
      ],
      popularFoodStreetsOrSpots: ['Rue Cler (7th Arrondissement)', 'Rue Montorgueil (2nd Arrondissement)', 'Rue des Rosiers (Le Marais)'],
    },
  },

  // ==========================================
  // MANALI, HIMACHAL PRADESH, INDIA
  // ==========================================
  'manali': {
    id: 'manali',
    name: 'Manali',
    type: 'city_destination',
    country: 'India',
    stateOrRegion: 'Himachal Pradesh',
    parentDestinationId: 'himachal-pradesh',
    aliases: ['kullu manali', 'manali town', 'valley of gods', 'manali himachal'],
    costTier: 'budget',
    coordinates: { lat: 32.2432, lng: 77.1892 },
    heroPhoto: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80',
    overview: {
      introduction: 'Perched at an altitude of 2,050 metres in the Beas River Valley, Manali is India’s premier Himalayan adventure resort. It blends sacred deodar forests, ancient wooden pagodas, bohemian riverside cafes, and gateways to soaring passes like Rohtang.',
      famousFor: ['Snow adventures at Solang Valley', 'Rohtang Pass high altitude glacier', 'Engineering wonder Atal Tunnel', 'Hadimba Devi 16th-century temple', 'Old Manali cafe culture', 'River rafting on the Beas'],
      bestTimeToVisit: 'October to February for winter snow & skiing; March to June for pleasant 15°C–25°C weather, paragliding, and lush apple orchards',
      climate: 'Sub-alpine; snowy winters (temperatures drop to -5°C) and cool, breezy summers',
      localCulture: 'Kulluvi Pahari folklore, Kath-Kuni timber architecture, handwoven Kullu woolens, and warm mountain hospitality',
      languages: ['Hindi', 'Pahari / Kulluvi', 'English'],
      howToReach: 'Kullu-Manali Airport at Bhuntar (50 km / 1.5 hrs); Volvo luxury semi-sleeper coaches direct from New Delhi (530 km / 12 hrs) & Chandigarh (310 km / 8 hrs) via the 4-lane Himalayan expressway',
      recommendedDuration: '4 to 5 Days (Allows 2 days for local sights + 1 day Solang/Atal Tunnel + 1 day Rohtang or Naggar)',
      importantConsiderations: [
        'Rohtang Pass requires an online NGT permit (limited daily vehicle quota); book 2–4 days ahead.',
        'Rohtang Pass is closed by the BRO from mid-November to May due to heavy snowfall. During winter, snow activities shift to Solang Valley and Sissu (via Atal Tunnel).',
        'Carry warm thermal innerwear even in early summer as evenings in the Beas valley get chilly.',
      ],
    },
    transportationInfo: {
      nearestAirport: 'Bhuntar Airport (KUU), Kullu - 50 km south (1.5 hrs by taxi/bus)',
      nearestRailway: 'Chandigarh Junction (CDG) - 310 km; Broad gauge rail connectivity with Vande Bharat & Shatabdi trains from Delhi',
      intercityConnectivity: 'Himachal Tourism (HPTDC) and private Volvo AC sleeper buses run nightly from Delhi Kashmiri Gate & Majnu-ka-Tilla',
      localTransit: [
        'Local taxi union cars (standardized fixed rates for Solang/Rohtang/Naggar tours)',
        'Rented Royal Enfield / Himalayan motorcycles and automatic scooters (₹800–₹1,500/day)',
        'Local HRTC green buses connecting Mall Road to Naggar, Kullu, and Vashisht',
        'Auto-rickshaws between Mall Road and Old Manali (₹150–₹250)',
      ],
      approxTravelTimes: [
        'Mall Road to Hadimba Temple: 7 mins by car or 20 mins pleasant walk through cedar groves',
        'Manali to Solang Valley: 30–40 mins (14 km)',
        'Manali to Atal Tunnel South Portal: 45–55 mins (28 km)',
        'Manali to Rohtang Pass: 2 to 2.5 hrs via winding mountain switchbacks (51 km)',
      ],
    },
    accommodationGuide: {
      budgetNeighborhoods: 'Old Manali riverside backpacker hostels (Zostel, The Hosteller), Vashisht village homestays',
      midRangeNeighborhoods: 'Aleo and Left Bank Road (quiet river-facing 3-star hotels), Simsa village boutique cottages',
      luxuryNeighborhoods: 'Nehru Kund & Naggar Road riverside luxury resorts (The Himalayan Castle, Span Resort & Spa, Larisa)',
      indicativeDailyPriceUSD: {
        budget: '$12–$25 (₹1,000–₹2,000/night for hostel dorms & cozy wooden homestays)',
        midRange: '$40–$85 (₹3,500–₹7,000/night for 3–4 star mountain-view hotels)',
        luxury: '$150–$350+ (₹12,000–₹30,000/night for 5-star mountain luxury chalets & heritage castles)',
      },
    },
    attractions: [
      {
        id: 'manali-hadimba-temple',
        name: 'Hadimba Devi Temple',
        category: 'MUST_VISIT',
        description: 'Iconic 16th-century four-tiered pagoda temple constructed in 1553 CE with carved cedar wood, set within the enchanting Dhungri deodar forest.',
        whyFamous: 'Ancient Indigenous Kath-Kuni wooden architecture, sacred shrine of Goddess Hadimba from the Mahabharata, and peaceful cedar woods.',
        coordinates: { lat: 32.2483, lng: 77.1706 },
        distanceFromCenter: '1.5 km from Mall Road',
        bestTimeToVisit: 'Morning 8:00 AM–10:30 AM before tourist crowds arrive',
        recommendedDuration: '1.5 Hours',
        entryFee: 'Free entry',
        openingHours: '8:00 AM – 6:00 PM',
        photoUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hadimba+Devi+Temple+Manali',
        sitelinksCount: 24,
      },
      {
        id: 'manali-rohtang-pass',
        name: 'Rohtang Pass',
        category: 'MUST_VISIT',
        description: 'Legendary high mountain pass perched at 3,978 metres (13,050 ft) on the Pir Panjal range, linking the Kullu Valley with the high-altitude deserts of Lahaul and Spiti.',
        whyFamous: 'Glacial snowfields available even in midsummer, dramatic 360-degree Himalayan panorama, and skiing.',
        coordinates: { lat: 32.3716, lng: 77.2466 },
        distanceFromCenter: '51 km north of Manali (2.5 hrs drive)',
        bestTimeToVisit: 'May to October; permits required via Himachal NGT web portal',
        recommendedDuration: 'Full Day Excursion (4 to 6 Hours on mountain)',
        entryFee: '₹550 NGT environmental permit fee per vehicle',
        openingHours: '6:00 AM – 5:00 PM (Closed Tuesdays for maintenance)',
        photoUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rohtang+Pass+Manali',
        sitelinksCount: 35,
        accessibilityNotice: 'Rohtang Pass is closed between November and May due to heavy winter snow. Atal Tunnel is the winter snow route.',
      },
      {
        id: 'manali-atal-tunnel',
        name: 'Atal Tunnel & Sissu Valley',
        category: 'MUST_VISIT',
        description: 'The world\'s longest highway tunnel above 10,000 feet (9.02 km long) bored under Rohtang Pass, opening up the dramatic snowbound mountains of Sissu in Lahaul.',
        whyFamous: 'Revolutionary engineering feat bypassing winter road closures and leading directly to frozen Sissu Waterfall and Chandra river.',
        coordinates: { lat: 32.3644, lng: 77.1292 },
        distanceFromCenter: '28 km north of Manali via Solang',
        bestTimeToVisit: 'Open year-round; winter provides a magical contrast between green Manali and snow-covered Sissu',
        recommendedDuration: 'Half Day to Full Day Excursion',
        entryFee: 'Free (No toll)',
        openingHours: 'Open 24/7 (subject to severe snow alerts)',
        photoUrl: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Atal+Tunnel+Manali',
        sitelinksCount: 28,
      },
      {
        id: 'manali-solang-valley',
        name: 'Solang Valley',
        category: 'NATURE_ADVENTURE',
        description: 'Alpine adventure meadow 14 km from Manali offering tandem paragliding, zorbing, quad biking, and a modern ropeway gondola to 3,200m ridge.',
        whyFamous: 'Manali’s epicenter for adventure sports in summer and beginner ski slopes in winter.',
        coordinates: { lat: 32.3166, lng: 77.1578 },
        distanceFromCenter: '14 km northwest of Manali',
        bestTimeToVisit: 'December–March for skiing; April–June for paragliding & ropeway',
        recommendedDuration: '3 to 5 Hours',
        entryFee: 'Free entry (Activities: Gondola ~₹500, Paragliding ₹1,500–₹3,000)',
        openingHours: '9:00 AM – 6:00 PM',
        photoUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cbdaf?auto=format&fit=crop&w=800&q=80',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Solang+Valley+Manali',
        sitelinksCount: 18,
      },
      {
        id: 'manali-old-manali',
        name: 'Old Manali Village & Cafes',
        category: 'HISTORY_CULTURE',
        description: 'Atmospheric village perched across the Manalsu stream, characterized by traditional slate-roofed timber homes, apple orchards, live acoustic music, and riverside cafes.',
        whyFamous: 'Laid-back mountain bohemian ambiance, wood-fired artisan pizza, handmade leather goods, and herbal bakeries.',
        coordinates: { lat: 32.2533, lng: 77.1764 },
        distanceFromCenter: '2 km from Mall Road',
        bestTimeToVisit: 'Afternoon into late evening (3:00 PM–10:30 PM)',
        recommendedDuration: '2 to 4 Hours',
        entryFee: 'Free',
        openingHours: 'Village open all day; cafes open until 11:00 PM',
        photoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Old+Manali+Village',
      },
      {
        id: 'manali-vashisht-temple',
        name: 'Vashisht Temple & Natural Hot Springs',
        category: 'HISTORY_CULTURE',
        description: 'Ancient temple complex dedicated to Sage Vashishta, housing natural geothermal sulfur pools reputed to carry therapeutic healing properties.',
        whyFamous: 'Soaking in steaming natural sulfur waters looking out onto freezing mountain breezes; separate indoor baths for men and women.',
        coordinates: { lat: 32.2612, lng: 77.1878 },
        distanceFromCenter: '3.5 km from Manali town across the Beas',
        bestTimeToVisit: 'Early morning 7:00 AM–9:00 AM',
        recommendedDuration: '1 to 2 Hours',
        entryFee: 'Free entry',
        openingHours: '7:00 AM – 9:00 PM',
        photoUrl: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=800&q=80',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Vashisht+Temple+Hot+Springs+Manali',
      },
      {
        id: 'manali-jogini-waterfall',
        name: 'Jogini Waterfall',
        category: 'NATURE_ADVENTURE',
        description: 'A cascading mountain waterfall cascading down rocky cliffside into the Beas river basin, reachable via a scenic 3 km pine-shaded trek starting from Vashisht.',
        whyFamous: 'Pristine trek through apple orchards, small shrines, and cool refreshing spray overlooking the valley.',
        coordinates: { lat: 32.2741, lng: 77.1952 },
        distanceFromCenter: '4.5 km from Manali (via Vashisht trail)',
        bestTimeToVisit: 'Morning 9:00 AM–2:00 PM',
        recommendedDuration: '2.5 to 3 Hours round-trip hike',
        entryFee: 'Free entry',
        openingHours: 'Daylight hours',
        photoUrl: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Jogini+Waterfall+Manali',
      },
      {
        id: 'manali-naggar-castle',
        name: 'Naggar Castle',
        category: 'HISTORY_CULTURE',
        description: 'Splendid 15th-century medieval fortress built by Raja Sidh Singh in ancient earthquake-resistant Kath-Kuni wood-and-stone style, now preserving heritage galleries and an open-air cafe.',
        whyFamous: 'Masterpiece of Himalayan stone-wood joinery, views across the Beas river, and nearby Nicholas Roerich International Art Gallery.',
        coordinates: { lat: 32.1189, lng: 77.1706 },
        distanceFromCenter: '21 km south of Manali on the Left Bank',
        bestTimeToVisit: '10:00 AM – 4:00 PM',
        recommendedDuration: '2 to 3 Hours',
        entryFee: '₹30 per person',
        openingHours: '7:00 AM – 7:00 PM',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Naggar+Castle+Himachal',
      },
      {
        id: 'manali-manu-temple',
        name: 'Manu Temple',
        category: 'HISTORY_CULTURE',
        description: 'Sacred pagoda temple dedicated to Sage Manu, the progenitor of humanity in Hindu tradition, situated at the crown of Old Manali village.',
        whyFamous: 'Unique religious importance as the only temple in India dedicated to Sage Manu, providing panoramic rooftop views over the Manalsu valley.',
        coordinates: { lat: 32.2575, lng: 77.1725 },
        distanceFromCenter: '3 km from Mall Road',
        bestTimeToVisit: 'Morning 8:00 AM–11:00 AM',
        recommendedDuration: '1 Hour',
        entryFee: 'Free',
        openingHours: '6:00 AM – 7:00 PM',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Manu+Temple+Old+Manali',
      },
    ],
    sampleItinerary: [
      {
        day: 1,
        title: 'Sacred Cedar Forests & Old Manali Culture',
        morning: {
          activity: 'Visit the 16th-century Hadimba Devi Temple, wander the towering Dhungri deodar sanctuary, and visit the nearby Ghatotkach tree shrine.',
          duration: '2.5 Hours',
          tips: 'Go before 10 AM for peaceful forest photography and fresh air.',
        },
        afternoon: {
          activity: 'Cross the bridge into Old Manali, walk past traditional wooden homes to Manu Temple, and explore artisan handicraft shops.',
          duration: '2.5 Hours',
          mealSuggestion: 'Lunch at Cafe 1947 or Dylan’s Toasted and Roasted (wood-fired pizza and fresh Himalayan apple crumble).',
        },
        evening: {
          activity: 'Stroll along Mall Road, browse Kullu wool shawls and wooden artifacts, and sample local street snacks.',
          duration: '2 Hours',
          mealSuggestion: 'Hot Tibetan momos, Thukpa soup, and siddu with hot ghee.',
        },
        estimatedDailyCostUSD: { budget: 18, midRange: 45, luxury: 140 },
        recommendedRoutingOrder: ['Hadimba Devi Temple', 'Dhungri Forest', 'Old Manali', 'Manu Temple', 'Mall Road'],
      },
      {
        day: 2,
        title: 'High Altitude Thrills: Solang Valley & Atal Tunnel',
        morning: {
          activity: 'Drive up to Solang Valley for paragliding, ride the ropeway gondola to the 3,200m ridge, and take in the glaciated peaks.',
          duration: '3.5 Hours',
          tips: 'Book certified tandem paragliders from the official counter.',
        },
        afternoon: {
          activity: 'Drive through the 9.02 km Atal Tunnel engineering marvel and emerge into the stark, snow-clad valley of Sissu in Lahaul.',
          duration: '3 Hours',
          mealSuggestion: 'Steaming Maggi, hot dal chawal, and tea by Sissu Waterfall.',
        },
        evening: {
          activity: 'Return to Manali, relax with hot ginger lemon tea, and enjoy live acoustic music in Old Manali.',
          duration: '2 Hours',
          mealSuggestion: 'Dinner at The Lazy Dog or Drifters’ Cafe.',
        },
        estimatedDailyCostUSD: { budget: 25, midRange: 65, luxury: 190 },
        recommendedRoutingOrder: ['Solang Valley', 'Ropeway', 'Atal Tunnel', 'Sissu Waterfall', 'Return to Manali'],
      },
      {
        day: 3,
        title: 'Geothermal Springs & Jogini Waterfall Trek',
        morning: {
          activity: 'Visit Vashisht Village, take a dip in the natural thermal sulfur springs, and admire the intricately carved wooden temple.',
          duration: '2 Hours',
          tips: 'Bring a towel and change of clothes for the natural bath.',
        },
        afternoon: {
          activity: 'Begin the scenic 3 km cliffside hike from Vashisht through apple orchards and pine groves up to Jogini Waterfall.',
          duration: '3 Hours',
          mealSuggestion: 'Picnic lunch by the cool pool of Jogini Waterfall or local thali in Vashisht village.',
        },
        evening: {
          activity: 'Walk down to the Beas riverbank for golden hour sunset photography over the rushing glacial river.',
          duration: '1.5 Hours',
          mealSuggestion: 'Freshly pan-fried Himalayan river trout with lemon and herbs.',
        },
        estimatedDailyCostUSD: { budget: 15, midRange: 40, luxury: 120 },
        recommendedRoutingOrder: ['Vashisht Temple', 'Sulfur Springs', 'Jogini Waterfall Hike', 'Beas Riverbank'],
      },
      {
        day: 4,
        title: 'Medieval Heritage: Naggar Castle & Art Estates',
        morning: {
          activity: 'Scenic 21 km drive down the Left Bank to historic Naggar Castle; tour the 15th-century wood-stone palace and temple.',
          duration: '2.5 Hours',
          tips: 'Enjoy coffee on the castle wooden balcony overlooking the Beas valley.',
        },
        afternoon: {
          activity: 'Visit Nicholas Roerich Art Gallery and Urusvati Himalayan Folk Art Museum nestled in peaceful cedar woods.',
          duration: '2 Hours',
          mealSuggestion: 'Authentic Himachali Dham lunch at Naggar or riverside cafe.',
        },
        evening: {
          activity: 'Return to Manali for final souvenir shopping (Himachali dry fruits, honey, Kullu caps, and shawls).',
          duration: '2 Hours',
          mealSuggestion: 'Dinner at Johnson’s Cafe (renowned wood-fired trout).',
        },
        estimatedDailyCostUSD: { budget: 20, midRange: 50, luxury: 160 },
        recommendedRoutingOrder: ['Naggar Castle', 'Roerich Art Gallery', 'Urusvati Museum', 'Himachal Handloom Emporium'],
      },
    ],
    foodAndCuisine: {
      traditionalDishes: [
        { name: 'Kulluvi Pan-Fried Trout Fish', description: 'Fresh Himalayan snow-melt river trout shallow fried in butter with garlic, lemon, and mountain herbs.' },
        { name: 'Siddu with Pure Ghee', description: 'Traditional steamed sourdough pocket stuffed with crushed walnuts, poppy seeds, and spices, served with piping hot clarified butter.', isVegetarian: true },
        { name: 'Himachali Dham Thali', description: 'Ceremonial vegetarian feast featuring Rajma Madra (yogurt gravy), Mah Dal, Khatta, and sweet rice served on leaf plates.', isVegetarian: true },
        { name: 'Tibetan Thukpa & Steamed Momos', description: 'Fragrant spicy noodle soup and thin-crust dumplings filled with mountain vegetables or chicken.' },
      ],
      popularFoodStreetsOrSpots: ['Old Manali Cafe Strip (Cafe 1947, The Lazy Dog)', 'Johnson’s Cafe (Mall Road)', 'Vashisht Rooftop Bakeries'],
    },
  },

  // ==========================================
  // BALI, INDONESIA
  // ==========================================
  'bali': {
    id: 'bali',
    name: 'Bali',
    type: 'state_region',
    country: 'Indonesia',
    aliases: ['island of gods', 'bali indonesia', 'denpasar', 'ubud'],
    costTier: 'mid',
    coordinates: { lat: -8.4095, lng: 115.1889 },
    heroPhoto: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    overview: {
      introduction: 'Bali, celebrated worldwide as the "Island of the Gods", is an Indonesian island province renowned for forested volcanic mountains, emerald tiered rice paddies, spiritual sea temples, world-class surfing beaches, and vibrant artistic traditions.',
      famousFor: ['Ubud rice terraces & sacred monkey forests', 'Iconic cliffside sea temples (Uluwatu, Tanah Lot)', 'Surfing in Canggu & Uluwatu', 'Sunrise trek on Mount Batur volcano', 'Balinese spa & wellness sanctuaries', 'Beach clubs & coral reefs'],
      bestTimeToVisit: 'April to October (Dry season with sunny skies, low humidity, and pleasant sea breezes)',
      climate: 'Tropical maritime with two seasons: dry season (April–Oct) and wet monsoon season (Nov–March); 26°C–31°C year-round',
      localCulture: 'Balinese Hinduism (Agama Hindu Dharma), daily canang sari flower offerings, gamelan music, and temple odalan ceremonies',
      languages: ['Indonesian (Bahasa Indonesia)', 'Balinese', 'English (widely spoken in tourist hubs)'],
      howToReach: 'Ngurah Rai International Airport (DPS) in Denpasar connects directly to major hubs across Asia, Australia, the Middle East, and Europe',
      recommendedDuration: '6 to 10 Days (Best split between cultural Ubud and coastal beach regions like Uluwatu or Canggu)',
      importantConsiderations: [
        'Always wear a sarong and sash when entering Balinese Hindu temples (available for hire at entrances).',
        'International Driving Permit (IDP) required if renting motorbikes; traffic in Seminyak/Canggu can be heavy.',
        'Drink bottled or filtered water; avoid unsealed tap water.',
      ],
    },
    transportationInfo: {
      nearestAirport: 'I Gusti Ngurah Rai International Airport (DPS), Denpasar',
      intercityConnectivity: 'Private driver hire (very economical: $35–$50/day including fuel & English-speaking driver); fast ferries to Nusa Penida and Gili Islands',
      localTransit: [
        'Ride-hailing apps: Grab & Gojek (cars and scooter taxis)',
        'Rented automatic scooters (Honda Scoopy ~₹400–₹700 / $5–$9/day)',
        'Private day tours with driver for long excursions',
      ],
      approxTravelTimes: [
        'Airport (DPS) to Seminyak / Kuta: 25–40 mins',
        'Airport (DPS) to Ubud: 1.5 to 2 hrs',
        'Ubud to Mount Batur: 1 hour',
        'Sanur Harbour to Nusa Penida: 35 mins by speedboat',
      ],
    },
    accommodationGuide: {
      budgetNeighborhoods: 'Canggu & Ubud backpacker hostels, Kuta/Legian guesthouses',
      midRangeNeighborhoods: 'Ubud central & Penestanan (jungle pool villas), Bingin/Uluwatu cliffside guesthouses, Sanur family resorts',
      luxuryNeighborhoods: 'Nusa Dua beachfront 5-star resorts, Seminyak private pool estates, Uluwatu cliff luxury villas (Bulgari, Alila)',
      indicativeDailyPriceUSD: {
        budget: '$15–$35 (Hostels & private homestays)',
        midRange: '$60–$140 (Private jungle villas with pool in Ubud or beach suites)',
        luxury: '$280–$800+ (5-star private cliffside villas with personal butler)',
      },
    },
    subDestinations: [
      {
        id: 'ubud',
        name: 'Ubud',
        tagline: 'Cultural & spiritual heart of Bali set among jungle ravines, art galleries, and rice paddies',
        highlights: ['Tegallalang Rice Terraces', 'Sacred Monkey Forest', 'Ubud Royal Palace', 'Campuhan Ridge Walk'],
        heroPhoto: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'uluwatu',
        name: 'Uluwatu & The Bukit',
        tagline: 'Dramatic limestone cliffs, world-class surf breaks, and clifftop Kecak fire dances',
        highlights: ['Uluwatu Sea Temple', 'Kecak Sunset Dance', 'Padang Padang Beach', 'Single Fin Clifftop'],
        heroPhoto: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'canggu-seminyak',
        name: 'Canggu & Seminyak',
        tagline: 'Vibrant coastal hub with chic beach clubs, designer cafes, surf breaks, and sunsets',
        highlights: ['Echo Beach', 'Tanah Lot Temple', 'Finns & Potato Head Beach Clubs', 'Boutique shopping'],
      },
      {
        id: 'nusa-penida',
        name: 'Nusa Penida Island',
        tagline: 'Rugged island paradise famous for the T-Rex shaped Kelingking cliff and manta ray diving',
        highlights: ['Kelingking T-Rex Beach', 'Broken Beach & Angel’s Billabong', 'Crystal Bay snorkeling'],
      },
    ],
    attractions: [
      {
        id: 'bali-uluwatu-temple',
        name: 'Uluwatu Temple (Pura Luhur Uluwatu)',
        category: 'MUST_VISIT',
        description: 'Majestic 11th-century Balinese sea temple perched on the edge of a sheer 70-metre limestone cliff plunging straight into the Indian Ocean.',
        whyFamous: 'Spectacular sunset views over crashing waves followed by the nightly hypnotic Kecak & Fire Dance in an open-air clifftop amphitheatre.',
        coordinates: { lat: -8.8291, lng: 115.0849 },
        distanceFromCenter: 'Southwestern tip of Bukit Peninsula',
        bestTimeToVisit: '4:30 PM (Buy Kecak dance tickets early for the 6:00 PM sunset show)',
        recommendedDuration: '2 to 3 Hours',
        entryFee: 'IDR 50,000 (~$3.50) + IDR 150,000 for Kecak dance ticket',
        openingHours: '7:00 AM – 7:00 PM',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Uluwatu+Temple+Bali',
      },
      {
        id: 'bali-tegallalang-rice-terrace',
        name: 'Tegallalang Rice Terraces',
        category: 'PHOTOGRAPHY',
        description: 'Iconic valley of cascading emerald-green rice terraces carved into the hillsides using the ancient Balinese cooperative subak irrigation system.',
        whyFamous: 'Postcard-perfect stepped landscape, giant jungle swings, and peaceful morning strolls among palm trees.',
        coordinates: { lat: -8.4312, lng: 115.2778 },
        distanceFromCenter: '10 km north of Ubud town center',
        bestTimeToVisit: 'Early morning 7:00 AM–9:00 AM for soft golden mist rays through palms',
        recommendedDuration: '2 Hours',
        entryFee: 'IDR 25,000 entrance donation (~$1.75)',
        openingHours: '8:00 AM – 6:00 PM',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Tegallalang+Rice+Terrace+Bali',
      },
      {
        id: 'bali-tanah-lot',
        name: 'Tanah Lot Temple',
        category: 'MUST_VISIT',
        description: 'Ancient offshore Hindu shrine perched on a dramatic wave-swept rock outcrop that becomes an island during high tide.',
        whyFamous: 'One of Bali’s seven cardinal sea temples, universally acclaimed for its silhouette against blazing orange Indian Ocean sunsets.',
        coordinates: { lat: -8.6212, lng: 115.0868 },
        distanceFromCenter: '20 km northwest of Kuta/Canggu',
        bestTimeToVisit: '5:00 PM–6:30 PM for sunset',
        recommendedDuration: '1.5 to 2 Hours',
        entryFee: 'IDR 60,000 adult (~$4)',
        openingHours: '7:00 AM – 7:00 PM',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Tanah+Lot+Temple+Bali',
      },
      {
        id: 'bali-monkey-forest',
        name: 'Sacred Monkey Forest Sanctuary (Ubud)',
        category: 'NATURE_ADVENTURE',
        description: 'Lush 12.5-hectare sacred rainforest sanctuary in central Ubud housing over 1,000 long-tailed Balinese macaques and three 14th-century mossy temples.',
        whyFamous: 'Close encounters with free-roaming monkeys among ancient banyan trees, deep holy river gorges, and stone dragon bridges.',
        coordinates: { lat: -8.5190, lng: 115.2606 },
        distanceFromCenter: 'South end of Monkey Forest Road, Ubud',
        bestTimeToVisit: '9:00 AM–11:00 AM',
        recommendedDuration: '1.5 to 2 Hours',
        entryFee: 'IDR 80,000 (~$5)',
        openingHours: '9:00 AM – 6:00 PM',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sacred+Monkey+Forest+Sanctuary+Ubud',
      },
      {
        id: 'bali-mount-batur',
        name: 'Mount Batur Sunrise Volcano Trek',
        category: 'NATURE_ADVENTURE',
        description: 'Active volcano rising 1,717 metres above sea level, offering a popular pre-dawn guided hike to watch the sun rise over Lake Batur and Mount Rinjani in the distance.',
        whyFamous: 'Spectacular sunrise over a sea of clouds and breakfast cooked in volcanic steam vents.',
        coordinates: { lat: -8.2421, lng: 115.3752 },
        distanceFromCenter: 'Kintamani region (1.5 hrs drive from Ubud)',
        bestTimeToVisit: 'Early morning (Depart hotel at 2:00 AM, hike begins at 4:00 AM)',
        recommendedDuration: 'Half Day (2 hrs climb up, 1.5 hrs down)',
        entryFee: 'Guided package ~$30–$45 including guide, flashlight, and breakfast',
        openingHours: 'Guided tours depart pre-dawn',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Mount+Batur+Sunrise+Trek+Bali',
      },
    ],
    sampleItinerary: [
      {
        day: 1,
        title: 'Spiritual Ubud: Rice Terraces, Waterfalls & Monkeys',
        morning: {
          activity: 'Early morning photography walk through Tegallalang Rice Terraces, followed by a swim under Tegenungan or Tibumana Waterfall.',
          duration: '3.5 Hours',
          tips: 'Wear shoes with good grip for muddy rice terrace paths.',
        },
        afternoon: {
          activity: 'Explore the Sacred Monkey Forest Sanctuary and walk through Ubud Royal Palace (Puri Saren Agung).',
          duration: '2.5 Hours',
          mealSuggestion: 'Lunch at an organic jungle cafe in Ubud (Clear Cafe or Warung Babi Guling Ibu Oka).',
        },
        evening: {
          activity: 'Sunset stroll along the scenic Campuhan Ridge Walk followed by traditional Balinese spa massage.',
          duration: '2 Hours',
          mealSuggestion: 'Indonesian rijsttafel dinner at Bebek Bengil (famous crispy duck).',
        },
        estimatedDailyCostUSD: { budget: 25, midRange: 65, luxury: 220 },
        recommendedRoutingOrder: ['Tegallalang Terraces', 'Tibumana Waterfall', 'Monkey Forest', 'Ubud Palace', 'Campuhan Ridge'],
      },
      {
        day: 2,
        title: 'Active Volcano Sunrise & Hot Springs',
        morning: {
          activity: 'Pre-dawn climb to Mount Batur summit (1,717m) to witness the sunrise over the caldera and lake.',
          duration: '4 Hours',
          tips: 'Bring a light fleece jacket as summit temperatures are 10°C–14°C before sunrise.',
        },
        afternoon: {
          activity: 'Soak in the natural geothermal Batur natural hot springs overlooking the lake, then visit a traditional Luwak coffee plantation.',
          duration: '2.5 Hours',
          mealSuggestion: 'Buffet lunch in Kintamani with panoramic volcano caldera view.',
        },
        evening: {
          activity: 'Return to Ubud for a relaxing evening visiting local art markets and silver jewelry workshops in Celuk.',
          duration: '2 Hours',
          mealSuggestion: 'Dinner at Locavore to Go or Milk & Madu.',
        },
        estimatedDailyCostUSD: { budget: 35, midRange: 80, luxury: 250 },
        recommendedRoutingOrder: ['Mount Batur Trek', 'Batur Hot Springs', 'Coffee Plantation', 'Ubud Art Market'],
      },
      {
        day: 3,
        title: 'Coastal Dramatic Cliffs & Uluwatu Sunset',
        morning: {
          activity: 'Transfer to the southern Bukit Peninsula. Relax or surf at the turquoise cove of Padang Padang Beach or Melasti Beach.',
          duration: '3 Hours',
          tips: 'Visit beaches at mid-tide for optimal swimming and calm waters.',
        },
        afternoon: {
          activity: 'Visit clifftop Uluwatu Temple, walk along the limestone ocean pathway, and watch for temple macaques.',
          duration: '2 Hours',
          mealSuggestion: 'Acai bowls or fish tacos at Single Fin clifftop cafe.',
        },
        evening: {
          activity: 'Watch the sunset Kecak Fire Dance at Uluwatu Temple, then head to Jimbaran Bay for candlelit beachfront grilled seafood.',
          duration: '2.5 Hours',
          mealSuggestion: 'Fresh grilled red snapper, prawns, and calamari with sambal matah on the sand in Jimbaran.',
        },
        estimatedDailyCostUSD: { budget: 30, midRange: 85, luxury: 300 },
        recommendedRoutingOrder: ['Padang Padang Beach', 'Melasti Beach', 'Uluwatu Temple', 'Kecak Fire Dance', 'Jimbaran Seafood'],
      },
    ],
    foodAndCuisine: {
      traditionalDishes: [
        { name: 'Babi Guling (Balinese Roast Suckling Pig)', description: 'Tender spit-roasted whole pork stuffed with aromatic turmeric, lemongrass, shallots, and galangal paste with crisp skin.' },
        { name: 'Nasi Campur Bali', description: 'Fragrant steamed rice served with chicken sate lilit, lawar (spiced green beans & grated coconut), egg, and sambal matah.' },
        { name: 'Bebek Betutu (Slow-Cooked Spiced Duck)', description: 'Duck marinated in a complex 16-spice paste, wrapped in banana leaf and slow-steamed or roasted for 8 hours.' },
        { name: 'Sate Lilit Ikan', description: 'Minced fish and coconut meat seasoned with lime leaf, wrapped around lemongrass stalks and grilled over coconut charcoal.' },
      ],
      popularFoodStreetsOrSpots: ['Ubud Warungs', 'Jimbaran Seafood Beach (Pantai Muaya)', 'Seminyak Eat Street (Jalan Kayu Aya)'],
    },
  },

  // ==========================================
  // MEGHALAYA, INDIA
  // ==========================================
  'meghalaya': {
    id: 'meghalaya',
    name: 'Meghalaya',
    type: 'state_region',
    country: 'India',
    aliases: ['abode of clouds', 'meghalaya india', 'shillong', 'cherrapunji', 'sohra'],
    costTier: 'budget',
    coordinates: { lat: 25.4670, lng: 91.3662 },
    heroPhoto: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    overview: {
      introduction: 'Meghalaya, poetically named the "Abode of Clouds", is a magical northeastern Indian state world-famous for bio-engineered living root bridges, the wettest places on Earth (Mawsynram & Cherrapunji), crystal-clear rivers, and dramatic limestone gorges.',
      famousFor: ['Double Decker Living Root Bridge', 'Nohkalikai Falls (tallest plunge waterfall in India)', 'Umngot River at Dawki (crystal-clear water where boats look floating on air)', 'Mawlynnong (Asia’s Cleanest Village)', 'Spelunking in deep caves', 'Khasi & Garo tribal matrilineal culture'],
      bestTimeToVisit: 'October to April (Crisp sunny weather, clear rivers, trekking) & June to September (Roaring, magnificent monsoons)',
      climate: 'Sub-tropical highland; cool summers (15°C–24°C) and chilly winters (4°C–16°C), heavy rainfall during monsoon',
      localCulture: 'Matrilineal Khasi, Jaintia, and Garo indigenous traditions, rock music capital, organic bamboo crafts',
      languages: ['Khasi', 'Garo', 'English (official and widely spoken)', 'Hindi'],
      howToReach: 'Shillong Airport (SHL) at Umroi (30 km); Lokpriya Gopinath Bordoloi International Airport (GAU) in Guwahati (120 km / 3 hrs scenic drive via 4-lane highway)',
      recommendedDuration: '5 to 7 Days (Allows covering Shillong, Cherrapunji, Dawki, and Mawlynnong comfortably)',
      importantConsiderations: [
        'Trek to the Double Decker Root Bridge in Nongriat involves ~3,500 stone steps down and up; moderate physical fitness required.',
        'Dawki river clarity is pristine from November to March; during monsoon rains, river turns muddy.',
        'Sundays are quiet across Meghalaya as most shops and restaurants close for church services.',
      ],
    },
    transportationInfo: {
      nearestAirport: 'Guwahati Airport (GAU) - 120 km (3 hrs); Shillong Umroi Airport (SHL) - 30 km (1 hr)',
      nearestRailway: 'Guwahati Railway Station (GHY) - 100 km (2.5 hrs by shared or private taxi)',
      intercityConnectivity: 'Guwahati-Shillong shared tourist cabs (Tata Sumo / Swift Dzire from Paltan Bazaar) operate continuously',
      localTransit: [
        'Dedicated private tourist cabs (Maruti Alto / Swift) for day trips to Cherrapunji/Dawki (~₹2,500–₹4,000/day)',
        'Local black-and-yellow shared Maruti 800 cabs within Shillong city (₹20–₹50 per point)',
      ],
      approxTravelTimes: [
        'Guwahati to Shillong: 2.5 to 3 hrs',
        'Shillong to Cherrapunji (Sohra): 1.5 to 2 hrs (54 km)',
        'Cherrapunji to Dawki: 2.5 hrs (85 km)',
        'Dawki to Mawlynnong: 1 hour (35 km)',
      ],
    },
    accommodationGuide: {
      budgetNeighborhoods: 'Police Bazar (Shillong center), Nongriat village basic homestays by the root bridge',
      midRangeNeighborhoods: 'Laitumkhrah & Upper Shillong (boutique mountain cottages), Cherrapunji cliffview eco-resorts (Polo Orchid, Kutmadan)',
      luxuryNeighborhoods: 'Ri Kynjai Resort on Umiam Lake, Ri-Bhoi district luxury nature retreats',
      indicativeDailyPriceUSD: {
        budget: '$12–$25 (₹1,000–₹2,000/night)',
        midRange: '$40–$80 (₹3,500–₹6,500/night)',
        luxury: '$140–$280+ (₹12,000–₹24,000/night for lake view chalets)',
      },
    },
    subDestinations: [
      {
        id: 'shillong',
        name: 'Shillong',
        tagline: 'The Scotland of the East: Rock music capital surrounded by pine hills and colonial churches',
        highlights: ['Umiam Lake', 'Elephant Falls', 'Police Bazar', 'Don Bosco Indigenous Museum', 'Laitlum Canyons'],
      },
      {
        id: 'cherrapunji',
        name: 'Cherrapunji (Sohra)',
        tagline: 'Mist-clad plateau of towering waterfalls, deep limestone caves, and ancient root bridges',
        highlights: ['Nohkalikai Falls', 'Double Decker Root Bridge', 'Mawsmai Cave', 'Seven Sisters Falls'],
      },
      {
        id: 'dawki-mawlynnong',
        name: 'Dawki & Mawlynnong',
        tagline: 'Crystal clear glass-like river on the Bangladesh border and Asia’s cleanest floral village',
        highlights: ['Umngot River boating', 'Mawlynnong Cleanest Village', 'Single Living Root Bridge'],
      },
    ],
    attractions: [
      {
        id: 'meghalaya-root-bridges',
        name: 'Double Decker Living Root Bridge (Nongriat)',
        category: 'MUST_VISIT',
        description: 'World-renowned bio-engineering marvel where indigenous Khasi tribes train the living aerial roots of Ficus elastica trees over centuries into two-tiered suspension bridges across roaring rivers.',
        whyFamous: 'Living, self-strengthening botanical bridge architecture found nowhere else on Earth, set amidst deep jungle ravines and turquoise natural swimming pools.',
        coordinates: { lat: 25.2497, lng: 91.6706 },
        distanceFromCenter: 'Trek begins from Tyrna village (20 km south of Cherrapunji)',
        bestTimeToVisit: 'Early morning 7:00 AM; requires climbing ~3,500 stone stairs each way',
        recommendedDuration: 'Full Day Excursion (4 to 6 Hours trek)',
        entryFee: '₹50 per person',
        openingHours: 'Daylight hours',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Double+Decker+Living+Root+Bridge+Nongriat',
      },
      {
        id: 'meghalaya-nohkalikai-falls',
        name: 'Nohkalikai Falls',
        category: 'MUST_VISIT',
        description: 'The tallest plunge waterfall in India with a dramatic drop of 340 metres (1,115 ft) into an ethereal turquoise pool surrounded by dense rainforest cliffs.',
        whyFamous: 'India\'s highest plunge waterfall with unmatched viewpoints and a legendary Khasi folklore origin.',
        coordinates: { lat: 25.2758, lng: 91.6853 },
        distanceFromCenter: '7 km from Cherrapunji (Sohra) town',
        bestTimeToVisit: 'Morning 9:00 AM–12:00 PM before mist rolls in',
        recommendedDuration: '1 to 2 Hours',
        entryFee: '₹20 per person',
        openingHours: 'Sunrise to sunset',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Nohkalikai+Falls+Cherrapunji',
      },
      {
        id: 'meghalaya-dawki-river',
        name: 'Umngot River (Dawki Glass Water Boating)',
        category: 'PHOTOGRAPHY',
        description: 'Pristine, emerald river flowing through the Jaintia Hills along the India-Bangladesh border where the water is so startlingly transparent that boats seem to float on thin air.',
        whyFamous: 'Famous transparent water photography, country boat rides over visible riverbeds, and suspension bridge vistas.',
        coordinates: { lat: 25.1889, lng: 92.0225 },
        distanceFromCenter: 'Dawki border town (85 km from Shillong)',
        bestTimeToVisit: 'November to March (Winter months guarantee crystal-clear glass visibility)',
        recommendedDuration: '2 to 3 Hours',
        entryFee: 'Boating ₹800–₹1,200 per boat (seats 3–4 persons)',
        openingHours: '7:00 AM – 5:00 PM',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Umngot+River+Dawki',
      },
    ],
    foodAndCuisine: {
      traditionalDishes: [
        { name: 'Jadoh', description: 'Authentic Khasi staple of fragrant red hill rice cooked with meat, bay leaves, ginger, and aromatic local spices.' },
        { name: 'Dohneiiong', description: 'Tender pork or chicken cooked in a rich, deeply nutty black sesame seed and shallot gravy.' },
        { name: 'Tungrymbai', description: 'Traditional fermented soybean paste sauteed with ginger, garlic, and chilies, paired with warm rice.' },
        { name: 'Pukhlein', description: 'Sweet Khasi snack made from powdered jaggery and rice flour deep-fried into golden crispy puffs.', isVegetarian: true },
      ],
      popularFoodStreetsOrSpots: ['Police Bazar Street Stalls', 'Trattoria (Police Bazar, authentic Khasi food)', 'Cafe Shillong (Laitumkhrah)'],
    },
  },

  // ==========================================
  // ROME, ITALY
  // ==========================================
  'rome': {
    id: 'rome',
    name: 'Rome',
    type: 'city_destination',
    country: 'Italy',
    stateOrRegion: 'Lazio',
    aliases: ['roma', 'eternal city', 'rome italy', 'citta eterna'],
    costTier: 'high',
    coordinates: { lat: 41.9028, lng: 12.4964 },
    heroPhoto: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
    overview: {
      introduction: 'Rome, the "Eternal City" and capital of Italy, is a colossal living museum spanning nearly three millennia of history, from the monumental Colosseum and Roman Forum to Vatican City and vibrant trattoria-lined piazzas.',
      famousFor: ['Colosseum & Roman Forum', 'Vatican City & St. Peter’s Basilica', 'Trevi Fountain', 'The Pantheon', 'Authentic Roman pasta (Carbonara, Cacio e Pepe)', 'Gelato and espresso culture'],
      bestTimeToVisit: 'April to May & September to October (Warm pleasant days, outdoor dining, and lower summer heat)',
      climate: 'Mediterranean; hot, sunny summers (28°C–34°C) and mild, crisp winters (7°C–14°C)',
      localCulture: 'La dolce vita, evening passeggiata (leisurely stroll), aperitivo at sunset, and family-owned trattorias',
      languages: ['Italian', 'English (widely spoken in tourist locations)'],
      howToReach: 'Rome Fiumicino Airport (FCO) 30 km west (Leonardo Express train in 32 mins to Roma Termini); Ciampino Airport (CIA) 15 km south',
      recommendedDuration: '4 to 6 Days',
      importantConsiderations: [
        'Colosseum and Vatican Museum tickets sell out weeks ahead; reserve official timed tickets in advance.',
        'Proper dress code mandatory for churches and the Vatican (knees and shoulders must be covered).',
      ],
    },
    transportationInfo: {
      nearestAirport: 'Leonardo da Vinci–Fiumicino Airport (FCO) - 32 mins direct train to Roma Termini',
      nearestRailway: 'Roma Termini (Major high-speed rail hub with Frecciarossa trains to Florence in 1.5 hrs, Milan in 3 hrs, Naples in 1 hr)',
      intercityConnectivity: 'Direct Frecciarossa high-speed rail to Florence (1.5h), Naples (1h), and Milan (3h)',
      localTransit: [
        'Rome Metro (Lines A, B, and C)',
        'Extensive city bus and tram network (ATAC)',
        'Compact walkable historic core (most sights between Colosseum and Piazza Navona are within walking distance)',
      ],
      approxTravelTimes: [
        'Termini to Colosseum: 5 mins by Metro Line B',
        'Colosseum to Trevi Fountain: 15–20 mins walk through historic avenues',
        'Trevi to Vatican City: 25 mins walk or 15 mins by Metro Line A to Ottaviano',
      ],
    },
    accommodationGuide: {
      budgetNeighborhoods: 'Around Roma Termini station, San Lorenzo student district',
      midRangeNeighborhoods: 'Monti (charming artisan neighborhood near Colosseum), Trastevere (vibrant dining & cobblestones), Prati (near Vatican)',
      luxuryNeighborhoods: 'Piazza di Spagna & Via Veneto (Hotel de Russie, Hassler Roma)',
      indicativeDailyPriceUSD: {
        budget: '$40–$75 (Hostels & simple guesthouses)',
        midRange: '$140–$240 (3–4 star boutique hotels)',
        luxury: '$480–$1,200+ (5-star historic luxury hotels)',
      },
    },
    attractions: [
      {
        id: 'rome-colosseum',
        name: 'The Colosseum (Flavian Amphitheatre)',
        category: 'MUST_VISIT',
        description: 'The largest ancient amphitheatre ever built, constructed between 70–80 CE, which seated up to 80,000 spectators for gladiator contests and public spectacles.',
        whyFamous: 'The ultimate symbol of ancient Imperial Rome and one of the New Seven Wonders of the World.',
        coordinates: { lat: 41.8902, lng: 12.4922 },
        distanceFromCenter: 'Piazza del Colosseo',
        bestTimeToVisit: 'Morning 8:30 AM or late afternoon 4:00 PM',
        recommendedDuration: '2 to 3 Hours (Combined with Roman Forum)',
        entryFee: '€18 adult (Includes Colosseum, Roman Forum, and Palatine Hill)',
        openingHours: '8:30 AM – 7:15 PM (Varies seasonally)',
        photoUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Colosseum+Rome',
        sitelinksCount: 170,
      },
      {
        id: 'rome-trevi-fountain',
        name: 'Trevi Fountain (Fontana di Trevi)',
        category: 'MUST_VISIT',
        description: 'Magnificent 18th-century Baroque fountain sculpted against the Palazzo Poli, featuring Neptune’s chariot flanked by Tritons and winged horses.',
        whyFamous: 'Legend of tossing a coin over your left shoulder to ensure your return to Rome; glowing under warm evening lights.',
        coordinates: { lat: 41.9009, lng: 12.4833 },
        distanceFromCenter: 'Piazza di Trevi',
        bestTimeToVisit: 'Early morning (7:00 AM–8:00 AM for tranquil photos) or midnight',
        recommendedDuration: '45 Minutes',
        entryFee: 'Free',
        openingHours: 'Open 24/7',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Trevi+Fountain+Rome',
        sitelinksCount: 115,
      },
      {
        id: 'rome-pantheon',
        name: 'The Pantheon',
        category: 'MUST_VISIT',
        description: 'Best-preserved Roman monument in the world, completed in 125 CE by Emperor Hadrian, featuring the world\'s largest unreinforced concrete dome with a 9-metre open oculus.',
        whyFamous: 'Unrivaled 2,000-year-old architectural engineering, and burial place of Renaissance painter Raphael and Italian kings.',
        coordinates: { lat: 41.8986, lng: 12.4769 },
        distanceFromCenter: 'Piazza della Rotonda',
        bestTimeToVisit: 'Midday when the sunbeam streams dramatically through the central oculus',
        recommendedDuration: '1 Hour',
        entryFee: '€5 entry ticket',
        openingHours: '9:00 AM – 7:00 PM',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=The+Pantheon+Rome',
        sitelinksCount: 130,
      },
    ],
    sampleItinerary: [
      {
        day: 1,
        title: 'Imperial Rome: Gladiators & The Caesars',
        morning: {
          activity: 'Tour the Colosseum arena floor and underground chambers, then walk through the monumental arches of the Roman Forum and Palatine Hill.',
          duration: '3.5 Hours',
          tips: 'Pre-book the 9:00 AM timed entry ticket with Forum access.',
        },
        afternoon: {
          activity: 'Walk past Capitoline Hill to Piazza Venezia and climb the Victor Emmanuel II monument for a bird’s-eye city panorama.',
          duration: '2 Hours',
          mealSuggestion: 'Authentic Roman lunch in the Monti neighborhood (Pasta Carbonara at La Taverna dei Fori Imperiali).',
        },
        evening: {
          activity: 'Toss a coin into the Trevi Fountain and relax with artisanal gelato at Giolitti near the Pantheon.',
          duration: '2 Hours',
          mealSuggestion: 'Wood-fired Roman thin crust pizza near Campo de’ Fiori.',
        },
        estimatedDailyCostUSD: { budget: 35, midRange: 95, luxury: 290 },
        recommendedRoutingOrder: ['Colosseum', 'Roman Forum', 'Palatine Hill', 'Piazza Venezia', 'Trevi Fountain'],
      },
    ],
    foodAndCuisine: {
      traditionalDishes: [
        { name: 'Spaghetti alla Carbonara', description: 'Iconic Roman pasta made with crispy guanciale (cured pork jowl), fresh egg yolks, Pecorino Romano cheese, and cracked black pepper (never cream).' },
        { name: 'Cacio e Pepe', description: 'Sublime Roman classic of tonnarelli pasta tossed with aged sharp Pecorino Romano cheese and freshly toasted black pepper.', isVegetarian: true },
        { name: 'Supplì al Telefono', description: 'Crispy fried rice croquettes stuffed with rich tomato beef ragù and a melting mozzarella center that stretches like a telephone wire.' },
        { name: 'Artisan Roman Gelato', description: 'Silky, dense Italian gelato crafted with fresh Bronte pistachios, Piedmont hazelnuts, or dark chocolate.', isVegetarian: true },
      ],
      popularFoodStreetsOrSpots: ['Trastevere Trattorias (Via della Lungaretta)', 'Testaccio Market', 'Campo de’ Fiori food market'],
    },
  },
};

// Global destination lookup helper
export function getCanonicalDestination(nameOrAlias: string): CanonicalDestination | null {
  if (!nameOrAlias) return null;
  const clean = nameOrAlias.toLowerCase().trim();

  // 1. Direct match
  if (CANONICAL_DESTINATIONS[clean]) {
    return CANONICAL_DESTINATIONS[clean];
  }

  // 2. Scan aliases and full titles
  for (const dest of Object.values(CANONICAL_DESTINATIONS)) {
    if (dest.name.toLowerCase() === clean || dest.id === clean) return dest;
    if (dest.aliases.some((alias) => alias === clean || clean.includes(alias) || alias.includes(clean))) {
      return dest;
    }
    // Check sub-destinations
    if (dest.subDestinations) {
      const matchSub = dest.subDestinations.find(
        (sub) => sub.name.toLowerCase() === clean || sub.id === clean || clean.includes(sub.name.toLowerCase())
      );
      if (matchSub) {
        if (CANONICAL_DESTINATIONS[matchSub.id]) {
          return CANONICAL_DESTINATIONS[matchSub.id];
        }
      }
    }
  }

  return null;
}
