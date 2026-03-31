"""add departments, teams, team_members and link tickets to teams

Revision ID: 0004_departments_teams
Revises: 0003_role_invite
Create Date: 2026-03-31 00:00:00.000000
"""
from alembic import op

revision = '0004_departments_teams'
down_revision = '0003_role_invite'
branch_labels = None
depends_on = None


def upgrade():
    # Departments
    op.execute("""
    CREATE TABLE IF NOT EXISTS departments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id),
      name TEXT NOT NULL,
      description TEXT,
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT now()
    );
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_departments_tenant ON departments (tenant_id);")
    op.execute("ALTER TABLE departments ENABLE ROW LEVEL SECURITY;")
    op.execute("""
    CREATE POLICY departments_tenant_isolation ON departments
      USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
    """)

    # Teams
    op.execute("""
    CREATE TABLE IF NOT EXISTS teams (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id),
      department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT now()
    );
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_teams_department ON teams (department_id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_teams_tenant ON teams (tenant_id);")
    op.execute("ALTER TABLE teams ENABLE ROW LEVEL SECURITY;")
    op.execute("""
    CREATE POLICY teams_tenant_isolation ON teams
      USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
    """)

    # Team members (join table)
    op.execute("""
    CREATE TABLE IF NOT EXISTS team_members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id),
      team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      joined_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE (team_id, user_id)
    );
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_team_members_team ON team_members (team_id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_team_members_user ON team_members (user_id);")
    op.execute("ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;")
    op.execute("""
    CREATE POLICY team_members_tenant_isolation ON team_members
      USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
      WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
    """)

    # Add team_id to tickets (nullable for backward compat)
    op.execute("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_tickets_team ON tickets (team_id);")


def downgrade():
    op.execute("DROP INDEX IF EXISTS ix_tickets_team;")
    op.execute("ALTER TABLE tickets DROP COLUMN IF EXISTS team_id;")

    op.execute("DROP POLICY IF EXISTS team_members_tenant_isolation ON team_members;")
    op.execute("ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;")
    op.execute("DROP TABLE IF EXISTS team_members;")

    op.execute("DROP POLICY IF EXISTS teams_tenant_isolation ON teams;")
    op.execute("ALTER TABLE teams DISABLE ROW LEVEL SECURITY;")
    op.execute("DROP TABLE IF EXISTS teams;")

    op.execute("DROP POLICY IF EXISTS departments_tenant_isolation ON departments;")
    op.execute("ALTER TABLE departments DISABLE ROW LEVEL SECURITY;")
    op.execute("DROP TABLE IF EXISTS departments;")
