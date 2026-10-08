import React, { useState } from 'react';
import {
  Camera,
  Layers,
  Cpu,
  CheckCircle2,
  Scan,
  Maximize2,
  Upload,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { ComputerVisionInference } from '../../types/disaster';

interface ComputerVisionProps {
  initialInference: ComputerVisionInference;
}

export const ComputerVision: React.FC<ComputerVisionProps> = ({ initialInference }) => {
  const [inference, setInference] = useState<ComputerVisionInference>(initialInference);
  const [activeSource, setActiveSource] = useState<string>('Satellite Sentinel-2');
  const [overlayMode, setOverlayMode] = useState<'mask' | 'bbox' | 'raw'>('mask');
  const [isProcessing, setIsProcessing] = useState(false);

  // Switch between input sources (Frontend simulated inference)
  const handleSelectSource = (sourceName: 'Satellite Sentinel-2' | 'Drone UAV Fleet' | 'CCTV River Gauges') => {
    setActiveSource(sourceName);
    setIsProcessing(true);
    setTimeout(() => {
      if (sourceName === 'Drone UAV Fleet') {
        setInference({
          ...initialInference,
          id: 'CV-DRONE-4402',
          sourceType: 'Drone UAV Fleet',
          sourceLocation: 'Mahanadi Distributary Coastal Levees (Odisha)',
          capturedAt: 'Today, 10:52 IST',
          inferenceLatencyMs: 88,
          waterAccumulationSqKm: 124.6,
          submergedInfrastructureUnits: 14,
          detectedClasses: [
            { name: 'Active Flood Water Inundation', confidence: 0.952, color: '#38bdf8', areaPct: 38.4 },
            { name: 'Breached River Embankment', confidence: 0.934, color: '#f43f5e', areaPct: 12.1 },
            { name: 'Submerged Roadways / Infrastructure', confidence: 0.912, color: '#f59e0b', areaPct: 18.0 },
            { name: 'Saturated Agricultural Zone', confidence: 0.925, color: '#10b981', areaPct: 31.5 },
          ],
        });
      } else if (sourceName === 'CCTV River Gauges') {
        setInference({
          ...initialInference,
          id: 'CV-CCTV-9011',
          sourceType: 'CCTV River Gauges',
          sourceLocation: 'Periyar River Bridge Observation Point (Kerala)',
          capturedAt: 'Today, 10:54 IST',
          inferenceLatencyMs: 42,
          waterAccumulationSqKm: 48.0,
          submergedInfrastructureUnits: 6,
          detectedClasses: [
            { name: 'Active Flood Water Inundation', confidence: 0.978, color: '#38bdf8', areaPct: 62.1 },
            { name: 'Submerged Roadways / Infrastructure', confidence: 0.941, color: '#f59e0b', areaPct: 24.3 },
            { name: 'Structural Silt Overwash', confidence: 0.884, color: '#10b981', areaPct: 13.6 },
          ],
        });
      } else {
        setInference(initialInference);
      }
      setIsProcessing(false);
    }, 200);
  };

  return (
    <section id="computer-vision-section" className="w-full border-b border-slate-200 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
            <span>Perceptual Neural Pipeline</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-800 font-bold">Deep Vision Earth Observation</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Computer Vision Analysis Showcase
            </h2>
            <span className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700 self-start md:self-auto">
              Simulated Vision Pipeline Demo
            </span>
          </div>
          <p className="text-sm text-slate-600">
            Real-time deep convolutional boundary segmentation identifying water accumulation, breached embankments, and severed infrastructure.
          </p>
        </div>

        {/* 3-Step Pipeline Flow Diagram */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="grid grid-cols-1 items-center gap-3 text-xs md:grid-cols-3">
            {/* Step 1: INPUT */}
            <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-slate-500 uppercase">
                <span>01. INPUT DATA STREAM</span>
                <span className="text-sky-600">INGESTION</span>
              </div>
              <div className="font-display text-sm font-bold text-slate-950">
                Satellite / Drone / CCTV
              </div>
              <p className="text-[11px] text-slate-500">
                Multispectral SAR passes and high-altitude UAV oblique footage ingested at 10m Ground Sample Distance.
              </p>
            </div>

            {/* Step 2: COMPUTER VISION */}
            <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-slate-500 uppercase">
                <span>02. COMPUTER VISION</span>
                <span className="text-emerald-600 font-bold">INFERENCE</span>
              </div>
              <div className="font-display text-sm font-bold text-slate-950">
                YOLOv11x Segmentation Engine
              </div>
              <p className="text-[11px] text-slate-500">
                Convolutional feature pyramid extracting pixel-level inundation boundaries and water accumulation masks.
              </p>
            </div>

            {/* Step 3: DETECTED */}
            <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-slate-500 uppercase">
                <span>03. DETECTED HAZARD</span>
                <span className="text-rose-600 font-bold">CLASSIFIED</span>
              </div>
              <div className="font-display text-sm font-bold text-slate-950">
                Flood / Water Accumulation
              </div>
              <p className="text-[11px] text-slate-500">
                Surface water area calculated: <strong>{inference.waterAccumulationSqKm} km²</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Image Viewer with Interactive Overlay Controls (7 cols) */}
          <div className="rounded-xl border border-slate-200 bg-slate-900 p-5 text-white lg:col-span-7 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Image Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Scan className="h-4 w-4 text-sky-400" />
                  <span className="font-mono text-xs font-semibold text-slate-200 uppercase">
                    Sensor: {inference.sourceType}
                  </span>
                </div>

                {/* Overlay Mode Switcher */}
                <div className="flex rounded-md border border-slate-700 bg-slate-800 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setOverlayMode('mask')}
                    className={`cursor-pointer rounded px-2.5 py-1 font-mono text-[11px] transition-colors ${
                      overlayMode === 'mask' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Segmentation Mask
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverlayMode('bbox')}
                    className={`cursor-pointer rounded px-2.5 py-1 font-mono text-[11px] transition-colors ${
                      overlayMode === 'bbox' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Bounding Boxes
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverlayMode('raw')}
                    className={`cursor-pointer rounded px-2.5 py-1 font-mono text-[11px] transition-colors ${
                      overlayMode === 'raw' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Raw Sensor Tile
                  </button>
                </div>
              </div>

              {/* Image Viewport with Overlays */}
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-800 bg-black">
                {isProcessing ? (
                  <div className="flex h-full w-full items-center justify-center font-mono text-xs text-sky-400">
                    <span className="animate-spin mr-2">◒</span> EXECUTING NEURAL SEGMENTATION DEMO...
                  </div>
                ) : (
                  <>
                    <img
                      src={
                        activeSource === 'Drone UAV Fleet'
                          ? '/src/assets/images/aerial_disaster_recon_1791004276778.jpg'
                          : '/src/assets/images/flood_yolo_segmentation_1791004247840.jpg'
                      }
                      alt="Computer vision flood analysis aerial capture"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />

                    {/* Mask Overlay Mode */}
                    {overlayMode === 'mask' && (
                      <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 500 280">
                        <polygon
                          points="60,90 140,80 230,110 320,130 460,170 480,260 40,260"
                          fill="rgba(56, 189, 248, 0.45)"
                          stroke="#38bdf8"
                          strokeWidth="2"
                        />
                        <polygon
                          points="170,100 280,105 270,165 160,150"
                          fill="rgba(244, 63, 94, 0.45)"
                          stroke="#f43f5e"
                          strokeWidth="2"
                        />
                        <text x="180" y="130" fill="#ffffff" fontSize="11" fontFamily="monospace" fontWeight="bold">
                          BREACH_CRITICAL: 91.8%
                        </text>
                      </svg>
                    )}

                    {/* Bounding Box Mode */}
                    {overlayMode === 'bbox' && (
                      <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 500 280">
                        <rect
                          x="50"
                          y="70"
                          width="420"
                          height="190"
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2"
                          strokeDasharray="6 3"
                        />
                        <text x="55" y="88" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                          [01] INUNDATION_ZONE (0.96)
                        </text>
                      </svg>
                    )}

                    <div className="absolute bottom-2 left-2 rounded bg-black/80 px-2 py-1 font-mono text-[10px] text-slate-300">
                      GSD: 0.5m/px · Demo Tile
                    </div>
                  </>
                )}
              </div>

              {/* Source Stream Switcher */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-400 font-mono">Stream:</span>
                <button
                  type="button"
                  onClick={() => handleSelectSource('Satellite Sentinel-2')}
                  className={`cursor-pointer rounded border px-2 py-1 text-xs transition-colors ${
                    activeSource === 'Satellite Sentinel-2'
                      ? 'border-emerald-500 bg-emerald-950/70 text-emerald-200'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Sentinel-2 Pass (Assam)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSource('Drone UAV Fleet')}
                  className={`cursor-pointer rounded border px-2 py-1 text-xs transition-colors ${
                    activeSource === 'Drone UAV Fleet'
                      ? 'border-emerald-500 bg-emerald-950/70 text-emerald-200'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Drone Fleet (Odisha Delta)
                </button>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-800 pt-3 text-[11px] font-mono text-slate-400 flex justify-between">
              <span>Latency: {inference.inferenceLatencyMs} ms</span>
              <span>Demo Mode</span>
            </div>
          </div>

          {/* Right Column: Confidence & Class Analysis (5 cols) */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <div className="text-[11px] font-mono uppercase text-slate-400">TARGET REGION</div>
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    {inference.sourceLocation}
                  </h3>
                </div>
                <span className="font-mono text-xs text-slate-500">{inference.capturedAt}</span>
              </div>

              {/* Inundation Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[11px] font-medium text-slate-500 uppercase">Calculated Water Surface</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-slate-950">
                    {inference.waterAccumulationSqKm} <span className="text-xs text-slate-500">km²</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Total Footprint</div>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="text-[11px] font-medium text-slate-500 uppercase">Severed Infrastructure</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-rose-600">
                    {inference.submergedInfrastructureUnits} <span className="text-xs text-slate-500">Assets</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Submerged Assets</div>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-400 font-mono flex justify-between">
              <span>Frontend Demo Data</span>
              <span>IoU Threshold: 0.75</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
