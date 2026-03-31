# Ticketing System (Scaffold)

This repository contains an initial scaffold for the multi-tenant ticketing system.

To finish scaffolding locally, run one of the included scripts:

PowerShell (Windows):
  .\scaffold.ps1

  If PowerShell 7 (pwsh) is not installed, run the script using Windows PowerShell:
    powershell -ExecutionPolicy Bypass -File .\scaffold.ps1

Bash (macOS/Linux):
  ./scaffold.sh

Or run with Docker Compose:
  docker-compose up --build

Helper scripts:
  ./start-local.sh    # POSIX: prefers docker-compose, prints manual steps otherwise
  .\start-local.ps1  # Windows PowerShell helper

