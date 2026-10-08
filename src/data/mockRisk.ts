import {
  RiskSubIndex,
  AgentTelemetry,
  SituationBrief,
  DisasterOverviewStats,
  ComputerVisionInference,
} from '../types/disaster';

export const mockRiskIndices: RiskSubIndex[] = [
  {
    category: 'Flood Risk',
    score: 84,
    level: 'CRITICAL',
    trend: 'INCREASING',
    historicalMax: 96,
    affectedPopulationEst: '3.95M Citizens',
    primaryZone: 'Brahmaputra Valley & Mahanadi Delta',
  },
  {
    category: 'Cyclone Risk',
    score: 76,
    level: 'HIGH',
    trend: 'INCREASING',
    historicalMax: 92,
    affectedPopulationEst: '2.80M Coastal Residents',
    primaryZone: 'North Bay of Bengal (Odisha/WB coast)',
  },
  {
    category: 'Rainfall Risk',
    score: 68,
    level: 'HIGH',
    trend: 'STEADY',
    historicalMax: 88,
    affectedPopulationEst: '5.10M Across 6 States',
    primaryZone: 'Western Ghats (Kerala) & Eastern Slopes',
  },
  {
    category: 'Wind Risk',
    score: 58,
    level: 'MODERATE',
    trend: 'INCREASING',
    historicalMax: 84,
    affectedPopulationEst: '1.45M Coastal Strip',
    primaryZone: 'Paradip to Digha Coastal Corridor',
  },
];

export const mockAutonomousAgents: AgentTelemetry[] = [
  {
    id: 'AGENT-DETECTION-01',
    name: 'DETECTION AGENT',
    role: 'Multi-Sensor Ingestion & Anomaly Parsing',
    status: 'ACTIVE',
    taskDescription: 'Ingesting multi-source telemetry data (DEMO / PREVIEW)',
    processedItems: 14820,
    lastHeartbeat: '1s ago',
    throughputRate: 'SIMULATED',
  },
  {
    id: 'AGENT-ANALYSIS-02',
    name: 'ANALYSIS AGENT',
    role: 'Computer Vision & YOLOv11 Segmentation',
    status: 'ACTIVE',
    taskDescription: 'Executing deep convolutional flood boundary segmentation (DEMO / PREVIEW)',
    processedItems: 3410,
    lastHeartbeat: '2s ago',
    throughputRate: 'SIMULATED',
  },
  {
    id: 'AGENT-RISK-03',
    name: 'RISK AGENT',
    role: 'Hydrological Modeling & Probabilistic Risk Engine',
    status: 'MONITORING',
    taskDescription: 'Simulating river breach inundation curves (DEMO / PREVIEW)',
    processedItems: 894,
    lastHeartbeat: '4s ago',
    throughputRate: 'SIMULATED',
  },
  {
    id: 'AGENT-ALERT-04',
    name: 'ALERT AGENT',
    role: 'Multi-Channel Early Warning Dispatcher',
    status: 'READY',
    taskDescription: 'Standby for automated alert broadcasting (DEMO / PREVIEW)',
    processedItems: 42,
    lastHeartbeat: '3s ago',
    throughputRate: 'SIMULATED',
  },
  {
    id: 'AGENT-RESPONSE-05',
    name: 'RESPONSE AGENT',
    role: 'Logistics & Evacuation Route Optimization',
    status: 'READY',
    taskDescription: 'Mapping safe elevation corridors (DEMO / PREVIEW)',
    processedItems: 18,
    lastHeartbeat: '5s ago',
    throughputRate: 'SIMULATED',
  },
];

