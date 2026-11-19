import React from 'react';
import { Menu } from 'lucide-react';

export default function Header({ 
  setMobileOpen, 
  activeMenuTitle
}) {
  return (
    <header className="px-4 sm:px-8 pt-4 pb-2 flex items-center justify-between">
      {/* Left: Sunburst Logo + Page Title */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-2xl bg-white text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          aria-label="Buka Navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Sunburst Floral Icon from Reference */}
        <div className="flex w-9 h-9 rounded-2xl bg-[#315343] text-white items-center justify-center flex-shrink-0 shadow-xs">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" fill="currentColor" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
          </svg>
        </div>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#1a2e26] tracking-tight">
            {activeMenuTitle || 'KDMP Social Media Analytics Dashboard'}
          </h1>
        </div>
      </div>
    </header>
  );
}
