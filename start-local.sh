#!/usr/bin/env bash
# start-local.sh
# Helper to start the project locally. Prefers Docker Compose; otherwise prints manual steps.

if command -v docker >/dev/null 2>&1; then
  echo "Docker found. Starting with docker-compose..."
  docker-compose up --build
else
  cat <<'EOF'
Docker not found. Please run the following commands manually:

1) Backend:
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   alembic upgrade head  # apply migrations
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

2) Frontend (new terminal):
   cd frontend
   npm ci
   npm run dev -- --host

Notes: If PowerShell 7 (pwsh) is not installed on Windows, run scaffold.ps1 with PowerShell.exe:
  powershell -ExecutionPolicy Bypass -File ./scaffold.ps1
EOF
fi
