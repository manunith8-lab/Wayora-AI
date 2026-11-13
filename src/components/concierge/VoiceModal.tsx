import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Sparkles, ArrowRight } from 'lucide-react';
import { SupportedLanguage } from '../../types/travel';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../../data/translationsData';
import { speechService } from '../../services/speechService';
import { processUserQuery } from '../../services/aiConciergeService';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLanguage;
  onSelectLang: (lang: SupportedLanguage) => void;
  onQueryProcessed: (query: string) => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onSelectLang,
  onQueryProcessed,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiSpokenText, setAiSpokenText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  useEffect(() => {
    if (isOpen) {
      startVoiceSession();
    } else {
      stopVoiceSession();
    }
  }, [isOpen]);

  const startVoiceSession = () => {
    setErrorMsg('');
    setTranscript('');
    setAiSpokenText('');

    const started = speechService.startListening(currentLang, {
      onStart: () => {
        setIsRecording(true);
      },
      onResult: (text) => {
        setTranscript(text);
      },
      onEnd: () => {
        setIsRecording(false);
        // Process transcript when user stops speaking
        if (transcript.trim()) {
          processTranscript(transcript.trim());
        }
      },
      onError: (err) => {
        setIsRecording(false);
        setErrorMsg('Microphone not available or speech recognition ended.');
      },
    });

    if (!started) {
      setIsRecording(false);
      // Fallback demo simulation
      setErrorMsg('Microphone permission or browser speech API inactive. You can use standard text or simulation.');
    }
  };

  const stopVoiceSession = () => {
    speechService.stopListening();
    speechService.stopSpeaking();
    setIsRecording(false);
  };

  const processTranscript = async (query: string) => {
    try {
      const response = await processUserQuery(query, {}, currentLang);
      setAiSpokenText(response.text);

      // Display response text and notify main concierge without auto-speaking
      setTimeout(() => {
        onQueryProcessed(query);
      }, 1000);
    } catch (err) {
      console.error('Error in VoiceModal query processing:', err);
    }
  };

  const handleSimulateExample = (sampleText: string) => {
    setTranscript(sampleText);
    setIsRecording(false);
    processTranscript(sampleText);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-forest-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-forest-700/60 overflow-hidden text-center space-y-6">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 -mt-20 w-80 h-80 rounded-full bg-gold-500/20 blur-3xl pointer-events-none" />

        {/* Top Controls */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-gold-400 uppercase tracking-widest">
              Wayora Voice Concierge
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Close button */}
            <button
              onClick={() => {
                stopVoiceSession();
                onClose();
              }}
              className="p-2 rounded-xl bg-forest-800 text-gray-300 hover:text-white transition"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Center Animated Mic Pulse Wave */}
        <div className="py-6 flex flex-col items-center justify-center relative">
          <div className="relative flex items-center justify-center">
            {isRecording && (
              <>
                <div className="absolute w-36 h-36 rounded-full bg-gold-500/20 animate-ping duration-1000" />
                <div className="absolute w-48 h-48 rounded-full bg-forest-500/20 animate-pulse duration-1000" />
              </>
            )}

            <button
              onClick={() => {
                if (isRecording) {
                  stopVoiceSession();
                  if (transcript.trim()) {
                    processTranscript(transcript.trim());
                  }
                } else {
                  startVoiceSession();
                }
              }}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
                isRecording
                  ? 'bg-red-500 text-white scale-110 shadow-red-500/50'
                  : 'bg-gradient-to-tr from-gold-500 to-amber-400 text-forest-950 hover:scale-105'
              }`}
            >
              {isRecording ? <MicOff size={36} /> : <Mic size={36} />}
            </button>
          </div>

          <p className="mt-4 text-xs font-semibold text-gold-300 tracking-wide">
            {isRecording ? t.listening : 'Click microphone to speak'}
          </p>
        </div>

        {/* Real-time Transcript View */}
        <div className="p-4 rounded-2xl bg-forest-950/60 border border-forest-800 min-h-[90px] flex items-center justify-center text-center">
          {transcript ? (
            <p className="text-base sm:text-lg font-medium text-white italic">
              "{transcript}"
            </p>
          ) : errorMsg ? (
            <p className="text-xs text-amber-300/80">{errorMsg}</p>
          ) : (
            <p className="text-xs text-forest-300/70">
              Speak naturally, e.g.: "Find me the cheapest hotels in Dubai for 4 days"
            </p>
          )}
        </div>

        {/* AI Voice Output Display */}
        {aiSpokenText && (
          <div className="p-4 rounded-2xl bg-forest-800/80 border border-gold-500/30 text-left text-xs leading-relaxed space-y-2 animate-in fade-in">
            <span className="text-[10px] font-bold uppercase text-gold-400 tracking-wider flex items-center gap-1">
              <Sparkles size={12} />
              Wayora Response:
            </span>
            <p className="text-forest-100 line-clamp-3">
              {aiSpokenText}
            </p>
          </div>
        )}

        {/* Quick Voice Prompt Shortcuts */}
        <div className="space-y-2 pt-2 text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-forest-300 block">
            Or try quick voice prompts:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              'Find me the cheapest hotels in Dubai for 4 days',
              'Plan a luxury Swiss vacation',
              'Best destinations in Japan for autumn',
              'Budget trip to Kerala under $500',
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSimulateExample(prompt)}
                className="text-[11px] px-3 py-1.5 rounded-xl bg-forest-800/80 hover:bg-forest-700 text-forest-200 hover:text-white border border-forest-700/60 transition"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
