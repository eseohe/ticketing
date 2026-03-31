"""Demo script to show tenant creation, setting the session tenant, and creating a ticket.

Run locally after running migrations and starting Postgres:
  python -m venv .venv
  .\.venv\Scripts\Activate.ps1
  pip install -r requirements.txt
  python app/demo_flow.py
"""
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import text

DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql+asyncpg://postgres:postgres@localhost:5432/ticketing')


async def main():
    engine = create_async_engine(DATABASE_URL, future=True)

    async with engine.begin() as conn:
        # Create a demo tenant
        res = await conn.execute(text("INSERT INTO tenants (slug, name) VALUES (:slug, :name) RETURNING id"), {"slug": "demo-tenant", "name": "Demo Tenant"})
        row = res.first()
        tenant_id = row[0] if row else None
        print('Created tenant id:', tenant_id)

    # Insert a ticket within a transaction that sets the tenant session variable
    async with AsyncSession(engine) as session:
        async with session.begin():
            await session.execute(text("SET LOCAL app.current_tenant = :t"), {"t": str(tenant_id)})
            res = await session.execute(text("INSERT INTO tickets (tenant_id, title, description) VALUES (current_setting('app.current_tenant')::uuid, :title, :description) RETURNING id, title, created_at"), {"title": "Demo ticket", "description": "Created by demo script"})
            ticket = res.first()
            print('Inserted ticket:', ticket)

    # Query tickets for tenant
    async with AsyncSession(engine) as session:
        async with session.begin():
            await session.execute(text("SET LOCAL app.current_tenant = :t"), {"t": str(tenant_id)})
            res = await session.execute(text("SELECT id, title FROM tickets"))
            rows = res.fetchall()
            print('Tickets for tenant:', rows)


if __name__ == '__main__':
    asyncio.run(main())
