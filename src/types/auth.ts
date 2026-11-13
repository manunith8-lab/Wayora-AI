export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  role?: 'user' | 'admin';
  tier?: 'explorer' | 'premium' | 'vip' | string;
  preferences?: {
    currency?: string;
    language?: string;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
