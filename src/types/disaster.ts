export interface AgentTelemetry {
  id: string;
  name: string;
  role: string;
  status: 'ACTIVE' | 'MONITORING' | 'READY' | 'DISPATCHED';
  taskDescription: string;
  processedItems: number;
  lastHeartbeat: string;
  throughputRate: string;
}

export interface SituationBrief {
  id: string;
  headline: string;
  executiveSummary: string;
  keyThreats: string[];
  recommendedActions: string[];
  generatedAt: string;
  generatedBy: string;
  modelEngine: string;
  dataSources: string[];
  confidenceScorePct: number;
}

export interface AlertRecord {
  alert_id: string;
  created_at: string;
  observation_id: string;
  escalation_level?: string;
  risk_score?: number;
  risk_level?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  headline: string;
  message: string;
  recommended_action?: string;
  channels: ('WHATSAPP' | 'SMS')[];
  status: 'PREPARED' | 'QUEUED' | 'SENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'SKIPPED';
  provider: string;
  provider_message_id?: string;
  error?: string;
  sent_at?: string;
  delivered_at?: string;
}

// Deprecated mock alert event
export interface DisasterAlertEvent {
  id: string;
  timestamp: string;
  timeDisplay: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'ADVISORY';
  category: 'FLOOD' | 'CYCLONE' | 'RAIN' | 'WIND' | 'SYSTEM';
  region: string;
  coordinates?: [number, number];
  source: string;
  acknowledged?: boolean;
}

export interface RiskSubIndex {
  category: 'Flood Risk' | 'Cyclone Risk' | 'Rainfall Risk' | 'Wind Risk';
  score: number; // 0 to 100
  level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  trend: 'INCREASING' | 'STEADY' | 'DECREASING';
  historicalMax: number;
  affectedPopulationEst: string;
  primaryZone: string;
}

export interface DisasterOverviewStats {
  statesMonitored: number;
  unionTerritories: number;
  activeFloodAlerts: number;
  activeCycloneSystems: number;
  regionsUnderMonitoring: number;
  aiAnalysesToday: number;
  sensorFeedsConnected: number;
  satellitePassesProcessed: number;
  lastSyncTimestamp: string;
}

export interface ComputerVisionInference {
  id: string;
  sourceType: 'Satellite Sentinel-2' | 'Drone UAV Fleet' | 'CCTV River Gauges' | 'Multi-spectral SAR';
  sourceLocation: string;
  capturedAt: string;
  inferenceLatencyMs: number;
  detectedClasses: {
    name: string;
    confidence: number;
    color: string;
    areaPct: number;
  }[];
  waterAccumulationSqKm: number;
  submergedInfrastructureUnits: number;
  modelIdentifier: string;
  segmentationOverlayUrl: string;
  originalImageUrl: string;
}
