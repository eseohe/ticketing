"""add role to users and invite_code to tenants

Revision ID: 0003_role_invite
Revises: 0002_reset_attachments
Create Date: 2026-03-31 00:00:00.000000
"""
from alembic import op

revision = '0003_role_invite'
down_revision = '0002_reset_attachments'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'agent';")
    op.execute("ALTER TABLE tenants ADD COLUMN IF NOT EXISTS invite_code TEXT;")
    # Backfill invite codes for existing tenants
    op.execute("""
        UPDATE tenants SET invite_code = substr(md5(random()::text), 1, 8)
        WHERE invite_code IS NULL;
    """)


def downgrade():
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS role;")
    op.execute("ALTER TABLE tenants DROP COLUMN IF EXISTS invite_code;")
