output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = module.cognito.user_pool_id
}

output "cognito_client_id" {
  description = "Cognito App Client ID"
  value       = module.cognito.client_id
}

output "cognito_domain" {
  description = "Cognito Domain"
  value       = module.cognito.domain
}

output "api_gateway_url" {
  description = "API Gateway URL"
  value       = module.api_gateway.api_url
}

output "iot_endpoint" {
  description = "IoT Core Endpoint"
  value       = module.iot.endpoint
}

output "dynamodb_tables" {
  description = "DynamoDB table names"
  value = {
    residents    = module.dynamodb.residents_table_name
    vitals       = module.dynamodb.vitals_table_name
    checkins     = module.dynamodb.checkins_table_name
    alerts       = module.dynamodb.alerts_table_name
    aggregations = module.dynamodb.aggregations_table_name
  }
}

output "sns_topic_arn" {
  description = "SNS Topic ARN for alerts"
  value       = module.sns.alert_topic_arn
}

output "s3_buckets" {
  description = "S3 bucket names"
  value = {
    deployment = module.s3.deployment_bucket_name
    static     = module.s3.static_bucket_name
  }
}

output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID"
  value       = module.s3.cloudfront_distribution_id
}

output "cloudfront_domain" {
  description = "CloudFront Domain Name"
  value       = module.s3.cloudfront_domain
}