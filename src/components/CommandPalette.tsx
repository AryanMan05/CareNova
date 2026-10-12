// CareNova Global Command Palette (Ctrl+K / Cmd+K)
// Quick navigation across calculators, trackers, disease library, and actions
// Lead Architect: Aryan More

import React, { useState, useEffect } from 'react';
import { Search, Activity, Droplets, BookOpen, AlertTriangle, Calculator, FileText, User, X, MessageSquare, Pill } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tabId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');

  const commands = [
    { id: 'dashboard', title: 'Dashboard & Daily Vitals', category: 'Navigation', icon: Activity },
    { id: 'trackers', title: 'Health Trackers (Water, Weight, Sleep, Steps)', category: 'Daily Tracking', icon: Droplets },
    { id: 'calculators', title: 'Health & Calorie Calculators (Daily Calories, BMI)', category: 'Calculators', icon: Calculator },
    { id: 'library', title: 'Health & Condition Library', category: 'Knowledge', icon: BookOpen },
    { id: 'symptom-checker', title: 'Check Symptoms & Emergency Guidance', category: 'Health Check', icon: AlertTriangle },
    { id: 'ai-assistant', title: 'CareNova AI Health Assistant', category: 'Assistant', icon: MessageSquare },
    { id: 'medications', title: 'Prescriptions & Daily Medicine Checklist', category: 'Medicines', icon: Pill },
    { id: 'emergency', title: 'Emergency Helplines (112, 108, KIRAN)', category: 'Emergency', icon: AlertTriangle },
    { id: 'reports', title: 'Download Doctor Report (PDF)', category: 'Reports', icon: FileText },
    { id: 'profile', title: 'My Health Profile & Personal Details', category: 'Account', icon: User },
    { id: 'admin', title: 'Admin Governance Portal', category: 'Admin', icon: Activity },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200/80 w-full max-w-xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-stone-100 gap-3">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type to find any feature, tracker, or tool..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-xs outline-none text-stone-800 placeholder:text-stone-400 bg-transparent font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-stone-50">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    onNavigate(cmd.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-indigo-50/70 group transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-800 group-hover:text-indigo-900">
                        {cmd.title}
                      </div>
                      <div className="text-[10px] text-stone-400">{cmd.category}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-stone-400 group-hover:text-indigo-600">Open →</span>
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-stone-400">
              No matching tools or pages found for "{query}"
            </div>
          )}
        </div>

        {/* Keyboard Footer */}
        <div className="bg-stone-50/70 px-4 py-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
          <span>Press <strong>Esc</strong> to close</span>
          <span>CareNova • Lead Architect: Aryan More</span>
        </div>
      </div>
    </div>
  );
};
