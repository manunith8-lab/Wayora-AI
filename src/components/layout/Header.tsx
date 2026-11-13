import React, { useState } from 'react';
import { 
  Compass, 
  Globe, 
  Coins, 
  Mic, 
  Moon, 
  Sun, 
  Bookmark, 
  Sparkles, 
  Search, 
  Menu, 
  X,
  History,
  MapPin,
  Briefcase,
  LogIn,
  User as UserIcon
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../../data/translationsData';
import { CURRENCIES, EXCHANGE_RATE_LAST_UPDATED } from '../../data/currenciesData';
import { SupportedLanguage } from '../../types/travel';
import { User } from '../../types/auth';
import { authService } from '../../services/authService';

interface HeaderProps {
  currentLang: SupportedLanguage;
  onSelectLang: (lang: SupportedLanguage) => void;
  currentCurrency: string;
  onSelectCurrency: (currency: string) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenVoice: () => void;
  savedCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  currentUser?: User | null;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onSelectLang,
  currentCurrency,
  onSelectCurrency,
  activeTab,
  onSelectTab,
  onOpenVoice,
  savedCount,
  isDarkMode,
  onToggleDarkMode,
  currentUser,
  onOpenAuth,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showCurrMenu, setShowCurrMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = currentUser !== undefined ? currentUser : authService.getCurrentUser();
  const userInitials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'EX';

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];
  const currentCurrObj = CURRENCIES[currentCurrency] || CURRENCIES.USD;

  const navLinks = [
    { id: 'dashboard', label: t.navDashboard, icon: Compass },
    { id: 'concierge', label: t.navConcierge, icon: Sparkles, badge: 'AI' },
    { id: 'destinations', label: t.navDestinations, icon: MapPin },
    { id: 'packages', label: t.navPackages, icon: Briefcase },
    { id: 'custom-trip', label: t.navCustomTrip, icon: Compass },
    { id: 'hotels', label: t.navHotels },
    { id: 'local-guide', label: t.navLocalGuide },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-forest-100 dark:border-slate-800 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* BRAND LOGO */}
          <div 
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-xl bg-forest-900 dark:bg-forest-800 text-gold-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-2xl tracking-wider text-forest-900 dark:text-gold-400">
                  WAYORA
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-gold-100 dark:bg-gold-900/40 text-gold-800 dark:text-gold-300 border border-gold-300 dark:border-gold-700/50">
                  AI Concierge
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium tracking-wide hidden sm:block">
                {t.brandTagline}
              </p>
            </div>
          </div>

          {/* DESKTOP NAVIGATION LINKS */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onSelectTab(link.id)}
                  className={`relative px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-forest-900 dark:text-gold-400 bg-forest-50 dark:bg-forest-900/40 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-forest-900 dark:hover:text-gold-400 hover:bg-gray-100/70 dark:hover:bg-slate-800/70'
                  }`}
                >
                  {Icon && <Icon size={16} className={isActive ? 'text-forest-900 dark:text-gold-400' : 'text-gray-400'} />}
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-forest-900 text-white dark:bg-gold-500 dark:text-forest-950">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-forest-900 dark:bg-gold-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT ACTION CONTROLS */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* VOICE ASSISTANT BUTTON */}
            <button
              onClick={onOpenVoice}
              title="Activate AI Voice Concierge"
              className="relative p-2.5 rounded-full bg-forest-50 dark:bg-slate-800 text-forest-900 dark:text-gold-400 hover:bg-forest-100 dark:hover:bg-slate-700 transition shadow-sm border border-forest-100 dark:border-slate-700 group"
            >
              <Mic size={18} className="group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </button>

            {/* CURRENCY SELECTOR */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowCurrMenu(!showCurrMenu);
                  setShowLangMenu(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-50 dark:bg-slate-800 text-charcoal dark:text-gray-200 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              >
                <span>{currentCurrObj.flag}</span>
                <span>{currentCurrObj.code}</span>
              </button>

              {showCurrMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-gray-100 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 border-b border-gray-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Select Currency
                    </p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                      • {EXCHANGE_RATE_LAST_UPDATED}
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {Object.values(CURRENCIES).map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          onSelectCurrency(c.code);
                          setShowCurrMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition ${
                          currentCurrency === c.code
                            ? 'bg-forest-50 dark:bg-forest-900/30 text-forest-900 dark:text-gold-400 font-bold'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{c.flag}</span>
                          <span>{c.name}</span>
                        </span>
                        <span className="text-gray-400 font-mono text-[11px]">{c.symbol}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* LANGUAGE SELECTOR */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowLangMenu(!showLangMenu);
                  setShowCurrMenu(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-50 dark:bg-slate-800 text-charcoal dark:text-gray-200 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              >
                <Globe size={14} className="text-forest-700 dark:text-gold-400" />
                <span className="hidden sm:inline">{currentLangObj.nativeName}</span>
                <span className="sm:hidden">{currentLangObj.code.toUpperCase()}</span>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-gray-100 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 border-b border-gray-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Select Language (12)
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onSelectLang(lang.code);
                          setShowLangMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition ${
                          currentLang === lang.code
                            ? 'bg-forest-50 dark:bg-forest-900/30 text-forest-900 dark:text-gold-400 font-bold'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.nativeName}</span>
                        </span>
                        <span className="text-[10px] text-gray-400">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SAVED ITEMS SHORTCUT */}
            <button
              onClick={() => onSelectTab('saved')}
              title={t.savedTrips}
              className={`p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-forest-900 dark:hover:text-gold-400 relative transition ${
                activeTab === 'saved' ? 'text-forest-900 dark:text-gold-400 bg-forest-50 dark:bg-slate-800' : ''
              }`}
            >
              <Bookmark size={18} />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-forest-900 dark:bg-gold-500 text-white dark:text-forest-950 text-[10px] font-bold flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>

            {/* THEME TOGGLE */}
            <button
              onClick={onToggleDarkMode}
              title="Toggle Light / Dark Mode"
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-forest-900 dark:hover:text-gold-400 transition"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* USER PROFILE CHIP (Dynamic Auth) */}
            {user ? (
              <button
                onClick={onOpenAuth}
                title="Account Profile"
                className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-slate-800 hover:opacity-80 transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-forest-900 to-forest-600 text-gold-300 flex items-center justify-center font-bold text-xs shadow">
                  {userInitials}
                </div>
                <div className="text-left hidden xl:block">
                  <p className="text-xs font-bold text-charcoal dark:text-gray-100 leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-gold-600 dark:text-gold-400 font-semibold capitalize">
                    {user.tier || 'Voyager'} Explorer
                  </p>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-900 text-gold-300 hover:bg-forest-800 dark:bg-gold-500 dark:text-forest-950 text-xs font-semibold shadow-sm transition"
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
            )}

            {/* MOBILE HAMBURGER BUTTON */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 dark:border-slate-800 space-y-2 animate-in fade-in">
            {user ? (
              <div
                onClick={() => {
                  onOpenAuth?.();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-slate-800/60 rounded-xl mb-3 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-forest-900 text-gold-300 flex items-center justify-center font-bold text-sm">
                  {userInitials}
                </div>
                <div>
                  <p className="text-sm font-bold text-charcoal dark:text-gray-100">{user.name}</p>
                  <p className="text-xs text-gold-600 dark:text-gold-400 capitalize">{user.tier || 'Voyager'} Explorer</p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth?.();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 mb-3 rounded-xl bg-forest-900 text-gold-300 font-semibold text-sm shadow-sm"
              >
                <LogIn size={16} />
                <span>Sign In / Register</span>
              </button>
            )}

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onSelectTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? 'bg-forest-900 text-white dark:bg-gold-500 dark:text-forest-950'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {Icon && <Icon size={18} />}
                    <span>{link.label}</span>
                  </span>
                  {link.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-400 text-forest-950 font-bold">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
