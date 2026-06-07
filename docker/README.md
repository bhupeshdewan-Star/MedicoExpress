# ClinCommand OS™ Docker Configurations

This directory contains configuration files and build assets for containerized deployment of ClinCommand OS™ services.

## Services Layout

- **api-core**: Express-based Node backend api gateway.
- **web**: Vite/React-based frontend web portal.
- **dct-service**: Go-based telemedicine virtual visit service.
- **epro-sync-service**: Go-based offline synchronization service.
- **rbm-ai-service**: FastAPI Python service for XGBoost risk scoring and Tree SHAP explanation.
- **rsdv-service**: FastAPI Python service for OCR text extraction and NER redaction.
- **wearables-gateway**: Node.js microservice for Fitbit, Garmin, and Apple Health integrations.
