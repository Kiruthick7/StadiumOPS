"""
In-memory operational state singleton for the stadium platform.
All state mutations happen here — simulation and AI engines read/write via this module.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional
from copy import deepcopy

from app.models import (
    Zone, Gate, Alert, AIRecommendation, WeatherStatus, SystemHealth,
    OperationalStatus, RiskLevel, GateStatus, WeatherCondition, TrendDirection
)

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()
TOTAL_CAPACITY = 38000
STADIUM_NAME = "M. Chinnaswamy Stadium"
MATCH_NAME = "IPL 2025 — Semi Final: RCB vs MI"

_INITIAL_ZONES = [
    Zone(id="Z1", name="North Stand",       capacity=8000,  current_occupancy=6200, occupancy_pct=77.5, risk_level=RiskLevel.LOW,      movement_speed="normal", congestion_status="clear",    trend=TrendDirection.STABLE,  last_updated=_now()),
    Zone(id="Z2", name="South Stand",       capacity=7500,  current_occupancy=5100, occupancy_pct=68.0, risk_level=RiskLevel.LOW,      movement_speed="normal", congestion_status="clear",    trend=TrendDirection.STABLE,  last_updated=_now()),
    Zone(id="Z3", name="East Stand",        capacity=6000,  current_occupancy=4800, occupancy_pct=80.0, risk_level=RiskLevel.MEDIUM,   movement_speed="normal", congestion_status="moderate", trend=TrendDirection.RISING,  last_updated=_now()),
    Zone(id="Z4", name="West Stand",        capacity=6000,  current_occupancy=3900, occupancy_pct=65.0, risk_level=RiskLevel.LOW,      movement_speed="fast",   congestion_status="clear",    trend=TrendDirection.STABLE,  last_updated=_now()),
    Zone(id="Z5", name="Club House",        capacity=4000,  current_occupancy=3600, occupancy_pct=90.0, risk_level=RiskLevel.HIGH,     movement_speed="slow",   congestion_status="congested",trend=TrendDirection.RISING,  last_updated=_now()),
    Zone(id="Z6", name="Food Court — East", capacity=3000,  current_occupancy=2100, occupancy_pct=70.0, risk_level=RiskLevel.MEDIUM,   movement_speed="normal", congestion_status="moderate", trend=TrendDirection.STABLE,  last_updated=_now()),
    Zone(id="Z7", name="Food Court — West", capacity=3500,  current_occupancy=1800, occupancy_pct=51.4, risk_level=RiskLevel.LOW,      movement_speed="fast",   congestion_status="clear",    trend=TrendDirection.FALLING, last_updated=_now()),
]

_INITIAL_GATES = [
    Gate(id="G1", name="Gate A", location="North Entry",     status=GateStatus.OPEN,        inflow_rate=420, capacity_pct=62.0, is_emergency_exit=False),
    Gate(id="G2", name="Gate B", location="North-East Entry",status=GateStatus.OPEN,        inflow_rate=610, capacity_pct=88.0, is_emergency_exit=False),
    Gate(id="G3", name="Gate C", location="East Entry",      status=GateStatus.OPEN,        inflow_rate=380, capacity_pct=55.0, is_emergency_exit=False),
    Gate(id="G4", name="Gate D", location="South Entry",     status=GateStatus.OPEN,        inflow_rate=290, capacity_pct=42.0, is_emergency_exit=False),
    Gate(id="G5", name="Gate E", location="West Entry",      status=GateStatus.OPEN,        inflow_rate=340, capacity_pct=49.0, is_emergency_exit=False),
    Gate(id="G6", name="Gate F", location="VIP — West",      status=GateStatus.RESTRICTED,  inflow_rate=90,  capacity_pct=28.0, is_emergency_exit=False),
    Gate(id="GX", name="Emergency Exit", location="South-West", status=GateStatus.OPEN,     inflow_rate=0,   capacity_pct=0.0,  is_emergency_exit=True),
]

_INITIAL_WEATHER = WeatherStatus(
    condition=WeatherCondition.CLEAR,
    temperature_c=28.5,
    humidity_pct=62,
    wind_kph=12.0,
    visibility_km=8.0,
    rain_alert=False,
)

_INITIAL_HEALTH = SystemHealth(
    backend_ok=True,
    ai_available=True,
    simulation_active=True,
    network_degraded=False,
    sensor_failures=[],
)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()
class OperationalState:
    def __init__(self):
        self.reset()

    def reset(self):
        self.tick: int = 0
        self.zones: list[Zone] = deepcopy(_INITIAL_ZONES)
        self.gates: list[Gate] = deepcopy(_INITIAL_GATES)
        self.alerts: list[Alert] = []
        self.recommendations: list[AIRecommendation] = []
        self.weather: WeatherStatus = deepcopy(_INITIAL_WEATHER)
        self.health: SystemHealth = deepcopy(_INITIAL_HEALTH)
        self._add_startup_alerts()
    def snapshot(self) -> OperationalStatus:
        total_occ = sum(z.current_occupancy for z in self.zones)
        return OperationalStatus(
            stadium_name=STADIUM_NAME,
            match_name=MATCH_NAME,
            current_capacity_pct=round(total_occ / TOTAL_CAPACITY * 100, 1),
            total_capacity=TOTAL_CAPACITY,
            current_occupancy=total_occ,
            zones=deepcopy(self.zones),
            gates=deepcopy(self.gates),
            alerts=deepcopy(self._recent_alerts()),
            recommendations=deepcopy(self.recommendations[-8:]),
            weather=deepcopy(self.weather),
            system_health=deepcopy(self.health),
            timestamp=_now(),
            tick=self.tick,
        )

    def add_alert(
        self,
        message: str,
        severity: str,
        category: str,
        zone_id: Optional[str] = None,
        gate_id: Optional[str] = None,
    ) -> Alert:
        alert = Alert(
            id=str(uuid.uuid4())[:8],
            timestamp=_now(),
            severity=severity,
            category=category,
            message=message,
            zone_id=zone_id,
            gate_id=gate_id,
            resolved=False,
        )
        self.alerts.append(alert)
        if len(self.alerts) > 100:
            self.alerts = self.alerts[-100:]
        return alert

    def add_recommendation(self, rec: AIRecommendation):
        self.recommendations.append(rec)
        if len(self.recommendations) > 20:
            self.recommendations = self.recommendations[-20:]

    def get_zone(self, zone_id: str) -> Optional[Zone]:
        return next((z for z in self.zones if z.id == zone_id), None)

    def get_gate(self, gate_id: str) -> Optional[Gate]:
        return next((g for g in self.gates if g.id == gate_id), None)

    def update_zone(self, zone_id: str, **kwargs):
        zone = self.get_zone(zone_id)
        if zone:
            for k, v in kwargs.items():
                setattr(zone, k, v)
            zone.last_updated = _now()

    def update_gate(self, gate_id: str, **kwargs):
        gate = self.get_gate(gate_id)
        if gate:
            for k, v in kwargs.items():
                setattr(gate, k, v)

    def increment_tick(self):
        self.tick += 1
    def _recent_alerts(self, n: int = 30) -> list[Alert]:
        return sorted(self.alerts[-n:], key=lambda a: a.timestamp, reverse=True)

    def _add_startup_alerts(self):
        self.add_alert("Stadium operations center activated", "info", "operations")
        self.add_alert("Gate B showing elevated inflow — monitoring", "warning", "congestion", gate_id="G2")
        self.add_alert("Zone Z5 (Club House) near capacity threshold", "warning", "congestion", zone_id="Z5")
        self.add_alert("Weather check: Clear skies, match conditions nominal", "info", "operations")
state = OperationalState()
