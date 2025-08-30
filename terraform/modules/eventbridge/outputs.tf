output "hourly_rule_arn" {
  description = "ARN of the hourly aggregation rule"
  value       = aws_cloudwatch_event_rule.hourly_aggregation.arn
}

output "daily_rule_arn" {
  description = "ARN of the daily aggregation rule"
  value       = aws_cloudwatch_event_rule.daily_aggregation.arn
}

output "weekly_rule_arn" {
  description = "ARN of the weekly report rule"
  value       = aws_cloudwatch_event_rule.weekly_report.arn
}

output "realtime_rule_arn" {
  description = "ARN of the real-time aggregation rule"
  value       = aws_cloudwatch_event_rule.realtime_aggregation.arn
}

output "custom_event_bus_arn" {
  description = "ARN of the custom event bus"
  value       = aws_cloudwatch_event_bus.custom.arn
}

output "dlq_url" {
  description = "URL of the EventBridge DLQ"
  value       = aws_sqs_queue.eventbridge_dlq.url
}

output "dlq_arn" {
  description = "ARN of the EventBridge DLQ"
  value       = aws_sqs_queue.eventbridge_dlq.arn
}