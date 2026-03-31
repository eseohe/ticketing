from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db import get_session
from passlib.context import CryptContext
from typing import Optional
import unicodedata
import re

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()

class TenantCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    admin_email: EmailStr
    admin_password: str


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = value.encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
    if not value:
        value = "tenant"
    return value


@router.post("/tenants", status_code=201)
async def create_tenant(payload: TenantCreate, session: AsyncSession = Depends(get_session)):
    """Create a tenant and default admin user.

    This uses a transaction provided by get_session. The endpoint ensures slug
    uniqueness by appending a numeric suffix when needed.
    """
    base_slug = (payload.slug or slugify(payload.name)).strip().lower()
    slug = base_slug
    suffix = 1

    # Ensure uniqueness
    while True:
        res = await session.execute(text("SELECT id FROM tenants WHERE slug = :slug LIMIT 1"), {"slug": slug})
        if res.first() is None:
            break
        slug = f"{base_slug}-{suffix}"
        suffix += 1

    # Insert tenant
    res = await session.execute(
        text("INSERT INTO tenants (slug, name) VALUES (:slug, :name) RETURNING id"),
        {"slug": slug, "name": payload.name},
    )
    row = res.first()
    tenant_id = row[0]

    # Create default admin user
    # Use a fresh CryptContext to avoid initialization issues
    import bcrypt
    password_bytes = payload.admin_password.encode('utf-8')[:72]
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')
    await session.execute(
        text("INSERT INTO users (tenant_id, email, name, hashed_password) VALUES (:tenant_id, :email, :name, :hashed)"),
        {"tenant_id": tenant_id, "email": payload.admin_email, "name": "Admin", "hashed": hashed},
    )

    return {"id": str(tenant_id), "slug": slug, "admin_email": payload.admin_email}
