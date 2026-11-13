import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  RotateCcw, 
  Copy, 
  Check, 
  Compass, 
  Sparkles, 
  User as UserIcon, 
  Bot, 
  ExternalLink,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { ChatMessage, Conversation, Destination, SupportedLanguage, TravelPackage, Hotel, TravelPlanData } from '../../types/travel';
import { User } from '../../types/auth';
import { processUserQuery, ConversationContext } from '../../services/aiConciergeService';
import { storageService } from '../../services/storageService';
import { authService } from '../../services/authService';
import { TRANSLATIONS } from '../../data/translationsData';
import { speechService } from '../../services/speechService';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { RatingStars } from '../common/RatingStars';
import { DiscoveryCard } from '../concierge/cards/DiscoveryCard';
import { FoodDiscoveryCard } from '../concierge/cards/FoodDiscoveryCard';
import { TravelPlanCard } from '../concierge/cards/TravelPlanCard';
import { DestinationDiscoveryResult } from '../../services/placesService';

interface ChatWorkspaceProps {
  activeConversation: Conversation | null;
  onUpdateConversation: (updated: Conversation) => void;
  currentUser: User | null;
  currentLang: SupportedLanguage;
  currentCurrency: string;
  onOpenVoice: () => void;
  onSelectDestination: (dest: Destination) => void;
  onSelectPackage: (pkg: TravelPackage) => void;
  onCustomisePackage: (pkg: TravelPackage) => void;
  onOpenAuth: () => void;
  initialQuery?: string;
  onClearInitialQuery?: () => void;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  activeConversation,
  onUpdateConversation,
  currentUser,
  currentLang,
  currentCurrency,
  onOpenVoice,
  onSelectDestination,
  onSelectPackage,
  onCustomisePackage,
  onOpenAuth,
  initialQuery,
  onClearInitialQuery,
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isTyping]);

  // Dynamic greeting from authService
  const greeting = authService.getGreeting();

  // Curated AI Suggested Prompts
  const suggestedPrompts = [
    { text: 'Show me the best places to visit in Manali.', label: 'Manali Iconic', icon: '🏔️' },
    { text: 'Tell me about Himachal Pradesh.', label: 'Himachal State', icon: '🌲' },
    { text: 'Explore tourist places in Kerala.', label: 'Kerala Highlights', icon: '🌴' },
    { text: 'Show me the best places in Paris.', label: 'Paris Landmarks', icon: '🗼' },
    { text: 'What can I visit in Japan?', label: 'Japan Sights', icon: '⛩️' },
    { text: 'Where can I eat authentic food in Kozhikode?', label: 'Kozhikode Cuisine', icon: '🍲' },
  ];

  // Build context
  const getContext = (): ConversationContext => {
    if (!activeConversation) return {};
    const context: ConversationContext = {};

    if (activeConversation.destinationMentioned) {
      context.destinationName = activeConversation.destinationMentioned;
    }

    activeConversation.messages.forEach((msg) => {
      if (msg.cards?.type === 'discovery' && msg.cards.data.destination) {
        context.destinationName = msg.cards.data.destination;
      } else if (msg.cards?.type === 'foodDiscovery' && msg.cards.data.destination) {
        context.destinationName = msg.cards.data.destination;
      } else if (msg.cards?.type === 'destinations' && msg.cards.data.destination) {
        context.destination = msg.cards.data.destination;
        context.destinationName = msg.cards.data.destination.name;
      }
    });

    return context;
  };

  // Send message
  const handleSend = async (queryText?: string) => {
    const text = (queryText || inputText).trim();
    if (!text || !activeConversation) return;

    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const userMessage: ChatMessage = {
      id: 'usr_' + Date.now(),
      conversationId: activeConversation.id,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Auto title chat if it's the first message
    let newTitle = activeConversation.title;
    if (activeConversation.messages.length === 0 || activeConversation.title === 'New Chat') {
      newTitle = text.length > 28 ? text.slice(0, 28) + '...' : text;
    }

    const updatedWithUser: Conversation = {
      ...activeConversation,
      title: newTitle,
      updatedAt: new Date().toISOString(),
      messages: [...activeConversation.messages, userMessage],
    };

    onUpdateConversation(updatedWithUser);
    storageService.addSearchHistory(text, 'query');
    setIsTyping(true);

    try {
      const context = getContext();
      const aiResponse = await processUserQuery(text, context, currentLang);

      const aiMessage: ChatMessage = {
        id: 'ai_' + Date.now(),
        conversationId: activeConversation.id,
        sender: 'assistant',
        text: aiResponse.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: aiResponse.intent,
        cards: aiResponse.cards,
      };

      const finalConv: Conversation = {
        ...updatedWithUser,
        messages: [...updatedWithUser.messages, aiMessage],
        destinationMentioned: aiResponse.destinationMentioned || activeConversation.destinationMentioned,
      };

      onUpdateConversation(finalConv);
      setIsTyping(false);
    } catch (err) {
      console.error('AI Concierge error', err);
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSend(initialQuery.trim());
      onClearInitialQuery?.();
    }
  }, [initialQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerate = () => {
    if (!activeConversation) return;
    const lastUserMsg = [...activeConversation.messages].reverse().find((m) => m.sender === 'user');
    if (lastUserMsg) {
      handleSend(lastUserMsg.text);
    }
  };

  const messages = activeConversation?.messages || [];
  const isEmptyChat = messages.length === 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden relative">
      
      {/* Messages Stream Container */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* EMPTY STATE / CHATGPT WELCOME GREETING */}
        {isEmptyChat ? (
          <div className="max-w-3xl mx-auto h-full min-h-[500px] flex flex-col items-center justify-center text-center space-y-8 my-auto animate-in fade-in">
            
            {/* Logo Badge */}
            <div className="w-16 h-16 rounded-3xl bg-forest-900 dark:bg-forest-800 text-gold-400 flex items-center justify-center shadow-xl">
              <Compass size={32} className="animate-spin duration-3000" />
            </div>

            {/* Personalized Dynamic Greeting */}
            <div className="space-y-2">
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-forest-900 dark:text-white tracking-tight">
                {greeting.main}
              </h2>
              <p className="font-serif text-lg sm:text-2xl text-gold-600 dark:text-gold-400 font-light">
                {greeting.subtitle}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                Ask about any destination in the world. Powered by live Google Places, OpenStreetMap, and Wikipedia location intelligence.
              </p>
            </div>

            {/* Suggested Prompt Cards */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left">
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.text)}
                  className="group p-3.5 rounded-2xl bg-gray-50/80 dark:bg-slate-800/60 hover:bg-forest-50 dark:hover:bg-slate-800 border border-gray-100 dark:border-slate-800 hover:border-gold-300 dark:hover:border-gold-500/50 transition-all text-left flex flex-col justify-between shadow-sm hover:shadow"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base">{p.icon}</span>
                    <span className="text-[10px] font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wider">
                      {p.label}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-forest-900 dark:group-hover:text-white line-clamp-2">
                    {p.text}
                  </p>
                </button>
              ))}
            </div>

          </div>
        ) : (
          /* CONVERSATION MESSAGE LIST */
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 sm:gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* User / Bot Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isUser
                        ? 'bg-forest-900 text-gold-300 shadow-sm'
                        : 'bg-gold-500 text-forest-950 shadow-sm'
                    }`}
                  >
                    {isUser ? (
                      currentUser?.name ? currentUser.name.slice(0, 1).toUpperCase() : <UserIcon size={14} />
                    ) : (
                      <Bot size={15} />
                    )}
                  </div>

                  {/* Message Body */}
                  <div className={`space-y-3 max-w-[90%] sm:max-w-[85%] ${isUser ? 'text-right' : 'text-left'}`}>
                    
                    {/* Bubble */}
                    <div
                      className={`inline-block p-4 sm:p-5 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                        isUser
                          ? 'bg-forest-900 text-white rounded-tr-none'
                          : 'bg-gray-50/90 dark:bg-slate-800/80 text-charcoal dark:text-gray-100 rounded-tl-none border border-forest-100/80 dark:border-slate-700/60'
                      }`}
                    >
                      <div className="whitespace-pre-line prose dark:prose-invert text-xs sm:text-sm max-w-none">
                        {msg.text}
                      </div>

                      {/* Timestamp & copy action */}
                      <div className={`mt-2 pt-1 flex items-center gap-2 text-[10px] ${
                        isUser ? 'justify-end text-forest-200/70' : 'text-gray-400'
                      }`}>
                        <span>{msg.timestamp}</span>
                        {!isUser && (
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="hover:text-forest-900 dark:hover:text-gold-400 transition"
                            title="Copy message"
                          >
                            {copiedId === msg.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* EMBEDDED RICH CARDS */}
                    {msg.cards && (
                      <div className="pt-2 text-left">
                        
                        {/* 0. TRAVEL PLAN CARD (ITINERARY, 3-TIER COSTS, TRANSIT, STAYS) */}
                        {msg.cards.type === 'travelPlan' && (
                          <TravelPlanCard 
                            data={msg.cards.data as TravelPlanData} 
                            onSendFollowUp={(prompt) => handleSend(prompt)}
                          />
                        )}

                        {/* 1. DISCOVERY CARD (CATEGORIZED PLACES & REGIONS) */}
                        {msg.cards.type === 'discovery' && (
                          <DiscoveryCard 
                            data={msg.cards.data as DestinationDiscoveryResult} 
                            onExploreSubDestination={(destName) => handleSend('Tell me about ' + destName)}
                          />
                        )}

                        {/* 2. FOOD DISCOVERY CARD (TRADITIONAL FOODS & REAL RESTAURANTS) */}
                        {msg.cards.type === 'foodDiscovery' && (
                          <FoodDiscoveryCard data={msg.cards.data as DestinationDiscoveryResult} />
                        )}

                        {/* 3. HOTEL CARDS */}
                        {msg.cards.type === 'hotels' && Array.isArray(msg.cards.data) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {msg.cards.data.slice(0, 4).map((hotel: Hotel) => (
                              <div
                                key={hotel.id}
                                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-forest-100 dark:border-slate-800 shadow-sm flex gap-3"
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
                                      <RatingStars rating={hotel.rating} size={11} />
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

                        {/* 4. PACKAGE COMPARISON MATRIX */}
                        {msg.cards.type === 'packageComparison' && msg.cards.data.packages && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {msg.cards.data.packages.map((pkg: TravelPackage) => (
                              <div
                                key={pkg.id}
                                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition shadow-sm flex flex-col justify-between ${
                                  pkg.category === 'luxury'
                                    ? 'border-gold-400 dark:border-gold-500/60'
                                    : 'border-forest-100 dark:border-slate-800'
                                }`}
                              >
                                <div>
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1.5 ${
                                    pkg.category === 'luxury'
                                      ? 'bg-gold-500 text-forest-950'
                                      : 'bg-forest-100 dark:bg-slate-800 text-forest-900 dark:text-gold-400'
                                  }`}>
                                    {pkg.category} TIER
                                  </span>
                                  <h5 className="font-bold text-xs text-forest-900 dark:text-white line-clamp-1">
                                    {pkg.name}
                                  </h5>
                                  <p className="text-[11px] text-gray-500 mt-0.5">
                                    {pkg.accommodation.name}
                                  </p>

                                  <div className="my-2 py-2 border-y border-gray-100 dark:border-slate-800">
                                    <span className="text-[10px] text-gray-400 block">Estimated Total:</span>
                                    <CurrencyDisplay
                                      amountUSD={pkg.priceTotalUSD}
                                      currencyCode={currentCurrency}
                                      className="text-base font-bold text-forest-900 dark:text-gold-400"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1.5 pt-1">
                                  <button
                                    onClick={() => onSelectPackage(pkg)}
                                    className="w-full py-1.5 rounded-lg bg-forest-50 dark:bg-slate-800 text-forest-900 dark:text-gold-300 font-bold text-xs hover:bg-forest-100 transition"
                                  >
                                    View Details
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
                        )}

                        {/* 5. SINGLE PACKAGE / ITINERARY PREVIEW */}
                        {msg.cards.type === 'packages' && msg.cards.data && (
                          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-forest-100 dark:border-slate-800 shadow-md space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="font-serif font-bold text-base text-forest-900 dark:text-white">
                                {msg.cards.data.name} ({msg.cards.data.durationDays}D / {msg.cards.data.durationNights}N)
                              </h5>
                              <CurrencyDisplay
                                amountUSD={msg.cards.data.priceTotalUSD}
                                currencyCode={currentCurrency}
                                className="text-base font-bold text-forest-900 dark:text-gold-400"
                              />
                            </div>
                            <div className="space-y-2">
                              {msg.cards.data.dayByDayItinerary?.slice(0, 3).map((day: any) => (
                                <div key={day.day} className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 text-xs">
                                  <span className="font-bold text-forest-900 dark:text-gold-400 block mb-0.5">
                                    Day {day.day}: {day.title}
                                  </span>
                                  <p className="text-gray-500 dark:text-gray-400 text-[11px]">{day.description}</p>
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={() => onSelectPackage(msg.cards?.data)}
                              className="w-full py-2 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition"
                            >
                              Explore Complete Itinerary & PDF
                            </button>
                          </div>
                        )}

                      </div>
                    )}

                    {/* FOLLOW-UP SUGGESTION CHIPS */}
                    {!isUser && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[
                          'Find authentic local food & restaurants',
                          'Show hidden gems',
                          'Create a 3-day itinerary',
                          'Find hotels nearby',
                        ].map((chip, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(chip)}
                            className="px-3 py-1 rounded-full bg-gray-100/90 dark:bg-slate-800/80 hover:bg-forest-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 text-[11px] font-medium border border-gray-200/60 dark:border-slate-700 transition shadow-xs"
                          >
                            + {chip}
                          </button>
                        ))}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}

            {/* AI Retrieval & Typing indicator */}
            {isTyping && (
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-gold-500 text-forest-950 flex items-center justify-center font-bold text-xs shadow-sm">
                  <Bot size={15} />
                </div>
                <div className="p-3.5 rounded-2xl rounded-tl-none bg-gray-50 dark:bg-slate-800 border border-forest-100 dark:border-slate-700 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-forest-700 dark:bg-gold-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-forest-700 dark:bg-gold-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-forest-700 dark:bg-gold-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] ml-1">Retrieving live global tourism data...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

      </div>

      {/* FIXED BOTTOM MESSAGE COMPOSER */}
      <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="max-w-4xl mx-auto space-y-2">
          
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-end gap-2 bg-gray-50 dark:bg-slate-800/90 p-2 sm:p-3 rounded-2xl border border-gray-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-gold-400/30 transition shadow-sm"
          >
            {/* Auto-expanding textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything (e.g. 'Show me the best places in Munnar' or 'Where to eat in Kozhikode')..."
              className="flex-1 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-charcoal dark:text-white placeholder-gray-400 focus:outline-none resize-none max-h-32"
            />

            {/* Voice Assistant Mic */}
            <button
              type="button"
              onClick={onOpenVoice}
              title="Voice Input"
              className="p-2.5 text-forest-800 dark:text-gold-400 hover:bg-forest-100 dark:hover:bg-slate-700 rounded-xl transition shrink-0"
            >
              <Mic size={18} />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-forest-900 dark:bg-gold-500 text-white dark:text-forest-950 disabled:opacity-40 transition hover:bg-forest-800 shadow-md shrink-0"
            >
              <Send size={16} />
            </button>
          </form>

          {/* Subtext info */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
            <span>Press Enter to send, Shift + Enter for new line</span>
            <span className="hidden sm:inline flex items-center gap-1">
              <ShieldCheck size={11} className="text-emerald-500 inline" />
              <span>Connected to Google Places & OpenStreetMap</span>
            </span>
          </div>

        </div>
      </div>

    </div>
  );
};
