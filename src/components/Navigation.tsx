// CareNova Navigation & Top Header Bar
// Fresh identity: Soft ivory backdrop, Indigo & Periwinkle accents, simple friendly labels
// Lead Architect: Aryan More

import React from 'react';
import {
  Activity,
  Droplets,
  Calculator,
  BookOpen,
  AlertTriangle,
  MessageSquare,
  Pill,
  FileText,
  ShieldAlert,
  LogOut,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenCommandPalette: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  setCurrentTab,
  onOpenCommandPalette,
}) => {
  const { profile, signOut, isAdmin, isDemoMode } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, description: 'Your health overview' },
    { id: 'trackers', label: 'Health Trackers', icon: Droplets, description: 'Water, sleep, BP & steps' },
    { id: 'calculators', label: 'Health Calculators', icon: Calculator, description: 'Calories, BMI & heart rate' },
    { id: 'library', label: 'Health Library', icon: BookOpen, description: 'Conditions explained simply' },
    { id: 'symptom-checker', label: 'Check Symptoms', icon: AlertTriangle, description: 'Quick symptom guidance' },
    { id: 'ai-assistant', label: 'AI Health Assistant', icon: MessageSquare, description: 'Ask health questions' },
    { id: 'medications', label: 'Prescriptions', icon: Pill, description: 'Daily medicine checklist' },
    { id: 'emergency', label: 'Emergency Helplines', icon: ShieldAlert, description: 'Immediate contacts & 112' },
    { id: 'reports', label: 'Doctor Report', icon: FileText, description: 'Download PDF summary' },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin Panel', icon: Activity, description: 'System overview' });
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-stone-900 group-hover:text-indigo-600 transition-colors">
                  CareNova
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-indigo-500">
                  Your Personal Health Companion
                </span>
              </div>
            </button>

            {isDemoMode && (
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                Offline Demo Mode
              </span>
            )}
          </div>

          {/* Quick Search Shortcut */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100/80 hover:bg-stone-200/80 text-stone-600 text-xs transition-colors border border-stone-200/70"
          >
            <Search className="w-3.5 h-3.5 text-stone-400" />
            <span>Search features or jump to...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white font-mono text-[10px] text-stone-500 shadow-2xs border border-stone-200">
              Ctrl+K
            </kbd>
          </button>

          {/* Right Profile & Logout Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentTab('profile')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                currentTab === 'profile'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="hidden sm:inline">{profile?.full_name || 'My Profile'}</span>
            </button>

            <button
              onClick={signOut}
              title="Sign Out"
              className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Tabs with clear, friendly labels */}
        <nav className="flex space-x-1 overflow-x-auto py-1.5 scrollbar-none border-t border-stone-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
