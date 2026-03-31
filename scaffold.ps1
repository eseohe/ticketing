$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$dirs = @(
  'backend\app',
  'backend\app\api',
  'backend\alembic',
  'backend\tests',
  'frontend\src',
  'frontend\public',
  '.github\workflows'
)
foreach ($d in $dirs) {
  $p = Join-Path $root $d
  if (-not (Test-Path $p)) { New-Item -ItemType Directory -Path $p -Force | Out-Null }
}

# backend/requirements.txt
$requirements = @'
fastapi
uvicorn[standard]
sqlmodel
asyncpg
alembic
python-dotenv
passlib[bcrypt]
python-jose[cryptography]
httpx
celery[redis]
pgvector
'@
$requirements | Out-File -FilePath (Join-Path $root 'backend\requirements.txt') -Encoding utf8

# backend/Dockerfile
$dockerfile_backend = @'
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
'@
$dockerfile_backend | Out-File -FilePath (Join-Path $root 'backend\Dockerfile') -Encoding utf8

# backend/.env.example
$env_example = @'
DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/ticketing
REDIS_URL=redis://redis:6379/0
SECRET_KEY=change-me
APP_HOST=0.0.0.0
APP_PORT=8000
'@
$env_example | Out-File -FilePath (Join-Path $root 'backend\.env.example') -Encoding utf8

# backend app main
$main_py = @'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Ticketing Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}
'@
$main_py | Out-File -FilePath (Join-Path $root 'backend\app\main.py') -Encoding utf8

# frontend package.json (minimal)
$pkg = @'
{
  "name": "ticketing-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0"
  }
}
'@
$pkg | Out-File -FilePath (Join-Path $root 'frontend\package.json') -Encoding utf8

# frontend vite config
$vite = @'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 }
})
'@
$vite | Out-File -FilePath (Join-Path $root 'frontend\vite.config.ts') -Encoding utf8

# frontend index.html
$index = @'
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ticketing App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
'@
$index | Out-File -FilePath (Join-Path $root 'frontend\index.html') -Encoding utf8

# frontend src files
$main_tsx = @'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
'@
$main_tsx | Out-File -FilePath (Join-Path $root 'frontend\src\main.tsx') -Encoding utf8

$app_tsx = @'
import React from 'react'

export default function App() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Ticketing App</h1>
      <p>Welcome to the scaffolded frontend.</p>
    </div>
  )
}
'@
$app_tsx | Out-File -FilePath (Join-Path $root 'frontend\src\App.tsx') -Encoding utf8

$styles = @'
@tailwind base;
@tailwind components;
@tailwind utilities;
'@
$styles | Out-File -FilePath (Join-Path $root 'frontend\src\styles.css') -Encoding utf8

# tailwind & postcss configs
$tailwind = @'
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
'@
$tailwind | Out-File -FilePath (Join-Path $root 'frontend\tailwind.config.cjs') -Encoding utf8

$postcss = @'
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }
'@
$postcss | Out-File -FilePath (Join-Path $root 'frontend\postcss.config.cjs') -Encoding utf8

# frontend Dockerfile
$dockerfile_frontend = @'
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]
'@
$dockerfile_frontend | Out-File -FilePath (Join-Path $root 'frontend\Dockerfile') -Encoding utf8

# minimal GitHub Actions CI file
$ci = @'
name: CI
on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
      - name: Lint & test
        run: |
          echo "Add lint/test commands"

  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          npm ci
      - name: Lint & test
        run: |
          echo "Add frontend lint/test commands"
'@
$ci | Out-File -FilePath (Join-Path $root '.github\workflows\ci.yml') -Encoding utf8

# top-level docker-compose (also write to root)
$docker_compose = @'
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ticketing
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
  redis:
    image: redis:7
    ports:
      - "6379:6379"
  backend:
    build: ./backend
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+asyncpg://postgres:postgres@postgres:5432/ticketing
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - postgres
      - redis
  frontend:
    build: ./frontend
    command: sh -c "npm run dev -- --host"
    ports:
      - "3000:5173"
    volumes:
      - ./frontend:/app
    depends_on:
      - backend

volumes:
  postgres-data:
'@
$docker_compose | Out-File -FilePath (Join-Path $root 'docker-compose.yml') -Encoding utf8

# README
$readme = @'
# Ticketing System (Scaffold)

This repository contains an initial scaffold for the multi-tenant ticketing system.

To finish scaffolding locally, run one of the included scripts:

PowerShell (Windows):
  .\scaffold.ps1

Bash (macOS/Linux):
  ./scaffold.sh

Or run with Docker Compose:
  docker-compose up --build

'@
$readme | Out-File -FilePath (Join-Path $root 'README.md') -Encoding utf8

# .gitignore
$gitignore = @'
.env
__pycache__/
*.pyc
venv/
node_modules/
dist/
.DS_Store
'@
$gitignore | Out-File -FilePath (Join-Path $root '.gitignore') -Encoding utf8

# manifest
$manifest = @'
Files created by scaffold scripts:
- backend/requirements.txt
- backend/Dockerfile
- backend/.env.example
- backend/app/main.py
- frontend/package.json
- frontend/vite.config.ts
- frontend/index.html
- frontend/src/main.tsx
- frontend/src/App.tsx
- frontend/src/styles.css
- frontend/tailwind.config.cjs
- frontend/postcss.config.cjs
- frontend/Dockerfile
- .github/workflows/ci.yml
- docker-compose.yml
'@
$manifest | Out-File -FilePath (Join-Path $root 'scaffold_files_manifest.txt') -Encoding utf8

Write-Host "Scaffold files and scripts created. Run './scaffold.ps1' (Windows) or './scaffold.sh' (Linux/macOS) to materialize full scaffold locally."
