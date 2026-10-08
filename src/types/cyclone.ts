export type CycloneCategory =
  | 'Depression'
  | 'Deep Depression'
  | 'Cyclonic Storm'
  | 'Severe Cyclonic Storm'
  | 'Very Severe Cyclonic Storm'
  | 'Extremely Severe Cyclonic Storm'
  | 'Super Cyclonic Storm';

export interface CycloneWaypoint {
  timestamp: string;
  timeLabel: string;
  lat: number;
  lng: number;
  windSpeedKmh: number;
  pressureHpa: number;
  category: CycloneCategory;
  type: 'HISTORICAL' | 'CURRENT' | 'FORECAST';
  uncertaintyRadiusKm?: number;
}

export interface CycloneSystem {
  id: string;
  name: string;
  systemCode: string;
  basin: 'Bay of Bengal' | 'Arabian Sea' | 'North Indian Ocean';
  currentCategory: CycloneCategory;
  currentLat: number;
  currentLng: number;
  sustainedWindKmh: number;
  gustKmh: number;
  centralPressureHpa: number;
  movementDirection: string;
  movementHeadingDeg: number;
  movementSpeedKmh: number;
  eyeDiameterKm: number;
  distanceToCoastlineKm: number;
  closestLandfallPoint: string;
  estimatedLandfallTime: string;
  quadrantRadiiKm: {
    r34kt: { ne: number; se: number; sw: number; nw: number };
    r50kt: { ne: number; se: number; sw: number; nw: number };
  };
  trajectory: CycloneWaypoint[];
}
