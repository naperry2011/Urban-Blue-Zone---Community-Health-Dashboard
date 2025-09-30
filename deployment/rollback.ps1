# Urban Blue Zone Rollback Script
# Emergency rollback procedure for the Urban Blue Zone application

param(
    [Parameter(Mandatory=$true)]
    [string]$RollbackTag,
    [string]$Environment = "staging",
    [string]$AWSRegion = "us-east-1",
    [string]$AWSProfile = "default"
)

$ErrorActionPreference = "Stop"

Write-Host "======================================" -ForegroundColor Red
Write-Host "Urban Blue Zone ROLLBACK Script" -ForegroundColor Red
Write-Host "======================================" -ForegroundColor Red

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

# Verify rollback tag exists
function Verify-RollbackTag {
    Write-Host "Verifying rollback tag: $RollbackTag"

    $tags = git tag -l $RollbackTag
    if (-not $tags) {
        Write-Error-Message "Tag $RollbackTag does not exist"
    }

    Write-Status "Tag $RollbackTag found"
}

# Backup current state
function Backup-CurrentState {
    Write-Host "Backing up current state..."

    $BackupDir = "deployment\backups\$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null

    # Backup Terraform state
    if (Test-Path "terraform\terraform.tfstate") {
        Copy-Item "terraform\terraform.tfstate" "$BackupDir\terraform.tfstate.backup"
        Write-Status "Terraform state backed up"
    }

    # Backup current Lambda function versions
    $outputs = Get-Content "deployment\terraform-outputs.json" | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($outputs) {
        $outputs | ConvertTo-Json | Out-File "$BackupDir\terraform-outputs.backup.json"
        Write-Status "Current configuration backed up"
    }

    Write-Status "Current state backed up to $BackupDir"
    return $BackupDir
}

# Checkout rollback version
function Checkout-RollbackVersion {
    Write-Host "Checking out rollback version..."

    git checkout $RollbackTag

    if ($LASTEXITCODE -ne 0) {
        Write-Error-Message "Failed to checkout tag $RollbackTag"
    }

    Write-Status "Checked out version $RollbackTag"
}

# Rebuild application
function Rebuild-Application {
    Write-Host "Rebuilding application from rollback version..."

    Push-Location frontend

    try {
        # Clean install dependencies
        Write-Status "Installing dependencies..."
        Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
        npm ci

        # Build application
        Write-Status "Building application..."
        $env:NODE_ENV = "production"
        npm run build

        # Build with OpenNext
        Write-Status "Building with OpenNext..."
        npx open-next build

        Write-Status "Application rebuilt successfully"
    } finally {
        Pop-Location
    }
}

# Deploy rollback version
function Deploy-RollbackVersion {
    param([string]$BackupDir)

    Write-Host "Deploying rollback version..."

    $outputs = Get-Content "deployment\terraform-outputs.json" | ConvertFrom-Json -ErrorAction SilentlyContinue
    if (-not $outputs) {
        # Try to use backup
        $outputs = Get-Content "$BackupDir\terraform-outputs.backup.json" | ConvertFrom-Json
    }

    # Deploy Lambda functions
    $ApiLambda = $outputs.api_lambda_name.value
    $SsrLambda = $outputs.ssr_lambda_name.value
    $ImageLambda = $outputs.image_lambda_name.value

    if (Test-Path "frontend\.open-next\server-function.zip") {
        Write-Status "Rolling back API Lambda..."
        aws lambda update-function-code `
            --function-name $ApiLambda `
            --zip-file "fileb://frontend/.open-next/server-function.zip" `
            --region $AWSRegion `
            --profile $AWSProfile

        Write-Status "Rolling back SSR Lambda..."
        aws lambda update-function-code `
            --function-name $SsrLambda `
            --zip-file "fileb://frontend/.open-next/server-function.zip" `
            --region $AWSRegion `
            --profile $AWSProfile
    }

    if (Test-Path "frontend\.open-next\image-optimization-function.zip") {
        Write-Status "Rolling back Image Lambda..."
        aws lambda update-function-code `
            --function-name $ImageLambda `
            --zip-file "fileb://frontend/.open-next/image-optimization-function.zip" `
            --region $AWSRegion `
            --profile $AWSProfile
    }

    # Upload static assets
    $S3Bucket = $outputs.s3_bucket_name.value

    if (Test-Path "frontend\.open-next\assets") {
        Write-Status "Rolling back static assets..."
        aws s3 sync "frontend\.open-next\assets" "s3://$S3Bucket/_next/static" `
            --cache-control "public, max-age=31536000, immutable" `
            --region $AWSRegion `
            --profile $AWSProfile `
            --delete
    }

    if (Test-Path "frontend\public") {
        Write-Status "Rolling back public files..."
        aws s3 sync "frontend\public" "s3://$S3Bucket/public" `
            --cache-control "public, max-age=86400" `
            --region $AWSRegion `
            --profile $AWSProfile `
            --delete
    }

    Write-Status "Rollback deployment completed"
}

