import React from 'react';
import { DESTINATIONS } from '../../data/destinationsData';
import { Destination, SupportedLanguage } from '../../types/travel';
import { RatingStars } from '../common/RatingStars';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { TRANSLATIONS } from '../../data/translationsData';
import { MapPin, Sun, Cloud, CloudRain, Snowflake, Bookmark, ArrowUpRight } from 'lucide-react';

interface TrendingDestinationsProps {
  currentLang: SupportedLanguage;
  currentCurrency: string;
  onSelectDestination: (dest: Destination) => void;
  onToggleSave: (dest: Destination) => void;
  isSaved: (id: string) => boolean;
}

export const TrendingDestinations: React.FC<TrendingDestinationsProps> = ({
  currentLang,
  currentCurrency,
  onSelectDestination,
  onToggleSave,
  isSaved,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'sun':
        return <Sun size={13} className="text-amber-500" />;
      case 'cloud-rain':
        return <CloudRain size={13} className="text-blue-500" />;
      case 'cloud-snow':
        return <Snowflake size={13} className="text-cyan-500" />;
      default:
        return <Cloud size={13} className="text-gray-400" />;
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
            Curated World Wonders
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 dark:text-white">
            {t.trendingDestinations}
          </h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
          Hand-picked destinations with live weather and package quotes
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {DESTINATIONS.map((dest) => {
          const saved = isSaved(dest.id);
          return (
            <div
              key={dest.id}
              className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-card hover:shadow-floating transition-all duration-300 border border-forest-100 dark:border-slate-800 flex flex-col justify-between"
            >
              {/* Image Container with Badges */}
              <div className="relative h-52 overflow-hidden cursor-pointer" onClick={() => onSelectDestination(dest)}>
                <img
                  src={dest.heroImage}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Country Pill */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest-950/70 backdrop-blur-md text-white text-[11px] font-semibold">
                  <MapPin size={11} className="text-gold-400" />
                  <span>{dest.country}</span>
                </div>

                {/* Bookmark Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(dest);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white transition"
                >
                  <Bookmark
                    size={15}
                    className={saved ? 'fill-gold-400 text-gold-400' : 'text-white'}
                  />
                </button>

                {/* Weather Pill */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-charcoal dark:text-white text-[11px] font-semibold">
                  {getWeatherIcon(dest.weather.icon)}
                  <span>{dest.weather.tempC}°C</span>
                  <span className="text-[10px] text-gray-500 font-normal">
                    {dest.weather.condition}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 
                      onClick={() => onSelectDestination(dest)}
                      className="font-serif text-lg font-bold text-forest-900 dark:text-white group-hover:text-gold-600 transition cursor-pointer"
                    >
                      {dest.name}
                    </h3>
                    <RatingStars rating={dest.rating} reviewCount={dest.reviewCount} />
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {dest.tagline}
                  </p>
                </div>

                {/* Pricing & CTA */}
                <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      From ({t.budgetPackage})
                    </span>
                    <CurrencyDisplay
                      amountUSD={dest.estimatedExpenses.budget}
                      currencyCode={currentCurrency}
                      suffix={`/${t.perPerson}`}
                      className="text-base font-bold text-forest-900 dark:text-gold-400"
                    />
                  </div>

                  <button
                    onClick={() => onSelectDestination(dest)}
                    className="p-2 rounded-xl bg-forest-50 dark:bg-slate-800 text-forest-900 dark:text-gold-400 group-hover:bg-forest-900 group-hover:text-white dark:group-hover:bg-gold-500 dark:group-hover:text-forest-950 transition-all flex items-center justify-center shadow-sm"
                  >
                    <ArrowUpRight size={18} />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
};
