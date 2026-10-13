// CareNova Main Application Container
// Integrated Forest Teal & Mint Theme, Responsive Collapsible Sidebar Navigation, and Route Controller
// Lead Architect: Aryan More

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HealthDataProvider } from './context/HealthDataContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthPortal } from './components/AuthPortal';
import { Navigation } from './components/Navigation';
import { CommandPalette } from './components/CommandPalette';
import { Dashboard } from './components/Dashboard';
import { TrackersHub } from './components/TrackersHub';
import { Calculators } from './components/Calculators';
import { DiseaseLibrary } from './components/DiseaseLibrary';
import { SymptomChecker } from './components/SymptomChecker';
import { AIAssistant } from './components/AIAssistant';
import { Medications } from './components/Medications';
import { EmergencyHub } from './components/EmergencyHub';
import { DoctorReports } from './components/DoctorReports';
import { ProfileView } from './components/ProfileView';
import { AdminPortal } from './components/AdminPortal';
import { Activity } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { isDark } = useTheme();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F9F8] dark:bg-[#0B1720] flex items-center justify-center text-[#183447] dark:text-[#EAF7F4]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#168B83] to-[#64D8C1] flex items-center justify-center animate-pulse text-white shadow-lg shadow-[#168B83]/25">
            <Activity className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#168B83] dark:text-[#64D8C1]">
            CareNova is securely loading your health records...
          </span>
        </div>
      </div>
    );
  }

  // Protected Route Wrapper - Redirect unauthenticated visitors to clean Auth Portal
  if (!user) {
    return <AuthPortal />;
  }

  return (
    <HealthDataProvider>
      <div className="min-h-screen bg-[#F2F9F8] dark:bg-[#0B1720] flex flex-col md:flex-row text-[#183447] dark:text-[#EAF7F4] selection:bg-[#168B83] selection:text-white transition-colors duration-200">
        {/* Modern Responsive Sidebar Navigation */}
        <Navigation
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />

        {/* Global Keyboard Shortcut Command Palette (Ctrl+K) */}
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onNavigate={(tab) => setCurrentTab(tab)}
        />

        {/* Main Content Area & Scrollable Viewport */}
        <div className="flex-1 flex flex-col min-w-0 h-auto md:h-screen md:overflow-y-auto">
          {/* Main Content Viewport */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {currentTab === 'dashboard' && <Dashboard onNavigate={(t) => setCurrentTab(t)} />}
            {currentTab === 'trackers' && <TrackersHub />}
            {currentTab === 'calculators' && <Calculators />}
            {currentTab === 'library' && <DiseaseLibrary />}
            {currentTab === 'symptom-checker' && <SymptomChecker />}
            {currentTab === 'ai-assistant' && <AIAssistant />}
            {currentTab === 'medications' && <Medications />}
            {currentTab === 'emergency' && <EmergencyHub />}
            {currentTab === 'reports' && <DoctorReports onNavigate={(t) => setCurrentTab(t)} />}
            {currentTab === 'profile' && <ProfileView />}
            {currentTab === 'admin' && <AdminPortal />}
          </main>

          {/* Unified Platform Footer */}
          <footer className="bg-white/80 dark:bg-[#17363A]/80 border-t border-[#D8ECE7] dark:border-[#234E54] py-5 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center text-xs text-[#476A76] dark:text-[#A9C5C1] flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>
                CareNova — Your Personal Health Companion &copy; {new Date().getFullYear()}
              </span>
              <span className="font-semibold text-[#168B83] dark:text-[#64D8C1]">
                Lead Architect & Creator: Aryan More
              </span>
            </div>
          </footer>
        </div>
      </div>
    </HealthDataProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
