import React, { useState, useEffect } from 'react';
import { ChatSidebar } from './components/chat/ChatSidebar';
import { ChatWorkspace } from './components/chat/ChatWorkspace';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { WelcomeBanner } from './components/dashboard/WelcomeBanner';
import { TrendingDestinations } from './components/dashboard/TrendingDestinations';
import { SeasonalRecommendations } from './components/dashboard/SeasonalRecommendations';
import { PopularPackages } from './components/dashboard/PopularPackages';
import { VoiceModal } from './components/concierge/VoiceModal';
import { DestinationDetailModal } from './components/destination/DestinationDetailModal';
import { PhotoGalleryModal } from './components/destination/PhotoGalleryModal';
import { PackageComparisonModal } from './components/packages/PackageComparisonModal';
import { CustomPackageDrawer } from './components/packages/CustomPackageDrawer';
import { TripBuilderView } from './components/planner/TripBuilderView';
import { HotelExplorerView } from './components/hotels/HotelExplorerView';
import { LocalGuideView } from './components/guide/LocalGuideView';
import { SavedItemsView } from './components/saved/SavedItemsView';
import { SearchHistoryModal } from './components/history/SearchHistoryModal';
import { AuthModal } from './components/auth/AuthModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { TRAVEL_PACKAGES } from './data/destinationsData';
import { Destination, DestinationPhoto, SupportedLanguage, TravelPackage, Conversation } from './types/travel';
import { storageService } from './services/storageService';
import { authService } from './services/authService';
import { User } from './types/auth';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from './data/translationsData';
import { CURRENCIES } from './data/currenciesData';
import { 
  Menu, 
  Sparkles, 
  Globe, 
  Coins, 
  Moon, 
  Sun, 
  Compass, 
  MessageSquare, 
  Settings, 
  LogIn, 
  Bookmark, 
  ChevronDown
} from 'lucide-react';

