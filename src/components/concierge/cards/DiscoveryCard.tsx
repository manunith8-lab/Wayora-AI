import React, { useState } from 'react';
import { 
  MapPin, 
  ExternalLink, 
  Compass, 
  Trees, 
  Sparkles, 
  Landmark, 
  Camera, 
  ChevronDown, 
  Clock, 
  DollarSign, 
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  Car
} from 'lucide-react';
import { DestinationDiscoveryResult, DiscoveryCategory, DiscoveredPlace } from '../../../services/placesService';
import { RatingStars } from '../../common/RatingStars';

interface DiscoveryCardProps {
  data: DestinationDiscoveryResult;
  onSelectPlace?: (place: DiscoveredPlace) => void;
  onExploreSubDestination?: (destName: string) => void;
}

const CATEGORY_TABS: { id: DiscoveryCategory; label: string; icon: any }[] = [
  { id: 'MUST_VISIT', label: 'Must Visit', icon: Sparkles },
  { id: 'NATURE_ADVENTURE', label: 'Nature & Adventure', icon: Trees },
  { id: 'HIDDEN_GEMS', label: 'Hidden Gems', icon: Compass },
  { id: 'HISTORY_CULTURE', label: 'History & Culture', icon: Landmark },
  { id: 'PHOTOGRAPHY', label: 'Photography', icon: Camera },
];

