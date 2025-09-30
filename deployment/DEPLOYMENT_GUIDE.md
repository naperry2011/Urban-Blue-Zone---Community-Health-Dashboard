# Urban Blue Zone - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Deployment Process](#deployment-process)
4. [Rollback Procedures](#rollback-procedures)
5. [Monitoring](#monitoring)
6. [Troubleshooting](#troubleshooting)
7. [Security Checklist](#security-checklist)

## Prerequisites

### Required Tools
- **Node.js**: v18+ (Check: `node --version`)
- **npm**: v9+ (Check: `npm --version`)
- **AWS CLI**: v2+ (Check: `aws --version`)
- **Terraform**: v1.5+ (Check: `terraform --version`)
- **Git**: Latest (Check: `git --version`)
- **PowerShell**: v7+ (Windows) or Bash (Unix)

### AWS Account Setup
1. AWS account with appropriate permissions
2. Configured AWS CLI profile
3. Access to the following services:
   - Lambda
   - API Gateway
   - DynamoDB
   - S3
   - CloudFront
   - Cognito
   - IoT Core
   - SNS/SES
   - CloudWatch

### Domain and SSL
- Domain name configured in Route 53
- ACM certificate validated for the domain
- CloudFront distribution configured

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/urban-blue-zone.git
cd urban-blue-zone
```

### 2. Install Dependencies
```bash
cd frontend
npm ci
cd ..
```

### 3. Configure Environment Variables

Create environment files for each environment:

**Staging** (`.env.staging`):
```bash
cp frontend/.env.staging.example frontend/.env.staging
# Edit with your staging values
```

**Production** (`.env.production`):
```bash
cp frontend/.env.production.example frontend/.env.production
# Edit with your production values
```

### 4. AWS Profile Configuration
```bash
aws configure --profile ubz-staging
aws configure --profile ubz-production
```

## Deployment Process

### Automated Deployment

#### Windows (PowerShell)
```powershell
# Deploy to staging
.\deployment\deploy.ps1 -Environment staging

# Deploy to production
.\deployment\deploy.ps1 -Environment production -AWSProfile ubz-production
```

#### Unix/Linux/Mac (Bash)
```bash
# Deploy to staging
./deployment/deploy.sh staging

# Deploy to production
./deployment/deploy.sh production
```

### Manual Deployment Steps

If automated deployment fails, follow these manual steps:

#### 1. Build Application
```bash
cd frontend
NODE_ENV=production npm run build
npx open-next build
```

#### 2. Deploy Infrastructure
```bash
cd terraform
terraform workspace select staging
terraform plan -var="environment=staging"
terraform apply -var="environment=staging"
```

#### 3. Deploy Lambda Functions
```bash
# Get function names from Terraform output
terraform output -json > ../deployment/terraform-outputs.json

# Update Lambda functions
aws lambda update-function-code \
  --function-name ubz-staging-server \
  --zip-file fileb://../frontend/.open-next/server-function.zip \
  --profile ubz-staging

aws lambda update-function-code \
  --function-name ubz-staging-image-optimization \
  --zip-file fileb://../frontend/.open-next/image-optimization-function.zip \
  --profile ubz-staging
```

#### 4. Upload Static Assets
```bash
# Get S3 bucket name
S3_BUCKET=$(terraform output -raw s3_bucket_name)

# Upload static files
aws s3 sync ../frontend/.open-next/assets \
  s3://$S3_BUCKET/_next/static \
  --cache-control "public, max-age=31536000, immutable" \
  --delete \
  --profile ubz-staging

# Upload public files
aws s3 sync ../frontend/public \
  s3://$S3_BUCKET/public \
  --cache-control "public, max-age=86400" \
  --delete \
  --profile ubz-staging
```

#### 5. Invalidate CloudFront Cache
```bash
# Get distribution ID
DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)

# Create invalidation
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*" \
  --profile ubz-staging
```

### Deployment Verification

#### 1. Health Checks
```bash
# Check application health
curl https://staging.ubz-demo.com/api/health

# Check dashboard
curl -I https://staging.ubz-demo.com/dashboard
```

#### 2. Smoke Tests
Run the automated smoke tests:
```bash
npm run test:smoke -- --env=staging
```

#### 3. Manual Verification Checklist
- [ ] Homepage loads correctly
- [ ] Authentication works (login/logout)
- [ ] Dashboard displays data
- [ ] Cohorts view shows all cohorts
- [ ] Resident details page works
- [ ] Real-time data updates
- [ ] Alerts are triggered correctly
- [ ] API endpoints respond

## Rollback Procedures

### Immediate Rollback

If issues are detected immediately after deployment:

#### Windows (PowerShell)
```powershell
.\deployment\rollback.ps1 -RollbackTag "deploy-staging-20240315-143022" -Environment staging
```

#### Unix/Linux/Mac
```bash
./deployment/rollback.sh deploy-staging-20240315-143022 staging
```

### Manual Rollback Steps

1. **Identify the last working deployment tag:**
```bash
git tag -l "deploy-*" | tail -5
```

2. **Checkout the previous version:**
```bash
git checkout deploy-staging-20240315-143022
```

3. **Rebuild and redeploy:**
```bash
cd frontend
npm ci
npm run build
npx open-next build
```

4. **Deploy the rollback version:**
Follow the manual deployment steps above

5. **Verify rollback success:**
```bash
curl https://staging.ubz-demo.com/api/health
```

## Monitoring

### CloudWatch Dashboards

Access CloudWatch dashboards for monitoring:
- **Application Dashboard**: `ubz-staging-application`
- **Infrastructure Dashboard**: `ubz-staging-infrastructure`
- **Alerts Dashboard**: `ubz-staging-alerts`

### Key Metrics to Monitor

1. **Lambda Functions**
   - Invocation count
   - Error rate
   - Duration
   - Concurrent executions

2. **API Gateway**
   - Request count
   - 4XX/5XX errors
   - Latency

3. **DynamoDB**
   - Read/Write capacity units
   - Throttled requests
   - User errors

4. **CloudFront**
   - Cache hit ratio
   - Origin latency
   - Error rate

### Alarms

Critical alarms configured:
- Lambda error rate > 1%
- API Gateway 5XX errors > 5/minute
- DynamoDB throttling
- CloudFront origin errors

## Troubleshooting

### Common Issues and Solutions

#### 1. Deployment Fails at Build Stage

**Issue**: Build errors or missing dependencies
```bash
Error: Cannot find module 'xyz'
```

**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 2. Lambda Function Timeout

**Issue**: Functions timing out
```
Task timed out after 30.00 seconds
```

**Solution**:
- Check Lambda function timeout settings
- Increase memory allocation
- Review CloudWatch logs for bottlenecks

#### 3. CloudFront 403 Errors

**Issue**: Access denied errors
```
403 Forbidden
```

**Solution**:
- Check S3 bucket policies
- Verify CloudFront OAI configuration
- Review origin access settings

#### 4. Authentication Issues

**Issue**: Users cannot log in
```
Invalid authentication token
```

**Solution**:
- Verify Cognito user pool configuration
- Check environment variables
- Review NextAuth configuration

#### 5. Data Not Updating

**Issue**: Dashboard shows stale data
```
Last updated: 1 hour ago
```

**Solution**:
- Check IoT Core rules
- Verify Lambda processing functions
- Review DynamoDB write operations
- Check EventBridge schedules

### Debug Commands

```bash
# View Lambda logs
aws logs tail /aws/lambda/ubz-staging-server --follow

# Check DynamoDB items
aws dynamodb scan --table-name ubz-staging-residents

# Test API Gateway
aws apigatewayv2 get-apis

# Check S3 bucket contents
aws s3 ls s3://ubz-staging-assets/

# View CloudFront distribution
aws cloudfront get-distribution --id E1234567890ABC
```

## Security Checklist

Before each deployment, verify:

### Pre-Deployment
- [ ] No sensitive data in code
- [ ] Environment variables properly configured
- [ ] Dependencies updated (no critical vulnerabilities)
- [ ] Security headers configured
- [ ] CORS policies reviewed
- [ ] Rate limiting enabled

### Post-Deployment
- [ ] SSL certificate valid
- [ ] Authentication working
- [ ] API endpoints secured
- [ ] CloudFront security headers active
- [ ] WAF rules (if configured) working
- [ ] Monitoring and alerts active

### Security Best Practices
1. **Never commit secrets**: Use environment variables
2. **Rotate credentials regularly**: Update AWS keys quarterly
3. **Use least privilege**: IAM roles with minimal permissions
4. **Enable MFA**: For AWS console access
5. **Audit logs**: Review CloudTrail logs regularly
6. **Update dependencies**: Run `npm audit` before deployment

## Deployment Checklist

### Before Deployment
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] Database migrations ready (if applicable)
- [ ] Rollback plan prepared
- [ ] Team notified of deployment window

### During Deployment
- [ ] Monitor deployment progress
- [ ] Watch error logs
- [ ] Check resource utilization
- [ ] Verify each deployment step

### After Deployment
- [ ] Run smoke tests
- [ ] Verify all features working
- [ ] Check monitoring dashboards
- [ ] Update deployment log
- [ ] Notify team of completion
- [ ] Monitor for 30 minutes post-deployment

## Support and Contacts

### Escalation Path
1. **Level 1**: Development Team
   - Slack: #ubz-dev
   - Email: dev-team@ubz-demo.com

2. **Level 2**: DevOps Team
   - Slack: #ubz-devops
   - Email: devops@ubz-demo.com

3. **Level 3**: On-Call Engineer
   - PagerDuty: ubz-oncall
   - Phone: +1-xxx-xxx-xxxx

### Documentation
- **API Documentation**: `/docs/api`
- **Architecture Guide**: `/docs/architecture`
- **Runbook**: `/docs/runbook`
- **Postmortem Templates**: `/docs/postmortems`

## Appendix

### Useful Scripts

#### Check deployment status
```bash
#!/bin/bash
echo "Checking deployment status..."
curl -s https://$DOMAIN/api/health | jq '.'
curl -s https://$DOMAIN/api/version | jq '.'
```

#### Clean up old deployments
```bash
#!/bin/bash
# Remove old Lambda versions (keep last 5)
aws lambda list-versions-by-function --function-name ubz-staging-server \
  --query 'Versions[:-5].Version' --output text | \
  xargs -n1 -I{} aws lambda delete-function --function-name ubz-staging-server:{}
```

#### Export CloudWatch logs
```bash
#!/bin/bash
aws logs create-export-task \
  --log-group-name /aws/lambda/ubz-staging-server \
  --from $(date -d '1 day ago' +%s)000 \
  --to $(date +%s)000 \
  --destination ubz-logs-export \
  --destination-prefix staging/$(date +%Y%m%d)
```

---

**Last Updated**: March 2024
**Version**: 1.0.0
**Author**: Urban Blue Zone DevOps Team