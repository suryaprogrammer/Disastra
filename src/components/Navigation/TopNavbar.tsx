import React from 'react';
import { ShieldAlert, Compass, Radio } from 'lucide-react';

interface TopNavbarProps {
  onNavigate: (sectionId: string) => void;
  activeAlertCount?: number;
  alertError?: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onNavigate, activeAlertCount, alertError }) => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Zone 1: Single text element Brand Zone */}
        <a
          href="/"
          className="font-display text-xl font-black tracking-tight text-slate-950 hover:text-slate-800 transition-colors"
        >
          DISASTRA
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => onNavigate('live-map-section')}
            className="cursor-pointer hover:text-slate-950 transition-colors whitespace-nowrap"
          >
            Live Map
          </button>

          <button
            type="button"
            onClick={() => onNavigate('flood-detection-section')}
            className="cursor-pointer hover:text-slate-950 transition-colors whitespace-nowrap"
          >
            Flood Inundation
          </button>
          <button
            type="button"
            onClick={() => onNavigate('risk-intelligence-section')}
            className="cursor-pointer hover:text-slate-950 transition-colors whitespace-nowrap"
          >
            Risk Index
          </button>
          <button
            type="button"
            onClick={() => onNavigate('autonomous-agents-section')}
            className="cursor-pointer hover:text-slate-950 transition-colors whitespace-nowrap"
          >
            AI Agents
          </button>
          <button
            type="button"
            onClick={() => onNavigate('alert-timeline-section')}
            className="cursor-pointer hover:text-slate-950 transition-colors whitespace-nowrap"
          >
            Timeline
          </button>
        </div>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('alert-timeline-section')}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              alertError
                ? 'border-slate-300 bg-slate-50 text-slate-500 hover:bg-slate-100'
                : 'border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            <ShieldAlert className={`h-3.5 w-3.5 ${alertError ? 'text-slate-400' : 'text-rose-600'}`} />
            <span>Active Alerts {alertError ? '(ERR)' : `(${activeAlertCount || 0})`}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('live-map-section')}
            className="hidden sm:inline-flex cursor-pointer items-center gap-1.5 rounded border border-slate-900 bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Command Map</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
