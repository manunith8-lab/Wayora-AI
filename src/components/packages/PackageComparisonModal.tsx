import React from 'react';
import { X, Check, Minus, Clock, Users, ShieldAlert, Sparkles, SlidersHorizontal, Download } from 'lucide-react';
import { TravelPackage, SupportedLanguage } from '../../types/travel';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { TRANSLATIONS } from '../../data/translationsData';
import { exportPackagePDF } from '../../services/pdfService';

interface PackageComparisonModalProps {
  packages: TravelPackage[];
  isOpen: boolean;
  onClose: () => void;
  currentCurrency: string;
  currentLang: SupportedLanguage;
  onSelectPackage: (pkg: TravelPackage) => void;
  onCustomise: (pkg: TravelPackage) => void;
}

export const PackageComparisonModal: React.FC<PackageComparisonModalProps> = ({
  packages,
  isOpen,
  onClose,
  currentCurrency,
  currentLang,
  onSelectPackage,
  onCustomise,
}) => {
  if (!isOpen || packages.length === 0) return null;

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const comparisonRows = [
    {
      label: 'Accommodation Style',
      render: (pkg: TravelPackage) => (
        <div>
          <span className="font-bold text-forest-900 dark:text-white block">
            {pkg.accommodation.name}
          </span>
          <span className="text-[11px] text-gray-500">{pkg.accommodation.type}</span>
        </div>
      ),
    },
    {
      label: 'Estimated Transportation',
      render: (pkg: TravelPackage) => (
        <CurrencyDisplay amountUSD={pkg.transportationCostsUSD} currencyCode={currentCurrency} className="font-semibold text-xs text-forest-900 dark:text-gray-200" />
      ),
    },
    {
      label: 'Estimated Dining & Food',
      render: (pkg: TravelPackage) => (
        <CurrencyDisplay amountUSD={pkg.foodExpensesUSD} currencyCode={currentCurrency} className="font-semibold text-xs text-forest-900 dark:text-gray-200" />
      ),
    },
    {
      label: 'Sightseeing & Entry Passes',
      render: (pkg: TravelPackage) => (
        <CurrencyDisplay amountUSD={pkg.sightseeingCostsUSD} currencyCode={currentCurrency} className="font-semibold text-xs text-forest-900 dark:text-gray-200" />
      ),
    },
    {
      label: 'Special Experiences & Activities',
      render: (pkg: TravelPackage) => (
        <CurrencyDisplay amountUSD={pkg.activityCostsUSD} currencyCode={currentCurrency} className="font-semibold text-xs text-forest-900 dark:text-gray-200" />
      ),
    },
    {
      label: 'Price Per Person',
      render: (pkg: TravelPackage) => (
        <CurrencyDisplay
          amountUSD={pkg.pricePerPersonUSD}
          currencyCode={currentCurrency}
          className="text-base font-bold text-forest-900 dark:text-gold-400"
        />
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-forest-100 dark:border-slate-800 my-auto max-h-[92vh] flex flex-col text-charcoal dark:text-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-forest-900 text-white shrink-0">
          <div>
            <div className="flex items-center gap-2 text-gold-400 text-xs font-semibold uppercase tracking-wider mb-0.5">
              <SlidersHorizontal size={14} />
              <span>Wayora Multi-Tier Matrix</span>
            </div>
            <h2 className="font-serif text-2xl font-bold">
              Compare Travel Packages
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Notice of Estimated vs Verified Pricing */}
        <div className="px-6 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/50 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2 shrink-0">
          <ShieldAlert size={15} className="text-amber-600 shrink-0" />
          <span>
            <strong>Transparency Notice:</strong> All displayed quotes are AI-calculated estimates based on average seasonal expenses. Verified real-time prices are locked at checkout with licensed providers.
          </span>
        </div>

        {/* Scrollable Content Matrix */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => {
              const isLuxury = pkg.category === 'luxury';
              return (
                <div
                  key={pkg.id}
                  className={`rounded-2xl p-5 border flex flex-col justify-between ${
                    isLuxury
                      ? 'border-gold-400 dark:border-gold-500 bg-gold-50/20 dark:bg-gold-950/20 shadow-md'
                      : 'border-forest-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="space-y-4">
                    
                    {/* Header */}
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block mb-1.5 ${
                        isLuxury
                          ? 'bg-gold-500 text-forest-950'
                          : 'bg-forest-900 text-white'
                      }`}>
                        {pkg.category} TIER
                      </span>
                      <h3 className="font-serif text-lg font-bold text-forest-900 dark:text-white">
                        {pkg.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {pkg.durationDays} Days / {pkg.durationNights} Nights • {pkg.travelersCount} Travelers
                      </p>
                    </div>

                    {/* Total Estimated Price Card */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Estimated Total Quote
                      </span>
                      <CurrencyDisplay
                        amountUSD={pkg.priceTotalUSD}
                        currencyCode={currentCurrency}
                        className="text-2xl font-bold text-forest-900 dark:text-gold-400"
                      />
                      <span className="text-xs text-gray-500 block mt-0.5">
                        <CurrencyDisplay amountUSD={pkg.pricePerPersonUSD} currencyCode={currentCurrency} className="font-semibold text-xs text-charcoal dark:text-gray-300" /> per person
                      </span>
                    </div>

                    {/* Breakdown Matrix Rows */}
                    <div className="space-y-2.5 text-xs">
                      {comparisonRows.map((row, idx) => (
                        <div key={idx} className="pb-2 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-gray-500 text-[11px]">{row.label}</span>
                          <div className="text-right">{row.render(pkg)}</div>
                        </div>
                      ))}
                    </div>

                    {/* Included Facilities */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Included Inclusions:
                      </span>
                      {pkg.includedFacilities.slice(0, 4).map((inc, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                          <Check size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{inc}</span>
                        </div>
                      ))}
                    </div>

                    {/* Excluded items */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Excluded:
                      </span>
                      {pkg.excludedFacilities.slice(0, 2).map((exc, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-gray-400">
                          <Minus size={13} className="mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{exc}</span>
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="pt-5 space-y-2">
                    <button
                      onClick={() => onCustomise(pkg)}
                      className="w-full py-2.5 rounded-xl bg-forest-900 dark:bg-gold-500 text-white dark:text-forest-950 font-bold text-xs hover:bg-forest-800 transition shadow"
                    >
                      {t.customizeTrip}
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onSelectPackage(pkg)}
                        className="w-full py-2 rounded-xl bg-white dark:bg-slate-800 text-forest-900 dark:text-gold-400 border border-forest-200 dark:border-slate-700 font-bold text-xs hover:bg-forest-50 transition"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => exportPackagePDF(pkg, currentCurrency)}
                        className="w-full py-2 rounded-xl bg-white dark:bg-slate-800 text-forest-900 dark:text-gold-400 border border-forest-200 dark:border-slate-700 font-bold text-xs hover:bg-forest-50 transition flex items-center justify-center gap-1"
                        title="Download PDF"
                      >
                        <Download size={12} />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
