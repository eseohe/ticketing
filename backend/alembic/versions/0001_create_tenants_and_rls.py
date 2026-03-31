"""create tenants, users, tickets, comments and enable RLS

Revision ID: 0001_create_tenants_and_rls
Revises: 
Create Date: 2026-03-26 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_create_tenants_and_rls'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Extensions
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")

    # Tenants
    op.execute("""
    CREATE TABLE IF NOT EXISTS tenants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      plan_id UUID,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    """)

    # Users
    op.execute("""
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id),
      email TEXT NOT NULL,
      name TEXT,
      hashed_password TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    """)

    # Tickets
    op.execute("""
    CREATE TABLE IF NOT EXISTS tickets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id),
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'open',
      priority TEXT,
      assignee_id UUID,
      created_by UUID,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    """)

    op.execute("CREATE INDEX IF NOT EXISTS ix_tickets_tenant_created_at ON tickets (tenant_id, created_at);")

    # Comments
    op.execute("""
    CREATE TABLE IF NOT EXISTS comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id),
      ticket_id UUID NOT NULL REFERENCES tickets(id),
      author_id UUID,
      body TEXT,
      is_internal BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    """)

    op.execute("CREATE INDEX IF NOT EXISTS ix_comments_ticket ON comments (ticket_id);")

    # Enable RLS and policies
    op.execute("ALTER TABLE users ENABLE ROW LEVEL SECURITY;")
    op.execute("""
    CREATE POLICY users_tenant_isolation ON users
      USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
    """)

    op.execute("ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;")
    op.execute("""
    CREATE POLICY tickets_tenant_isolation ON tickets
      USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
    """)

    op.execute("ALTER TABLE comments ENABLE ROW LEVEL SECURITY;")
    op.execute("""
    CREATE POLICY comments_tenant_isolation ON comments
      USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
    """)


def downgrade():
    # Drop policies and tables in reverse order
    op.execute("DROP POLICY IF EXISTS comments_tenant_isolation ON comments;")
    op.execute("ALTER TABLE comments DISABLE ROW LEVEL SECURITY;")
    op.execute("DROP TABLE IF EXISTS comments;")

    op.execute("DROP POLICY IF EXISTS tickets_tenant_isolation ON tickets;")
    op.execute("ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;")
    op.execute("DROP TABLE IF EXISTS tickets;")

    op.execute("DROP POLICY IF EXISTS users_tenant_isolation ON users;")
    op.execute("ALTER TABLE users DISABLE ROW LEVEL SECURITY;")
    op.execute("DROP TABLE IF EXISTS users;")

    op.execute("DROP TABLE IF EXISTS tenants;")
    op.execute("DROP EXTENSION IF EXISTS pgcrypto;")
