param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectId,

  [Parameter(Mandatory = $true)]
  [string]$Region,

  [string]$ServiceName = 'medicomarketos-open',

  [string]$ImageName = 'gcr.io',

  [string]$ImageTag = 'latest',

  [string]$EnvFile = '.env.cloudrun',

  [switch]$SkipBuild,

  [switch]$RunSmokeTest,

  [string]$SmokeTestUsername = 'sponsor.admin@demo.com',

  [string]$SmokeTestPassword = 'Demo@123',

  [string]$SmokeTestToken = '',

  [string]$SmokeTestBaseUrl = ''
)

$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$envPath = Join-Path $root $EnvFile

if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
  throw 'gcloud CLI is required but was not found on PATH.'
}

if (-not $SkipBuild -and -not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw 'Docker is required for the build step. Re-run with -SkipBuild if the image is already built and pushed.'
}

function Import-EnvFile([string]$path) {
  if (-not (Test-Path $path)) {
    return
  }

  Get-Content $path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#') -or -not ($line.Contains('='))) {
      return
    }

    $parts = $line.Split('=', 2)
    $name = $parts[0].Trim()
    $value = $parts[1].Trim().Trim('"')
    if ($name) {
      Set-Item -Path "Env:$name" -Value $value
    }
  }
}

Import-EnvFile $envPath

$required = @('DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET')
$missing = @()
foreach ($name in $required) {
  if (-not (Get-Item -Path "Env:$name" -ErrorAction SilentlyContinue)) {
    $missing += $name
  }
}

if ($missing.Count -gt 0) {
  throw "Missing required environment variables: $($missing -join ', ')"
}

$image = "$ImageName/$ProjectId/$ServiceName:$ImageTag"

if (-not $SkipBuild) {
  Write-Host "Building container image: $image"
  & docker build -f Dockerfile.production -t $image $root
}

$deployEnv = @(
  "NODE_ENV=production",
  "DB_HOST=$env:DB_HOST",
  "DB_PORT=$env:DB_PORT",
  "DB_USER=$env:DB_USER",
  "DB_PASSWORD=$env:DB_PASSWORD",
  "DB_NAME=$env:DB_NAME",
  "JWT_SECRET=$env:JWT_SECRET"
)

$optionalKeys = @(
  'DB_SSL','DB_POOL_MAX','REDIS_HOST','REDIS_URL','REDIS_PORT','REDIS_PASSWORD',
  'RATE_LIMIT_MAX','RATE_LIMIT_WINDOW','OPENAI_API_KEY','ANTHROPIC_API_KEY','GEMINI_API_KEY',
  'ACTIVITY_LLM_PROVIDER','ACTIVITY_LLM_MODEL','AWS_SECRET_NAME','AWS_REGION',
  'AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY','AWS_S3_BUCKET','STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET','AI_SERVICE_URL','BIOSTATS_SERVICE_URL','KMS_PROVIDER'
)

foreach ($key in $optionalKeys) {
  $value = (Get-Item -Path "Env:$key" -ErrorAction SilentlyContinue).Value
  if ($value) {
    $deployEnv += "$key=$value"
  }
}

Write-Host "Deploying Cloud Run service: $ServiceName"
& gcloud run deploy $ServiceName `
  --project $ProjectId `
  --region $Region `
  --platform managed `
  --image $image `
  --allow-unauthenticated `
  --set-env-vars ($deployEnv -join ',') `
  --memory 2Gi `
  --cpu 1 `
  --port 8000

Write-Host 'Deployment complete.'

$serviceUrl = $SmokeTestBaseUrl
if (-not $serviceUrl) {
  $serviceUrl = & gcloud run services describe $ServiceName --project $ProjectId --region $Region --format 'value(status.url)'
}

if ($serviceUrl) {
  $serviceUrl = $serviceUrl.ToString().Trim()
}

if ($RunSmokeTest) {
  if (-not $serviceUrl) {
    throw 'Smoke test requested but Cloud Run service URL could not be resolved.'
  }

  if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw 'Node.js is required to run the smoke test.'
  }

  Write-Host "Running smoke test against: $serviceUrl"
  $smokeArgs = @(
    'scripts/verify-cloud-run.mjs',
    '--base-url', $serviceUrl,
    '--username', $SmokeTestUsername,
    '--password', $SmokeTestPassword
  )

  if ($SmokeTestToken) {
    $smokeArgs += @('--token', $SmokeTestToken)
  }

  & node @smokeArgs
}

if ($serviceUrl) {
  Write-Host "Cloud Run URL: $serviceUrl"
}
