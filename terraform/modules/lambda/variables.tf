variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vitals_table_name" {
  description = "Name of the vitals DynamoDB table"
  type        = string
}

variable "checkins_table_name" {
  description = "Name of the checkins DynamoDB table"
  type        = string
}

variable "aggregations_table_name" {
  description = "Name of the aggregations DynamoDB table"
  type        = string
}

variable "residents_table_name" {
  description = "Name of the residents DynamoDB table"
  type        = string
}

variable "alerts_table_name" {
  description = "Name of the alerts DynamoDB table"
  type        = string
}

variable "alert_dedup_table_name" {
  description = "Name of the alert deduplication DynamoDB table"
  type        = string
}

variable "critical_alerts_topic_arn" {
  description = "ARN of the critical alerts SNS topic"
  type        = string
}

variable "wellness_nudges_topic_arn" {
  description = "ARN of the wellness nudges SNS topic"
  type        = string
}

variable "ses_from_email" {
  description = "Email address to send SES emails from"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}