output "api_id" {
  description = "API Gateway ID"
  value       = aws_api_gateway_rest_api.main.id
}

output "api_name" {
  description = "API Gateway name"
  value       = aws_api_gateway_rest_api.main.name
}

output "api_url" {
  description = "API Gateway invoke URL"
  value       = aws_api_gateway_stage.main.invoke_url
}

output "api_key" {
  description = "API Key"
  value       = aws_api_gateway_api_key.main.value
  sensitive   = true
}

output "authorizer_id" {
  description = "Cognito Authorizer ID"
  value       = aws_api_gateway_authorizer.cognito.id
}

output "resource_ids" {
  description = "API Gateway resource IDs"
  value = {
    residents    = aws_api_gateway_resource.residents.id
    resident_id  = aws_api_gateway_resource.resident_id.id
    vitals       = aws_api_gateway_resource.vitals.id
    checkins     = aws_api_gateway_resource.checkins.id
    alerts       = aws_api_gateway_resource.alerts.id
    aggregations = aws_api_gateway_resource.aggregations.id
    cohorts      = aws_api_gateway_resource.cohorts.id
  }
}