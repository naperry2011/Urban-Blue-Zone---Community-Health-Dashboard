output "main_dashboard_url" {
  description = "URL of the main CloudWatch dashboard"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
}

output "cohorts_dashboard_url" {
  description = "URL of the cohorts CloudWatch dashboard"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.cohorts.dashboard_name}"
}

output "low_ubzi_alarm_arn" {
  description = "ARN of the low UBZI alarm"
  value       = aws_cloudwatch_metric_alarm.low_ubzi.arn
}

output "high_alert_rate_alarm_arn" {
  description = "ARN of the high alert rate alarm"
  value       = aws_cloudwatch_metric_alarm.high_alert_rate.arn
}

output "data_quality_alarm_arn" {
  description = "ARN of the data quality alarm"
  value       = aws_cloudwatch_metric_alarm.low_data_quality.arn
}

output "lambda_errors_alarm_arn" {
  description = "ARN of the Lambda errors alarm"
  value       = aws_cloudwatch_metric_alarm.lambda_errors.arn
}

output "aggregation_failures_alarm_arn" {
  description = "ARN of the aggregation failures alarm"
  value       = aws_cloudwatch_metric_alarm.aggregation_failures.arn
}

output "log_group_name" {
  description = "Name of the aggregation log group"
  value       = aws_cloudwatch_log_group.aggregation_logs.name
}

output "log_group_arn" {
  description = "ARN of the aggregation log group"
  value       = aws_cloudwatch_log_group.aggregation_logs.arn
}