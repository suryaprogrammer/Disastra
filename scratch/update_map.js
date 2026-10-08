const fs = require('fs');
const path = require('path');

// 1. Update index.css
const cssPath = path.join(__dirname, '../src/index.css');
let css = fs.readFileSync(cssPath, 'utf-8');

const newCSS = `/* Cyclone Rotations (Layered) */
@keyframes cyclone-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes cyclone-spin-reverse { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
@keyframes cyclone-spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes cyclone-breathe {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}
.animate-cyclone-spin { animation: cyclone-spin 6s linear infinite; }
.animate-cyclone-spin-reverse { animation: cyclone-spin-reverse 8s linear infinite; }
.animate-cyclone-spin-slow { animation: cyclone-spin-slow 12s linear infinite; }
.animate-cyclone-breathe { animation: cyclone-breathe 4s ease-in-out infinite; }
.animate-cyclone-breathe-slow { animation: cyclone-breathe 8s ease-in-out infinite; }

/* Wind Flow */
@keyframes wind-dash-flow { from { stroke-dashoffset: 64; } to { stroke-dashoffset: 0; } }
@keyframes wind-dash-flow-reverse { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 64; } }
.animate-wind-flow-fast { stroke-dasharray: 4 12; animation: wind-dash-flow 1.5s linear infinite; }
.animate-wind-flow-med { stroke-dasharray: 8 20; animation: wind-dash-flow 2.5s linear infinite; }
.animate-wind-flow-slow { stroke-dasharray: 12 32; animation: wind-dash-flow 4s linear infinite; }
.animate-wind-flow-rev { stroke-dasharray: 6 16; animation: wind-dash-flow-reverse 3s linear infinite; }

/* Radar/Sonar Alert Pulse */
@keyframes radar-pulse {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(2.5); opacity: 0; }
}
.alert-pulse-ring-1 {
  position: absolute; inset: -6px; border-radius: 50%; border: 2px solid currentColor;
  animation: radar-pulse 2s cubic-bezier(0.1, 0.7, 1.0, 0.1) infinite; pointer-events: none;
}
.alert-pulse-ring-2 {
  position: absolute; inset: -6px; border-radius: 50%; border: 1.5px solid currentColor;
  animation: radar-pulse 2s cubic-bezier(0.1, 0.7, 1.0, 0.1) infinite 0.6s; pointer-events: none; opacity: 0;
}
.alert-pulse-ring-3 {
  position: absolute; inset: -6px; border-radius: 50%; border: 1px solid currentColor;
  animation: radar-pulse 2s cubic-bezier(0.1, 0.7, 1.0, 0.1) infinite 1.2s; pointer-events: none; opacity: 0;
}

/* Rain Flow */
@keyframes rain-streak-flow { from { stroke-dashoffset: 40; } to { stroke-dashoffset: 0; } }
.animate-rain-fast { stroke-dasharray: 4 12; animation: rain-streak-flow 0.8s linear infinite; }
.animate-rain-med { stroke-dasharray: 6 16; animation: rain-streak-flow 1.2s linear infinite; }
.animate-rain-slow { stroke-dasharray: 8 24; animation: rain-streak-flow 2s linear infinite; }
@keyframes rain-pulse {
  0% { fill-opacity: 0.15; }
  50% { fill-opacity: 0.28; }
  100% { fill-opacity: 0.15; }
}
.animate-rain-pulse { animation: rain-pulse 5s ease-in-out infinite; }

/* Flood Flow */
@keyframes flood-wave-flow { from { stroke-dashoffset: 48; } to { stroke-dashoffset: 0; } }
@keyframes flood-wave-flow-reverse { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 48; } }
.animate-flood-wave-fast { stroke-dasharray: 8 16; animation: flood-wave-flow 2.5s linear infinite; }
.animate-flood-wave-slow { stroke-dasharray: 12 24; animation: flood-wave-flow 4.5s linear infinite; }
.animate-flood-wave-rev { stroke-dasharray: 6 20; animation: flood-wave-flow-reverse 6s linear infinite; }
@keyframes flood-pulse {
  0% { fill-opacity: 0.18; }
  50% { fill-opacity: 0.32; }
  100% { fill-opacity: 0.18; }
}
.animate-flood-pulse { animation: flood-pulse 6s ease-in-out infinite; }

/* Trajectory Movement Animation */
@keyframes track-particle-move {
  from { stroke-dashoffset: 28; }
  to { stroke-dashoffset: 0; }
}
.animate-track-dash {
  stroke-dasharray: 6 8;
  animation: track-particle-move 1.8s linear infinite;
}

/* Disable heavy animations when reduced motion is requested */
@media (prefers-reduced-motion: reduce) {
  .animate-cyclone-spin, .animate-cyclone-spin-reverse, .animate-cyclone-spin-slow,
  .animate-cyclone-breathe, .animate-cyclone-breathe-slow,
  .animate-wind-flow-fast, .animate-wind-flow-med, .animate-wind-flow-slow, .animate-wind-flow-rev,
  .animate-rain-fast, .animate-rain-med, .animate-rain-slow, .animate-rain-pulse,
  .animate-flood-wave-fast, .animate-flood-wave-slow, .animate-flood-wave-rev, .animate-flood-pulse,
  .animate-track-dash, .alert-pulse-ring-1, .alert-pulse-ring-2, .alert-pulse-ring-3 {
    animation: none !important;
  }
}
`;

