# Lambda Functions for Urban Blue Zone

# Aggregator Lambda Function
resource "aws_lambda_function" "aggregator" {
  filename         = "${path.module}/../../../backend/aggregator/function.zip"
  function_name    = "${var.project_name}-aggregator"
  role            = aws_iam_role.aggregator_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 60
  memory_size     = 512
  
  environment {
    variables = {
      VITALS_TABLE       = var.vitals_table_name
      CHECKINS_TABLE     = var.checkins_table_name
      AGGREGATIONS_TABLE = var.aggregations_table_name
      RESIDENTS_TABLE    = var.residents_table_name
      ENVIRONMENT        = var.environment
    }
  }
  
  dead_letter_config {
    target_arn = aws_sqs_queue.aggregator_dlq.arn
  }
  
  tracing_config {
    mode = "Active"
  }
  
  tags = var.tags
}

# Vitals Processor Lambda Function
resource "aws_lambda_function" "vitals_processor" {
  filename         = "${path.module}/../../../backend/vitals-processor/function.zip"
  function_name    = "${var.project_name}-vitals-processor"
  role            = aws_iam_role.vitals_processor_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 256
  
  environment {
    variables = {
      VITALS_TABLE    = var.vitals_table_name
      ALERTS_TABLE    = var.alerts_table_name
      RESIDENTS_TABLE = var.residents_table_name
      SNS_TOPIC_ARN   = var.critical_alerts_topic_arn
      ENVIRONMENT     = var.environment
    }
  }
  
  dead_letter_config {
    target_arn = aws_sqs_queue.vitals_processor_dlq.arn
  }
  
  tracing_config {
    mode = "Active"
  }
  
  tags = var.tags
}

# Checkins Processor Lambda Function
resource "aws_lambda_function" "checkins_processor" {
  filename         = "${path.module}/../../../backend/checkins-processor/function.zip"
  function_name    = "${var.project_name}-checkins-processor"
  role            = aws_iam_role.checkins_processor_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 256
  
  environment {
    variables = {
      CHECKINS_TABLE  = var.checkins_table_name
      RESIDENTS_TABLE = var.residents_table_name
      SNS_TOPIC_ARN   = var.wellness_nudges_topic_arn
      ENVIRONMENT     = var.environment
    }
  }
  
  dead_letter_config {
    target_arn = aws_sqs_queue.checkins_processor_dlq.arn
  }
  
  tracing_config {
    mode = "Active"
  }
  
  tags = var.tags
}

# Alert Processor Lambda Function
resource "aws_lambda_function" "alert_processor" {
  filename         = "${path.module}/../../../backend/alert-processor/function.zip"
  function_name    = "${var.project_name}-alert-processor"
  role            = aws_iam_role.alert_processor_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 256
  
  environment {
    variables = {
      ALERTS_TABLE       = var.alerts_table_name
      ALERT_DEDUP_TABLE  = var.alert_dedup_table_name
      RESIDENTS_TABLE    = var.residents_table_name
      SNS_CRITICAL_ARN   = var.critical_alerts_topic_arn
      SNS_WELLNESS_ARN   = var.wellness_nudges_topic_arn
      SES_FROM_EMAIL     = var.ses_from_email
      ENVIRONMENT        = var.environment
    }
  }
  
  dead_letter_config {
    target_arn = aws_sqs_queue.alert_processor_dlq.arn
  }
  
  tracing_config {
    mode = "Active"
  }
  
  tags = var.tags
}

# Habit Analytics Lambda Function
resource "aws_lambda_function" "habit_analytics" {
  filename         = "${path.module}/../../../backend/habit-analytics/function.zip"
  function_name    = "${var.project_name}-habit-analytics"
  role            = aws_iam_role.habit_analytics_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 256
  
  environment {
    variables = {
      CHECKINS_TABLE     = var.checkins_table_name
      AGGREGATIONS_TABLE = var.aggregations_table_name
      RESIDENTS_TABLE    = var.residents_table_name
      ENVIRONMENT        = var.environment
    }
  }
  
  dead_letter_config {
    target_arn = aws_sqs_queue.habit_analytics_dlq.arn
  }
  
  tracing_config {
    mode = "Active"
  }
  
  tags = var.tags
}

# Dead Letter Queues
resource "aws_sqs_queue" "aggregator_dlq" {
  name                      = "${var.project_name}-aggregator-dlq"
  delay_seconds            = 0
  max_message_size         = 262144
  message_retention_seconds = 1209600  # 14 days
  receive_wait_time_seconds = 10
  
  tags = var.tags
}

resource "aws_sqs_queue" "vitals_processor_dlq" {
  name                      = "${var.project_name}-vitals-processor-dlq"
  delay_seconds            = 0
  max_message_size         = 262144
  message_retention_seconds = 1209600
  receive_wait_time_seconds = 10
  
  tags = var.tags
}

resource "aws_sqs_queue" "checkins_processor_dlq" {
  name                      = "${var.project_name}-checkins-processor-dlq"
  delay_seconds            = 0
  max_message_size         = 262144
  message_retention_seconds = 1209600
  receive_wait_time_seconds = 10
  
  tags = var.tags
}

resource "aws_sqs_queue" "alert_processor_dlq" {
  name                      = "${var.project_name}-alert-processor-dlq"
  delay_seconds            = 0
  max_message_size         = 262144
  message_retention_seconds = 1209600
  receive_wait_time_seconds = 10
  
  tags = var.tags
}

