export interface WeatherLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface WeatherMetrics {
  temperature_c: number;
  feels_like_c: number;
  humidity_percent: number;
  pressure_hpa: number;
  visibility_km: number;
  wind_speed_kmh: number;
  wind_direction_deg: number;
  wind_direction_label: string;
  cloud_cover_percent: number;
  condition: string;
  description: string;
  wind_gust_kmh?: number;
  precipitation_1h_mm?: number;
}

export interface WeatherResponse {
  location: WeatherLocation;
  weather: WeatherMetrics;
  observed_at: string;
  source: string;
  mode: string;
}
