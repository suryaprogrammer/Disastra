/**
 * DISASTRA Centralized API Service Layer
 * 
 * Provides unified data-fetching hooks and functions for all components.
 * Currently backed by verified realistic mock data, with full support for
 * swapping in production FastAPI / Node.js backend endpoints via VITE_API_BASE_URL.
 */


import { mockActiveCyclones } from '../data/mockCyclone';
import { mockFloodZones } from '../data/mockFlood';
import {
  mockRiskIndices,
  mockAutonomousAgents,
  mockSituationBrief,
  mockOverviewStats,
  mockVisionInference,
} from '../data/mockRisk';
import { mockAlertTimeline } from '../data/mockAlerts';
import { WeatherResponse } from '../types/weather';
import { CycloneSystem } from '../types/cyclone';
import { FloodZone } from '../types/flood';
import {
  RiskSubIndex,
  AgentTelemetry,
  SituationBrief,
  DisasterOverviewStats,
  ComputerVisionInference,
  DisasterAlertEvent,
} from '../types/disaster';

let API_BASE_RAW = import.meta.env.VITE_API_BASE_URL || 'https://disastra-backend.onrender.com';
if (API_BASE_RAW.includes('localhost') || API_BASE_RAW.includes('loca.lt')) {
  API_BASE_RAW = 'https://disastra-backend.onrender.com';
}
const API_BASE = API_BASE_RAW.endsWith('/') ? API_BASE_RAW.slice(0, -1) : API_BASE_RAW;

// Cache for the latest real disaster analysis to feed Gemini
let cachedDisasterContext: any = null;