export const mockSituationBrief: SituationBrief = {
  id: 'BRIEF-2026-10-02-0940',
  headline: 'Compound Hydrometeorological Hazard: Severe Cyclone Approaching Odisha While Heavy Precipitation Expands River Inundation',
  executiveSummary:
    'DISASTRA neural risk engines have detected a compounding disaster signature across Eastern and Southern India. In the Bay of Bengal, Cyclone DANA has intensified to Very Severe Cyclonic Storm status with central pressure dropping to 974 hPa and sustained wind velocities reaching 135 km/h. Concurrently, computer vision models analyzing Sentinel-2 SAR passes have confirmed rapid surface-water accumulation and bank breach across 480 sq km of the Brahmaputra basin (Assam) and saturated catchment in Kerala. The confluence of cyclonic coastal surge and upstream river discharge places the Mahanadi delta under critical alert. Immediate pre-positioning of response assets and continuous satellite surveillance is advised.',
  keyThreats: [
    'Cyclone Landfall window between Dhamra Port and Puri expected within T+18 hours accompanied by 1.8m to 2.4m storm surge.',
    'Brahmaputra water level is currently 1.3 meters above danger threshold at Dhubri and Nematighat with persistent monsoon rain.',
    'Western Ghats slope saturation in Idukki/Wayanad elevates localized flash flood and shallow landslide susceptibility.',
  ],
  recommendedActions: [
    'Trigger automated evacuation advisories for low-lying coastal habitations within 15 km of Dhamra–Puri coastline.',
    'Deploy drone reconnaissance squadrons for real-time levee inspection along vulnerable Mahanadi distributaries.',
    'Activate CAP-compliant emergency SMS broadcasts in Odia, Bengali, and Assamese via regional telecommunication towers.',
    'Maintain continuous 15-minute Doppler radar reflectivity surveillance at Paradip and Gopalpur radar stations.',
  ],
  generatedAt: 'Today, 10:56 IST (DEMO / PREVIEW)',
  generatedBy: 'DISASTRA AI Autonomous Intelligence Engine',
  modelEngine: 'FastAPI + DeepSeek/Gemini Reasoning Model + YOLOv11 Seg',
  dataSources: [
    'Computer Vision (DEMO / PREVIEW)',
    'Doppler Radar & Synoptic Telemetry (SIMULATED)',
    'CWC River Discharge Gauges (SIMULATED)',
    'Global Wave & Storm Surge Numerical Models (SIMULATED)',
    'DISASTRA Neural Hydrological Risk Engine (SIMULATED)',
  ],
  confidenceScorePct: 94.6,
};

export const mockOverviewStats: DisasterOverviewStats = {
  statesMonitored: 28,
  unionTerritories: 8,
  activeFloodAlerts: 14,
  activeCycloneSystems: 2,
  regionsUnderMonitoring: 64,
  aiAnalysesToday: 1842,
  sensorFeedsConnected: 1240,
  satellitePassesProcessed: 18,
  lastSyncTimestamp: '2026-10-02 10:58:32 IST',
};

export const mockVisionInference: ComputerVisionInference = {
  id: 'CV-INF-89241',
  sourceType: 'Satellite Sentinel-2',
  sourceLocation: 'Brahmaputra River Corridor & Lower Assam Basin',
  capturedAt: 'Today, 10:48 IST',
  inferenceLatencyMs: 142,
  detectedClasses: [
    { name: 'Active Flood Water Inundation', confidence: 0.964, color: '#38bdf8', areaPct: 42.6 },
    { name: 'Breached River Embankment', confidence: 0.918, color: '#f43f5e', areaPct: 7.8 },
    { name: 'Submerged Roadways / Infrastructure', confidence: 0.892, color: '#f59e0b', areaPct: 14.1 },
    { name: 'Waterlogged Agricultural Paddy', confidence: 0.945, color: '#10b981', areaPct: 35.5 },
  ],
  waterAccumulationSqKm: 480.2,
  submergedInfrastructureUnits: 38,
  modelIdentifier: 'YOLOv11x-FloodSeg (Pre-trained on SAR & Multispectral Earth Observation)',
  segmentationOverlayUrl: '/src/assets/images/flood_yolo_segmentation_1791004247840.jpg',
  originalImageUrl: '/src/assets/images/aerial_disaster_recon_1791004276778.jpg',
};
