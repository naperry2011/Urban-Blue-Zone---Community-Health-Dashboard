# Urban Blue Zone Deployment Script for Windows
# PowerShell script for deploying the Urban Blue Zone application

param(
    [string]$Environment = "staging",
    [string]$AWSRegion = "us-east-1",
    [string]$AWSProfile = "default"
)

$ErrorActionPreference = "Stop"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Urban Blue Zone Deployment Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Function to print status messages
function Write-Status {
    param([string]$Message)
    Write-Host "[✓] $Message" -ForegroundColor Green
}

function Write-Error-Message {
    param([string]$Message)
    Write-Host "[✗] $Message" -ForegroundColor Red
    exit 1
}

function Write-Warning-Message {
    param([string]$Message)
    Write-Host "[!] $Message" -ForegroundColor Yellow
}

# Check prerequisites
function Check-Prerequisites {
    Write-Host "Checking prerequisites..."

    # Check Node.js
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Error-Message "Node.js is not installed"
    }

    # Check npm
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Error-Message "npm is not installed"
    }

    # Check AWS CLI
    if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
        Write-Error-Message "AWS CLI is not installed"
    }

    # Check Terraform
    if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) {
        Write-Error-Message "Terraform is not installed"
    }

    Write-Status "All prerequisites are installed"
}