export const DiscoveryCard: React.FC<DiscoveryCardProps> = ({ 
  data, 
  onSelectPlace,
  onExploreSubDestination 
}) => {
  const [activeCategory, setActiveCategory] = useState<DiscoveryCategory>('MUST_VISIT');
  const [displayCount, setDisplayCount] = useState<number>(4);
  const [showSubDestinations, setShowSubDestinations] = useState<boolean>(
    data.geographicType === 'state_region' || data.geographicType === 'country'
  );

  // Places in selected category
  const currentCategoryPlaces = data.categorizedPlaces[activeCategory] || [];
  const placesToShow = currentCategoryPlaces.length > 0 
    ? currentCategoryPlaces 
    : data.allPlaces.slice(0, 6);

  const visiblePlaces = placesToShow.slice(0, displayCount);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-forest-100 dark:border-slate-800 shadow-md p-4 sm:p-5 space-y-4 text-charcoal dark:text-gray-100 max-w-full">
      
      {/* Destination Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-gold-600 dark:text-gold-400 text-[11px] font-bold uppercase tracking-wider">
            <MapPin size={13} />
            <span>
              {data.geographicType === 'state_region' ? 'State / Regional Guide' : data.geographicType === 'country' ? 'Country Travel Guide' : 'Destination Knowledge'}
            </span>
            <span className="text-gray-400">• {data.sourceAttribution}</span>
          </div>
          <h4 className="font-serif text-xl sm:text-2xl font-bold text-forest-900 dark:text-white">
            {data.destination} {data.country && !data.destination.includes(data.country) ? `• ${data.country}` : ''}
          </h4>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {data.overview?.bestTimeToVisit && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-forest-50 dark:bg-slate-800 text-forest-900 dark:text-gold-300 text-[10px] font-semibold">
              <Calendar size={11} className="text-gold-500" />
              <span>{data.overview.bestTimeToVisit.split('(')[0]}</span>
            </span>
          )}
          {data.isLiveApi && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Verified Data</span>
            </span>
          )}
        </div>
      </div>

      {/* Destination Overview Details Pills if Available */}
      {data.overview && (
        <div className="p-3.5 rounded-2xl bg-forest-50/60 dark:bg-slate-800/60 border border-forest-100/80 dark:border-slate-700/60 space-y-2 text-xs">
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-gray-600 dark:text-gray-300">
            {data.overview.recommendedDuration && (
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-gold-600 dark:text-gold-400" />
                <strong>Duration:</strong> {data.overview.recommendedDuration}
              </span>
            )}
            {data.overview.climate && (
              <span className="flex items-center gap-1">
                <Trees size={12} className="text-emerald-600 dark:text-emerald-400" />
                <strong>Climate:</strong> {data.overview.climate.split(';')[0]}
              </span>
            )}
            {data.overview.languages && (
              <span className="flex items-center gap-1">
                <Info size={12} className="text-blue-500" />
                <strong>Languages:</strong> {data.overview.languages.join(', ')}
              </span>
            )}
          </div>
          {data.overview.famousFor && data.overview.famousFor.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 pt-1">
              <span className="text-[10px] font-bold uppercase text-forest-800 dark:text-gold-400 mr-1">Famous for:</span>
              {data.overview.famousFor.slice(0, 5).map((f, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-forest-100 dark:border-slate-800 text-[10px] text-gray-700 dark:text-gray-300">
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STATE / REGION VIEW: SHOW SUB-DESTINATIONS FIRST */}
      {data.subDestinations && data.subDestinations.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-forest-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={14} className="text-gold-500" />
              <span>Major Tourist Destinations in {data.destination} ({data.subDestinations.length})</span>
            </span>
            <button
              onClick={() => setShowSubDestinations(!showSubDestinations)}
              className="text-[11px] font-bold text-forest-700 dark:text-gold-400 hover:underline"
            >
              {showSubDestinations ? 'Hide Towns' : 'View Towns'}
            </button>
          </div>

          {showSubDestinations && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.subDestinations.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-800/90 border border-gray-100 dark:border-slate-700 flex flex-col justify-between shadow-xs hover:border-gold-300 dark:hover:border-gold-500/50 transition group"
                >
                  <div>
                    {sub.heroPhoto && (
                      <div className="h-28 rounded-xl overflow-hidden mb-2 relative">
                        <img
                          src={sub.heroPhoto}
                          alt={sub.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-forest-950/80 backdrop-blur-xs text-white text-[9px] font-bold">
                          {sub.name}
                        </span>
                      </div>
                    )}
                    <h5 className="font-bold text-xs text-forest-900 dark:text-white">
                      {sub.name}
                    </h5>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                      {sub.tagline}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {sub.highlights.slice(0, 3).map((h, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.2 rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onExploreSubDestination?.(sub.name)}
                    className="mt-2.5 w-full py-1.5 rounded-lg bg-forest-50 dark:bg-slate-700 text-forest-900 dark:text-gold-300 hover:bg-forest-900 hover:text-white dark:hover:bg-gold-500 dark:hover:text-forest-950 font-bold text-[10px] transition flex items-center justify-center gap-1"
                  >
                    <span>Explore Attractions in {sub.name}</span>
                    <ArrowRight size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CITY / DESTINATION VIEW: ATTRACTION TABS */}
      {data.allPlaces.length > 0 && (
        <>
          <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Iconic Attractions & Landmarks
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {CATEGORY_TABS.map((tab) => {
                const Icon = tab.icon;
                const count = (data.categorizedPlaces[tab.id] || []).length;
                const isSelected = activeCategory === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveCategory(tab.id);
                      setDisplayCount(4);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      isSelected
                        ? 'bg-forest-900 text-white dark:bg-gold-500 dark:text-forest-950 shadow-sm'
                        : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={13} />
                    <span>{tab.label}</span>
                    {count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white dark:bg-forest-900/40 dark:text-forest-950' : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Places Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {visiblePlaces.map((place) => (
              <div
                key={place.id}
                className="group p-3.5 rounded-2xl bg-gray-50/70 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 flex flex-col justify-between hover:border-gold-300 dark:hover:border-gold-500/40 transition-all shadow-sm"
              >
                <div>
                  {/* Photo if available */}
                  {place.photoUrl && (
                    <div className="relative h-36 rounded-xl overflow-hidden mb-2.5">
                      <img
                        src={place.photoUrl}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-forest-950/80 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider">
                        {place.categoryLabel}
                      </span>
                      {place.distanceFromCenter && (
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-forest-950/80 backdrop-blur-md text-gold-300 text-[9px] font-semibold">
                          {place.distanceFromCenter}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-1">
                      <h5 className="font-serif font-bold text-sm text-forest-900 dark:text-white line-clamp-1">
                        {place.name}
                      </h5>
                      {place.rating !== undefined && (
                        <RatingStars rating={place.rating} reviewCount={place.reviewCount} size={11} />
                      )}
                    </div>

                    <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {place.description}
                    </p>

                    {place.whyFamous && (
                      <p className="text-[10px] text-forest-800 dark:text-gold-400/90 font-medium line-clamp-1">
                        ★ {place.whyFamous}
                      </p>
                    )}
                  </div>

                  {/* Status / Location Meta */}
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-[10px] text-gray-400">
                    {place.openingHours && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Clock size={10} />
                        <span>{place.openingHours}</span>
                      </span>
                    )}
                    {place.entryFee && (
                      <span className="flex items-center gap-1 text-gold-700 dark:text-gold-400 font-semibold">
                        <DollarSign size={10} />
                        <span>{place.entryFee}</span>
                      </span>
                    )}
                    {place.location && (
                      <span className="truncate max-w-[180px]">{place.location}</span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 mt-2 border-t border-gray-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <a
                    href={place.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-forest-800 dark:text-gold-400 hover:underline flex items-center gap-1"
                  >
                    <span>View on Map</span>
                    <ExternalLink size={10} />
                  </a>

                  {onSelectPlace && (
                    <button
                      onClick={() => onSelectPlace(place)}
                      className="text-[11px] font-bold text-gray-500 hover:text-forest-900 dark:hover:text-white transition"
                    >
                      More Details
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Progressive Loading ("Show More Results") */}
          {placesToShow.length > displayCount && (
            <div className="pt-2 text-center">
              <button
                onClick={() => setDisplayCount((prev) => prev + 4)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-forest-900 dark:text-gold-400 font-bold text-xs hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                <span>Show More Results ({placesToShow.length - displayCount} remaining)</span>
                <ChevronDown size={14} />
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
};
