import { SupportedLanguage } from '../types/travel';

// Speech Recognition & Synthesis helper
export interface SpeechServiceCallbacks {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

const LANG_MAP: Record<SupportedLanguage, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  ml: 'ml-IN',
  kn: 'kn-IN',
  ta: 'ta-IN',
  ar: 'ar-AE',
  es: 'es-ES',
  ja: 'ja-JP',
  zh: 'zh-CN',
  fr: 'fr-FR',
  de: 'de-DE',
  pt: 'pt-BR',
};

class SpeechService {
  private recognition: any = null;
  private isListening = false;
  private isSpeaking = false;
  private isMuted = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      }
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public startListening(
    lang: SupportedLanguage = 'en',
    callbacks: SpeechServiceCallbacks
  ): boolean {
    if (!this.recognition) {
      if (callbacks.onError) {
        callbacks.onError('Speech recognition not supported in this browser. Please type your query.');
      }
      return false;
    }

    try {
      this.recognition.lang = LANG_MAP[lang] || 'en-US';
      this.isListening = true;

      this.recognition.onstart = () => {
        callbacks.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        callbacks.onResult?.(transcript);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        callbacks.onError?.(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        callbacks.onEnd?.();
      };

      this.recognition.start();
      return true;
    } catch (e: any) {
      this.isListening = false;
      callbacks.onError?.(e.message || 'Could not access microphone');
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.error('Error stopping recognition', e);
      }
    }
    this.isListening = false;
  }

  public speak(
    _text: string, 
    _lang: SupportedLanguage = 'en', 
    onEnd?: () => void
  ): void {
    // Automatic text-to-speech and audio reading are completely disabled per requirement.
    // Responses are displayed as text only.
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    onEnd?.();
  }

  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopSpeaking();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const speechService = new SpeechService();
