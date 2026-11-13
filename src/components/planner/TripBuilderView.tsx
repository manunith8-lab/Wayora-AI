import React, { useState } from 'react';
import { 
  Compass, 
  Calendar, 
  MapPin, 
  Users, 
  Sparkles, 
  Download, 
  Share2, 
  Bookmark, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Check, 
  Clock, 
  DollarSign 
} from 'lucide-react';
import { 
  CustomTripPlan, 
  ItineraryDayPlan, 
  ItineraryActivity, 
  TravelStyle, 
  AccommodationCategory, 
  SupportedLanguage 
} from '../../types/travel';
import { DESTINATIONS } from '../../data/destinationsData';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { exportCustomItineraryPDF } from '../../services/pdfService';
import { storageService } from '../../services/storageService';
import { TRANSLATIONS } from '../../data/translationsData';

interface TripBuilderViewProps {
  currentLang: SupportedLanguage;
  currentCurrency: string;
}

const TRAVEL_STYLES: { id: TravelStyle; label: string; icon: string }[] = [
  { id: 'adventure', label: 'Adventure', icon: '🧗' },
  { id: 'family', label: 'Family Vacation', icon: '👨‍👩‍👧‍👦' },
  { id: 'solo', label: 'Solo Travel', icon: '🎒' },
  { id: 'couple', label: 'Couple Vacation', icon: '💑' },
  { id: 'relaxation', label: 'Relaxation & Wellness', icon: '🧘' },
  { id: 'cultural', label: 'Cultural Exploration', icon: '🏛️' },
  { id: 'nature', label: 'Nature & Wildlife', icon: '🌿' },
  { id: 'shopping', label: 'Shopping & Dining', icon: '🛍️' },
  { id: 'luxury', label: 'Luxury Signature', icon: '👑' },
  { id: 'budget', label: 'Budget Explorer', icon: '💰' },
  { id: 'photography', label: 'Photography Tour', icon: '📸' },
  { id: 'spiritual', label: 'Spiritual Tourism', icon: '🕊️' },
];

