import argparse
import asyncio
import json
import logging
import os
import sys
import time
from pathlib import Path
from typing import Dict, Any, Optional
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from agents.simulation import TrafficSimulation
from agents.models import Direction

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('traffic_system.log')
    ]
)
logger = logging.getLogger("main")

# Create FastAPI instance
app = FastAPI(title="TrafficO Decentralized Intersection System")

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global simulation instance
simulation: Optional[TrafficSimulation] = None
clients = set()


class EmergencyVehicleRequest(BaseModel):
    """Model for requesting emergency vehicle injection."""
    intersection_id: str
    from_direction: Direction
    to_direction: Direction


@app.on_event("startup")
def startup_event():
    """Initialize the simulation on startup."""
    global simulation
    config_path = os.path.join(os.path.dirname(__file__), "config", "intersections.json")
    simulation = TrafficSimulation(config_path)


@app.on_event("shutdown")
def shutdown_event():
    """Stop the simulation on shutdown."""
    global simulation
    if simulation and simulation.running:
        simulation.stop()


@app.get("/")
def read_root():
    """Root endpoint."""
    return {"message": "TrafficO Decentralized Intersection System API"}


@app.get("/status")
def get_status():
    """Get the current status of the simulation."""
    global simulation
    if not simulation:
        raise HTTPException(status_code=503, detail="Simulation not initialized")
    
    return simulation.get_simulation_state()


@app.post("/start")
def start_simulation():
    """Start the simulation."""
    global simulation
    if not simulation:
        raise HTTPException(status_code=503, detail="Simulation not initialized")
    
    if not simulation.running:
        simulation.start()
    
    return {"status": "started", "timestamp": time.time()}


@app.post("/stop")
def stop_simulation():
    """Stop the simulation."""
    global simulation
    if not simulation:
        raise HTTPException(status_code=503, detail="Simulation not initialized")
    
    if simulation.running:
        simulation.stop()
    
    return {"status": "stopped", "timestamp": time.time()}


@app.post("/emergency")
def inject_emergency(request: EmergencyVehicleRequest):
    """Inject an emergency vehicle into the simulation."""
    global simulation
    if not simulation:
        raise HTTPException(status_code=503, detail="Simulation not initialized")
    
    simulation.inject_emergency_vehicle(
        intersection_id=request.intersection_id,
        from_direction=request.from_direction,
        to_direction=request.to_direction
    )
    
    return {"status": "emergency_injected", "timestamp": time.time()}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates."""
    global simulation, clients
    
    await websocket.accept()
    clients.add(websocket)
    
    try:
        # Send initial state
        if simulation:
            await websocket.send_json(simulation.get_simulation_state())
        
        # Keep connection alive and handle messages
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                if message.get("type") == "emergency":
                    # Handle emergency injection via WebSocket
                    if simulation:
                        simulation.inject_emergency_vehicle(
                            intersection_id=message.get("intersection_id"),
                            from_direction=message.get("from_direction", Direction.NORTH),
                            to_direction=message.get("to_direction", Direction.SOUTH)
                        )
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON received: {data}")
            
    except WebSocketDisconnect:
        clients.remove(websocket)


async def broadcast_state():
    """Broadcast the current state to all connected WebSocket clients."""
    global simulation, clients
    while True:
        if simulation and simulation.running and clients:
            state = simulation.get_simulation_state()
            disconnected_clients = set()
            
            for client in clients:
                try:
                    await client.send_json(state)
                except Exception as e:
                    logger.error(f"Error sending to client: {e}")
                    disconnected_clients.add(client)
            
            # Remove disconnected clients
            clients -= disconnected_clients
        
        await asyncio.sleep(1)  # Update every second


@app.on_event("startup")
async def start_broadcaster():
    """Start the background task for broadcasting state updates."""
    asyncio.create_task(broadcast_state())


def main():
    """Main entry point for running the API server."""
    parser = argparse.ArgumentParser(description="TrafficO Decentralized Intersection System")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="Host to bind the API server")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind the API server")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload")
    
    args = parser.parse_args()
    
    # Start the FastAPI server
    uvicorn.run("agents.main:app", host=args.host, port=args.port, reload=args.reload)


if __name__ == "__main__":
    main()
