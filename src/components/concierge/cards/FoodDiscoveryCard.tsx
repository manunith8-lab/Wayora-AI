import React, { useState } from 'react';
import { Utensils, MapPin, ExternalLink, Clock, Sparkles, ChefHat, Store } from 'lucide-react';
import { DestinationDiscoveryResult, DiscoveredRestaurant } from '../../../services/placesService';
import { RatingStars } from '../../common/RatingStars';

interface FoodDiscoveryCardProps {
  data: DestinationDiscoveryResult;
}

export const FoodDiscoveryCard: React.FC<FoodDiscoveryCardProps> = ({ data }) => {
  const [tab, setTab] = useState<'traditional' | 'restaurants'>('traditional');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-forest-100 dark:border-slate-800 shadow-md p-4 sm:p-5 space-y-4 text-charcoal dark:text-gray-100 max-w-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-gold-600 dark:text-gold-400 text-[11px] font-bold uppercase tracking-wider">
            <Utensils size={13} />
            <span>Culinary & Gastronomy Guide</span>
          </div>
          <h4 className="font-serif text-xl sm:text-2xl font-bold text-forest-900 dark:text-white">
            {data.destination} Cuisine & Dining
          </h4>
        </div>

        {/* Clear Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setTab('traditional')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              tab === 'traditional'
                ? 'bg-white dark:bg-slate-900 text-forest-900 dark:text-gold-400 shadow-sm'
                : 'text-gray-500 hover:text-charcoal'
            }`}
          >
            <ChefHat size={13} />
            <span>Traditional Dishes ({data.traditionalFoods.length})</span>
          </button>

          <button
            onClick={() => setTab('restaurants')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              tab === 'restaurants'
                ? 'bg-white dark:bg-slate-900 text-forest-900 dark:text-gold-400 shadow-sm'
                : 'text-gray-500 hover:text-charcoal'
            }`}
          >
            <Store size={13} />
            <span>Real Restaurants ({data.restaurants.length})</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: TRADITIONAL REGIONAL DISHES */}
      {tab === 'traditional' && (
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs">
            <strong>Authentic Regional Heritage:</strong> These are time-honored dishes and traditional culinary specialties native to {data.destination}.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.traditionalFoods.map((dish, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 space-y-1 hover:border-gold-300 transition"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-serif font-bold text-sm text-forest-900 dark:text-white">
                    {dish.name}
                  </h5>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gold-100 dark:bg-gold-950 text-gold-800 dark:text-gold-300">
                    Regional Specialty
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {dish.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: REAL RESTAURANTS & FOOD VENUES (GOOGLE PLACES / OSM) */}
      {tab === 'restaurants' && (
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-forest-50/80 dark:bg-forest-950/40 border border-forest-100 dark:border-forest-900 text-forest-900 dark:text-forest-200 text-xs">
            <strong>Verified Food Establishments:</strong> Real restaurants, bistros, and eateries retrieved via live Google Places and OpenStreetMap directory.
          </div>

          {data.restaurants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.restaurants.map((rest) => (
                <div
                  key={rest.id}
                  className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 flex flex-col justify-between space-y-2 hover:border-gold-300 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-1">
                      <h5 className="font-serif font-bold text-sm text-forest-900 dark:text-white line-clamp-1">
                        {rest.name}
                      </h5>
                      {rest.rating !== undefined && (
                        <RatingStars rating={rest.rating} size={11} />
                      )}
                    </div>

                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Cuisine: <span className="font-semibold text-gray-700 dark:text-gray-200">{rest.cuisine}</span>
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-gray-400 pt-1">
                      <MapPin size={10} className="shrink-0 text-forest-700" />
                      <span className="truncate">{rest.location}</span>
                    </div>

                    {rest.openingHours && (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Clock size={10} />
                        <span>{rest.openingHours}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-gray-400 font-medium">
                      Source: {rest.source === 'google' ? 'Google Places' : 'OpenStreetMap'}
                    </span>

                    <a
                      href={rest.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-forest-800 dark:text-gold-400 hover:underline flex items-center gap-1"
                    >
                      <span>Find on Google Maps</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-xs text-gray-400 py-6">
              No live restaurants returned for this exact query. Add Google Places API key in Settings for full commercial business directory.
            </p>
          )}
        </div>
      )}

    </div>
  );
};
