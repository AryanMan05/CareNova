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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#17363A] rounded-3xl shadow-2xl border border-stone-200/80 dark:border-[#224A4F] w-full max-w-xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-stone-100 dark:border-[#224A4F] gap-3">
          <Search className="w-5 h-5 text-[#168B83] dark:text-[#64D8C1] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type to find any feature, tracker, or tool..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-xs outline-none text-stone-800 dark:text-[#EAF7F4] placeholder:text-stone-400 dark:placeholder:text-[#A9C5C1]/60 bg-transparent font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-[#EAF7F4] hover:bg-stone-100 dark:hover:bg-[#102D32] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-stone-50 dark:divide-[#224A4F]/40">
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
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-[#F2F9F8] dark:hover:bg-[#102D32]/80 group transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-[#102D32] text-[#168B83] dark:text-[#64D8C1] group-hover:bg-[#168B83] group-hover:text-white flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-800 dark:text-[#EAF7F4] group-hover:text-[#0B343B] dark:group-hover:text-[#64D8C1]">
                        {cmd.title}
                      </div>
                      <div className="text-[10px] text-stone-400 dark:text-[#A9C5C1]/70">{cmd.category}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-stone-400 dark:text-[#A9C5C1]/60 group-hover:text-[#168B83] dark:group-hover:text-[#64D8C1]">Open →</span>
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-stone-400 dark:text-[#A9C5C1]/60">
              No matching tools or pages found for "{query}"
            </div>
          )}
        </div>

        {/* Keyboard Footer */}
        <div className="bg-[#F2F9F8]/70 dark:bg-[#102D32]/60 px-4 py-2 border-t border-stone-100 dark:border-[#224A4F] flex items-center justify-between text-[11px] text-stone-500 dark:text-[#A9C5C1]">
          <span>Press <strong>Esc</strong> to close</span>
          <span>CareNova • Lead Architect: Aryan More</span>
        </div>
      </div>
    </div>
  );
};
