import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Mic, 
  Copy, 
  Check, 
  RotateCcw, 
  Plus, 
  ArrowRight, 
  Bot, 
  User, 
  SlidersHorizontal,
  ExternalLink,
  MapPin,
  Clock,
  Compass,
  Building
} from 'lucide-react';
import { ChatMessage, Conversation, Destination, SupportedLanguage, TravelPackage, Hotel } from '../../types/travel';
import { processUserQuery, ConversationContext } from '../../services/aiConciergeService';
import { storageService } from '../../services/storageService';
import { TRANSLATIONS } from '../../data/translationsData';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { RatingStars } from '../common/RatingStars';
import { speechService } from '../../services/speechService';
import { authService } from '../../services/authService';

interface ConciergeViewProps {
  currentLang: SupportedLanguage;
  currentCurrency: string;
  initialQuery?: string;
  onSelectDestination: (dest: Destination) => void;
  onSelectPackage: (pkg: TravelPackage) => void;
  onCustomisePackage: (pkg: TravelPackage) => void;
  onOpenVoice: () => void;
}

export const ConciergeView: React.FC<ConciergeViewProps> = ({
  currentLang,
  currentCurrency,
  initialQuery,
  onSelectDestination,
  onSelectPackage,
  onCustomisePackage,
  onOpenVoice,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Initialize or load conversations from storage
  useEffect(() => {
    const loaded = storageService.getConversations();
    if (loaded.length > 0) {
      setConversations(loaded);
      setActiveConversationId(loaded[0].id);
    } else {
      createNewChat();
    }
  }, []);

  // Handle initialQuery if passed from dashboard search or prompt chip
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSend(initialQuery.trim());
    }
  }, [initialQuery]);

  // Scroll to bottom on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, isTyping]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  // Create new conversation
  const createNewChat = () => {
    const newId = 'conv-' + Date.now();
    const greeting = authService.getGreeting();
    const welcomeMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      conversationId: newId,
      sender: 'assistant',
      text: `${greeting.main} ${greeting.subtitle}\n\nI am **Wayora**, your dedicated multilingual AI Travel Concierge.\n\nTell me where you want to go, your travel dates, or your budget (e.g., *"Plan a 5-day trip to Dubai"* or *"Find budget hotels in Kerala"*), and I'll generate custom packages, hotels, and daily itineraries for you.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newConv: Conversation = {
      id: newId,
      title: 'New Trip Planning',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [welcomeMsg],
      isArchived: false,
    };

    const updated = [newConv, ...conversations];
    setConversations(updated);
    setActiveConversationId(newId);
    storageService.saveConversations(updated);
  };

  // Build multi-turn context from current conversation
  const getConversationContext = (): ConversationContext => {
    if (!activeConversation) return {};
    const context: ConversationContext = {};

    activeConversation.messages.forEach((msg) => {
      if (msg.cards?.type === 'destinations' && msg.cards.data.destination) {
        context.destination = msg.cards.data.destination;
      } else if (msg.cards?.type === 'packageComparison' && msg.cards.data.destination) {
        context.destination = msg.cards.data.destination;
      }
    });

    return context;
  };

  // Send user message and get AI response
  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    setInputText('');

    let currentConv = activeConversation;
    if (!currentConv) {
      createNewChat();
      return;
    }

    const userMessage: ChatMessage = {
      id: 'msg-u-' + Date.now(),
      conversationId: currentConv.id,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Auto update chat title from first user query
    let newTitle = currentConv.title;
    if (currentConv.messages.length <= 1) {
      newTitle = query.slice(0, 30) + (query.length > 30 ? '...' : '');
    }

    const updatedWithUser: Conversation = {
      ...currentConv,
      title: newTitle,
      updatedAt: new Date().toISOString(),
      messages: [...currentConv.messages, userMessage],
    };

    // Save user message to storage & state
    const intermediateList = conversations.map((c) =>
      c.id === currentConv?.id ? updatedWithUser : c
    );
    setConversations(intermediateList);
    storageService.saveConversations(intermediateList);
    storageService.addSearchHistory(query, 'query');

    // Simulate AI thinking & typing
    setIsTyping(true);

    (async () => {
      try {
        const context = getConversationContext();
        const response = await processUserQuery(query, context, currentLang);

        const aiMessage: ChatMessage = {
          id: 'msg-a-' + Date.now(),
          conversationId: currentConv!.id,
          sender: 'assistant',
          text: response.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intent: response.intent,
          cards: response.cards,
        };

        const finalConv: Conversation = {
          ...updatedWithUser,
          messages: [...updatedWithUser.messages, aiMessage],
        };

        const finalAll = conversations.map((c) =>
          c.id === currentConv?.id ? finalConv : c
        );

        setConversations(finalAll);
        storageService.saveConversations(finalAll);
      } catch (err) {
        console.error('Failed to process AI query in ConciergeView:', err);
      } finally {
        setIsTyping(false);
      }
    })();
  };

  // Copy message text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Regenerate last AI response
  const handleRegenerate = () => {
    if (!activeConversation || activeConversation.messages.length < 2) return;
    const lastUserMsg = [...activeConversation.messages].reverse().find((m) => m.sender === 'user');
    if (lastUserMsg) {
      handleSend(lastUserMsg.text);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-forest-100 dark:border-slate-800 shadow-card overflow-hidden grid grid-cols-1 lg:grid-cols-4 min-h-[750px]">
      
      {/* SIDEBAR: CHAT SESSIONS & HISTORY */}
      <div className="lg:col-span-1 border-r border-gray-100 dark:border-slate-800 p-4 flex flex-col justify-between bg-gray-50/70 dark:bg-slate-950/40">
        <div className="space-y-4">
          
          {/* New Chat Button */}
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-forest-900 dark:bg-gold-500 text-white dark:text-forest-950 font-bold text-sm shadow hover:bg-forest-800 dark:hover:bg-gold-400 transition"
          >
            <Plus size={16} />
            <span>{t.newChat}</span>
          </button>

          {/* Search Chats Input */}
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search conversations..."
            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-charcoal dark:text-white placeholder-gray-400 focus:outline-none"
          />

          {/* Conversation List */}
          <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block px-2 mb-1">
              Recent Conversations ({filteredConversations.length})
            </span>

            {filteredConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`group relative p-3 rounded-xl cursor-pointer transition text-left flex items-start justify-between ${
                    isActive
                      ? 'bg-forest-100/70 dark:bg-forest-900/40 border border-forest-200 dark:border-forest-700/60'
                      : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className={`text-xs font-bold truncate ${isActive ? 'text-forest-900 dark:text-gold-400' : 'text-charcoal dark:text-gray-200'}`}>
                      {conv.title}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(conv.updatedAt).toLocaleDateString()} • {conv.messages.length} msgs
                    </p>
                  </div>

                  {/* Quick Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this conversation?')) {
                        storageService.deleteConversation(conv.id);
                        setConversations(conversations.filter((c) => c.id !== conv.id));
                        if (conv.id === activeConversationId && conversations.length > 1) {
                          setActiveConversationId(conversations.find((c) => c.id !== conv.id)!.id);
                        }
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clear All Sessions Option */}
        <div className="pt-3 border-t border-gray-200 dark:border-slate-800">
          <button
            onClick={() => {
              if (window.confirm('Clear all conversation history?')) {
                storageService.clearAllConversations();
                createNewChat();
              }
            }}
            className="w-full text-center text-[11px] text-gray-400 hover:text-red-500 font-medium transition"
          >
            {t.clearAll} History
          </button>
        </div>
      </div>

      {/* CHAT MAIN INTERFACE */}
      <div className="lg:col-span-3 flex flex-col justify-between h-full bg-white dark:bg-slate-900">
        
        {/* Chat Header Bar */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-forest-900 dark:bg-forest-800 text-gold-400 flex items-center justify-center font-bold shadow-sm">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-forest-900 dark:text-white">
                Wayora AI Travel Concierge
              </h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online • Multilingual Voice & Itinerary Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              title={t.regenerate}
              className="p-2 rounded-xl text-gray-500 hover:text-forest-900 dark:hover:text-gold-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition text-xs font-semibold flex items-center gap-1"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">{t.regenerate}</span>
            </button>
          </div>
        </div>

        {/* Messages Stream Container */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          {activeConversation?.messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isUser
                      ? 'bg-forest-900 text-gold-300'
                      : 'bg-gold-500 text-forest-950 shadow-sm'
                  }`}
                >
                  {isUser ? <User size={14} /> : <Bot size={14} />}
                </div>

                {/* Message Bubble & Cards */}
                <div className={`space-y-3 max-w-[85%] sm:max-w-[78%] ${isUser ? 'text-right' : 'text-left'}`}>
                  
                  {/* Bubble */}
                  <div
                    className={`inline-block p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                      isUser
                        ? 'bg-forest-900 text-white rounded-tr-none'
                        : 'bg-forest-50/80 dark:bg-slate-800/80 text-charcoal dark:text-gray-100 rounded-tl-none border border-forest-100 dark:border-slate-700/60'
                    }`}
                  >
                    <div className="whitespace-pre-line prose dark:prose-invert text-xs sm:text-sm">
                      {msg.text}
                    </div>

                    {/* Footer bar with timestamp & copy button */}
                    <div className={`mt-2 pt-1 flex items-center gap-2 text-[10px] ${isUser ? 'justify-end text-forest-200/70' : 'text-gray-400'}`}>
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="hover:text-forest-900 dark:hover:text-gold-400 transition"
                          title="Copy text"
                        >
                          {copiedMessageId === msg.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* EMBEDDED INTERACTIVE CARDS */}
                  {msg.cards && (
                    <div className="pt-2">
                      
                      {/* DESTINATION HIGHLIGHT CARD */}
                      {msg.cards.type === 'destinations' && msg.cards.data.destination && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-forest-100 dark:border-slate-800 shadow-md space-y-4">
                          <div className="relative h-44 rounded-xl overflow-hidden">
                            <img
                              src={msg.cards.data.destination.heroImage}
                              alt={msg.cards.data.destination.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-3 left-3 text-white">
                              <h4 className="font-serif text-lg font-bold">
                                {msg.cards.data.destination.name}, {msg.cards.data.destination.country}
                              </h4>
                              <p className="text-xs text-gold-300">
                                Best time: {msg.cards.data.destination.bestTimeToVisit}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <button
                              onClick={() => onSelectDestination(msg.cards?.data.destination)}
                              className="p-2.5 rounded-xl bg-forest-900 text-white font-bold text-center hover:bg-forest-800 transition"
                            >
                              Explore Complete Guide
                            </button>
                            <button
                              onClick={() => handleSend(`Compare travel packages for ${msg.cards?.data.destination.name}`)}
                              className="p-2.5 rounded-xl bg-forest-50 dark:bg-slate-800 text-forest-900 dark:text-gold-400 font-bold text-center hover:bg-forest-100 transition"
                            >
                              Compare 3 Packages
                            </button>
                          </div>
                        </div>
                      )}

                      {/* PACKAGE COMPARISON 3-TIER MATRIX */}
                      {msg.cards.type === 'packageComparison' && msg.cards.data.packages && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {msg.cards.data.packages.map((pkg: TravelPackage) => (
                              <div
                                key={pkg.id}
                                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition shadow-sm flex flex-col justify-between ${
                                  pkg.category === 'luxury'
                                    ? 'border-gold-400 dark:border-gold-500/50'
                                    : 'border-forest-100 dark:border-slate-800'
                                }`}
                              >
                                <div>
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-2 ${
                                    pkg.category === 'luxury'
                                      ? 'bg-gold-500 text-forest-950'
                                      : 'bg-forest-100 dark:bg-slate-800 text-forest-900 dark:text-gold-400'
                                  }`}>
                                    {pkg.category} TIER
                                  </span>
                                  <h5 className="font-bold text-xs text-forest-900 dark:text-white line-clamp-1">
                                    {pkg.name}
                                  </h5>
                                  <p className="text-[11px] text-gray-500 mt-1">
                                    {pkg.accommodation.name}
                                  </p>

                                  <div className="my-2 py-2 border-y border-gray-100 dark:border-slate-800">
                                    <span className="text-[10px] text-gray-400 block">Total Quote:</span>
                                    <CurrencyDisplay
                                      amountUSD={pkg.priceTotalUSD}
                                      currencyCode={currentCurrency}
                                      className="text-base font-bold text-forest-900 dark:text-gold-400"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1.5 pt-2">
                                  <button
                                    onClick={() => onSelectPackage(pkg)}
                                    className="w-full py-1.5 rounded-lg bg-forest-50 dark:bg-slate-800 text-forest-900 dark:text-gold-300 font-bold text-xs hover:bg-forest-100 transition"
                                  >
                                    View Breakdown
                                  </button>
                                  <button
                                    onClick={() => onCustomisePackage(pkg)}
                                    className="w-full py-1.5 rounded-lg bg-forest-900 dark:bg-gold-500 text-white dark:text-forest-950 font-bold text-xs hover:bg-forest-800 transition"
                                  >
                                    Customise
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* HOTELS LIST CARDS */}
                      {msg.cards.type === 'hotels' && Array.isArray(msg.cards.data) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {msg.cards.data.slice(0, 4).map((hotel: Hotel) => (
                            <div
                              key={hotel.id}
                              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-forest-100 dark:border-slate-800 shadow-sm flex gap-3"
                            >
                              <img
                                src={hotel.photo}
                                alt={hotel.name}
                                className="w-20 h-20 rounded-xl object-cover shrink-0"
                              />
                              <div className="flex-1 flex flex-col justify-between text-left">
                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] uppercase font-bold text-gold-600 dark:text-gold-400">
                                      {hotel.category}
                                    </span>
                                    <RatingStars rating={hotel.rating} size={12} />
                                  </div>
                                  <h5 className="font-bold text-xs text-forest-900 dark:text-white line-clamp-1">
                                    {hotel.name}
                                  </h5>
                                  <p className="text-[10px] text-gray-400 truncate">
                                    {hotel.location}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                  <CurrencyDisplay
                                    amountUSD={hotel.pricePerNightUSD}
                                    currencyCode={currentCurrency}
                                    suffix="/night"
                                    className="text-xs font-bold text-forest-900 dark:text-gold-400"
                                  />
                                  <a
                                    href={hotel.bookingUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] font-bold text-forest-800 dark:text-gold-400 hover:underline flex items-center gap-0.5"
                                  >
                                    <span>Book</span>
                                    <ExternalLink size={10} />
                                  </a>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-gold-500 text-forest-950 flex items-center justify-center font-bold text-xs">
                <Bot size={14} />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-none bg-forest-50 dark:bg-slate-800 border border-forest-100 dark:border-slate-700/60 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-forest-700 dark:bg-gold-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-forest-700 dark:bg-gold-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-forest-700 dark:bg-gold-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800/80 p-2 rounded-2xl border border-gray-200 dark:border-slate-700"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Wayora anything about destinations, hotels, budgets, or itineraries..."
              className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-charcoal dark:text-white placeholder-gray-400 focus:outline-none"
            />

            <button
              type="button"
              onClick={onOpenVoice}
              title="Voice Assistant"
              className="p-2 text-forest-900 dark:text-gold-400 hover:bg-forest-100 dark:hover:bg-slate-700 rounded-xl transition"
            >
              <Mic size={18} />
            </button>

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-forest-900 dark:bg-gold-500 text-white dark:text-forest-950 disabled:opacity-40 transition hover:bg-forest-800 shadow"
            >
              <Send size={16} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
