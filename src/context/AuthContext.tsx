// Authentication Context & State Engine
// Highest Priority Requirement: Robust registration, login, logout, session persistence, role checking
// Lead Architect: Aryan More

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, UserRole } from '../types/health';
import { User, Session } from '@supabase/supabase-js';

// Local storage key for fallback/offline demo mode
const DEMO_USER_KEY = 'carenova_demo_user';
const DEMO_PROFILE_KEY = 'carenova_demo_profile';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(!isSupabaseConfigured);

  // Fetch or populate profile from Supabase profiles table
  const fetchProfile = async (userId: string, userMetaName?: string) => {
    try {
      if (isDemoMode) {
        const stored = localStorage.getItem(DEMO_PROFILE_KEY);
        if (stored) {
          setProfile(JSON.parse(stored));
        }
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Row doesn't exist yet, insert basic profile
        const newProf: Partial<UserProfile> = {
          id: userId,
          full_name: userMetaName || 'CareNova User',
          role: 'user',
          water_goal_glasses: 8,
          step_goal: 10000,
          sleep_goal_hours: 8.0,
          activity_level: 'Moderate',
          is_active: true,
        };
        const { data: inserted, error: insErr } = await supabase
          .from('profiles')
          .insert(newProf)
          .select()
          .single();

        if (!insErr && inserted) {
          setProfile(inserted as UserProfile);
        }
      } else if (data) {
        setProfile(data as UserProfile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured) {
      // Offline/Demo Mode with full feature fidelity
      setIsDemoMode(true);
      const savedUser = localStorage.getItem(DEMO_USER_KEY);
      const savedProfile = localStorage.getItem(DEMO_PROFILE_KEY);

      if (savedUser && savedProfile) {
        setUser(JSON.parse(savedUser));
        setProfile(JSON.parse(savedProfile));
      } else {
        // Create initial default demo user for seamless local evaluation
        const initialDemoUser: any = {
          id: 'demo-user-aryan',
          email: 'demo@carenova.health',
          user_metadata: { full_name: 'Aryan More' },
        };
        const initialDemoProfile: UserProfile = {
          id: 'demo-user-aryan',
          full_name: 'Aryan More',
          role: 'admin',
          age: 26,
          gender: 'Male',
          height: 175,
          weight: 70,
          blood_group: 'O+',
          activity_level: 'Moderate',
          water_goal_glasses: 8,
          step_goal: 10000,
          sleep_goal_hours: 8.0,
          emergency_contact_name: 'Family Member',
          emergency_contact_phone: '+91 98765 43210',
          allergies: 'None reported',
          is_active: true,
        };
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(initialDemoUser));
        localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(initialDemoProfile));
        setUser(initialDemoUser);
        setProfile(initialDemoProfile);
      }
      setLoading(false);
      return;
    }

    // Live Supabase Auth Engine
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          if (currentSession?.user) {
            await fetchProfile(currentSession.user.id, currentSession.user.user_metadata?.full_name);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Listen to Supabase auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await fetchProfile(newSession.user.id, newSession.user.user_metadata?.full_name);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    if (isDemoMode) {
      const demoUser: any = {
        id: `user-${Date.now()}`,
        email,
        user_metadata: { full_name: fullName },
      };
      const demoProfile: UserProfile = {
        id: demoUser.id,
        full_name: fullName,
        role: 'user',
        water_goal_glasses: 8,
        step_goal: 10000,
        sleep_goal_hours: 8.0,
        activity_level: 'Moderate',
        is_active: true,
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
      localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(demoProfile));
      setUser(demoUser);
      setProfile(demoProfile);
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) return { error };

      if (data.user) {
        await fetchProfile(data.user.id, fullName);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (isDemoMode) {
      const demoUser: any = {
        id: 'demo-user-aryan',
        email,
        user_metadata: { full_name: 'Aryan More' },
      };
      const demoProfile: UserProfile = {
        id: 'demo-user-aryan',
        full_name: 'Aryan More',
        role: 'admin',
        age: 26,
        gender: 'Male',
        height: 175,
        weight: 70,
        blood_group: 'O+',
        activity_level: 'Moderate',
        water_goal_glasses: 8,
        step_goal: 10000,
        sleep_goal_hours: 8.0,
        emergency_contact_name: 'Family Member',
        emergency_contact_phone: '+91 98765 43210',
        allergies: 'None reported',
        is_active: true,
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
      localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(demoProfile));
      setUser(demoUser);
      setProfile(demoProfile);
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };
      if (data.user) {
        await fetchProfile(data.user.id, data.user.user_metadata?.full_name);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    if (isDemoMode) {
      localStorage.removeItem(DEMO_USER_KEY);
      localStorage.removeItem(DEMO_PROFILE_KEY);
      setUser(null);
      setProfile(null);
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    if (isDemoMode) {
      return { error: null };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return { error: new Error('No active profile') };

    // Security safeguard: regular users cannot modify role or is_active
    const sanitizedUpdates = { ...updates };
    if (profile.role !== 'admin') {
      delete sanitizedUpdates.role;
      delete sanitizedUpdates.is_active;
    }

    if (isDemoMode) {
      const updated = { ...profile, ...sanitizedUpdates, updated_at: new Date().toISOString() };
      setProfile(updated);
      localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(updated));
      return { error: null };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(sanitizedUpdates)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) return { error };
      if (data) setProfile(data as UserProfile);
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.user_metadata?.full_name);
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAdmin,
        isDemoMode,
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
