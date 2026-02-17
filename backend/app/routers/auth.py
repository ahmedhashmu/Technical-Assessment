"""Authentication API routes."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.core.auth import authenticate_user, create_access_token

router = APIRouter(prefix="/api", tags=["authentication"])


class LoginRequest(BaseModel):
    """Schema for login request."""
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Schema for login response."""
    access_token: str
    token_type: str
    user: dict


@router.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest):
    """
    Authenticate user and return JWT token.
    
    **Demo Credentials:**
    
    Admin (Operator):
    - email: admin@truthos.com
    - password: AdminPass123
    
    Basic User:
    - email: user@truthos.com
    - password: UserPass123
    
    Returns JWT token valid for 1 hour.
    """
    # Authenticate user
    user = authenticate_user(credentials.email, credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail={
                "code": "INVALID_CREDENTIALS",
                "message": "Incorrect email or password"
            }
        )
    
    # Create JWT token
    access_token = create_access_token(
        email=user["email"],
        role=user["role"]
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user={
            "email": user["email"],
            "role": user["role"]
        }
    )
