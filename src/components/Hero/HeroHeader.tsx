import React, { useState, useEffect } from 'react';
import { ShieldAlert, Radio, Activity, Compass, ArrowDownRight, Layers } from 'lucide-react';

interface HeroHeaderProps {
  onOpenMap: () => void;
  onViewAlerts: () => void;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({ onOpenMap, onViewAlerts }) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }) + ' · ' + now.toLocaleTimeString('en-IN', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full border-b border-slate-200 bg-white">
      {/* Top telemetry status strip */}
      <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-2 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-slate-900">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
              </span>
              SYSTEM OPERATIONAL
            </span>
            <span className="hidden text-slate-300 sm:inline" aria-hidden="true">|</span>
            <span className="hidden items-center gap-1 text-slate-600 sm:flex">
              <Radio className="h-3.5 w-3.5 text-slate-500" />
              Pan-India Monitoring Active (28 States · 8 UTs)
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-slate-500">
            <span className="hidden md:inline">Doppler Radar & SAR Live Ingestion</span>
            <span className="text-slate-300" aria-hidden="true">|</span>
            <span className="font-semibold text-slate-800">{currentTime || 'SYNCING CLOCK...'}</span>
          </div>
        </div>
      </div>

      {/* Main Hero Banner */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 lg:py-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-600 uppercase">
              <span>National Early Warning Infrastructure</span>
              <span aria-hidden="true">·</span>
              <span className="text-rose-600">Tier-1 Alert Level Active</span>
            </div>

            <h1 className="font-display text-5xl font-black tracking-tight text-slate-950 sm:text-6xl md:text-7xl">
              DISASTRA
            </h1>

            <p className="text-xl font-medium tracking-tight text-slate-800 sm:text-2xl">
              AI Disaster Detection & Early Warning System
            </p>

            <p className="text-base text-slate-600 sm:text-lg">
              <span className="font-semibold text-slate-900">Observe. Detect. Predict. Respond.</span>
              {' '}Continuous autonomous surveillance across India for cyclonic trajectories, riverine flood inundation, and extreme precipitative hazards.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onOpenMap}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded border border-slate-900 bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-slate-800 hover:border-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900"
              >
                <Compass className="h-4 w-4" />
                <span>OPEN LIVE MAP</span>
              </button>

              <button
                type="button"
                onClick={onViewAlerts}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-500"
              >
                <ShieldAlert className="h-4 w-4 text-rose-600" />
                <span>VIEW ALERTS</span>
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Activity className="h-3.5 w-3.5 text-blue-600" />
                <span>2 Active Maritime Systems</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-amber-600" />
                <span>14 River Basins Monitored</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
