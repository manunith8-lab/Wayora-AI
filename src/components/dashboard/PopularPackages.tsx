import React from 'react';
import { TRAVEL_PACKAGES } from '../../data/destinationsData';
import { TravelPackage, SupportedLanguage } from '../../types/travel';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { TRANSLATIONS } from '../../data/translationsData';
import { Clock, Users, Check, Sparkles, SlidersHorizontal, ArrowRight } from 'lucide-react';

interface PopularPackagesProps {
  currentLang: SupportedLanguage;
  currentCurrency: string;
  onSelectPackage: (pkg: TravelPackage) => void;
  onOpenCompare: () => void;
  onCustomise: (pkg: TravelPackage) => void;
}

export const PopularPackages: React.FC<PopularPackagesProps> = ({
  currentLang,
  currentCurrency,
  onSelectPackage,
  onOpenCompare,
  onCustomise,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const getTierColor = (cat: TravelPackage['category']) => {
    switch (cat) {
      case 'luxury':
        return {
          badge: 'bg-gold-500 text-forest-950',
          border: 'border-gold-400 dark:border-gold-500/60 shadow-lg',
          accent: 'text-gold-600 dark:text-gold-400',
        };
      case 'standard':
        return {
          badge: 'bg-forest-900 text-white dark:bg-forest-700',
          border: 'border-forest-200 dark:border-slate-700',
          accent: 'text-forest-800 dark:text-emerald-400',
        };
      default:
        return {
          badge: 'bg-gray-700 text-white dark:bg-gray-600',
          border: 'border-gray-200 dark:border-slate-800',
          accent: 'text-gray-700 dark:text-gray-300',
        };
    }
  };

  return (
    <section className="space-y-6 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
            AI-Engineered Travel Packages
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 dark:text-white">
            {t.popularPackages}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Compare Budget, Standard, and Ultra-Luxury tiers with live cost breakdowns
          </p>
        </div>

        <button
          onClick={onOpenCompare}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-900 dark:bg-slate-800 text-white hover:bg-forest-800 dark:hover:bg-slate-700 text-xs font-bold transition shadow-sm border border-forest-800 dark:border-slate-700"
        >
          <SlidersHorizontal size={14} className="text-gold-400" />
          <span>{t.comparePackages} (3 Tiers)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TRAVEL_PACKAGES.slice(0, 3).map((pkg) => {
          const style = getTierColor(pkg.category);
          return (
            <div
              key={pkg.id}
              className={`group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border ${style.border} transition-all duration-300 hover:shadow-floating flex flex-col justify-between`}
            >
              <div>
                {/* Header Photo */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={pkg.destinationImage}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  {/* Category Pill */}
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${style.badge}`}>
                    {pkg.category} TIER
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-xs text-gold-300 font-semibold block">
                      {pkg.destinationName}
                    </span>
                    <h3 className="font-serif text-lg font-bold leading-snug">
                      {pkg.name}
                    </h3>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4">
                  {/* Duration & Travelers */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock size={13} className="text-forest-700 dark:text-gold-400" />
                      {pkg.durationDays}D / {pkg.durationNights}N
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Users size={13} className="text-forest-700 dark:text-gold-400" />
                      {pkg.travelersCount} Travelers
                    </span>
                  </div>

                  {/* Accommodation highlight */}
                  <div className="p-3 rounded-xl bg-forest-50/70 dark:bg-slate-800/60 border border-forest-100/60 dark:border-slate-800 text-xs">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                      Included Stay:
                    </span>
                    <p className="font-bold text-forest-900 dark:text-gray-100">
                      {pkg.accommodation.name}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {pkg.accommodation.type}
                    </p>
                  </div>

                  {/* Highlights checklist */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      Package Highlights:
                    </span>
                    {pkg.includedFacilities.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <Check size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Price & Actions */}
              <div className="p-5 pt-0">
                <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Estimated Total
                      </span>
                      <CurrencyDisplay
                        amountUSD={pkg.priceTotalUSD}
                        currencyCode={currentCurrency}
                        className="text-xl font-bold text-forest-900 dark:text-gold-400"
                      />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block">
                        Per Person
                      </span>
                      <CurrencyDisplay
                        amountUSD={pkg.pricePerPersonUSD}
                        currencyCode={currentCurrency}
                        className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                      />
                    </div>
                  </div>

                  {/* Live verified notice */}
                  <p className="text-[10px] text-gray-400 italic mb-3">
                    {t.estimatedPriceNotice}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectPackage(pkg)}
                      className="px-3 py-2 rounded-xl bg-forest-50 dark:bg-slate-800 text-forest-900 dark:text-gold-300 hover:bg-forest-100 dark:hover:bg-slate-700 text-xs font-bold transition text-center"
                    >
                      {t.viewDetails}
                    </button>
                    <button
                      onClick={() => onCustomise(pkg)}
                      className="px-3 py-2 rounded-xl bg-forest-900 dark:bg-gold-500 text-white dark:text-forest-950 hover:bg-forest-800 dark:hover:bg-gold-400 text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>Customise</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
