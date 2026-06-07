# ClinCommand OS™ Production Launcher (PowerShell)
# © Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "ClinCommand OS™ — Enterprise Production Bootloader" -ForegroundColor Cyan
Write-Host "© Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan

# Set environment
$env:NODE_ENV = "production"
$env:PORT = "8000"

# Check if PostgreSQL and Redis environment variables are defined; if not, set local defaults
if (-not $env:DB_HOST) { $env:DB_HOST = "localhost" }
if (-not $env:DB_PORT) { $env:DB_PORT = "5432" }
if (-not $env:DB_USER) { $env:DB_USER = "postgres" }
if (-not $env:DB_NAME) { $env:DB_NAME = "clincommand" }
if (-not $env:DB_PASSWORD) { $env:DB_PASSWORD = "admin" }
if (-not $env:REDIS_URL) { $env:REDIS_URL = "redis://localhost:6379" }

Write-Host "Running Pre-Flight Deployment Qualification & Environmental Audit..." -ForegroundColor Blue
node deployment/environment_audit.js
node deployment/deployment_qualification_runner.js

Write-Host "Verifying database and services connectivity..." -ForegroundColor Blue
node db/postgres-validation.js
node infrastructure/redis-validation.js

# Check if validation succeeded by reading postgres_validation_report.json
$reportPath = "postgres_validation_report.json"
if (Test-Path $reportPath) {
    $report = Get-Content $reportPath | ConvertFrom-Json
    if ($report.status -ne "CONNECTED") {
        Write-Host "==========================================================" -ForegroundColor Red
        Write-Host "DEPLOYMENT BLOCKED: Database connection check failed." -ForegroundColor Red
        Write-Host "Please start PostgreSQL and ensure credentials are correct." -ForegroundColor Red
        Write-Host "==========================================================" -ForegroundColor Red
        Exit 1
    }
}

Write-Host "Booting API Core server..." -ForegroundColor Green
node apps/api-core/server.js
