from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db import get_session
from passlib.context import CryptContext
from jose import jwt, JWTError
import os
import secrets
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("SECRET_KEY", "change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))


class RegisterPayload(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = "User"


class LoginPayload(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ForgotPasswordPayload(BaseModel):
    email: EmailStr


class ResetPasswordPayload(BaseModel):
    token: str
    new_password: str


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/register", status_code=201)
async def register(payload: RegisterPayload, session: AsyncSession = Depends(get_session)):
    res = await session.execute(text("SELECT id FROM users WHERE email = :email LIMIT 1"), {"email": payload.email})
    if res.first():
        raise HTTPException(status_code=400, detail="User already exists")
    # Use direct bcrypt to avoid passlib issues
    import bcrypt
    password_bytes = payload.password.encode('utf-8')[:72]
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')
    await session.execute(text("INSERT INTO users (tenant_id, email, name, hashed_password) VALUES (current_setting('app.current_tenant')::uuid, :email, :name, :hashed)"), {"email": payload.email, "name": payload.name, "hashed": hashed})
    return {"email": payload.email}


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginPayload, response: Response, session: AsyncSession = Depends(get_session)):
    res = await session.execute(text("SELECT id, hashed_password FROM users WHERE email = :email LIMIT 1"), {"email": payload.email})
    row = res.first()
    if not row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    user_id, hashed = row
    # Use direct bcrypt to verify
    import bcrypt
    password_bytes = payload.password.encode('utf-8')[:72]
    if not bcrypt.checkpw(password_bytes, hashed.encode('utf-8')):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    tenant_res = await session.execute(text("SELECT current_setting('app.current_tenant', true)"))
    tenant_row = tenant_res.first()
    tenant_id = str(tenant_row[0]) if tenant_row and tenant_row[0] else None

    token_payload = {"sub": str(user_id), "tenant_id": tenant_id}
    token = create_access_token(token_payload)

    # set cookie for browser sessions (development defaults)
    response.set_cookie(key="session", value=token, httponly=True, secure=False, samesite="lax", max_age=ACCESS_TOKEN_EXPIRE_MINUTES*60, path="/")

    return {"access_token": token, "token_type": "bearer"}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("session", path="/")
    return {"ok": True}


async def get_current_user(request: Request, session: AsyncSession = Depends(get_session)):
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

    res = await session.execute(text("SELECT id, email, name FROM users WHERE id = :id LIMIT 1"), {"id": user_id})
    row = res.first()
    if not row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    id_, email, name_ = row
    return {"id": str(id_), "email": email, "name": name_}
