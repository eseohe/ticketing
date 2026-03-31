"""Database helpers and session dependency.

Provides an async SQLAlchemy engine and an async session dependency which:
- resolves tenant slug from request.state.tenant_slug
- begins a transaction and sets SET LOCAL app.current_tenant = '<tenant_uuid>'
  for the duration of the request transaction so Postgres RLS policies can use it
- yields an AsyncSession bound to that transaction
"""
from typing import AsyncGenerator
import os

from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from fastapi import Request

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@postgres:5432/ticketing")

# Create async engine and sessionmaker
engine = create_async_engine(DATABASE_URL, future=True)
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_session(request: Request) -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields an AsyncSession with RLS tenant set.

    Expects middleware to put tenant slug on request.state.tenant_slug.
    The function resolves the tenant id from the tenants table and issues
    SET LOCAL app.current_tenant = '<uuid>' inside a transaction so the
    setting is visible to subsequent queries in the same transaction.
    """
    tenant_slug = getattr(request.state, "tenant_slug", None)

    async with async_session() as session:
        # Open a transaction so SET LOCAL remains in effect for the duration
        async with session.begin():
            if tenant_slug:
                # Resolve tenant id from tenants table (tenants table is not RLS-restricted)
                res = await session.execute(text("SELECT id FROM tenants WHERE slug = :slug"), {"slug": tenant_slug})
                row = res.first()
                if row and row[0]:
                    tenant_id = row[0]
                    # Use SET LOCAL to keep tenant id scoped to this transaction
                    await session.execute(text(f"SET LOCAL app.current_tenant = '{tenant_id}'"))
            yield session
