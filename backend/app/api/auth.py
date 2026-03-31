from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db import get_session
from jose import jwt, JWTError
import os
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter()

SECRET_KEY = os.environ.get("SECRET_KEY", "change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))


class LoginPayload(BaseModel):
    email: EmailStr
    password: str
    slug: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginPayload, response: Response, session: AsyncSession = Depends(get_session)):
    """Authenticate a user within a specific tenant (by slug)."""
    # Resolve tenant
    t_res = await session.execute(
        text("SELECT id FROM tenants WHERE slug = :slug LIMIT 1"),
        {"slug": payload.slug},
    )
    t_row = t_res.first()
    if not t_row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Workspace not found")
    tenant_id = str(t_row[0])

    # Find user within this tenant
    res = await session.execute(
        text("SELECT id, hashed_password, role FROM users WHERE email = :email AND tenant_id = :tid LIMIT 1"),
        {"email": payload.email, "tid": tenant_id},
    )
    row = res.first()
    if not row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    user_id, hashed, role = row

    import bcrypt
    if not bcrypt.checkpw(payload.password.encode('utf-8')[:72], hashed.encode('utf-8')):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token_payload = {"sub": str(user_id), "tenant_id": tenant_id, "role": role}
    token = create_access_token(token_payload)

    response.set_cookie(
        key="session", value=token, httponly=True,
        secure=False, samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60, path="/",
    )
    return {"access_token": token, "token_type": "bearer"}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("session", path="/")
    return {"ok": True}


async def get_current_user(request: Request, session: AsyncSession = Depends(get_session)):
    """Extract the authenticated user from JWT (header or cookie)."""
    token = None
    auth = request.headers.get("authorization")
    if auth and auth.lower().startswith("bearer "):
        token = auth.split(" ", 1)[1]
    if not token:
        token = request.cookies.get("session")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    res = await session.execute(
        text("SELECT id, email, name, role FROM users WHERE id = :id LIMIT 1"),
        {"id": user_id},
    )
    row = res.first()
    if not row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    id_, email, name_, role = row
    return {"id": str(id_), "email": email, "name": name_, "role": role}


@router.get("/me")
async def me(request: Request, session: AsyncSession = Depends(get_session)):
    """Return the current user profile plus tenant info."""
    user = await get_current_user(request, session)

    # Get tenant info from the JWT
    token = request.headers.get("authorization", "").replace("Bearer ", "") or request.cookies.get("session", "")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        tenant_id = payload.get("tenant_id")
    except JWTError:
        tenant_id = None

    tenant = None
    if tenant_id:
        t_res = await session.execute(
            text("SELECT id, slug, name, invite_code FROM tenants WHERE id = :id LIMIT 1"),
            {"id": tenant_id},
        )
        t_row = t_res.first()
        if t_row:
            tenant = {"id": str(t_row[0]), "slug": t_row[1], "name": t_row[2], "invite_code": t_row[3]}

    return {**user, "tenant": tenant}
