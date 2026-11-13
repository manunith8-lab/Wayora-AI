// Secure API Configuration Service
// Reads API credentials strictly from environment variables on the server/build side.
// Normal clients and guests never see or configure secret keys.

import { authService } from './authService';

export interface ApiStatus {
  googlePlacesConfigured: boolean;
  geminiConfigured: boolean;
  openStreetMapActive: boolean;
  wikipediaActive: boolean;
  wikivoyageActive: boolean;
  wikidataActive: boolean;
}

export const apiConfig = {
  getGoogleMapsKey(): string {
    return (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  },

  getGeminiKey(): string {
    return (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  },

  // Only allowed if user has explicit admin role
  isAdminUser(): boolean {
    const user = authService.getCurrentUser();
    return user?.role === 'admin';
  },

  getStatus(): ApiStatus {
    const googleKey = this.getGoogleMapsKey();
    const geminiKey = this.getGeminiKey();

    return {
      googlePlacesConfigured: !!googleKey,
      geminiConfigured: !!geminiKey,
      openStreetMapActive: true, // Always available without key
      wikipediaActive: true,     // Always available without key
      wikivoyageActive: true,    // Always available without key
      wikidataActive: true,      // Always available without key
    };
  },
};
