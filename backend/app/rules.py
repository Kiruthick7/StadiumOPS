"""
Rule-based fallback recommendation engine.
Fires when the Groq AI API is unavailable.
Produces deterministic, structured recommendations matching the AI output format.
"""

import uuid
from datetime import datetime, timezone

from app.models import AIRecommendation, RiskLevel, OperationalStatus


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _uid() -> str:
    return str(uuid.uuid4())[:8]


def generate_rule_based_recommendations(status: OperationalStatus) -> list[AIRecommendation]:
    """
    Evaluate current operational state and produce prioritized recommendations.
    Rules are ordered by priority — highest severity first.
    """
    recs: list[AIRecommendation] = []
    for zone in status.zones:
        if zone.occupancy_pct >= 92:
            recs.append(AIRecommendation(
                id=_uid(), timestamp=_now(),
                risk_level=RiskLevel.CRITICAL,
                recommendation=f"Immediately halt inflow to {zone.name} — at capacity",
                reasoning=f"{zone.name} is at {zone.occupancy_pct:.0f}% capacity with {zone.movement_speed} movement speed. Crush risk is imminent.",
                confidence=96,
                priority="urgent",
                source="rule_engine",
                zone_id=zone.id,
            ))
        elif zone.occupancy_pct >= 82:
            recs.append(AIRecommendation(
                id=_uid(), timestamp=_now(),
                risk_level=RiskLevel.HIGH,
                recommendation=f"Restrict inflow to {zone.name} — deploy crowd marshals",
                reasoning=f"{zone.name} at {zone.occupancy_pct:.0f}% with {zone.congestion_status} congestion. Proactive restriction prevents escalation.",
                confidence=88,
                priority="high",
                source="rule_engine",
                zone_id=zone.id,
            ))
    for gate in status.gates:
        if gate.capacity_pct >= 88 and gate.status.value == "open":
            recs.append(AIRecommendation(
                id=_uid(), timestamp=_now(),
                risk_level=RiskLevel.HIGH,
                recommendation=f"Divert {gate.name} overflow to Gate D — Gate D at low pressure",
                reasoning=f"{gate.name} processing at {gate.capacity_pct:.0f}% throughput capacity ({gate.inflow_rate} people/min). Adjacent gates have headroom.",
                confidence=85,
                priority="high",
                source="rule_engine",
                gate_id=gate.id,
            ))
    if status.weather.rain_alert:
        recs.append(AIRecommendation(
            id=_uid(), timestamp=_now(),
            risk_level=RiskLevel.MEDIUM,
            recommendation="Activate rain canopy deployment — direct spectators to covered concourses",
            reasoning=f"Rain alert active ({status.weather.condition.value}). Wet surfaces increase slip risk and drive crowd movement to covered areas, increasing density there.",
            confidence=82,
            priority="high",
            source="rule_engine",
        ))

    if status.weather.condition.value in ("heavy_rain",) and status.weather.visibility_km < 3.0:
        recs.append(AIRecommendation(
            id=_uid(), timestamp=_now(),
            risk_level=RiskLevel.HIGH,
            recommendation="Issue PA announcement — request spectators remain seated until visibility improves",
            reasoning=f"Visibility at {status.weather.visibility_km} km. Crowd movement in low visibility increases collision and injury risk significantly.",
            confidence=91,
            priority="urgent",
            source="rule_engine",
        ))
    for gate in status.gates:
        if gate.status.value == "emergency":
            recs.append(AIRecommendation(
                id=_uid(), timestamp=_now(),
                risk_level=RiskLevel.CRITICAL,
                recommendation=f"Clear 10-metre radius around {gate.name} — emergency vehicle access required",
                reasoning="Emergency exit activated. Obstruction of emergency corridors violates safety protocols and delays response time.",
                confidence=99,
                priority="urgent",
                source="rule_engine",
                gate_id=gate.id,
            ))
    if status.system_health.network_degraded:
        recs.append(AIRecommendation(
            id=_uid(), timestamp=_now(),
            risk_level=RiskLevel.MEDIUM,
            recommendation="Switch to manual headcount protocol — deploy additional spotters to all entry gates",
            reasoning="Network degradation detected. Sensor data may be unreliable. Manual verification prevents operational blind spots.",
            confidence=78,
            priority="medium",
            source="rule_engine",
        ))
    if status.system_health.sensor_failures:
        zones_affected = ", ".join(status.system_health.sensor_failures)
        recs.append(AIRecommendation(
            id=_uid(), timestamp=_now(),
            risk_level=RiskLevel.MEDIUM,
            recommendation=f"Manual verification required for offline sensor zones: {zones_affected}",
            reasoning="Sensor failures create operational blind spots. Manual observation fills the gap until sensors are restored.",
            confidence=80,
            priority="medium",
            source="rule_engine",
        ))
    if not recs:
        recs.append(AIRecommendation(
            id=_uid(), timestamp=_now(),
            risk_level=RiskLevel.LOW,
            recommendation="Operations nominal — maintain current staffing and monitoring intervals",
            reasoning="All zones within safe occupancy thresholds. Weather conditions stable. Gate flows distributed evenly. No interventions required at this time.",
            confidence=72,
            priority="low",
            source="rule_engine",
        ))

    return recs[:6]  # Cap at 6 recommendations