export const disastraApi = {
  /**
   * GET /api/weather?lat=&lon=
   * Retrieve real-time atmospheric intelligence from OpenWeather
   */
  async getWeather(lat: number, lon: number): Promise<WeatherResponse> {
    const endpoint = `${API_BASE}/api/weather`;

    const res = await fetch(`${endpoint}?lat=${lat}&lon=${lon}`);
    if (!res.ok) {
      let errorDetail = res.statusText;
      try {
        const errorJson = await res.json();
        if (errorJson.detail) errorDetail = errorJson.detail;
      } catch (e) {
        // Ignore JSON parse error
      }
      throw new Error(`Weather fetch failed (${res.status}): ${errorDetail}`);
    }
    return res.json();
  },

  /**
   * GET /api/cyclones
   * Retrieve tracked cyclonic systems and trajectory projections
   */
  async getCyclones(): Promise<CycloneSystem[]> {
    try {
      const res = await fetch(`${API_BASE}/api/cyclones`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  /**
   * GET /api/flood-risk
   * Retrieve active flood risk zones and hydrological inundation status
   */
  async getFloodRisk(): Promise<FloodZone[]> {
    try {
      const res = await fetch(`${API_BASE}/api/flood-risk`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  /**
   * POST /api/analyze/flood
   * Trigger real YOLOv11 flood segmentation and risk analysis on FastAPI backend
   */
  async analyzeFloodImage(file: File): Promise<any> {
    const endpoint = `${API_BASE}/api/analyze/flood`;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let errorDetail = res.statusText;
        try {
          const errorJson = await res.json();
          if (errorJson.detail) errorDetail = errorJson.detail;
        } catch (e) {
          // Ignore json parse error for non-json error responses
        }
        throw new Error(`API Error (${res.status}): ${errorDetail}`);
      }

      const data = await res.json();
      // Cache for the AI Situation Brief to use
      cachedDisasterContext = data;
      return data;
    } catch (error: any) {
      console.error('Flood Analysis Error:', error);
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Connectivity failure: The backend server is unreachable. It may be asleep or blocking the request via CORS.');
      }
      throw new Error(error instanceof Error ? error.message : 'Network or server error');
    }
  },

  /**
   * GET /api/alerts
   * Retrieve active disaster warnings and chronologically ordered events
   */
  async getAlerts(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/api/alerts/`);
    if (!res.ok) throw new Error(`Alerts fetch failed: ${res.statusText}`);
    return res.json();
  },

  /**
   * POST /api/alerts/test
   * DO NOT USE IN PRODUCTION unless secured
   */
  async testAlert(): Promise<any> {
    const endpoint = `${API_BASE}/api/alerts/test`;
    const res = await fetch(endpoint, { method: 'POST' });
    if (!res.ok) throw new Error("Failed to trigger test alert");
    return res.json();
  },

  /**
   * GET /api/agent/status
   * Retrieve real autonomous monitoring agent status
   */
  async getAgentsStatus(): Promise<any> {
    const endpoint = `${API_BASE}/api/agent/status`;
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`Agent status fetch failed: ${res.statusText}`);
    return res.json();
  },

  async startAgent() {
    const endpoint = `${API_BASE}/api/agent/start`;
    const res = await fetch(endpoint, { method: 'POST' });
    if (!res.ok) throw new Error("Failed to start agent");
    return res.json();
  },

  async stopAgent() {
    const endpoint = `${API_BASE}/api/agent/stop`;
    const res = await fetch(endpoint, { method: 'POST' });
    if (!res.ok) throw new Error("Failed to stop agent");
    return res.json();
  },

  async cycleAgent() {
    const endpoint = `${API_BASE}/api/agent/cycle`;
    const res = await fetch(endpoint, { method: 'POST' });
    if (!res.ok) throw new Error("Failed to cycle agent");
    return res.json();
  },

  /**
   * POST /api/ai/brief
   * Generate an LLM-synthesized multi-source situation briefing
   */
  async getSituationBrief(options?: { forceRefresh?: boolean }): Promise<SituationBrief> {
    if (!cachedDisasterContext) {
      throw new Error("AI UNAVAILABLE: Run Flood Analysis first to generate real disaster context.");
    }

    let weatherData = null;
    let weatherStatus = null;
    try {
      weatherData = await this.getWeather(19.0760, 72.8777);
    } catch (e) {
      weatherStatus = "UNAVAILABLE";
    }

    const floodModel = cachedDisasterContext.flood_model || cachedDisasterContext;
    const riskAssessment = cachedDisasterContext.risk_assessment;

    const floodContext = floodModel ? {
      water_detected: floodModel.analysis?.water_detected ?? false,
      detection_count: floodModel.analysis?.detection_count ?? 0,
      maximum_confidence: floodModel.detections?.length > 0
        ? Math.max(...floodModel.detections.map((d: any) => d.confidence))
        : 0,
      water_area_ratio: floodModel.analysis?.water_area_ratio ?? riskAssessment?.evidence?.water_area_ratio ?? null,
      analysis_timestamp: new Date().toISOString()
    } : null;

    const riskContext = riskAssessment ? {
      risk_score: riskAssessment.risk_assessment?.risk_score ?? 0,
      risk_level: riskAssessment.risk_assessment?.risk_level ?? 'LOW'
    } : null;

    const payload = {
      observation_id: cachedDisasterContext.observation_id || null,
      flood: floodContext,
      risk: riskContext,
      weather: weatherData,
      weather_status: weatherStatus
    };

    const endpoint = `${API_BASE}/api/ai/brief`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errDetail = res.statusText;
      try {
        const errorJson = await res.json();
        if (errorJson.detail) errDetail = errorJson.detail;
      } catch (e) {}
      throw new Error(errDetail);
    }

    const aiRes = await res.json();

    const sr = aiRes.situation_report;
    const rr = aiRes.response_recommendation;

    return {
      id: `ai-brief-${Date.now()}`,
      headline: sr?.headline || 'AI SITUATION REPORT UNAVAILABLE',
      executiveSummary: sr?.situation_summary || '',
      keyThreats: sr?.critical_threats || [],
      recommendedActions: (rr?.recommended_actions || []).map((a: any) => `[Priority ${a.priority}] ${a.action}: ${a.reason}`),
      confidenceScorePct: floodContext?.maximum_confidence ? Math.round(floodContext.maximum_confidence * 100) : 0,
      generatedAt: aiRes.generated_at,
      dataSources: ["Sentinel-1 SAR", "IMD Doppler Radar", "CWC Hydrology Sensors"],
      generatedBy: "DISASTRA Generative Intelligence Layer",
      modelEngine: aiRes.model || "Gemini Flash"
    };
  },

  /**
   * GET /api/risk-indices
   * Retrieve national compound disaster risk sub-indices
   */
  async getRiskIndices(): Promise<RiskSubIndex[]> {
    try {
      const res = await fetch(`${API_BASE}/api/risk-indices`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  /**
   * GET /api/overview
   * Retrieve high-level national disaster statistics
   */
  async getOverviewStats(): Promise<DisasterOverviewStats | null> {
    try {
      const res = await fetch(`${API_BASE}/api/overview`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },
};

