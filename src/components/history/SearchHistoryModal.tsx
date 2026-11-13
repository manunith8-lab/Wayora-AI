import React, { useState, useEffect } from 'react';
import { X, Search, Trash2, Clock, ArrowRight, History } from 'lucide-react';
import { SearchHistoryItem, SupportedLanguage } from '../../types/travel';
import { storageService } from '../../services/storageService';
import { TRANSLATIONS } from '../../data/translationsData';

interface SearchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuery: (query: string) => void;
  currentLang: SupportedLanguage;
}

export const SearchHistoryModal: React.FC<SearchHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectQuery,
  currentLang,
}) => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [filterQuery, setFilterQuery] = useState('');

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  useEffect(() => {
    if (isOpen) {
      setHistory(storageService.getSearchHistory());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (id: string) => {
    storageService.deleteSearchItem(id);
    setHistory(history.filter((h) => h.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm(t.confirmDelete)) {
      storageService.clearAllSearchHistory();
      setHistory([]);
    }
  };

  const filtered = history.filter((h) =>
    h.query.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-forest-100 dark:border-slate-800 space-y-5 text-charcoal dark:text-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <History size={18} className="text-forest-800 dark:text-gold-400" />
            <h3 className="font-serif text-lg font-bold text-forest-900 dark:text-white">
              Search History
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Input */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search previous queries..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-charcoal dark:text-white focus:outline-none"
          />
        </div>

        {/* History List */}
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectQuery(item.query);
                  onClose();
                }}
                className="group p-2.5 rounded-xl hover:bg-forest-50 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs transition"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <Clock size={13} className="text-gray-400 shrink-0" />
                  <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                    {item.query}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-gray-400">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-xs text-gray-400 py-6">
              No recent searches recorded.
            </p>
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={handleClearAll}
              className="text-xs text-red-500 hover:underline font-semibold"
            >
              {t.clearAll}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
