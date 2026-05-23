from fastapi import APIRouter
from app.state import state
from app.simulation import apply_background_tick
from app.models import OperationalStatus

router = APIRouter()


@router.get("/status", response_model=OperationalStatus)
async def get_status():
    """
    Primary polling endpoint.
    Frontend calls this every 4 seconds.
    Applies a background tick each call to keep simulation alive.
    """
    apply_background_tick()
    return state.snapshot()
from pydantic import BaseModel

class EscalateRequest(BaseModel):
    message: str
    severity: str = "critical"
    category: str = "system"

@router.post("/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    """Manually resolve an active alert."""
    for a in state.alerts:
        if a.id == alert_id:
            a.resolved = True
            return {"ok": True, "alert_id": alert_id}
    return {"ok": False, "error": "Not found"}

@router.post("/alerts/escalate")
async def escalate_alert(req: EscalateRequest):
    """Manually inject a critical alert (e.g. from an AI escalation)."""
    state.add_alert(req.message, req.severity, req.category)
    return {"ok": True}