resource "aws_sqs_queue" "habit_analytics_dlq" {
  name                      = "${var.project_name}-habit-analytics-dlq"
  delay_seconds            = 0
  max_message_size         = 262144
  message_retention_seconds = 1209600
  receive_wait_time_seconds = 10
  
  tags = var.tags
}

# IAM Roles and Policies

# Aggregator Lambda Role
resource "aws_iam_role" "aggregator_role" {
  name = "${var.project_name}-aggregator-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
  
  tags = var.tags
}

resource "aws_iam_role_policy" "aggregator_policy" {
  name = "${var.project_name}-aggregator-policy"
  role = aws_iam_role.aggregator_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem"
        ]
        Resource = [
          "arn:aws:dynamodb:*:*:table/${var.vitals_table_name}*",
          "arn:aws:dynamodb:*:*:table/${var.checkins_table_name}*",
          "arn:aws:dynamodb:*:*:table/${var.aggregations_table_name}*",
          "arn:aws:dynamodb:*:*:table/${var.residents_table_name}*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "xray:PutTraceSegments",
          "xray:PutTelemetryRecords"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.aggregator_dlq.arn
      }
    ]
  })
}

# Vitals Processor Lambda Role
resource "aws_iam_role" "vitals_processor_role" {
  name = "${var.project_name}-vitals-processor-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
  
  tags = var.tags
}

resource "aws_iam_role_policy" "vitals_processor_policy" {
  name = "${var.project_name}-vitals-processor-policy"
  role = aws_iam_role.vitals_processor_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Query"
        ]
        Resource = [
          "arn:aws:dynamodb:*:*:table/${var.vitals_table_name}*",
          "arn:aws:dynamodb:*:*:table/${var.alerts_table_name}*",
          "arn:aws:dynamodb:*:*:table/${var.residents_table_name}*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = var.critical_alerts_topic_arn
      },
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "xray:PutTraceSegments",
          "xray:PutTelemetryRecords"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.vitals_processor_dlq.arn
      }
    ]
  })
}

# Checkins Processor Lambda Role
resource "aws_iam_role" "checkins_processor_role" {
  name = "${var.project_name}-checkins-processor-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
  
  tags = var.tags
}

resource "aws_iam_role_policy" "checkins_processor_policy" {
  name = "${var.project_name}-checkins-processor-policy"
  role = aws_iam_role.checkins_processor_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:UpdateItem"
        ]
        Resource = [
          "arn:aws:dynamodb:*:*:table/${var.checkins_table_name}*",
          "arn:aws:dynamodb:*:*:table/${var.residents_table_name}*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = var.wellness_nudges_topic_arn
      },
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "xray:PutTraceSegments",
          "xray:PutTelemetryRecords"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.checkins_processor_dlq.arn
      }
    ]
  })
}

# Alert Processor Lambda Role
resource "aws_iam_role" "alert_processor_role" {
  name = "${var.project_name}-alert-processor-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
  
  tags = var.tags
}

resource "aws_iam_role_policy" "alert_processor_policy" {
  name = "${var.project_name}-alert-processor-policy"
  role = aws_iam_role.alert_processor_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:UpdateItem"
        ]
        Resource = [
          "arn:aws:dynamodb:*:*:table/${var.alerts_table_name}*",
          "arn:aws:dynamodb:*:*:table/${var.alert_dedup_table_name}*",
          "arn:aws:dynamodb:*:*:table/${var.residents_table_name}*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = [
          var.critical_alerts_topic_arn,
          var.wellness_nudges_topic_arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendTemplatedEmail"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "xray:PutTraceSegments",
          "xray:PutTelemetryRecords"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.alert_processor_dlq.arn
      }
    ]
  })
}

# Habit Analytics Lambda Role
resource "aws_iam_role" "habit_analytics_role" {
  name = "${var.project_name}-habit-analytics-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
  
  tags = var.tags
}

resource "aws_iam_role_policy" "habit_analytics_policy" {
  name = "${var.project_name}-habit-analytics-policy"
  role = aws_iam_role.habit_analytics_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem"
        ]
        Resource = [
          "arn:aws:dynamodb:*:*:table/${var.checkins_table_name}*",
          "arn:aws:dynamodb:*:*:table/${var.aggregations_table_name}*",
          "arn:aws:dynamodb:*:*:table/${var.residents_table_name}*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "xray:PutTraceSegments",
          "xray:PutTelemetryRecords"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.habit_analytics_dlq.arn
      }
    ]
  })
}

# Lambda Layer for shared dependencies (optional)
resource "aws_lambda_layer_version" "shared_deps" {
  filename            = "${path.module}/../../../layers/shared-deps.zip"
  layer_name          = "${var.project_name}-shared-deps"
  compatible_runtimes = ["nodejs18.x"]
  description         = "Shared dependencies for Lambda functions"
}

# CloudWatch Log Retention
resource "aws_cloudwatch_log_group" "lambda_logs" {
  for_each = {
    aggregator        = aws_lambda_function.aggregator.function_name
    vitals_processor  = aws_lambda_function.vitals_processor.function_name
    checkins_processor = aws_lambda_function.checkins_processor.function_name
    alert_processor   = aws_lambda_function.alert_processor.function_name
    habit_analytics   = aws_lambda_function.habit_analytics.function_name
  }
  
  name              = "/aws/lambda/${each.value}"
  retention_in_days = 7
  
  tags = var.tags
}