"""
Deterministic scenario simulation engine.
Each scenario mutates the shared OperationalState in a realistic, predictable way.
Designed for reliable demo playback.
"""

import uuid
import random
from datetime import datetime, timezone

from app.models import (
    RiskLevel, GateStatus, WeatherCondition, TrendDirection
)
from app.state import state
from app.config import get_settings


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _uid() -> str:
    return str(uuid.uuid4())[:8]
def apply_background_tick():
    """Gentle natural drift every polling cycle to keep the dashboard alive."""
    state.increment_tick()
    t = state.tick

    for zone in state.zones:
        delta = random.uniform(-0.015, 0.018) * zone.capacity
        zone.current_occupancy = max(0, min(zone.capacity, int(zone.current_occupancy + delta)))
        zone.occupancy_pct = round(zone.current_occupancy / zone.capacity * 100, 1)
        pct = zone.occupancy_pct
        if pct >= 92:
            zone.risk_level = RiskLevel.CRITICAL
            zone.congestion_status = "blocked"
            zone.movement_speed = "stopped"
        elif pct >= 80:
            zone.risk_level = RiskLevel.HIGH
            zone.congestion_status = "congested"
            zone.movement_speed = "slow"
        elif pct >= 65:
            zone.risk_level = RiskLevel.MEDIUM
            zone.congestion_status = "moderate"
            zone.movement_speed = "normal"
        else:
            zone.risk_level = RiskLevel.LOW
            zone.congestion_status = "clear"
            zone.movement_speed = "fast"
        if delta > 0:
            zone.trend = TrendDirection.RISING
        elif delta < -0.005 * zone.capacity:
            zone.trend = TrendDirection.FALLING
        else:
            zone.trend = TrendDirection.STABLE

        zone.last_updated = _now()
    for gate in state.gates:
        if gate.status == GateStatus.OPEN:
            gate.inflow_rate = max(50, min(700, gate.inflow_rate + random.randint(-30, 30)))
            gate.capacity_pct = round(gate.inflow_rate / 700 * 100, 1)
    if t % 15 == 0:
        msgs = [
            "Volunteer sweep completed — all sections accounted for",
            "Crowd density sensors reporting nominal",
            "Refreshment queues operating normally",
            "PA system check: all zones operational",
            "Security perimeter confirmed clear",
        ]
        state.add_alert(random.choice(msgs), "info", "operations")

    settings = get_settings()
    if t % 2 == 0 and state.health.network_degraded:
        state.health.network_degraded = False
        state.health.sensor_failures = []
        state.add_alert("Network connection and sensor nodes automatically restored", "info", "operations")
def simulate_congestion(zone_id: str = "Z5", intensity: str = "moderate"):
    multipliers = {"mild": 1.12, "moderate": 1.22, "severe": 1.35}
    m = multipliers.get(intensity, 1.22)
    zone = state.get_zone(zone_id)
    if zone:
        zone.current_occupancy = min(zone.capacity, int(zone.current_occupancy * m))
        zone.occupancy_pct = round(zone.current_occupancy / zone.capacity * 100, 1)
        zone.risk_level = RiskLevel.HIGH if intensity != "severe" else RiskLevel.CRITICAL
        zone.congestion_status = "congested" if intensity != "severe" else "blocked"
        zone.movement_speed = "slow" if intensity != "severe" else "stopped"
        zone.trend = TrendDirection.RISING
        zone.last_updated = _now()
    gate = state.get_gate("G2")
    if gate:
        gate.inflow_rate = min(700, int(gate.inflow_rate * 1.3))
        gate.capacity_pct = round(gate.inflow_rate / 700 * 100, 1)

    sev = "critical" if intensity == "severe" else "warning"
    state.add_alert(
        f"Congestion surge detected in {zone.name if zone else zone_id} — occupancy {zone.occupancy_pct if zone else '?'}%",
        sev, "congestion", zone_id=zone_id, gate_id="G2"
    )
    state.add_alert(
        "Gate B inflow elevated — consider redirecting to Gate D or Gate E",
        "warning", "congestion", gate_id="G2"
    )

    if intensity == "severe":
        state.add_alert(
            "⚠️ CRITICAL: Zone approaching blocked status — immediate action required",
            "critical", "congestion", zone_id=zone_id
        )
