import React, { useState } from 'react';
import { X, Plus, Minus, Check, Calendar, Users, Sliders, ArrowRight } from 'lucide-react';
import { TravelPackage, SupportedLanguage } from '../../types/travel';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { TRANSLATIONS } from '../../data/translationsData';

interface CustomPackageDrawerProps {
  pkg: TravelPackage | null;
  isOpen: boolean;
  onClose: () => void;
  currentCurrency: string;
  currentLang: SupportedLanguage;
  onSaveCustomization: (customPkg: TravelPackage) => void;
}

export const CustomPackageDrawer: React.FC<CustomPackageDrawerProps> = ({
  pkg,
  isOpen,
  onClose,
  currentCurrency,
  currentLang,
  onSaveCustomization,
}) => {
  if (!isOpen || !pkg) return null;

  const [days, setDays] = useState(pkg.durationDays);
  const [travelers, setTravelers] = useState(pkg.travelersCount);
  const [includedItems, setIncludedItems] = useState<string[]>(pkg.includedFacilities);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Calculate customized total dynamic price
  const basePerPerson = (pkg.priceTotalUSD / pkg.travelersCount / pkg.durationDays);
  const updatedTotalUSD = Math.round(basePerPerson * days * travelers);
  const updatedPerPersonUSD = Math.round(updatedTotalUSD / travelers);

  const toggleItem = (item: string) => {
    if (includedItems.includes(item)) {
      setIncludedItems(includedItems.filter((i) => i !== item));
    } else {
      setIncludedItems([...includedItems, item]);
    }
  };

  const handleSave = () => {
    const customized: TravelPackage = {
      ...pkg,
      durationDays: days,
      durationNights: Math.max(1, days - 1),
      travelersCount: travelers,
      priceTotalUSD: updatedTotalUSD,
      pricePerPersonUSD: updatedPerPersonUSD,
      includedFacilities: includedItems,
    };
    onSaveCustomization(customized);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto border-l border-forest-100 dark:border-slate-800 text-charcoal dark:text-gray-100">
        
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
                Customise Package
              </span>
              <h3 className="font-serif text-xl font-bold text-forest-900 dark:text-white">
                {pkg.name}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-charcoal dark:hover:text-white transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Duration Adjustment */}
          <div className="p-4 rounded-2xl bg-forest-50 dark:bg-slate-800 border border-forest-100 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-forest-900 dark:text-gray-100 flex items-center gap-1.5">
                <Calendar size={14} className="text-gold-500" />
                Duration (Days)
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDays(Math.max(2, days - 1))}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 flex items-center justify-center text-sm font-bold shadow-sm"
                >
                  -
                </button>
                <span className="font-bold text-sm min-w-6 text-center">{days}</span>
                <button
                  type="button"
                  onClick={() => setDays(days + 1)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 flex items-center justify-center text-sm font-bold shadow-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Travelers Adjustment */}
            <div className="flex items-center justify-between pt-2 border-t border-forest-100/60 dark:border-slate-700">
              <span className="text-xs font-bold text-forest-900 dark:text-gray-100 flex items-center gap-1.5">
                <Users size={14} className="text-gold-500" />
                Travelers
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTravelers(Math.max(1, travelers - 1))}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 flex items-center justify-center text-sm font-bold shadow-sm"
                >
                  -
                </button>
                <span className="font-bold text-sm min-w-6 text-center">{travelers}</span>
                <button
                  type="button"
                  onClick={() => setTravelers(travelers + 1)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 flex items-center justify-center text-sm font-bold shadow-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Inclusions Customization */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900 dark:text-white mb-2">
              Toggle Inclusions & Add-ons
            </h4>
            <div className="space-y-2">
              {pkg.includedFacilities.map((item, idx) => {
                const isSelected = includedItems.includes(item);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleItem(item)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-forest-50 dark:bg-slate-800 border-forest-200 dark:border-slate-600 text-forest-900 dark:text-gray-100 font-medium'
                        : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-400 line-through'
                    }`}
                  >
                    <span>{item}</span>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-forest-900 text-white dark:bg-gold-500 dark:text-forest-950' : 'border border-gray-300'
                    }`}>
                      {isSelected && <Check size={12} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer with Live Quote & Confirm */}
        <div className="pt-6 border-t border-gray-100 dark:border-slate-800 space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">
                Adjusted Total Quote
              </span>
              <CurrencyDisplay
                amountUSD={updatedTotalUSD}
                currencyCode={currentCurrency}
                className="text-2xl font-bold text-forest-900 dark:text-gold-400"
              />
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block">Per Person</span>
              <CurrencyDisplay
                amountUSD={updatedPerPersonUSD}
                currencyCode={currentCurrency}
                className="text-sm font-semibold text-gray-600 dark:text-gray-300"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-2xl bg-forest-900 dark:bg-gold-500 text-white dark:text-forest-950 font-bold text-sm hover:bg-forest-800 dark:hover:bg-gold-400 transition flex items-center justify-center gap-2 shadow-md"
          >
            <span>Apply Customizations</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};
