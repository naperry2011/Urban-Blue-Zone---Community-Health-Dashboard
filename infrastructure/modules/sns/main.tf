# SNS module placeholder
variable "resource_prefix" {
  type = string
}

variable "alert_email" {
  type = string
}

variable "alert_phone" {
  type = string
}

variable "tags" {
  type = map(string)
  default = {}
}

resource "aws_sns_topic" "alerts" {
  name = "${var.resource_prefix}-alerts"
  tags = var.tags
}

output "alert_topic_arn" {
  value = aws_sns_topic.alerts.arn
}