from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db import get_session
from app.api.auth import get_current_user

router = APIRouter()


class TeamCreate(BaseModel):
    name: str
    department_id: str
    description: Optional[str] = None


@router.post("/teams", status_code=201)
async def create_team(
    payload: TeamCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    user = await get_current_user(request, session)

    # Verify department exists
    dept = await session.execute(
        text("SELECT id FROM departments WHERE id = :id"),
        {"id": payload.department_id},
    )
    if not dept.first():
        raise HTTPException(status_code=404, detail="Department not found")

    res = await session.execute(
        text("""
            INSERT INTO teams (tenant_id, department_id, name, description, created_by)
            VALUES (current_setting('app.current_tenant')::uuid, :did, :name, :desc, :uid)
            RETURNING id, name, description, created_at
        """),
        {"did": payload.department_id, "name": payload.name, "desc": payload.description, "uid": user["id"]},
    )
    row = res.first()
    team_id = str(row[0])

    # Auto-join the creator
    await session.execute(
        text("""
            INSERT INTO team_members (tenant_id, team_id, user_id)
            VALUES (current_setting('app.current_tenant')::uuid, :tid, :uid)
        """),
        {"tid": team_id, "uid": user["id"]},
    )

    return {"id": team_id, "name": row[1], "description": row[2],
            "department_id": payload.department_id,
            "created_at": row[3].isoformat() if hasattr(row[3], "isoformat") else str(row[3])}


@router.get("/teams")
async def list_teams(department_id: Optional[str] = None, session: AsyncSession = Depends(get_session)):
    if department_id:
        res = await session.execute(text("""
            SELECT t.id, t.name, t.description, t.department_id, d.name as dept_name, t.created_at,
                   (SELECT count(*) FROM team_members tm WHERE tm.team_id = t.id) as member_count
            FROM teams t JOIN departments d ON t.department_id = d.id
            WHERE t.department_id = :did ORDER BY t.name ASC
        """), {"did": department_id})
    else:
        res = await session.execute(text("""
            SELECT t.id, t.name, t.description, t.department_id, d.name as dept_name, t.created_at,
                   (SELECT count(*) FROM team_members tm WHERE tm.team_id = t.id) as member_count
            FROM teams t JOIN departments d ON t.department_id = d.id
            ORDER BY d.name ASC, t.name ASC
        """))
    return [
        {"id": str(r[0]), "name": r[1], "description": r[2],
         "department_id": str(r[3]), "department_name": r[4],
         "created_at": r[5].isoformat() if hasattr(r[5], "isoformat") else str(r[5]),
         "member_count": r[6]}
        for r in res.fetchall()
    ]


@router.get("/teams/my")
async def my_teams(request: Request, session: AsyncSession = Depends(get_session)):
    user = await get_current_user(request, session)
    res = await session.execute(text("""
        SELECT t.id, t.name, t.description, t.department_id, d.name as dept_name, t.created_at,
               (SELECT count(*) FROM team_members tm2 WHERE tm2.team_id = t.id) as member_count
        FROM team_members tm
        JOIN teams t ON tm.team_id = t.id
        JOIN departments d ON t.department_id = d.id
        WHERE tm.user_id = :uid
        ORDER BY d.name ASC, t.name ASC
    """), {"uid": user["id"]})
    return [
        {"id": str(r[0]), "name": r[1], "description": r[2],
         "department_id": str(r[3]), "department_name": r[4],
         "created_at": r[5].isoformat() if hasattr(r[5], "isoformat") else str(r[5]),
         "member_count": r[6]}
        for r in res.fetchall()
    ]


@router.get("/teams/{team_id}")
async def get_team(team_id: str, request: Request, session: AsyncSession = Depends(get_session)):
    res = await session.execute(text("""
        SELECT t.id, t.name, t.description, t.department_id, d.name as dept_name, t.created_at
        FROM teams t JOIN departments d ON t.department_id = d.id
        WHERE t.id = :id
    """), {"id": team_id})
    row = res.first()
    if not row:
        raise HTTPException(status_code=404, detail="Team not found")

    # Get members
    members_res = await session.execute(text("""
        SELECT u.id, u.name, u.email, u.role, tm.joined_at
        FROM team_members tm JOIN users u ON tm.user_id = u.id
        WHERE tm.team_id = :tid ORDER BY tm.joined_at ASC
    """), {"tid": team_id})

    members = [
        {"id": str(r[0]), "name": r[1], "email": r[2], "role": r[3],
         "joined_at": r[4].isoformat() if hasattr(r[4], "isoformat") else str(r[4])}
        for r in members_res.fetchall()
    ]

    # Check if current user is member
    is_member = False
    try:
        user = await get_current_user(request, session)
        member_check = await session.execute(
            text("SELECT 1 FROM team_members WHERE team_id = :tid AND user_id = :uid"),
            {"tid": team_id, "uid": user["id"]},
        )
        is_member = member_check.first() is not None
    except HTTPException:
        pass

    return {
        "id": str(row[0]), "name": row[1], "description": row[2],
        "department_id": str(row[3]), "department_name": row[4],
        "created_at": row[5].isoformat() if hasattr(row[5], "isoformat") else str(row[5]),
        "members": members,
        "is_member": is_member,
    }


@router.post("/teams/{team_id}/join")
async def join_team(team_id: str, request: Request, session: AsyncSession = Depends(get_session)):
    user = await get_current_user(request, session)

    # Verify team exists
    team = await session.execute(text("SELECT id, name FROM teams WHERE id = :id"), {"id": team_id})
    row = team.first()
    if not row:
        raise HTTPException(status_code=404, detail="Team not found")

    # Check if already member
    existing = await session.execute(
        text("SELECT 1 FROM team_members WHERE team_id = :tid AND user_id = :uid"),
        {"tid": team_id, "uid": user["id"]},
    )
    if existing.first():
        raise HTTPException(status_code=400, detail="Already a member of this team")

    await session.execute(
        text("""
            INSERT INTO team_members (tenant_id, team_id, user_id)
            VALUES (current_setting('app.current_tenant')::uuid, :tid, :uid)
        """),
        {"tid": team_id, "uid": user["id"]},
    )
    return {"ok": True, "team": str(row[1])}


@router.post("/teams/{team_id}/leave")
async def leave_team(team_id: str, request: Request, session: AsyncSession = Depends(get_session)):
    user = await get_current_user(request, session)

    res = await session.execute(
        text("DELETE FROM team_members WHERE team_id = :tid AND user_id = :uid RETURNING id"),
        {"tid": team_id, "uid": user["id"]},
    )
    if not res.first():
        raise HTTPException(status_code=400, detail="Not a member of this team")
    return {"ok": True}
