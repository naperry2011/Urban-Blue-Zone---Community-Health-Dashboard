output "user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.main.id
}

output "user_pool_arn" {
  description = "Cognito User Pool ARN"
  value       = aws_cognito_user_pool.main.arn
}

output "client_id" {
  description = "Cognito App Client ID"
  value       = aws_cognito_user_pool_client.main.id
}

output "client_secret" {
  description = "Cognito App Client Secret"
  value       = aws_cognito_user_pool_client.main.client_secret
  sensitive   = true
}

output "domain" {
  description = "Cognito Domain"
  value       = aws_cognito_user_pool_domain.main.domain
}

output "domain_url" {
  description = "Cognito Domain URL"
  value       = "https://${aws_cognito_user_pool_domain.main.domain}.auth.${data.aws_region.current.name}.amazoncognito.com"
}

data "aws_region" "current" {}