# Residents Table
resource "aws_dynamodb_table" "residents" {
  name           = "${var.resource_prefix}-residents"
  billing_mode   = var.billing_mode
  hash_key       = "resident_id"
  
  attribute {
    name = "resident_id"
    type = "S"
  }
  
  attribute {
    name = "cohort"
    type = "S"
  }
  
  attribute {
    name = "neighborhood"
    type = "S"
  }
  
  global_secondary_index {
    name            = "cohort-index"
    hash_key        = "cohort"
    projection_type = "ALL"
  }
  
  global_secondary_index {
    name            = "neighborhood-index"
    hash_key        = "neighborhood"
    projection_type = "ALL"
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  tags = merge(var.tags, {
    Name = "${var.resource_prefix}-residents"
  })
}

# Vitals Table
resource "aws_dynamodb_table" "vitals" {
  name           = "${var.resource_prefix}-vitals"
  billing_mode   = var.billing_mode
  hash_key       = "resident_id"
  range_key      = "timestamp"
  
  attribute {
    name = "resident_id"
    type = "S"
  }
  
  attribute {
    name = "timestamp"
    type = "N"
  }
  
  attribute {
    name = "status"
    type = "S"
  }
  
  global_secondary_index {
    name            = "status-timestamp-index"
    hash_key        = "status"
    range_key       = "timestamp"
    projection_type = "ALL"
  }
  
  ttl {
    enabled        = true
    attribute_name = "ttl"
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  tags = merge(var.tags, {
    Name = "${var.resource_prefix}-vitals"
  })
}

# Check-ins Table
resource "aws_dynamodb_table" "checkins" {
  name           = "${var.resource_prefix}-checkins"
  billing_mode   = var.billing_mode
  hash_key       = "resident_id"
  range_key      = "timestamp"
  
  attribute {
    name = "resident_id"
    type = "S"
  }
  
  attribute {
    name = "timestamp"
    type = "N"
  }
  
  ttl {
    enabled        = true
    attribute_name = "ttl"
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  tags = merge(var.tags, {
    Name = "${var.resource_prefix}-checkins"
  })
}

# Alerts Table
resource "aws_dynamodb_table" "alerts" {
  name           = "${var.resource_prefix}-alerts"
  billing_mode   = var.billing_mode
  hash_key       = "resident_id"
  range_key      = "timestamp"
  
  attribute {
    name = "resident_id"
    type = "S"
  }
  
  attribute {
    name = "timestamp"
    type = "N"
  }
  
  attribute {
    name = "severity"
    type = "S"
  }
  
  attribute {
    name = "type"
    type = "S"
  }
  
  global_secondary_index {
    name            = "severity-timestamp-index"
    hash_key        = "severity"
    range_key       = "timestamp"
    projection_type = "ALL"
  }
  
  global_secondary_index {
    name            = "type-timestamp-index"
    hash_key        = "type"
    range_key       = "timestamp"
    projection_type = "ALL"
  }
  
  ttl {
    enabled        = true
    attribute_name = "ttl"
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  tags = merge(var.tags, {
    Name = "${var.resource_prefix}-alerts"
  })
}

# Aggregations Table
resource "aws_dynamodb_table" "aggregations" {
  name           = "${var.resource_prefix}-aggregations"
  billing_mode   = var.billing_mode
  hash_key       = "agg_key"
  range_key      = "metric"
  
  attribute {
    name = "agg_key"
    type = "S"
  }
  
  attribute {
    name = "metric"
    type = "S"
  }
  
  ttl {
    enabled        = true
    attribute_name = "ttl"
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  tags = merge(var.tags, {
    Name = "${var.resource_prefix}-aggregations"
  })
}

# Alert Deduplication Table
resource "aws_dynamodb_table" "alert_dedup" {
  name           = "${var.resource_prefix}-alert-dedup"
  billing_mode   = var.billing_mode
  hash_key       = "alert_key"
  range_key      = "window_start"
  
  attribute {
    name = "alert_key"
    type = "S"
  }
  
  attribute {
    name = "window_start"
    type = "S"
  }
  
  ttl {
    enabled        = true
    attribute_name = "ttl"
  }
  
  tags = merge(var.tags, {
    Name = "${var.resource_prefix}-alert-dedup"
  })
}