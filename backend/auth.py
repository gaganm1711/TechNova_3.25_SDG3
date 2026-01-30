"""
JWT Authentication for Smart Ambulance System
(Simplified version without PyJWT dependency)
"""
import base64
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status, Header
from typing import Optional

SECRET_KEY = "smart-ambulance-secret-key-2026"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin"


def create_access_token(username: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Generate a simple token (base64 encoded username + timestamp)
    In production, use PyJWT for proper JWT tokens.
    """
    timestamp = datetime.utcnow().isoformat()
    token_data = f"{username}:{timestamp}:{SECRET_KEY}"
    token = base64.b64encode(token_data.encode()).decode()
    return token


def verify_token(token: str) -> str:
    """Verify and decode token"""
    try:
        decoded = base64.b64decode(token.encode()).decode()
        username = decoded.split(":")[0]
        if username != ADMIN_USERNAME:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return username
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


async def get_current_admin(authorization: Optional[str] = Header(None)) -> str:
    """Dependency to verify admin user via Authorization header"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )
    
    # Handle "Bearer <token>" format
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        token = parts[1]
    else:
        token = authorization
    
    username = verify_token(token)
    if username != ADMIN_USERNAME:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    return username


