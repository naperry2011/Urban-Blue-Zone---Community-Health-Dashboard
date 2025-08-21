# Urban Blue Zone - Implementation Plan

## Overview
This document provides a detailed, step-by-step implementation plan for the Urban Blue Zone project following the 14-day timeline.

## Pre-Implementation Checklist

### Required Tools & Accounts
- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] AWS account created and verified
- [ ] AWS CLI installed and configured
- [ ] Terraform 1.5+ installed
- [ ] Git installed
- [ ] VS Code or preferred IDE
- [ ] Postman or similar API testing tool

### AWS Services Setup
- [ ] Enable AWS IoT Core
- [ ] Verify SES domain (for email sending)
- [ ] Request SMS sandbox removal (if needed)
- [ ] Set up billing alerts

## Week 1: Infrastructure & Backend (Days 1-5)

### Day 1: Foundation Setup
**Goal**: Establish core infrastructure and authentication

#### Morning (4 hours)
1. **Project Initialization**
   - Create project directory structure
   - Initialize Git repository
   - Create .gitignore file
   - Set up environment variables template

2. **Terraform Setup**
   ```bash
   # Commands to run
   terraform init
   terraform workspace new demo
   ```
   
   **Files to create:**
   - `terraform/main.tf` - Main configuration
   - `terraform/variables.tf` - Variable definitions
   - `terraform/outputs.tf` - Output values
   - `terraform/providers.tf` - AWS provider config

#### Afternoon (4 hours)
3. **AWS Cognito Configuration**
   - User pool creation
   - App client setup
   - Hosted UI configuration
   - Domain setup

4. **DynamoDB Tables Creation**
   - `residents` table
   - `vitals` table
   - `checkins` table
   - `alerts` table
   - `aggregations` table

5. **API Gateway Skeleton**
   - REST API creation
   - Resource structure planning
   - CORS configuration

### Day 2: IoT Integration
**Goal**: Set up IoT Core and data ingestion pipeline

#### Morning (4 hours)
1. **IoT Core Setup**
   - Thing types definition
   - Things creation (per resident)
   - Certificates generation
   - Policies attachment
   - Topic structure:
     - `urban-blue-zone/vitals/{resident_id}`
     - `urban-blue-zone/checkins/{resident_id}`

2. **Lambda Functions - Ingestion**
   - `iot-vitals-processor` - Process vital signs
   - `iot-checkins-processor` - Process habit check-ins
   - IAM roles and permissions

#### Afternoon (4 hours)
3. **IoT Rules Engine**
   - Rule for vitals → Lambda → DynamoDB
   - Rule for check-ins → Lambda → DynamoDB
   - Error handling and DLQ setup

4. **Basic Simulator Creation**
   - Node.js MQTT client
   - Synthetic data generation
   - Connection to IoT Core

### Day 3: Alerts System
**Goal**: Implement threshold evaluation and notification system

#### Morning (4 hours)
1. **Alert Processing Lambda**
   - Threshold evaluation logic
   - Alert severity classification
   - Deduplication window (10 min)

2. **SNS Setup**
   - Topics creation
   - SMS subscriptions
   - Email subscriptions

#### Afternoon (4 hours)
3. **SES Configuration**
   - Email templates
   - Verified identities
   - Sending rules

4. **Alert Integration**
   - Connect Lambda to SNS/SES
   - Test alert flow
   - CloudWatch alarms

### Day 4: Habit Tracking Enhancement
**Goal**: Expand simulator and processing for Blue Zone habits

#### Morning (4 hours)
1. **Enhanced Simulator**
   - Movement score generation
   - Stress level simulation
   - Plant slant tracking
   - Social interaction counter
   - Purpose pulse responses

2. **Check-in Processing**
   - Validation logic
   - Data transformation
   - Storage optimization

#### Afternoon (4 hours)
3. **Habit Analytics**
   - Streak calculation
   - Trend identification
   - Cohort comparisons

### Day 5: Aggregation & Analytics
**Goal**: Build UBZI calculation and aggregation system

#### Morning (4 hours)
1. **Aggregator Lambda**
   - UBZI calculation function
   - Hourly aggregation job
   - Daily rollup job

2. **EventBridge Scheduling**
   - Hourly trigger setup
   - Daily trigger setup
   - Error handling

#### Afternoon (4 hours)
3. **CloudWatch Integration**
   - Custom metrics
   - Dashboard creation
   - Basic alarms

4. **Week 1 Testing**
   - End-to-end data flow test
   - Alert generation test
   - Aggregation verification

## Week 2: Frontend & Polish (Days 6-10)

### Day 6: Next.js Foundation
**Goal**: Set up Next.js application with authentication

#### Morning (4 hours)
1. **Next.js Setup**
   ```bash
   npx create-next-app@latest frontend --typescript --tailwind --app
   ```
   
2. **Project Structure**
   - App router configuration
   - Layout components
   - API route handlers

#### Afternoon (4 hours)
3. **Cognito Integration**
   - NextAuth.js setup
   - Protected routes
   - Session management

4. **Environment Configuration**
   - API endpoints
   - AWS service configs
   - Development vs production

### Day 7: Dashboard Overview
**Goal**: Build main dashboard with UBZI visualization

#### Morning (4 hours)
1. **Dashboard Layout**
   - Header with navigation
   - UBZI gauge component
   - Trend charts setup

2. **Data Fetching**
   - API integration
   - SWR hooks
   - Real-time updates

#### Afternoon (4 hours)
3. **Visualization Components**
   - Chart.js or Recharts setup
   - UBZI gauge
   - 7/30 day trends
   - Alert feed

