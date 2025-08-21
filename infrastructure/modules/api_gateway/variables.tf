variable "resource_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  type        = string
}

variable "cognito_user_pool_arn" {
  description = "Cognito User Pool ARN"
  type        = string
  default     = ""
}

variable "stage_name" {
  description = "API Gateway stage name"
  type        = string
  default     = "prod"
}

variable "throttle_burst_limit" {
  description = "API throttle burst limit"
  type        = number
  default     = 100
}

variable "throttle_rate_limit" {
  description = "API throttle rate limit"
  type        = number
  default     = 50
}

variable "tags" {
  description = "Tags for resources"
  type        = map(string)
  default     = {}
}