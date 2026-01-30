import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from routes import emergencies, ambulances, hospitals, best_route
from db import init_db
from models.models import User

app = FastAPI(title="Smart Ambulance Routing API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db.create_tables_and_seed()

app.include_router(emergencies.router)
app.include_router(ambulances.router)
app.include_router(hospitals.router)
app.include_router(best_route.router)

# Simple WebSocket manager for ambulance location updates
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        living = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
                living.append(connection)
            except Exception:
                pass
        self.active_connections = living

manager = ConnectionManager()

@app.websocket('/ws/ambulances')
async def ambulance_ws(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Echo to all other subscribers (broadcast ambulance update)
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# ============ AUTH ENDPOINTS ============

class UserRoleRequest(BaseModel):
    firebase_uid: str
    email: str
    role: str  # "ambulance", "hospital", or "admin"
    display_name: str | None = None

class UserRoleResponse(BaseModel):
    uid: str
    email: str
    role: str
    display_name: str | None

@app.post("/api/auth/set-role", response_model=UserRoleResponse)
def set_user_role(request: UserRoleRequest):
    """
    Set or update user role after Firebase authentication.
    Called from frontend after user logs in with Google OAuth.
    """
    from db.database import SessionLocal
    db = SessionLocal()
    try:
        # Check if user exists
        user = db.query(User).filter(User.firebase_uid == request.firebase_uid).first()
        
        if not user:
            # Create new user
            user = User(
                firebase_uid=request.firebase_uid,
                email=request.email,
                role=request.role,
                display_name=request.display_name
            )
            db.add(user)
        else:
            # Update existing user
            user.role = request.role
            user.display_name = request.display_name
        
        db.commit()
        db.refresh(user)
        
        return UserRoleResponse(
            uid=user.firebase_uid,
            email=user.email,
            role=user.role,
            display_name=user.display_name
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()

@app.get("/api/user-role/{firebase_uid}", response_model=UserRoleResponse)
def get_user_role(firebase_uid: str):
    """
    Get user role from Firebase UID.
    Called from frontend AuthContext to determine user's access level.
    """
    from db.database import SessionLocal
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserRoleResponse(
            uid=user.firebase_uid,
            email=user.email,
            role=user.role,
            display_name=user.display_name
        )
    finally:
        db.close()

@app.get("/api/health")
def health_check():
    """Simple health check endpoint"""
    return {"status": "ok", "service": "Smart Ambulance Routing API"}