export const TripBuilderView: React.FC<TripBuilderViewProps> = ({
  currentLang,
  currentCurrency,
}) => {
  const [destination, setDestination] = useState('Jaipur, Rajasthan');
  const [startingLocation, setStartingLocation] = useState('New Delhi (DEL)');
  const [departureDate, setDepartureDate] = useState('2026-11-20');
  const [returnDate, setReturnDate] = useState('2026-11-25');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [budgetUSD, setBudgetUSD] = useState(2400);
  const [style, setStyle] = useState<TravelStyle>('couple');
  const [accommodation, setAccommodation] = useState<AccommodationCategory>('standard');
  const [transport, setTransport] = useState('Private Chauffeur & Metro');
  const [foodPref, setFoodPref] = useState('Local & International Halal');
  const [generatedPlan, setGeneratedPlan] = useState<CustomTripPlan | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Generate itinerary based on user preferences
  const handleGenerateItinerary = () => {
    const daysCount = 5;
    const destObj = DESTINATIONS.find((d) => d.name.toLowerCase() === destination.toLowerCase()) || DESTINATIONS[0];

    const generatedDays: ItineraryDayPlan[] = [
      {
        day: 1,
        date: departureDate,
        title: `Arrival, Check-in & Scenic Welcome in ${destination}`,
        items: [
          { id: 'act-1-1', time: '10:00 AM', title: `Arrival at Airport & ${transport} Transfer`, type: 'transport', costUSD: 50, notes: 'Greeted by driver, luggage assist' },
          { id: 'act-1-2', time: '02:00 PM', title: `Check-in at ${accommodation.toUpperCase()} Hotel & Refreshment`, type: 'relaxation', costUSD: 0, notes: 'Welcome drink & pool view' },
          { id: 'act-1-3', time: '06:00 PM', title: `Sunset Marina Stroll & Welcome Dinner`, type: 'food', costUSD: 70, notes: `Enjoy ${foodPref} cuisine` },
        ],
      },
      {
        day: 2,
        date: '2026-11-21',
        title: `Landmarks, Sightseeing & Architectural Wonders`,
        items: [
          { id: 'act-2-1', time: '09:30 AM', title: `VIP Observation Deck Visit (${destObj.famousLandmarks[0] || 'Top Viewpoint'})`, type: 'sightseeing', costUSD: 85, notes: 'Fast-track skip the line tickets' },
          { id: 'act-2-2', time: '01:30 PM', title: `Artisan Lunch & Shopping District Discovery`, type: 'food', costUSD: 45, notes: 'Explore local souks and boutiques' },
          { id: 'act-2-3', time: '05:30 PM', title: `Scenic Golden Hour Cruise / City Walk`, type: 'sightseeing', costUSD: 60, notes: 'Postcard photography stop' },
        ],
      },
      {
        day: 3,
        date: '2026-11-22',
        title: `${style.toUpperCase()} Experience & Signature Excursion`,
        items: [
          { id: 'act-3-1', time: '08:30 AM', title: `Curated ${style} Adventure Excursion`, type: 'activity', costUSD: 110, notes: 'Guided private experience' },
          { id: 'act-3-2', time: '01:00 PM', title: `Gourmet Lunch with Scenic Views`, type: 'food', costUSD: 55, notes: 'Signature specialty cuisine' },
          { id: 'act-3-3', time: '04:00 PM', title: `Traditional Cultural Quarter & Heritage Museums`, type: 'sightseeing', costUSD: 30, notes: 'Local authentic tea ceremony' },
        ],
      },
      {
        day: 4,
        date: '2026-11-23',
        title: `Nature, Leisure & Relaxation`,
        items: [
          { id: 'act-4-1', time: '10:00 AM', title: `Spa Wellness Session & Resort Leisure`, type: 'relaxation', costUSD: 90, notes: 'Aromatherapy or thermal bath' },
          { id: 'act-4-2', time: '03:00 PM', title: `Souvenir Shopping & Handcraft Markets`, type: 'activity', costUSD: 40, notes: 'Dates, spices, and artisan treasures' },
          { id: 'act-4-3', time: '08:00 PM', title: `Celebration Candlelight Farewell Dinner`, type: 'food', costUSD: 95, notes: 'Rooftop skyline views' },
        ],
      },
      {
        day: 5,
        date: returnDate,
        title: `Departure & Farewell to ${destination}`,
        items: [
          { id: 'act-5-1', time: '09:00 AM', title: `Breakfast & Hotel Check-out`, type: 'food', costUSD: 25, notes: 'Late checkout arranged' },
          { id: 'act-5-2', time: '12:00 PM', title: `${transport} to Airport for Flight Home`, type: 'transport', costUSD: 50, notes: 'Direct airport terminal transfer' },
        ],
      },
    ];

    const plan: CustomTripPlan = {
      id: 'plan-' + Date.now(),
      destination,
      startingLocation,
      departureDate,
      returnDate,
      travelers: { adults, children },
      totalBudgetUSD: budgetUSD,
      preferredCurrency: currentCurrency,
      accommodationPreference: accommodation,
      transportationPreference: transport,
      foodPreference: foodPref,
      preferredAttractions: destObj.popularAttractions.slice(0, 4),
      travelStyle: style,
      days: generatedDays,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setGeneratedPlan(plan);
    storageService.saveCustomPlan(plan);
  };

  // Add custom activity
  const handleAddActivity = (dayIndex: number) => {
    if (!generatedPlan) return;
    const newActivity: ItineraryActivity = {
      id: 'act-' + Date.now(),
      time: '03:30 PM',
      title: 'New Custom Sightseeing Stop',
      type: 'activity',
      costUSD: 40,
      notes: 'Added to your customized itinerary',
    };

    const updatedDays = [...generatedPlan.days];
    updatedDays[dayIndex].items.push(newActivity);

    const updatedPlan = { ...generatedPlan, days: updatedDays };
    setGeneratedPlan(updatedPlan);
    storageService.saveCustomPlan(updatedPlan);
  };

  // Remove activity
  const handleRemoveActivity = (dayIndex: number, actId: string) => {
    if (!generatedPlan) return;
    const updatedDays = [...generatedPlan.days];
    updatedDays[dayIndex].items = updatedDays[dayIndex].items.filter((a) => a.id !== actId);

    const updatedPlan = { ...generatedPlan, days: updatedDays };
    setGeneratedPlan(updatedPlan);
    storageService.saveCustomPlan(updatedPlan);
  };

  // Share link
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Save to favourites
  const handleSaveToFavourites = () => {
    if (!generatedPlan) return;
    storageService.toggleSaveItem({
      type: 'itinerary',
      itemId: generatedPlan.id,
      title: `${generatedPlan.destination} Custom Trip`,
      subtitle: `${generatedPlan.travelers.adults + generatedPlan.travelers.children} Travelers • ${generatedPlan.days.length} Days`,
      image: DESTINATIONS.find((d) => d.name.toLowerCase() === generatedPlan.destination.toLowerCase())?.heroImage || DESTINATIONS[0].heroImage,
      data: generatedPlan,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
          Personalized Itinerary Engine
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest-900 dark:text-white">
          Create Your Own Trip
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
          Configure your departure, companions, travel style, and budget. Our AI builds an interactive day-by-day itinerary tailored specifically to you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: BUILDER FORM */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-forest-100 dark:border-slate-800 shadow-card space-y-5">
          <h3 className="font-serif text-lg font-bold text-forest-900 dark:text-white flex items-center gap-2">
            <Compass size={18} className="text-gold-500" />
            <span>Trip Parameters</span>
          </h3>

          {/* Destination */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">
              Destination
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-charcoal dark:text-white focus:outline-none"
            >
              {DESTINATIONS.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name} ({d.country})
                </option>
              ))}
            </select>
          </div>

          {/* Starting Location */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">
              Starting Location / Departure Airport
            </label>
            <input
              type="text"
              value={startingLocation}
              onChange={(e) => setStartingLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-charcoal dark:text-white focus:outline-none"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">
                Departure
              </label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full px-2 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs text-charcoal dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">
                Return
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-2 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs text-charcoal dark:text-white"
              />
            </div>
          </div>

          {/* Travelers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">
                Adults
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs text-charcoal dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">
                Children
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={children}
                onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs text-charcoal dark:text-white"
              />
            </div>
          </div>

          {/* Total Budget */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
                Total Budget
              </label>
              <CurrencyDisplay amountUSD={budgetUSD} currencyCode={currentCurrency} className="text-xs font-bold text-forest-900 dark:text-gold-400" />
            </div>
            <input
              type="range"
              min="300"
              max="15000"
              step="100"
              value={budgetUSD}
              onChange={(e) => setBudgetUSD(parseInt(e.target.value))}
              className="w-full accent-forest-900 dark:accent-gold-500 cursor-pointer"
            />
          </div>

          {/* Travel Style Grid */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-2">
              Travel Style (12 Available)
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {TRAVEL_STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStyle(s.id)}
                  className={`p-2 rounded-xl text-xs text-left transition flex items-center gap-1.5 ${
                    style === s.id
                      ? 'bg-forest-900 text-white dark:bg-gold-500 dark:text-forest-950 font-bold shadow-sm'
                      : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span className="truncate">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accommodation & Transport */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">
                Stay Tier
              </label>
              <select
                value={accommodation}
                onChange={(e) => setAccommodation(e.target.value as any)}
                className="w-full px-2 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-charcoal dark:text-white"
              >
                <option value="budget">Budget Hotel</option>
                <option value="hostel">Hostel</option>
                <option value="standard">Standard Hotel</option>
                <option value="luxury">Luxury 5-Star</option>
                <option value="resort">Resort</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">
                Transport
              </label>
              <select
                value={transport}
                onChange={(e) => setTransport(e.target.value)}
                className="w-full px-2 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-charcoal dark:text-white"
              >
                <option value="Metro & Public Transit">Metro & Public Transit</option>
                <option value="Private Chauffeur">Private Chauffeur</option>
                <option value="Rental Car">Rental Car</option>
                <option value="Scenic Trains">Scenic Trains</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateItinerary}
            className="w-full py-3.5 rounded-2xl bg-forest-900 dark:bg-gold-500 text-white dark:text-forest-950 font-bold text-sm hover:bg-forest-800 dark:hover:bg-gold-400 transition flex items-center justify-center gap-2 shadow-md"
          >
            <Sparkles size={16} />
            <span>Generate Custom Itinerary</span>
          </button>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE ITINERARY SCHEDULE */}
        <div className="lg:col-span-2 space-y-6">
          {generatedPlan ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-forest-100 dark:border-slate-800 shadow-card space-y-6">
              
              {/* Itinerary Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 dark:border-slate-800 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-gold-600 dark:text-gold-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <Sparkles size={14} />
                    <span>AI-Generated Schedule</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-forest-900 dark:text-white">
                    {generatedPlan.destination} Itinerary
                  </h3>
                  <p className="text-xs text-gray-500">
                    {generatedPlan.departureDate} to {generatedPlan.returnDate} • {generatedPlan.travelers.adults} Adults, {generatedPlan.travelers.children} Children
                  </p>
                </div>

                {/* Actions: PDF, Share, Save */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportCustomItineraryPDF(generatedPlan, currentCurrency)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest-900 dark:bg-gold-500 text-white dark:text-forest-950 font-bold text-xs hover:bg-forest-800 transition shadow"
                    title="Download Itinerary PDF"
                  >
                    <Download size={14} />
                    <span>{t.downloadPdf}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:text-forest-900 transition"
                    title="Share link"
                  >
                    {copiedLink ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
                  </button>

                  <button
                    onClick={handleSaveToFavourites}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:text-gold-500 transition"
                    title="Save Itinerary"
                  >
                    {savedSuccess ? <Check size={16} className="text-emerald-500" /> : <Bookmark size={16} />}
                  </button>
                </div>
              </div>

              {/* Days Timeline */}
              <div className="space-y-6">
                {generatedPlan.days.map((dayPlan, dayIdx) => (
                  <div
                    key={dayPlan.day}
                    className="p-5 rounded-2xl bg-gray-50/70 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 space-y-4"
                  >
                    {/* Day Title Bar */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-xl bg-forest-900 text-white dark:bg-gold-500 dark:text-forest-950 text-xs font-bold">
                          Day {dayPlan.day}
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-forest-900 dark:text-white">
                            {dayPlan.title}
                          </h4>
                          <span className="text-[10px] text-gray-400">{dayPlan.date}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddActivity(dayIdx)}
                        className="text-xs text-forest-800 dark:text-gold-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus size={12} />
                        <span>Add Activity</span>
                      </button>
                    </div>

                    {/* Activities List */}
                    <div className="space-y-2.5 pl-2 border-l-2 border-gold-400/50">
                      {dayPlan.items.map((item) => (
                        <div
                          key={item.id}
                          className="group relative p-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 flex items-start justify-between shadow-sm"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-forest-800 dark:text-gold-400 font-mono">
                                {item.time}
                              </span>
                              <span className="font-bold text-xs text-charcoal dark:text-gray-100">
                                {item.title}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              {item.notes}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            {item.costUSD > 0 && (
                              <CurrencyDisplay
                                amountUSD={item.costUSD}
                                currencyCode={currentCurrency}
                                className="text-xs font-semibold text-gray-500 dark:text-gray-400"
                              />
                            )}
                            <button
                              onClick={() => handleRemoveActivity(dayIdx, item.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition"
                              title="Remove item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[450px] bg-white dark:bg-slate-900 rounded-3xl p-8 border border-dashed border-forest-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-forest-50 dark:bg-slate-800 text-forest-800 dark:text-gold-400 flex items-center justify-center">
                <Compass size={32} className="animate-spin duration-3000" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-xl font-bold text-forest-900 dark:text-white">
                  Ready to Craft Your Custom Journey
                </h4>
                <p className="text-xs text-gray-500 max-w-md">
                  Select your destination, companion details, dates, and budget on the left and click "Generate Custom Itinerary" to preview your schedule.
                </p>
              </div>
              <button
                onClick={handleGenerateItinerary}
                className="px-5 py-2.5 rounded-xl bg-forest-900 dark:bg-gold-500 text-white dark:text-forest-950 font-bold text-xs hover:bg-forest-800 transition"
              >
                Quick Preview Sample
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
