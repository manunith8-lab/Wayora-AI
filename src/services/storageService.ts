import { Conversation, SearchHistoryItem, SavedItem, CustomTripPlan } from '../types/travel';
import { authService } from './authService';

const CHATS_PREFIX = 'wayora_conversations_';
const SEARCH_PREFIX = 'wayora_search_history_';
const SAVED_PREFIX = 'wayora_saved_items_';
const CUSTOM_PREFIX = 'wayora_custom_plans_';

function getUserScope(): string {
  const user = authService.getCurrentUser();
  return user ? user.id : 'guest';
}

export const storageService = {
  // CONVERSATIONS
  getConversations(scope?: string): Conversation[] {
    try {
      const activeScope = scope || getUserScope();
      const key = CHATS_PREFIX + activeScope;
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);

      // Check legacy key if guest
      if (activeScope === 'guest') {
        const legacy = localStorage.getItem('wayora_conversations_v1');
        if (legacy) return JSON.parse(legacy);
      }
      return [];
    } catch (e) {
      console.error('Failed to load conversations', e);
      return [];
    }
  },

  saveConversations(conversations: Conversation[], scope?: string): void {
    try {
      const activeScope = scope || getUserScope();
      const key = CHATS_PREFIX + activeScope;
      localStorage.setItem(key, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save conversations', e);
    }
  },

  saveConversation(conv: Conversation): void {
    const all = this.getConversations();
    const index = all.findIndex((c) => c.id === conv.id);
    if (index >= 0) {
      all[index] = conv;
    } else {
      all.unshift(conv);
    }
    this.saveConversations(all);
  },

  deleteConversation(id: string): void {
    const all = this.getConversations().filter((c) => c.id !== id);
    this.saveConversations(all);
  },

  clearAllConversations(): void {
    const key = CHATS_PREFIX + getUserScope();
    localStorage.removeItem(key);
  },

  archiveConversation(id: string, isArchived: boolean = true): void {
    const all = this.getConversations().map((c) => 
      c.id === id ? { ...c, isArchived } : c
    );
    this.saveConversations(all);
  },

  renameConversation(id: string, newTitle: string): void {
    const all = this.getConversations().map((c) =>
      c.id === id ? { ...c, title: newTitle } : c
    );
    this.saveConversations(all);
  },

  // SEARCH HISTORY
  getSearchHistory(): SearchHistoryItem[] {
    try {
      const key = SEARCH_PREFIX + getUserScope();
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);

      const legacy = localStorage.getItem('wayora_search_history_v1');
      return legacy ? JSON.parse(legacy) : [];
    } catch (e) {
      console.error('Failed to load search history', e);
      return [];
    }
  },

  addSearchHistory(query: string, type: SearchHistoryItem['type'] = 'query'): void {
    if (!query.trim()) return;
    const history = this.getSearchHistory().filter((item) => item.query.toLowerCase() !== query.toLowerCase());
    history.unshift({
      id: 'srch-' + Date.now(),
      query: query.trim(),
      type,
      timestamp: new Date().toISOString(),
    });
    try {
      const key = SEARCH_PREFIX + getUserScope();
      localStorage.setItem(key, JSON.stringify(history.slice(0, 30)));
    } catch (e) {
      console.error('Failed to save search history', e);
    }
  },

  deleteSearchItem(id: string): void {
    const history = this.getSearchHistory().filter((item) => item.id !== id);
    const key = SEARCH_PREFIX + getUserScope();
    localStorage.setItem(key, JSON.stringify(history));
  },

  clearAllSearchHistory(): void {
    const key = SEARCH_PREFIX + getUserScope();
    localStorage.removeItem(key);
  },

  // SAVED ITEMS & FAVORITES
  getSavedItems(): SavedItem[] {
    try {
      const key = SAVED_PREFIX + getUserScope();
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);

      const legacy = localStorage.getItem('wayora_saved_items_v1');
      return legacy ? JSON.parse(legacy) : [];
    } catch (e) {
      console.error('Failed to load saved items', e);
      return [];
    }
  },

  isItemSaved(itemId: string): boolean {
    return this.getSavedItems().some((item) => item.itemId === itemId);
  },

  toggleSaveItem(item: Omit<SavedItem, 'id' | 'savedAt'>): boolean {
    const saved = this.getSavedItems();
    const existingIndex = saved.findIndex((s) => s.itemId === item.itemId);
    const key = SAVED_PREFIX + getUserScope();

    if (existingIndex >= 0) {
      saved.splice(existingIndex, 1);
      localStorage.setItem(key, JSON.stringify(saved));
      return false; // removed
    } else {
      saved.unshift({
        ...item,
        id: 'save-' + Date.now(),
        savedAt: new Date().toISOString(),
      });
      localStorage.setItem(key, JSON.stringify(saved));
      return true; // saved
    }
  },

  removeSavedItem(itemId: string): void {
    const saved = this.getSavedItems().filter((s) => s.itemId !== itemId);
    const key = SAVED_PREFIX + getUserScope();
    localStorage.setItem(key, JSON.stringify(saved));
  },

  // CUSTOM TRIP PLANS
  getCustomPlans(): CustomTripPlan[] {
    try {
      const key = CUSTOM_PREFIX + getUserScope();
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);

      const legacy = localStorage.getItem('wayora_custom_plans_v1');
      return legacy ? JSON.parse(legacy) : [];
    } catch (e) {
      console.error('Failed to load custom plans', e);
      return [];
    }
  },

  saveCustomPlan(plan: CustomTripPlan): void {
    const plans = this.getCustomPlans();
    const idx = plans.findIndex((p) => p.id === plan.id);
    if (idx >= 0) {
      plans[idx] = plan;
    } else {
      plans.unshift(plan);
    }
    const key = CUSTOM_PREFIX + getUserScope();
    localStorage.setItem(key, JSON.stringify(plans));
  },
};
