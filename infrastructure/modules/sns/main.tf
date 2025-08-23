# SNS module for Urban Blue Zone alerts
variable "resource_prefix" {
  type        = string
  description = "Prefix for resource naming"
}

variable "alert_email" {
  type        = string
  description = "Email address for alert notifications"
}

variable "alert_phone" {
  type        = string
  description = "Phone number for SMS alerts (E.164 format)"
  default     = ""
}

variable "tags" {
  type        = map(string)
  default     = {}
  description = "Tags to apply to resources"
}

# Critical alerts topic - for immediate health concerns
resource "aws_sns_topic" "critical_alerts" {
  name            = "${var.resource_prefix}-critical-alerts"
  display_name    = "Urban Blue Zone Critical Alerts"
  delivery_policy = jsonencode({
    "http" : {
      "defaultHealthyRetryPolicy" : {
        "minDelayTarget" : 20,
        "maxDelayTarget" : 20,
        "numRetries" : 3,
        "numMaxDelayRetries" : 0,
        "numNoDelayRetries" : 0,
        "numMinDelayRetries" : 0,
        "backoffFunction" : "linear"
      },
      "disableSubscriptionOverrides" : false
    }
  })
  tags = var.tags
}

# Wellness nudges topic - for habit tracking and non-critical updates
resource "aws_sns_topic" "wellness_nudges" {
  name         = "${var.resource_prefix}-wellness-nudges"
  display_name = "Urban Blue Zone Wellness Updates"
  tags         = var.tags
}

# Alert deduplication topic - for system notifications
resource "aws_sns_topic" "system_alerts" {
  name         = "${var.resource_prefix}-system-alerts"
  display_name = "Urban Blue Zone System Alerts"
  tags         = var.tags
}

# Email subscription for critical alerts
resource "aws_sns_topic_subscription" "critical_email" {
  count     = var.alert_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.critical_alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
  
  filter_policy = jsonencode({
    severity = ["critical"]
  })
}

# SMS subscription for critical alerts (if phone provided)
resource "aws_sns_topic_subscription" "critical_sms" {
  count     = var.alert_phone != "" ? 1 : 0
  topic_arn = aws_sns_topic.critical_alerts.arn
  protocol  = "sms"
  endpoint  = var.alert_phone
  
  filter_policy = jsonencode({
    severity = ["critical"]
  })
}

# Email subscription for wellness nudges
resource "aws_sns_topic_subscription" "wellness_email" {
  count     = var.alert_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.wellness_nudges.arn
  protocol  = "email"
  endpoint  = var.alert_email
  
  filter_policy = jsonencode({
    severity = ["warning", "info"]
  })
}

# CloudWatch log group for SNS failures
resource "aws_cloudwatch_log_group" "sns_failures" {
  name              = "/aws/sns/${var.resource_prefix}"
  retention_in_days = 7
  tags              = var.tags
}

# IAM role for SNS to write to CloudWatch
resource "aws_iam_role" "sns_cloudwatch" {
  name = "${var.resource_prefix}-sns-cloudwatch-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "sns.amazonaws.com"
        }
      }
    ]
  })
  
  tags = var.tags
}

# IAM policy for SNS CloudWatch access
resource "aws_iam_role_policy" "sns_cloudwatch" {
  name = "${var.resource_prefix}-sns-cloudwatch-policy"
  role = aws_iam_role.sns_cloudwatch.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:PutMetricFilter",
          "logs:PutRetentionPolicy"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# Outputs
output "critical_alerts_topic_arn" {
  value       = aws_sns_topic.critical_alerts.arn
  description = "ARN of the critical alerts SNS topic"
}

output "wellness_nudges_topic_arn" {
  value       = aws_sns_topic.wellness_nudges.arn
  description = "ARN of the wellness nudges SNS topic"
}

output "system_alerts_topic_arn" {
  value       = aws_sns_topic.system_alerts.arn
  description = "ARN of the system alerts SNS topic"
}

output "alert_topic_arn" {
  value       = aws_sns_topic.critical_alerts.arn
  description = "ARN of the main alert topic (for backward compatibility)"
}