variable "resource_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "billing_mode" {
  description = "DynamoDB billing mode"
  type        = string
  default     = "PAY_PER_REQUEST"
}

variable "tags" {
  description = "Tags for resources"
  type        = map(string)
  default     = {}
}