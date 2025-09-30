# Urban Blue Zone - Quick AWS Deployment Guide

## Situation
The full Terraform infrastructure deployment requires fixing several module configurations. For a faster path to testing on AWS, here's a simplified manual deployment approach.

## Option 1: Deploy Core Services Manually (FASTEST - 30 minutes)

### Step 1: Create DynamoDB Tables
```bash
# Create all 5 tables via AWS Console or CLI
aws dynamodb create-table \
  --table-name ubz-demo-residents \
  --attribute-definitions AttributeName=resident_id,AttributeType=S \
  --key-schema AttributeName=resident_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

aws dynamodb create-table \
  --table-name ubz-demo-vitals \
  --attribute-definitions AttributeName=resident_id,AttributeType=S AttributeName=timestamp,AttributeType=N \
  --key-schema AttributeName=resident_id,KeyType=HASH AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

aws dynamodb create-table \
  --table-name ubz-demo-checkins \
  --attribute-definitions AttributeName=resident_id,AttributeType=S AttributeName=timestamp,AttributeType=N \
  --key-schema AttributeName=resident_id,KeyType=HASH AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

aws dynamodb create-table \
  --table-name ubz-demo-alerts \
  --attribute-definitions AttributeName=alert_id,AttributeType=S \
  --key-schema AttributeName=alert_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

aws dynamodb create-table \
  --table-name ubz-demo-aggregations \
  --attribute-definitions AttributeName=resident_id,AttributeType=S AttributeName=timestamp,AttributeType=N \
  --key-schema AttributeName=resident_id,KeyType=HASH AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

### Step 2: Deploy Frontend to AWS Amplify (EASIEST)
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify in frontend directory
cd frontend
amplify init

# Add hosting
amplify add hosting
# Choose: Hosting with Amplify Console
# Choose: Manual deployment

# Publish
amplify publish
```

**Amplify will:**
- Build your Next.js app
- Deploy to CDN
- Provide HTTPS URL
- Handle all infrastructure

### Step 3: Seed Demo Data
```bash
# Update deployment/seed-demo-data.js with table names
# Then run:
node deployment/seed-demo-data.js
```

### Step 4: Test Your Deployment
- Visit the Amplify URL
- Login page should work (Cognito setup needed separately)
- Dashboard should display mock data
- API endpoints should return resident data from DynamoDB

## Option 2: Use AWS Console for Rapid Prototyping

### DynamoDB
1. Go to AWS Console → DynamoDB
2. Create 5 tables manually (residents, vitals, checkins, alerts, aggregations)
3. Use on-demand billing

### Frontend Deployment
**Option A: Amplify Console**
1. AWS Console → AWS Amplify
2. "Host web app" → "Deploy without Git"
3. Drag and drop your `frontend/.next` folder after running `npm run build`

**Option B: S3 + CloudFront**
1. Create S3 bucket for static hosting
2. Upload built frontend files
3. Create CloudFront distribution
4. Update DNS

## Option 3: Continue Fixing Terraform (Most Complete)

Current issues to fix:
1. ✅ SES template syntax (FIXED)
2. ✅ SES configuration set (FIXED)
3. ⚠️ Lambda module may need adjustments for SNS topic dependencies
4. ⚠️ API Gateway module needs validation
5. ⚠️ IoT module needs validation

To continue:
```bash
cd infrastructure
terraform validate  # Fix any remaining errors
terraform plan      # Review what will be created
terraform apply     # Deploy all infrastructure
```

## Recommendation

**For immediate testing:** Use **Option 1 (Amplify + Manual DynamoDB)**
- Gets you live in 30 minutes
- No Terraform debugging needed
- Can still use Terraform later for production

**For production deployment:** Fix and use **Option 3 (Terraform)**
- Full infrastructure as code
- Repeatable deployments
- Best practices

## Next Steps After Deployment

1. **Seed Demo Data**
   ```bash
   node deployment/seed-demo-data.js
   ```

2. **Run Smoke Tests**
   ```powershell
   .\deployment\smoke-test.ps1 -BaseUrl "https://your-amplify-url.amplifyapp.com"
   ```

3. **Access Your App**
   - Visit your Amplify URL
   - Test all pages
   - Verify data loads from DynamoDB

## Cost Estimate (Manual Deployment)
- DynamoDB: $5-10/month (on-demand)
- Amplify Hosting: $0.15/GB served + $0.01/build minute
- Total: ~$10-15/month for demo

## Support
If you want to:
- **Go fast**: Use Amplify (Option 1)
- **Go complete**: Let me continue fixing Terraform (Option 3)

Let me know which path you prefer!
