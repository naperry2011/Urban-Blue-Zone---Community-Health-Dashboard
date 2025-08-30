# CloudWatch Dashboards, Metrics, and Alarms

# Main Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-main-dashboard"
  
  dashboard_body = jsonencode({
    widgets = [
      # UBZI Overview Widget
      {
        type = "metric"
        properties = {
          title   = "Urban Blue Zone Index (UBZI) - System Overview"
          metrics = [
            ["UrbanBlueZone", "SystemUBZI", { stat = "Average", label = "Average UBZI" }],
            ["...", { stat = "Minimum", label = "Min UBZI" }],
            ["...", { stat = "Maximum", label = "Max UBZI" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          view   = "timeSeries"
          yAxis = {
            left = {
              min = 0
              max = 100
            }
          }
        }
        width  = 12
        height = 6
        x      = 0
        y      = 0
      },
      
      # Alert Summary Widget
      {
        type = "metric"
        properties = {
          title = "Health Alerts - 24 Hour Trend"
          metrics = [
            ["UrbanBlueZone", "CriticalAlerts", { stat = "Sum", color = "#d62728" }],
            [".", "WarningAlerts", { stat = "Sum", color = "#ff7f0e" }],
            [".", "InfoAlerts", { stat = "Sum", color = "#2ca02c" }]
          ]
          period = 3600
          stat   = "Sum"
          region = var.aws_region
          view   = "timeSeries"
          stacked = true
        }
        width  = 12
        height = 6
        x      = 12
        y      = 0
      },
      
      # Cohort Comparison Widget
      {
        type = "metric"
        properties = {
          title = "UBZI by Cohort"
          metrics = [
            ["UrbanBlueZone/Cohorts", "AverageUBZI", { "stat": "Average" }, { "label": "Senior", "dimensionsMap": { "Cohort": "senior" }}],
            ["...", { }, { "label": "Adult", "dimensionsMap": { "Cohort": "adult" }}],
            ["...", { }, { "label": "Teen", "dimensionsMap": { "Cohort": "teen" }}],
            ["...", { }, { "label": "Chronic", "dimensionsMap": { "Cohort": "chronic" }}]
          ]
          period = 3600
          stat   = "Average"
          region = var.aws_region
          view   = "singleValue"
        }
        width  = 24
        height = 3
        x      = 0
        y      = 6
      },
      
      # Data Quality Widget
      {
        type = "metric"
        properties = {
          title = "System Data Quality"
          metrics = [
            ["UrbanBlueZone", "DataCompleteness", { stat = "Average", label = "Data Completeness %" }],
            [".", "DeviceConnectivity", { stat = "Average", label = "Device Connectivity %" }]
          ]
          period = 900
          stat   = "Average"
          region = var.aws_region
          view   = "gauge"
          yAxis = {
            left = {
              min = 0
              max = 100
            }
          }
        }
        width  = 6
        height = 6
        x      = 0
        y      = 9
      },
      
      # Lambda Performance Widget
      {
        type = "metric"
        properties = {
          title = "Lambda Function Performance"
          metrics = [
            ["AWS/Lambda", "Invocations", { "stat": "Sum" }, { "label": "Invocations" }],
            [".", "Errors", { "stat": "Sum", "color": "#d62728" }, { "label": "Errors" }],
            [".", "Duration", { "stat": "Average", "yAxis": "right" }, { "label": "Duration (ms)" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          view   = "timeSeries"
        }
        width  = 9
        height = 6
        x      = 6
        y      = 9
      },
      
      # DynamoDB Performance Widget
      {
        type = "metric"
        properties = {
          title = "DynamoDB Performance"
          metrics = [
            ["AWS/DynamoDB", "UserErrors", { "stat": "Sum", "color": "#d62728" }],
            [".", "SystemErrors", { "stat": "Sum", "color": "#ff7f0e" }],
            [".", "ConsumedReadCapacityUnits", { "stat": "Sum", "yAxis": "right" }],
            [".", "ConsumedWriteCapacityUnits", { "stat": "Sum", "yAxis": "right" }]
          ]
          period = 300
          stat   = "Sum"
          region = var.aws_region
          view   = "timeSeries"
        }
        width  = 9
        height = 6
        x      = 15
        y      = 9
      },
      
      # Aggregation Status Widget
      {
        type = "metric"
        properties = {
          title = "Aggregation Jobs Status"
          metrics = [
            ["UrbanBlueZone", "HourlyAggregations", { "stat": "Sum", "label": "Hourly Jobs" }],
            [".", "DailyAggregations", { "stat": "Sum", "label": "Daily Jobs" }],
            [".", "AggregationErrors", { "stat": "Sum", "color": "#d62728", "label": "Failed Jobs" }]
          ]
          period = 3600
          stat   = "Sum"
          region = var.aws_region
          view   = "timeSeries"
        }
        width  = 12
        height = 6
        x      = 0
        y      = 15
      },
      
      # Blue Zone Habits Tracking Widget
      {
        type = "metric"
        properties = {
          title = "Blue Zone Habits Performance"
          metrics = [
            ["UrbanBlueZone/Habits", "MoveNaturally", { "stat": "Average" }],
            [".", "PurposeInLife", { "stat": "Average" }],
            [".", "Downshift", { "stat": "Average" }],
            [".", "EightyRule", { "stat": "Average" }],
            [".", "PlantSlant", { "stat": "Average" }]
          ]
          period = 3600
          stat   = "Average"
          region = var.aws_region
          view   = "barChart"
        }
        width  = 12
        height = 6
        x      = 12
        y      = 15
      }
    ]
  })
}

# Cohort-specific Dashboard
resource "aws_cloudwatch_dashboard" "cohorts" {
  dashboard_name = "${var.project_name}-cohorts-dashboard"
  
  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          title = "Senior Cohort Metrics"
          metrics = [
            ["UrbanBlueZone/Cohorts", "AverageUBZI", { "dimensionsMap": { "Cohort": "senior" }}, { "label": "UBZI" }],
            [".", "TotalAlerts", { "dimensionsMap": { "Cohort": "senior" }, "yAxis": "right" }, { "label": "Alerts" }]
          ]
          period = 900
          stat   = "Average"
          region = var.aws_region
          view   = "timeSeries"
        }
        width  = 12
        height = 6
        x      = 0
        y      = 0
      },
      {
        type = "metric"
        properties = {
          title = "Adult Cohort Metrics"
          metrics = [
            ["UrbanBlueZone/Cohorts", "AverageUBZI", { "dimensionsMap": { "Cohort": "adult" }}, { "label": "UBZI" }],
            [".", "TotalAlerts", { "dimensionsMap": { "Cohort": "adult" }, "yAxis": "right" }, { "label": "Alerts" }]
          ]
          period = 900
          stat   = "Average"
          region = var.aws_region
          view   = "timeSeries"
        }
        width  = 12
        height = 6
        x      = 12
        y      = 0
      }
    ]
  })
}

