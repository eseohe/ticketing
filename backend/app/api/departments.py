from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db import get_session
from app.api.auth import get_current_user

router = APIRouter()


class DepartmentCreate(BaseModel):
    name: str
    description: Optional[str] = None


@router.post("/departments", status_code=201)
async def create_department(
    payload: DepartmentCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    user = await get_current_user(request, session)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create departments")

    res = await session.execute(
        text("""
            INSERT INTO departments (tenant_id, name, description, created_by)
            VALUES (current_setting('app.current_tenant')::uuid, :name, :desc, :uid)
            RETURNING id, name, description, created_at
        """),
        {"name": payload.name, "desc": payload.description, "uid": user["id"]},
    )
    row = res.first()
    return {"id": str(row[0]), "name": row[1], "description": row[2],
            "created_at": row[3].isoformat() if hasattr(row[3], "isoformat") else str(row[3])}


@router.get("/departments")
async def list_departments(session: AsyncSession = Depends(get_session)):
    res = await session.execute(text("""
        SELECT d.id, d.name, d.description, d.created_at,
               (SELECT count(*) FROM teams t WHERE t.department_id = d.id) as team_count
        FROM departments d ORDER BY d.name ASC
    """))
    return [
        {"id": str(r[0]), "name": r[1], "description": r[2],
         "created_at": r[3].isoformat() if hasattr(r[3], "isoformat") else str(r[3]),
         "team_count": r[4]}
        for r in res.fetchall()
    ]


@router.get("/departments/{dept_id}")
async def get_department(dept_id: str, session: AsyncSession = Depends(get_session)):
    res = await session.execute(
        text("SELECT id, name, description, created_at FROM departments WHERE id = :id"),
        {"id": dept_id},
    )
    row = res.first()
    if not row:
        raise HTTPException(status_code=404, detail="Department not found")

    # Get teams in this department
    teams_res = await session.execute(text("""
        SELECT t.id, t.name, t.description, t.created_at,
               (SELECT count(*) FROM team_members tm WHERE tm.team_id = t.id) as member_count
        FROM teams t WHERE t.department_id = :did ORDER BY t.name ASC
    """), {"did": dept_id})

    teams = [
        {"id": str(r[0]), "name": r[1], "description": r[2],
         "created_at": r[3].isoformat() if hasattr(r[3], "isoformat") else str(r[3]),
         "member_count": r[4]}
        for r in teams_res.fetchall()
    ]

    return {
        "id": str(row[0]), "name": row[1], "description": row[2],
        "created_at": row[3].isoformat() if hasattr(row[3], "isoformat") else str(row[3]),
        "teams": teams,
    }


@router.delete("/departments/{dept_id}", status_code=204)
async def delete_department(
    dept_id: str,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    user = await get_current_user(request, session)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete departments")

    res = await session.execute(
        text("DELETE FROM departments WHERE id = :id RETURNING id"),
        {"id": dept_id},
    )
    if not res.first():
        raise HTTPException(status_code=404, detail="Department not found")
    return None
