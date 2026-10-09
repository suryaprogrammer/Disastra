import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { motion, useReducedMotion } from 'framer-motion';
import { CycloneSystem } from '../../types/cyclone';
import { FloodZone } from '../../types/flood';
import { useMapData, MapDataProvider } from './MapDataProvider';
import { MAJOR_INDIAN_CITIES, INDIA_BOUNDARY_GEOJSON } from './indiaGeoData';

// Severity Color Mapping Standard
const SEVERITY_COLORS = {
  CRITICAL: { hex: '#dc2626', bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', badge: 'CRITICAL' },
  HIGH: { hex: '#ea580c', bg: '#fff7ed', border: '#ffedd5', text: '#c2410c', badge: 'HIGH' },
  MODERATE: { hex: '#d97706', bg: '#fffbeb', border: '#fef3c7', text: '#b45309', badge: 'MODERATE' },
  MONITORED: { hex: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', badge: 'MONITORED' },
};

// 1. Cyclone Center Eye Marker with rotating SVG eyewall
const getCycloneDivIcon = (category: string, severity: 'CRITICAL' | 'HIGH' | 'MODERATE' = 'CRITICAL') => {
  const color = SEVERITY_COLORS[severity].hex;
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="position: relative; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid #ffffff; box-shadow: 0 0 10px ${color}80; display: flex; align-items: center; justify-content: center;">
          <div style="background-color: #ffffff; width: 4px; height: 4px; border-radius: 50%;"></div>
        </div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// 2. Alert Marker Icon with Radar Pulse Ring
const getAlertPinIcon = (severity: keyof typeof SEVERITY_COLORS) => {
  const color = SEVERITY_COLORS[severity].hex;
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="position: relative; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div class="alert-pulse-ring-1" style="color: ${color};"></div>
        <div class="alert-pulse-ring-2" style="color: ${color};"></div>
        <div class="alert-pulse-ring-3" style="color: ${color};"></div>
        <div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px ${color}80;"></div>
      </div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};

// 3. City Reference Label Generator (Geographic spatial context)
const getCityDivIcon = (cityName: string, isCapital?: boolean) => {
  return L.divIcon({
    className: 'custom-city-icon',
    html: `
      <div style="display: flex; align-items: center; gap: 4px; pointer-events: none; white-space: nowrap;">
        <div style="width: ${isCapital ? '5px' : '4px'}; height: ${isCapital ? '5px' : '4px'}; border-radius: 50%; background-color: ${isCapital ? '#ffffff' : '#cbd5e1'}; border: 1px solid #0f172a;"></div>
        <span style="font-size: ${isCapital ? '10px' : '9px'}; font-weight: ${isCapital ? '700' : '500'}; color: #f8fafc; text-shadow: 0 1px 3px rgba(0,0,0,0.9), 0 -1px 3px rgba(0,0,0,0.9), 1px 0 3px rgba(0,0,0,0.9), -1px 0 3px rgba(0,0,0,0.9);">${cityName}</span>
      </div>
    `,
    iconSize: [100, 16],
    iconAnchor: [3, 8],
  });
};

interface IndiaMapProps {
  cyclones: CycloneSystem[];
  floodZones: FloodZone[];
  onSelectCyclone?: (cyclone: CycloneSystem) => void;
  onSelectFlood?: (flood: FloodZone) => void;
}

// Simulated Heavy Rain Zones Data with Intensity-based Particle Density
const MOCK_HEAVY_RAIN_ZONES = [
  {
    id: 'rain-01',
    name: 'Meghalaya & South Assam Plateau',
    state: 'Meghalaya',
    lat: 25.57,
    lng: 91.88,
    rainfallMm24h: 245,
    intensity: 'CRITICAL',
    affectedDistricts: ['East Khasi Hills', 'Ri-Bhoi', 'Cachar'],
    outerBoundary: [[26.1, 90.5], [25.0, 90.7], [24.9, 92.9], [26.0, 92.8]],
    coreBoundary: [[25.7, 91.3], [25.2, 91.4], [25.2, 92.3], [25.7, 92.2]],
    // EXTREME intensity: High particle density (7 rain streak vectors)
    rainVectors: [
      [[26.0, 90.8], [25.2, 91.0]],
      [[26.0, 91.4], [25.2, 91.6]],
      [[25.9, 91.9], [25.1, 92.1]],
      [[25.8, 92.4], [25.0, 92.6]],
      [[25.7, 92.7], [24.9, 92.8]],
      [[25.6, 91.1], [24.8, 91.3]],
      [[25.5, 92.2], [24.7, 92.4]],
    ] as [number, number][][],
  },
  {
    id: 'rain-02',
    name: 'Odisha Coastal Belt',
    state: 'Odisha',
    lat: 19.81,
    lng: 85.83,
    rainfallMm24h: 175,
    intensity: 'HIGH',
    affectedDistricts: ['Puri', 'Ganjam', 'Khurda'],
    outerBoundary: [[20.9, 85.0], [19.1, 84.4], [19.3, 86.0], [21.1, 86.9]],
    coreBoundary: [[20.4, 85.3], [19.5, 84.7], [19.7, 85.8], [20.6, 86.4]],
    // HEAVY intensity: Medium particle density (4 rain streak vectors)
    rainVectors: [
      [[20.8, 85.1], [19.9, 85.3]],
      [[20.5, 85.6], [19.6, 85.8]],
      [[20.2, 86.1], [19.3, 86.3]],
      [[20.9, 86.4], [20.0, 86.6]],
    ] as [number, number][][],
  },
  {
    id: 'rain-03',
    name: 'Western Ghats (Konkan & Goa)',
    state: 'Maharashtra / Goa',
    lat: 15.45,
    lng: 74.05,
    rainfallMm24h: 190,
    intensity: 'HIGH',
    affectedDistricts: ['Ratnagiri', 'Sindhudurg', 'North Goa'],
    outerBoundary: [[18.6, 73.0], [14.0, 74.1], [14.2, 74.9], [18.7, 73.9]],
    coreBoundary: [[17.0, 73.3], [14.7, 74.2], [14.9, 74.7], [17.1, 73.8]],
    // HEAVY intensity: Medium particle density (4 rain streak vectors)
    rainVectors: [
      [[18.2, 73.1], [17.0, 73.4]],
      [[17.1, 73.5], [15.9, 73.8]],
      [[16.0, 73.9], [14.8, 74.2]],
      [[15.1, 74.3], [14.1, 74.6]],
    ] as [number, number][][],
  },
  {
    id: 'rain-04',
    name: 'North Bihar & Terai Region',
    state: 'Bihar',
    lat: 26.84,
    lng: 85.37,
    rainfallMm24h: 125,
    intensity: 'MODERATE',
    affectedDistricts: ['Sitamarhi', 'Madhubani', 'Supaul'],
    outerBoundary: [[27.5, 84.4], [26.1, 84.7], [26.2, 86.6], [27.6, 86.3]],
    coreBoundary: [[27.1, 84.8], [26.4, 85.0], [26.5, 86.2], [27.2, 86.0]],
    // MODERATE intensity: Low particle density (2 rain streak vectors)
    rainVectors: [
      [[27.3, 85.0], [26.5, 85.3]],
      [[27.2, 85.8], [26.4, 86.0]],
    ] as [number, number][][],
  },
];

// River Basin Inundation Polygons with Moving Water Wave Lines
const MOCK_FLOOD_POLYGONS = [
  {
    id: 'flood-poly-01',
    basin: 'Brahmaputra Basin',
    state: 'Assam',
    warningLevel: 'CRITICAL',
    waterLevelCurrentM: 48.6,
    waterLevelDangerM: 46.8,
    boundary: [[27.6, 95.3], [27.3, 94.2], [26.9, 93.1], [26.3, 91.6], [26.0, 90.2], [26.3, 89.8], [26.7, 90.4], [26.9, 91.8], [27.3, 93.4], [27.9, 95.4]],
    waveLines: [
      [[27.5, 95.0], [27.2, 94.0], [26.8, 92.8], [26.3, 91.4], [26.1, 90.4]],
      [[27.4, 94.8], [27.1, 93.7], [26.7, 92.4], [26.2, 91.1]],
      [[27.3, 94.5], [27.0, 93.5], [26.6, 92.1]],
    ] as [number, number][][],
  },
  {
    id: 'flood-poly-02',
    basin: 'Kosi Basin',
    state: 'Bihar',
    warningLevel: 'CRITICAL',
    waterLevelCurrentM: 32.1,
    waterLevelDangerM: 30.5,
    boundary: [[27.2, 86.8], [26.5, 86.4], [25.5, 87.0], [25.3, 87.6], [26.1, 87.4], [26.9, 87.2]],
    waveLines: [
      [[27.0, 86.7], [26.3, 86.5], [25.6, 87.1]],
      [[26.8, 86.6], [26.1, 86.8]],
    ] as [number, number][][],
  },
  {
    id: 'flood-poly-03',
    basin: 'Mahanadi Delta',
    state: 'Odisha',
    warningLevel: 'HIGH',
    waterLevelCurrentM: 14.8,
    waterLevelDangerM: 13.5,
    boundary: [[20.7, 85.7], [20.4, 86.5], [19.8, 86.3], [20.1, 85.5]],
    waveLines: [
      [[20.5, 85.8], [20.2, 86.3]],
      [[20.3, 85.6], [20.0, 86.1]],
    ] as [number, number][][],
  },
  {
    id: 'flood-poly-04',
    basin: 'Godavari Basin',
    state: 'Andhra Pradesh',
    warningLevel: 'HIGH',
    waterLevelCurrentM: 16.2,
    waterLevelDangerM: 15.0,
    boundary: [[17.4, 81.6], [16.8, 82.3], [16.4, 81.8], [17.0, 81.2]],
    waveLines: [
      [[17.2, 81.7], [16.6, 82.1]],
      [[17.0, 81.4], [16.5, 81.9]],
    ] as [number, number][][],
  },
  {
    id: 'flood-poly-05',
    basin: 'Periyar Basin',
    state: 'Kerala',
    warningLevel: 'MODERATE',
    waterLevelCurrentM: 12.3,
    waterLevelDangerM: 11.5,
    boundary: [[10.2, 76.9], [9.8, 76.6], [9.9, 76.2], [10.3, 76.4]],
    waveLines: [
      [[10.1, 76.7], [9.9, 76.4]],
    ] as [number, number][][],
  },
];

// Meteorological Wind Streamlines (Continuous flow paths around atmospheric features)
const MOCK_WIND_STREAMLINES: [number, number][][] = [
  // Cyclone BOB-01 Counter-Clockwise Circulation
  [[18.8, 88.5], [18.6, 89.6], [17.5, 89.8], [16.5, 89.2]],
  [[16.5, 89.2], [16.2, 88.1], [16.6, 87.2], [17.5, 87.0]],
  [[17.5, 87.0], [18.5, 87.3], [18.8, 88.5]],
  // Bay of Bengal SE Marine Vectors
  [[11.0, 89.0], [13.2, 88.5], [15.5, 87.8], [17.5, 87.0]],
  [[13.0, 93.0], [15.2, 91.5], [17.8, 89.8], [20.0, 88.5]],
  [[16.0, 94.0], [18.5, 92.5], [21.0, 90.2], [22.8, 88.8]],
  // Arabian Sea SW Monsoon Streamlines
  [[9.0, 67.0], [11.5, 70.0], [14.0, 72.8], [15.8, 74.2]],
  [[12.0, 65.0], [14.5, 68.0], [17.0, 70.8], [19.0, 72.5]],
  [[15.0, 64.0], [17.5, 66.8], [20.0, 69.2], [22.0, 71.0]],
  // Northern Plains Deflection Vectors
  [[29.0, 74.0], [28.0, 77.5], [27.0, 81.0], [26.2, 84.5]],
  [[27.5, 83.0], [26.8, 86.0], [26.0, 89.0], [25.5, 91.5]],
];

// High-level National Emergency Alert Markers (Demo Data)
const MOCK_NATIONAL_ALERTS = [
  {
    id: 'alert-01',
    title: 'CYCLONE WARNING — BAY OF BENGAL',
    location: 'Coastal Odisha & West Bengal',
    severity: 'CRITICAL' as const,
    lat: 19.5,
    lng: 86.8,
    details: 'Very Severe Cyclonic Storm approaching coast. Gusts up to 145 km/h.',
  },
  {
    id: 'alert-02',
    title: 'CRITICAL FLOOD WATCH — BRAHMAPUTRA',
    location: 'Assam (Guwahati & Upper Assam)',
    severity: 'CRITICAL' as const,
    lat: 26.2,
    lng: 91.8,
    details: 'River flowing 1.8m above danger mark. Severe inundation in 14 districts.',
  },
  {
    id: 'alert-03',
    title: 'HEAVY RAINFALL RED ALERT',
    location: 'Meghalaya & South Assam',
    severity: 'HIGH' as const,
    lat: 25.4,
    lng: 92.2,
    details: 'Extremely heavy rainfall predicted (>200mm). Flash flood & landslide watch.',
  },
  {
    id: 'alert-04',
    title: 'HIGH SURGE ADVISORY',
    location: 'Northern Andhra Coast',
    severity: 'HIGH' as const,
    lat: 17.7,
    lng: 83.3,
    details: 'Storm surge up to 2.5m anticipated during high tide.',
  },
  {
    id: 'alert-05',
    title: 'ROUTINE MONSOON MONITORING',
    location: 'Gujarat Coastal Belt',
    severity: 'MONITORED' as const,
    lat: 22.3,
    lng: 69.5,
    details: 'Moderate sea condition. Standby monitoring active.',
  },
];

const IndiaMapInner: React.FC<{
  onSelectCyclone?: (cyclone: CycloneSystem) => void;
  onSelectFlood?: (flood: FloodZone) => void;
}> = ({ onSelectCyclone, onSelectFlood }) => {
  const { cyclones, floodZones } = useMapData();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Layer Visibility State
  const [activeLayers, setActiveLayers] = useState({
    cyclone: true,
    flood: true,
    heavyRain: true,
    wind: true,
    alerts: true,
  });

  const [isDemoMode, setIsDemoMode] = useState(false);

  // Dedicated Layer Group References
  const cycloneLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const floodLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const rainLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const windLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const alertLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());

  const toggleLayer = (layerKey: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || leafletMapRef.current) return;

    // Center on India geographic midpoint
    const map = L.map(mapContainerRef.current, {
      center: [21.5, 82.0],
      zoom: 5,
      minZoom: 4,
      maxZoom: 9,
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
    });

    // Natural Satellite Basemap: Esri World Imagery
    const esriBasemap = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 17,
        subdomains: ['a', 'b', 'c'],
      }
    );

    // Fallback Tile Layer: Standard OpenStreetMap
    const osmFallback = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    });

    esriBasemap.addTo(map);

    esriBasemap.on('tileerror', () => {
      if (!map.hasLayer(osmFallback)) {
        console.warn('Esri tiles unavailable, switching to OpenStreetMap fallback basemap.');
        map.removeLayer(esriBasemap);
        osmFallback.addTo(map);
      }
    });

    // Add Zoom Control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Sovereign India Boundary GeoJSON Overlay (subtle dashed border line)
    try {
      L.geoJSON(INDIA_BOUNDARY_GEOJSON as any, {
        style: {
          color: '#38bdf8',
          weight: 1.5,
          opacity: 0.75,
          dashArray: '5, 5',
          fill: false,
        },
      }).addTo(map);
    } catch (e) {
      console.warn('Could not render India boundary GeoJSON overlay:', e);
    }

    // Add Major Indian City Reference Markers
    MAJOR_INDIAN_CITIES.forEach(city => {
      L.marker([city.lat, city.lng], {
        icon: getCityDivIcon(city.name, city.isCapital),
        interactive: false,
      }).addTo(map);
    });

    // Attach Layer Groups to Map initially if active
    if (activeLayers.cyclone) cycloneLayerGroupRef.current.addTo(map);
    if (activeLayers.flood) floodLayerGroupRef.current.addTo(map);
    if (activeLayers.heavyRain) rainLayerGroupRef.current.addTo(map);
    if (activeLayers.wind) windLayerGroupRef.current.addTo(map);
    if (activeLayers.alerts) alertLayerGroupRef.current.addTo(map);

    leafletMapRef.current = map;

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // Update Layer Toggles Dynamically: Detaches hidden layers & stops animations immediately
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    // Clear previous dynamic features
    cycloneLayerGroupRef.current.clearLayers();
    floodLayerGroupRef.current.clearLayers();
    rainLayerGroupRef.current.clearLayers();
    windLayerGroupRef.current.clearLayers();
    alertLayerGroupRef.current.clearLayers();

    // ----------------------------------------------------
    // 1. LAYER 1: CYCLONES (ROTATING ATMOSPHERIC CIRCULATION)
    // ----------------------------------------------------
    cyclones.forEach(cyclone => {
      const isCritical = cyclone.sustainedWindKmh >= 130;
      const severity = isCritical ? 'CRITICAL' : 'HIGH';
      const cLat = cyclone.currentLat;
      const cLng = cyclone.currentLng;

      // A) Translucent Forecast Cone (Widening uncertainty sector) with breathing opacity
      const forecastConeCoords: [number, number][] = [
        [cLat, cLng],
        [cLat + 1.4, cLng - 0.1],
        [cLat + 3.0, cLng - 0.4],
        [cLat + 4.3, cLng - 0.4],
        [cLat + 4.3, cLng - 2.4],
        [cLat + 2.8, cLng - 2.0],
        [cLat + 1.2, cLng - 1.4],
        [cLat, cLng],
      ];

      const forecastCone = L.polygon(forecastConeCoords, {
        color: '#60a5fa',
        fillColor: '#3b82f6',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '5, 5',
        className: shouldReduceMotion ? '' : 'animate-cyclone-breathe-slow',
      });
      cycloneLayerGroupRef.current.addLayer(forecastCone);

      // B) Layered Counter-Rotating Eyewall Concentric Rings
      const ringOuter = L.circle([cLat, cLng], {
        radius: 200000,
        color: '#93c5fd',
        fillColor: '#60a5fa',
        fillOpacity: 0.05,
        weight: 1,
        dashArray: '4, 8',
        className: shouldReduceMotion ? '' : 'animate-cyclone-spin-slow',
      });

      const ringMid = L.circle([cLat, cLng], {
        radius: 110000,
        color: '#3b82f6',
        fillColor: '#2563eb',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '12, 12',
        className: shouldReduceMotion ? '' : 'animate-cyclone-spin-reverse',
      });

      const ringCore = L.circle([cLat, cLng], {
        radius: 35000,
        color: '#dc2626',
        fillColor: '#ef4444',
        fillOpacity: 0.3,
        weight: 2,
        dashArray: '8, 4',
        className: shouldReduceMotion ? '' : 'animate-cyclone-spin animate-cyclone-breathe',
      });

      cycloneLayerGroupRef.current.addLayer(ringOuter);
      cycloneLayerGroupRef.current.addLayer(ringMid);
      cycloneLayerGroupRef.current.addLayer(ringCore);

      // C) Spiral Cyclonic Wind Streamlines around Eye (Multi-layered)
      const spiralVectors: [number, number][][] = [
        [[cLat + 1.3, cLng], [cLat + 1.1, cLng + 1.1], [cLat, cLng + 1.3], [cLat - 1.0, cLng + 0.7]],
        [[cLat - 1.0, cLng + 0.7], [cLat - 1.3, cLng - 0.4], [cLat - 0.9, cLng - 1.3], [cLat, cLng - 1.4]],
        [[cLat, cLng - 1.4], [cLat + 1.0, cLng - 1.2], [cLat + 1.3, cLng]],
      ];

      spiralVectors.forEach(spiralPath => {
        const spiralFaint = L.polyline(spiralPath, {
          color: '#bae6fd',
          weight: 1,
          opacity: 0.4,
          className: shouldReduceMotion ? '' : 'animate-wind-flow-fast',
        });
        const spiralCore = L.polyline(spiralPath, {
          color: '#e0f2fe',
          weight: 2,
          opacity: 0.8,
          className: shouldReduceMotion ? '' : 'animate-wind-flow-med',
        });
        cycloneLayerGroupRef.current.addLayer(spiralFaint);
        cycloneLayerGroupRef.current.addLayer(spiralCore);
      });

      // D) Projected Trajectory & Animated Motion Particles
      if (cyclone.trajectory && cyclone.trajectory.length > 0) {
        const latLngs: [number, number][] = cyclone.trajectory.map(pt => [pt.lat, pt.lng]);
        const trackPolyline = L.polyline(latLngs, {
          color: '#38bdf8',
          weight: 2,
          className: shouldReduceMotion ? '' : 'animate-track-dash',
          opacity: 0.9,
        });

        cyclone.trajectory.forEach(pt => {
          const isForecast = pt.type === 'FORECAST';
          const ptMarker = L.circleMarker([pt.lat, pt.lng], {
            radius: isForecast ? 3.5 : 3,
            color: isForecast ? '#38bdf8' : '#94a3b8',
            fillColor: isForecast ? '#ffffff' : '#475569',
            fillOpacity: 1,
            weight: 1.5,
          });

          ptMarker.bindTooltip(`${pt.timeLabel}: ${pt.windSpeedKmh} km/h (${pt.category})`, {
            direction: 'top',
            offset: [0, -6],
            className: 'text-xs font-sans font-medium',
          });
          cycloneLayerGroupRef.current.addLayer(ptMarker);
        });

        cycloneLayerGroupRef.current.addLayer(trackPolyline);
      }

      // E) Cyclone Center Eye Marker (Clickable for Popup)
      const marker = L.marker([cLat, cLng], {
        icon: getCycloneDivIcon(cyclone.currentCategory, severity),
      });

      const popupDiv = document.createElement('div');
      popupDiv.style.cssText = 'padding: 12px; width: 260px; font-family: inherit;';
      popupDiv.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 10px;">
          <div>
            <div style="font-size: 10px; font-weight: 700; color: #2563eb; text-transform: uppercase;">CYCLONE SYSTEM</div>
            <div style="font-size: 15px; font-weight: 800; color: #0f172a; text-transform: uppercase;">${cyclone.name}</div>
          </div>
          <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background-color: ${SEVERITY_COLORS[severity].bg}; color: ${SEVERITY_COLORS[severity].text}; border: 1px solid ${SEVERITY_COLORS[severity].border};">
            ${severity}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; margin-bottom: 12px;">
          <div style="background: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #f1f5f9;">
            <div style="color: #64748b; font-size: 10px; font-weight: 600;">Category</div>
            <div style="color: #0f172a; font-weight: 700;">${cyclone.currentCategory}</div>
          </div>
          <div style="background: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #f1f5f9;">
            <div style="color: #64748b; font-size: 10px; font-weight: 600;">Max Sustained Wind</div>
            <div style="color: #0f172a; font-weight: 700;">${cyclone.sustainedWindKmh} km/h</div>
          </div>
          <div style="background: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #f1f5f9;">
            <div style="color: #64748b; font-size: 10px; font-weight: 600;">Movement</div>
            <div style="color: #0f172a; font-weight: 700;">${cyclone.movementDirection} @ ${cyclone.movementSpeedKmh} km/h</div>
          </div>
          <div style="background: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #f1f5f9;">
            <div style="color: #64748b; font-size: 10px; font-weight: 600;">Landfall Target</div>
            <div style="color: #0f172a; font-weight: 700;">${cyclone.closestLandfallPoint}</div>
          </div>
        </div>

        <div style="font-size: 10px; font-weight: 700; color: #b45309; background: #fffbeb; padding: 5px 8px; border-radius: 4px; text-align: center; border: 1px dashed #fcd34d; margin-bottom: 10px;">
          DATA MODE: DEMO / PREVIEW
        </div>
      `;

      if (onSelectCyclone) {
        const btn = document.createElement('button');
        btn.innerText = 'Open Cyclone Intelligence →';
        btn.style.cssText = 'width: 100%; padding: 7px; background: #0f172a; border: none; border-radius: 6px; font-size: 11px; font-weight: 700; color: #ffffff; cursor: pointer; transition: background 0.2s;';
        btn.onmouseover = () => { btn.style.background = '#1e293b'; };
        btn.onmouseout = () => { btn.style.background = '#0f172a'; };
        btn.onclick = () => { onSelectCyclone(cyclone); };
        popupDiv.appendChild(btn);
      }

      marker.bindPopup(popupDiv);
      cycloneLayerGroupRef.current.addLayer(marker);
    });

    // ----------------------------------------------------
    // 2. LAYER 2: FLOOD AREAS (FLUID DYNAMICS)
    // ----------------------------------------------------
    if (isDemoMode) {
      MOCK_FLOOD_POLYGONS.forEach(fPoly => {
        const levelKey = (fPoly.warningLevel.toUpperCase() in SEVERITY_COLORS) ? fPoly.warningLevel.toUpperCase() as keyof typeof SEVERITY_COLORS : 'MODERATE';

        // Base Inundation Field (Pulsing opacity)
      const floodPolygon = L.polygon(fPoly.boundary as [number, number][], {
        color: '#0284c7',
        fillColor: '#06b6d4',
        fillOpacity: 0.24,
        weight: 1.5,
        className: shouldReduceMotion ? '' : 'animate-flood-pulse',
      });

      // Animated Water Flow Multi-Speed Waves
      fPoly.waveLines.forEach(wLine => {
        const waveFast = L.polyline(wLine as [number, number][], {
          color: '#38bdf8',
          weight: 1.8,
          opacity: 0.8,
          className: shouldReduceMotion ? '' : 'animate-flood-wave-fast',
        });
        const waveSlow = L.polyline(wLine as [number, number][], {
          color: '#7dd3fc',
          weight: 3,
          opacity: 0.4,
          className: shouldReduceMotion ? '' : 'animate-flood-wave-slow',
        });
        floodLayerGroupRef.current.addLayer(waveSlow);
        floodLayerGroupRef.current.addLayer(waveFast);
      });

      const matchingZone = floodZones.find(z => z.riverBasin.toLowerCase().includes(fPoly.basin.toLowerCase())) || {
        riverBasin: fPoly.basin,
        state: fPoly.state,
        warningLevel: fPoly.warningLevel as any,
        waterLevelCurrentM: fPoly.waterLevelCurrentM,
        waterLevelDangerM: fPoly.waterLevelDangerM,
        trend: 'RISING',
        detectionSource: 'Synthetic Aperture Radar',
        aiConfidencePct: 94,
      };

      const popupDiv = document.createElement('div');
      popupDiv.style.cssText = 'padding: 12px; width: 260px; font-family: inherit;';
      popupDiv.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 10px;">
          <div>
            <div style="font-size: 10px; font-weight: 700; color: #0891b2; text-transform: uppercase;">FLOOD INUNDATION ZONE</div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase;">${fPoly.basin}</div>
          </div>
          <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background-color: ${SEVERITY_COLORS[levelKey].bg}; color: ${SEVERITY_COLORS[levelKey].text}; border: 1px solid ${SEVERITY_COLORS[levelKey].border};">
            ${fPoly.warningLevel}
          </span>
        </div>

        <div style="font-size: 12px; color: #334155; margin-bottom: 8px; font-weight: 600;">
          State: <span style="font-weight: 700; color: #0f172a;">${fPoly.state}</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; margin-bottom: 12px;">
          <div style="background: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #f1f5f9;">
            <div style="color: #64748b; font-size: 10px; font-weight: 600;">Water Level</div>
            <div style="color: #0f172a; font-weight: 700;">${fPoly.waterLevelCurrentM}m (Danger: ${fPoly.waterLevelDangerM}m)</div>
          </div>
          <div style="background: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #f1f5f9;">
            <div style="color: #64748b; font-size: 10px; font-weight: 600;">Water Trend</div>
            <div style="color: #dc2626; font-weight: 700;">↑ Rising</div>
          </div>
          <div style="background: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #f1f5f9;">
            <div style="color: #64748b; font-size: 10px; font-weight: 600;">AI Detection</div>
            <div style="color: #0f172a; font-weight: 700;">Sentinel SAR</div>
          </div>
          <div style="background: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #f1f5f9;">
            <div style="color: #64748b; font-size: 10px; font-weight: 600;">AI Confidence</div>
            <div style="color: #0f172a; font-weight: 700;">94%</div>
          </div>
        </div>

        <div style="font-size: 10px; font-weight: 700; color: #b45309; background: #fffbeb; padding: 5px 8px; border-radius: 4px; text-align: center; border: 1px dashed #fcd34d; margin-bottom: 10px;">
          DATA MODE: DEMO / PREVIEW
        </div>
      `;

      if (onSelectFlood) {
        const btn = document.createElement('button');
        btn.innerText = 'View Flood Inundation Analysis →';
        btn.style.cssText = 'width: 100%; padding: 7px; background: #0f172a; border: none; border-radius: 6px; font-size: 11px; font-weight: 700; color: #ffffff; cursor: pointer; transition: background 0.2s;';
        btn.onmouseover = () => { btn.style.background = '#1e293b'; };
        btn.onmouseout = () => { btn.style.background = '#0f172a'; };
        btn.onclick = () => { onSelectFlood(matchingZone as any); };
        popupDiv.appendChild(btn);
      }

        floodPolygon.bindPopup(popupDiv);
        floodLayerGroupRef.current.addLayer(floodPolygon);
      });
    }

    // ----------------------------------------------------
    // 3. LAYER 3: HEAVY RAIN (PRECIPITATION FIELD)
    // ----------------------------------------------------
    if (isDemoMode) {
      MOCK_HEAVY_RAIN_ZONES.forEach(rain => {
        const isCritical = rain.intensity === 'CRITICAL';
      const isHigh = rain.intensity === 'HIGH';
      
      const outerColor = isCritical ? '#6366f1' : isHigh ? '#06b6d4' : '#93c5fd';
      const coreColor = isCritical ? '#dc2626' : isHigh ? '#3b82f6' : '#0284c7';

      // Pulsing Intensity Fields
      const outerPolygon = L.polygon(rain.outerBoundary as [number, number][], {
        color: outerColor,
        fillColor: outerColor,
        fillOpacity: 0.18,
        weight: 1.2,
        className: shouldReduceMotion ? '' : 'animate-rain-pulse',
      });

      const corePolygon = L.polygon(rain.coreBoundary as [number, number][], {
        color: coreColor,
        fillColor: coreColor,
        fillOpacity: 0.28,
        weight: 1.5,
        className: shouldReduceMotion ? '' : 'animate-rain-pulse',
      });

      // Animated Layered Rain Streak Vectors for Depth
      rain.rainVectors.forEach((rVector, idx) => {
        const streakFast = L.polyline(rVector as [number, number][], {
          color: '#bae6fd',
          weight: 1,
          opacity: 0.4,
          className: shouldReduceMotion ? '' : 'animate-rain-fast',
        });
        const streakSlow = L.polyline(rVector as [number, number][], {
          color: '#e0f2fe',
          weight: 1.5,
          opacity: 0.75,
          className: shouldReduceMotion ? '' : (idx % 2 === 0 ? 'animate-rain-med' : 'animate-rain-slow'),
        });
        rainLayerGroupRef.current.addLayer(streakFast);
        rainLayerGroupRef.current.addLayer(streakSlow);
      });

      const popupDiv = document.createElement('div');
      popupDiv.style.cssText = 'padding: 12px; width: 250px; font-family: inherit;';
      popupDiv.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 10px;">
          <div>
            <div style="font-size: 10px; font-weight: 700; color: #0284c7; text-transform: uppercase;">PRECIPITATION INTENSITY</div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a;">${rain.name}</div>
          </div>
          <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background-color: ${isCritical ? '#fef2f2' : '#fff7ed'}; color: ${coreColor}; border: 1px solid ${coreColor}40;">
            ${rain.intensity}
          </span>
        </div>

        <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
          <strong>State:</strong> ${rain.state}
        </div>
        <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
          <strong>Accumulated Rain (24h):</strong> <span style="font-weight: 700; color: #0f172a;">${rain.rainfallMm24h} mm</span>
        </div>
        <div style="font-size: 11px; color: #475569; margin-bottom: 10px;">
          <strong>Districts Watch:</strong> ${rain.affectedDistricts.join(', ')}
        </div>

        <div style="font-size: 10px; font-weight: 700; color: #b45309; background: #fffbeb; padding: 5px 8px; border-radius: 4px; text-align: center; border: 1px dashed #fcd34d;">
          DATA MODE: DEMO / PREVIEW
        </div>
      `;

      outerPolygon.bindPopup(popupDiv);
      corePolygon.bindPopup(popupDiv);

        rainLayerGroupRef.current.addLayer(outerPolygon);
        rainLayerGroupRef.current.addLayer(corePolygon);
      });
    }

    // ----------------------------------------------------
    // 4. LAYER 4: WIND DIRECTION (CONTINUOUS ATMOSPHERIC FLOW)
    // ----------------------------------------------------
    if (isDemoMode) {
      MOCK_WIND_STREAMLINES.forEach((path, idx) => {
        // Background faint flow
      const flowBg = L.polyline(path, {
        color: '#38bdf8',
        weight: 3,
        opacity: 0.25,
        className: shouldReduceMotion ? '' : 'animate-wind-flow-slow',
      });
      // Foreground active streamline
      const flowFg = L.polyline(path, {
        color: '#7dd3fc',
        weight: 1.5,
        opacity: 0.75,
        className: shouldReduceMotion ? '' : (idx % 2 === 0 ? 'animate-wind-flow-fast' : 'animate-wind-flow-med'),
      });

      const endPoint = path[path.length - 1];
      const prevPoint = path[path.length - 2];
      
      const angle = Math.atan2(endPoint[0] - prevPoint[0], endPoint[1] - prevPoint[1]) * (180 / Math.PI);
      const arrowIcon = L.divIcon({
        className: 'wind-arrow-icon',
        html: `
          <div style="transform: rotate(${90 - angle}deg); color: #7dd3fc; opacity: 0.6; display: flex; align-items: center; justify-content: center;">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 22l10-4 10 4z"/>
            </svg>
          </div>
        `,
        iconSize: [8, 8],
        iconAnchor: [4, 4],
      });

      const arrowMarker = L.marker(endPoint, { icon: arrowIcon, interactive: false });

        windLayerGroupRef.current.addLayer(flowBg);
        windLayerGroupRef.current.addLayer(flowFg);
        windLayerGroupRef.current.addLayer(arrowMarker);
      });
    }

    // ----------------------------------------------------
    // 5. LAYER 5: ALERT MARKERS (RADAR SONAR PULSE)
    // ----------------------------------------------------
    if (isDemoMode) {
      MOCK_NATIONAL_ALERTS.forEach(alertItem => {
        const marker = L.marker([alertItem.lat, alertItem.lng], {
          icon: getAlertPinIcon(alertItem.severity),
        });

      const popupDiv = document.createElement('div');
      popupDiv.style.cssText = 'padding: 12px; width: 250px; font-family: inherit;';
      popupDiv.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 10px;">
          <div>
            <div style="font-size: 10px; font-weight: 700; color: #dc2626; text-transform: uppercase;">NATIONAL EMERGENCY ALERT</div>
            <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${alertItem.title}</div>
          </div>
          <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background-color: ${SEVERITY_COLORS[alertItem.severity].bg}; color: ${SEVERITY_COLORS[alertItem.severity].text}; border: 1px solid ${SEVERITY_COLORS[alertItem.severity].border};">
            ${alertItem.severity}
          </span>
        </div>

        <div style="font-size: 11px; color: #334155; margin-bottom: 6px;">
          <strong>Location:</strong> ${alertItem.location}
        </div>
        <div style="font-size: 11px; color: #475569; margin-bottom: 10px; line-height: 1.4;">
          ${alertItem.details}
        </div>

        <div style="font-size: 10px; font-weight: 700; color: #b45309; background: #fffbeb; padding: 5px 8px; border-radius: 4px; text-align: center; border: 1px dashed #fcd34d;">
          DATA MODE: DEMO / PREVIEW
        </div>
      `;

        marker.bindPopup(popupDiv);
        alertLayerGroupRef.current.addLayer(marker);
      });
    }

  }, [cyclones, floodZones, onSelectCyclone, onSelectFlood, shouldReduceMotion, isDemoMode]);

  const activeCount = Object.values(activeLayers).filter(Boolean).length;

  return (
    <motion.section 
      id="live-map-section"
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: 'easeOut' }}
      className="relative w-full border-b border-slate-200 bg-white disastra-map"
    >
      {/* Professional Command Header */}
      <div className="border-b border-slate-200 bg-white px-4 py-3.5 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                INDIA DISASTER MAP
                {isDemoMode && (
                  <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-300 uppercase tracking-widest">
                    DEMONSTRATION MODE ACTIVE
                  </span>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                National Disaster Intelligence Command Overview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Status: Active Monitoring
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 font-semibold text-slate-700">
              Layers: <strong className="text-blue-600 font-bold">{activeCount}/5 Active</strong>
            </span>
            <span className="hidden md:inline-flex bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200 font-mono text-slate-500 text-[11px]">
              Data Mode: Simulated
            </span>
          </div>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="relative h-[620px] w-full bg-slate-900 overflow-hidden" aria-label="Interactive India Disaster Map">
        <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full w-full" />

        {/* Floating Layer Controls Panel (Top Right Overlay) */}
        <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-md shadow-md border border-slate-200 rounded-lg p-3 w-48 sm:w-52 pointer-events-auto">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Map Layers</span>
            <span className="text-[10px] font-mono text-slate-400 font-semibold">{activeCount}/5 On</span>
          </div>
          <div className="mb-3 border-b border-slate-100 pb-3">
            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`w-full cursor-pointer rounded px-2 py-1.5 text-[11px] font-bold transition-colors ${
                isDemoMode 
                  ? 'bg-rose-100 text-rose-800 border border-rose-200 hover:bg-rose-200' 
                  : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              {isDemoMode ? 'Turn Off Demo Data' : 'Load Synthetic Demo'}
            </button>
          </div>
          <div className="space-y-1.5 text-xs">
            <label className="flex items-center justify-between gap-2 text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
              <span className="flex items-center gap-2 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                Flood Areas
              </span>
              <input
                type="checkbox"
                checked={activeLayers.flood}
                onChange={() => toggleLayer('flood')}
                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between gap-2 text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
              <span className="flex items-center gap-2 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                Cyclones
              </span>
              <input
                type="checkbox"
                checked={activeLayers.cyclone}
                onChange={() => toggleLayer('cyclone')}
                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between gap-2 text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
              <span className="flex items-center gap-2 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                Heavy Rain
              </span>
              <input
                type="checkbox"
                checked={activeLayers.heavyRain}
                onChange={() => toggleLayer('heavyRain')}
                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between gap-2 text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
              <span className="flex items-center gap-2 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                Wind Direction
              </span>
              <input
                type="checkbox"
                checked={activeLayers.wind}
                onChange={() => toggleLayer('wind')}
                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between gap-2 text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
              <span className="flex items-center gap-2 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                Alert Markers
              </span>
              <input
                type="checkbox"
                checked={activeLayers.alerts}
                onChange={() => toggleLayer('alerts')}
                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Floating Compact Legend Overlay (Bottom Left Overlay) */}
        <div className="absolute bottom-6 left-6 z-[400] bg-white/95 backdrop-blur-md shadow-md border border-slate-200 rounded-lg p-3.5 pointer-events-auto max-w-[250px]">
          <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Disaster Intelligence Legend
          </h3>

          <div className="space-y-2">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Severity Hierarchy</div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div>
                  <span className="text-[11px] font-semibold text-slate-700">Critical</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                  <span className="text-[11px] font-semibold text-slate-700">High</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <span className="text-[11px] font-semibold text-slate-700">Moderate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
                  <span className="text-[11px] font-semibold text-slate-700">Monitored</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Layer Indicators</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="w-1 h-1 bg-white rounded-full"></span>
                  </span>
                  <span>Cyclone Eye & Forecast Cone</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500/40 border border-cyan-600"></span>
                  <span>River Basin Flood Inundation</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500/40 border border-indigo-600"></span>
                  <span>Precipitation Intensity Zones</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                  <span className="w-3 text-sky-400 font-bold">→</span>
                  <span>Wind Flow Direction</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export const IndiaMap: React.FC<IndiaMapProps> = ({
  cyclones,
  floodZones,
  onSelectCyclone,
  onSelectFlood,
}) => {
  return (
    <MapDataProvider demoCyclones={cyclones} demoFloodZones={floodZones}>
      <IndiaMapInner onSelectCyclone={onSelectCyclone} onSelectFlood={onSelectFlood} />
    </MapDataProvider>
  );
};
