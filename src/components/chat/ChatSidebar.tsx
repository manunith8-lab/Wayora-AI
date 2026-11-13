import React, { useState } from 'react';
import { 
  Plus, 
  Compass, 
  Search, 
  MessageSquare, 
  Bookmark, 
  MapPin, 
  Settings, 
  LogOut, 
  LogIn, 
  Trash2, 
  Edit2, 
  Check, 
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Conversation } from '../../types/travel';
import { User } from '../../types/auth';
import { TRANSLATIONS } from '../../data/translationsData';
import { SupportedLanguage } from '../../types/travel';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onClearAll: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenSettings: () => void;
  onOpenSaved: () => void;
  onOpenExplore: () => void;
  currentLang: SupportedLanguage;
  savedCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onClearAll,
  currentUser,
  onOpenAuth,
  onSignOut,
  onOpenSettings,
  onOpenSaved,
  onOpenExplore,
  currentLang,
  savedCount,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-forest-950 text-gray-200 flex flex-col justify-between border-r border-forest-900 transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden p-4 space-y-4">
          
          {/* Top Brand Logo */}
          <div className="flex items-center justify-between pb-2 border-b border-forest-900/80">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-forest-900 text-gold-400 flex items-center justify-center shadow-md">
                <Compass size={20} className="animate-spin duration-3000" />
              </div>
              <div>
                <span className="font-serif font-bold text-xl text-white tracking-wider block leading-tight">
                  WAYORA
                </span>
                <span className="text-[10px] text-forest-300 font-medium">
                  Your Journey, Your Way.
                </span>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-forest-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
          >
            <Plus size={16} />
            <span>New Chat</span>
          </button>

          {/* Search Conversations Input */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-forest-900/60 border border-forest-800 text-white placeholder-forest-300/50 focus:outline-none focus:border-gold-500"
            />
          </div>

          {/* Conversations History List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            <div className="flex items-center justify-between px-2 pt-1 pb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-300/60">
                Recent Chats ({filtered.length})
              </span>
              {conversations.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-[10px] text-forest-400 hover:text-red-400 transition"
                  title="Clear all conversations"
                >
                  Clear All
                </button>
              )}
            </div>

            {filtered.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const isEditing = editingId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onCloseMobile();
                  }}
                  className={`group relative p-2.5 rounded-xl cursor-pointer text-xs transition flex items-center justify-between ${
                    isActive
                      ? 'bg-forest-900 text-white font-semibold border border-forest-700/60 shadow-sm'
                      : 'hover:bg-forest-900/50 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0 pr-1">
                    <MessageSquare size={13} className={isActive ? 'text-gold-400' : 'text-gray-400'} />
                    {isEditing ? (
                      <input
                        type="text"
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveRename(conv.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-forest-950 px-1 py-0.5 rounded text-white text-xs w-full focus:outline-none border border-gold-400"
                      />
                    ) : (
                      <span className="truncate">{conv.title}</span>
                    )}
                  </div>

                  {/* Actions (Rename, Delete) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    {isEditing ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          saveRename(conv.id);
                        }}
                        className="p-1 text-emerald-400 hover:text-white"
                      >
                        <Check size={12} />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startRename(conv);
                        }}
                        className="p-1 text-gray-400 hover:text-gold-300"
                        title="Rename"
                      >
                        <Edit2 size={11} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Navigation Shortcuts */}
          <div className="pt-2 border-t border-forest-900/80 space-y-1 text-xs">
            
            <button
              onClick={() => {
                onOpenSaved();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl text-gray-300 hover:text-white hover:bg-forest-900/50 transition"
            >
              <span className="flex items-center gap-2">
                <Bookmark size={14} className="text-gold-400" />
                <span>Saved Trips & Places</span>
              </span>
              {savedCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-forest-800 text-gold-300">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onOpenExplore();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl text-gray-300 hover:text-white hover:bg-forest-900/50 transition"
            >
              <span className="flex items-center gap-2">
                <MapPin size={14} className="text-emerald-400" />
                <span>Explore Global Destinations</span>
              </span>
              <ChevronRight size={13} className="text-gray-500" />
            </button>

            <button
              onClick={() => {
                onOpenSettings();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl text-gray-300 hover:text-white hover:bg-forest-900/50 transition"
            >
              <span className="flex items-center gap-2">
                <Settings size={14} className="text-forest-300" />
                <span>App Preferences</span>
              </span>
              <ChevronRight size={13} className="text-gray-500" />
            </button>

          </div>

          {/* User Profile Footer (Dynamic Authentication) */}
          <div className="pt-3 border-t border-forest-900/80">
            {currentUser ? (
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-forest-900/70 border border-forest-800">
                <div 
                  onClick={onOpenAuth}
                  className="flex items-center gap-2.5 truncate cursor-pointer hover:opacity-90 flex-1"
                >
                  <div className="w-8 h-8 rounded-full bg-forest-800 text-gold-300 flex items-center justify-center font-bold text-xs shrink-0 border border-gold-500/30">
                    {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'ME'}
                  </div>
                  <div className="truncate text-left">
                    <p className="text-xs font-bold text-white truncate leading-tight">
                      {currentUser.name || 'User Profile'}
                    </p>
                    <p className="text-[10px] text-forest-300 truncate">
                      {currentUser.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-1.5 text-gray-400 hover:text-red-400 transition shrink-0 ml-1"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="w-full py-2.5 px-3 rounded-2xl bg-forest-900/90 hover:bg-forest-800 text-white font-bold text-xs flex items-center justify-between transition border border-forest-800 shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <LogIn size={14} className="text-gold-400" />
                  <span>Sign In / Create Profile</span>
                </span>
                <span className="text-[10px] text-gold-400 bg-forest-950 px-2 py-0.5 rounded-md font-semibold">
                  Personalize
                </span>
              </button>
            )}
          </div>

        </div>
      </aside>
    </>
  );
};
