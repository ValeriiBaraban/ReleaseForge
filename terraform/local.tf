locals {
  clean_cluster_url = replace(mongodbatlas_advanced_cluster.cluster.connection_strings.standard_srv, "mongodb+srv://", "")
  
  full_mongo_uri = base64encode("mongodb+srv://${mongodbatlas_database_user.db_user.username}:${random_password.db_user_password.result}@${local.clean_cluster_url}/${var.db_name}?retryWrites=true&w=majority")
}