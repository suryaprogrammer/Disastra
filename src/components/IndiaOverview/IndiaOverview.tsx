import React from 'react';
import {
  Map,
  ShieldAlert,
  RotateCcw,
  Layers,
  Cpu,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { DisasterOverviewStats } from '../../types/disaster';

interface IndiaOverviewProps {
  stats: DisasterOverviewStats;
}

export const IndiaOverview: React.FC<IndiaOverviewProps> = ({ stats }) => {
  return (
    <section id="india-overview-section" className="w-full border-b border-slate-200 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
            <span>National Scale Telemetry</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-800 font-bold">Comprehensive Subcontinental Coverage</span>
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            India Disaster Intelligence Overview
          </h2>
          <p className="text-sm text-slate-600">
            Real-time aggregate status across all 28 Indian States, 8 Union Territories, maritime EEZ corridors, and major river basins.
          </p>
        </div>

        {/* 6 Large Numerical Metric Tiles (Full Width requested in Prompt) */}
        <div className="mt-8 grid grid-cols-2 gap-px border border-slate-200 bg-slate-200 sm:grid-cols-3 lg:grid-cols-6 rounded overflow-hidden">
          {/* Tile 1: States Monitored */}
          <div className="bg-white p-5 flex flex-col justify-between">
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
              States Monitored
            </div>
            <div className="my-2">
              <span className="font-mono text-4xl font-bold tracking-tight text-slate-950 lg:text-5xl">
                {stats.statesMonitored}+
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Full Sovereign Territory
            </div>
          </div>

          {/* Tile 2: Union Territories */}
          <div className="bg-white p-5 flex flex-col justify-between">
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
              Union Territories
            </div>
            <div className="my-2">
              <span className="font-mono text-4xl font-bold tracking-tight text-slate-950 lg:text-5xl">
                {stats.unionTerritories}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Including Island Archipelagos
            </div>
          </div>

          {/* Tile 3: Active Flood Alerts */}
          <div className="bg-white p-5 flex flex-col justify-between">
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-rose-700">
              Active Flood Alerts
            </div>
            <div className="my-2">
              <span className="font-mono text-4xl font-bold tracking-tight text-rose-600 lg:text-5xl">
                {stats.activeFloodAlerts}
              </span>
            </div>
            <div className="text-[11px] text-rose-800 font-medium">
              4 Critical · 10 Elevated
            </div>
          </div>

          {/* Tile 4: Active Cyclone Systems */}
          <div className="bg-white p-5 flex flex-col justify-between">
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-700">
              Active Cyclone Systems
            </div>
            <div className="my-2">
              <span className="font-mono text-4xl font-bold tracking-tight text-amber-600 lg:text-5xl">
                {stats.activeCycloneSystems}
              </span>
            </div>
            <div className="text-[11px] text-amber-800 font-medium">
              1 Very Severe · 1 Deep Depr.
            </div>
          </div>

          {/* Tile 5: Regions Under Monitoring */}
          <div className="bg-white p-5 flex flex-col justify-between">
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
              Regions Monitored
            </div>
            <div className="my-2">
              <span className="font-mono text-4xl font-bold tracking-tight text-slate-950 lg:text-5xl">
                {stats.regionsUnderMonitoring}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Catchments & Coastlines
            </div>
          </div>

          {/* Tile 6: AI Analyses Today */}
          <div className="bg-white p-5 flex flex-col justify-between">
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-700">
              AI Analyses Today
            </div>
            <div className="my-2">
              <span className="font-mono text-4xl font-bold tracking-tight text-emerald-700 lg:text-5xl">
                {stats.aiAnalysesToday.toLocaleString()}
              </span>
            </div>
            <div className="text-[11px] text-emerald-800 font-medium">
              Inferences Verified (SIMULATED)
            </div>
          </div>
        </div>

        {/* Bottom Synoptic Grid Info Strip */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-4">
            <span>Connected Telemetry Sensors (SIMULATED): <strong className="text-slate-900">{stats.sensorFeedsConnected.toLocaleString()}</strong></span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Earth Observation Passes Today (SIMULATED): <strong className="text-slate-900">{stats.satellitePassesProcessed}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>National Registry Synced: {stats.lastSyncTimestamp}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