export function App() {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');
  const [currentCurrency, setCurrentCurrency] = useState<string>('USD');
  // Default to chatbot-first experience!
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());
  
  // Conversations state (user-scoped)
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const list = storageService.getConversations();
    if (list && list.length > 0) return list;
    const initial: Conversation = {
      id: 'conv-' + Date.now(),
      title: 'New Trip Planning',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      isArchived: false,
    };
    storageService.saveConversations([initial]);
    return [initial];
  });
  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    return conversations[0]?.id || '';
  });

  // UI state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [showTopLangMenu, setShowTopLangMenu] = useState(false);
  const [showTopCurrMenu, setShowTopCurrMenu] = useState(false);

  // Modals & Drawers state
  const [selectedDestinationModal, setSelectedDestinationModal] = useState<Destination | null>(null);
  const [selectedPackageModal, setSelectedPackageModal] = useState<TravelPackage | null>(null);
  const [customPackageModal, setCustomPackageModal] = useState<TravelPackage | null>(null);
  const [photoLightbox, setPhotoLightbox] = useState<DestinationPhoto | null>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [conciergeQuery, setConciergeQuery] = useState<string>('');
  const [savedCount, setSavedCount] = useState<number>(0);

  // Update saved items count
  const refreshSavedCount = () => {
    setSavedCount(storageService.getSavedItems().length);
  };

  useEffect(() => {
    refreshSavedCount();
  }, [currentUser]);

  // Handle RTL for Arabic
  useEffect(() => {
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang);
    if (langObj && langObj.dir === 'rtl') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [currentLang]);

  // Handle Dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Auth changes
  const handleAuthSuccess = (user: User | null) => {
    setCurrentUser(user);
    // Reload user-scoped conversations
    const userConvs = storageService.getConversations();
    if (userConvs && userConvs.length > 0) {
      setConversations(userConvs);
      setActiveConversationId(userConvs[0].id);
    } else {
      const initial: Conversation = {
        id: 'conv-' + Date.now(),
        title: 'New Trip Planning',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
        isArchived: false,
      };
      setConversations([initial]);
      setActiveConversationId(initial.id);
      storageService.saveConversations([initial]);
    }
    refreshSavedCount();
  };

  const handleSignOut = () => {
    authService.signOut();
    handleAuthSuccess(null);
  };

  // Conversation operations
  const handleNewChat = () => {
    const newId = 'conv-' + Date.now();
    const newConv: Conversation = {
      id: newId,
      title: 'New Trip',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      isArchived: false,
    };
    const updated = [newConv, ...conversations];
    setConversations(updated);
    setActiveConversationId(newId);
    storageService.saveConversations(updated);
    setActiveTab('chat');
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setActiveTab('chat');
  };

  const handleDeleteConversation = (id: string) => {
    const filtered = conversations.filter((c) => c.id !== id);
    if (filtered.length === 0) {
      const initial: Conversation = {
        id: 'conv-' + Date.now(),
        title: 'New Trip',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
        isArchived: false,
      };
      setConversations([initial]);
      setActiveConversationId(initial.id);
      storageService.saveConversations([initial]);
    } else {
      setConversations(filtered);
      if (activeConversationId === id) {
        setActiveConversationId(filtered[0].id);
      }
      storageService.saveConversations(filtered);
    }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    const updated = conversations.map((c) =>
      c.id === id ? { ...c, title: newTitle, updatedAt: new Date().toISOString() } : c
    );
    setConversations(updated);
    storageService.saveConversations(updated);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all conversations?')) {
      const initial: Conversation = {
        id: 'conv-' + Date.now(),
        title: 'New Trip',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
        isArchived: false,
      };
      setConversations([initial]);
      setActiveConversationId(initial.id);
      storageService.saveConversations([initial]);
    }
  };

  const handleUpdateActiveConversation = (updated: Conversation) => {
    const list = conversations.map((c) => (c.id === updated.id ? updated : c));
    setConversations(list);
    storageService.saveConversations(list);
  };

  // Navigate to AI Concierge with a specific query
  const handleTriggerConciergeSearch = (query: string) => {
    setConciergeQuery(query);
    setActiveTab('chat');
  };

  // Toggle saving destination
  const handleToggleSaveDestination = (dest: Destination) => {
    storageService.toggleSaveItem({
      type: 'destination',
      itemId: dest.id,
      title: dest.name,
      subtitle: `${dest.country} • ${dest.bestTimeToVisit}`,
      image: dest.heroImage,
      data: dest,
    });
    refreshSavedCount();
  };

  const isDestinationSaved = (id: string) => {
    return storageService.isItemSaved(id);
  };

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0] || null;
  const isChatMode = activeTab === 'chat' || activeTab === 'concierge';
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];
  const currentCurrObj = CURRENCIES[currentCurrency] || CURRENCIES.USD;

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-ivory dark:bg-slate-950 text-charcoal dark:text-gray-100 font-sans transition-colors duration-200">
      
      {/* 1. LEFT SIDEBAR (ChatGPT Style) */}
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onClearAll={handleClearAll}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSaved={() => setActiveTab('saved')}
        onOpenExplore={() => setActiveTab('dashboard')}
        currentLang={currentLang}
        savedCount={savedCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        
        {/* CHATBOT-FIRST MAIN VIEW */}
        {isChatMode ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* Minimal Top Header for Chat View */}
            <div className="h-14 px-4 border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0 z-10">
              
              {/* Left: Mobile hamburger & Chat status */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                  title="Open Sidebar"
                >
                  <Menu size={20} />
                </button>

                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm text-forest-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                    {activeConv?.title || 'Trip Planning'}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-forest-50 dark:bg-slate-800 border border-gold-300/30 text-[10px] font-bold text-gold-600 dark:text-gold-400">
                    <Sparkles size={10} />
                    <span>Live AI</span>
                  </span>
                </div>
              </div>

              {/* Right: Quick actions (Language, Currency, Dashboard toggle, Theme, Auth) */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                
                {/* Language Picker Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowTopLangMenu(!showTopLangMenu);
                      setShowTopCurrMenu(false);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                    title="Change Language"
                  >
                    <Globe size={14} className="text-forest-800 dark:text-gold-400" />
                    <span className="hidden md:inline">{currentLangObj.nativeName}</span>
                    <span className="md:hidden uppercase">{currentLang}</span>
                    <ChevronDown size={11} className="text-gray-400" />
                  </button>

                  {showTopLangMenu && (
                    <div className="absolute right-0 mt-2 w-48 max-h-72 overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-floating border border-gray-100 dark:border-slate-800 py-2 z-50">
                      <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Select Language
                      </p>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setCurrentLang(lang.code);
                            setShowTopLangMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-forest-50 dark:hover:bg-slate-800 transition ${
                            currentLang === lang.code ? 'font-bold text-forest-900 dark:text-gold-400 bg-forest-50/50' : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <span>{lang.nativeName}</span>
                          <span className="text-[10px] text-gray-400">{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Currency Picker Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowTopCurrMenu(!showTopCurrMenu);
                      setShowTopLangMenu(false);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                    title="Change Currency"
                  >
                    <Coins size={14} className="text-gold-600 dark:text-gold-400" />
                    <span>{currentCurrency}</span>
                    <ChevronDown size={11} className="text-gray-400" />
                  </button>

                  {showTopCurrMenu && (
                    <div className="absolute right-0 mt-2 w-44 max-h-72 overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-floating border border-gray-100 dark:border-slate-800 py-2 z-50">
                      <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Select Currency
                      </p>
                      {Object.values(CURRENCIES).map((c) => (
                        <button
                          key={c.code}
                          onClick={() => {
                            setCurrentCurrency(c.code);
                            setShowTopCurrMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-forest-50 dark:hover:bg-slate-800 transition ${
                            currentCurrency === c.code ? 'font-bold text-forest-900 dark:text-gold-400 bg-forest-50/50' : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <span>{c.code} ({c.symbol})</span>
                          <span className="text-[10px] text-gray-400">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Explore Full Dashboard Toggle */}
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-50 dark:bg-slate-800 hover:bg-forest-100 dark:hover:bg-slate-700 text-forest-900 dark:text-gold-400 text-xs font-bold transition shadow-xs"
                  title="Explore Destination Grid"
                >
                  <Compass size={14} />
                  <span>Explore Grid</span>
                </button>

                {/* Dark mode */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                  title="Toggle Light / Dark Mode"
                >
                  {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                </button>

                {/* Settings shortcut */}
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                  title="Application Preferences"
                >
                  <Settings size={16} />
                </button>

                {/* User avatar / Auth */}
                {currentUser ? (
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="w-8 h-8 rounded-full bg-forest-900 text-gold-300 text-xs font-bold flex items-center justify-center shadow-sm hover:opacity-90 ml-1"
                    title={`Logged in as ${currentUser.name}`}
                  >
                    {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'ME'}
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-forest-900 text-gold-300 hover:bg-forest-800 dark:bg-gold-500 dark:text-forest-950 text-xs font-bold shadow-sm transition ml-1"
                  >
                    <LogIn size={13} />
                    <span className="hidden sm:inline">Sign In</span>
                  </button>
                )}

              </div>
            </div>

            {/* Chat Workspace Canvas */}
            <div className="flex-1 overflow-hidden">
              <ChatWorkspace
                activeConversation={activeConv}
                onUpdateConversation={handleUpdateActiveConversation}
                currentUser={currentUser}
                currentLang={currentLang}
                currentCurrency={currentCurrency}
                onOpenVoice={() => setIsVoiceOpen(true)}
                onSelectDestination={(dest) => setSelectedDestinationModal(dest)}
                onSelectPackage={(pkg) => setSelectedPackageModal(pkg)}
                onCustomisePackage={(pkg) => setCustomPackageModal(pkg)}
                onOpenAuth={() => setIsAuthOpen(true)}
                initialQuery={conciergeQuery}
                onClearInitialQuery={() => setConciergeQuery('')}
              />
            </div>

          </div>
        ) : (
          /* TRADITIONAL DASHBOARD / EXPLORE VIEWS */
          <div className="flex-1 overflow-y-auto">
            
            {/* Full Global Header with back-to-chat banner */}
            <Header
              currentLang={currentLang}
              onSelectLang={setCurrentLang}
              currentCurrency={currentCurrency}
              onSelectCurrency={setCurrentCurrency}
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              onOpenVoice={() => setIsVoiceOpen(true)}
              savedCount={savedCount}
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              currentUser={currentUser}
              onOpenAuth={() => setIsAuthOpen(true)}
            />

            {/* Quick Sticky Return Banner */}
            <div className="bg-forest-900 text-white px-4 py-2.5 flex items-center justify-between text-xs font-semibold shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-gold-400" />
                <span>Conversational AI Mode is active. Ask anything in real-time.</span>
              </div>
              <button
                onClick={() => setActiveTab('chat')}
                className="px-3 py-1 rounded-lg bg-gold-500 text-forest-950 font-bold hover:bg-gold-400 transition flex items-center gap-1.5 shadow-sm"
              >
                <MessageSquare size={13} />
                <span>Return to AI Chat</span>
              </button>
            </div>

            <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
              
              {/* TAB 1: DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-14 animate-in fade-in">
                  <WelcomeBanner
                    currentLang={currentLang}
                    currentCurrency={currentCurrency}
                    onSearchSubmit={handleTriggerConciergeSearch}
                    onOpenVoice={() => setIsVoiceOpen(true)}
                  />

                  <TrendingDestinations
                    currentLang={currentLang}
                    currentCurrency={currentCurrency}
                    onSelectDestination={(dest) => setSelectedDestinationModal(dest)}
                    onToggleSave={handleToggleSaveDestination}
                    isSaved={isDestinationSaved}
                  />

                  <SeasonalRecommendations
                    currentLang={currentLang}
                    currentCurrency={currentCurrency}
                    onExploreDestination={handleTriggerConciergeSearch}
                  />

                  <PopularPackages
                    currentLang={currentLang}
                    currentCurrency={currentCurrency}
                    onSelectPackage={(pkg) => setSelectedPackageModal(pkg)}
                    onOpenCompare={() => setIsCompareOpen(true)}
                    onCustomise={(pkg) => setCustomPackageModal(pkg)}
                  />
                </div>
              )}

              {/* TAB 2: DESTINATIONS DIRECTORY */}
              {activeTab === 'destinations' && (
                <div className="space-y-8 animate-in fade-in">
                  <TrendingDestinations
                    currentLang={currentLang}
                    currentCurrency={currentCurrency}
                    onSelectDestination={(dest) => setSelectedDestinationModal(dest)}
                    onToggleSave={handleToggleSaveDestination}
                    isSaved={isDestinationSaved}
                  />
                </div>
              )}

              {/* TAB 3: PACKAGES */}
              {activeTab === 'packages' && (
                <div className="space-y-8 animate-in fade-in">
                  <PopularPackages
                    currentLang={currentLang}
                    currentCurrency={currentCurrency}
                    onSelectPackage={(pkg) => setSelectedPackageModal(pkg)}
                    onOpenCompare={() => setIsCompareOpen(true)}
                    onCustomise={(pkg) => setCustomPackageModal(pkg)}
                  />
                </div>
              )}

              {/* TAB 4: CREATE YOUR OWN TRIP BUILDER */}
              {activeTab === 'custom-trip' && (
                <TripBuilderView
                  currentLang={currentLang}
                  currentCurrency={currentCurrency}
                />
              )}

              {/* TAB 5: HOTELS & STAYS */}
              {activeTab === 'hotels' && (
                <HotelExplorerView
                  currentLang={currentLang}
                  currentCurrency={currentCurrency}
                />
              )}

              {/* TAB 6: LOCAL GUIDE & MAP */}
              {activeTab === 'local-guide' && (
                <LocalGuideView
                  currentLang={currentLang}
                  currentCurrency={currentCurrency}
                />
              )}

              {/* TAB 7: SAVED ITEMS & FAVORITES */}
              {activeTab === 'saved' && (
                <SavedItemsView
                  currentLang={currentLang}
                  currentCurrency={currentCurrency}
                  onExploreDestination={handleTriggerConciergeSearch}
                  onSelectTab={setActiveTab}
                />
              )}

            </main>

            {/* GLOBAL FOOTER */}
            <Footer onSelectTab={setActiveTab} />
          </div>
        )}

      </div>

      {/* GLOBAL MODALS */}

      {/* 1. AUTH MODAL */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* 2. SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentCurrency={currentCurrency}
        onSelectCurrency={setCurrentCurrency}
        currentLang={currentLang}
        onSelectLang={setCurrentLang}
        currentUser={currentUser}
      />

      {/* 3. DESTINATION DETAIL MODAL */}
      <DestinationDetailModal
        destination={selectedDestinationModal}
        isOpen={!!selectedDestinationModal}
        onClose={() => setSelectedDestinationModal(null)}
        currentCurrency={currentCurrency}
        currentLang={currentLang}
        onPlanTrip={(destName) => handleTriggerConciergeSearch(`Plan a 5-day luxury trip to ${destName}`)}
        onToggleSave={handleToggleSaveDestination}
        isSaved={selectedDestinationModal ? isDestinationSaved(selectedDestinationModal.id) : false}
        onOpenPhotoLightbox={(photo) => setPhotoLightbox(photo)}
      />

      {/* 4. PHOTO LIGHTBOX */}
      <PhotoGalleryModal
        photo={photoLightbox}
        onClose={() => setPhotoLightbox(null)}
      />

      {/* 5. PACKAGE COMPARISON MODAL */}
      <PackageComparisonModal
        packages={TRAVEL_PACKAGES}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        currentCurrency={currentCurrency}
        currentLang={currentLang}
        onSelectPackage={(pkg) => setSelectedPackageModal(pkg)}
        onCustomise={(pkg) => setCustomPackageModal(pkg)}
      />

      {/* 6. CUSTOMIZE PACKAGE DRAWER */}
      <CustomPackageDrawer
        pkg={customPackageModal}
        isOpen={!!customPackageModal}
        onClose={() => setCustomPackageModal(null)}
        currentCurrency={currentCurrency}
        currentLang={currentLang}
        onSaveCustomization={(updatedPkg) => {
          setSelectedPackageModal(updatedPkg);
        }}
      />

      {/* 7. VOICE ASSISTANT MODAL */}
      <VoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        currentLang={currentLang}
        onSelectLang={setCurrentLang}
        onQueryProcessed={(query) => {
          setIsVoiceOpen(false);
          handleTriggerConciergeSearch(query);
        }}
      />

      {/* 8. SEARCH HISTORY MODAL */}
      <SearchHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectQuery={(query) => handleTriggerConciergeSearch(query)}
        currentLang={currentLang}
      />

    </div>
  );
}

export default App;
