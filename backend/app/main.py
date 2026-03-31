from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.db import get_session

app = FastAPI(title="Savvy Backend")
from app.api.tenants import router as tenant_router
from app.api.auth import router as auth_router
from app.api.tickets import router as tickets_router
from app.api.uploads import router as uploads_router
from app.api.departments import router as departments_router
from app.api.teams import router as teams_router
app.include_router(tenant_router, prefix="/api/public")
app.include_router(auth_router, prefix="/api/auth")
app.include_router(tickets_router, prefix="/api")
app.include_router(uploads_router, prefix="/api")
app.include_router(departments_router, prefix="/api")
app.include_router(teams_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def tenant_middleware(request: Request, call_next):
    """Extract tenant slug from host (subdomain) or X-Tenant-Slug header and
    attach it to request.state.tenant_slug for downstream dependencies.

    Development note: when running on localhost, set header 'X-Tenant-Slug' to
    emulate tenant subdomains.
    """
    host = request.headers.get("host", "")
    hostname = host.split(":")[0]
    tenant_slug = None

    # Development override via header when using localhost
    if hostname.startswith("localhost") or hostname.startswith("127.0.0.1"):
        tenant_slug = request.headers.get("x-tenant-slug")
    else:
        parts = hostname.split(".")
        # Expect slug.app.example.com -> slug is the first label
        if len(parts) >= 3:
            tenant_slug = parts[0]

    # Fallback to header if not found in host
    if not tenant_slug:
        tenant_slug = request.headers.get("x-tenant-slug")

    request.state.tenant_slug = tenant_slug

    response = await call_next(request)
    return response


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/tenants/current")
async def current_tenant(request: Request, session: AsyncSession = Depends(get_session)):
    """Return tenant info resolved from the request (for testing/provisioning)."""
    tenant_slug = getattr(request.state, "tenant_slug", None)
    if not tenant_slug:
        return {"tenant": None}

    row = await session.execute(text("SELECT id, slug, name, invite_code FROM tenants WHERE slug = :slug"), {"slug": tenant_slug})
    tenant = row.first()
    if tenant:
        id_, slug_, name_, invite_code = tenant
        return {"id": str(id_), "slug": slug_, "name": name_, "invite_code": invite_code}
    raise HTTPException(status_code=404, detail="Tenant not found")


@app.get("/api/tenants/members")
async def list_members(request: Request, session: AsyncSession = Depends(get_session)):
    """Return all users in the current tenant."""
    res = await session.execute(text("SELECT id, email, name, role, created_at FROM users ORDER BY created_at ASC"))
    return [
        {"id": str(r[0]), "email": r[1], "name": r[2], "role": r[3],
         "created_at": r[4].isoformat() if hasattr(r[4], 'isoformat') else str(r[4])}
        for r in res.fetchall()
    ]


@app.get("/api/stats")
async def tenant_stats(
    request: Request,
    department_id: str = None,
    team_id: str = None,
    session: AsyncSession = Depends(get_session),
):
    """Return ticket stats, optionally scoped to a department or team."""
    scope = "TRUE"
    params: dict = {}

    if team_id:
        scope = "team_id = :team_id"
        params["team_id"] = team_id
    elif department_id:
        scope = "team_id IN (SELECT te.id FROM teams te WHERE te.department_id = :dept_id)"
        params["dept_id"] = department_id

    total = (await session.execute(text(f"SELECT count(*) FROM tickets WHERE {scope}"), params)).scalar() or 0
    open_count = (await session.execute(text(f"SELECT count(*) FROM tickets WHERE status = 'open' AND {scope}"), params)).scalar() or 0
    pending = (await session.execute(text(f"SELECT count(*) FROM tickets WHERE status = 'pending' AND {scope}"), params)).scalar() or 0
    resolved = (await session.execute(text(f"SELECT count(*) FROM tickets WHERE status = 'resolved' AND {scope}"), params)).scalar() or 0
    high_priority = (await session.execute(text(f"SELECT count(*) FROM tickets WHERE priority IN ('high', 'urgent') AND status NOT IN ('resolved', 'closed') AND {scope}"), params)).scalar() or 0
    agents = (await session.execute(text("SELECT count(*) FROM users"))).scalar() or 0
    departments = (await session.execute(text("SELECT count(*) FROM departments"))).scalar() or 0
    teams_count = (await session.execute(text("SELECT count(*) FROM teams"))).scalar() or 0
    return {"total": total, "open": open_count, "pending": pending, "resolved": resolved,
            "high_priority": high_priority, "agents": agents, "departments": departments, "teams": teams_count}
