#!/bin/bash

# Urban Blue Zone Deployment Script
# This script handles the complete deployment process for the Urban Blue Zone application

set -e

echo "======================================"
echo "Urban Blue Zone Deployment Script"
echo "======================================"

# Configuration
ENVIRONMENT=${1:-staging}
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_PROFILE=${AWS_PROFILE:-default}

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
    exit 1
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
    fi

    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
    fi

    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed"
    fi

    # Check Terraform
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed"
    fi

    print_status "All prerequisites are installed"
}

# Load environment variables
load_environment() {
    echo "Loading environment variables for $ENVIRONMENT..."

    ENV_FILE=".env.$ENVIRONMENT"
    if [ -f "$ENV_FILE" ]; then
        export $(cat $ENV_FILE | grep -v '^#' | xargs)
        print_status "Environment variables loaded from $ENV_FILE"
    else
        print_warning "No environment file found for $ENVIRONMENT, using defaults"
    fi
}

# Build the Next.js application
build_application() {
    echo "Building Next.js application..."

    cd frontend

    # Install dependencies if needed
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        print_status "Installing dependencies..."
        npm ci
    fi

    # Run tests first
    print_status "Running tests..."
    npm run test:ci || print_warning "Some tests failed, continuing..."

    # Build the application
    print_status "Building application..."
    NODE_ENV=production npm run build

    # Build with OpenNext for serverless
    print_status "Building with OpenNext..."
    npx open-next build

    cd ..
    print_status "Application built successfully"
}

# Deploy infrastructure
deploy_infrastructure() {
    echo "Deploying infrastructure with Terraform..."

    cd terraform

    # Initialize Terraform if needed
    if [ ! -d ".terraform" ]; then
        print_status "Initializing Terraform..."
        terraform init
    fi

    # Select workspace
    terraform workspace select $ENVIRONMENT 2>/dev/null || terraform workspace new $ENVIRONMENT

    # Plan the deployment
    print_status "Planning infrastructure changes..."
    terraform plan -var="environment=$ENVIRONMENT" -out=tfplan

    # Apply the changes
    read -p "Do you want to apply these changes? (yes/no): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Applying infrastructure changes..."
        terraform apply tfplan
    else
        print_warning "Infrastructure deployment cancelled"
        exit 0
    fi

    # Save outputs
    terraform output -json > ../deployment/terraform-outputs.json

    cd ..
    print_status "Infrastructure deployed successfully"
}

# Deploy Lambda functions
deploy_lambda_functions() {
    echo "Deploying Lambda functions..."

    # Get Lambda function names from Terraform outputs
    API_LAMBDA=$(cat deployment/terraform-outputs.json | jq -r '.api_lambda_name.value')
    SSR_LAMBDA=$(cat deployment/terraform-outputs.json | jq -r '.ssr_lambda_name.value')
    IMAGE_LAMBDA=$(cat deployment/terraform-outputs.json | jq -r '.image_lambda_name.value')

    # Deploy API Lambda
    if [ -f "frontend/.open-next/server-function.zip" ]; then
        print_status "Deploying API Lambda function..."
        aws lambda update-function-code \
            --function-name $API_LAMBDA \
            --zip-file fileb://frontend/.open-next/server-function.zip \
            --region $AWS_REGION \
            --profile $AWS_PROFILE
    fi

    # Deploy SSR Lambda
    if [ -f "frontend/.open-next/server-function.zip" ]; then
        print_status "Deploying SSR Lambda function..."
        aws lambda update-function-code \
            --function-name $SSR_LAMBDA \
            --zip-file fileb://frontend/.open-next/server-function.zip \
            --region $AWS_REGION \
            --profile $AWS_PROFILE
    fi

    # Deploy Image Optimization Lambda
    if [ -f "frontend/.open-next/image-optimization-function.zip" ]; then
        print_status "Deploying Image Optimization Lambda..."
        aws lambda update-function-code \
            --function-name $IMAGE_LAMBDA \
            --zip-file fileb://frontend/.open-next/image-optimization-function.zip \
            --region $AWS_REGION \
            --profile $AWS_PROFILE
    fi

    print_status "Lambda functions deployed successfully"
}

