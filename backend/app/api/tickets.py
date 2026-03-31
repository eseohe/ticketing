from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db import get_session

router = APIRouter()


class TicketCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    status: Optional[str] = "open"


class TicketOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    status: str
    created_at: str


@router.post("/tickets", response_model=TicketOut, status_code=201)
async def create_ticket(payload: TicketCreate, session: AsyncSession = Depends(get_session)):
    """Create a ticket scoped to the current tenant using PostgreSQL RLS.

    The INSERT uses current_setting('app.current_tenant')::uuid for tenant_id so
    the application doesn't have to provide tenant_id explicitly.
    """
    query = text(
        """
        INSERT INTO tickets (tenant_id, title, description, status, created_by)
        VALUES (current_setting('app.current_tenant')::uuid, :title, :description, :status, NULL)
        RETURNING id, title, description, status, created_at
        """
    )
    res = await session.execute(query, {"title": payload.title, "description": payload.description, "status": payload.status})
    row = res.first()
    if not row:
        raise HTTPException(status_code=500, detail="Failed to create ticket")
    id_, title, description, status_, created_at = row
    return {"id": str(id_), "title": title, "description": description, "status": status_, "created_at": created_at.isoformat() if hasattr(created_at, 'isoformat') else str(created_at)}


@router.get("/tickets", response_model=List[TicketOut])
async def list_tickets(limit: int = 50, offset: int = 0, session: AsyncSession = Depends(get_session)):
    res = await session.execute(text("SELECT id, title, description, status, created_at FROM tickets ORDER BY created_at DESC LIMIT :limit OFFSET :offset"), {"limit": limit, "offset": offset})
    rows = res.fetchall()
    out = []
    for r in rows:
        id_, title, description, status_, created_at = r
        out.append({"id": str(id_), "title": title, "description": description, "status": status_, "created_at": created_at.isoformat() if hasattr(created_at, 'isoformat') else str(created_at)})
    return out


@router.get("/tickets/{ticket_id}")
async def get_ticket(ticket_id: str, session: AsyncSession = Depends(get_session)):
    res = await session.execute(text("SELECT id, title, description, status, created_at FROM tickets WHERE id = :id"), {"id": ticket_id})
    row = res.first()
    if not row:
        raise HTTPException(status_code=404, detail="Ticket not found")
    id_, title, description, status_, created_at = row
    return {"id": str(id_), "title": title, "description": description, "status": status_, "created_at": created_at.isoformat() if hasattr(created_at, 'isoformat') else str(created_at)}


@router.post("/tickets/{ticket_id}/comments", status_code=201)
async def add_comment(ticket_id: str, payload: dict = Body(...), session: AsyncSession = Depends(get_session)):
    body_text = payload.get("body") if isinstance(payload, dict) else str(payload)
    res = await session.execute(text("INSERT INTO comments (tenant_id, ticket_id, author_id, body, is_internal) VALUES (current_setting('app.current_tenant')::uuid, :ticket_id, NULL, :body, FALSE) RETURNING id, created_at"), {"ticket_id": ticket_id, "body": body_text})
    row = res.first()
    if not row:
        raise HTTPException(status_code=500, detail="Failed to add comment")
    id_, created_at = row
    return {"id": str(id_), "created_at": created_at.isoformat() if hasattr(created_at, 'isoformat') else str(created_at)}
