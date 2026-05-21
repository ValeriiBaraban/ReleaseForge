
data "tls_certificate" "github" {
  url = "https://token.actions.githubusercontent.com"
}


# resource "aws_iam_openid_connect_provider" "github" {
#   url             = "https://token.actions.githubusercontent.com"
#   client_id_list  = ["sts.amazonaws.com"]
#   thumbprint_list = [data.tls_certificate.github.certificates[0].sha1_fingerprint]
# }

data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

data "aws_iam_policy_document" "github_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"

    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.git_user_name}/${var.git_repo_name}:*"] 
    }
  }
}

resource "aws_iam_role" "github_actions_role" {
  name               = "github-actions-summer-deployer"
  assume_role_policy = data.aws_iam_policy_document.github_assume_role_policy.json
}

resource "aws_iam_policy" "github_deploy_policy" {
  name        = "github-actions-deploy-policy"
  description = "Permissions for GitHub Actions to deploy Frontend"
  policy      = data.aws_iam_policy_document.github_deploy_permissions.json
}

resource "aws_iam_role_policy_attachment" "github_attach" {
  role       = aws_iam_role.github_actions_role.name
  policy_arn = aws_iam_policy.github_deploy_policy.arn
}

data "aws_iam_policy_document" "github_deploy_permissions" {
  statement {
    sid    = "AllowS3Sync"
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:ListBucket",
      "s3:DeleteObject"
    ]
    resources = [
      aws_s3_bucket.website.arn,
      "${aws_s3_bucket.website.arn}/*"
    ]
  }

  statement {
    sid    = "AllowCloudFrontInvalidation"
    effect = "Allow"
    actions = [
      "cloudfront:CreateInvalidation",
      "cloudfront:GetInvalidation"
    ]
    resources = ["*"]
  }

  statement {
    sid    = "AllowSSMParameterRead"
    effect = "Allow"
    actions = [
      "ssm:GetParameter"
    ]
    resources = [
      aws_ssm_parameter.cloudfront_distribution_id.arn
    ]
  }
}

# data "aws_iam_policy_document" "github_deploy_permissions" {
#   statement {
#     sid    = "AllowS3Sync"
#     effect = "Allow"
#     actions = [
#       "s3:PutObject",
#       "s3:GetObject",
#       "s3:ListBucket",
#       "s3:DeleteObject"
#     ]
#     resources = [
#       aws_s3_bucket.website.arn,
#       "${aws_s3_bucket.website.arn}/*"
#     ]
#   }

#   statement {
#     sid    = "AllowCloudFrontInvalidation"
#     effect = "Allow"
#     actions = [
#       "cloudfront:CreateInvalidation",
#       "cloudfront:GetInvalidation"
#     ]
#     resources = [
#       aws_cloudfront_distribution.website.arn
#     ]
#   }
# }

# resource "aws_iam_policy" "github_deploy_policy" {
#   name        = "github-actions-deploy-policy"
#   description = "Permissions for GitHub Actions to deploy Frontend"
#   policy      = data.aws_iam_policy_document.github_deploy_permissions.json
# }

# resource "aws_iam_role_policy_attachment" "github_attach" {
#   role       = aws_iam_role.github_actions_role.name
#   policy_arn = aws_iam_policy.github_deploy_policy.arn
# }
