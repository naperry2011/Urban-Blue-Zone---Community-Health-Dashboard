locals {
  resource_prefix = "${var.project_name}-${var.environment}"
  
  common_tags = merge(
    var.tags,
    {
      Project     = var.project_name
      Environment = var.environment
    }
  )
}

# Cognito User Pool
module "cognito" {
  source = "./modules/cognito"
  
  resource_prefix = local.resource_prefix
  callback_urls   = var.cognito_callback_urls
  logout_urls     = var.cognito_logout_urls
  tags           = local.common_tags
}

# DynamoDB Tables
module "dynamodb" {
  source = "./modules/dynamodb"
  
  resource_prefix = local.resource_prefix
  billing_mode    = var.dynamodb_billing_mode
  tags           = local.common_tags
}

# API Gateway
module "api_gateway" {
  source = "./modules/api_gateway"
  
  resource_prefix      = local.resource_prefix
  cognito_user_pool_id = module.cognito.user_pool_id
  throttle_burst_limit = var.api_throttle_burst_limit
  throttle_rate_limit  = var.api_throttle_rate_limit
  tags                = local.common_tags
}

# IoT Core
module "iot" {
  source = "./modules/iot"
  
  resource_prefix = local.resource_prefix
  tags           = local.common_tags
}

# Lambda Functions
module "lambda" {
  source = "./modules/lambda"

  resource_prefix = local.resource_prefix
  runtime         = var.lambda_runtime
  timeout         = var.lambda_timeout
  memory_size     = var.lambda_memory

  dynamodb_tables = {
    residents    = module.dynamodb.residents_table_name
    vitals       = module.dynamodb.vitals_table_name
    checkins     = module.dynamodb.checkins_table_name
    alerts       = module.dynamodb.alerts_table_name
    aggregations = module.dynamodb.aggregations_table_name
  }

  iot_endpoint               = module.iot.endpoint
  api_gateway_id             = module.api_gateway.api_id
  sns_topic_arn              = module.sns.alert_topic_arn
  sns_critical_topic_arn     = module.sns.critical_alerts_topic_arn
  sns_wellness_topic_arn     = module.sns.wellness_nudges_topic_arn
  ses_from_email             = var.alert_email

  tags = local.common_tags
}

# SNS Topics
module "sns" {
  source = "./modules/sns"
  
  resource_prefix = local.resource_prefix
  alert_email     = var.alert_email
  alert_phone     = var.alert_phone
  tags           = local.common_tags
}

# SES Configuration
module "ses" {
  source = "./modules/ses"
  
  resource_prefix = local.resource_prefix
  from_email      = var.alert_email
  tags           = local.common_tags
}

# CloudWatch
module "cloudwatch" {
  source = "./modules/cloudwatch"
  
  resource_prefix = local.resource_prefix
  lambda_functions = module.lambda.function_names
  api_gateway_name = module.api_gateway.api_name
  tags            = local.common_tags
}

# S3 Buckets for deployment
module "s3" {
  source = "./modules/s3"
  
  resource_prefix = local.resource_prefix
  tags           = local.common_tags
}