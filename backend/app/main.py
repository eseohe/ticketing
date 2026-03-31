from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.db import get_session

app = FastAPI(title="Ticketing Backend")
from app.api.tenants import router as tenant_router
from app.api.auth import router as auth_router
from app.api.tickets import router as tickets_router
from app.api.uploads import router as uploads_router
app.include_router(tenant_router, prefix="/api/public")
app.include_router(auth_router, prefix="/api/auth")
app.include_router(tickets_router, prefix="/api")
app.include_router(uploads_router, prefix="/api")

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

    row = await session.execute(text("SELECT id, slug, name FROM tenants WHERE slug = :slug"), {"slug": tenant_slug})
    tenant = row.first()
    if tenant:
        id_, slug_, name_ = tenant
        return {"id": str(id_), "slug": slug_, "name": name_}
    raise HTTPException(status_code=404, detail="Tenant not found")
