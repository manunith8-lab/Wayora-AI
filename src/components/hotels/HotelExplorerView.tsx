import React, { useState } from 'react';
import { HOTELS } from '../../data/destinationsData';
import { Hotel, AccommodationCategory, SupportedLanguage } from '../../types/travel';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { RatingStars } from '../common/RatingStars';
import { ExternalLink, Filter, MapPin, Clock, Check, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { TRANSLATIONS } from '../../data/translationsData';

interface HotelExplorerViewProps {
  currentLang: SupportedLanguage;
  currentCurrency: string;
}

const CATEGORIES: { id: AccommodationCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Stays' },
  { id: 'hostel', label: 'Hostels' },
  { id: 'budget', label: 'Budget Hotels' },
  { id: 'homestay', label: 'Homestays' },
  { id: 'guesthouse', label: 'Guest Houses' },
  { id: 'standard', label: 'Standard Hotels' },
  { id: 'premium', label: 'Premium Hotels' },
  { id: 'luxury', label: 'Luxury Hotels' },
  { id: 'resort', label: 'Resorts' },
];

export const HotelExplorerView: React.FC<HotelExplorerViewProps> = ({
  currentLang,
  currentCurrency,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AccommodationCategory | 'all'>('all');
  const [selectedDestination, setSelectedDestination] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priceAsc' | 'priceDesc' | 'rating' | 'reviews'>('rating');
  const [comparedHotels, setComparedHotels] = useState<Hotel[]>([]);
  const [showCompareDrawer, setShowCompareDrawer] = useState(false);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Filter & sort
  let filtered = HOTELS.filter((h) => {
    const matchCat = selectedCategory === 'all' || h.category === selectedCategory;
    const matchDest = selectedDestination === 'all' || h.destinationName.toLowerCase() === selectedDestination.toLowerCase();
    return matchCat && matchDest;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'priceAsc') return a.pricePerNightUSD - b.pricePerNightUSD;
    if (sortBy === 'priceDesc') return b.pricePerNightUSD - a.pricePerNightUSD;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
    return 0;
  });

  const toggleCompare = (hotel: Hotel) => {
    if (comparedHotels.some((h) => h.id === hotel.id)) {
      setComparedHotels(comparedHotels.filter((h) => h.id !== hotel.id));
    } else {
      if (comparedHotels.length >= 3) {
        alert('You can compare up to 3 hotels at once.');
        return;
      }
      setComparedHotels([...comparedHotels, hotel]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
            Verified Stays Directory
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest-900 dark:text-white">
            {t.navHotels}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Compare hostels, homestays, and luxury resorts with verified partner booking links
          </p>
        </div>

        {/* Compare pill trigger */}
        {comparedHotels.length > 0 && (
          <button
            onClick={() => setShowCompareDrawer(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-forest-900 dark:bg-gold-500 text-white dark:text-forest-950 font-bold text-xs shadow-lg transition"
          >
            <SlidersHorizontal size={14} />
            <span>Compare Selected ({comparedHotels.length})</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-forest-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 max-w-full">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-forest-900 text-white dark:bg-gold-500 dark:text-forest-950 shadow-sm'
                  : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort & Destination select */}
        <div className="flex items-center gap-3 shrink-0">
          <select
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-charcoal dark:text-white"
          >
            <option value="all">All Destinations</option>
            <option value="Dubai">Dubai</option>
            <option value="Switzerland">Switzerland</option>
            <option value="Kerala">Kerala</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-charcoal dark:text-white"
          >
            <option value="rating">Highest Rating</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="reviews">Most Reviewed</option>
          </select>
        </div>
      </div>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((hotel) => {
          const isSelected = comparedHotels.some((h) => h.id === hotel.id);
          return (
            <div
              key={hotel.id}
              className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-forest-100 dark:border-slate-800 shadow-card hover:shadow-floating transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Photo */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={hotel.photo}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-forest-950/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                    {hotel.category}
                  </span>

                  <button
                    onClick={() => toggleCompare(hotel)}
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold transition backdrop-blur-md ${
                      isSelected
                        ? 'bg-gold-500 text-forest-950 shadow'
                        : 'bg-black/40 text-white hover:bg-black/60'
                    }`}
                  >
                    {isSelected ? '✓ Compared' : '+ Compare'}
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <RatingStars rating={hotel.rating} reviewCount={hotel.reviewCount} />
                    <h3 className="font-serif text-lg font-bold leading-snug mt-1">
                      {hotel.name}
                    </h3>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-3 text-xs">
                  <div className="flex items-start gap-1.5 text-gray-500 dark:text-gray-400">
                    <MapPin size={13} className="text-forest-700 dark:text-gold-400 mt-0.5 shrink-0" />
                    <span>{hotel.location} • {hotel.distanceToAttractions}</span>
                  </div>

                  <div className="flex items-center gap-4 text-gray-500 text-[11px] pt-1 border-t border-gray-100 dark:border-slate-800">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-forest-700" />
                      Check-in: {hotel.checkInTime}
                    </span>
                    <span>Check-out: {hotel.checkOutTime}</span>
                  </div>

                  {/* Facilities Chips */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {hotel.facilities.slice(0, 4).map((f, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-forest-50 dark:bg-slate-800 text-forest-900 dark:text-forest-200 font-medium"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Price & External Booking Link */}
              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      Starting Rate
                    </span>
                    <CurrencyDisplay
                      amountUSD={hotel.pricePerNightUSD}
                      currencyCode={currentCurrency}
                      suffix="/night"
                      className="text-base font-bold text-forest-900 dark:text-gold-400"
                    />
                  </div>

                  <a
                    href={hotel.bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-forest-900 dark:bg-gold-500 text-white dark:text-forest-950 font-bold text-xs hover:bg-forest-800 transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>{t.bookNow}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Side-by-side Hotel Comparison Drawer */}
      {showCompareDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-forest-100 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
              <h3 className="font-serif text-xl font-bold text-forest-900 dark:text-white">
                Hotel Comparison ({comparedHotels.length} Stays)
              </h3>
              <button
                onClick={() => setShowCompareDrawer(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {comparedHotels.map((h) => (
                <div key={h.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 space-y-3 text-xs">
                  <img src={h.photo} alt={h.name} className="w-full h-32 rounded-xl object-cover" />
                  <h4 className="font-bold text-sm text-forest-900 dark:text-white">{h.name}</h4>
                  <RatingStars rating={h.rating} reviewCount={h.reviewCount} />
                  <div>
                    <span className="text-[10px] text-gray-400 block">Rate per Night:</span>
                    <CurrencyDisplay amountUSD={h.pricePerNightUSD} currencyCode={currentCurrency} className="font-bold text-base text-forest-900 dark:text-gold-400" />
                  </div>
                  <p className="text-[11px] text-gray-500">{h.distanceToAttractions}</p>
                  <a
                    href={h.bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 rounded-xl bg-forest-900 text-white font-bold text-xs text-center block hover:bg-forest-800"
                  >
                    Check Availability
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
