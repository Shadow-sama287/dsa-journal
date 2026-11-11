import React from 'react';
import { BookOpen, Calendar, Database, Settings } from 'lucide-react';

export type TabId = 'home' | 'calendar' | 'database' | 'settings';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabId; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Journal', icon: BookOpen },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (tab: TabId) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(8);
      } catch {
        // ignore
      }
    }
    onTabChange(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 pb-safe select-none transition-colors">
      <div className="max-w-md mx-auto grid grid-cols-4">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center py-1.5 px-1 rounded-none border-t-2 transition-all ${
                isActive
                  ? 'border-zinc-900 dark:border-zinc-100 text-zinc-950 dark:text-zinc-50 font-bold bg-zinc-50/50 dark:bg-zinc-900/30'
                  : 'border-transparent text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              } active:scale-95`}
            >
              <IconComponent
                className={`w-4 h-4 transition-transform ${
                  isActive ? 'scale-105 stroke-[2.2]' : 'scale-100 stroke-[1.6]'
                }`}
              />
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
