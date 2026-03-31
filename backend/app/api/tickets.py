from fastapi import APIRouter, Depends, HTTPException, Body, Request
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db import get_session
from app.api.auth import get_current_user

router = APIRouter()


class TicketCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: Optional[str] = "medium"
    team_id: Optional[str] = None


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee_id: Optional[str] = None
    team_id: Optional[str] = None


@router.post("/tickets", status_code=201)
async def create_ticket(
    payload: TicketCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    created_by = None
    try:
        user = await get_current_user(request, session)
        created_by = user["id"]
    except HTTPException:
        pass

    query = text("""
        INSERT INTO tickets (tenant_id, title, description, status, priority, created_by, team_id)
        VALUES (current_setting('app.current_tenant')::uuid, :title, :desc, 'open', :priority, :created_by, :team_id)
        RETURNING id, title, description, status, priority, assignee_id, created_by, created_at, team_id
    """)
    res = await session.execute(query, {
        "title": payload.title, "desc": payload.description,
        "priority": payload.priority, "created_by": created_by,
        "team_id": payload.team_id,
    })
    row = res.first()
    if not row:
        raise HTTPException(status_code=500, detail="Failed to create ticket")
    return _row_to_ticket(row)


@router.get("/tickets")
async def list_tickets(
    limit: int = 50, offset: int = 0,
    status: Optional[str] = None,
    team_id: Optional[str] = None,
    department_id: Optional[str] = None,
    my_teams: Optional[bool] = None,
    request: Request = None,
    session: AsyncSession = Depends(get_session),
):
    conditions = []
    params: dict = {"limit": limit, "offset": offset}

    if status:
        conditions.append("t.status = :status")
        params["status"] = status

    if team_id:
        conditions.append("t.team_id = :team_id")
        params["team_id"] = team_id

    if department_id:
        conditions.append("t.team_id IN (SELECT te.id FROM teams te WHERE te.department_id = :dept_id)")
        params["dept_id"] = department_id

    if my_teams:
        try:
            user = await get_current_user(request, session)
            conditions.append("t.team_id IN (SELECT tm.team_id FROM team_members tm WHERE tm.user_id = :uid)")
            params["uid"] = user["id"]
        except HTTPException:
            pass

    where = " AND ".join(conditions) if conditions else "TRUE"
    q = f"""
        SELECT t.id, t.title, t.description, t.status, t.priority, t.assignee_id,
               t.created_by, t.created_at, t.team_id, tm.name as team_name
        FROM tickets t LEFT JOIN teams tm ON t.team_id = tm.id
        WHERE {where}
        ORDER BY t.created_at DESC LIMIT :limit OFFSET :offset
    """
    res = await session.execute(text(q), params)
    return [_row_to_ticket(r) for r in res.fetchall()]


@router.get("/tickets/{ticket_id}")
async def get_ticket(ticket_id: str, session: AsyncSession = Depends(get_session)):
    res = await session.execute(
        text("""
            SELECT t.id, t.title, t.description, t.status, t.priority, t.assignee_id,
                   t.created_by, t.created_at, t.team_id, tm.name as team_name
            FROM tickets t LEFT JOIN teams tm ON t.team_id = tm.id
            WHERE t.id = :id
        """),
        {"id": ticket_id},
    )
    row = res.first()
    if not row:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return _row_to_ticket(row)


@router.patch("/tickets/{ticket_id}")
async def update_ticket(
    ticket_id: str,
    payload: TicketUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    user = await get_current_user(request, session)
    sets = []
    params: dict = {"id": ticket_id}
    if payload.status is not None:
        sets.append("status = :status")
        params["status"] = payload.status
    if payload.priority is not None:
        sets.append("priority = :priority")
        params["priority"] = payload.priority
    if payload.assignee_id is not None:
        sets.append("assignee_id = :assignee_id")
        params["assignee_id"] = payload.assignee_id
    if payload.team_id is not None:
        sets.append("team_id = :team_id")
        params["team_id"] = payload.team_id
    if not sets:
        raise HTTPException(status_code=400, detail="Nothing to update")
    sets.append("updated_at = now()")
    q = f"""
        UPDATE tickets SET {', '.join(sets)} WHERE id = :id
        RETURNING id, title, description, status, priority, assignee_id, created_by, created_at, team_id
    """
    res = await session.execute(text(q), params)
    row = res.first()
    if not row:
        raise HTTPException(status_code=404, detail="Ticket not found")
    # Re-fetch to get team_name via join
    return await get_ticket(ticket_id, session)


@router.post("/tickets/{ticket_id}/comments", status_code=201)
async def add_comment(
    ticket_id: str,
    request: Request,
    payload: dict = Body(...),
    session: AsyncSession = Depends(get_session),
):
    author_id = None
    try:
        user = await get_current_user(request, session)
        author_id = user["id"]
    except HTTPException:
        pass

    body_text = payload.get("body") if isinstance(payload, dict) else str(payload)
    res = await session.execute(
        text("""
            INSERT INTO comments (tenant_id, ticket_id, author_id, body, is_internal)
            VALUES (current_setting('app.current_tenant')::uuid, :tid, :aid, :body, FALSE)
            RETURNING id, author_id, body, created_at
        """),
        {"tid": ticket_id, "aid": author_id, "body": body_text},
    )
    row = res.first()
    if not row:
        raise HTTPException(status_code=500, detail="Failed to add comment")
    return {"id": str(row[0]), "author_id": str(row[1]) if row[1] else None, "body": row[2], "created_at": row[3].isoformat() if hasattr(row[3], 'isoformat') else str(row[3])}


@router.get("/tickets/{ticket_id}/comments")
async def list_comments(ticket_id: str, session: AsyncSession = Depends(get_session)):
    res = await session.execute(
        text("""
            SELECT c.id, c.author_id, c.body, c.created_at, u.name as author_name
            FROM comments c LEFT JOIN users u ON c.author_id = u.id
            WHERE c.ticket_id = :tid ORDER BY c.created_at ASC
        """),
        {"tid": ticket_id},
    )
    return [
        {"id": str(r[0]), "author_id": str(r[1]) if r[1] else None, "body": r[2],
         "created_at": r[3].isoformat() if hasattr(r[3], 'isoformat') else str(r[3]),
         "author_name": r[4] or "System"}
        for r in res.fetchall()
    ]


def _row_to_ticket(row) -> dict:
    # Handles both 8-col (legacy) and 10-col (with team_id, team_name) results
    cols = list(row)
    team_id = cols[8] if len(cols) > 8 else None
    team_name = cols[9] if len(cols) > 9 else None
    return {
        "id": str(cols[0]), "title": cols[1], "description": cols[2], "status": cols[3],
        "priority": cols[4], "assignee_id": str(cols[5]) if cols[5] else None,
        "created_by": str(cols[6]) if cols[6] else None,
        "created_at": cols[7].isoformat() if hasattr(cols[7], 'isoformat') else str(cols[7]),
        "team_id": str(team_id) if team_id else None,
        "team_name": team_name,
    }
