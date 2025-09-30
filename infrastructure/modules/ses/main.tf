# SES module for Urban Blue Zone email notifications
variable "resource_prefix" {
  type        = string
  description = "Prefix for resource naming"
}

variable "from_email" {
  type        = string
  description = "Verified email address to send notifications from"
}

variable "domain" {
  type        = string
  description = "Domain for SES verification"
  default     = ""
}

variable "tags" {
  type        = map(string)
  default     = {}
  description = "Tags to apply to resources"
}

# Email identity for sending
resource "aws_ses_email_identity" "main" {
  email = var.from_email
}

# Domain identity (if domain provided)
resource "aws_ses_domain_identity" "main" {
  count  = var.domain != "" ? 1 : 0
  domain = var.domain
}

# Configuration set for tracking
resource "aws_ses_configuration_set" "main" {
  name = "${var.resource_prefix}-config-set"

  reputation_metrics_enabled = true
}

# Event destination for tracking
resource "aws_ses_event_destination" "cloudwatch" {
  name                   = "${var.resource_prefix}-cloudwatch"
  configuration_set_name = aws_ses_configuration_set.main.name
  enabled                = true
  matching_types         = ["send", "delivery", "bounce", "complaint"]

  cloudwatch_destination {
    default_value  = "default"
    dimension_name = "MessageTag"
    value_source   = "messageTag"
  }
}

# Email templates
resource "aws_ses_template" "critical_alert" {
  name    = "${var.resource_prefix}-critical-alert"
  subject = "CRITICAL: Urban Blue Zone Health Alert - {{alert_type}}"
  html    = file("${path.module}/../../../backend/alerts/templates/critical-alert.html")
  text    = <<-EOT
    CRITICAL HEALTH ALERT

    Alert Time: $${timestamp}
    Resident ID: $${resident_id}
    Alert Type: $${alert_type}

    Current Vital Signs: $${vital_signs}

    IMMEDIATE ACTIONS REQUIRED:
    - Contact resident immediately to assess condition
    - Review recent vital trends in dashboard
    - Consider emergency services if unable to reach resident
    - Document intervention in care notes

    Alert ID: $${alert_id}

    View Full Dashboard: $${dashboard_url}

    This is an automated alert from Urban Blue Zone Monitoring System
  EOT
}

resource "aws_ses_template" "wellness_nudge" {
  name    = "${var.resource_prefix}-wellness-nudge"
  subject = "Your Urban Blue Zone Wellness Update"
  html    = file("${path.module}/../../../backend/alerts/templates/wellness-nudge.html")
  text    = <<-EOT
    Your Wellness Update
    Urban Blue Zone Weekly Summary

    Hello! Here's your wellness summary for $${resident_name} (ID: $${resident_id})
    Week of: $${week_start} - $${week_end}

    Your Urban Blue Zone Index: $${ubzi_score}
    $${trend_direction} $${trend_amount} points from last week

    Your Blue Zone Habits:
    - Move Naturally: $${movement_score}/100
    - Downshift: $${stress_score}/100
    - Plant Slant: $${plant_score}/100
    - Right Tribe: $${social_score}/100
    - Purpose: $${purpose_score}/100

    Community Resources:
    - Walking Groups: $${walking_group_url}
    - Stress Management: $${stress_management_url}
    - Nutrition Guides: $${nutrition_url}
    - Social Events: $${social_events_url}

    Keep up the great work on your wellness journey!

    View Full Dashboard: $${dashboard_url}
    Update Preferences: $${preferences_url}

    Urban Blue Zone Monitoring System
  EOT
}

resource "aws_ses_template" "daily_summary" {
  name    = "${var.resource_prefix}-daily-summary"
  subject = "Daily Summary - Urban Blue Zone"
  html    = <<-HTML
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; }
            .header { background: #667eea; color: white; padding: 20px; }
            .content { padding: 20px; }
            .metric { display: inline-block; margin: 10px; padding: 10px; background: #f4f4f4; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Daily Urban Blue Zone Summary</h1>
        </div>
        <div class="content">
            <h2>{{date}}</h2>
            <div class="metric">
                <strong>Average UBZI:</strong> {{avg_ubzi}}
            </div>
            <div class="metric">
                <strong>Total Alerts:</strong> {{total_alerts}}
            </div>
            <div class="metric">
                <strong>Critical Alerts:</strong> {{critical_alerts}}
            </div>
            <p>View detailed dashboard: {{dashboard_url}}</p>
        </div>
    </body>
    </html>
  HTML
  text = <<-EOT
    Daily Urban Blue Zone Summary
    
    Date: {{date}}
    
    Average UBZI: {{avg_ubzi}}
    Total Alerts: {{total_alerts}}
    Critical Alerts: {{critical_alerts}}
    
    View detailed dashboard: {{dashboard_url}}
  EOT
}

# IAM role for SES sending
resource "aws_iam_role" "ses_sending" {
  name = "${var.resource_prefix}-ses-sending-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ses.amazonaws.com"
        }
      }
    ]
  })
  
  tags = var.tags
}

# IAM policy for SES sending
resource "aws_iam_role_policy" "ses_sending" {
  name = "${var.resource_prefix}-ses-sending-policy"
  role = aws_iam_role.ses_sending.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendTemplatedEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      }
    ]
  })
}

# CloudWatch log group for SES events
resource "aws_cloudwatch_log_group" "ses_events" {
  name              = "/aws/ses/${var.resource_prefix}"
  retention_in_days = 7
  tags              = var.tags
}

# Outputs
output "from_email" {
  value       = aws_ses_email_identity.main.email
  description = "Verified from email address"
}

output "configuration_set_name" {
  value       = aws_ses_configuration_set.main.name
  description = "SES configuration set name"
}

output "critical_alert_template" {
  value       = aws_ses_template.critical_alert.name
  description = "Critical alert email template name"
}

output "wellness_nudge_template" {
  value       = aws_ses_template.wellness_nudge.name
  description = "Wellness nudge email template name"
}

output "daily_summary_template" {
  value       = aws_ses_template.daily_summary.name
  description = "Daily summary email template name"
}