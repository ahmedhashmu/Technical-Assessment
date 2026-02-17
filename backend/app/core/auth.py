"""Authentication and authorization utilities."""
from fastapi import Header, HTTPException
from typing import Literal


UserRole = Literal["operator", "basic"]


async def get_user_role(x_user_role: str = Header(None)) -> UserRole:
    """
    Dependency to extract and validate user role from header.
    
    Args:
        x_user_role: Role from 'x-user-role' header
        
    Returns:
        Validated user role
        
    Raises:
        HTTPException: 401 if header missing, 403 if invalid role
    """
    if x_user_role is None:
        raise HTTPException(
            status_code=401,
            detail={
                "code": "MISSING_ROLE",
                "message": "Missing x-user-role header"
            }
        )
    
    if x_user_role not in ["operator", "basic"]:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "INVALID_ROLE",
                "message": f"Invalid role: {x_user_role}. Must be 'operator' or 'basic'"
            }
        )
    
    return x_user_role
