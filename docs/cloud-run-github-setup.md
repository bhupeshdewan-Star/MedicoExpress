# Cloud Run + GitHub Actions Setup

This repository already contains the Cloud Run deploy workflow in [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml) and the live smoke test in [`scripts/verify-cloud-run.mjs`](../../scripts/verify-cloud-run.mjs).

## Target Deployment

- Service name: `medicomarketos-open`
- Human-facing app label: `MedicoMarketOS Open`
- Region: `asia-southeast1`
- Platform: Google Cloud Run
- Runtime port: `8000`
- Public access: enabled with `--allow-unauthenticated`

## GitHub Secrets

Create these repository secrets in GitHub:

- `GCP_CREDENTIALS`
  - Service account JSON key with permission to deploy Cloud Run services in your project.
- `GCP_PROJECT_ID`
  - Your GCP project ID.

If you later want to parameterize the workflow further, you can also add custom secrets for service name or region, but the current workflow already uses the repository defaults.

## Required GCP Permissions

The service account behind `GCP_CREDENTIALS` should be able to:

- Deploy to Cloud Run
- Trigger Cloud Build / source deploy
- Read the project and service configuration

Typical roles:

- `roles/run.admin`
- `roles/iam.serviceAccountUser`
- `roles/cloudbuild.builds.editor`

Depending on your project setup, you may also need:

- `roles/artifactregistry.writer`

## Runtime Environment Variables

Set these on the Cloud Run service:

Required:

- `NODE_ENV=production`
- `JWT_SECRET`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

Optional, only if you use those integrations:

- `DB_SSL`
- `DB_POOL_MAX`
- `REDIS_HOST`
- `REDIS_URL`
- `REDIS_PORT`
- `REDIS_PASSWORD`
- `RATE_LIMIT_MAX`
- `RATE_LIMIT_WINDOW`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- `ACTIVITY_LLM_PROVIDER`
- `ACTIVITY_LLM_MODEL`
- `AWS_SECRET_NAME`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `AI_SERVICE_URL`
- `BIOSTATS_SERVICE_URL`
- `KMS_PROVIDER`

## Deploy Flow

1. Push to `main`.
2. GitHub Actions runs [`deploy.yml`](../../.github/workflows/deploy.yml).
3. The workflow deploys the source to Cloud Run.
4. The workflow runs the smoke test against the live Cloud Run URL.
5. If any step fails, the workflow stops and reports the failing gate.

## Manual Local Deploy and Verify

If you want to run the same flow locally:

```powershell
.\scripts\deploy-cloud-run.ps1 -ProjectId YOUR_GCP_PROJECT -Region asia-southeast1 -ServiceName medicomarketos-open -RunSmokeTest
```

Or, if you already have the live service URL:

```powershell
node scripts/verify-cloud-run.mjs --base-url https://YOUR-SERVICE-URL
```

## Notes

- The repository contains large binary artifacts in `artifacts/`. GitHub accepted the push, but one PowerPoint file is close to GitHub's recommended size limit.
- If you want smaller future pushes, move presentation artifacts to Git LFS or exclude them from release commits.