const popupStyles = `/* Custom Popup Styling */
.disastra-map .leaflet-popup-content-wrapper {
  background: #ffffff !important;
  border-radius: 8px !important;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 4px 6px -2px rgba(15, 23, 42, 0.05) !important;
  border: 1px solid #e2e8f0 !important;
  padding: 0 !important;
  overflow: hidden;
}

.disastra-map .leaflet-popup-content {
  margin: 0 !important;
  line-height: 1.4 !important;
}

.disastra-map .leaflet-popup-tip {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 4px 6px -2px rgba(15, 23, 42, 0.05) !important;
}`;

const beforeSplit = css.split('/* Cyclone Rotating Icon Animation */')[0];
const finalCss = beforeSplit + newCSS + '\n' + popupStyles + '\n\n.cursor-crosshair-map {\n  cursor: crosshair;\n}\n';

fs.writeFileSync(cssPath, finalCss);


// 2. Update IndiaMap.tsx
const tsxPath = path.join(__dirname, '../src/components/IndiaMap/IndiaMap.tsx');
let tsx = fs.readFileSync(tsxPath, 'utf-8');

// Replace getCycloneDivIcon
const oldCycloneDivIcon = `const getCycloneDivIcon = (category: string, severity: 'CRITICAL' | 'HIGH' | 'MODERATE' = 'CRITICAL') => {
  const color = SEVERITY_COLORS[severity].hex;
  return L.divIcon({
    className: 'custom-div-icon',
    html: \`
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; inset: -3px; border-radius: 50%; border: 1.5px dashed \${color}; opacity: 0.85;" class="animate-cyclone-spin"></div>
        <div style="background-color: \${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <svg class="animate-cyclone-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a10 10 0 0 0-10 10c0 4.42 2.87 8.17 6.84 9.5"/>
            <path d="M12 22a10 10 0 0 0 10-10c0-4.42-2.87-8.17-6.84-9.5"/>
            <circle cx="12" cy="12" r="2.5" fill="white"/>
          </svg>
        </div>
      </div>
    \`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};`;

const newCycloneDivIcon = `const getCycloneDivIcon = (category: string, severity: 'CRITICAL' | 'HIGH' | 'MODERATE' = 'CRITICAL') => {
  const color = SEVERITY_COLORS[severity].hex;
  return L.divIcon({
    className: 'custom-div-icon',
    html: \`
      <div style="position: relative; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div style="background-color: \${color}; width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid #ffffff; box-shadow: 0 0 10px \${color}80; display: flex; align-items: center; justify-content: center;">
          <div style="background-color: #ffffff; width: 4px; height: 4px; border-radius: 50%;"></div>
        </div>
      </div>
    \`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};`;

tsx = tsx.replace(oldCycloneDivIcon, newCycloneDivIcon);

// Replace getAlertPinIcon
const oldAlertPinIcon = `const getAlertPinIcon = (severity: keyof typeof SEVERITY_COLORS) => {
  const color = SEVERITY_COLORS[severity].hex;
  return L.divIcon({
    className: 'custom-div-icon',
    html: \`
      <div style="position: relative; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div class="alert-pulse-ring" style="color: \${color}; inset: -5px;"></div>
        <div style="background-color: \${color}; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.4);"></div>
      </div>
    \`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};`;

