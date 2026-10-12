// Main Application Component
// Seamless single page architecture, command palette integration, navigation, and protected view routing
// Lead Architect: Aryan More

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HealthDataProvider } from './context/HealthDataContext';
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
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center text-stone-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center animate-pulse text-white shadow-lg shadow-indigo-600/20">
            <Activity className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
            CareNova is loading your health records...
          </span>
        </div>
      </div>
    );
  }

  // AUTH-6: Protected Route Wrapper - Redirect unauthenticated users to login
  if (!user) {
    return <AuthPortal />;
  }

  return (
    <HealthDataProvider>
      <div className="min-h-screen bg-[#faf9f6] flex flex-col selection:bg-indigo-500 selection:text-white text-[#24272c]">
        {/* Navigation Top Bar */}
        <Navigation
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        {/* Global Keyboard Shortcut Command Palette */}
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onNavigate={(tab) => setCurrentTab(tab)}
        />

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
          {currentTab === 'reports' && <DoctorReports />}
          {currentTab === 'profile' && <ProfileView />}
          {currentTab === 'admin' && <AdminPortal />}
        </main>

        {/* Platform Footer */}
        <footer className="bg-white/80 border-t border-stone-200/80 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              CareNova — Your Personal Health Companion &copy; {new Date().getFullYear()}
            </span>
            <span className="font-semibold text-indigo-700">
              Lead Architect & Creator: Aryan More
            </span>
          </div>
        </footer>
      </div>
    </HealthDataProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
