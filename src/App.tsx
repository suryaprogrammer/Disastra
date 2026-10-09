/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TopNavbar } from './components/Navigation/TopNavbar';
import { HeroHeader } from './components/Hero/HeroHeader';
import { IndiaMap } from './components/IndiaMap/IndiaMap';
import { WeatherBar } from './components/WeatherBar/WeatherBar';

import { FloodDetection } from './components/FloodDetection/FloodDetection';
import { RiskIntelligence } from './components/RiskIntelligence/RiskIntelligence';
import { AgentStatus } from './components/AgentStatus/AgentStatus';
import { AISituationBrief } from './components/AISituationBrief/AISituationBrief';
import { AlertTimeline } from './components/AlertTimeline/AlertTimeline';
import { IndiaOverview } from './components/IndiaOverview/IndiaOverview';
import { Footer } from './components/Footer/Footer';

// Data services and mock fallbacks
import { disastraApi } from './services/api';

import { CycloneSystem } from './types/cyclone';
import { FloodZone } from './types/flood';
import {
  RiskSubIndex,
  AgentTelemetry,
  SituationBrief,
  DisasterOverviewStats,
  DisasterAlertEvent,
} from './types/disaster';


import { mockActiveCyclones } from './data/mockCyclone';
import { mockFloodZones } from './data/mockFlood';
import {
  mockOverviewStats,
} from './data/mockRisk';
import { mockAlertTimeline } from './data/mockAlerts';

export default function App() {
  const [cyclones, setCyclones] = useState<CycloneSystem[]>([]);
  const [floodZones, setFloodZones] = useState<FloodZone[]>([]);
  const [riskIndices, setRiskIndices] = useState<RiskSubIndex[]>([]);
  const [agentStatus, setAgentStatus] = useState<any>(null);
  const [brief, setBrief] = useState<SituationBrief | null>(null);
  const [overviewStats, setOverviewStats] = useState<DisasterOverviewStats | null>(null);
  const [alerts, setAlerts] = useState<DisasterAlertEvent[]>([]);
  const [alertsError, setAlertsError] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  // Ingest data via centralized API service
  useEffect(() => {
    async function loadDisasterData() {
      // Fetch each data source independently to prevent a single failure from blanking the app
      
      const fetchCyclones = async () => {
        try { const data = await disastraApi.getCyclones(); setCyclones(data); } catch {}
      };
      
      const fetchFloodRisk = async () => {
        try { const data = await disastraApi.getFloodRisk(); setFloodZones(data); } catch {}
      };
      
      const fetchRiskIndices = async () => {
        try { const data = await disastraApi.getRiskIndices(); setRiskIndices(data); } catch {}
      };
      
      const fetchAgents = async () => {
        try { const data = await disastraApi.getAgentsStatus(); setAgentStatus(data); } catch {}
      };
      
      const fetchBrief = async () => {
        try { const data = await disastraApi.getSituationBrief(); setBrief(data); } catch {}
      };
      
      const fetchOverview = async () => {
        try { const data = await disastraApi.getOverviewStats(); setOverviewStats(data); } catch {}
      };
      
      const fetchAlerts = async () => {
        try { 
          const data = await disastraApi.getAlerts(); 
          setAlerts(data); 
          setAlertsError(false);
        } catch {
          setAlertsError(true);
        }
      };

      await Promise.allSettled([
        fetchCyclones(),
        fetchFloodRisk(),
        fetchRiskIndices(),
        fetchAgents(),
        fetchBrief(),
        fetchOverview(),
        fetchAlerts(),
      ]);

      setIsLoading(false);
    }

    loadDisasterData();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCycloneFromMap = (cyclone: CycloneSystem) => {
    scrollToSection('cyclone-tracker-section');
  };

  const handleSelectFloodFromMap = (flood: FloodZone) => {
    scrollToSection('flood-detection-section');
  };

  const handleEventLocationFocus = (coords: [number, number]) => {
    scrollToSection('live-map-section');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Top 3-Zone Navigation Contract */}
      <TopNavbar 
        onNavigate={scrollToSection} 
        activeAlertCount={alerts.length}
        alertError={alertsError}
      />

      <main className="flex-1 w-full">
        {/* 1. DISASTRA HERO / COMMAND HEADER */}
        <HeroHeader
          onOpenMap={() => scrollToSection('live-map-section')}
          onViewAlerts={() => scrollToSection('alert-timeline-section')}
        />

        {/* 2. ANIMATED INDIA INTELLIGENCE MAP (CENTERPIECE) */}
        <IndiaMap
          cyclones={cyclones}
          floodZones={floodZones}
          onSelectCyclone={handleSelectCycloneFromMap}
          onSelectFlood={handleSelectFloodFromMap}
        />

        {/* 3. LIVE WEATHER INTELLIGENCE BAR */}
        <WeatherBar />

        {/* 11. INDIA DISASTER OVERVIEW (High-density full-width metrics) */}
        {overviewStats && <IndiaOverview stats={overviewStats} />}

        {/* 5. FLOOD DETECTION PANEL */}
        <FloodDetection floodZones={floodZones} />

        {/* 6. AI RISK INTELLIGENCE */}
        <RiskIntelligence riskIndices={riskIndices} />

        {/* 8. AUTONOMOUS AGENT STATUS */}
        <AgentStatus agentStatus={agentStatus} />

        {/* 9. GENERATIVE AI SITUATION REPORT */}
        <AISituationBrief initialBrief={brief || {
          id: 'awaiting-analysis',
          headline: 'AWAITING ANALYSIS',
          executiveSummary: 'Run Flood Analysis to synthesize situation briefing.',
          keyThreats: [],
          recommendedActions: [],
          generatedAt: '-',
          generatedBy: '-',
          modelEngine: '-',
          dataSources: [],
          confidenceScorePct: 0,
        }} />

        {/* 10. ALERT / EARLY WARNING TIMELINE */}
        <AlertTimeline
          initialAlerts={alerts}
          initialError={alertsError}
          onSelectEventLocation={handleEventLocationFocus}
        />
      </main>

      {/* Footer with API specifications and architecture standards */}
      <Footer />
    </div>
  );
}
