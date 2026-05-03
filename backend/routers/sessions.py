from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client
from dotenv import load_dotenv
import os
from datetime import datetime

load_dotenv()
router = APIRouter()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key) if url and key else None

class SessionData(BaseModel):
    problem: str
    design: dict
    evaluation: dict
    band: str
    overall_score: float

@router.get("/sessions")
async def get_sessions():
    if not supabase:
        return {"sessions": []}
    try:
        res = supabase.table("sessions").select("*").order("created_at", desc=True).limit(20).execute()
        return {"sessions": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sessions")
async def save_session(data: SessionData):
    if not supabase:
        return {"id": None, "message": "Supabase not configured"}
    try:
        payload = {
            "problem": data.problem,
            "design": data.design,
            "evaluation": data.evaluation,
            "band": data.band,
            "overall_score": data.overall_score,
            "created_at": datetime.utcnow().isoformat(),
        }
        res = supabase.table("sessions").insert(payload).execute()
        return {"id": res.data[0]["id"] if res.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
