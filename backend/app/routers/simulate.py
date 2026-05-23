from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Literal

from app.state import state
from app.simulation import (
    simulate_congestion,
    simulate_weather,
    simulate_emergency,
    simulate_gate_blockage,
    simulate_network_failure,
    reset_demo,
)

router = APIRouter(prefix="/simulate", tags=["simulation"])


class ScenarioRequest(BaseModel):
    zone_id: Optional[str] = None
    gate_id: Optional[str] = None
    intensity: Literal["mild", "moderate", "severe"] = "moderate"


@router.post("/congestion")
async def trigger_congestion(req: ScenarioRequest = ScenarioRequest()):
    zone_id = req.zone_id or "Z5"
    simulate_congestion(zone_id=zone_id, intensity=req.intensity)
    return {"ok": True, "scenario": "congestion", "zone_id": zone_id, "intensity": req.intensity}


@router.post("/weather")
async def trigger_weather(req: ScenarioRequest = ScenarioRequest()):
    simulate_weather(intensity=req.intensity)
    return {"ok": True, "scenario": "weather", "intensity": req.intensity}


@router.post("/emergency")
async def trigger_emergency(req: ScenarioRequest = ScenarioRequest()):
    zone_id = req.zone_id or "Z3"
    simulate_emergency(zone_id=zone_id, intensity=req.intensity)
    return {"ok": True, "scenario": "emergency", "zone_id": zone_id, "intensity": req.intensity}


@router.post("/gate-blockage")
async def trigger_gate_blockage(req: ScenarioRequest = ScenarioRequest()):
    gate_id = req.gate_id or "G3"
    simulate_gate_blockage(gate_id=gate_id, intensity=req.intensity)
    return {"ok": True, "scenario": "gate-blockage", "gate_id": gate_id, "intensity": req.intensity}


@router.post("/network-failure")
async def trigger_network_failure(req: ScenarioRequest = ScenarioRequest()):
    simulate_network_failure(intensity=req.intensity)
    return {"ok": True, "scenario": "network-failure", "intensity": req.intensity}


@router.post("/reset")
async def reset():
    reset_demo()
    return {"ok": True, "scenario": "reset"}
