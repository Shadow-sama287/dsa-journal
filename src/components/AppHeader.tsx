import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';

interface AppHeaderProps {
  isMobileSimulator: boolean;
  onToggleMobileSimulator: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  isMobileSimulator,
  onToggleMobileSimulator,
}) => {
  const isNativeOrMobile = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches ||
    /android|iphone|ipad|ipod/i.test(navigator.userAgent)
  );

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 select-none transition-colors">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* Brand Zone: Sharp-cornered wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center font-mono text-xs font-bold border border-zinc-900 dark:border-zinc-100 rounded-none shadow-none">
            {'{}'}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
              DSA Journal
            </span>
          </div>
        </div>

        {/* Action Zone: Desktop Frame Toggle (only in desktop preview, never on mobile or in APK) */}
        {!isNativeOrMobile && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleMobileSimulator}
              className="hidden md:flex w-7 h-7 rounded-none border border-zinc-200 dark:border-zinc-800 items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
              title={isMobileSimulator ? 'Full Width' : 'Simulate Phone Frame'}
              aria-label="Toggle simulated phone frame"
            >
              {isMobileSimulator ? (
                <Monitor className="w-3.5 h-3.5" />
              ) : (
                <Smartphone className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
