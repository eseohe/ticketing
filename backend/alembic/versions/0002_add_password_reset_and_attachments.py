"""add password_reset_tokens and attachments tables with RLS

Revision ID: 0002_reset_attachments
Revises: 0001_create_tenants_and_rls
Create Date: 2026-03-26 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0002_reset_attachments'
down_revision = '0001_create_tenants_and_rls'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")

    op.execute("""
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id),
      user_id UUID NOT NULL REFERENCES users(id),
      token TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    """)

    op.execute("CREATE INDEX IF NOT EXISTS ix_password_reset_token_token ON password_reset_tokens (token);")
    op.execute("ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;")
    op.execute("""
    CREATE POLICY prt_tenant_isolation ON password_reset_tokens
      USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
    """)

    op.execute("""
    CREATE TABLE IF NOT EXISTS attachments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id),
      ticket_id UUID REFERENCES tickets(id),
      comment_id UUID REFERENCES comments(id),
      storage_key TEXT NOT NULL,
      filename TEXT,
      content_type TEXT,
      size BIGINT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    """)

    op.execute("CREATE INDEX IF NOT EXISTS ix_attachments_tenant ON attachments (tenant_id);")
    op.execute("ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;")
    op.execute("""
    CREATE POLICY attachments_tenant_isolation ON attachments
      USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
    """)


def downgrade():
    op.execute("DROP POLICY IF EXISTS attachments_tenant_isolation ON attachments;")
    op.execute("ALTER TABLE attachments DISABLE ROW LEVEL SECURITY;")
    op.execute("DROP TABLE IF EXISTS attachments;")

    op.execute("DROP POLICY IF EXISTS prt_tenant_isolation ON password_reset_tokens;")
    op.execute("ALTER TABLE password_reset_tokens DISABLE ROW LEVEL SECURITY;")
    op.execute("DROP TABLE IF EXISTS password_reset_tokens;")
