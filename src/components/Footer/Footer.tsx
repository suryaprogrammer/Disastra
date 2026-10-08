import React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-12 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md space-y-3">
            <span className="font-display text-2xl font-black tracking-tight text-slate-950">
              DISASTRA
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              AI Disaster Detection & Early Warning System. Autonomous subcontinental hydrometeorological surveillance synthesizing deep vision flood segmentation, cyclone trajectory modeling, and decentralized alert dispatch.
            </p>
            <div className="text-[11px] font-mono text-slate-400">
              Observe. Detect. Predict. Respond.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 text-xs">
            <div>
              <div className="font-mono text-[11px] uppercase font-bold text-slate-900 mb-2">
                Intelligence APIs
              </div>
              <ul className="space-y-1.5 font-mono text-[11px] text-slate-500">
                <li><code>GET /api/weather</code></li>
                <li><code>GET /api/cyclones</code></li>
                <li><code>GET /api/flood-risk</code></li>
                <li><code>POST /api/flood-detection</code></li>
                <li><code>POST /api/ai/brief</code></li>
                <li><code>GET /api/agents/status</code></li>
              </ul>
            </div>

            <div>
              <div className="font-mono text-[11px] uppercase font-bold text-slate-900 mb-2">
                Ingested Networks
              </div>
              <ul className="space-y-1.5 text-slate-600">
                <li>IMD Doppler Weather Radar</li>
                <li>Sentinel-2 SAR Constellation</li>
                <li>CWC River Discharge Gauges</li>
                <li>INSAT-3DR Multispectral Met</li>
                <li>NDMA Common Alerting Protocol</li>
              </ul>
            </div>

            <div>
              <div className="font-mono text-[11px] uppercase font-bold text-slate-900 mb-2">
                Architecture Standard
              </div>
              <ul className="space-y-1.5 text-slate-600">
                <li>Computer Vision (YOLOv11x)</li>
                <li>Autonomous Multi-Agent Swarm</li>
                <li>Bayesian Hydrological Models</li>
                <li>FastAPI Microservices Ready</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row font-mono">
          <div>
            &copy; {new Date().getFullYear()} DISASTRA Early Warning System. All rights reserved.
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>National Early Warning Grid: Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
