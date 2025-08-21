# Lambda Functions Module

# Lambda execution role
resource "aws_iam_role" "lambda_execution_role" {
  name = "${var.resource_prefix}-lambda-execution-role"

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

# Lambda execution policy
resource "aws_iam_role_policy" "lambda_execution_policy" {
  name = "${var.resource_prefix}-lambda-execution-policy"
  role = aws_iam_role.lambda_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
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
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Scan"
        ]
        Resource = [
          "arn:aws:dynamodb:*:*:table/${var.resource_prefix}-*",
          "arn:aws:dynamodb:*:*:table/${var.resource_prefix}-*/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      }
    ]
  })
}

# IoT Vitals Processor Lambda
resource "aws_lambda_function" "iot_vitals_processor" {
  filename         = "${path.module}/../../../backend/iot/vitals-processor/function.zip"
  function_name    = "${var.resource_prefix}-iot-vitals-processor"
  role            = aws_iam_role.lambda_execution_role.arn
  handler         = "index.handler"
  source_code_hash = filebase64sha256("${path.module}/../../../backend/iot/vitals-processor/function.zip")
  runtime         = var.runtime
  timeout         = var.timeout
  memory_size     = var.memory_size

  environment {
    variables = {
      VITALS_TABLE = var.dynamodb_tables["vitals"]
      ALERTS_TABLE = var.dynamodb_tables["alerts"]
      SNS_TOPIC_ARN = var.sns_topic_arn
    }
  }

  tags = var.tags
}

# IoT Check-ins Processor Lambda
resource "aws_lambda_function" "iot_checkins_processor" {
  filename         = "${path.module}/../../../backend/iot/checkins-processor/function.zip"
  function_name    = "${var.resource_prefix}-iot-checkins-processor"
  role            = aws_iam_role.lambda_execution_role.arn
  handler         = "index.handler"
  source_code_hash = filebase64sha256("${path.module}/../../../backend/iot/checkins-processor/function.zip")
  runtime         = var.runtime
  timeout         = var.timeout
  memory_size     = var.memory_size

  environment {
    variables = {
      CHECKINS_TABLE = var.dynamodb_tables["checkins"]
      AGGREGATIONS_TABLE = var.dynamodb_tables["aggregations"]
    }
  }

  tags = var.tags
}

# Lambda permissions for IoT to invoke
resource "aws_lambda_permission" "iot_invoke_vitals" {
  statement_id  = "AllowIoTInvokeVitals"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.iot_vitals_processor.function_name
  principal     = "iot.amazonaws.com"
}

resource "aws_lambda_permission" "iot_invoke_checkins" {
  statement_id  = "AllowIoTInvokeCheckins"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.iot_checkins_processor.function_name
  principal     = "iot.amazonaws.com"
}