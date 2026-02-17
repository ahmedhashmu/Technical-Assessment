"""Authentication and authorization utilities."""
from fastapi import Header, HTTPException, Depends
from typing import Literal


UserRole = Literal["operator", "basic"]

# Mock token to role mapping (for demo purposes)
TOKEN_ROLE_MAP = {
    "basic-test-token": "basic",
    "operator-test-token": "operator"
}


async def get_token_from_header(authorization: str = Header(None)) -> str:
    """
    Extract token from Authorization header.
    
    Args:
        authorization: Authorization header value (Bearer <token>)
        
    Returns:
        Extracted token
        
    Raises:
        HTTPException: 401 if header missing or invalid format
    """
    if authorization is None:
        raise HTTPException(
            status_code=401,
            detail={
                "code": "MISSING_TOKEN",
                "message": "Missing Authorization header"
            }
        )
    
    # Check for Bearer token format
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail={
                "code": "INVALID_TOKEN_FORMAT",
                "message": "Authorization header must be in format: Bearer <token>"
            }
        )
    
    return parts[1]


async def get_user_role(token: str = Depends(get_token_from_header)) -> UserRole:
    """
    Dependency to extract and validate user role from token.
    
    Args:
        token: Bearer token from Authorization header
        
    Returns:
        Validated user role
        
    Raises:
        HTTPException: 401 if token invalid
    """
    role = TOKEN_ROLE_MAP.get(token)
    
    if role is None:
        raise HTTPException(
            status_code=401,
            detail={
                "code": "INVALID_TOKEN",
                "message": "Invalid authentication token"
            }
        )
    
    return role


async def require_operator_role(user_role: UserRole = Depends(get_user_role)) -> UserRole:
    """
    Dependency to enforce operator role requirement.
    
    Args:
        user_role: User role from token
        
    Returns:
        Validated operator role
        
    Raises:
        HTTPException: 403 if user is not operator
    """
    if user_role != "operator":
        raise HTTPException(
            status_code=403,
            detail={
                "code": "INSUFFICIENT_PERMISSIONS",
                "message": "This operation requires operator role"
            }
        )
    
    return user_role
