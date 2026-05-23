from pydantic import BaseModel, Field
from typing import Literal, Optional
from enum import Enum


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class GateStatus(str, Enum):
    OPEN = "open"
    RESTRICTED = "restricted"
    CLOSED = "closed"
    EMERGENCY = "emergency"


class WeatherCondition(str, Enum):
    CLEAR = "clear"
    CLOUDY = "cloudy"
    DRIZZLE = "drizzle"
    RAIN = "rain"
    HEAVY_RAIN = "heavy_rain"


class TrendDirection(str, Enum):
    RISING = "rising"
    STABLE = "stable"
    FALLING = "falling"


class Zone(BaseModel):
    id: str
    name: str
    capacity: int
    current_occupancy: int
    occupancy_pct: float
    risk_level: RiskLevel
    movement_speed: Literal["fast", "normal", "slow", "stopped"]
    congestion_status: Literal["clear", "moderate", "congested", "blocked"]
    trend: TrendDirection
    last_updated: str


class Gate(BaseModel):
    id: str
    name: str
    location: str
    status: GateStatus
    inflow_rate: int  # people/min
    capacity_pct: float
    is_emergency_exit: bool


class Alert(BaseModel):
    id: str
    timestamp: str
    severity: Literal["info", "warning", "critical"]
    category: Literal["congestion", "weather", "emergency", "operations", "security"]
    message: str
    zone_id: Optional[str] = None
    gate_id: Optional[str] = None
    resolved: bool = False


class AIRecommendation(BaseModel):
    id: str
    timestamp: str
    risk_level: RiskLevel
    recommendation: str
    reasoning: str
    confidence: int = Field(ge=0, le=100)
    priority: Literal["low", "medium", "high", "urgent"]
    source: Literal["ai", "rule_engine"]
    zone_id: Optional[str] = None


class WeatherStatus(BaseModel):
    condition: WeatherCondition
    temperature_c: float
    humidity_pct: int
    wind_kph: float
    visibility_km: float
    rain_alert: bool


class SystemHealth(BaseModel):
    backend_ok: bool
    ai_available: bool
    simulation_active: bool
    network_degraded: bool
    sensor_failures: list[str]


class OperationalStatus(BaseModel):
    stadium_name: str
    match_name: str
    current_capacity_pct: float
    total_capacity: int
    current_occupancy: int
    zones: list[Zone]
    gates: list[Gate]
    alerts: list[Alert]
    recommendations: list[AIRecommendation]
    weather: WeatherStatus
    system_health: SystemHealth
    timestamp: str
    tick: int
class SimulateRequest(BaseModel):
    zone_id: Optional[str] = None
    gate_id: Optional[str] = None
    intensity: Literal["mild", "moderate", "severe"] = "moderate"


class AIRecommendRequest(BaseModel):
    force_refresh: bool = False
