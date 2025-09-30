# Urban Blue Zone - Terraform Backend Bootstrap Script
# This script creates the S3 bucket and DynamoDB table for Terraform state management

param(
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-1",

    [Parameter(Mandatory=$false)]
    [string]$BucketName = "ubz-terraform-state-378664616416",

    [Parameter(Mandatory=$false)]
    [string]$DynamoDBTable = "ubz-terraform-locks"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Terraform Backend Bootstrap" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Region: $Region" -ForegroundColor White
Write-Host "S3 Bucket: $BucketName" -ForegroundColor White
Write-Host "DynamoDB Table: $DynamoDBTable" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan

# Check AWS CLI
Write-Host "Checking AWS CLI configuration..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity --output json | ConvertFrom-Json
    Write-Host "  AWS Account: $($identity.Account)" -ForegroundColor Green
    Write-Host "  AWS User: $($identity.Arn)" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: AWS CLI not configured or credentials invalid" -ForegroundColor Red
    exit 1
}

# Create S3 bucket for Terraform state
Write-Host "`nCreating S3 bucket for Terraform state..." -ForegroundColor Yellow

$bucketExists = aws s3 ls "s3://$BucketName" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  S3 bucket already exists: $BucketName" -ForegroundColor Green
} else {
    Write-Host "  Creating S3 bucket: $BucketName" -ForegroundColor White

    if ($Region -eq "us-east-1") {
        aws s3api create-bucket --bucket $BucketName --region $Region
    } else {
        aws s3api create-bucket --bucket $BucketName --region $Region --create-bucket-configuration LocationConstraint=$Region
    }

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  S3 bucket created successfully" -ForegroundColor Green
    } else {
        Write-Host "  ERROR: Failed to create S3 bucket" -ForegroundColor Red
        exit 1
    }
}

# Enable versioning on S3 bucket
Write-Host "`nEnabling versioning on S3 bucket..." -ForegroundColor Yellow
aws s3api put-bucket-versioning --bucket $BucketName --versioning-configuration Status=Enabled --region $Region

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Versioning enabled successfully" -ForegroundColor Green
} else {
    Write-Host "  WARNING: Failed to enable versioning" -ForegroundColor Yellow
}

# Enable encryption on S3 bucket
Write-Host "`nEnabling encryption on S3 bucket..." -ForegroundColor Yellow
$encryptionConfig = @'
{
    "Rules": [
        {
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            },
            "BucketKeyEnabled": true
        }
    ]
}
'@

$encryptionConfig | aws s3api put-bucket-encryption --bucket $BucketName --server-side-encryption-configuration file:///dev/stdin --region $Region 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Encryption enabled successfully" -ForegroundColor Green
} else {
    Write-Host "  WARNING: Failed to enable encryption" -ForegroundColor Yellow
}

# Block public access
Write-Host "`nBlocking public access to S3 bucket..." -ForegroundColor Yellow
aws s3api put-public-access-block --bucket $BucketName --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true --region $Region 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Public access blocked successfully" -ForegroundColor Green
} else {
    Write-Host "  WARNING: Failed to block public access" -ForegroundColor Yellow
}

# Create DynamoDB table for state locking
Write-Host "`nCreating DynamoDB table for state locking..." -ForegroundColor Yellow

$tableExists = aws dynamodb describe-table --table-name $DynamoDBTable --region $Region 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  DynamoDB table already exists: $DynamoDBTable" -ForegroundColor Green
} else {
    Write-Host "  Creating DynamoDB table: $DynamoDBTable" -ForegroundColor White

    aws dynamodb create-table `
        --table-name $DynamoDBTable `
        --attribute-definitions AttributeName=LockID,AttributeType=S `
        --key-schema AttributeName=LockID,KeyType=HASH `
        --billing-mode PAY_PER_REQUEST `
        --region $Region `
        --tags Key=Project,Value=UrbanBlueZone Key=Purpose,Value=TerraformStateLock

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  DynamoDB table created successfully" -ForegroundColor Green
        Write-Host "  Waiting for table to become active..." -ForegroundColor White
        aws dynamodb wait table-exists --table-name $DynamoDBTable --region $Region
        Write-Host "  Table is now active" -ForegroundColor Green
    } else {
        Write-Host "  ERROR: Failed to create DynamoDB table" -ForegroundColor Red
        exit 1
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Bootstrap Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nTerraform backend resources:" -ForegroundColor White
Write-Host "  S3 Bucket: $BucketName" -ForegroundColor Green
Write-Host "  DynamoDB Table: $DynamoDBTable" -ForegroundColor Green
Write-Host "  Region: $Region" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor White
Write-Host "  1. Update infrastructure/providers.tf with bucket name" -ForegroundColor Yellow
Write-Host "  2. Create infrastructure/terraform.tfvars" -ForegroundColor Yellow
Write-Host "  3. Run: cd infrastructure && terraform init" -ForegroundColor Yellow
Write-Host "  4. Run: terraform plan" -ForegroundColor Yellow
Write-Host "  5. Run: terraform apply" -ForegroundColor Yellow
Write-Host "`n========================================`n" -ForegroundColor Cyan