4. **ISR Configuration**
   - 15-second revalidation
   - Error boundaries
   - Loading states

### Day 8: Cohorts View
**Goal**: Create cohort comparison cards and analytics

#### Morning (4 hours)
1. **Cohort Cards**
   - Senior card component
   - Adult card component
   - Teen card component
   - Chronic condition card

2. **Mini Charts**
   - Sparklines for trends
   - Alert counts
   - UBZI averages

#### Afternoon (4 hours)
3. **Filtering & Sorting**
   - Cohort selection
   - Date range picker
   - Metric toggles

### Day 9: Resident Details
**Goal**: Individual resident profiles and detailed metrics

#### Morning (4 hours)
1. **Resident Profile Page**
   - Dynamic routing `[id]`
   - Vital signs charts
   - 24h/7d/30d views

2. **Habit Tracking Display**
   - Streak visualizations
   - Progress bars
   - Historical data

#### Afternoon (4 hours)
3. **Alert History**
   - Timeline component
   - Severity indicators
   - Resolution status

### Day 10: Resources & Polish
**Goal**: Add resource cards and UI refinement

#### Morning (4 hours)
1. **Resources Page**
   - Walking groups card
   - Stress management resources
   - Nutrition guides
   - Community programs

2. **MapLibre Integration** (Optional)
   - OSM tile setup
   - Cohort visualization
   - Neighborhood boundaries

#### Afternoon (4 hours)
3. **UI/UX Polish**
   - Consistent color system
   - Responsive design
   - Accessibility features
   - Error states

## Days 11-14: Testing & Deployment

### Day 11: Polish & Edge Cases
**Goal**: Refine UI and handle edge cases

1. **Empty States**
2. **Error Handling**
3. **Loading Optimizations**
4. **Copy Review**

### Day 12: End-to-End Testing
**Goal**: Complete system testing with scenarios

1. **Test Scenarios**
   - High BP spike → Alert flow
   - Habit improvement → UBZI increase
   - Multi-cohort comparison
   - Historical data accuracy

2. **Performance Testing**
   - Load testing with 100 residents
   - Response time verification
   - Database query optimization

### Day 13: Deployment Preparation
**Goal**: Prepare for production deployment

1. **OpenNext Configuration**
   - Build optimization
   - CloudFront setup
   - Lambda@Edge functions

2. **Final Testing**
   - Staging environment test
   - Security review
   - Documentation update

### Day 14: Go Live
**Goal**: Deploy to production and final validation

1. **Deployment**
   ```bash
   npm run build
   npm run deploy
   ```

2. **Smoke Testing**
   - All pages load
   - Authentication works
   - Data flows correctly
   - Alerts trigger

3. **Demo Preparation**
   - Demo script review
   - Test data seeding
   - Backup procedures

## Daily Checklist Template

### Start of Day
- [ ] Review yesterday's progress
- [ ] Check AWS costs
- [ ] Update task tracking
- [ ] Review blockers

### End of Day
- [ ] Commit code changes
- [ ] Update documentation
- [ ] Test today's features
- [ ] Plan tomorrow's tasks

## Risk Mitigation

### Common Issues & Solutions

1. **AWS Service Limits**
   - Monitor quotas daily
   - Request increases early
   - Have fallback options

2. **Data Consistency**
   - Implement retries
   - Use DLQ for failures
   - Monitor CloudWatch logs

3. **Performance Issues**
   - Cache aggregations
   - Optimize queries
   - Use ISR strategically

4. **Security Concerns**
   - Regular security group audits
   - IAM permission reviews
   - Secret rotation setup

## Success Metrics

### Technical Metrics
- Page load time < 2s
- API response time < 500ms
- Alert delivery < 30s
- Zero critical errors in 24h

### Demo Metrics
- All scenarios executable
- Clean UI/UX flow
- Realistic data visualization
- Smooth narrative flow

## Post-Implementation

### Documentation
- [ ] API documentation
- [ ] Deployment guide
- [ ] Troubleshooting guide
- [ ] Demo script

### Handoff Preparation
- [ ] Code review
- [ ] Knowledge transfer doc
- [ ] Video walkthrough
- [ ] Support contacts

## Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run simulator        # Start IoT simulator

# Testing
npm run test            # Run tests
npm run test:e2e        # E2E tests

# Deployment
terraform plan          # Review changes
terraform apply         # Deploy infrastructure
npm run deploy          # Deploy application

# Monitoring
aws logs tail           # View logs
aws cloudwatch get-metric-statistics  # Get metrics
```

## Environment Variables Template

```env
# AWS
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=

# Cognito
NEXT_PUBLIC_COGNITO_REGION=us-east-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_CLIENT_ID=
NEXT_PUBLIC_COGNITO_DOMAIN=

# API
NEXT_PUBLIC_API_GATEWAY_URL=

# IoT
IOT_ENDPOINT=
IOT_TOPIC_PREFIX=urban-blue-zone

# DynamoDB
DYNAMODB_REGION=us-east-1
RESIDENTS_TABLE=ubz-residents
VITALS_TABLE=ubz-vitals
CHECKINS_TABLE=ubz-checkins
ALERTS_TABLE=ubz-alerts
AGGREGATIONS_TABLE=ubz-aggregations

# Notifications
SNS_TOPIC_ARN=
SES_FROM_EMAIL=

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Contact & Support

**Project Lead**: [Your Name]
**Slack Channel**: #urban-blue-zone
**Documentation**: [Wiki Link]
**Issues**: GitHub Issues

---

*This plan is designed for rapid prototyping. Adjust timelines based on team size and expertise.*