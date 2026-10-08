import React, { useState } from 'react';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock,
  Filter,
  Plus,
  Compass,
  Radio,
  RefreshCw,
} from 'lucide-react';
import { AlertRecord } from '../../types/disaster';
import { disastraApi } from '../../services/api';

interface AlertTimelineProps {
  initialAlerts: any[];
  onSelectEventLocation?: (coords: [number, number]) => void;
}

export const AlertTimeline: React.FC<AlertTimelineProps> = ({
  initialAlerts,
  onSelectEventLocation,
}) => {
  const [alerts, setAlerts] = useState<any[]>(initialAlerts);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAlerts = async () => {
    setIsRefreshing(true);
    try {
      const data = await disastraApi.getAlerts();
      setAlerts(data);
    } catch (e) {
      console.error(e);
    }
    setIsRefreshing(false);
  };

  const handleTestAlert = async () => {
    setIsRefreshing(true);
    try {
      await disastraApi.testAlert();
      await refreshAlerts();
    } catch (e) {
      console.error(e);
      setIsRefreshing(false);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    // Map severity filter to our new priorities or old categories if mixed
    const severity = a.priority || a.severity;
    if (filterSeverity === 'CRITICAL') return severity === 'CRITICAL';
    if (filterSeverity === 'HIGH') return severity === 'HIGH';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">DELIVERED</span>;
      case 'SENT':
        return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">SENT</span>;
      case 'FAILED':
        return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">FAILED</span>;
      case 'SKIPPED':
        return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">NOT CONFIGURED / SKIPPED</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">{status}</span>;
    }
  };

  return (
    <section id="alert-timeline-section" className="w-full border-b border-slate-200 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <span>Chronological Event Ledger</span>
              <span aria-hidden="true">·</span>
              <span className="text-rose-600 font-bold">CAP-XML Emergency Dispatch</span>
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Alert & Early Warning Timeline
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Audit trail of autonomous sensor detections, computer vision confirmations, and dispatched early warnings.
            </p>
          </div>

          {/* Filter & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded border border-slate-300 p-0.5 bg-slate-100 text-xs">
              {['ALL', 'CRITICAL', 'HIGH'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterSeverity(cat)}
                  className={`cursor-pointer rounded px-2.5 py-1 font-semibold transition-colors ${
                    filterSeverity === cat
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={refreshAlerts}
              disabled={isRefreshing}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
            <button
              type="button"
              onClick={handleTestAlert}
              disabled={isRefreshing}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-slate-900 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Trigger Test Alert</span>
            </button>
          </div>
        </div>

        {/* Timeline Stream */}
        <div className="mt-8 relative border-l-2 border-slate-200 pl-6 ml-4 space-y-6">
          {filteredAlerts.length === 0 && (
            <div className="text-slate-500 text-sm py-4">No alerts found.</div>
          )}
          {filteredAlerts.map((evt) => {
            const isNewType = !!evt.alert_id;
            const id = evt.alert_id || evt.id;
            const severity = evt.priority || evt.severity;
            const isCritical = severity === 'CRITICAL';
            const isHigh = severity === 'HIGH';
            
            // Format time display
            let timeDisplay = evt.timeDisplay;
            if (isNewType && evt.created_at) {
              const d = new Date(evt.created_at);
              timeDisplay = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';
            }

            return (
              <div
                key={id}
                className="relative group transition-all"
              >
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white shadow-xs ${
                    isCritical
                      ? 'bg-rose-600 ring-2 ring-rose-200'
                      : isHigh
                      ? 'bg-amber-500'
                      : 'bg-sky-500'
                  }`}
                />

                {/* Event Card */}
                <div
                  className={`rounded border p-4 transition-all ${
                    isCritical
                      ? 'border-rose-200 bg-rose-50/30'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {timeDisplay}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-display text-sm font-bold tracking-tight text-slate-950">
                        {evt.headline || evt.title}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.2 font-mono text-[9px] font-bold ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800'
                            : isHigh
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {severity}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      {isNewType && (
                        <div className="flex flex-col items-end gap-1">
                           <div className="flex items-center gap-2">
                             <span className="text-slate-500">Channels:</span>
                             <span className="font-bold text-slate-700">{(evt.channels || []).join(', ')}</span>
                           </div>
                           <div className="flex items-center gap-2 text-[10px]">
                             <span className="text-slate-500">Delivery Status:</span>
                             {getStatusBadge(evt.status)}
                           </div>
                        </div>
                      )}
                      
                      {!isNewType && evt.coordinates && onSelectEventLocation && (
                        <button
                          type="button"
                          onClick={() => onSelectEventLocation(evt.coordinates!)}
                          className="cursor-pointer font-mono text-[11px] text-sky-700 hover:text-sky-900 flex items-center gap-1"
                        >
                          <Compass className="h-3 w-3" />
                          <span>View on Map</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                    {evt.message || evt.description}
                  </div>

                  <div className="mt-3 flex flex-col gap-1 border-t border-slate-100 pt-2 text-[11px] font-mono text-slate-400">
                    {isNewType ? (
                      <>
                        <div className="flex justify-between">
                          <span>Observation ID: <strong className="text-slate-700">{evt.observation_id}</strong></span>
                          <span>Provider: <strong className="text-slate-700">{evt.provider}</strong></span>
                        </div>
                        {evt.provider_message_id && (
                          <div>Provider SID: <strong className="text-slate-500">{evt.provider_message_id}</strong></div>
                        )}
                        {evt.error && (
                          <div className="text-red-500">Error: {evt.error}</div>
                        )}
                      </>
                    ) : (
                      <div className="flex justify-between">
                        <span>Region: <strong className="text-slate-700">{evt.region}</strong></span>
                        <span>Source: {evt.source}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-mono text-slate-400">
          <span>Alerts Endpoints: GET /api/alerts</span>
          <span>CAP-XML v1.2 Protocol Compliant</span>
        </div>
      </div>
    </section>
  );
};