const newAlertPinIcon = `const getAlertPinIcon = (severity: keyof typeof SEVERITY_COLORS) => {
  const color = SEVERITY_COLORS[severity].hex;
  return L.divIcon({
    className: 'custom-div-icon',
    html: \`
      <div style="position: relative; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div class="alert-pulse-ring-1" style="color: \${color};"></div>
        <div class="alert-pulse-ring-2" style="color: \${color};"></div>
        <div class="alert-pulse-ring-3" style="color: \${color};"></div>
        <div style="background-color: \${color}; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px \${color}80;"></div>
      </div>
    \`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};`;

tsx = tsx.replace(oldAlertPinIcon, newAlertPinIcon);

// Replace Layer Rendering UseEffect
const layerRenderEffectRegex = /useEffect\(\(\) => \{\n\s+const map = leafletMapRef\.current;\n\s+if \(!map\) return;[\s\S]*?\}, \[cyclones, floodZones, onSelectCyclone, onSelectFlood, shouldReduceMotion\]\);/;

const newLayerRenderEffect = `useEffect(() => {
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

          ptMarker.bindTooltip(\`\${pt.timeLabel}: \${pt.windSpeedKmh} km/h (\${pt.category})\`, {
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
      popupDiv.innerHTML = \`
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 10px;">
          <div>
            <div style="font-size: 10px; font-weight: 700; color: #2563eb; text-transform: uppercase;">CYCLONE SYSTEM</div>
            <div style="font-size: 15px; font-weight: 800; color: #0f172a; text-transform: uppercase;">\${cyclone.name}</div>
          </div>
          <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background-color: \${SEVERITY_COLORS[severity].bg}; color: \${SEVERITY_COLORS[severity].text}; border: 1px solid \${SEVERITY_COLORS[severity].border};">
            \${severity}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; margin-bottom: 12px;">
          <div style="background: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #f1f5f9;">
            <div style="color: #64748b; font-size: 10px; font-weight: 600;">Category</div>
            <div style="color: #0f172a; font-weight: 700;">\${cyclone.currentCategory}</div>
          </div>
          <div style="background: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #f1f5f9;">
            <div style="color: #64748b; font-size: 10px; font-weight: 600;">Max Sustained Wind</div>
            <div style="color: #0f172a; font-weight: 700;">\${cyclone.sustainedWindKmh} km/h</div>
          </div>
          <div style="background: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #f1f5f9;">
            <div style="color: #64748b; font-size: 10px; font-weight: 600;">Movement</div>
            <div style="color: #0f172a; font-weight: 700;">\${cyclone.movementDirection} @ \${cyclone.movementSpeedKmh} km/h</div>
          </div>
          <div style="background: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #f1f5f9;">
            <div style="color: #64748b; font-size: 10px; font-weight: 600;">Landfall Target</div>
            <div style="color: #0f172a; font-weight: 700;">\${cyclone.closestLandfallPoint}</div>
          </div>
        </div>

        <div style="font-size: 10px; font-weight: 700; color: #b45309; background: #fffbeb; padding: 5px 8px; border-radius: 4px; text-align: center; border: 1px dashed #fcd34d; margin-bottom: 10px;">
          DATA MODE: DEMO / PREVIEW
        </div>
      \`;

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
      popupDiv.innerHTML = \`
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 10px;">
          <div>
            <div style="font-size: 10px; font-weight: 700; color: #0891b2; text-transform: uppercase;">FLOOD INUNDATION ZONE</div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase;">\${fPoly.basin}</div>
          </div>
          <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background-color: \${SEVERITY_COLORS[levelKey].bg}; color: \${SEVERITY_COLORS[levelKey].text}; border: 1px solid \${SEVERITY_COLORS[levelKey].border};">
            \${fPoly.warningLevel}
          </span>
        </div>

        <div style="font-size: 12px; color: #334155; margin-bottom: 8px; font-weight: 600;">
          State: <span style="font-weight: 700; color: #0f172a;">\${fPoly.state}</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; margin-bottom: 12px;">
          <div style="background: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #f1f5f9;">
            <div style="color: #64748b; font-size: 10px; font-weight: 600;">Water Level</div>
            <div style="color: #0f172a; font-weight: 700;">\${fPoly.waterLevelCurrentM}m (Danger: \${fPoly.waterLevelDangerM}m)</div>
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
      \`;

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

    // ----------------------------------------------------
    // 3. LAYER 3: HEAVY RAIN (PRECIPITATION FIELD)
    // ----------------------------------------------------
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
      popupDiv.innerHTML = \`
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 10px;">
          <div>
            <div style="font-size: 10px; font-weight: 700; color: #0284c7; text-transform: uppercase;">PRECIPITATION INTENSITY</div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a;">\${rain.name}</div>
          </div>
          <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background-color: \${isCritical ? '#fef2f2' : '#fff7ed'}; color: \${coreColor}; border: 1px solid \${coreColor}40;">
            \${rain.intensity}
          </span>
        </div>

        <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
          <strong>State:</strong> \${rain.state}
        </div>
        <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
          <strong>Accumulated Rain (24h):</strong> <span style="font-weight: 700; color: #0f172a;">\${rain.rainfallMm24h} mm</span>
        </div>
        <div style="font-size: 11px; color: #475569; margin-bottom: 10px;">
          <strong>Districts Watch:</strong> \${rain.affectedDistricts.join(', ')}
        </div>

        <div style="font-size: 10px; font-weight: 700; color: #b45309; background: #fffbeb; padding: 5px 8px; border-radius: 4px; text-align: center; border: 1px dashed #fcd34d;">
          DATA MODE: DEMO / PREVIEW
        </div>
      \`;

      outerPolygon.bindPopup(popupDiv);
      corePolygon.bindPopup(popupDiv);

      rainLayerGroupRef.current.addLayer(outerPolygon);
      rainLayerGroupRef.current.addLayer(corePolygon);
    });

    // ----------------------------------------------------
    // 4. LAYER 4: WIND DIRECTION (CONTINUOUS ATMOSPHERIC FLOW)
    // ----------------------------------------------------
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
        html: \`
          <div style="transform: rotate(\${90 - angle}deg); color: #7dd3fc; opacity: 0.6; display: flex; align-items: center; justify-content: center;">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 22l10-4 10 4z"/>
            </svg>
          </div>
        \`,
        iconSize: [8, 8],
        iconAnchor: [4, 4],
      });

      const arrowMarker = L.marker(endPoint, { icon: arrowIcon, interactive: false });

      windLayerGroupRef.current.addLayer(flowBg);
      windLayerGroupRef.current.addLayer(flowFg);
      windLayerGroupRef.current.addLayer(arrowMarker);
    });

    // ----------------------------------------------------
    // 5. LAYER 5: ALERT MARKERS (RADAR SONAR PULSE)
    // ----------------------------------------------------
    MOCK_NATIONAL_ALERTS.forEach(alertItem => {
      const marker = L.marker([alertItem.lat, alertItem.lng], {
        icon: getAlertPinIcon(alertItem.severity),
      });

      const popupDiv = document.createElement('div');
      popupDiv.style.cssText = 'padding: 12px; width: 250px; font-family: inherit;';
      popupDiv.innerHTML = \`
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 10px;">
          <div>
            <div style="font-size: 10px; font-weight: 700; color: #dc2626; text-transform: uppercase;">NATIONAL EMERGENCY ALERT</div>
            <div style="font-size: 13px; font-weight: 800; color: #0f172a;">\${alertItem.title}</div>
          </div>
          <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background-color: \${SEVERITY_COLORS[alertItem.severity].bg}; color: \${SEVERITY_COLORS[alertItem.severity].text}; border: 1px solid \${SEVERITY_COLORS[alertItem.severity].border};">
            \${alertItem.severity}
          </span>
        </div>

        <div style="font-size: 11px; color: #334155; margin-bottom: 6px;">
          <strong>Location:</strong> \${alertItem.location}
        </div>
        <div style="font-size: 11px; color: #475569; margin-bottom: 10px; line-height: 1.4;">
          \${alertItem.details}
        </div>

        <div style="font-size: 10px; font-weight: 700; color: #b45309; background: #fffbeb; padding: 5px 8px; border-radius: 4px; text-align: center; border: 1px dashed #fcd34d;">
          DATA MODE: DEMO / PREVIEW
        </div>
      \`;

      marker.bindPopup(popupDiv);
      alertLayerGroupRef.current.addLayer(marker);
    });

  }, [cyclones, floodZones, onSelectCyclone, onSelectFlood, shouldReduceMotion]);`;

tsx = tsx.replace(layerRenderEffectRegex, newLayerRenderEffect);

fs.writeFileSync(tsxPath, tsx);
console.log('Update complete');
