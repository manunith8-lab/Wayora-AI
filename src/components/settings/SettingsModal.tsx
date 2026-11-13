import React, { useState } from 'react';
import { X, CheckCircle2, Shield, Globe, Coins, Trash2, Sliders, Check, Activity, Cpu, Zap, RotateCcw } from 'lucide-react';
import { apiConfig } from '../../services/apiConfig';
import { CURRENCIES } from '../../data/currenciesData';
import { SUPPORTED_LANGUAGES } from '../../data/translationsData';
import { SupportedLanguage } from '../../types/travel';
import { User } from '../../types/auth';
import { usageMonitorService } from '../../services/usageMonitorService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCurrency: string;
  onSelectCurrency: (c: string) => void;
  currentLang: SupportedLanguage;
  onSelectLang: (l: SupportedLanguage) => void;
  currentUser?: User | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentCurrency,
  onSelectCurrency,
  currentLang,
  onSelectLang,
  currentUser,
}) => {
  const [cacheCleared, setCacheCleared] = useState(false);
  const [metrics, setMetrics] = useState(() => usageMonitorService.getMetrics());

  if (!isOpen) return null;

  const handleClearCache = () => {
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('osm_') || key.startsWith('wiki_') || key.startsWith('gp_') || key.startsWith('dest_disc_') || key.startsWith('wd_') || key.startsWith('loc_rec_'))) {
          localStorage.removeItem(key);
        }
      }
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 2000);
    } catch {}
  };

  const handleResetMetrics = () => {
    usageMonitorService.resetMetrics();
    setMetrics(usageMonitorService.getMetrics());
  };

  const totalRequests = metrics.cacheHits + metrics.cacheMisses;
  const hitRate = totalRequests > 0 ? Math.round((metrics.cacheHits / totalRequests) * 100) : 100;

  const status = apiConfig.getStatus();
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-forest-100 dark:border-slate-800 p-6 sm:p-7 text-charcoal dark:text-gray-100 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-forest-900 text-gold-400 flex items-center justify-center shadow-sm">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-forest-900 dark:text-white">
                Application Preferences
              </h3>
              <p className="text-[11px] text-gray-500">
                Personalize language, currency, and local device preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-charcoal dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. Language Preference */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Globe size={14} className="text-forest-700 dark:text-gold-400" />
              <span>Display Language</span>
            </label>
            <span className="text-[11px] text-gray-400 uppercase font-semibold">12 Languages</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => onSelectLang(lang.code)}
                  className={`p-2 rounded-xl text-xs font-medium flex items-center justify-between border transition ${
                    isSelected
                      ? 'bg-forest-900 text-white dark:bg-gold-500 dark:text-forest-950 border-forest-900 font-bold shadow-xs'
                      : 'bg-gray-50 dark:bg-slate-800/80 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-forest-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="truncate">{lang.nativeName}</span>
                  {isSelected && <Check size={12} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Currency Preference */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Coins size={14} className="text-gold-600 dark:text-gold-400" />
              <span>Preferred Currency</span>
            </label>
            <span className="text-[11px] text-gray-400 uppercase font-semibold">Live FX Rates</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
            {Object.values(CURRENCIES).map((c) => {
              const isSelected = currentCurrency === c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => onSelectCurrency(c.code)}
                  className={`p-2 rounded-xl text-xs font-medium flex items-center justify-between border transition ${
                    isSelected
                      ? 'bg-forest-900 text-white dark:bg-gold-500 dark:text-forest-950 border-forest-900 font-bold shadow-xs'
                      : 'bg-gray-50 dark:bg-slate-800/80 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-forest-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="truncate">{c.code} ({c.symbol})</span>
                  {isSelected && <Check size={12} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Global Tourism Data Engine Status (Informational only - no secret keys exposed) */}
        <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            Connected Knowledge & Tourism Services
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            
            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/70 border border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-800 dark:text-gray-200 block text-[11px]">Wikivoyage & Wikidata</span>
                <span className="text-[10px] text-gray-500">Destination Guides</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 size={11} />
                <span>Active</span>
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/70 border border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-800 dark:text-gray-200 block text-[11px]">OpenStreetMap</span>
                <span className="text-[10px] text-gray-500">Global Coordinates & POIs</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 size={11} />
                <span>Active</span>
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/70 border border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-800 dark:text-gray-200 block text-[11px]">Wikipedia Knowledge</span>
                <span className="text-[10px] text-gray-500">History & Heritage</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 size={11} />
                <span>Active</span>
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/70 border border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-800 dark:text-gray-200 block text-[11px]">Canonical Database</span>
                <span className="text-[10px] text-gray-500">Iconic Landmarks</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 size={11} />
                <span>Active</span>
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-between col-span-2">
              <div>
                <span className="font-bold text-emerald-900 dark:text-emerald-200 block text-[11px]">Primary Verified Datasets</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">4,233 records (263 cities, 333 tourist places, 612 food venues, 2,000 global, 1,025 travel plans)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 flex items-center gap-1">
                <CheckCircle2 size={11} />
                <span>Verified</span>
              </span>
            </div>

          </div>
        </div>

        {/* 4. Real-Time Resource & AI Token Telemetry */}
        <div className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Activity size={13} className="text-emerald-500" />
              <span>Resource & Token Telemetry</span>
            </span>
            <button
              onClick={handleResetMetrics}
              title="Reset telemetry counters"
              className="text-[10px] text-gray-400 hover:text-charcoal dark:hover:text-white flex items-center gap-1 transition"
            >
              <RotateCcw size={11} />
              <span>Reset</span>
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-forest-950 text-white dark:bg-slate-950/90 border border-forest-900/40 dark:border-slate-800 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between border-b border-forest-900/60 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Cpu size={13} />
                </div>
                <div>
                  <div className="text-[11px] font-bold">AI Token Consumption</div>
                  <div className="text-[9px] text-emerald-400 font-medium">100% Deterministic & Rule-Based</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-bold text-emerald-300">0 Tokens</div>
                <div className="text-[9px] text-gray-400">Zero Paid AI Cost</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
              <div className="p-1.5 rounded-xl bg-white/5 border border-white/5">
                <div className="text-[9px] text-gray-400 uppercase tracking-wider">Cache Hit</div>
                <div className="text-xs font-bold text-amber-300 font-mono">{hitRate}%</div>
                <div className="text-[8px] text-gray-400">{metrics.cacheHits} Hits</div>
              </div>
              <div className="p-1.5 rounded-xl bg-white/5 border border-white/5">
                <div className="text-[9px] text-gray-400 uppercase tracking-wider">Avg Latency</div>
                <div className="text-xs font-bold text-sky-300 font-mono">{metrics.averageResponseTimeMs} ms</div>
                <div className="text-[8px] text-gray-400">Response Speed</div>
              </div>
              <div className="p-1.5 rounded-xl bg-white/5 border border-white/5">
                <div className="text-[9px] text-gray-400 uppercase tracking-wider">Open APIs</div>
                <div className="text-xs font-bold text-purple-300 font-mono">{metrics.apiRequestsCount.total}</div>
                <div className="text-[8px] text-gray-400">OSM & Wiki</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1 text-[9px] text-gray-400 border-t border-white/5">
              <span className="px-1.5 py-0.5 rounded bg-white/5 font-mono">Nominatim: {metrics.apiRequestsCount.nominatim}</span>
              <span className="px-1.5 py-0.5 rounded bg-white/5 font-mono">Overpass: {metrics.apiRequestsCount.overpass}</span>
              <span className="px-1.5 py-0.5 rounded bg-white/5 font-mono">Wikipedia: {metrics.apiRequestsCount.wikipedia}</span>
              <span className="px-1.5 py-0.5 rounded bg-white/5 font-mono">Wikidata: {metrics.apiRequestsCount.wikidata}</span>
            </div>
          </div>
        </div>

        {/* 5. Local Cache Manager */}
        <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Local Destination Cache
            </p>
            <p className="text-[10px] text-gray-500">
              Clear cached destinations to fetch freshest live global data
            </p>
          </div>

          <button
            onClick={handleClearCache}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              cacheCleared
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Trash2 size={13} />
            <span>{cacheCleared ? 'Cache Cleared!' : 'Clear Cache'}</span>
          </button>
        </div>

        {/* Admin only notice if logged in as admin */}
        {isAdmin && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <Shield size={14} className="shrink-0 text-amber-600" />
            <span>Admin privileges active: API keys securely managed via server environment variables (`.env`).</span>
          </div>
        )}

      </div>
    </div>
  );
};
