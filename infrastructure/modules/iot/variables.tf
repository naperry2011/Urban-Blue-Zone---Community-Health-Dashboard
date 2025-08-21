variable "resource_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "vitals_processor_arn" {
  description = "ARN of the vitals processor Lambda function"
  type        = string
  default     = ""
}

variable "checkins_processor_arn" {
  description = "ARN of the checkins processor Lambda function"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags for resources"
  type        = map(string)
  default     = {}
}