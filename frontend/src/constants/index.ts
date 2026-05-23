import type { RiskLevel, GateStatus, AlertSeverity, Priority, WeatherCondition, TrendDirection, MovementSpeed } from "@/types";

export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
export const POLL_INTERVAL_MS = 10000;
export const AI_REFRESH_INTERVAL_MS = 20000;
export const RISK_COLORS: Record<RiskLevel, string> = {
  low:      "text-green-400",
  medium:   "text-amber-400",
  high:     "text-orange-400",
  critical: "text-red-400",
};

export const RISK_BG: Record<RiskLevel, string> = {
  low:      "bg-green-500/15",
  medium:   "bg-amber-500/15",
  high:     "bg-orange-500/15",
  critical: "bg-red-500/15",
};

export const RISK_BAR: Record<RiskLevel, string> = {
  low:      "bg-green-500",
  medium:   "bg-amber-500",
  high:     "bg-orange-500",
  critical: "bg-red-500",
};

export const RISK_GLOW: Record<RiskLevel, string> = {
  low:      "glow-green",
  medium:   "glow-amber",
  high:     "glow-amber",
  critical: "glow-red",
};
export const GATE_STATUS_COLORS: Record<GateStatus, string> = {
  open:        "text-green-400",
  restricted:  "text-amber-400",
  closed:      "text-gray-500",
  emergency:   "text-red-400",
};

export const GATE_STATUS_BG: Record<GateStatus, string> = {
  open:        "bg-green-500/15",
  restricted:  "bg-amber-500/15",
  closed:      "bg-gray-500/15",
  emergency:   "bg-red-500/15",
};
export const ALERT_SEVERITY_CLASS: Record<AlertSeverity, string> = {
  info:     "alert-banner-info",
  warning:  "alert-banner-warning",
  critical: "alert-banner-critical",
};
export const PRIORITY_COLORS: Record<Priority, string> = {
  low:    "text-gray-400",
  medium: "text-blue-400",
  high:   "text-amber-400",
  urgent: "text-red-400",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  low:    "LOW",
  medium: "MEDIUM",
  high:   "HIGH",
  urgent: "URGENT",
};
export const WEATHER_LABEL: Record<WeatherCondition, string> = {
  clear:      "☀️  Clear",
  cloudy:     "☁️  Cloudy",
  drizzle:    "🌦  Drizzle",
  rain:       "🌧  Rain",
  heavy_rain: "⛈  Heavy Rain",
};
export const TREND_ICON: Record<TrendDirection, string> = {
  rising:  "↑",
  stable:  "→",
  falling: "↓",
};

export const TREND_COLOR: Record<TrendDirection, string> = {
  rising:  "text-red-400",
  stable:  "text-gray-400",
  falling: "text-green-400",
};
export const MOVEMENT_COLOR: Record<MovementSpeed, string> = {
  fast:    "text-green-400",
  normal:  "text-blue-400",
  slow:    "text-amber-400",
  stopped: "text-red-400",
};
