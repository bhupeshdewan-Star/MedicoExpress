#!/bin/bash
# ClinCommand OS™ Production Launcher (Linux Bash)
# © Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved

echo -e "\e[36m======================================================================\e[0m"
echo -e "\e[36mClinCommand OS™ — Enterprise Production Bootloader\e[0m"
echo -e "\e[33m© Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved\e[0m"
echo -e "\e[36m======================================================================\e[0m"

# Set environment
export NODE_ENV="production"
export PORT="8000"

# Set defaults if not provided
export DB_HOST="${DB_HOST:-localhost}"
export DB_PORT="${DB_PORT:-5432}"
export DB_USER="${DB_USER:-postgres}"
export DB_NAME="${DB_NAME:-clincommand}"
export DB_PASSWORD="${DB_PASSWORD:-admin}"
export REDIS_URL="${REDIS_URL:-redis://localhost:6379}"

echo -e "\e[34mRunning Pre-Flight Deployment Qualification & Environmental Audit...\e[0m"
node deployment/environment_audit.js
node deployment/deployment_qualification_runner.js

echo -e "\e[34mVerifying database and services connectivity...\e[0m"
node db/postgres-validation.js
node infrastructure/redis-validation.js

# Check validation reports
if [ -f "postgres_validation_report.json" ]; then
    STATUS=$(node -e "console.log(require('./postgres_validation_report.json').status)")
    if [ "$STATUS" != "CONNECTED" ]; then
        echo -e "\e[31m==========================================================\e[0m"
        echo -e "\e[31mDEPLOYMENT BLOCKED: Database connection check failed.\e[0m"
        echo -e "\e[31mPlease start PostgreSQL and ensure credentials are correct.\e[0m"
        echo -e "\e[31m==========================================================\e[0m"
        exit 1
    fi
fi

echo -e "\e[32mBooting API Core server...\e[0m"
node apps/api-core/server.js
