import asyncio
import time
from fastapi import APIRouter
from app.state import state
from app.ai import fetch_ai_recommendations
from app.rules import generate_rule_based_recommendations

router = APIRouter(prefix="/ai", tags=["ai"])

_ai_lock = asyncio.Lock()
_last_fetch_time = 0.0

@router.post("/recommend")
async def get_recommendations():
    """
    Trigger a fresh AI analysis cycle.
    Tries Groq first; falls back to rule engine transparently.
    Prevents concurrent requests and debounces rapid sequential calls.
    """
    global _last_fetch_time
    if time.time() - _last_fetch_time < 5.0:
        return {
            "ok": True,
            "source": "cache",
            "count": len(state.recommendations),
            "recommendations": [r.model_dump() for r in state.recommendations],
        }
    if _ai_lock.locked():
        return {
            "ok": True,
            "source": "cache",
            "count": len(state.recommendations),
            "recommendations": [r.model_dump() for r in state.recommendations],
        }

    async with _ai_lock:
        snapshot = state.snapshot()
        recs, ai_used = await fetch_ai_recommendations(snapshot)

        if not recs:
            recs = generate_rule_based_recommendations(snapshot)
            state.health.ai_available = False
        else:
            state.health.ai_available = True
            
        _last_fetch_time = time.time()

        state.recommendations = recs
        
        return {
            "ok": True,
            "source": "ai" if ai_used else "rule_engine",
            "count": len(recs),
            "recommendations": [r.model_dump() for r in recs],
        }

@router.post("/resolve/{rec_id}")
async def resolve_recommendation(rec_id: str):
    """
    Mark an AI or Rule-based recommendation as resolved (applied or dismissed).
    Removes it from the active state so it no longer appears in the UI.
    """
    initial_count = len(state.recommendations)
    state.recommendations = [r for r in state.recommendations if r.id != rec_id]
    
    return {
        "ok": True,
        "resolved_id": rec_id,
        "found": len(state.recommendations) < initial_count
    }
