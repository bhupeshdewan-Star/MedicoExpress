# GCP Enterprise Infrastructure Module for ClinCommand OS™
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# 1. Variables
variable "gcp_project_id" {
  type    = string
  default = "clincommand-enterprise-production"
}

variable "gcp_region" {
  type    = string
  default = "us-central1"
}

variable "environment" {
  type    = string
  default = "production"
}

# 2. Cloud Key Management Service (KMS)
resource "google_kms_key_ring" "keyring" {
  name     = "clincommand-keyring"
  location = var.gcp_region
}

resource "google_kms_crypto_key" "app_key" {
  name            = "clincommand-crypto-key"
  key_ring        = google_kms_key_ring.keyring.id
  rotation_period = "7776000s" # 90 days

  lifecycle {
    prevent_destroy = false
  }
}

# 3. Cloud SQL PostgreSQL flexible Multi-Zone instances
resource "google_sql_database_instance" "postgres" {
  name             = "clincommand-postgres-instance"
  database_version = "POSTGRES_14"
  region           = var.gcp_region

  settings {
    tier = "db-f1-micro"
    backup_configuration {
      enabled    = true
      start_time = "02:00"
    }
    ip_configuration {
      ipv4_enabled    = true
      private_network = null
    }
  }
}

# 4. Memorystore Redis
resource "google_redis_instance" "redis_cache" {
  name           = "clincommand-redis-cache"
  tier           = "STANDARD_HA"
  memory_size_gb = 1
  region         = var.gcp_region
  redis_version  = "REDIS_6_X"

  transit_encryption_mode = "SERVER_AUTHENTICATION"
}

# 5. Pub/Sub (Kafka interface equivalent broker topics)
resource "google_pubsub_topic" "wearables" {
  name = "wearables-telemetry-topic"
}

resource "google_pubsub_subscription" "wearables_sub" {
  name  = "wearables-telemetry-sub"
  topic = google_pubsub_topic.wearables.name
}

# 6. Secret Manager Configuration
resource "google_secret_manager_secret" "db_password" {
  secret_id = "clincommand-db-password"
  replication {
    auto {}
  }
}

# 7. Cloud Run Services (ECS Fargate equivalent)
resource "google_cloud_run_v2_service" "app_service" {
  name     = "clincommand-api-core"
  location = var.gcp_region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "gcr.io/${var.gcp_project_id}/api-core:latest"
      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }
    }
  }
}

# 8. Outputs
output "kms_key_id" {
  value = google_kms_crypto_key.app_key.id
}

output "postgres_connection_name" {
  value = google_sql_database_instance.postgres.connection_name
}

output "redis_host" {
  value = google_redis_instance.redis_cache.host
}
