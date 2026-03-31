# start-local.ps1
# Helper to start the project locally. Prefers Docker Compose; otherwise prints manual steps.

if (Get-Command docker -ErrorAction SilentlyContinue) {
  Write-Host "Docker found. Starting with docker-compose..."
  docker-compose up --build
} else {
  Write-Host "Docker not found. Please run the following commands manually:"
  Write-Host "1) Backend:"
  Write-Host "   cd backend"
  Write-Host "   python -m venv .venv"
  Write-Host "   . .venv\Scripts\Activate.ps1  # (PowerShell)"
  Write-Host "   pip install -r requirements.txt"
  Write-Host "   alembic upgrade head  # apply migrations"
  Write-Host "   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
  Write-Host "2) Frontend (new terminal):"
  Write-Host "   cd frontend"
  Write-Host "   npm ci"
  Write-Host "   npm run dev -- --host"
  Write-Host "Notes: If PowerShell 7 (pwsh) is not installed, run scaffold.ps1 with Windows PowerShell:\n  powershell -ExecutionPolicy Bypass -File .\scaffold.ps1"
}