import { Season } from '../types/travel';

export interface SeasonalDestinationCard {
  id: string;
  name: string;
  country: string;
  season: Season;
  months: string;
  image: string;
  weatherSummary: string;
  tempRange: string;
  budgetUSD: number;
  reasonsToVisit: string[];
  popularActivities: string[];
  recommendedPackageId?: string;
  packageCategory: 'budget' | 'standard' | 'luxury';
}

export const SEASONAL_DATA: Record<Season, {
  title: string;
  description: string;
  icon: string;
  destinations: SeasonalDestinationCard[];
}> = {
  winter: {
    title: 'Winter Wonderland & Desert Sun',
    description: 'Crisp snow-capped mountains, magical Northern Lights, and pleasant desert sun.',
    icon: 'snowflake',
    destinations: [
      {
        id: 'dubai',
        name: 'Dubai',
        country: 'UAE',
        season: 'winter',
        months: 'Nov – Mar',
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
        weatherSummary: 'Sunny, pleasant & breezy',
        tempRange: '22°C – 28°C',
        budgetUSD: 850,
        reasonsToVisit: ['Perfect beach weather', 'World-class shopping festival', 'Outdoor desert dune glamping'],
        popularActivities: ['Desert Safari BBQ', 'Burj Khalifa sunset view', 'Yacht cruise around Palm Jumeirah'],
        recommendedPackageId: 'pkg-dubai-standard',
        packageCategory: 'standard',
      },
      {
        id: 'japan',
        name: 'Japan',
        country: 'Japan',
        season: 'winter',
        months: 'Dec – Feb',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
        weatherSummary: 'Crisp mountain snow & steaming hot springs',
        tempRange: '2°C – 10°C',
        budgetUSD: 1190,
        reasonsToVisit: ['Soaking in outdoor onsen amidst snow', 'World powder skiing in Hokkaido', 'Winter illuminations in Tokyo'],
        popularActivities: ['Hakone Hot Springs', 'Shinkansen Bullet Train to Kyoto', 'Shibuya & Shinjuku food crawl'],
        recommendedPackageId: 'pkg-japan-standard',
        packageCategory: 'standard',
      },
      {
        id: 'iceland',
        name: 'Iceland',
        country: 'Iceland',
        season: 'winter',
        months: 'Nov – Mar',
        image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80',
        weatherSummary: 'Sub-zero snowy Arctic wonder',
        tempRange: '-3°C – 3°C',
        budgetUSD: 1400,
        reasonsToVisit: ['Vibrant Aurora Borealis (Northern Lights)', 'Crystalline Blue Ice Caves', 'Steaming geothermal Blue Lagoon'],
        popularActivities: ['Chasing the Northern Lights', 'SuperJeep glacier treks', 'Bathing in Blue Lagoon'],
        recommendedPackageId: 'pkg-swiss-budget',
        packageCategory: 'luxury',
      },
      {
        id: 'goa',
        name: 'Goa',
        country: 'India',
        season: 'winter',
        months: 'Nov – Feb',
        image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
        weatherSummary: 'Balmy sunny tropical coast',
        tempRange: '24°C – 31°C',
        budgetUSD: 280,
        reasonsToVisit: ['Vibrant beach shacks & parties', 'Sunburn music festival', 'Warm ocean swimming'],
        popularActivities: ['Palolem beach dolphin boat tour', 'Dudhsagar waterfall trek', 'Fontainhas heritage walk'],
        packageCategory: 'budget',
      },
    ],
  },
  summer: {
    title: 'Alpine Escapes & Tropical Sun',
    description: 'Breathtaking wildflower alpine trails, azure lakes, and refreshing coastal breezes.',
    icon: 'sun',
    destinations: [
      {
        id: 'switzerland',
        name: 'Switzerland',
        country: 'Switzerland',
        season: 'summer',
        months: 'Jun – Aug',
        image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
        weatherSummary: 'Lush green valleys & cool mountain air',
        tempRange: '16°C – 25°C',
        budgetUSD: 1390,
        reasonsToVisit: ['Wild alpine meadows in full bloom', 'Crystal clear swimming in Lake Brienz', 'First Cliff Walk adrenaline'],
        popularActivities: ['Jungfraujoch Top of Europe', 'Hiking Lauterbrunnen 72 waterfalls', 'Glacier Express panoramic train'],
        recommendedPackageId: 'pkg-swiss-budget',
        packageCategory: 'standard',
      },
      {
        id: 'bali',
        name: 'Bali',
        country: 'Indonesia',
        season: 'summer',
        months: 'Jun – Aug',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
        weatherSummary: 'Dry season, clear blue skies & surf winds',
        tempRange: '26°C – 29°C',
        budgetUSD: 450,
        reasonsToVisit: ['Ideal ocean surfing conditions', 'Ubud wellness yoga retreats', 'Vibrant cliff clubs at Uluwatu'],
        popularActivities: ['Mount Batur sunrise hike', 'Scuba diving at Nusa Penida', 'Tegallalang rice terrace swing'],
        packageCategory: 'budget',
      },
      {
        id: 'paris',
        name: 'Paris',
        country: 'France',
        season: 'summer',
        months: 'Jun – Aug',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
        weatherSummary: 'Warm long daylight evenings',
        tempRange: '18°C – 28°C',
        budgetUSD: 1100,
        reasonsToVisit: ['Outdoor café terrace culture', 'Seine river picnic sunsets', 'Open-air art festivals'],
        popularActivities: ['Eiffel Tower twilight climb', 'Louvre Museum art treasures', 'Palace of Versailles cycling'],
        packageCategory: 'standard',
      },
    ],
  },
  monsoon: {
    title: 'Lush Monsoon & Ayurvedic Retreats',
    description: 'Emerald green landscapes, misty tea slopes, and world-renowned wellness rejuvenation.',
    icon: 'cloud-rain',
    destinations: [
      {
        id: 'kerala',
        name: 'Kerala',
        country: 'India',
        season: 'monsoon',
        months: 'Jun – Aug',
        image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
        weatherSummary: 'Atmospheric rains & mist-shrouded hills',
        tempRange: '23°C – 28°C',
        budgetUSD: 360,
        reasonsToVisit: ['Prime season for authentic Ayurvedic wellness', 'Lush roaring Athirappilly waterfalls', 'Quiet backwaters on private houseboats'],
        popularActivities: ['Traditional Panchakarma massage', 'Alleppey houseboat cruise', 'Munnar mist tea plantation trek'],
        recommendedPackageId: 'pkg-kerala-standard',
        packageCategory: 'standard',
      },
    ],
  },
  spring: {
    title: 'Spring Blossoms & Awakening Nature',
    description: 'Delicate cherry blossoms, vibrant tulips, and mild romantic temperatures.',
    icon: 'flower',
    destinations: [
      {
        id: 'japan',
        name: 'Japan',
        country: 'Japan',
        season: 'spring',
        months: 'Mar – May',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
        weatherSummary: 'Mild sunny days & cherry blossom breezes',
        tempRange: '14°C – 21°C',
        budgetUSD: 1190,
        reasonsToVisit: ['Sakura cherry blossoms in full bloom', 'Hanami picnic festivities under pink trees', 'Mild walking weather across ancient Kyoto'],
        popularActivities: ['Philosopher\'s Walk in Kyoto', 'Mount Fuji spring viewing', 'Fushimi Inari Torii gates'],
        recommendedPackageId: 'pkg-japan-standard',
        packageCategory: 'standard',
      },
      {
        id: 'paris',
        name: 'Paris',
        country: 'France',
        season: 'spring',
        months: 'Apr – May',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
        weatherSummary: 'Fresh blooms & delightful sunshine',
        tempRange: '13°C – 20°C',
        budgetUSD: 1100,
        reasonsToVisit: ['Jardin du Luxembourg blossoming', 'Fewer crowds than peak summer', 'Pleasant strolls along the Seine'],
        popularActivities: ['Seine river dinner boat', 'Montmartre artist quarter walk', 'Croissant tasting in Le Marais'],
        packageCategory: 'standard',
      },
    ],
  },
  autumn: {
    title: 'Golden Autumn & Cultural Splendour',
    description: 'Fiery red maple leaves, comfortable harvest season temperatures, and wine tasting.',
    icon: 'leaf',
    destinations: [
      {
        id: 'japan',
        name: 'Japan',
        country: 'Japan',
        season: 'autumn',
        months: 'Oct – Nov',
        image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
        weatherSummary: 'Crisp clear blue skies & brilliant red foliage',
        tempRange: '15°C – 22°C',
        budgetUSD: 1190,
        reasonsToVisit: ['Momiji scarlet maple leaves in Kyoto gardens', 'Delicious autumn seasonal delicacies', 'Clear views of Mount Fuji'],
        popularActivities: ['Night illuminations at Kyoto temples', 'Tokyo Shibuya food crawl', 'Lake Kawaguchiko walk'],
        recommendedPackageId: 'pkg-japan-standard',
        packageCategory: 'standard',
      },
      {
        id: 'switzerland',
        name: 'Switzerland',
        country: 'Switzerland',
        season: 'autumn',
        months: 'Sep – Oct',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        weatherSummary: 'Golden larch trees & crisp mountain air',
        tempRange: '10°C – 18°C',
        budgetUSD: 1390,
        reasonsToVisit: ['Golden alpine forests', 'Grape harvest in Lavaux vineyard terraces', 'Quiet hiking trails without summer crowds'],
        popularActivities: ['Wine tasting by Lake Geneva', 'Matterhorn reflection walks', 'Cozy fondue dinners'],
        recommendedPackageId: 'pkg-swiss-budget',
        packageCategory: 'standard',
      },
    ],
  },
};
