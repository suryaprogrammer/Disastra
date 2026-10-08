export type FloodWarningLevel = 'MONITORING' | 'ELEVATED' | 'SEVERE' | 'CRITICAL';

export interface FloodZone {
  id: string;
  name: string;
  riverBasin: string;
  state: string;
  lat: number;
  lng: number;
  radiusKm: number;
  warningLevel: FloodWarningLevel;
  aiConfidencePct: number;
  detectedCondition: string;
  detectionSource: 'Computer Vision' | 'Hydrological Model' | 'Synthetic Aperture Radar' | 'Satellite Multi-spectral';
  waterAccumulationMm: number;
  waterLevelCurrentM: number;
  waterLevelDangerM: number;
  rateOfRiseMPerHour: number;
  trend: 'RISING' | 'STABLE' | 'RECEDING';
  status: 'ACTIVE MONITORING' | 'EVACUATION ADVISED' | 'FLASH FLOOD WATCH';
  populationAtRisk: number;
  affectedDistricts: string[];
  yoloModelConfidence: number;
  segmentationAreaSqKm: number;
}