# Critical UBZI Alarm
resource "aws_cloudwatch_metric_alarm" "low_ubzi" {
  alarm_name          = "${var.project_name}-low-ubzi-alarm"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "SystemUBZI"
  namespace           = "UrbanBlueZone"
  period              = 900  # 15 minutes
  statistic           = "Average"
  threshold           = 40
  alarm_description   = "Alert when system-wide UBZI drops below 40"
  alarm_actions       = var.alarm_sns_topic_arns

  tags = var.tags
}

# High Alert Rate Alarm
resource "aws_cloudwatch_metric_alarm" "high_alert_rate" {
  alarm_name          = "${var.project_name}-high-alert-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "CriticalAlerts"
  namespace           = "UrbanBlueZone"
  period              = 3600  # 1 hour
  statistic           = "Sum"
  threshold           = 50
  alarm_description   = "Alert when critical alerts exceed 50 per hour"
  alarm_actions       = var.alarm_sns_topic_arns

  tags = var.tags
}

# Data Quality Alarm
resource "aws_cloudwatch_metric_alarm" "low_data_quality" {
  alarm_name          = "${var.project_name}-low-data-quality"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 3
  metric_name         = "DataCompleteness"
  namespace           = "UrbanBlueZone"
  period              = 300
  statistic           = "Average"
  threshold           = 50
  alarm_description   = "Alert when data completeness drops below 50%"
  alarm_actions       = var.alarm_sns_topic_arns

  tags = var.tags
}

