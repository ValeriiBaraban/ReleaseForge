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