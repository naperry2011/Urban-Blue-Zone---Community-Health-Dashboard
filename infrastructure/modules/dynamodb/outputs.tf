output "residents_table_name" {
  description = "Residents table name"
  value       = aws_dynamodb_table.residents.name
}

output "residents_table_arn" {
  description = "Residents table ARN"
  value       = aws_dynamodb_table.residents.arn
}

output "vitals_table_name" {
  description = "Vitals table name"
  value       = aws_dynamodb_table.vitals.name
}

output "vitals_table_arn" {
  description = "Vitals table ARN"
  value       = aws_dynamodb_table.vitals.arn
}

output "checkins_table_name" {
  description = "Check-ins table name"
  value       = aws_dynamodb_table.checkins.name
}

output "checkins_table_arn" {
  description = "Check-ins table ARN"
  value       = aws_dynamodb_table.checkins.arn
}

output "alerts_table_name" {
  description = "Alerts table name"
  value       = aws_dynamodb_table.alerts.name
}

output "alerts_table_arn" {
  description = "Alerts table ARN"
  value       = aws_dynamodb_table.alerts.arn
}

output "aggregations_table_name" {
  description = "Aggregations table name"
  value       = aws_dynamodb_table.aggregations.name
}

output "aggregations_table_arn" {
  description = "Aggregations table ARN"
  value       = aws_dynamodb_table.aggregations.arn
}

output "alert_dedup_table_name" {
  description = "Alert deduplication table name"
  value       = aws_dynamodb_table.alert_dedup.name
}

output "alert_dedup_table_arn" {
  description = "Alert deduplication table ARN"
  value       = aws_dynamodb_table.alert_dedup.arn
}