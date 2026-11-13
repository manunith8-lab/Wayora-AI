import { User } from '../types/auth';

const USERS_STORAGE_KEY = 'wayora_users_v1';
const SESSION_STORAGE_KEY = 'wayora_active_session_v1';

class AuthService {
  private currentUser: User | null = null;
  private listeners: Array<(user: User | null) => void> = [];

  constructor() {
    this.loadSession();
  }

  private loadSession(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      this.currentUser = null;
      return;
    }
    try {
      const sessionData = localStorage.getItem(SESSION_STORAGE_KEY);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        // Verify user actually exists in user store
        const users = this.getStoredUsers();
        const user = users.find((u) => u.id === parsed.id || u.email === parsed.email);
        if (user) {
          this.currentUser = user;
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load session', e);
    }
    this.currentUser = null;
  }

  private getStoredUsers(): User[] {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return [];
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveUsers(users: User[]): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public getGreeting(): { main: string; subtitle: string } {
    if (this.currentUser) {
      const trimmedName = this.currentUser.name?.trim();
      if (trimmedName) {
        return {
          main: `Hi, ${trimmedName}!`,
          subtitle: 'Where would you like to explore today?',
        };
      }
      // Name not set, try email prefix
      const emailPrefix = this.currentUser.email.split('@')[0];
      if (emailPrefix) {
        const formatted = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
        return {
          main: `Hi, ${formatted}!`,
          subtitle: 'Where would you like to explore today?',
        };
      }
    }

    return {
      main: 'Hello, Traveller!',
      subtitle: 'Where would you like to explore today?',
    };
  }

  public async signUp(name: string, email: string, password?: string): Promise<User> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail) {
      throw new Error('Please enter a valid email address.');
    }
    if (!cleanName) {
      throw new Error('Please provide your actual name.');
    }

    const users = this.getStoredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    const newUser: User = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: cleanName,
      email: cleanEmail,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setSession(newUser);
    return newUser;
  }

  public async signIn(email: string, password?: string): Promise<User> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Please enter your email.');
    }

    const users = this.getStoredUsers();
    let user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      // For a smooth experience, if it's the first time and name can be inferred, or prompt to sign up
      throw new Error('Account not found with this email. Please create a new account.');
    }

    this.setSession(user);
    return user;
  }

  public signOut(): void {
    this.currentUser = null;
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear session', e);
    }
    this.notify();
  }

  public updateProfile(updates: Partial<User>): User {
    if (!this.currentUser) {
      throw new Error('No user is currently signed in.');
    }

    const users = this.getStoredUsers();
    const idx = users.findIndex((u) => u.id === this.currentUser!.id);

    const updatedUser: User = {
      ...this.currentUser,
      ...updates,
      name: updates.name !== undefined ? updates.name.trim() : this.currentUser.name,
    };

    if (idx >= 0) {
      users[idx] = updatedUser;
      this.saveUsers(users);
    }

    this.setSession(updatedUser);
    return updatedUser;
  }

  private setSession(user: User): void {
    this.currentUser = user;
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to store session', e);
    }
    this.notify();
  }

  public subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.currentUser);
      } catch (e) {
        console.error('Auth listener error', e);
      }
    }
  }
}

export const authService = new AuthService();
