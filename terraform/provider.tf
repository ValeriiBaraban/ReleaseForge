terraform {
  required_providers {
    mongodbatlas = {
      source  = "mongodb/mongodbatlas"
      version = "2.12.0"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "mongodbatlas" {
  public_key  = var.atlas_public_key
  private_key = var.atlas_private_key
}

provider "aws" {
  region  = "us-west-2"
  profile = var.aws_profile
}

provider "aws" {
  alias   = "us-east-1"
  region  = "us-east-1"
  profile = var.aws_profile
}