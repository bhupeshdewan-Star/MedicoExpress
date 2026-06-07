# Azure Enterprise Infrastructure Module for ClinCommand OS™
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# 1. Variables
variable "location" {
  type    = string
  default = "East US"
}

variable "environment" {
  type    = string
  default = "production"
}

# 2. Resource Group
resource "azurerm_resource_group" "rg" {
  name     = "clincommand-resources"
  location = var.location
}

# 3. Azure Key Vault
resource "azurerm_key_vault" "kv" {
  name                        = "clincommand-keyvault-kv"
  location                    = azurerm_resource_group.rg.location
  resource_group_name         = azurerm_resource_group.rg.name
  enabled_for_disk_encryption = true
  tenant_id                   = "00000000-0000-0000-0000-000000000000"
  sku_name                    = "standard"
}

# 4. Azure Database for PostgreSQL
resource "azurerm_postgresql_flexible_server" "postgres" {
  name                   = "clincommand-postgres-flex"
  resource_group_name    = azurerm_resource_group.rg.name
  location               = azurerm_resource_group.rg.location
  version                = "14"
  administrator_login    = "postgres"
  administrator_password = "SecurePassword123!"
  storage_mb             = 32768
  sku_name               = "GP_Standard_D2ds_v4"
  backup_retention_days  = 14
}

# 5. Azure Cache for Redis
resource "azurerm_redis_cache" "redis" {
  name                = "clincommand-redis-cache"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  capacity            = 1
  family              = "C"
  sku_name            = "Standard"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"
}

# 6. Event Hubs Namespace & Hub (Kafka Protocol Compatible)
resource "azurerm_eventhub_namespace" "eh_ns" {
  name                = "clincommand-eventhubs-ns"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "Standard"
  capacity            = 1
}

resource "azurerm_eventhub" "eh" {
  name                = "wearables-telemetry-hub"
  namespace_name      = azurerm_eventhub_namespace.eh_ns.name
  resource_group_name = azurerm_resource_group.rg.name
  partition_count     = 2
  message_retention   = 1
}

# 7. Azure Container Apps (Fargate equivalent)
resource "azurerm_container_app_environment" "ca_env" {
  name                       = "clincommand-container-env"
  location                   = azurerm_resource_group.rg.location
  resource_group_name        = azurerm_resource_group.rg.name
}

# 8. Outputs
output "key_vault_uri" {
  value = azurerm_key_vault.kv.vault_uri
}

output "postgres_fqdn" {
  value = azurerm_postgresql_flexible_server.postgres.fqdn
}

output "redis_hostname" {
  value = azurerm_redis_cache.redis.hostname
}
