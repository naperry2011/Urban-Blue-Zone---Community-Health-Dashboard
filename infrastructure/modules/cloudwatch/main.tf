# CloudWatch module placeholder
variable "resource_prefix" {
  type = string
}

variable "lambda_functions" {
  type = list(string)
}

variable "api_gateway_name" {
  type = string
}

variable "tags" {
  type = map(string)
  default = {}
}