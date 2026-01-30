# Smart Ambulance Backend - Run Script
# This starts the FastAPI development server

$backendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $backendDir

Write-Host "🚀 Starting Smart Ambulance Backend..." -ForegroundColor Green
Write-Host "Server will run at: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host ""

Set-Location $projectRoot

# Run uvicorn server
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000

