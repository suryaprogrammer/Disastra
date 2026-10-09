import React, { useState } from 'react';
import {
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  BarChart3,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { RiskSubIndex } from '../../types/disaster';
import { mockRiskIndices } from '../../data/mockRisk';

interface RiskIntelligenceProps {
  riskIndices: RiskSubIndex[];
}

export const RiskIntelligence: React.FC<RiskIntelligenceProps> = ({ riskIndices: initialRiskIndices }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const riskIndices = isDemoMode ? mockRiskIndices : initialRiskIndices;
  const [selectedCategory, setSelectedCategory] = useState<string>(riskIndices[0]?.category || '');

  // Reset selected category if risk indices array changes (like toggling demo mode)
  React.useEffect(() => {
    if (riskIndices.length > 0) {
      if (!riskIndices.find(r => r.category === selectedCategory)) {
        setSelectedCategory(riskIndices[0].category);
      }
    }
  }, [riskIndices, selectedCategory]);

  // Discrete segmented block meter
  const renderBlockMeter = (score: number, level: string) => {
    const totalBlocks = 10;
    const filledBlocks = Math.round((score / 100) * totalBlocks);

    const getBlockColor = (index: number) => {
      if (index >= filledBlocks) return 'bg-slate-200 border-slate-200';
      if (level === 'CRITICAL') return 'bg-rose-600 border-rose-600';
      if (level === 'HIGH') return 'bg-amber-500 border-amber-500';
      if (level === 'MODERATE') return 'bg-yellow-500 border-yellow-500';
      return 'bg-emerald-600 border-emerald-600';
    };

    return (
      <div className="flex items-center gap-1.5">
        <div className="flex gap-1" role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
          {Array.from({ length: totalBlocks }).map((_, i) => (
            <div
              key={i}
              className={`h-4 w-3.5 rounded-xs border transition-colors ${getBlockColor(i)}`}
            />
          ))}
        </div>
        <span className="font-mono text-xs font-semibold text-slate-900 ml-2">
          {score}/100
        </span>
      </div>
    );
  };

  const activeIndex = riskIndices.find((r) => r.category === selectedCategory) || riskIndices[0];

  // Map to standardized levels: LOW, MODERATE, HIGH, CRITICAL
  const getLevelBadge = (level: string) => {
    switch (level.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <section id="risk-intelligence-section" className="w-full border-b border-slate-200 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
            <span>Neural Risk Synthesis</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-800 font-bold">National Disaster Vulnerability Index</span>
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Risk & Severity Intelligence
          </h2>
          <p className="text-sm text-slate-600">
            Compound multi-hazard scoring synthesizing precipitation rates, tidal backwater, and atmospheric cyclogenesis.
          </p>
        </div>

        {/* Index Grid */}
        {riskIndices.length === 0 ? (
          <div className="mt-8 flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center">
            <ShieldAlert className="mb-3 h-8 w-8 text-slate-400" />
            <h4 className="text-sm font-semibold text-slate-900">Live Risk Indices Unavailable</h4>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              The neural risk synthesis backend is currently offline. No real-time telemetry available.
            </p>
            <button
              onClick={() => setIsDemoMode(true)}
              className="mt-4 cursor-pointer rounded bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300 transition-colors"
            >
              Load Demo Risk Profile
            </button>
          </div>
        ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Table / Scientific Meter Deck (7 cols) */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-700">
                  NATIONAL DISASTER RISK SUB-INDICES {isDemoMode ? '(DEMO / PREVIEW)' : '(LIVE)'}
                </span>
                <span className="font-mono text-[10px] text-slate-500 flex items-center gap-2">
                  {isDemoMode && (
                    <button 
                      onClick={() => setIsDemoMode(false)}
                      className="cursor-pointer font-bold text-rose-600 underline"
                    >
                      Turn Off Demo Data
                    </button>
                  )}
                  {isDemoMode ? 'DEMO DATA' : 'LIVE DATA'}
                </span>
              </div>

              {/* Data-driven scientific meter rows */}
              <div className="space-y-4">
                {riskIndices.map((risk) => {
                  const isSelected = risk.category === selectedCategory;
                  return (
                    <div
                      key={risk.category}
                      onClick={() => setSelectedCategory(risk.category)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${
                        isSelected
                          ? 'border-slate-900 bg-white shadow-xs'
                          : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-display text-base font-bold text-slate-950">
                              {risk.category}
                            </span>
                            <span
                              className={`rounded border px-2 py-0.5 font-mono text-[10px] font-bold ${getLevelBadge(
                                risk.level
                              )}`}
                            >
                              {risk.level}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">
                            Focal Zone: <strong className="text-slate-700">{risk.primaryZone}</strong>
                          </div>
                        </div>

                        {/* Discrete optical block visualization */}
                        <div className="flex flex-col items-end gap-1">
                          {renderBlockMeter(risk.score, risk.level)}
                          <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                            {risk.trend === 'INCREASING' && (
                              <span className="flex items-center text-rose-600 font-semibold">
                                <TrendingUp className="h-3 w-3 mr-0.5" /> Trend Rising
                              </span>
                            )}
                            {risk.trend === 'STEADY' && (
                              <span className="flex items-center text-slate-500">
                                <Minus className="h-3 w-3 mr-0.5" /> Steady
                              </span>
                            )}
                            {risk.trend === 'DECREASING' && (
                              <span className="flex items-center text-emerald-600">
                                <TrendingDown className="h-3 w-3 mr-0.5" /> Receding
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-3 text-[11px] font-mono flex justify-between">
              <span className="text-slate-500">Standard: NDMA Hazard Scoring Matrix v3</span>
              {isDemoMode ? (
                <span className="text-amber-600 font-bold">Demo / Static Data Only</span>
              ) : (
                <span className="text-emerald-600 font-bold">Live Synced Data</span>
              )}
            </div>
          </div>

          {/* Right Selected Risk Detail Deck (5 cols) */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-slate-700" />
                  <span className="font-semibold text-slate-900 text-sm">
                    {activeIndex?.category} Detail Assessment
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-slate-900">
                  Risk Score: {activeIndex?.score != null ? `${activeIndex.score}/100` : 'N/A'}
                </span>
              </div>

              {/* Exact Fields Requested: Risk Score, Risk Level, Confidence, Affected Area, Evidence */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[11px] font-medium text-slate-500 uppercase">Risk Level</div>
                  <div className="mt-1 font-mono text-lg font-bold text-slate-900">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${getLevelBadge(activeIndex?.level || 'LOW')}`}>
                      {activeIndex?.level}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">Severity Indicator</div>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[11px] font-medium text-slate-500 uppercase">Confidence</div>
                  <div className="mt-1 font-mono text-lg font-bold text-slate-700">
                    N/A
                  </div>
                  <div className="text-[10px] text-slate-400">Ensemble Confidence</div>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[11px] font-medium text-slate-500 uppercase">Affected Area</div>
                  <div className="mt-1 font-mono text-base font-bold text-slate-900 truncate">
                    {activeIndex?.primaryZone}
                  </div>
                  <div className="text-[10px] text-slate-400">Est. {activeIndex?.affectedPopulationEst}</div>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[11px] font-medium text-slate-500 uppercase">Severity Index</div>
                  <div className="mt-1 font-mono text-lg font-bold text-rose-600">
                    {activeIndex?.score != null ? `${activeIndex.score} / 100` : 'N/A'}
                  </div>
                  <div className="text-[10px] text-slate-400">Multi-factor score</div>
                </div>
              </div>

              {/* Detection Evidence */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-slate-600" />
                  <span>Detection Evidence & Sensor Input {isDemoMode ? '(Demo)' : '(Live)'}</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1 font-mono list-disc pl-4">
                  <li>Radar Runoff Saturation: N/A</li>
                  <li>Tidal Backwater Obstruction: N/A</li>
                  <li>Infrastructure Vulnerability: N/A</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] font-mono flex justify-between">
              {isDemoMode ? (
                <span className="text-amber-600 font-bold">Demo / Static Data Only</span>
              ) : (
                <span className="text-emerald-600 font-bold">Architecture synced with FastAPI engine</span>
              )}
            </div>
          </div>
        </div>
        )}
      </div>
    </section>
  );
};
