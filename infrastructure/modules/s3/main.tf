# S3 module placeholder
variable "resource_prefix" {
  type = string
}

variable "tags" {
  type = map(string)
  default = {}
}

resource "aws_s3_bucket" "deployment" {
  bucket = "${var.resource_prefix}-deployment"
  tags   = var.tags
}

resource "aws_s3_bucket" "static" {
  bucket = "${var.resource_prefix}-static"
  tags   = var.tags
}

output "deployment_bucket_name" {
  value = aws_s3_bucket.deployment.id
}

output "static_bucket_name" {
  value = aws_s3_bucket.static.id
}

output "cloudfront_distribution_id" {
  value = ""
}

output "cloudfront_domain" {
  value = ""
}