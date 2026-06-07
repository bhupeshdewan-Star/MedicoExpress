#!/bin/bash
# ========================================================
# CLINCOMMAND OS™ LOCAL PRODUCTION SIMULATION BOOTSTRAPPER
# ========================================================

echo "Initializing ClinCommand OS™ Local Environment..."

# 1. Copy Environment Variables
if [ ! -f .env ]; then
  echo "Generating .env from .env.local..."
  cp .env.local .env
fi

# 2. Build and Boot Infrastructure Services
echo "Booting up docker containers (PostgreSQL, Redis, Kafka, MinIO, MailHog, API Core, Web, and Microservices)..."
docker compose down -v
docker compose up --build -d

# 3. Wait for PostgreSQL Health
echo "Waiting for PostgreSQL database container to initialize..."
until docker exec clincommand-db pg_isready -U postgres -d clincommand; do
  sleep 2
  echo -n "."
done
echo " Database container online!"

# 4. Wait for Node API Server Health
echo "Waiting for API Core gateway to startup..."
sleep 5

# 5. Seed Demo Study Data
echo "Executing database migrations and seeding demo data..."
docker exec -it clincommand-app sh seed-demo-data.sh

echo "========================================================"
echo "CLINCOMMAND OS™ ENTERPRISE STACK SUCCESSFULLY DEPLOYED!"
echo "========================================================"
echo "Web Portal UI:       http://localhost:3000"
echo "API Gateway core:    http://localhost:8000"
echo "FastAPI AI RBM docs: http://localhost:8001/docs"
echo "MinIO Storage admin: http://localhost:9001 (Console)"
echo "MailHog mailbox:     http://localhost:8025"
echo "========================================================"