# Lambda Error Alarm
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "${var.project_name}-lambda-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "Alert when Lambda errors exceed threshold"
  alarm_actions       = var.alarm_sns_topic_arns
  
  dimensions = {
    FunctionName = var.aggregator_lambda_name
  }

  tags = var.tags
}

# Aggregation Failure Alarm
resource "aws_cloudwatch_metric_alarm" "aggregation_failures" {
  alarm_name          = "${var.project_name}-aggregation-failures"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "AggregationErrors"
  namespace           = "UrbanBlueZone"
  period              = 3600
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Alert when aggregation jobs fail"
  alarm_actions       = var.alarm_sns_topic_arns

  tags = var.tags
}

# DynamoDB Throttle Alarm
resource "aws_cloudwatch_metric_alarm" "dynamodb_throttles" {
  alarm_name          = "${var.project_name}-dynamodb-throttles"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  
  metric_query {
    id          = "m1"
    return_data = false
    
    metric {
      metric_name = "UserErrors"
      namespace   = "AWS/DynamoDB"
      period      = 300
      stat        = "Sum"
      
      dimensions = {
        TableName = var.aggregations_table_name
      }
    }
  }
  
  metric_query {
    id          = "m2"
    return_data = false
    
    metric {
      metric_name = "SystemErrors"
      namespace   = "AWS/DynamoDB"
      period      = 300
      stat        = "Sum"
      
      dimensions = {
        TableName = var.aggregations_table_name
      }
    }
  }
  
  metric_query {
    id          = "e1"
    expression  = "m1 + m2"
    label       = "Total Errors"
    return_data = true
  }
  
  threshold           = 10
  alarm_description   = "Alert when DynamoDB errors occur"
  alarm_actions       = var.alarm_sns_topic_arns

  tags = var.tags
}

# Cohort-specific alarms
resource "aws_cloudwatch_metric_alarm" "senior_cohort_ubzi" {
  alarm_name          = "${var.project_name}-senior-cohort-low-ubzi"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  threshold           = 35
  alarm_description   = "Alert when senior cohort UBZI is critically low"
  alarm_actions       = var.alarm_sns_topic_arns

  metric_query {
    id = "m1"
    
    metric {
      metric_name = "AverageUBZI"
      namespace   = "UrbanBlueZone/Cohorts"
      period      = 1800
      stat        = "Average"
      
      dimensions = {
        Cohort = "senior"
      }
    }
  }

  tags = var.tags
}

# CloudWatch Log Groups for monitoring
resource "aws_cloudwatch_log_group" "aggregation_logs" {
  name              = "/aws/lambda/${var.aggregator_lambda_name}"
  retention_in_days = 7
  
  tags = var.tags
}

# Log metric filter for error tracking
resource "aws_cloudwatch_log_metric_filter" "aggregation_errors" {
  name           = "${var.project_name}-aggregation-error-filter"
  log_group_name = aws_cloudwatch_log_group.aggregation_logs.name
  pattern        = "[ERROR]"
  
  metric_transformation {
    name      = "AggregationLogErrors"
    namespace = "UrbanBlueZone/Logs"
    value     = "1"
  }
}

# Custom metric namespace for application metrics
resource "aws_cloudwatch_log_stream" "aggregation_stream" {
  name           = "aggregation-main"
  log_group_name = aws_cloudwatch_log_group.aggregation_logs.name
}