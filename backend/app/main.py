import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional

from app.telemetry import BaghewalaFieldSimulator
from app.assistant import FieldAssistant

app = FastAPI(
    title="Baghewala Field Digital Twin API",
    description="Physics-based CSS & SRP Optimization Backend for Heavy Oil Operations",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

simulator = BaghewalaFieldSimulator()
assistant = FieldAssistant()

class ChatMessageRequest(BaseModel):
    well_id: str
    message: str

class ControlUpdateRequest(BaseModel):
    spm: Optional[float] = None
    stroke_length_in: Optional[float] = None
    choke_pct: Optional[float] = None
    steam_rate_tpd: Optional[float] = None
    phase: Optional[str] = None
    anomaly: Optional[str] = None

class OptimizeScenarioRequest(BaseModel):
    crude_price_usd_bbl: float = 75.0
    steam_cost_usd_ton: float = 18.0
    electricity_cost_usd_kwh: float = 0.12

@app.get("/")
def read_root():
    return {
        "status": "ONLINE",
        "field": "Baghewala Heavy Oil Field (Oil India Ltd)",
        "digital_twin_version": "1.0-physics-engine",
        "description": "Cyclic Steam Stimulation & Sucker Rod Pumping Optimization Engine"
    }

@app.get("/api/field/summary")
def get_field_summary():
    return simulator.get_field_summary()

@app.get("/api/well/{well_id}/telemetry")
def get_well_telemetry(well_id: str):
    return simulator.get_well_telemetry(well_id)

@app.post("/api/well/{well_id}/control")
def update_well_control(well_id: str, request: ControlUpdateRequest):
    updates = {k: v for k, v in request.dict().items() if v is not None}
    try:
        return simulator.update_well_controls(well_id, updates)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

@app.post("/api/well/{well_id}/optimize")
def apply_well_optimization(well_id: str, scenario: OptimizeScenarioRequest):
    return simulator.optimize_well(well_id, scenario.model_dump())

@app.get("/api/well/{well_id}/actions")
def get_well_actions(well_id: str):
    return {"well_id": well_id, "actions": simulator.get_action_log(well_id)}

@app.post("/api/chat")
def chat_with_assistant(request: ChatMessageRequest):
    telem = simulator.get_well_telemetry(request.well_id)
    reply = assistant.answer_query(request.message, telem)
    return {"well_id": request.well_id, "query": request.message, "response": reply}

@app.websocket("/ws/telemetry/{well_id}")
async def websocket_telemetry(websocket: WebSocket, well_id: str):
    await websocket.accept()
    try:
        while True:
            telem = simulator.get_well_telemetry(well_id)
            await websocket.send_json(telem)
            await asyncio.sleep(1.2)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket Error: {e}")
