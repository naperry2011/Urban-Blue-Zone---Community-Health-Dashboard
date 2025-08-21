# Placeholder Lambda module - will be implemented with actual function code
variable "resource_prefix" {
  type = string
}

variable "runtime" {
  type = string
}

variable "timeout" {
  type = number
}

variable "memory_size" {
  type = number
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

variable "tags" {
  type = map(string)
  default = {}
}

output "function_names" {
  value = []
}