variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (demo, staging, prod)"
  type        = string
  default     = "demo"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "ubz"
}

variable "app_domain" {
  description = "Domain for the application"
  type        = string
  default     = "localhost:3000"
}

variable "cognito_callback_urls" {
  description = "Allowed callback URLs for Cognito"
  type        = list(string)
  default     = ["http://localhost:3000/api/auth/callback/cognito"]
}

variable "cognito_logout_urls" {
  description = "Allowed logout URLs for Cognito"
  type        = list(string)
  default     = ["http://localhost:3000"]
}

variable "alert_email" {
  description = "Email address for receiving alerts"
  type        = string
  default     = ""
}

variable "alert_phone" {
  description = "Phone number for SMS alerts (E.164 format)"
  type        = string
  default     = ""
}

variable "dynamodb_billing_mode" {
  description = "DynamoDB billing mode (PAY_PER_REQUEST or PROVISIONED)"
  type        = string
  default     = "PAY_PER_REQUEST"
}

variable "lambda_runtime" {
  description = "Lambda runtime version"
  type        = string
  default     = "nodejs18.x"
}

variable "lambda_timeout" {
  description = "Default Lambda timeout in seconds"
  type        = number
  default     = 30
}

variable "lambda_memory" {
  description = "Default Lambda memory in MB"
  type        = number
  default     = 256
}

variable "api_throttle_burst_limit" {
  description = "API Gateway throttle burst limit"
  type        = number
  default     = 100
}

variable "api_throttle_rate_limit" {
  description = "API Gateway throttle rate limit"
  type        = number
  default     = 50
}

variable "tags" {
  description = "Additional tags for resources"
  type        = map(string)
  default     = {}
}