import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Sun, 
  Calendar, 
  ShieldCheck, 
  Utensils, 
  Compass, 
  Car, 
  ShoppingBag, 
  Sparkles, 
  Camera, 
  Bookmark, 
  CheckCircle2, 
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { Destination, DestinationPhoto, SupportedLanguage } from '../../types/travel';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { RatingStars } from '../common/RatingStars';
import { TRANSLATIONS } from '../../data/translationsData';

interface DestinationDetailModalProps {
  destination: Destination | null;
  isOpen: boolean;
  onClose: () => void;
  currentCurrency: string;
  currentLang: SupportedLanguage;
  onPlanTrip: (destinationName: string) => void;
  onToggleSave: (dest: Destination) => void;
  isSaved: boolean;
  onOpenPhotoLightbox: (photo: DestinationPhoto) => void;
}

export const DestinationDetailModal: React.FC<DestinationDetailModalProps> = ({
  destination,
  isOpen,
  onClose,
  currentCurrency,
  currentLang,
  onPlanTrip,
  onToggleSave,
  isSaved,
  onOpenPhotoLightbox,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'attractions' | 'food' | 'transport' | 'tips'>('overview');

  if (!isOpen || !destination) return null;

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-forest-100 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col text-charcoal dark:text-gray-100">
        
        {/* HEADER HERO BANNER */}
        <div className="relative h-64 sm:h-80 w-full shrink-0 overflow-hidden">
          <img
            src={destination.heroImage}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          {/* Close & Save Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={() => onToggleSave(destination)}
              className="p-2.5 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white transition"
              title="Bookmark Destination"
            >
              <Bookmark
                size={18}
                className={isSaved ? 'fill-gold-400 text-gold-400' : 'text-white'}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Title & Key Attributes */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex items-center gap-2 text-gold-300 text-xs font-semibold">
              <MapPin size={14} />
              <span>{destination.country} • {destination.region}</span>
              <span>•</span>
              <RatingStars rating={destination.rating} reviewCount={destination.reviewCount} />
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
              {destination.name}
            </h2>
            <p className="text-sm sm:text-base text-gray-200 font-light max-w-3xl line-clamp-2">
              {destination.tagline}
            </p>
          </div>
        </div>

        {/* MODAL NAVIGATION TABS */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/60 overflow-x-auto shrink-0">
          {[
            { id: 'overview', label: 'Overview & Seasons' },
            { id: 'photos', label: `Photo Gallery (${destination.images.length})` },
            { id: 'attractions', label: 'Attractions & Activities' },
            { id: 'food', label: 'Dining & Famous Cuisine' },
            { id: 'transport', label: 'Transport & Shopping' },
            { id: 'tips', label: 'Safety & Travel Tips' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-forest-900 text-white dark:bg-gold-500 dark:text-forest-950 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-forest-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* TAB 1: OVERVIEW & SEASONS */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="prose dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                <p>{destination.description}</p>
              </div>

              {/* Weather & Best Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-forest-50 dark:bg-slate-800 border border-forest-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-forest-800 dark:text-gold-400 font-bold text-xs uppercase mb-1">
                    <Sun size={15} />
                    <span>Current Weather</span>
                  </div>
                  <p className="text-2xl font-serif font-bold text-forest-900 dark:text-white">
                    {destination.weather.tempC}°C
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {destination.weather.condition} • Humidity: {destination.weather.humidity}%
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-forest-50 dark:bg-slate-800 border border-forest-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-forest-800 dark:text-gold-400 font-bold text-xs uppercase mb-1">
                    <Calendar size={15} />
                    <span>Best Time to Visit</span>
                  </div>
                  <p className="text-sm font-bold text-forest-900 dark:text-white">
                    {destination.bestTimeToVisit}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Peak Seasons: {destination.season.join(', ')}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-forest-50 dark:bg-slate-800 border border-forest-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-forest-800 dark:text-gold-400 font-bold text-xs uppercase mb-1">
                    <Sparkles size={15} />
                    <span>Estimated Budget</span>
                  </div>
                  <CurrencyDisplay
                    amountUSD={destination.estimatedExpenses.standard}
                    currencyCode={currentCurrency}
                    prefix="Standard: "
                    className="text-base font-bold text-forest-900 dark:text-gold-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Budget from <CurrencyDisplay amountUSD={destination.estimatedExpenses.budget} currencyCode={currentCurrency} className="font-semibold text-xs text-charcoal dark:text-gray-300" />
                  </p>
                </div>
              </div>

              {/* Seasonal Info Details */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 mb-1">
                  Seasonal & Climate Insights
                </h4>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {destination.seasonalInfo}
                </p>
              </div>

              {/* Famous Landmarks Quick Tags */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900 dark:text-white mb-2">
                  Famous Landmarks
                </h4>
                <div className="flex flex-wrap gap-2">
                  {destination.famousLandmarks.map((landmark, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-forest-100/70 dark:bg-slate-800 text-forest-900 dark:text-forest-200 text-xs font-semibold"
                    >
                      {landmark}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PHOTO GALLERY LIGHTBOX */}
          {activeTab === 'photos' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Destination-specific gallery of landmarks, luxury resorts, activities, and cuisine. Click any photo to inspect full resolution.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {destination.images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => onOpenPhotoLightbox(img)}
                    className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all"
                  >
                    <img
                      src={img.url}
                      alt={img.caption}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-forest-950/70 text-white text-[10px] font-bold uppercase tracking-wider">
                      {img.category}
                    </span>

                    <button className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition">
                      <Maximize2 size={13} />
                    </button>

                    <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition">
                      {img.caption}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ATTRACTIONS & ACTIVITIES */}
          {activeTab === 'attractions' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900 dark:text-white mb-3">
                  Top Rated Tourist Attractions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {destination.popularAttractions.map((att, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-forest-50 dark:bg-slate-800/80 border border-forest-100 dark:border-slate-800 flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-forest-700 dark:text-gold-400 mt-0.5 shrink-0" />
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{att}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900 dark:text-white mb-3">
                  Adventure & Outdoor Experiences
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {destination.adventureActivities.map((adv, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 flex items-start gap-2.5">
                      <Compass size={16} className="text-gold-600 dark:text-gold-400 mt-0.5 shrink-0" />
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{adv}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DINING & FAMOUS CUISINE */}
          {activeTab === 'food' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900 dark:text-white mb-3">
                  Iconic Local Dishes & Must-Try Food
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {destination.famousFoods.map((food, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-amber-50/70 dark:bg-slate-800 border border-amber-200/50 dark:border-slate-700 text-xs font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                      <Utensils size={14} className="text-amber-600" />
                      <span>{food}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900 dark:text-white mb-3">
                  Recommended Restaurants & Cafes
                </h4>
                <div className="space-y-2">
                  {destination.localRestaurants.map((res, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 text-xs flex items-center justify-between">
                      <span className="font-bold text-gray-800 dark:text-gray-200">{res}</span>
                      <span className="text-[11px] text-gold-600 dark:text-gold-400 font-semibold">Verified Concierge Pick</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TRANSPORT & SHOPPING */}
          {activeTab === 'transport' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900 dark:text-white mb-3">
                  Local Transportation Options
                </h4>
                <div className="space-y-2">
                  {destination.localTransportation.map((tr, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 flex items-center gap-3 text-xs">
                      <Car size={16} className="text-forest-700 dark:text-gold-400 shrink-0" />
                      <span>{tr}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900 dark:text-white mb-3">
                  Premier Shopping Districts & Souks
                </h4>
                <div className="space-y-2">
                  {destination.shoppingLocations.map((shp, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 flex items-center gap-3 text-xs">
                      <ShoppingBag size={16} className="text-gold-600 dark:text-gold-400 shrink-0" />
                      <span>{shp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SAFETY & TRAVEL TIPS */}
          {activeTab === 'tips' && (
            <div className="space-y-4 animate-in fade-in">
              <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900 dark:text-white mb-2">
                Essential Traveler Safety Guidelines
              </h4>
              <div className="space-y-2.5">
                {destination.safetyTips.map((tip, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 flex items-start gap-3">
                    <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                    <p className="text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 leading-relaxed">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER ACTION BAR */}
        <div className="p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">
              Estimated Total Trip Cost ({t.perPerson})
            </span>
            <div className="flex items-center gap-3">
              <CurrencyDisplay
                amountUSD={destination.estimatedExpenses.standard}
                currencyCode={currentCurrency}
                className="text-xl font-bold text-forest-900 dark:text-gold-400"
              />
              <span className="text-xs text-gray-400 font-normal">
                (Standard Tier Estimate)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onPlanTrip(destination.name);
              }}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-forest-900 dark:bg-gold-500 text-white dark:text-forest-950 font-bold text-sm hover:bg-forest-800 dark:hover:bg-gold-400 transition shadow-md flex items-center justify-center gap-2"
            >
              <span>Plan Personalized {destination.name} Trip</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
