# Urban Blue Zone - Community Health Dashboard

A holistic community health monitoring platform inspired by Blue Zone principles, combining vital signs monitoring with lifestyle habit tracking to promote longevity and wellbeing in urban communities.

## 🎯 Project Overview

Urban Blue Zone is a **14-day demo prototype** that demonstrates an end-to-end health monitoring system integrating:
- Real-time vital signs monitoring (HR, SpO₂, BP)
- Blue Zone lifestyle habits tracking (Power-9 principles)
- Community-level health insights and aggregations
- Automated alert systems for critical health events
- Resource recommendations for community wellness

### Key Features

- **Individual Health Monitoring**: Track vitals and lifestyle habits for 50-100 simulated residents
- **Community Insights**: Aggregate Urban Blue Zone Index (UBZI) scores by neighborhood and cohort
- **Smart Alerts**: Critical health alerts via SMS/email and wellness nudges
- **Dashboard Analytics**: Real-time visualization of community health trends
- **Resource Management**: Connect residents to community wellness resources

## 🏗️ Architecture

### Technology Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, MapLibre GL |
| **Hosting** | OpenNext, CloudFront, S3, Lambda@Edge |
| **Authentication** | AWS Cognito (OIDC) |
| **API** | API Gateway (REST) → Lambda |
| **IoT/Ingest** | AWS IoT Core (MQTT) |
| **Database** | DynamoDB |
| **Messaging** | SNS (SMS), SES (Email) |
| **Analytics** | Lambda Jobs, CloudWatch |
| **Infrastructure** | Terraform |
| **Monitoring** | CloudWatch, Managed Grafana (optional) |

### Data Model

- **Residents**: Demographics, cohorts, contact information
- **Vitals**: Heart rate, SpO₂, blood pressure readings
- **Check-ins**: Movement, stress, nutrition, social, purpose metrics
- **Alerts**: Health warnings and wellness notifications
- **Aggregations**: UBZI scores and community metrics

## 📊 Urban Blue Zone Index (UBZI)

The UBZI score (0-100) is calculated using weighted Blue Zone principles:

```
UBZI = 0.30*Movement + 0.25*Plant + 0.20*(10-Stress)*10 + 0.15*Social + 0.10*Purpose
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- AWS Account with appropriate permissions
- Terraform 1.5+
- AWS CLI configured
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/urban-blue-zone.git
cd urban-blue-zone
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure AWS credentials**
```bash
aws configure
```

4. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

5. **Deploy infrastructure**
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

6. **Run the development server**
```bash
npm run dev
```

## 📁 Project Structure

```
urban-blue-zone/
├── frontend/               # Next.js application
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── lib/              # Utilities and helpers
│   └── public/           # Static assets
├── backend/               # Lambda functions
│   ├── api/              # API endpoints
│   ├── iot/              # IoT data processing
│   ├── aggregator/       # Analytics jobs
│   └── alerts/           # Alert processing
├── infrastructure/        # Terraform configurations
│   ├── modules/          # Reusable modules
│   ├── environments/     # Environment configs
│   └── main.tf          # Main configuration
├── simulator/            # IoT device simulator
│   └── residents/        # Synthetic data generation
└── docs/                 # Documentation

```

## 🎮 Demo Scenarios

### Available Demo Scripts

1. **Vital Spike Alert**: Trigger high BP reading → SMS/email alert
2. **Community Wellness**: Increase movement/nutrition → UBZI improvement
3. **Cohort Comparison**: View health disparities across age groups
4. **Resource Impact**: Simulate wellness program effects

### Running the Simulator

```bash
npm run simulator -- --residents 100 --interval 30
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Lint code
npm run deploy       # Deploy to AWS
npm run simulator    # Start IoT simulator
```

### Environment Variables

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=

# Cognito
COGNITO_USER_POOL_ID=
COGNITO_CLIENT_ID=

# API
API_GATEWAY_URL=

# IoT
IOT_ENDPOINT=

# Next.js
NEXT_PUBLIC_APP_URL=
```

## 📈 Monitoring & Observability

- **CloudWatch Dashboards**: System metrics and custom metrics
- **Application Logs**: Structured logging via CloudWatch Logs
- **Alerts**: CloudWatch Alarms for critical thresholds
- **Tracing**: X-Ray for distributed tracing (optional)

## 💰 Cost Estimates

Monthly costs for demo environment (100 residents):
- CloudFront/S3/Lambda: $1-5
- IoT Core: $3-5
- DynamoDB: $2-4
- SNS/SES: $2-7
- CloudWatch: ~$1
- **Total: $10-20/month**

## 🔒 Security Considerations

- All data is synthetic (no real PII)
- Cognito authentication required for dashboard access
- API Gateway with authorization
- Encrypted data at rest (DynamoDB)
- TLS for all data in transit
- IAM roles with least privilege

## 🗓️ Implementation Timeline

### Week 1: Infrastructure & Backend
- Day 1-2: AWS setup, Terraform, core services
- Day 3-4: IoT ingestion, alerts system
- Day 5: Aggregation jobs, monitoring

### Week 2: Frontend & Integration
- Day 6-9: Next.js dashboard, visualizations
- Day 10-11: Polish, error handling
- Day 12-13: Testing, demo preparation
- Day 14: Deployment, final validation

## 🤝 Contributing

This is a demo project for showcasing Urban Blue Zone concepts. For production implementations, please contact the team.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Dan Buettner's Blue Zones research
- Built for urban communities seeking holistic health solutions
- Designed for caregivers, community leaders, and health organizations

## 📞 Support

For questions or support:
- Create an issue in this repository
- Contact: team@urbanblueezone.demo

---

**Note**: This is a demonstration prototype. For production use with real health data, additional compliance (HIPAA), security hardening, and medical device certifications would be required.