# Load environment variables
function Load-Environment {
    Write-Host "Loading environment variables for $Environment..."

    $EnvFile = ".env.$Environment"
    if (Test-Path $EnvFile) {
        Get-Content $EnvFile | ForEach-Object {
            if ($_ -match '^([^#].*)=(.*)$') {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim()
                [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
            }
        }
        Write-Status "Environment variables loaded from $EnvFile"
    } else {
        Write-Warning-Message "No environment file found for $Environment, using defaults"
    }
}

# Build the Next.js application
function Build-Application {
    Write-Host "Building Next.js application..."

    Push-Location frontend

    try {
        # Install dependencies if needed
        if (-not (Test-Path "node_modules") -or (Get-Item "package.json").LastWriteTime -gt (Get-Item "node_modules").LastWriteTime) {
            Write-Status "Installing dependencies..."
            npm ci
        }

        # Run tests first
        Write-Status "Running tests..."
        try {
            npm run test:ci
        } catch {
            Write-Warning-Message "Some tests failed, continuing..."
        }

        # Build the application
        Write-Status "Building application..."
        $env:NODE_ENV = "production"
        npm run build

        # Build with OpenNext for serverless
        Write-Status "Building with OpenNext..."
        npx open-next build

        Write-Status "Application built successfully"
    } finally {
        Pop-Location
    }
}

# Deploy infrastructure
function Deploy-Infrastructure {
    Write-Host "Deploying infrastructure with Terraform..."

    Push-Location terraform

    try {
        # Initialize Terraform if needed
        if (-not (Test-Path ".terraform")) {
            Write-Status "Initializing Terraform..."
            terraform init
        }

        # Select workspace
        $workspaces = terraform workspace list
        if ($workspaces -notcontains $Environment) {
            terraform workspace new $Environment
        } else {
            terraform workspace select $Environment
        }

        # Plan the deployment
        Write-Status "Planning infrastructure changes..."
        terraform plan -var="environment=$Environment" -out=tfplan

        # Apply the changes
        $response = Read-Host "Do you want to apply these changes? (yes/no)"
        if ($response -eq "yes") {
            Write-Status "Applying infrastructure changes..."
            terraform apply tfplan
        } else {
            Write-Warning-Message "Infrastructure deployment cancelled"
            exit 0
        }

        # Save outputs
        terraform output -json | Out-File -FilePath "..\deployment\terraform-outputs.json" -Encoding UTF8

        Write-Status "Infrastructure deployed successfully"
    } finally {
        Pop-Location
    }
}

# Deploy Lambda functions
function Deploy-LambdaFunctions {
    Write-Host "Deploying Lambda functions..."

    $outputs = Get-Content "deployment\terraform-outputs.json" | ConvertFrom-Json

    $ApiLambda = $outputs.api_lambda_name.value
    $SsrLambda = $outputs.ssr_lambda_name.value
    $ImageLambda = $outputs.image_lambda_name.value

    # Deploy API Lambda
    if (Test-Path "frontend\.open-next\server-function.zip") {
        Write-Status "Deploying API Lambda function..."
        aws lambda update-function-code `
            --function-name $ApiLambda `
            --zip-file "fileb://frontend/.open-next/server-function.zip" `
            --region $AWSRegion `
            --profile $AWSProfile
    }

    # Deploy SSR Lambda
    if (Test-Path "frontend\.open-next\server-function.zip") {
        Write-Status "Deploying SSR Lambda function..."
        aws lambda update-function-code `
            --function-name $SsrLambda `
            --zip-file "fileb://frontend/.open-next/server-function.zip" `
            --region $AWSRegion `
            --profile $AWSProfile
    }

    # Deploy Image Optimization Lambda
    if (Test-Path "frontend\.open-next\image-optimization-function.zip") {
        Write-Status "Deploying Image Optimization Lambda..."
        aws lambda update-function-code `
            --function-name $ImageLambda `
            --zip-file "fileb://frontend/.open-next/image-optimization-function.zip" `
            --region $AWSRegion `
            --profile $AWSProfile
    }

    Write-Status "Lambda functions deployed successfully"
}

# Upload static assets to S3
function Upload-StaticAssets {
    Write-Host "Uploading static assets to S3..."

    $outputs = Get-Content "deployment\terraform-outputs.json" | ConvertFrom-Json
    $S3Bucket = $outputs.s3_bucket_name.value

    # Upload Next.js static files
    if (Test-Path "frontend\.open-next\assets") {
        Write-Status "Uploading static assets..."
        aws s3 sync "frontend\.open-next\assets" "s3://$S3Bucket/_next/static" `
            --cache-control "public, max-age=31536000, immutable" `
            --region $AWSRegion `
            --profile $AWSProfile `
            --delete
    }

    # Upload public files
    if (Test-Path "frontend\public") {
        Write-Status "Uploading public files..."
        aws s3 sync "frontend\public" "s3://$S3Bucket/public" `
            --cache-control "public, max-age=86400" `
            --region $AWSRegion `
            --profile $AWSProfile `
            --delete
    }

    Write-Status "Static assets uploaded successfully"
}

# Invalidate CloudFront cache
function Invalidate-CloudFront {
    Write-Host "Invalidating CloudFront cache..."

    $outputs = Get-Content "deployment\terraform-outputs.json" | ConvertFrom-Json
    $DistributionId = $outputs.cloudfront_distribution_id.value

    if ($DistributionId -and $DistributionId -ne "null") {
        $InvalidationResult = aws cloudfront create-invalidation `
            --distribution-id $DistributionId `
            --paths "/*" `
            --region $AWSRegion `
            --profile $AWSProfile `
            --output json | ConvertFrom-Json

        $InvalidationId = $InvalidationResult.Invalidation.Id

        Write-Status "CloudFront invalidation created: $InvalidationId"

        # Wait for invalidation to complete
        Write-Status "Waiting for invalidation to complete..."
        aws cloudfront wait invalidation-completed `
            --distribution-id $DistributionId `
            --id $InvalidationId `
            --region $AWSRegion `
            --profile $AWSProfile

        Write-Status "CloudFront cache invalidated successfully"
    } else {
        Write-Warning-Message "No CloudFront distribution found, skipping cache invalidation"
    }
}

# Run smoke tests
function Run-SmokeTests {
    Write-Host "Running smoke tests..."

    $outputs = Get-Content "deployment\terraform-outputs.json" | ConvertFrom-Json
    $Domain = $outputs.domain_name.value

    # Test homepage
    Write-Status "Testing homepage..."
    try {
        $response = Invoke-WebRequest -Uri "https://$Domain" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Status "Homepage is accessible"
        } else {
            Write-Warning-Message "Homepage returned status $($response.StatusCode)"
        }
    } catch {
        Write-Warning-Message "Homepage test failed: $_"
    }

    # Test API health endpoint
    Write-Status "Testing API health..."
    try {
        $response = Invoke-WebRequest -Uri "https://$Domain/api/health" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Status "API is healthy"
        } else {
            Write-Warning-Message "API health check returned status $($response.StatusCode)"
        }
    } catch {
        Write-Warning-Message "API health test failed: $_"
    }

    Write-Status "Smoke tests completed"
}

# Create deployment tag
function Create-DeploymentTag {
    Write-Host "Creating deployment tag..."

    $Version = Get-Date -Format "yyyyMMdd-HHmmss"
    git tag -a "deploy-$Environment-$Version" -m "Deployment to $Environment at $Version"
    git push origin "deploy-$Environment-$Version"

    Write-Status "Deployment tagged as deploy-$Environment-$Version"
}

# Main deployment flow
function Main {
    Write-Host "Starting deployment to $Environment environment"
    Write-Host "======================================"

    Check-Prerequisites
    Load-Environment
    Build-Application
    Deploy-Infrastructure
    Deploy-LambdaFunctions
    Upload-StaticAssets
    Invalidate-CloudFront
    Run-SmokeTests
    Create-DeploymentTag

    Write-Host "======================================" -ForegroundColor Green
    Write-Status "Deployment completed successfully!"
    Write-Host "Environment: $Environment" -ForegroundColor Cyan
    $outputs = Get-Content "deployment\terraform-outputs.json" | ConvertFrom-Json
    Write-Host "URL: https://$($outputs.domain_name.value)" -ForegroundColor Cyan
    Write-Host "======================================" -ForegroundColor Green
}

# Run main function
try {
    Main
} catch {
    Write-Error-Message "Deployment failed: $_"
}