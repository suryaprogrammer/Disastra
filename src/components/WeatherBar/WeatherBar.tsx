import React, { useState, useEffect, useCallback } from 'react';
import {
  CloudRain,
  Wind,
  Gauge,
  Thermometer,
  Eye,
  RefreshCw,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Cloud
} from 'lucide-react';
import { disastraApi } from '../../services/api';
import { WeatherResponse } from '../../types/weather';

const LOCATIONS = [
  { id: 'mumbai', name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { id: 'delhi', name: 'New Delhi', lat: 28.6139, lon: 77.2090 },
  { id: 'chennai', name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { id: 'kolkata', name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { id: 'bengaluru', name: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
  { id: 'kochi', name: 'Kochi', lat: 9.9312, lon: 76.2673 },
  { id: 'bhubaneswar', name: 'Bhubaneswar', lat: 20.2961, lon: 85.8245 },
];

export const WeatherBar: React.FC = () => {
  const [selectedLocId, setSelectedLocId] = useState(LOCATIONS[0].id);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchWeather = useCallback(async (locationId: string) => {
    setIsLoading(true);
    setError(null);
    
    const loc = LOCATIONS.find(l => l.id === locationId) || LOCATIONS[0];
    
    try {
      const data = await disastraApi.getWeather(loc.lat, loc.lon);
      setWeather(data);
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError("Weather monitoring service could not retrieve current conditions.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather(selectedLocId);
  }, [selectedLocId, fetchWeather]);

  const handleRefresh = () => {
    fetchWeather(selectedLocId);
  };

  const renderContent = () => {
    if (isLoading && !weather) {
      return (
        <div className="flex h-32 items-center justify-center gap-3 text-slate-500">
          <RefreshCw className="h-5 w-5 animate-spin text-slate-400" />
          <span className="font-medium">Loading Weather Intelligence...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-32 flex-col items-center justify-center gap-2 text-rose-600 bg-rose-50/50 rounded-lg border border-rose-100">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="h-5 w-5" />
            <span>WEATHER DATA UNAVAILABLE</span>
          </div>
          <span className="text-sm text-rose-500">{error}</span>
        </div>
      );
    }

    if (!weather) return null;

    return (
      <>
        {/* High-Density Scientific Weather Telemetry Strip */}
        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3 lg:grid-cols-5">
          {/* 1. TEMPERATURE */}
          <div className="space-y-1 border-r border-slate-100 pr-4 last:border-r-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Thermometer className="h-3.5 w-3.5 text-amber-600" />
              <span>Temperature</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-3xl font-bold tracking-tight text-slate-950">
                {weather.weather.temperature_c}
              </span>
              <span className="font-mono text-xs uppercase text-slate-500">°C</span>
            </div>
            <div className="font-mono text-[11px] text-slate-500">
              Feels Like: <span className="font-semibold text-slate-700">{weather.weather.feels_like_c}°C</span>
            </div>
          </div>

          {/* 2. ATMOSPHERIC PRESSURE */}
          <div className="space-y-1 border-r border-slate-100 pr-4 last:border-r-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Gauge className="h-3.5 w-3.5 text-rose-600" />
              <span>Pressure & Humidity</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-3xl font-bold tracking-tight text-slate-950">
                {weather.weather.pressure_hpa}
              </span>
              <span className="font-mono text-xs uppercase text-slate-500">hPa</span>
            </div>
            <div className="font-mono text-[11px] text-slate-500">
              Humidity: <span className="font-semibold text-slate-700">{weather.weather.humidity_percent}%</span>
            </div>
          </div>

          {/* 3. WIND SPEED */}
          <div className="space-y-1 border-r border-slate-100 pr-4 last:border-r-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Wind className="h-3.5 w-3.5 text-sky-600" />
              <span>Wind Velocity</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-3xl font-bold tracking-tight text-slate-950">
                {weather.weather.wind_speed_kmh}
              </span>
              <span className="font-mono text-xs uppercase text-slate-500">km/h</span>
            </div>
            <div className="font-mono text-[11px] text-slate-500 truncate">
              Dir: <span className="font-semibold text-slate-700">{weather.weather.wind_direction_label} ({weather.weather.wind_direction_deg}°)</span>
              {weather.weather.wind_gust_kmh && ` · Gust: ${weather.weather.wind_gust_kmh}`}
            </div>
          </div>

          {/* 4. VISIBILITY & CLOUDS */}
          <div className="space-y-1 border-r border-slate-100 pr-4 last:border-r-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Eye className="h-3.5 w-3.5 text-slate-600" />
              <span>Optical Visibility</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-3xl font-bold tracking-tight text-slate-950">
                {weather.weather.visibility_km}
              </span>
              <span className="font-mono text-xs uppercase text-slate-500">km</span>
            </div>
            <div className="font-mono text-[11px] text-slate-500">
              Cloud Cover: <span className="font-semibold text-slate-700">{weather.weather.cloud_cover_percent}%</span>
            </div>
          </div>

          {/* 5. PRECIPITATION / CONDITION */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {weather.weather.precipitation_1h_mm != null ? (
                <CloudRain className="h-3.5 w-3.5 text-blue-600" />
              ) : (
                <Cloud className="h-3.5 w-3.5 text-slate-600" />
              )}
              <span>{weather.weather.precipitation_1h_mm != null ? 'Current Precipitation' : 'Condition'}</span>
            </div>
            <div className="flex items-baseline gap-1">
              {weather.weather.precipitation_1h_mm != null ? (
                <>
                  <span className="font-mono text-3xl font-bold tracking-tight text-slate-950">
                    {weather.weather.precipitation_1h_mm}
                  </span>
                  <span className="font-mono text-xs uppercase text-slate-500">mm/h</span>
                </>
              ) : (
                <span className="text-xl font-bold tracking-tight text-slate-950 truncate max-w-full">
                  {weather.weather.condition}
                </span>
              )}
            </div>
            <div className="font-mono text-[11px] text-slate-500">
              Status: <span className="font-semibold text-slate-700 capitalize">{weather.weather.description}</span>
            </div>
          </div>
        </div>

        {/* Source & Provenance */}
        <div className="mt-4 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Weather data provided by <strong className="font-medium text-slate-800">OpenWeather</strong></span>
          </div>
          <div className="font-mono text-[10px] text-slate-400">
            Observed: {new Date(weather.observed_at).toLocaleString()}
          </div>
        </div>
      </>
    );
  };

  return (
    <section className="w-full border-b border-slate-200 bg-white py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {/* Header row: Station switch + status badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Weather Monitoring
            </span>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>Location:</span>
              <select
                value={selectedLocId}
                onChange={(e) => setSelectedLocId(e.target.value)}
                disabled={isLoading}
                className="cursor-pointer rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-medium text-slate-800 transition-colors hover:border-slate-300 focus:outline-none disabled:opacity-50"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {error ? (
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                <span>WEATHER UNAVAILABLE</span>
              </div>
            ) : weather?.mode === 'LIVE' ? (
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>LIVE — OPENWEATHER</span>
              </div>
            ) : weather ? (
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                <span>STATIC DATA</span>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              title="Refresh weather data"
              className="flex cursor-pointer items-center gap-1 text-slate-500 hover:text-slate-900 font-mono text-[11px] disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {renderContent()}
      </div>
    </section>
  );
};
