import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  Plane, 
  Train, 
  Home, 
  Camera, 
  Utensils, 
  Sun, 
  ShieldAlert, 
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Compass,
  Car
} from 'lucide-react';
import { TravelPlanData, TravelPlanDay } from '../../../types/travel';

interface TravelPlanCardProps {
  data: TravelPlanData;
  onSendFollowUp?: (prompt: string) => void;
}

export const TravelPlanCard: React.FC<TravelPlanCardProps> = ({ data, onSendFollowUp }) => {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'guide' | 'culture'>('itinerary');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedTier, setSelectedTier] = useState<'budget' | 'midRange' | 'luxury'>('midRange');

  const currentTierData = data.costTiers[selectedTier];
  const currentDayData = data.itinerary.find(d => d.dayNumber === selectedDay) || data.itinerary[0];

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden my-3 transition-all">
      {/* Hero Header */}
      <div className="relative h-44 sm:h-52 w-full bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white overflow-hidden">
        {data.bannerPhoto && (
          <img 
            src={data.bannerPhoto} 
            alt={data.destinationName} 
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="relative h-full p-4 sm:p-6 flex flex-col justify-end">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {data.planDurationDays}-Day Complete Plan
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-sm flex items-center gap-1">
              <Sun className="w-3 h-3" />
              {data.bestTimeToVisit.season}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2 text-white">
            <span>{data.flagEmoji}</span>
            <span>{data.destinationName}</span>
            <span className="text-sm font-normal text-slate-300 hidden sm:inline">({data.country})</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 line-clamp-1">
            {data.tagline}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-2 sm:px-4 text-xs sm:text-sm font-medium overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('itinerary')}
          className={`py-3 px-3 sm:px-4 border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeTab === 'itinerary'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-semibold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Day-Wise Itinerary</span>
        </button>

        <button
          onClick={() => setActiveTab('budget')}
          className={`py-3 px-3 sm:px-4 border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeTab === 'budget'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-semibold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Budget & Costs (3 Tiers)</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`py-3 px-3 sm:px-4 border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeTab === 'guide'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-semibold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Plane className="w-4 h-4" />
          <span>Transit & Stays</span>
        </button>

        <button
          onClick={() => setActiveTab('culture')}
          className={`py-3 px-3 sm:px-4 border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeTab === 'culture'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-semibold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Photos & Food</span>
        </button>
      </div>

      {/* Tab 1: Day-Wise Itinerary */}
      {activeTab === 'itinerary' && (
        <div className="p-4 sm:p-6 space-y-4">
          {/* Day Selector Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {data.itinerary.map(day => (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDay(day.dayNumber)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedDay === day.dayNumber
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Day {day.dayNumber}
              </button>
            ))}
          </div>

          {currentDayData && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {currentDayData.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Theme: {currentDayData.theme}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Est. Daily Spend</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    ~${currentDayData.dayTotalEstimatedUSD}/person
                  </span>
                </div>
              </div>

              {/* Time Slots Timeline */}
              <div className="space-y-3 pt-1">
                {currentDayData.slots.map((slot, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row gap-3.5"
                  >
                    {slot.attractionPhoto && (
                      <div className="sm:w-28 sm:h-24 h-36 w-full rounded-lg overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700">
                        <img 
                          src={slot.attractionPhoto} 
                          alt={slot.attractionName || 'Attraction'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          slot.timeSlot === 'Morning' 
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            : slot.timeSlot === 'Afternoon'
                              ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300'
                              : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300'
                        }`}>
                          {slot.timeSlot}
                        </span>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {slot.durationHours} hrs
                          </span>
                          {slot.travelTimeMinutes && (
                            <span className="flex items-center gap-1">
                              <Car className="w-3 h-3" />
                              ~{slot.travelTimeMinutes}m transit
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {slot.activity}
                      </h4>

                      {slot.tips && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          💡 {slot.tips}
                        </p>
                      )}

                      {slot.mealRecommendation && (
                        <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                            <Utensils className="w-3 h-3 text-amber-500" />
                            <strong className="text-slate-800 dark:text-slate-100">{slot.mealRecommendation.dish}</strong>
                            <span className="text-slate-400 hidden sm:inline">- {slot.mealRecommendation.description}</span>
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200 shrink-0">
                            ~${slot.mealRecommendation.estimatedCostUSD}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Budget & Costs (3 Tiers) */}
      {activeTab === 'budget' && (
        <div className="p-4 sm:p-6 space-y-5">
          {/* Tier Selector */}
          <div className="grid grid-cols-3 gap-2">
            {(['budget', 'midRange', 'luxury'] as const).map(tier => {
              const info = data.costTiers[tier];
              const isSelected = selectedTier === tier;
              return (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                    {info.label}
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      ${info.totalPerPersonUSD}
                    </span>
                    <span className="text-[11px] text-slate-500">total</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block mt-0.5">
                    ${info.perDayPerPersonUSD}/day
                  </span>
                </button>
              );
            })}
          </div>

          {/* Breakdown Details */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                {currentTierData.label} Breakdown ({data.planDurationDays} Days)
              </h3>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Per person estimates (excluding international flights)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-100">
                  <span className="flex items-center gap-1.5"><Home className="w-3.5 h-3.5 text-blue-500" /> Accommodation</span>
                  <span>${currentTierData.breakdown.accommodationPerDayUSD * data.planDurationDays} (${currentTierData.breakdown.accommodationPerDayUSD}/d)</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  {currentTierData.accommodationExample}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-100">
                  <span className="flex items-center gap-1.5"><Utensils className="w-3.5 h-3.5 text-amber-500" /> Food & Dining</span>
                  <span>${currentTierData.breakdown.foodPerDayUSD * data.planDurationDays} (${currentTierData.breakdown.foodPerDayUSD}/d)</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  {currentTierData.diningStyle}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-100">
                  <span className="flex items-center gap-1.5"><Car className="w-3.5 h-3.5 text-emerald-500" /> Local Transit</span>
                  <span>${currentTierData.breakdown.localTransitPerDayUSD * data.planDurationDays} (${currentTierData.breakdown.localTransitPerDayUSD}/d)</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Metro, public transport passes, local taxis
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-100">
                  <span className="flex items-center gap-1.5"><Compass className="w-3.5 h-3.5 text-purple-500" /> Sightseeing & Misc</span>
                  <span>${(currentTierData.breakdown.activitiesPerDayUSD + currentTierData.breakdown.miscPerDayUSD) * data.planDurationDays}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Monument entry tickets, guided experiences, emergency buffer
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Transit & Stays */}
      {activeTab === 'guide' && (
        <div className="p-4 sm:p-6 space-y-5">
          {/* Transit Guide */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Plane className="w-4 h-4 text-emerald-600" />
              Arrival & Transportation Guide
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-slate-500" /> Nearest Airport
                </span>
                <p className="text-slate-600 dark:text-slate-300">
                  {data.transitGuide.nearestAirports[0] || 'International and regional airport network'}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Airport to city transfer: ~${data.transitGuide.airportToCityEstimateUSD}
                </p>
              </div>

              {data.transitGuide.railwayConnectivity && data.transitGuide.railwayConnectivity.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Train className="w-3.5 h-3.5 text-slate-500" /> Rail & Intercity
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">
                    {data.transitGuide.railwayConnectivity.join(', ')}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-2.5 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <span className="font-semibold text-emerald-900 dark:text-emerald-300 block">Transit Tips:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                {data.transitGuide.localTransportTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Neighborhood Guide */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Home className="w-4 h-4 text-emerald-600" />
              Recommended Neighborhoods to Stay
            </h3>
            <div className="space-y-2.5">
              {data.neighborhoodGuides.map((nh, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {nh.name}
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      <strong>Best For:</strong> {nh.bestFor}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                      {nh.vibe}
                    </p>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      ~${nh.avgPricePerNightUSD}/night
                    </span>
                    <span className="text-[10px] text-slate-400 block">avg. rate</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seasonal Advisory */}
          {data.seasonalAdvisory && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <strong className="block font-semibold">Seasonal Travel Note:</strong>
                <p className="mt-0.5 leading-relaxed text-[11px]">
                  {data.seasonalAdvisory}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Photos & Food */}
      {activeTab === 'culture' && (
        <div className="p-4 sm:p-6 space-y-5">
          {/* Photography Spots */}
          {data.photographySpots && data.photographySpots.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <Camera className="w-4 h-4 text-emerald-600" />
                Vantage Points for Photography
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {data.photographySpots.map((spot, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white">{spot.spot}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                        {spot.bestTime}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      📸 {spot.tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Local Dishes */}
          {data.localDishes && data.localDishes.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <Utensils className="w-4 h-4 text-emerald-600" />
                Iconic Cuisine to Try
              </h3>
              <div className="space-y-2">
                {data.localDishes.map((dish, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <strong className="text-slate-900 dark:text-white text-xs">{dish.name}</strong>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{dish.description}</p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 ml-3">
                      {dish.priceRangeUSD}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Follow-up Action Chips */}
      <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
          Ask Wayora:
        </span>
        <button
          onClick={() => onSendFollowUp?.(`What if I have only 3 days in ${data.destinationName}?`)}
          className="px-2.5 py-1 text-xs rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
        >
          ⏱️ Only 3 days?
        </button>
        <button
          onClick={() => onSendFollowUp?.(`What will a budget trip to ${data.destinationName} cost?`)}
          className="px-2.5 py-1 text-xs rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
        >
          💰 Exact budget breakdown
        </button>
        <button
          onClick={() => onSendFollowUp?.(`Suggest cheaper hotels and neighborhoods in ${data.destinationName}`)}
          className="px-2.5 py-1 text-xs rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
        >
          🏨 Budget hotels & hostels
        </button>
        <button
          onClick={() => onSendFollowUp?.(`Best places for photography in ${data.destinationName}?`)}
          className="px-2.5 py-1 text-xs rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
        >
          📸 Photography spots
        </button>
      </div>
    </div>
  );
};