# Upload static assets to S3
upload_static_assets() {
    echo "Uploading static assets to S3..."

    S3_BUCKET=$(cat deployment/terraform-outputs.json | jq -r '.s3_bucket_name.value')

    # Upload Next.js static files
    if [ -d "frontend/.open-next/assets" ]; then
        print_status "Uploading static assets..."
        aws s3 sync frontend/.open-next/assets s3://$S3_BUCKET/_next/static \
            --cache-control "public, max-age=31536000, immutable" \
            --region $AWS_REGION \
            --profile $AWS_PROFILE \
            --delete
    fi

    # Upload public files
    if [ -d "frontend/public" ]; then
        print_status "Uploading public files..."
        aws s3 sync frontend/public s3://$S3_BUCKET/public \
            --cache-control "public, max-age=86400" \
            --region $AWS_REGION \
            --profile $AWS_PROFILE \
            --delete
    fi

    print_status "Static assets uploaded successfully"
}

# Invalidate CloudFront cache
invalidate_cloudfront() {
    echo "Invalidating CloudFront cache..."

    DISTRIBUTION_ID=$(cat deployment/terraform-outputs.json | jq -r '.cloudfront_distribution_id.value')

    if [ "$DISTRIBUTION_ID" != "null" ] && [ -n "$DISTRIBUTION_ID" ]; then
        INVALIDATION_ID=$(aws cloudfront create-invalidation \
            --distribution-id $DISTRIBUTION_ID \
            --paths "/*" \
            --region $AWS_REGION \
            --profile $AWS_PROFILE \
            --query 'Invalidation.Id' \
            --output text)

        print_status "CloudFront invalidation created: $INVALIDATION_ID"

        # Wait for invalidation to complete (optional)
        print_status "Waiting for invalidation to complete..."
        aws cloudfront wait invalidation-completed \
            --distribution-id $DISTRIBUTION_ID \
            --id $INVALIDATION_ID \
            --region $AWS_REGION \
            --profile $AWS_PROFILE

        print_status "CloudFront cache invalidated successfully"
    else
        print_warning "No CloudFront distribution found, skipping cache invalidation"
    fi
}

# Run smoke tests
run_smoke_tests() {
    echo "Running smoke tests..."

    DOMAIN=$(cat deployment/terraform-outputs.json | jq -r '.domain_name.value')

    # Test homepage
    print_status "Testing homepage..."
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN)
    if [ $HTTP_STATUS -eq 200 ]; then
        print_status "Homepage is accessible"
    else
        print_warning "Homepage returned status $HTTP_STATUS"
    fi

    # Test API health endpoint
    print_status "Testing API health..."
    API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/health)
    if [ $API_STATUS -eq 200 ]; then
        print_status "API is healthy"
    else
        print_warning "API health check returned status $API_STATUS"
    fi

    print_status "Smoke tests completed"
}

# Create deployment tag
create_deployment_tag() {
    echo "Creating deployment tag..."

    VERSION=$(date +"%Y%m%d-%H%M%S")
    git tag -a "deploy-$ENVIRONMENT-$VERSION" -m "Deployment to $ENVIRONMENT at $VERSION"
    git push origin "deploy-$ENVIRONMENT-$VERSION"

    print_status "Deployment tagged as deploy-$ENVIRONMENT-$VERSION"
}

# Main deployment flow
main() {
    echo "Starting deployment to $ENVIRONMENT environment"
    echo "======================================"

    check_prerequisites
    load_environment
    build_application
    deploy_infrastructure
    deploy_lambda_functions
    upload_static_assets
    invalidate_cloudfront
    run_smoke_tests
    create_deployment_tag

    echo "======================================"
    print_status "Deployment completed successfully!"
    echo "Environment: $ENVIRONMENT"
    echo "URL: https://$(cat deployment/terraform-outputs.json | jq -r '.domain_name.value')"
    echo "======================================"
}

# Handle errors
trap 'print_error "Deployment failed at line $LINENO"' ERR

# Run main function
main