def simulate_weather(intensity: str = "moderate"):
    if intensity == "mild":
        state.weather.condition = WeatherCondition.DRIZZLE
        state.weather.visibility_km = 6.0
        state.weather.humidity_pct = 78
        state.weather.wind_kph = 18.0
        state.weather.rain_alert = False
    elif intensity == "moderate":
        state.weather.condition = WeatherCondition.RAIN
        state.weather.visibility_km = 4.0
        state.weather.humidity_pct = 88
        state.weather.wind_kph = 24.0
        state.weather.rain_alert = True
    else:
        state.weather.condition = WeatherCondition.HEAVY_RAIN
        state.weather.visibility_km = 1.5
        state.weather.humidity_pct = 96
        state.weather.wind_kph = 38.0
        state.weather.rain_alert = True
    for zid in ["Z6", "Z7"]:
        zone = state.get_zone(zid)
        if zone:
            boost = 1.18 if intensity == "severe" else 1.10
            zone.current_occupancy = min(zone.capacity, int(zone.current_occupancy * boost))
            zone.occupancy_pct = round(zone.current_occupancy / zone.capacity * 100, 1)
            zone.trend = TrendDirection.RISING
            zone.last_updated = _now()
    for zone in state.zones:
        if zone.movement_speed == "fast":
            zone.movement_speed = "normal"
        elif zone.movement_speed == "normal" and intensity == "severe":
            zone.movement_speed = "slow"

    desc = {"mild": "Drizzle", "moderate": "Rainfall", "severe": "Heavy rain storm"}
    state.add_alert(
        f"🌧 Weather alert: {desc.get(intensity, 'Rain')} detected — visibility reduced",
        "warning", "weather"
    )
    if intensity in ("moderate", "severe"):
        state.add_alert(
            "Spectators moving to covered areas — Food Courts experiencing surge",
            "warning", "weather"
        )
    if intensity == "severe":
        state.add_alert(
            "⛈ SEVERE WEATHER: Match officials notified — emergency protocols on standby",
            "critical", "weather"
        )
def simulate_emergency(zone_id: str = "Z3", intensity: str = "moderate"):
    zone = state.get_zone(zone_id)
    zone_name = zone.name if zone else zone_id
    gx = state.get_gate("GX")
    if gx:
        gx.status = GateStatus.EMERGENCY
    state.update_gate("G3", status=GateStatus.RESTRICTED)
    if zone:
        zone.risk_level = RiskLevel.CRITICAL
        zone.congestion_status = "blocked"
        zone.movement_speed = "stopped"
        zone.trend = TrendDirection.RISING
        zone.last_updated = _now()
    if intensity == "severe" and "Z3-sensor" not in state.health.sensor_failures:
        state.health.sensor_failures.append("Z3-sensor")

    state.add_alert(
        f"🚨 EMERGENCY: Medical assistance requested in {zone_name}",
        "critical", "emergency", zone_id=zone_id
    )
    state.add_alert(
        "Emergency corridor activated — Gate F cleared for emergency vehicle access",
        "critical", "emergency", gate_id="GX"
    )
    state.add_alert(
        "Security team dispatched to incident zone — crowd holding position",
        "warning", "emergency", zone_id=zone_id
    )
    if intensity == "severe":
        state.add_alert(
            "⚠️ EVACUATION ADVISORY: Row-by-row exit protocol initiated for East Stand",
            "critical", "emergency", zone_id=zone_id
        )
def simulate_gate_blockage(gate_id: str = "G3", intensity: str = "moderate"):
    gate = state.get_gate(gate_id)
    if gate:
        if intensity == "severe":
            gate.status = GateStatus.CLOSED
            gate.inflow_rate = 0
            gate.capacity_pct = 0.0
        else:
            gate.status = GateStatus.RESTRICTED
            gate.inflow_rate = max(0, gate.inflow_rate // 3)
            gate.capacity_pct = round(gate.inflow_rate / 700 * 100, 1)

    gate_name = gate.name if gate else gate_id
    state.add_alert(
        f"Gate {gate_name} {'closed' if intensity == 'severe' else 'partially blocked'} — crowd redirected",
        "warning" if intensity != "severe" else "critical",
        "operations", gate_id=gate_id
    )
    state.add_alert(
        "Redirecting spectators from blocked gate — Gates D and E absorbing overflow",
        "info", "operations"
    )
    for aid in ["G4", "G5"]:
        g = state.get_gate(aid)
        if g and g.status == GateStatus.OPEN:
            g.inflow_rate = min(700, int(g.inflow_rate * 1.25))
            g.capacity_pct = round(g.inflow_rate / 700 * 100, 1)
def simulate_network_failure(intensity: str = "moderate"):
    state.health.network_degraded = True
    state.health.ai_available = intensity != "severe"

    failures = ["Z1-sensor", "Z3-sensor"] if intensity == "severe" else ["Z6-sensor"]
    for f in failures:
        if f not in state.health.sensor_failures:
            state.health.sensor_failures.append(f)

    state.add_alert(
        "Network degradation detected — switching to fallback recommendation engine",
        "warning", "operations"
    )
    if intensity == "severe":
        state.add_alert(
            "Multiple sensor nodes offline — manual crowd count protocols activated",
            "critical", "operations"
        )
        state.add_alert(
            "AI engine temporarily unavailable — rule-based fallback active",
            "warning", "operations"
        )
def reset_demo():
    state.reset()
    state.add_alert("🔄 Demo reset — operational baseline restored", "info", "operations")
