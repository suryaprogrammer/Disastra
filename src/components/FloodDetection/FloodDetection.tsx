import React, { useState } from 'react';
import {
  AlertTriangle,
  Layers,
  Activity,
  CheckCircle,
  TrendingUp,
  MapPin,
  Maximize2,
  Cpu,
  Upload,
  Info,
} from 'lucide-react';
import { FloodZone } from '../../types/flood';
import { motion, AnimatePresence } from 'motion/react';
import { disastraApi } from '../../services/api';

interface FloodDetectionProps {
  floodZones: FloodZone[];
}

export const FloodDetection: React.FC<FloodDetectionProps> = ({ floodZones }) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>(floodZones[0]?.id || '');
  const [showSegmentationMask, setShowSegmentationMask] = useState(true);
  const [activeView, setActiveView] = useState<'upload' | 'monitored'>('upload');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  React.useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  
  // Real Analysis State
  const [analysisResult, setAnalysisResult] = useState<{
    waterDetected: boolean;
    detectionCount: number;
    confidence: number;
    waterAreaRatio: number | null;
    riskScore: number | null;
    severity: string | null;
    uploadedImageName?: string;
  } | null>(null);

  const currentZone = floodZones.find((z) => z.id === selectedZoneId) || floodZones[0];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/tiff'].includes(file.type)) {
        setAnalysisError('Unsupported file type. Please upload a JPEG, PNG, or WEBP image.');
        return;
      }
      setSelectedImageFile(file);
      setAnalysisError(null);
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setIsDemoMode(false);
    }
  };

  const handleAnalyzeUpload = async () => {
    if (!selectedImageFile) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const response = await disastraApi.analyzeFloodImage(selectedImageFile);
      
      if (response.risk_assessment) {
        // Handle DisasterAnalysisResponse
        const risk = response.risk_assessment;
        setAnalysisResult({
          waterDetected: risk.risk_assessment.water_detected,
          detectionCount: risk.evidence.detection_count,
          confidence: risk.evidence.maximum_confidence || 0,
          waterAreaRatio: risk.evidence.water_area_ratio || 0,
          riskScore: risk.risk_assessment.risk_score,
          severity: risk.risk_assessment.risk_level,
          uploadedImageName: file.name,
        });
      } else {
        // Handle FloodAnalysisResponse
        const detections = response.detections || [];
        const maxConf = detections.length > 0 ? Math.max(...detections.map((d: any) => d.confidence)) : 0;
        const maxArea = detections.length > 0 ? Math.max(...detections.map((d: any) => d.mask_area_ratio || 0)) : 0;
        const waterDetected = response.analysis?.water_detected || false;
        
        setAnalysisResult({
          waterDetected,
          detectionCount: response.analysis?.detection_count || 0,
          confidence: maxConf,
          waterAreaRatio: maxArea,
          riskScore: null,
          severity: null,
          uploadedImageName: selectedImageFile?.name,
        });
      }
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunDemo = () => {
    setIsDemoMode(true);
    setAnalysisError(null);
    setAnalysisResult({
      waterDetected: true,
      detectionCount: 14,
      confidence: 0.942,
      waterAreaRatio: 0.315,
      riskScore: 82,
      severity: 'HIGH',
      uploadedImageName: 'demo-flood-image.jpg',
    });
    // Set a placeholder image if none selected
    if (!imagePreviewUrl) {
      setImagePreviewUrl('/src/assets/images/flood_yolo_segmentation_1791004247840.jpg');
    }
  };

  return (
    <section id="flood-detection-section" className="w-full border-b border-slate-200 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <span>Hydrological Deep Vision</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-bold">Neural Inundation Segmentation</span>
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Flood Detection Panel
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Autonomous computer vision and hydrological runoff models calculating water accumulation.
            </p>
          </div>

          {/* Tab Switcher: On-Demand Upload vs Monitored Basins */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-300 p-1 bg-slate-100">
              <button
                type="button"
                onClick={() => setActiveView('upload')}
                className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeView === 'upload'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Analyze Image
              </button>
              <button
                type="button"
                onClick={() => setActiveView('monitored')}
                className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeView === 'monitored'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Live Monitored Basins
              </button>
            </div>
          </div>
        </div>

        {/* View 1: On-Demand Upload & Simulated AI Analysis Flow */}
        {activeView === 'upload' && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column: Command Center Control Panel (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-display text-lg font-bold text-slate-950">
                    Flood Detection
                  </h3>
                  <div className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">Detection Status</div>
                    <div className="font-medium text-slate-900">{analysisResult ? 'Analysis Complete' : 'Ready for Analysis'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">Model</div>
                    <div className="font-medium text-slate-900">Flood Segmentation Engine</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">Analysis Source</div>
                    <div className="font-medium text-slate-900">Operational Image Feed</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">Detection</div>
                    <div className="font-medium text-slate-900">{analysisResult ? (analysisResult.waterDetected ? 'Positive' : 'Negative') : 'Awaiting Analysis'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">Risk</div>
                    <div className="font-medium text-slate-900">{analysisResult ? (analysisResult.severity || 'N/A') : 'Awaiting Analysis'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">Evidence</div>
                    <div className="font-medium text-slate-900">{analysisResult ? `${analysisResult.detectionCount} Zones Identified` : 'Awaiting Analysis'}</div>
                  </div>
                </div>

                {analysisError && (
                  <div className="mt-4 rounded border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                    <div className="mb-2"><strong>Error:</strong> {analysisError}</div>
                    <button 
                      onClick={handleRunDemo}
                      className="cursor-pointer w-full rounded border border-rose-300 bg-rose-100 px-3 py-1.5 font-semibold text-rose-900 hover:bg-rose-200 transition-colors"
                    >
                      Run Offline Demonstration
                    </button>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3">
                  {imagePreviewUrl && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                      <img src={imagePreviewUrl} alt="Upload preview" className="h-full w-full object-cover" />
                    </div>
                  )}

                  <input 
                    type="file"
                    id="flood-analysis-input"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,image/tiff"
                    onChange={handleFileSelect}
                  />
                  <label 
                    htmlFor="flood-analysis-input"
                    className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <Upload className="h-4 w-4" />
                    {selectedImageFile ? 'Change Image' : 'Choose Image'}
                  </label>

                  <button 
                    onClick={handleAnalyzeUpload}
                    disabled={!selectedImageFile || isAnalyzing}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Activity className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Event'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: AI Detection Result Cards (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {analysisResult ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="font-mono text-[10px] uppercase text-emerald-700 font-bold">
                        AI DETECTION RESULT
                      </span>
                      <h3 className="text-lg font-bold text-slate-950">
                        Inundation Analysis Report
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">
                        Source: {analysisResult.uploadedImageName}
                      </p>
                    </div>
                    {isDemoMode ? (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-300">
                        DEMONSTRATION MODE
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                        Live Result
                      </span>
                    )}
                  </div>

                  {/* Specified Fields in User Request: Water Detected, Count, Confidence, Area */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[11px] font-medium text-slate-500 uppercase">Water Detected</div>
                      <div className="mt-1 font-mono text-xl font-bold text-emerald-600">
                        {analysisResult.waterDetected ? 'YES' : 'NO'}
                      </div>
                      <div className="text-[10px] text-slate-400">Positive Segmentation</div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[11px] font-medium text-slate-500 uppercase">Detection Count</div>
                      <div className="mt-1 font-mono text-xl font-bold text-slate-900">
                        {analysisResult.detectionCount} Zones
                      </div>
                      <div className="text-[10px] text-slate-400">Inundated Clusters</div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[11px] font-medium text-slate-500 uppercase">Confidence</div>
                      <div className="mt-1 font-mono text-xl font-bold text-emerald-600">
                        {(analysisResult.confidence * 100).toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-slate-400">Class Certainty</div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[11px] font-medium text-slate-500 uppercase">Water Coverage</div>
                      <div className="mt-1 font-mono text-xl font-bold text-rose-600">
                        {analysisResult.waterAreaRatio !== null ? (analysisResult.waterAreaRatio * 100).toFixed(1) + '%' : 'N/A'}
                      </div>
                      <div className="text-[10px] text-slate-400">Total Surface Extent</div>
                    </div>
                  </div>

                  {/* Result Detail Box */}
                  <div className={`rounded-lg border p-4 space-y-2 ${
                    analysisResult.severity === 'CRITICAL' || analysisResult.severity === 'HIGH'
                      ? 'border-rose-200 bg-rose-50/50' 
                      : analysisResult.severity === 'MODERATE'
                      ? 'border-amber-200 bg-amber-50/50'
                      : analysisResult.severity === null
                      ? 'border-slate-200 bg-slate-50/50'
                      : 'border-emerald-200 bg-emerald-50/50'
                  }`}>
                    <div className={`flex items-center justify-between text-xs font-semibold ${
                      analysisResult.severity === 'CRITICAL' || analysisResult.severity === 'HIGH' ? 'text-rose-900' : analysisResult.severity === 'MODERATE' ? 'text-amber-900' : analysisResult.severity === null ? 'text-slate-900' : 'text-emerald-900'
                    }`}>
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className={`h-4 w-4 ${
                          analysisResult.severity === 'CRITICAL' || analysisResult.severity === 'HIGH' ? 'text-rose-600' : analysisResult.severity === 'MODERATE' ? 'text-amber-600' : analysisResult.severity === null ? 'text-slate-600' : 'text-emerald-600'
                        }`} />
                        <span>SEVERITY ASSIGNMENT: {analysisResult.severity || 'N/A'}</span>
                      </span>
                      <span className="font-mono text-[10px] font-bold">RISK SCORE: {analysisResult.riskScore !== null ? analysisResult.riskScore : 'N/A'}</span>
                    </div>
                    <p className={`text-xs leading-relaxed ${
                      analysisResult.severity === 'CRITICAL' || analysisResult.severity === 'HIGH' ? 'text-rose-800' : analysisResult.severity === 'MODERATE' ? 'text-amber-800' : analysisResult.severity === null ? 'text-slate-800' : 'text-emerald-800'
                    }`}>
                      Real-time inundation risk computed via YOLO segmentation. Multi-hazard risk score indicates spatial severity.
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-3 text-[11px] font-mono flex justify-between">
                    <span className="text-slate-400">Target Model Slot: POST /api/analyze/disaster</span>
                    {isDemoMode ? (
                      <span className="text-amber-600 font-bold">Status: Offline Verification Run</span>
                    ) : (
                      <span className="text-emerald-600 font-bold">Status: Live Backend Response</span>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center">
                  <div className="rounded-full bg-white p-3 text-slate-400 shadow-xs mb-3">
                    <Activity className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">No Analysis Executed</h4>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm">
                    Awaiting event imagery to trigger the visual detection result card via the FastAPI backend.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* View 2: Monitored Basins Detail (Preserving Existing Identity) */}
        {activeView === 'monitored' && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">MONITORED BASINS:</span>
              <div className="flex rounded-md border border-slate-300 p-1 bg-slate-100 flex-wrap">
                {floodZones.map((zone) => (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => setSelectedZoneId(zone.id)}
                    className={`cursor-pointer rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                      selectedZoneId === zone.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {zone.state} ({zone.warningLevel})
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left Column: AI Flood Detection Telemetry (7 cols) */}
              <div className="space-y-5 rounded-xl border border-slate-200 bg-slate-50/50 p-6 lg:col-span-7 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs text-slate-500">{currentZone?.riverBasin}</span>
                      <h3 className="font-display text-2xl font-bold text-slate-950">
                        {currentZone?.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>State: <strong>{currentZone?.state}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Coordinates: {currentZone?.lat}°N, {currentZone?.lng}°E</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 font-mono text-xs font-bold ${
                          currentZone?.warningLevel === 'CRITICAL'
                            ? 'border-rose-300 bg-rose-50 text-rose-700'
                            : 'border-amber-300 bg-amber-50 text-amber-700'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                        {currentZone?.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-3 sm:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <div className="text-[11px] font-medium text-slate-500 uppercase">AI Confidence</div>
                      <div className="mt-1 font-mono text-2xl font-bold text-emerald-600">
                        {currentZone?.aiConfidencePct}%
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">YOLO Confidence</div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <div className="text-[11px] font-medium text-slate-500 uppercase">Affected Region</div>
                      <div className="mt-1 text-base font-bold text-slate-900 truncate">
                        {currentZone?.state}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">
                        {((currentZone?.populationAtRisk || 0) / 1000000).toFixed(2)}M Population
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <div className="text-[11px] font-medium text-slate-500 uppercase">Detection Source</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900 truncate">
                        {currentZone?.detectionSource}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">Sentinel-2 SAR Pass</div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <div className="text-[11px] font-medium text-slate-500 uppercase">River Level Status</div>
                      <div className="mt-1 font-mono text-base font-bold text-rose-600">
                        {currentZone?.waterLevelCurrentM}m
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">
                        Danger: {currentZone?.waterLevelDangerM}m ({currentZone?.trend})
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-600">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                      <span>Detected Condition</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-800 leading-relaxed font-medium">
                      {currentZone?.detectedCondition}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                    <Cpu className="h-3.5 w-3.5 text-emerald-700" />
                    <span>FLOOD SEGMENTATION ARCHITECTURE</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-emerald-700">
                    Frontend demo telemetry structured for integration with <code>POST /api/analyze/disaster</code>.
                  </p>
                </div>
              </div>

              {/* Right Column: Segmentation Image View (5 cols) */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 uppercase tracking-wide">
                      <Layers className="h-3.5 w-3.5 text-slate-600" />
                      <span>Segmentation Overlay</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSegmentationMask(!showSegmentationMask)}
                      className="cursor-pointer font-mono text-[10px] text-slate-700 hover:text-slate-900 underline"
                    >
                      {showSegmentationMask ? 'Hide Mask' : 'Show Mask'}
                    </button>
                  </div>

                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
                    <img
                      src="/src/assets/images/flood_yolo_segmentation_1791004247840.jpg"
                      alt="Satellite Earth observation with floodwater segmentation"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />

                    {showSegmentationMask && (
                      <div className="pointer-events-none absolute inset-0">
                        <svg className="h-full w-full" viewBox="0 0 400 225">
                          <path
                            d="M 40,80 Q 90,60 160,85 T 280,120 T 360,140 L 380,220 L 20,220 Z"
                            fill="rgba(56, 189, 248, 0.4)"
                            stroke="#38bdf8"
                            strokeWidth="1.5"
                          />
                          <rect
                            x="150"
                            y="80"
                            width="120"
                            height="65"
                            fill="none"
                            stroke="#f43f5e"
                            strokeWidth="1.5"
                            strokeDasharray="4 2"
                          />
                          <text x="155" y="95" fill="#f43f5e" fontSize="9" fontFamily="monospace" fontWeight="bold">
                            BREACH_ZONE_01 (94.2%)
                          </text>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400 font-mono">
                  <span>Model: YOLOv11x-FloodSeg</span>
                  <span>Demo Data</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
