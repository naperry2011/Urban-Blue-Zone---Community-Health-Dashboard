variable "resource_prefix" {
  type = string
}

variable "runtime" {
  type = string
  default = "nodejs18.x"
}

variable "timeout" {
  type = number
  default = 30
}

variable "memory_size" {
  type = number
  default = 256
}

variable "dynamodb_tables" {
  type = map(string)
}

variable "iot_endpoint" {
  type = string
}

variable "api_gateway_id" {
  type = string
}

variable "sns_topic_arn" {
  type = string
  default = ""
}

variable "sns_critical_topic_arn" {
  type = string
  default = ""
}

variable "sns_wellness_topic_arn" {
  type = string
  default = ""
}

variable "ses_from_email" {
  type = string
  default = "alerts@urbanblue.zone"
}

variable "tags" {
  type = map(string)
  default = {}
}