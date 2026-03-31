from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db import get_session
from typing import Optional
import unicodedata
import re
import secrets

router = APIRouter()


class TenantCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    admin_email: EmailStr
    admin_password: str


class JoinPayload(BaseModel):
    slug: str
    name: str
    email: EmailStr
    password: str


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = value.encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
    if not value:
        value = "tenant"
    return value


@router.post("/tenants", status_code=201)
async def create_tenant(payload: TenantCreate, session: AsyncSession = Depends(get_session)):
    """Create a tenant with an invite code and a default admin user."""
    base_slug = (payload.slug or slugify(payload.name)).strip().lower()
    slug = base_slug
    suffix = 1

    while True:
        res = await session.execute(text("SELECT id FROM tenants WHERE slug = :slug LIMIT 1"), {"slug": slug})
        if res.first() is None:
            break
        slug = f"{base_slug}-{suffix}"
        suffix += 1

    invite_code = secrets.token_hex(4)

    res = await session.execute(
        text("INSERT INTO tenants (slug, name, invite_code) VALUES (:slug, :name, :code) RETURNING id"),
        {"slug": slug, "name": payload.name, "code": invite_code},
    )
    row = res.first()
    tenant_id = row[0]

    import bcrypt
    password_bytes = payload.admin_password.encode('utf-8')[:72]
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')
    await session.execute(
        text("INSERT INTO users (tenant_id, email, name, hashed_password, role) VALUES (:tid, :email, :name, :hashed, 'admin')"),
        {"tid": tenant_id, "email": payload.admin_email, "name": "Admin", "hashed": hashed},
    )

    return {"id": str(tenant_id), "slug": slug, "invite_code": invite_code, "admin_email": payload.admin_email}


@router.post("/join", status_code=201)
async def join_tenant(payload: JoinPayload, session: AsyncSession = Depends(get_session)):
    """Register a worker (agent) into an existing tenant by slug."""
    # Look up tenant (not RLS-restricted since this is a public endpoint)
    res = await session.execute(
        text("SELECT id, slug, name FROM tenants WHERE slug = :slug LIMIT 1"),
        {"slug": payload.slug},
    )
    tenant = res.first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Workspace not found. Check the slug and try again.")
    tenant_id, tenant_slug, tenant_name = tenant

    # Check email uniqueness within tenant
    res = await session.execute(
        text("SELECT id FROM users WHERE tenant_id = :tid AND email = :email LIMIT 1"),
        {"tid": tenant_id, "email": payload.email},
    )
    if res.first():
        raise HTTPException(status_code=400, detail="A user with this email already exists in this workspace.")

    import bcrypt
    password_bytes = payload.password.encode('utf-8')[:72]
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')
    await session.execute(
        text("INSERT INTO users (tenant_id, email, name, hashed_password, role) VALUES (:tid, :email, :name, :hashed, 'agent')"),
        {"tid": tenant_id, "email": payload.email, "name": payload.name, "hashed": hashed},
    )

    return {"slug": tenant_slug, "tenant_name": tenant_name, "email": payload.email}
