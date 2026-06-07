# AWS Enterprise Infrastructure Module for ClinCommand OS™
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# 1. Variables
variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "environment" {
  type    = string
  default = "production"
}

# 2. Key Management Service (KMS)
resource "aws_kms_key" "app_kms_key" {
  description             = "ClinCommand OS GxP Encryption Key"
  deletion_window_in_days = 10
  enable_key_rotation     = true

  tags = {
    Environment = var.environment
  }
}

# 3. Virtual Private Cloud (VPC) & Subnets
resource "aws_vpc" "main_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
}

resource "aws_subnet" "public_subnets" {
  count             = 2
  vpc_id            = aws_vpc.main_vpc.id
  cidr_block        = "10.0.${count.index}.0/24"
  availability_zone = "us-east-1${count.index == 0 ? "a" : "b"}"
}

resource "aws_subnet" "private_subnets" {
  count             = 2
  vpc_id            = aws_vpc.main_vpc.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = "us-east-1${count.index == 0 ? "a" : "b"}"
}

# 4. Aurora PostgreSQL Multi-AZ
resource "aws_rds_cluster" "postgresql_cluster" {
  cluster_identifier      = "clincommand-rds-cluster"
  engine                  = "aurora-postgresql"
  engine_version          = "15.4"
  database_name           = "clincommand"
  master_username         = "postgres"
  master_password         = aws_secretsmanager_secret_version.db_pwd.secret_string
  backup_retention_period = 14
  preferred_backup_window = "02:00-03:00"
  db_subnet_group_name    = aws_db_subnet_group.db_subnets.name
  kms_key_id              = aws_kms_key.app_kms_key.arn
  storage_encrypted       = true

  lifecycle {
    ignore_changes = [master_password]
  }
}

resource "aws_rds_cluster_instance" "cluster_instances" {
  count              = 2
  identifier         = "clincommand-rds-db-${count.index}"
  cluster_identifier = aws_rds_cluster.postgresql_cluster.id
  instance_class     = "db.r6g.large"
  engine             = aws_rds_cluster.postgresql_cluster.engine
  engine_version     = aws_rds_cluster.postgresql_cluster.engine_version
}

resource "aws_db_subnet_group" "db_subnets" {
  name       = "clincommand-db-subnet-group"
  subnet_ids = aws_subnet.private_subnets[*].id
}

# 5. ElastiCache Redis
resource "aws_elasticache_replication_group" "redis_cache" {
  replication_group_id        = "clincommand-redis-group"
  description                 = "ClinCommand OS Secure Redis Group"
  node_type                   = "cache.t4g.medium"
  num_cache_clusters          = 2
  parameter_group_name        = "default.redis7"
  port                        = 6379
  subnet_group_name           = aws_elasticache_subnet_group.redis_subnets.name
  transit_encryption_enabled  = true
  at_rest_encryption_enabled  = true
  kms_key_id                  = aws_kms_key.app_kms_key.arn
  auth_token                  = "redis-secure-token-9988-aws-elasticache-auth"
  automatic_failover_enabled  = true
}

resource "aws_elasticache_subnet_group" "redis_subnets" {
  name       = "clincommand-redis-subnet-group"
  subnet_ids = aws_subnet.private_subnets[*].id
}

# 6. MSK Kafka Cluster
resource "aws_msk_cluster" "kafka_cluster" {
  cluster_name           = "clincommand-kafka-cluster"
  kafka_version          = "3.4.0"
  number_of_broker_nodes = 2

  broker_node_group_info {
    instance_type = "kafka.m5.large"
    client_subnets = aws_subnet.private_subnets[*].id
    security_groups = [aws_security_group.kafka_sg.id]
  }

  encryption_info {
    encryption_at_rest {
      data_volume_kms_key_arn = aws_kms_key.app_kms_key.arn
    }
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
  }
}

# 7. Security Groups & Secrets Setup
resource "aws_security_group" "kafka_sg" {
  name   = "clincommand-kafka-sg"
  vpc_id = aws_vpc.main_vpc.id
}

resource "aws_secretsmanager_secret" "db_password" {
  name                    = "clincommand/db_password"
  kms_key_id              = aws_kms_key.app_kms_key.id
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "db_pwd" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = "enterprise-secure-db-password-9988"
}

# 8. ECS Fargate Cluster
resource "aws_ecs_cluster" "app_cluster" {
  name = "clincommand-ecs-cluster"
}

# 9. Outputs
output "kms_key_arn" {
  value = aws_kms_key.app_kms_key.arn
}

output "db_endpoint" {
  value = aws_rds_cluster.postgresql_cluster.endpoint
}

output "redis_primary_endpoint" {
  value = aws_elasticache_replication_group.redis_cache.primary_endpoint_address
}
