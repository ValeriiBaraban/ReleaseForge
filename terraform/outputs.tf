output "bucket_name" {
  value = aws_s3_bucket.website.id
}

output "cloudfront_domain" {
  value = aws_cloudfront_distribution.website.domain_name
}

output "site_urls" {
  value = [
    "https://projectsummer.click",
    "https://www.projectsummer.click",
  ]
}

output "server_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.releaseforge_backend.public_ip
}

output "github_actions_role_arn" {
  value       = aws_iam_role.github_actions_role.arn
  description = "Copy this ARN to GitHub Workflow to allow it to assume this role for deployments"
}


output "db_user_password" {
  description = "Password for the MongoDB Atlas database user (output for demonstration purposes, not recommended for production)"
  value       = random_password.db_user_password.result
  sensitive   = true
}

output "db_username" {
  value = mongodbatlas_database_user.db_user.username
}

output "mongo_uri" {
  value     = mongodbatlas_advanced_cluster.cluster.connection_strings.standard_srv
  sensitive = false
  }