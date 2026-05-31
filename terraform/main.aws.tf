//VPC, Subnet, Internet Gateway, Route Table
resource "aws_vpc" "releaseforge_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "ReleaseForge-VPC"
  }
}


resource "aws_subnet" "releaseforge_public_subnet" {
  vpc_id                  = aws_vpc.releaseforge_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true

  availability_zone       = "us-west-2a"

  tags = {
    Name = "ReleaseForge-Public-Subnet"
  }
}


resource "aws_internet_gateway" "releaseforge_igw" {
  vpc_id = aws_vpc.releaseforge_vpc.id

  tags = {
    Name = "ReleaseForge-IGW"
  }
}


resource "aws_route_table" "releaseforge_route_table" {
  vpc_id = aws_vpc.releaseforge_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.releaseforge_igw.id
  }

  tags = {
    Name = "ReleaseForge-Public-RouteTable"
  }
}

resource "aws_route_table_association" "releaseforge_rta" {
  subnet_id      = aws_subnet.releaseforge_public_subnet.id
  route_table_id = aws_route_table.releaseforge_route_table.id
}


//BACKEND
//EC2 Instance
resource "aws_security_group" "releaseforge_sg" {
  name        = "releaseforge_web_sg"
  description = "Allow HTTP, HTTPS and SSH traffic"
  vpc_id      = aws_vpc.releaseforge_vpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] 
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "ReleaseForge-SecurityGroup"
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] 
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

resource "tls_private_key" "releaseforge_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "releaseforge_key_pair" {
  key_name   = "releaseforge-deployer-key"
  public_key = tls_private_key.releaseforge_key.public_key_openssh
}

resource "aws_ssm_parameter" "ec2_private_key" {
  name        = "/releaseforge/backend/ec2_private_key"
  description = "Private SSH Key for EC2 Deployment"
  type        = "SecureString"
  value       = tls_private_key.releaseforge_key.private_key_pem
}

resource "aws_instance" "releaseforge_backend" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.releaseforge_public_subnet.id
  vpc_security_group_ids = [aws_security_group.releaseforge_sg.id]
  key_name      = aws_key_pair.releaseforge_key_pair.key_name

  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y docker.io docker-compose
              systemctl start docker
              systemctl enable docker
              usermod -aG docker ubuntu
              EOF

  tags = {
    Name = "ReleaseForge-Backend-Server"
  }
}



//FRONTEND
data "aws_caller_identity" "current" {}


resource "aws_s3_bucket" "website" {
  bucket = "dev-projectsummer.click" 

  force_destroy = true  

  tags = {
    Name = "projectsummer-website"
  }
}

resource "aws_s3_bucket_ownership_controls" "website" {
  bucket = aws_s3_bucket.website.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_acl" "website" {
  depends_on = [
    aws_s3_bucket_ownership_controls.website,
    aws_s3_bucket_public_access_block.website,
  ]

  bucket = aws_s3_bucket.website.id
  acl    = "private"
}

############################


data "aws_route53_zone" "main" {
  name         = "projectsummer.click."
  private_zone = false
}

