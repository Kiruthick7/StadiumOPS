
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type GateStatus = "open" | "restricted" | "closed" | "emergency";
export type WeatherCondition = "clear" | "cloudy" | "drizzle" | "rain" | "heavy_rain";
export type TrendDirection = "rising" | "stable" | "falling";
export type MovementSpeed = "fast" | "normal" | "slow" | "stopped";
export type CongestionStatus = "clear" | "moderate" | "congested" | "blocked";
export type AlertSeverity = "info" | "warning" | "critical";
export type AlertCategory = "congestion" | "weather" | "emergency" | "operations" | "security";
export type Priority = "low" | "medium" | "high" | "urgent";
export type RecommendationSource = "ai" | "rule_engine";

export interface Zone {
  id: string;
  name: string;
  capacity: number;
  current_occupancy: number;
  occupancy_pct: number;
  risk_level: RiskLevel;
  movement_speed: MovementSpeed;
  congestion_status: CongestionStatus;
  trend: TrendDirection;
  last_updated: string;
}

export interface Gate {
  id: string;
  name: string;
  location: string;
  status: GateStatus;
  inflow_rate: number;
  capacity_pct: number;
  is_emergency_exit: boolean;
}

export interface Alert {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  category: AlertCategory;
  message: string;
  zone_id?: string;
  gate_id?: string;
  resolved: boolean;
}

export interface AIRecommendation {
  id: string;
  timestamp: string;
  risk_level: RiskLevel;
  recommendation: string;
  reasoning: string;
  confidence: number;
  priority: Priority;
  source: RecommendationSource;
  zone_id?: string;
}

export interface WeatherStatus {
  condition: WeatherCondition;
  temperature_c: number;
  humidity_pct: number;
  wind_kph: number;
  visibility_km: number;
  rain_alert: boolean;
}

export interface SystemHealth {
  backend_ok: boolean;
  ai_available: boolean;
  simulation_active: boolean;
  network_degraded: boolean;
  sensor_failures: string[];
}

export interface OperationalStatus {
  stadium_name: string;
  match_name: string;
  current_capacity_pct: number;
  total_capacity: number;
  current_occupancy: number;
  zones: Zone[];
  gates: Gate[];
  alerts: Alert[];
  recommendations: AIRecommendation[];
  weather: WeatherStatus;
  system_health: SystemHealth;
  timestamp: string;
  tick: number;
}
