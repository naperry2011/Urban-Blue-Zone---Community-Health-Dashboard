resource "aws_cognito_user_pool" "main" {
  name = "${var.resource_prefix}-users"
  
  auto_verified_attributes = ["email"]
  
  username_attributes = ["email"]
  
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }
  
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }
  
  user_attribute_update_settings {
    attributes_require_verification_before_update = ["email"]
  }
  
  schema {
    attribute_data_type = "String"
    name               = "email"
    required           = true
    mutable            = true
    
    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }
  
  schema {
    attribute_data_type = "String"
    name               = "name"
    required           = false
    mutable            = true
    
    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }
  
  schema {
    attribute_data_type = "String"
    name               = "role"
    required           = false
    mutable            = true
    
    string_attribute_constraints {
      min_length = 1
      max_length = 50
    }
  }
  
  tags = var.tags
}

resource "aws_cognito_user_pool_client" "main" {
  name         = "${var.resource_prefix}-client"
  user_pool_id = aws_cognito_user_pool.main.id
  
  generate_secret = true
  
  allowed_oauth_flows = ["code"]
  allowed_oauth_scopes = ["email", "openid", "profile"]
  allowed_oauth_flows_user_pool_client = true
  
  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls
  
  supported_identity_providers = ["COGNITO"]
  
  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]
  
  read_attributes = [
    "email",
    "email_verified",
    "name",
    "custom:role"
  ]
  
  write_attributes = [
    "email",
    "name",
    "custom:role"
  ]
  
  prevent_user_existence_errors = "ENABLED"
  
  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }
  
  access_token_validity  = 1
  id_token_validity      = 1
  refresh_token_validity = 30
}

resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.resource_prefix}-auth"
  user_pool_id = aws_cognito_user_pool.main.id
}

# Create default admin user group
resource "aws_cognito_user_group" "admin" {
  name         = "admin"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Admin users with full access"
  precedence   = 1
}

# Create caregiver user group
resource "aws_cognito_user_group" "caregiver" {
  name         = "caregiver"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Caregivers with resident access"
  precedence   = 2
}

# Create viewer user group
resource "aws_cognito_user_group" "viewer" {
  name         = "viewer"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Viewers with read-only access"
  precedence   = 3
}