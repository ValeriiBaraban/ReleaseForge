resource "mongodbatlas_project" "releaseforge" {
  name   = "releaseforge"
  org_id = var.atlas_org_id
}

# resource "mongodbatlas_cluster" "cluster" {
#   project_id   = mongodbatlas_project.releaseforge.id
#   name         = "releaseforge-cluster"
#   provider_instance_size_name = "M0"

#   provider_name = "TENANT"
#   backing_provider_name = "AWS"
#   provider_region_name  = "US_EAST_1"

#   cluster_type = "REPLICASET"

#   mongo_db_major_version = "7.0"
# }

resource "mongodbatlas_advanced_cluster" "cluster" {
  project_id   = mongodbatlas_project.releaseforge.id
  name         = var.db_name
  cluster_type = "REPLICASET"

  replication_specs = [{
    region_configs = [{
      electable_specs = {
        instance_size = "M0"
      }
      provider_name         = "TENANT"
      backing_provider_name = "AWS"
      region_name           = "US_EAST_1"
      priority              = 7
    }]
  }]
}



resource "mongodbatlas_project_ip_access_list" "allow_all" {
  project_id = mongodbatlas_project.releaseforge.id
  cidr_block = "0.0.0.0/0"
  comment    = "dev access"
}

resource "random_password" "db_user_password" {
  length           = 16
  special          = true
  override_special = "_-"
}

resource "mongodbatlas_database_user" "db_user" {
  project_id         = mongodbatlas_project.releaseforge.id
  username           = var.db_username
  password           = random_password.db_user_password.result
  auth_database_name = "admin"

  roles {
    role_name     = "readWrite"
    database_name = var.db_name
  }
}

resource "aws_ssm_parameter" "mongodb_uri" {
  name        = "/releaseforge/backend/mongo_uri"
  description = "MongoDB Connection String with credentials"
  type        = "SecureString"
  value       = local.full_mongo_uri
  overwrite   = true
}
