import React, { useState } from 'react';
import { SEASONAL_DATA, SeasonalDestinationCard } from '../../data/seasonalData';
import { Season, SupportedLanguage } from '../../types/travel';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { TRANSLATIONS } from '../../data/translationsData';
import { Snowflake, Sun, CloudRain, Flower, Trees, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

interface SeasonalRecommendationsProps {
  currentLang: SupportedLanguage;
  currentCurrency: string;
  onExploreDestination: (destinationName: string) => void;
}

export const SeasonalRecommendations: React.FC<SeasonalRecommendationsProps> = ({
  currentLang,
  currentCurrency,
  onExploreDestination,
}) => {
  const [activeSeason, setActiveSeason] = useState<Season>('winter');
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const seasonsList: { id: Season; label: string; icon: any }[] = [
    { id: 'winter', label: 'Winter (Nov - Feb)', icon: Snowflake },
    { id: 'summer', label: 'Summer (Jun - Aug)', icon: Sun },
    { id: 'monsoon', label: 'Monsoon (Jun - Aug)', icon: CloudRain },
    { id: 'spring', label: 'Spring (Mar - May)', icon: Flower },
    { id: 'autumn', label: 'Autumn (Sep - Nov)', icon: Trees },
  ];

  const currentSeasonData = SEASONAL_DATA[activeSeason];

  return (
    <section className="space-y-6 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
              Timely Escapes
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              Current Season
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 dark:text-white">
            {t.seasonalRecommendations}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {currentSeasonData.description}
          </p>
        </div>

        {/* Season Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-gray-100 dark:bg-slate-800 rounded-2xl overflow-x-auto max-w-full">
          {seasonsList.map((s) => {
            const Icon = s.icon;
            const isSelected = activeSeason === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSeason(s.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-forest-900 dark:text-gold-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-forest-900 dark:hover:text-white'
                }`}
              >
                <Icon size={14} className={isSelected ? 'text-gold-500' : ''} />
                <span>{s.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Seasonal Destination Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentSeasonData.destinations.map((dest) => (
          <div
            key={dest.id}
            className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-card hover:shadow-floating border border-forest-100 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Photo */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-forest-950/80 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5">
                  <Calendar size={11} className="text-gold-400" />
                  <span>{dest.months}</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-serif text-xl font-bold leading-tight">
                    {dest.name}, {dest.country}
                  </h3>
                  <p className="text-xs text-gold-300 font-medium">
                    {dest.tempRange} • {dest.weatherSummary}
                  </p>
                </div>
              </div>

              {/* Reasons to Visit */}
              <div className="p-4 space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                    Why Visit in {activeSeason.toUpperCase()}:
                  </span>
                  <ul className="space-y-1">
                    {dest.reasonsToVisit.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                        <CheckCircle2 size={13} className="text-forest-700 dark:text-gold-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Popular Activities Tag */}
                <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Top Activities:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {dest.popularActivities.map((act, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-forest-50 dark:bg-slate-800 text-forest-900 dark:text-forest-200"
                      >
                        {act}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Price & Button */}
            <div className="p-4 pt-0">
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                    Estimated Budget
                  </span>
                  <CurrencyDisplay
                    amountUSD={dest.budgetUSD}
                    currencyCode={currentCurrency}
                    suffix={`/${t.perPerson}`}
                    className="text-sm font-bold text-forest-900 dark:text-gold-400"
                  />
                </div>

                <button
                  onClick={() => onExploreDestination(dest.name)}
                  className="px-3 py-1.5 rounded-xl bg-forest-900 dark:bg-gold-500 text-white dark:text-forest-950 text-xs font-bold hover:bg-forest-800 dark:hover:bg-gold-400 transition flex items-center gap-1 shadow-sm"
                >
                  <span>Plan Trip</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
