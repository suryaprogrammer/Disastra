import React, { createContext, useContext, useState, useEffect } from 'react';
import { CycloneSystem } from '../../types/cyclone';
import { FloodZone } from '../../types/flood';

export type MapMode = 'DEMO' | 'LIVE';

export interface WeatherData {
  // typed interface for future live weather provider
  temperature: number;
  windSpeed: number;
  humidity: number;
}

export interface MapDataState {
  mode: MapMode;
  cyclones: CycloneSystem[];
  floodZones: FloodZone[];
  weather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
}

interface MapDataContextType extends MapDataState {
  setMode: (mode: MapMode) => void;
}

const MapDataContext = createContext<MapDataContextType | undefined>(undefined);

export interface MapDataProviderProps {
  children: React.ReactNode;
  // Demo data passed in from the application root (App.tsx)
  demoCyclones?: CycloneSystem[];
  demoFloodZones?: FloodZone[];
}

export const MapDataProvider: React.FC<MapDataProviderProps> = ({
  children,
  demoCyclones = [],
  demoFloodZones = [],
}) => {
  const [mode, setMode] = useState<MapMode>('DEMO');
  const [cyclones, setCyclones] = useState<CycloneSystem[]>(demoCyclones);
  const [floodZones, setFloodZones] = useState<FloodZone[]>(demoFloodZones);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Future live data fetching architecture
  useEffect(() => {
    if (mode === 'LIVE') {
      let isMounted = true;
      setIsLoading(true);
      setError(null);

      const fetchLiveData = async () => {
        try {
          // Future integration: fetch real cyclone/flood/weather APIs here.
          // For now, immediately fallback gracefully to DEMO behavior if no keys/providers exist.
          // This ensures the map never becomes a blank white page due to missing API keys.
          if (isMounted) {
             setCyclones(demoCyclones);
             setFloodZones(demoFloodZones);
             setIsLoading(false);
          }
        } catch (err) {
          if (isMounted) {
            console.error('LIVE data fetch failed, falling back to DEMO data:', err);
            // Graceful fallback to DEMO MODE
            setMode('DEMO');
            setCyclones(demoCyclones);
            setFloodZones(demoFloodZones);
            setError('Failed to fetch live data. Falling back to DEMO mode.');
            setIsLoading(false);
          }
        }
      };

      fetchLiveData();

      return () => {
        isMounted = false;
      };
    } else {
      // DEMO mode
      setCyclones(demoCyclones);
      setFloodZones(demoFloodZones);
      setError(null);
    }
  }, [mode, demoCyclones, demoFloodZones]);

  return (
    <MapDataContext.Provider value={{ mode, cyclones, floodZones, weather, isLoading, error, setMode }}>
      {children}
    </MapDataContext.Provider>
  );
};

export const useMapData = () => {
  const context = useContext(MapDataContext);
  if (context === undefined) {
    throw new Error('useMapData must be used within a MapDataProvider');
  }
  return context;
};