resource "aws_acm_certificate" "site_cert" {
  provider = aws.us-east-1

  domain_name               = "projectsummer.click"
  subject_alternative_names = ["www.projectsummer.click"]

  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "site_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.site_cert.domain_validation_options :
    dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id = data.aws_route53_zone.main.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

resource "aws_acm_certificate_validation" "site_cert_validation" {
  provider = aws.us-east-1

  certificate_arn         = aws_acm_certificate.site_cert.arn
  validation_record_fqdns = [for r in aws_route53_record.site_cert_validation : r.fqdn]
}


resource "aws_cloudfront_origin_access_control" "s3_oac" {
  name                              = "projectsummer-s3-oac"
  description                       = "OAC for private S3 origin"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "website" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "projectsummer static site via CloudFront"
  aliases         = ["projectsummer.click", "www.projectsummer.click"]

  origin {
    domain_name              = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id                = "s3-origin-${aws_s3_bucket.website.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.s3_oac.id
    s3_origin_config {
      origin_access_identity = ""
    }
  }

  origin {
    domain_name = aws_instance.releaseforge_backend.public_dns
    origin_id   = "ec2-backend-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
      origin_read_timeout    = 60
    }
  }

//TODO:path to index.html
  default_root_object = "index.html"

  custom_error_response {
    error_caching_min_ttl = 10
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
  }

  custom_error_response {
    error_caching_min_ttl = 10
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
  }

  ordered_cache_behavior {
    path_pattern           = "/api/*"
    target_origin_id       = "ec2-backend-origin"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]

    forwarded_values {
      query_string = true
      headers      = ["*"] 
      cookies {
        forward = "all"
      }
    }

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  

  default_cache_behavior {
    target_origin_id       = "s3-origin-${aws_s3_bucket.website.id}"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.site_cert.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  depends_on = [
    aws_acm_certificate_validation.site_cert_validation
  ]
}

data "aws_iam_policy_document" "website_bucket_policy" {
  statement {
    sid    = "AllowCloudFrontRead"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = [
      "s3:GetObject",
    ]

    resources = [
      "${aws_s3_bucket.website.arn}/*",
    ]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.website.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id
  policy = data.aws_iam_policy_document.website_bucket_policy.json
}

resource "aws_route53_record" "root_a" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "projectsummer.click"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_a" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "www.projectsummer.click"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

//TODO: SSM
resource "aws_ssm_parameter" "cloudfront_distribution_id" {
  name        = "/projectsummer/frontend/cloudfront_id"
  description = "CloudFront Distribution ID for GitHub Actions"
  type        = "String"
  value       = aws_cloudfront_distribution.website.id
}

resource "aws_ssm_parameter" "ec2_public_ip" {
  name        = "/releaseforge/backend/ec2_public_ip"
  description = "Public IP address of the Backend EC2 Instance"
  type        = "String"
  value       = aws_instance.releaseforge_backend.public_ip
}

resource "aws_ssm_parameter" "github_client_id" {
  name        = "/releaseforge/backend/github_client_id"
  description = "GitHub OAuth Client ID for ReleaseForge"
  type        = "SecureString"
  value       = "placeholder_id"

  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_ssm_parameter" "github_client_secret" {
  name        = "/releaseforge/backend/github_client_secret"
  description = "GitHub OAuth Client Secret for ReleaseForge"
  type        = "SecureString"
  value       = "placeholder_secret"

  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_ssm_parameter" "session_secret" {
  name        = "/releaseforge/backend/session_secret"
  description = "Express session secret key"
  type        = "SecureString"
  value       = "placeholder_session_secret"

  lifecycle {
    ignore_changes = [value]
  }
}

resource "random_id" "encryption_key" {
  byte_length = 32
}

resource "aws_ssm_parameter" "encryption_key" {
  name        = "/releaseforge/backend/ENCRYPTION_KEY"
  description = "AES-256 encryption key for ReleaseForge DB tokens"
  type        = "SecureString"
  value       = random_id.encryption_key.hex
  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_ssm_parameter" "github_auth_url" {
  name  = "/releaseforge/backend/GITHUB_AUTH_URL" 
  type  = "String"
  value = var.github_url

   lifecycle {
    ignore_changes = [value]
  }

  tags = {
    Environment = "Production"
    Project     = "ReleaseForge"
  }
}

resource "aws_ssm_parameter" "gemini_api_key" {
  name  = "/releaseforge/backend/GEMINI_API_KEY" 
  type  = "SecureString"
  value = "enter_key_here"

   lifecycle {
    ignore_changes = [value]
  }

  tags = {
    Environment = "Production"
    Project     = "ReleaseForge"
  }
}

//allow read ssm parameter for EC2 instance (for deployment and backend use) - TODO: attach policy to EC2 role
# resource "aws_iam_policy" "ssm_read_policy" {
#   name        = "ReleaseForgeSSMRead"
#   description = "Allow EC2 to read parameters from SSM"

#   policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Action = [
#           "ssm:GetParameter",
#           "ssm:GetParameters",
#           "ssm:GetParametersByPath"
#         ]
#         Effect   = "Allow"
#         Resource = aws_ssm_parameter.encryption_key.arn
#       },
#     ]
#   })
# }


//lambda

# data "aws_iam_policy_document" "lambda_secretsmanager_policy" {
#   statement {
#     effect = "Allow"

#     actions = [
#       "secretsmanager:GetSecretValue"
#     ]

#     resources = [
#       aws_secretsmanager_secret.api_secret.arn
#     ]
#   }
# }
# resource "aws_iam_role" "lambda_role" {
#   name = "lambda-secretsmanager-role"

#   assume_role_policy = data.aws_iam_policy_document.lambda_trust.json
# }

# data "aws_iam_policy_document" "lambda_trust" {
#   statement {
#     effect = "Allow"

#     principals {
#       type        = "Service"
#       identifiers = ["lambda.amazonaws.com"]
#     }

#     actions = ["sts:AssumeRole"]
#   }
# }
# # resource "aws_iam_policy" "lambda_secretsmanager" {
# #   name        = "lambda-secretsmanager"
# #   description = "Allow Lambda to read secret"
# #   policy      = data.aws_iam_policy_document.lambda_secretsmanager_policy.json
# # }

# # resource "aws_iam_role_policy_attachment" "lambda_attach" {
# #   role       = aws_iam_role.lambda_role.name
# #   policy_arn = aws_iam_policy.lambda_secretsmanager.arn
# # }

# # //secret_manager
# # resource "aws_secretsmanager_secret" "api_secret" {
# #   name = "api-key"
# #   description = "key for projectsummer"
# # }

# # resource "aws_secretsmanager_secret_version" "api_secret_value" {
# #   secret_id     = aws_secretsmanager_secret.api_secret.id
# #   secret_string = jsonencode({
# #     API_KEY = trimspace(file(var.api_key_file))})
# # }

# # resource "aws_lambda_function" "my_lambda" {
# #   function_name = "my-lambda"
# #   role          = aws_iam_role.lambda_role.arn
# #   handler       = "page-main.html"//"index.handler"  
# #   runtime       = "nodejs18.x"

# #   filename = "lambda.zip"
# # }
