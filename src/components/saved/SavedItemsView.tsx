import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, ArrowRight, Compass, Building, Briefcase } from 'lucide-react';
import { SavedItem, SupportedLanguage } from '../../types/travel';
import { storageService } from '../../services/storageService';
import { TRANSLATIONS } from '../../data/translationsData';

interface SavedItemsViewProps {
  currentLang: SupportedLanguage;
  currentCurrency: string;
  onExploreDestination: (destName: string) => void;
  onSelectTab: (tab: string) => void;
}

export const SavedItemsView: React.FC<SavedItemsViewProps> = ({
  currentLang,
  currentCurrency,
  onExploreDestination,
  onSelectTab,
}) => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'destination' | 'hotel' | 'package' | 'itinerary'>('all');

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  useEffect(() => {
    setSavedItems(storageService.getSavedItems());
  }, []);

  const handleRemove = (itemId: string) => {
    storageService.removeSavedItem(itemId);
    setSavedItems(savedItems.filter((i) => i.itemId !== itemId));
  };

  const filtered = savedItems.filter((item) =>
    filterType === 'all' ? true : item.type === filterType
  );

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
            Personal Collection
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest-900 dark:text-white">
            {t.savedTrips}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Access your bookmarked destinations, favourite luxury stays, packages, and custom itineraries
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl overflow-x-auto">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'destination', label: 'Destinations' },
            { id: 'hotel', label: 'Hotels' },
            { id: 'package', label: 'Packages' },
            { id: 'itinerary', label: 'Itineraries' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                filterType === f.id
                  ? 'bg-white dark:bg-slate-900 text-forest-900 dark:text-gold-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-charcoal'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-forest-100 dark:border-slate-800 shadow-card hover:shadow-floating transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-forest-950/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                    {item.type}
                  </span>

                  <button
                    onClick={() => handleRemove(item.itemId)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-red-500 text-white transition backdrop-blur-md"
                    title="Remove from saved"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-serif text-lg font-bold leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gold-300 font-medium line-clamp-1">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="p-4 text-xs text-gray-500">
                  <span>Saved on {new Date(item.savedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => {
                    if (item.type === 'destination') {
                      onExploreDestination(item.title);
                    } else if (item.type === 'itinerary') {
                      onSelectTab('custom-trip');
                    } else if (item.type === 'package') {
                      onSelectTab('packages');
                    } else {
                      onSelectTab('hotels');
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-forest-900 dark:bg-gold-500 text-white dark:text-forest-950 font-bold text-xs hover:bg-forest-800 transition flex items-center justify-center gap-1.5 shadow"
                >
                  <span>Open Item</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-dashed border-forest-200 dark:border-slate-800 space-y-3">
          <Bookmark size={36} className="mx-auto text-gold-500 opacity-60" />
          <h4 className="font-serif text-xl font-bold text-forest-900 dark:text-white">
            No saved items found
          </h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Bookmark destinations, packages, hotels, and custom itineraries throughout Wayora to easily retrieve them anytime.
          </p>
          <button
            onClick={() => onSelectTab('destinations')}
            className="px-5 py-2.5 rounded-xl bg-forest-900 dark:bg-gold-500 text-white dark:text-forest-950 font-bold text-xs"
          >
            Explore Destinations
          </button>
        </div>
      )}
    </div>
  );
};
