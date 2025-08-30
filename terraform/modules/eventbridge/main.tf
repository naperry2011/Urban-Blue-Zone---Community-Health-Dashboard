# EventBridge (CloudWatch Events) for scheduled tasks

# Hourly aggregation rule
resource "aws_cloudwatch_event_rule" "hourly_aggregation" {
  name                = "${var.project_name}-hourly-aggregation"
  description         = "Trigger hourly data aggregation"
  schedule_expression = "rate(1 hour)"
  
  tags = var.tags
}

# Daily aggregation rule (runs at midnight UTC)
resource "aws_cloudwatch_event_rule" "daily_aggregation" {
  name                = "${var.project_name}-daily-aggregation"
  description         = "Trigger daily data rollup and summary"
  schedule_expression = "cron(0 0 * * ? *)"
  
  tags = var.tags
}

# Weekly report rule (runs Sunday at 2 AM UTC)
resource "aws_cloudwatch_event_rule" "weekly_report" {
  name                = "${var.project_name}-weekly-report"
  description         = "Generate weekly wellness reports"
  schedule_expression = "cron(0 2 ? * SUN *)"
  
  tags = var.tags
}

# Real-time aggregation rule (every 15 minutes for dashboard updates)
resource "aws_cloudwatch_event_rule" "realtime_aggregation" {
  name                = "${var.project_name}-realtime-aggregation"
  description         = "Update real-time metrics for dashboard"
  schedule_expression = "rate(15 minutes)"
  
  tags = var.tags
}

# Target Lambda for hourly aggregation
resource "aws_cloudwatch_event_target" "hourly_aggregation_lambda" {
  rule      = aws_cloudwatch_event_rule.hourly_aggregation.name
  target_id = "AggregatorLambdaHourly"
  arn       = var.aggregator_lambda_arn
  
  input = jsonencode({
    aggregationType = "hourly"
    source          = "eventbridge.scheduler"
  })
}

# Target Lambda for daily aggregation
resource "aws_cloudwatch_event_target" "daily_aggregation_lambda" {
  rule      = aws_cloudwatch_event_rule.daily_aggregation.name
  target_id = "AggregatorLambdaDaily"
  arn       = var.aggregator_lambda_arn
  
  input = jsonencode({
    aggregationType = "daily"
    source          = "eventbridge.scheduler"
  })
}

# Target Lambda for weekly reports
resource "aws_cloudwatch_event_target" "weekly_report_lambda" {
  rule      = aws_cloudwatch_event_rule.weekly_report.name
  target_id = "AggregatorLambdaWeekly"
  arn       = var.aggregator_lambda_arn
  
  input = jsonencode({
    aggregationType = "weekly"
    source          = "eventbridge.scheduler"
  })
}

# Target Lambda for real-time aggregation
resource "aws_cloudwatch_event_target" "realtime_aggregation_lambda" {
  rule      = aws_cloudwatch_event_rule.realtime_aggregation.name
  target_id = "AggregatorLambdaRealtime"
  arn       = var.aggregator_lambda_arn
  
  input = jsonencode({
    aggregationType = "realtime"
    source          = "eventbridge.scheduler"
  })
}

# Lambda permissions for EventBridge to invoke
resource "aws_lambda_permission" "allow_eventbridge_hourly" {
  statement_id  = "AllowExecutionFromEventBridgeHourly"
  action        = "lambda:InvokeFunction"
  function_name = var.aggregator_lambda_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.hourly_aggregation.arn
}

resource "aws_lambda_permission" "allow_eventbridge_daily" {
  statement_id  = "AllowExecutionFromEventBridgeDaily"
  action        = "lambda:InvokeFunction"
  function_name = var.aggregator_lambda_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_aggregation.arn
}

resource "aws_lambda_permission" "allow_eventbridge_weekly" {
  statement_id  = "AllowExecutionFromEventBridgeWeekly"
  action        = "lambda:InvokeFunction"
  function_name = var.aggregator_lambda_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.weekly_report.arn
}

resource "aws_lambda_permission" "allow_eventbridge_realtime" {
  statement_id  = "AllowExecutionFromEventBridgeRealtime"
  action        = "lambda:InvokeFunction"
  function_name = var.aggregator_lambda_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.realtime_aggregation.arn
}

# Dead Letter Queue for failed invocations
resource "aws_sqs_queue" "eventbridge_dlq" {
  name                      = "${var.project_name}-eventbridge-dlq"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 1209600  # 14 days
  receive_wait_time_seconds = 10
  
  tags = var.tags
}

# CloudWatch Log Group for EventBridge errors
resource "aws_cloudwatch_log_group" "eventbridge_errors" {
  name              = "/aws/events/${var.project_name}/errors"
  retention_in_days = 7
  
  tags = var.tags
}

# EventBridge event bus (optional - for custom events)
resource "aws_cloudwatch_event_bus" "custom" {
  name = "${var.project_name}-custom-events"
  
  tags = var.tags
}

# Rule for custom UBZI threshold events
resource "aws_cloudwatch_event_rule" "ubzi_threshold" {
  name           = "${var.project_name}-ubzi-threshold"
  description    = "Trigger when UBZI crosses critical thresholds"
  event_bus_name = aws_cloudwatch_event_bus.custom.name
  
  event_pattern = jsonencode({
    source      = ["ubz.analytics"]
    detail-type = ["UBZI Threshold Alert"]
    detail = {
      ubzi = [{
        numeric = ["<", 40]
      }]
    }
  })
  
  tags = var.tags
}

# Archive for event replay capability
resource "aws_cloudwatch_event_archive" "aggregation_events" {
  name             = "${var.project_name}-aggregation-archive"
  event_source_arn = aws_cloudwatch_event_bus.custom.arn
  retention_days   = 7
  description      = "Archive of aggregation events for replay and debugging"
  
  event_pattern = jsonencode({
    source = ["ubz.aggregation", "ubz.analytics"]
  })
}