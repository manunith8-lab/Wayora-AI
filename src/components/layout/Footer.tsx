import React from 'react';
import { Compass, Heart, Shield, Sparkles } from 'lucide-react';
import { EXCHANGE_RATE_LAST_UPDATED } from '../../data/currenciesData';

interface FooterProps {
  onSelectTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="bg-forest-950 text-gray-300 pt-14 pb-8 border-t border-forest-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-forest-900/60">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-forest-800 text-gold-500 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-serif font-bold text-2xl text-white tracking-wider">
                WAYORA
              </span>
            </div>
            <p className="text-xs text-forest-200/80 leading-relaxed">
              Your Journey, Your Way. Intelligent multilingual AI travel booking and concierge assistant.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-gold-400">
              <Sparkles size={13} />
              <span>Powered by Advanced Travel AI Engine</span>
            </div>
          </div>

          {/* Quick Travel Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-3">
              Travel Planning
            </h4>
            <ul className="space-y-2 text-xs text-forest-200/80">
              <li><button onClick={() => onSelectTab('concierge')} className="hover:text-white transition">AI Concierge Chatbot</button></li>
              <li><button onClick={() => onSelectTab('custom-trip')} className="hover:text-white transition">Create Your Own Trip</button></li>
              <li><button onClick={() => onSelectTab('packages')} className="hover:text-white transition">Budget & Luxury Packages</button></li>
              <li><button onClick={() => onSelectTab('hotels')} className="hover:text-white transition">Hotels & Stays Comparison</button></li>
              <li><button onClick={() => onSelectTab('local-guide')} className="hover:text-white transition">Local Guide & Interactive Map</button></li>
            </ul>
          </div>

          {/* Popular Destinations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-3">
              Top Destinations
            </h4>
            <ul className="space-y-2 text-xs text-forest-200/80">
              <li><button onClick={() => onSelectTab('destinations')} className="hover:text-white transition">Dubai, UAE</button></li>
              <li><button onClick={() => onSelectTab('destinations')} className="hover:text-white transition">Switzerland Alps</button></li>
              <li><button onClick={() => onSelectTab('destinations')} className="hover:text-white transition">Kyoto & Tokyo, Japan</button></li>
              <li><button onClick={() => onSelectTab('destinations')} className="hover:text-white transition">Kerala Backwaters, India</button></li>
              <li><button onClick={() => onSelectTab('destinations')} className="hover:text-white transition">Paris, France</button></li>
            </ul>
          </div>

          {/* Trust & Guarantee */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-3">
              Platform & Trust
            </h4>
            <div className="space-y-2 text-xs text-forest-200/80">
              <div className="flex items-center gap-2 text-emerald-400">
                <Shield size={14} />
                <span>Verified Booking Partners</span>
              </div>
              <p className="text-[11px] leading-relaxed text-forest-300/70">
                Live foreign exchange rates updated centrally:
              </p>
              <p className="text-[10px] font-mono text-gold-400/90 bg-forest-900/60 px-2 py-1 rounded inline-block">
                {EXCHANGE_RATE_LAST_UPDATED}
              </p>
              <p className="text-[11px] text-forest-300/60 pt-2">
                All package estimates provide clear distinction from live booking checkout charges.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-forest-300/60 gap-4">
          <p>© {new Date().getFullYear()} WAYORA Inc. All rights reserved. Designed for international luxury travelers.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-gold-400">
              Crafted with <Heart size={11} className="fill-gold-400" /> for Global Voyagers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
