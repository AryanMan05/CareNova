// CareNova Authentication Engine (Powered by SQLite / Turso Backend)
// Lead Architect: Aryan More

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getAuthToken } from '../lib/api';
import { UserProfile } from '../types/health';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  created_at?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  session: any | null;
  loading: boolean;
  isAdmin: boolean;
  isDemoMode: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore authenticated session on load from SQLite backend
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      const token = getAuthToken();
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const data = await api.auth.getMe();
        if (isMounted && data.user) {
          setUser(data.user);
          setProfile(data.profile);
        }
      } catch (err) {
        console.warn('Session expired or invalid. Clearing token.');
        api.auth.logout();
        if (isMounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const res = await api.auth.signup(email, password, fullName);
      setUser(res.user);
      setProfile(res.profile);
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err.message || 'Signup failed.') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await api.auth.login(email, password);
      setUser(res.user);
      setProfile(res.profile);
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err.message || 'Login failed.') };
    }
  };

  const signOut = async () => {
    api.auth.logout();
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    // Password reset request confirmation
    return { error: null };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const res = await api.auth.updateProfile(updates);
      if (res.profile) {
        setProfile(res.profile as UserProfile);
      }
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err.message || 'Could not update profile.') };
    }
  };

  const refreshProfile = async () => {
    try {
      const data = await api.auth.getMe();
      if (data.user) {
        setUser(data.user);
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('Refresh profile error:', err);
    }
  };

  const isAdmin = profile?.role === 'admin' || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session: user ? { user } : null,
        loading,
        isAdmin,
        isDemoMode: false,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
