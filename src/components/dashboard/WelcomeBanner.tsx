import React, { useState } from 'react';
import { Search, Mic, ArrowRight, Sparkles, Plane, MapPin, Compass } from 'lucide-react';
import { TRANSLATIONS } from '../../data/translationsData';
import { SupportedLanguage } from '../../types/travel';
import { authService } from '../../services/authService';

interface WelcomeBannerProps {
  currentLang: SupportedLanguage;
  currentCurrency: string;
  onSearchSubmit: (query: string) => void;
  onOpenVoice: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  currentLang,
  currentCurrency,
  onSearchSubmit,
  onOpenVoice,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const suggestedPrompts = [
    { text: 'Find waterfalls across India.', tag: 'Waterfalls', icon: '🌊' },
    { text: 'Plan a 4-day trip to Jaipur, Rajasthan.', tag: 'Rajasthan', icon: '🏰' },
    { text: 'Discover premier hill stations across India.', tag: 'Hill Stations', icon: '⛰️' },
    { text: 'Explore tourist places in Tamil Nadu.', tag: 'Tamil Nadu', icon: '🛕' },
    { text: 'Show pristine beaches in India.', tag: 'Beaches', icon: '🏖️' },
    { text: 'Find wildlife sanctuaries and tiger reserves.', tag: 'Wildlife', icon: '🐅' },
    { text: 'Tell me about Jammu and Kashmir.', tag: 'Kashmir', icon: '❄️' },
    { 
      text: currentCurrency === 'INR' ? 'Suggest budget trips in India under ₹15,000.' : 'Suggest budget trips in India under $200.',
      tag: 'Budget',
      icon: '💰' 
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchSubmit(searchInput.trim());
      setSearchInput('');
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-900 via-forest-800 to-forest-950 text-white p-6 sm:p-10 lg:p-12 shadow-floating">
      {/* Decorative background glow & elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-forest-400/10 blur-2xl pointer-events-none" />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        
        {/* Personalized Welcome Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-800/80 border border-gold-500/30 text-gold-300 text-xs font-semibold backdrop-blur-md shadow-sm">
          <Sparkles size={14} className="text-gold-400" />
          <span>Voyager Concierge AI Active</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Dynamic Welcome Heading */}
        <div className="space-y-2">
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            {authService.getGreeting().main}
          </h1>
          <p className="text-xl sm:text-2xl text-gold-200/90 font-serif italic">
            {authService.getGreeting().subtitle}
          </p>
          <p className="text-sm sm:text-base text-forest-200/80 max-w-2xl mx-auto font-normal">
            Discover breathtaking places, compare verified luxury & budget packages, craft bespoke itineraries, and book with confidence.
          </p>
        </div>

        {/* Large Travel Search Input */}
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-2 border border-gold-300/40 focus-within:ring-4 focus-within:ring-gold-400/20 transition duration-300">
            <div className="pl-3 pr-2 text-forest-800 dark:text-gold-400">
              <Search className="w-6 h-6" />
            </div>
            
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="flex-1 bg-transparent px-2 py-3 text-sm sm:text-base text-charcoal dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
            />

            {/* Microphone Button */}
            <button
              type="button"
              onClick={onOpenVoice}
              title="Voice Assistant"
              className="p-3 text-forest-800 dark:text-gold-400 hover:bg-forest-50 dark:hover:bg-slate-800 rounded-xl transition group relative"
            >
              <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="sr-only">Voice</span>
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!searchInput.trim()}
              className="ml-1 px-5 py-3 rounded-xl bg-forest-900 dark:bg-gold-500 text-white dark:text-forest-950 font-bold text-sm sm:text-base hover:bg-forest-800 dark:hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5 shadow-md"
            >
              <span>{t.send}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Suggested AI Search Prompts */}
        <div className="pt-4 text-left">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-300/90 flex items-center gap-1.5">
              <Compass size={14} />
              {t.suggestedPrompts}
            </span>
            <span className="text-[11px] text-forest-200/60 hidden sm:inline">
              Click any journey to start instant AI planning
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSearchSubmit(prompt.text)}
                className="group p-3 rounded-xl bg-forest-800/60 hover:bg-forest-700/80 border border-forest-700/60 hover:border-gold-400/50 text-left transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-base">{prompt.icon}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-forest-900/80 text-gold-300">
                    {prompt.tag}
                  </span>
                </div>
                <p className="text-xs font-medium text-white/95 group-hover:text-gold-200 line-clamp-2">
                  {prompt.text}
                </p>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
