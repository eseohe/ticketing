#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "$ROOT_DIR/backend/app" "$ROOT_DIR/backend/app/api" "$ROOT_DIR/backend/alembic" "$ROOT_DIR/backend/tests" "$ROOT_DIR/frontend/src" "$ROOT_DIR/frontend/public" "$ROOT_DIR/.github/workflows"

cat > "$ROOT_DIR/backend/requirements.txt" <<'EOF'
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
EOF

cat > "$ROOT_DIR/backend/Dockerfile" <<'EOF'
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

cat > "$ROOT_DIR/backend/.env.example" <<'EOF'
DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/ticketing
REDIS_URL=redis://redis:6379/0
SECRET_KEY=change-me
APP_HOST=0.0.0.0
APP_PORT=8000
EOF

cat > "$ROOT_DIR/backend/app/main.py" <<'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Ticketing Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}
EOF

cat > "$ROOT_DIR/frontend/package.json" <<'EOF'
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
EOF

cat > "$ROOT_DIR/frontend/vite.config.ts" <<'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 }
})
EOF

cat > "$ROOT_DIR/frontend/index.html" <<'EOF'
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
EOF

cat > "$ROOT_DIR/frontend/src/main.tsx" <<'EOF'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
EOF

cat > "$ROOT_DIR/frontend/src/App.tsx" <<'EOF'
import React from 'react'

export default function App() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Ticketing App</h1>
      <p>Welcome to the scaffolded frontend.</p>
    </div>
  )
}
EOF

cat > "$ROOT_DIR/frontend/src/styles.css" <<'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

cat > "$ROOT_DIR/frontend/tailwind.config.cjs" <<'EOF'
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
EOF

cat > "$ROOT_DIR/frontend/postcss.config.cjs" <<'EOF'
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }
EOF

cat > "$ROOT_DIR/frontend/Dockerfile" <<'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]
EOF

cat > "$ROOT_DIR/.github/workflows/ci.yml" <<'EOF'
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
EOF

cat > "$ROOT_DIR/docker-compose.yml" <<'EOF'
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
EOF

cat > "$ROOT_DIR/README.md" <<'EOF'
# Ticketing System (Scaffold)

This repository contains an initial scaffold for the multi-tenant ticketing system.

To finish scaffolding locally, run one of the included scripts:

PowerShell (Windows):
  .\scaffold.ps1

Bash (macOS/Linux):
  ./scaffold.sh

Or run with Docker Compose:
  docker-compose up --build

EOF

cat > "$ROOT_DIR/.gitignore" <<'EOF'
.env
__pycache__/
*.pyc
venv/
node_modules/
dist/
.DS_Store
EOF

cat > "$ROOT_DIR/scaffold_files_manifest.txt" <<'EOF'
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
EOF

chmod +x "$ROOT_DIR/scaffold.sh"

echo "Scaffold script and top-level files created. Run './scaffold.ps1' (Windows) or './scaffold.sh' (Linux/macOS) to create the repository layout locally."
