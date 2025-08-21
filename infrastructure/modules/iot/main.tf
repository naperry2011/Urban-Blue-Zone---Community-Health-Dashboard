# IoT Core Configuration
data "aws_iot_endpoint" "main" {
  endpoint_type = "iot:Data-ATS"
}

# IoT Thing Type for Residents
resource "aws_iot_thing_type" "resident_device" {
  name = "${var.resource_prefix}-resident-device"
  
  properties {
    description = "IoT device type for resident health monitoring"
  }
  
  tags = var.tags
}

# IoT Policy
resource "aws_iot_policy" "device_policy" {
  name = "${var.resource_prefix}-device-policy"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "iot:Connect",
          "iot:Subscribe",
          "iot:Publish",
          "iot:Receive"
        ]
        Resource = "*"
      }
    ]
  })
}

# IoT Topic Rules will be created after Lambda functions are set up
resource "aws_iot_topic_rule" "vitals_rule" {
  name        = "${replace(var.resource_prefix, "-", "_")}_vitals_rule"
  enabled     = true
  sql         = "SELECT * FROM 'urban-blue-zone/vitals/+'"
  sql_version = "2016-03-23"
  
  lambda {
    function_arn = var.vitals_processor_arn
  }
  
  error_action {
    cloudwatch_logs {
      log_group_name = aws_cloudwatch_log_group.iot_errors.name
      role_arn       = aws_iam_role.iot_rule_role.arn
    }
  }
  
  tags = var.tags
}

resource "aws_iot_topic_rule" "checkins_rule" {
  name        = "${replace(var.resource_prefix, "-", "_")}_checkins_rule"
  enabled     = true
  sql         = "SELECT * FROM 'urban-blue-zone/checkins/+'"
  sql_version = "2016-03-23"
  
  lambda {
    function_arn = var.checkins_processor_arn
  }
  
  error_action {
    cloudwatch_logs {
      log_group_name = aws_cloudwatch_log_group.iot_errors.name
      role_arn       = aws_iam_role.iot_rule_role.arn
    }
  }
  
  tags = var.tags
}

# CloudWatch Log Group for IoT Errors
resource "aws_cloudwatch_log_group" "iot_errors" {
  name              = "/aws/iot/${var.resource_prefix}/errors"
  retention_in_days = 7
  
  tags = var.tags
}

# IAM Role for IoT Rules
resource "aws_iam_role" "iot_rule_role" {
  name = "${var.resource_prefix}-iot-rule-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "iot.amazonaws.com"
        }
      }
    ]
  })
  
  tags = var.tags
}

# IAM Policy for IoT Rules
resource "aws_iam_role_policy" "iot_rule_policy" {
  name = "${var.resource_prefix}-iot-rule-policy"
  role = aws_iam_role.iot_rule_role.id
  
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
          "lambda:InvokeFunction"
        ]
        Resource = "*"
      }
    ]
  })
}