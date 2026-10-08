import React, { useState, useEffect } from 'react';
import {
  Bot,
  Activity,
  Terminal,
  Play,
  Square,
  RefreshCw
} from 'lucide-react';
import { disastraApi } from '../../services/api';

interface AgentStatusProps {
  agentStatus: any;
}

export const AgentStatus: React.FC<AgentStatusProps> = ({ agentStatus: initialAgentStatus }) => {
  const [statusData, setStatusData] = useState<any>(initialAgentStatus);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    setStatusData(initialAgentStatus);
  }, [initialAgentStatus]);

  const refreshStatus = async () => {
    try {
      const data = await disastraApi.getAgentsStatus();
      setStatusData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStart = async () => {
    setLoadingAction('start');
    try {
      await disastraApi.startAgent();
      await refreshStatus();
    } catch (e) {
      console.error(e);
    }
    setLoadingAction(null);
  };

  const handleStop = async () => {
    setLoadingAction('stop');
    try {
      await disastraApi.stopAgent();
      await refreshStatus();
    } catch (e) {
      console.error(e);
    }
    setLoadingAction(null);
  };

  const handleCycle = async () => {
    setLoadingAction('cycle');
    try {
      await disastraApi.cycleAgent();
      await refreshStatus();
    } catch (e) {
      console.error(e);
    }
    setLoadingAction(null);
  };

  const status = statusData?.status || 'IDLE';
  const state = statusData?.last_cycle;

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'MONITORING':
      case 'RUNNING':
      case 'WAITING':
      case 'ANALYZING':
        return (
          <span className="inline-flex items-center gap-1.5 rounded border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
            STATUS: {s}
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1.5 rounded border border-red-300 bg-red-50 px-2 py-0.5 font-mono text-[11px] font-bold text-red-800">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
            STATUS: ERROR
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700">
            STATUS: {s}
          </span>
        );
    }
  };

  const getActionBadge = (action: string) => {
    if (action === 'PREPARE_ALERT') {
      return <span className="text-red-400 font-bold">PREPARE_ALERT</span>;
    } else if (action === 'REANALYZE') {
      return <span className="text-amber-400 font-bold">REANALYZE</span>;
    } else if (action === 'MONITOR') {
      return <span className="text-sky-400 font-bold">MONITOR</span>;
    }
    return <span className="text-slate-400 font-bold">NO_ACTION</span>;
  };

  return (
    <section id="autonomous-agents-section" className="w-full border-b border-slate-200 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
            <span>Autonomous Intelligence Fabric</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-800 font-bold">Continuous Monitoring</span>
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Autonomous Monitoring Agent
          </h2>
          <p className="text-sm text-slate-600">
            Controlled autonomous monitoring and decision orchestration using available live weather and newly available disaster observations.
          </p>
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleCycle}
            disabled={loadingAction !== null}
            className="flex items-center gap-2 rounded bg-slate-800 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loadingAction === 'cycle' ? 'animate-spin' : ''}`} /> Manual Cycle
          </button>
          <button
            onClick={refreshStatus}
            disabled={loadingAction !== null}
            className="flex items-center gap-2 rounded bg-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-300 disabled:opacity-50 ml-auto"
          >
             Refresh Telemetry
          </button>
        </div>

        {/* Agent Terminal */}
        <div className="mt-6 rounded border border-slate-200 bg-slate-900 p-4 text-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span className="font-mono text-xs font-bold text-white uppercase">
                AGENT EXECUTION STREAM
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
              {getStatusBadge(status)}
            </div>
          </div>

          <div className="font-mono text-xs space-y-2 text-slate-300">
            {state ? (
              <>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span><span className="text-slate-500">Cycle ID:</span> {state.agent_cycle_id}</span>
                  <span><span className="text-slate-500">Started:</span> {state.started_at}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="text-emerald-400 mb-1">&gt; Observation Context</div>
                    <div className="text-slate-400">ID: {state.observation_id || 'None'}</div>
                    <div className="text-slate-400">Source: {state.observation_source || 'None'}</div>
                    <div className="text-slate-400">Time: {state.observation_created_at || 'None'}</div>
                  </div>
                  <div>
                    <div className="text-emerald-400 mb-1">&gt; Weather Context</div>
                    <div className="text-slate-400">Status: {state.weather_status || 'Unknown'}</div>
                    <div className="text-slate-400">Summary: {state.weather_summary || 'None'}</div>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-800 pt-2">
                  <div className="text-emerald-400 mb-1">&gt; Risk Delta Evaluation</div>
                  <div className="flex gap-4">
                    <div className="text-slate-400">Risk Score: {state.previous_risk_score ?? '-'} &rarr; <strong className="text-white">{state.current_risk_score ?? '-'}</strong></div>
                    <div className="text-slate-400">Risk Level: {state.previous_risk_level ?? '-'} &rarr; <strong className="text-white">{state.current_risk_level ?? '-'}</strong></div>
                  </div>
                  <div className="flex gap-4 mt-1">
                    <div className="text-slate-400">Detections: {state.previous_detection_count ?? '-'} &rarr; <strong className="text-white">{state.current_detection_count ?? '-'}</strong></div>
                    <div className="text-slate-400">Water Ratio: {state.previous_water_area_ratio?.toFixed(3) ?? '-'} &rarr; <strong className="text-white">{state.current_water_area_ratio?.toFixed(3) ?? '-'}</strong></div>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-800 pt-2">
                  <div className="text-emerald-400 mb-1">&gt; Agent Logic</div>
                  <div className="text-slate-400">Change Detected: {state.change_detected ? <span className="text-white font-bold">YES</span> : 'NO'}</div>
                  <div className="text-slate-400">Reasons:</div>
                  <ul className="list-disc list-inside text-slate-500 ml-2">
                    {state.change_reasons?.map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                  <div className="mt-2 text-slate-300">
                    Recommended Action: {getActionBadge(state.recommended_agent_action)}
                  </div>
                </div>

                {state.last_gemini_summary && (
                  <div className="mt-4 border-t border-slate-800 pt-2 text-slate-400 italic">
                    Gemini Reasoning: "{state.last_gemini_summary}"
                  </div>
                )}
                
                {state.last_error && (
                  <div className="mt-4 border-t border-red-900/50 pt-2 text-red-400">
                    Error: {state.last_error}
                  </div>
                )}
              </>
            ) : (
              <div className="text-slate-500 text-center py-4">
                [SYSTEM IDLE] Awaiting telemetry from backend...
              </div>
            )}
          </div>

          <div className="mt-3 border-t border-slate-800/80 pt-2 flex justify-between font-mono text-[10px] text-slate-500">
            <span>Backend Swarm Endpoint: GET /api/agent/status</span>
            <span>FastAPI Background Tasks Integration Ready</span>
          </div>
        </div>
      </div>
    </section>
  );
};
