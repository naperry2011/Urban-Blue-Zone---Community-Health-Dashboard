variable "resource_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "callback_urls" {
  description = "Allowed callback URLs"
  type        = list(string)
}

variable "logout_urls" {
  description = "Allowed logout URLs"
  type        = list(string)
}

variable "tags" {
  description = "Tags for resources"
  type        = map(string)
  default     = {}
}