// CareNova Modern Sidebar Navigation System
// Dark Teal theme with Mint highlights, grouped navigation, collapsible desktop mode, and responsive mobile drawer
// Lead Architect: Aryan More

import React, { useState } from 'react';
import {
  Activity,
  User,
  FileText,
  Pill,
  Droplets,
  Calculator,
  BookOpen,
  AlertTriangle,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  LogOut,
  Search,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenCommandPalette: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  setCurrentTab,
  onOpenCommandPalette,
  sidebarCollapsed,
  setSidebarCollapsed,
}) => {
  const { user, profile, signOut, isAdmin, isDemoMode } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Grouped Navigation Items
  const navGroups = [
    {
      group: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Activity, desc: 'Daily overview' },
        { id: 'profile', label: 'My Profile', icon: User, desc: 'Personal details' },
        { id: 'reports', label: 'Doctor Reports', icon: FileText, desc: 'Health summary & PDF' },
        { id: 'medications', label: 'Prescriptions', icon: Pill, desc: 'Daily medicine checklist' },
      ],
    },
    {
      group: 'HEALTH TOOLS',
      items: [
        { id: 'trackers', label: 'Health Trackers', icon: Droplets, desc: 'Water, sleep, BP & steps' },
        { id: 'calculators', label: 'Health Calculators', icon: Calculator, desc: 'BMI, calories & heart rate' },
        { id: 'library', label: 'Health Library', icon: BookOpen, desc: 'Conditions explained simply' },
        { id: 'symptom-checker', label: 'Check Symptoms', icon: AlertTriangle, desc: 'Quick guidance' },
        { id: 'ai-assistant', label: 'AI Health Assistant', icon: MessageSquare, desc: 'Ask health questions' },
      ],
    },
    {
      group: 'SUPPORT',
      items: [
        { id: 'emergency', label: 'Emergency Helplines', icon: ShieldAlert, desc: 'Instant SOS & 112' },
      ],
    },
  ];

  // Admin Portal (Restricted to Administrators only)
  if (isAdmin) {
    navGroups.push({
      group: 'ADMINISTRATION',
      items: [
        { id: 'admin', label: 'Admin Dashboard', icon: ShieldCheck, desc: 'Patient management' },
      ],
    });
  }

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  const displayName = profile?.full_name || user?.full_name || 'My Account';
  const displayRole = isAdmin ? 'Admin' : 'Patient';

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. MOBILE TOP HEADER BAR (Hidden on desktop)
          ───────────────────────────────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-40 bg-[#0B343B] dark:bg-[#09141C] border-b border-[#134B54] dark:border-[#14353B] px-4 py-3 flex items-center justify-between text-white shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 rounded-xl bg-[#10434C] dark:bg-[#17363A] text-[#A8E6D5] hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#168B83] to-[#64D8C1] flex items-center justify-center text-white shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">CareNova</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle (Mobile) */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            className="p-2 rounded-xl bg-[#10434C] dark:bg-[#17363A] text-[#A8E6D5] hover:text-white transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-sky-200" />}
          </button>

          {/* User Profile Avatar (Mobile) */}
          <button
            onClick={() => handleNavClick('profile')}
            className="w-8 h-8 rounded-xl bg-[#168B83] text-white flex items-center justify-center text-xs font-bold shadow-xs"
          >
            {displayName.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. MOBILE OFF-CANVAS DRAWER
          ───────────────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] bg-[#0B343B] dark:bg-[#09141C] text-[#EAF7F4] flex flex-col h-full shadow-2xl z-10 border-r border-[#134B54] dark:border-[#14353B] animate-fadeIn">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#134B54] dark:border-[#14353B] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#168B83] to-[#64D8C1] flex items-center justify-center text-white shadow-md">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white leading-tight">CareNova</h2>
                  <span className="text-[10px] text-[#A8E6D5] font-semibold uppercase tracking-wider block">
                    Health Companion
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-[#8FB4AD] hover:text-white hover:bg-[#10434C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <div className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin">
              {navGroups.map((group) => (
                <div key={group.group} className="space-y-1">
                  <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#8FB4AD] dark:text-[#789B96]">
                    {group.group}
                  </span>
                  <div className="space-y-0.5 mt-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-[#168B83] text-white shadow-sm'
                              : 'text-[#EAF7F4] hover:bg-[#10434C] dark:hover:bg-[#17363A]'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#A8E6D5]'}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Drawer Footer */}
            <div className="p-3 border-t border-[#134B54] dark:border-[#14353B] space-y-2 bg-[#08292F] dark:bg-[#071017]">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#10434C] dark:bg-[#17363A] text-xs font-semibold text-[#EAF7F4]"
              >
                <span className="flex items-center gap-2">
                  {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-sky-200" />}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </span>
                <span className="text-[10px] text-[#A8E6D5] uppercase font-bold">
                  {isDark ? 'Dark Active' : 'Light Active'}
                </span>
              </button>

              {/* Sign Out Button */}
              <button
                onClick={signOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. DESKTOP PERMANENT SIDEBAR NAVIGATION
          ───────────────────────────────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col h-screen sticky top-0 bg-[#0B343B] dark:bg-[#09141C] border-r border-[#134B54] dark:border-[#14353B] text-[#EAF7F4] transition-all duration-300 z-30 select-none ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 px-4 flex items-center justify-between border-b border-[#134B54] dark:border-[#14353B]">
          <div
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-3 cursor-pointer group ${
              sidebarCollapsed ? 'justify-center w-full' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#168B83] via-[#1aa39a] to-[#64D8C1] flex items-center justify-center text-white shadow-md shadow-[#168B83]/20 group-hover:scale-105 transition-transform shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <span className="text-lg font-black tracking-tight text-white block truncate leading-snug">
                  CareNova
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8E6D5] block truncate">
                  Health Companion
                </span>
              </div>
            )}
          </div>

          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              title="Collapse sidebar"
              className="p-1.5 rounded-lg text-[#8FB4AD] hover:text-white hover:bg-[#10434C] dark:hover:bg-[#17363A] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed Expand Button */}
        {sidebarCollapsed && (
          <div className="py-2 flex justify-center border-b border-[#134B54]/60">
            <button
              onClick={() => setSidebarCollapsed(false)}
              title="Expand sidebar"
              className="p-1.5 rounded-lg text-[#8FB4AD] hover:text-white hover:bg-[#10434C] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* User Card */}
        <div
          onClick={() => setCurrentTab('profile')}
          className={`p-3 mx-3 my-2.5 rounded-2xl bg-[#08292F] dark:bg-[#071017] border border-[#134B54]/80 dark:border-[#14353B] flex items-center gap-3 cursor-pointer hover:border-[#168B83] transition-all ${
            sidebarCollapsed ? 'justify-center p-2 mx-2' : ''
          }`}
          title={displayName}
        >
          <div className="w-9 h-9 rounded-xl bg-[#168B83] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
            {displayName.charAt(0).toUpperCase()}
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <span className="font-bold text-xs text-white block truncate leading-tight">
                {displayName}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    isAdmin ? 'bg-amber-400' : 'bg-[#64D8C1]'
                  }`}
                />
                <span className="text-[10px] text-[#A8E6D5] font-semibold uppercase tracking-wider">
                  {displayRole}
                </span>
                {isDemoMode && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                    Offline
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Search Shortcut */}
        {!sidebarCollapsed && (
          <div className="px-3 mb-2">
            <button
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#08292F]/60 hover:bg-[#10434C] text-[#8FB4AD] hover:text-white text-xs border border-[#134B54]/60 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-[#A8E6D5]" />
                <span className="text-[11px]">Quick search...</span>
              </span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#0B343B] font-mono text-[9px] text-[#A8E6D5] border border-[#134B54]">
                Ctrl+K
              </kbd>
            </button>
          </div>
        )}

        {/* Main Navigation Scroll Area */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-4 scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#8FB4AD] dark:text-[#789B96]">
                  {group.group}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentTab(item.id)}
                      title={sidebarCollapsed ? `${item.label} — ${item.desc}` : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-[#168B83] text-white shadow-sm shadow-[#168B83]/30 font-bold'
                          : 'text-[#EAF7F4] hover:bg-[#10434C] dark:hover:bg-[#17363A] hover:text-white'
                      } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-[#A8E6D5]'
                        }`}
                      />
                      {!sidebarCollapsed && (
                        <div className="text-left flex-1 truncate">
                          <span className="block leading-tight">{item.label}</span>
                        </div>
                      )}
                      {!sidebarCollapsed && isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#A8E6D5] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-[#134B54] dark:border-[#14353B] space-y-2 bg-[#08292F] dark:bg-[#071017]">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            title={
              sidebarCollapsed
                ? `Switch to ${isDark ? 'Light' : 'Dark'} Mode`
                : undefined
            }
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#10434C] dark:bg-[#17363A] hover:bg-[#14535F] dark:hover:bg-[#1d4348] text-[#EAF7F4] text-xs font-semibold transition-all ${
              sidebarCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-300 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-sky-200 shrink-0" />
              )}
              {!sidebarCollapsed && (
                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              )}
            </div>
            {!sidebarCollapsed && (
              <span className="text-[10px] uppercase font-bold text-[#A8E6D5]">
                {isDark ? 'Dark' : 'Light'}
              </span>
            )}
          </button>

          {/* Sign Out Button */}
          <button
            onClick={signOut}
            title={sidebarCollapsed ? 'Sign Out of CareNova' : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors ${
              sidebarCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
