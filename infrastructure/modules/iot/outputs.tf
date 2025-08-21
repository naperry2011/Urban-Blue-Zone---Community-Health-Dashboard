output "endpoint" {
  description = "IoT Core endpoint"
  value       = data.aws_iot_endpoint.main.endpoint_address
}

output "thing_type_arn" {
  description = "IoT Thing Type ARN"
  value       = aws_iot_thing_type.resident_device.arn
}

output "policy_name" {
  description = "IoT Policy name"
  value       = aws_iot_policy.device_policy.name
}

output "vitals_rule_arn" {
  description = "Vitals topic rule ARN"
  value       = aws_iot_topic_rule.vitals_rule.arn
}

output "checkins_rule_arn" {
  description = "Checkins topic rule ARN"
  value       = aws_iot_topic_rule.checkins_rule.arn
}