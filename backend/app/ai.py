"""
Groq AI wrapper for structured operational recommendations.
Uses structured JSON prompts with retry logic and graceful fallback.
"""

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

import httpx

from app.config import get_settings
from app.models import AIRecommendation, RiskLevel, OperationalStatus

logger = logging.getLogger(__name__)

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.1-8b-instant"
MAX_RETRIES = 2
TIMEOUT_SECONDS = 8.0


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _uid() -> str:
    return str(uuid.uuid4())[:8]


def _build_prompt(status: OperationalStatus) -> str:
    high_risk_zones = [z for z in status.zones if z.risk_level.value in ("high", "critical")]
    pressured_gates = [g for g in status.gates if g.capacity_pct >= 75]
    active_alerts = [a for a in status.alerts if not a.resolved and a.severity in ("warning", "critical")]

    zone_summary = "\n".join(
        f"  - {z.name}: {z.occupancy_pct:.0f}% full, {z.congestion_status}, trend={z.trend.value}"
        for z in status.zones
    )
    gate_summary = "\n".join(
        f"  - {g.name} ({g.location}): status={g.status.value}, inflow={g.inflow_rate}/min, pressure={g.capacity_pct:.0f}%"
        for g in status.gates
    )
    alert_summary = "\n".join(
        f"  - [{a.severity.upper()}] {a.message}"
        for a in active_alerts[:5]
    )

    return f"""You are an AI stadium operations coordinator for {status.stadium_name}.
Current match: {status.match_name}
Stadium occupancy: {status.current_capacity_pct:.1f}% ({status.current_occupancy:,} of {status.total_capacity:,})

ZONE STATUS:
{zone_summary}

GATE STATUS:
{gate_summary}

WEATHER: {status.weather.condition.value}, {status.weather.temperature_c}°C, humidity {status.weather.humidity_pct}%, wind {status.weather.wind_kph} kph, rain_alert={status.weather.rain_alert}

ACTIVE ALERTS:
{alert_summary or "  - No critical alerts"}

SYSTEM HEALTH: network_degraded={status.system_health.network_degraded}, sensor_failures={status.system_health.sensor_failures}

Analyze the operational situation and provide up to 4 prioritized recommendations.
Focus on: crowd safety, gate management, congestion prevention, emergency coordination.

You MUST respond with ONLY a valid JSON array. No explanation, no markdown. Example format:
[
  {{
    "risk_level": "high",
    "recommendation": "Redirect spectators from Gate B to Gate D",
    "reasoning": "Gate B at 88% throughput with congestion in adjacent East Stand",
    "confidence": 87,
    "priority": "high",
    "zone_id": null,
    "gate_id": "G2"
  }}
]

risk_level: one of low|medium|high|critical
priority: one of low|medium|high|urgent
confidence: integer 0-100
zone_id and gate_id: string or null"""


async def fetch_ai_recommendations(
    status: OperationalStatus,
) -> tuple[list[AIRecommendation], bool]:
    """
    Returns (recommendations, ai_was_used).
    Falls back to empty list on failure — caller handles fallback.
    """
    settings = get_settings()
    if status.system_health.network_degraded:
        return [], False

    prompt = _build_prompt(status)
    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 1024,
    }

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
                resp = await client.post(GROQ_API_URL, headers=headers, json=payload)
                resp.raise_for_status()
                data = resp.json()
                raw_content = data["choices"][0]["message"]["content"].strip()
                start_idx = raw_content.find('[')
                end_idx = raw_content.rfind(']')
                if start_idx != -1 and end_idx != -1:
                    raw_content = raw_content[start_idx:end_idx+1]

                parsed = json.loads(raw_content)
                if not isinstance(parsed, list):
                    raise ValueError("AI response is not a list")

                recs = []
                for item in parsed[:4]:
                    recs.append(AIRecommendation(
                        id=_uid(),
                        timestamp=_now(),
                        risk_level=RiskLevel(item.get("risk_level", "medium")),
                        recommendation=str(item.get("recommendation", "")),
                        reasoning=str(item.get("reasoning", "")),
                        confidence=int(item.get("confidence", 70)),
                        priority=item.get("priority", "medium"),
                        source="ai",
                        zone_id=item.get("zone_id"),
                    ))
                logger.info(f"AI returned {len(recs)} recommendations on attempt {attempt}")
                return recs, True

        except httpx.TimeoutException:
            logger.warning(f"Groq API timeout on attempt {attempt}")
        except httpx.HTTPStatusError as e:
            logger.warning(f"Groq API HTTP error {e.response.status_code} on attempt {attempt}")
            logger.warning(f"Response body: {e.response.text}")
            if e.response.status_code in (402, 429):
                try:
                    err_data = e.response.json()
                    err_msg = err_data.get("error", {}).get("message", "").lower()
                    err_code = err_data.get("error", {}).get("code", "").lower()
                    if "insufficient_quota" in err_code or "billing" in err_msg or "credits" in err_msg:
                        from app.state import state
                        if not any("out of credits" in a.message for a in state.alerts):
                            state.add_alert("CRITICAL: Groq API out of credits. AI Engine offline until billing resolved.", "critical", "system")
                except:
                    pass
                return [], False
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            logger.warning(f"Groq response parse error on attempt {attempt}: {e}")
        except Exception as e:
            logger.error(f"Unexpected AI error on attempt {attempt}: {e}")

    return [], False
