import React, { useState } from 'react';
import { LOCAL_ATTRACTIONS, DESTINATIONS } from '../../data/destinationsData';
import { LocalAttraction, AttractionCategory, SupportedLanguage } from '../../types/travel';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { RatingStars } from '../common/RatingStars';
import { MapPin, Navigation, Clock, Compass, Filter, Utensils, ShoppingBag, Landmark } from 'lucide-react';
import { TRANSLATIONS } from '../../data/translationsData';

interface LocalGuideViewProps {
  currentLang: SupportedLanguage;
  currentCurrency: string;
}

const CATEGORY_FILTERS: { id: AttractionCategory | 'all'; label: string; icon: any }[] = [
  { id: 'all', label: 'All Places', icon: Compass },
  { id: 'attraction', label: 'Landmarks', icon: Landmark },
  { id: 'restaurant', label: 'Restaurants & Dining', icon: Utensils },
  { id: 'adventure', label: 'Adventure', icon: Compass },
  { id: 'cultural', label: 'Cultural Heritage', icon: Landmark },
  { id: 'nature', label: 'Nature & Parks', icon: MapPin },
];

export const LocalGuideView: React.FC<LocalGuideViewProps> = ({
  currentLang,
  currentCurrency,
}) => {
  const [selectedDestination, setSelectedDestination] = useState<string>('Dubai');
  const [selectedCategory, setSelectedCategory] = useState<AttractionCategory | 'all'>('all');
  const [activeAttraction, setActiveAttraction] = useState<LocalAttraction | null>(null);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const filtered = LOCAL_ATTRACTIONS.filter((a) => {
    const matchDest = a.destinationName.toLowerCase() === selectedDestination.toLowerCase();
    const matchCat = selectedCategory === 'all' || a.category === selectedCategory;
    return matchDest && matchCat;
  });

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
            Local Concierge & Attractions
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest-900 dark:text-white">
            {t.navLocalGuide}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Discover verified sights, hidden culinary gems, cultural monuments, and interactive GPS directions
          </p>
        </div>

        {/* Destination Switcher */}
        <div className="flex items-center gap-2">
          {['Dubai', 'Switzerland', 'Kerala'].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDestination(d)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedDestination === d
                  ? 'bg-forest-900 text-white dark:bg-gold-500 dark:text-forest-950 shadow-md'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
        {CATEGORY_FILTERS.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-forest-900 text-white dark:bg-gold-500 dark:text-forest-950 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-slate-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={14} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Two Column Layout: Attractions List & Interactive Map View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Attractions Cards List */}
        <div className="lg:col-span-7 space-y-4 max-h-[750px] overflow-y-auto pr-2">
          {filtered.map((att) => (
            <div
              key={att.id}
              onClick={() => setActiveAttraction(att)}
              className={`group p-4 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md flex flex-col sm:flex-row gap-4 ${
                activeAttraction?.id === att.id
                  ? 'border-forest-900 dark:border-gold-500 ring-2 ring-forest-900/10'
                  : 'border-forest-100 dark:border-slate-800'
              }`}
            >
              <img
                src={att.photo}
                alt={att.name}
                className="w-full sm:w-44 h-36 rounded-2xl object-cover shrink-0"
              />

              <div className="flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
                      {att.category}
                    </span>
                    <RatingStars rating={att.rating} reviewCount={att.reviewsCount} size={13} />
                  </div>

                  <h3 className="font-serif text-base font-bold text-forest-900 dark:text-white leading-snug mt-0.5">
                    {att.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                    {att.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-[11px] text-gray-500">
                      <Clock size={11} className="text-forest-700" />
                      <span>{att.openingHours}</span>
                    </div>
                    {att.estimatedCostUSD > 0 ? (
                      <CurrencyDisplay
                        amountUSD={att.estimatedCostUSD}
                        currencyCode={currentCurrency}
                        prefix="Avg cost: "
                        className="font-bold text-forest-900 dark:text-gold-400 text-xs"
                      />
                    ) : (
                      <span className="text-emerald-600 font-bold text-xs">Free Admission</span>
                    )}
                  </div>

                  <a
                    href={att.directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-xs font-bold text-forest-800 dark:text-gold-400 hover:underline"
                  >
                    <Navigation size={12} />
                    <span>Directions</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Map Visualizer Container */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-forest-100 dark:border-slate-800 shadow-card flex flex-col justify-between h-[650px] lg:sticky lg:top-24">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
            <span className="font-bold text-xs text-forest-900 dark:text-white flex items-center gap-1.5">
              <MapPin size={15} className="text-gold-500" />
              <span>Interactive GPS Navigator: {selectedDestination}</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono">Live OpenLayers / OSM</span>
          </div>

          {/* Map canvas / iframe simulation with real coordinates */}
          <div className="relative flex-1 my-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-forest-950">
            <iframe
              title="Interactive Travel Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                selectedDestination === 'Dubai'
                  ? '55.15,25.05,55.45,25.30'
                  : selectedDestination === 'Switzerland'
                  ? '7.70,46.45,8.20,46.75'
                  : '76.20,9.30,76.50,9.70'
              }&layer=mapnik&marker=${
                activeAttraction
                  ? `${activeAttraction.coordinates.lat},${activeAttraction.coordinates.lng}`
                  : selectedDestination === 'Dubai'
                  ? '25.1972,55.2744'
                  : '46.5935,7.9091'
              }`}
            />

            {/* Overlay Pin Details if clicked */}
            {activeAttraction && (
              <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl border border-forest-100 dark:border-slate-700 text-xs flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-forest-900 dark:text-white line-clamp-1">
                    {activeAttraction.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 line-clamp-1">
                    {activeAttraction.location}
                  </p>
                </div>
                <a
                  href={activeAttraction.directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-forest-900 text-white font-bold text-[11px] hover:bg-forest-800 shrink-0 ml-2"
                >
                  Start Route
                </a>
              </div>
            )}
          </div>

          <p className="text-[11px] text-gray-400 text-center">
            Click any attraction card on the left to pin its exact coordinates and route on the map.
          </p>
        </div>

      </div>
    </div>
  );
};
