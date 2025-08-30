output "aggregator_function_arn" {
  description = "ARN of the aggregator Lambda function"
  value       = aws_lambda_function.aggregator.arn
}

output "aggregator_function_name" {
  description = "Name of the aggregator Lambda function"
  value       = aws_lambda_function.aggregator.function_name
}

output "vitals_processor_function_arn" {
  description = "ARN of the vitals processor Lambda function"
  value       = aws_lambda_function.vitals_processor.arn
}

output "vitals_processor_function_name" {
  description = "Name of the vitals processor Lambda function"
  value       = aws_lambda_function.vitals_processor.function_name
}

output "checkins_processor_function_arn" {
  description = "ARN of the checkins processor Lambda function"
  value       = aws_lambda_function.checkins_processor.arn
}

output "checkins_processor_function_name" {
  description = "Name of the checkins processor Lambda function"
  value       = aws_lambda_function.checkins_processor.function_name
}

output "alert_processor_function_arn" {
  description = "ARN of the alert processor Lambda function"
  value       = aws_lambda_function.alert_processor.arn
}

output "alert_processor_function_name" {
  description = "Name of the alert processor Lambda function"
  value       = aws_lambda_function.alert_processor.function_name
}

output "habit_analytics_function_arn" {
  description = "ARN of the habit analytics Lambda function"
  value       = aws_lambda_function.habit_analytics.arn
}

output "habit_analytics_function_name" {
  description = "Name of the habit analytics Lambda function"
  value       = aws_lambda_function.habit_analytics.function_name
}

output "aggregator_dlq_url" {
  description = "URL of the aggregator DLQ"
  value       = aws_sqs_queue.aggregator_dlq.url
}

output "aggregator_dlq_arn" {
  description = "ARN of the aggregator DLQ"
  value       = aws_sqs_queue.aggregator_dlq.arn
}

output "shared_deps_layer_arn" {
  description = "ARN of the shared dependencies Lambda layer"
  value       = aws_lambda_layer_version.shared_deps.arn
}