# Invalidate CloudFront
function Invalidate-CloudFrontCache {
    param([string]$BackupDir)

    Write-Host "Invalidating CloudFront cache..."

    $outputs = Get-Content "deployment\terraform-outputs.json" | ConvertFrom-Json -ErrorAction SilentlyContinue
    if (-not $outputs) {
        $outputs = Get-Content "$BackupDir\terraform-outputs.backup.json" | ConvertFrom-Json
    }

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

        # Don't wait for completion during rollback
        Write-Warning-Message "CloudFront cache invalidation initiated (not waiting for completion)"
    }
}

# Verify rollback success
function Verify-RollbackSuccess {
    param([string]$BackupDir)

    Write-Host "Verifying rollback success..."

    $outputs = Get-Content "deployment\terraform-outputs.json" | ConvertFrom-Json -ErrorAction SilentlyContinue
    if (-not $outputs) {
        $outputs = Get-Content "$BackupDir\terraform-outputs.backup.json" | ConvertFrom-Json
    }

    $Domain = $outputs.domain_name.value

    # Quick health check
    try {
        $response = Invoke-WebRequest -Uri "https://$Domain" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Status "Site is responding after rollback"
        } else {
            Write-Warning-Message "Site returned status $($response.StatusCode)"
        }
    } catch {
        Write-Warning-Message "Could not verify site status: $_"
    }

    Write-Status "Rollback verification complete"
}

# Create rollback tag
function Create-RollbackTag {
    Write-Host "Creating rollback record..."

    $RollbackVersion = Get-Date -Format "yyyyMMdd-HHmmss"
    $TagName = "rollback-$Environment-$RollbackVersion"

    git tag -a $TagName -m "Rollback to $RollbackTag at $RollbackVersion"

    Write-Status "Rollback recorded as $TagName"
}

# Main rollback flow
function Main {
    Write-Host "======================================" -ForegroundColor Red
    Write-Host "INITIATING ROLLBACK TO: $RollbackTag" -ForegroundColor Red
    Write-Host "Environment: $Environment" -ForegroundColor Yellow
    Write-Host "======================================" -ForegroundColor Red

    # Confirm rollback
    Write-Warning-Message "This will rollback to version $RollbackTag"
    $response = Read-Host "Are you sure you want to proceed? Type 'ROLLBACK' to confirm"

    if ($response -ne "ROLLBACK") {
        Write-Warning-Message "Rollback cancelled"
        exit 0
    }

    $BackupDir = Backup-CurrentState
    Verify-RollbackTag
    Checkout-RollbackVersion
    Rebuild-Application
    Deploy-RollbackVersion -BackupDir $BackupDir
    Invalidate-CloudFrontCache -BackupDir $BackupDir
    Verify-RollbackSuccess -BackupDir $BackupDir
    Create-RollbackTag

    Write-Host "======================================" -ForegroundColor Yellow
    Write-Status "ROLLBACK COMPLETED"
    Write-Host "Rolled back to: $RollbackTag" -ForegroundColor Yellow
    Write-Host "Backup saved to: $BackupDir" -ForegroundColor Yellow
    Write-Host "======================================" -ForegroundColor Yellow

    Write-Warning-Message "Please monitor the application closely!"
    Write-Warning-Message "If issues persist, contact the on-call team immediately."
}

# Run main function
try {
    Main
} catch {
    Write-Error-Message "Rollback failed: $_"
    Write-Warning-Message "Manual intervention may be required!"
    Write-Warning-Message "Check backup directory for saved state"
}