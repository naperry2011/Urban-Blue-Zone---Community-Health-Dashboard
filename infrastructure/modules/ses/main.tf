# SES module placeholder
variable "resource_prefix" {
  type = string
}

variable "from_email" {
  type = string
}

variable "tags" {
  type = map(string)
  default = {}
}