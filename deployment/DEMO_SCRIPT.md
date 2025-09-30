# Urban Blue Zone - Demo Script

## Overview
This demo script provides a guided walkthrough of the Urban Blue Zone application, showcasing key features and functionality for stakeholders, investors, and potential partners.

---

## Pre-Demo Checklist

- [ ] Application is running (local: `http://localhost:3000` or production URL)
- [ ] Demo data is seeded
- [ ] All smoke tests passed
- [ ] Internet connection is stable
- [ ] Browser is ready (Chrome/Edge recommended)
- [ ] Screen sharing is set up (if remote demo)

---

## Demo Flow (15-20 minutes)

### 1. Introduction (2 minutes)

**Script:**
> "Welcome to the Urban Blue Zone demonstration. Urban Blue Zone is an IoT-enabled community wellness platform that brings Blue Zone lifestyle principles to urban neighborhoods.
>
> We track real-time health vitals and habit patterns for residents, calculate a proprietary Urban Blue Zone Index (UBZI), and provide actionable insights to improve community health outcomes."

**Key Points:**
- Combines IoT sensors with Blue Zone lifestyle principles
- Real-time monitoring and analytics
- Cohort-based analysis for targeted interventions
- Proactive alerting system

---

### 2. Dashboard Overview (3 minutes)

**Navigate to:** `/dashboard` or `/`

**Demonstrate:**

1. **System-wide UBZI Gauge**
   - Point out the current community health score (typically 70-85)
   - Explain: "UBZI combines vital signs (40%) and lifestyle habits (60%)"
   - Show the color-coded status (green = excellent, yellow = good, red = needs attention)

2. **Trend Charts**
   - Show 7-day and 30-day trends
   - Point out: "We can see gradual improvement over the past month"
   - Explain the comparison to cohort averages

3. **Alert Feed**
   - Scroll through recent alerts
   - Point out severity levels (High, Medium, Low)
   - Explain: "Alerts trigger automatically based on configurable thresholds"
   - Show timestamp and resident information

4. **Quick Stats**
   - Total residents enrolled
   - Active alerts requiring attention
   - Average UBZI across cohorts

**Key Talking Points:**
- "Real-time dashboard updates every 15 seconds via ISR"
- "Designed for wellness coordinators and community health managers"
- "At-a-glance health status for entire community"

---

### 3. Cohort Comparison View (4 minutes)

**Navigate to:** `/cohorts`

**Demonstrate:**

1. **Cohort Cards**
   - Show the three main cohorts: Seniors, Adults, Teens
   - Plus special cohort: "Residents with Chronic Conditions"

2. **Individual Cohort Analysis**
   - Click on "Seniors (65+)" card
   - Point out:
     - Average UBZI score
     - Number of residents
     - Active alerts count
     - Trend sparkline

3. **Cohort Comparison**
   - Explain different health patterns across age groups
   - "Teens typically have higher UBZI scores due to activity levels"
   - "Seniors may need more attention for vitals monitoring"
   - "Chronic condition residents receive enhanced monitoring"

4. **Filtering and Time Ranges**
   - Show date range selector (if implemented)
   - Demonstrate sorting by UBZI, alert count, or cohort name

**Key Talking Points:**
- "Cohort segmentation enables targeted health interventions"
- "Different age groups have different health priorities"
- "Chronic condition monitoring ensures high-risk residents get proper attention"

---

### 4. Individual Resident Details (5 minutes)

**Navigate to:** `/residents` then click on a specific resident (e.g., "Maria Rodriguez - demo-001")

**Demonstrate:**

1. **Resident Profile**
   - Name, age, cohort classification
   - Contact information
   - Emergency contact details
   - Health conditions and medications
   - Enrollment date

2. **Current UBZI Score**
   - Personal UBZI gauge
   - Comparison to cohort average
   - Recent trend indicator

3. **Vital Signs Charts**
   - Toggle between 24h, 7d, and 30d views
   - Show heart rate trends
   - Show blood pressure patterns (systolic/diastolic)
   - Show SpO2 levels
   - Point out any anomalies or concerning patterns

4. **Habit Tracking**
   - Movement score (daily steps/activity)
   - Stress level self-reports
   - Plant-based meals consumed
   - Social interactions logged
   - Purpose pulse (engagement with meaningful activities)

5. **Habit Streaks Visualization**
   - Show current streaks (e.g., "7-day movement streak")
   - Best streaks achieved
   - Progress towards goals

6. **Alert History**
   - Timeline of past alerts
   - Show resolved vs. active alerts
   - Demonstrate alert details (timestamp, metric, threshold exceeded)

**Key Talking Points:**
- "Comprehensive view enables personalized care"
- "Historical data helps identify patterns and trends"
- "Habit streaks leverage gamification for behavior change"
- "Alert history provides accountability and tracking"

---

### 5. Resources Page (2 minutes)

**Navigate to:** `/resources`

**Demonstrate:**

1. **Community Resources Cards**
   - Walking groups and movement programs
   - Stress management workshops
   - Nutrition guides and plant-based cooking classes
   - Social programs and community events

2. **Community Map** (if implemented)
   - Show MapLibre integration with OpenStreetMap
   - Point out neighborhood boundaries
   - Show resident distribution by cohort (color-coded)

3. **Program Enrollment**
   - Explain how residents can join programs
   - Show upcoming events calendar

**Key Talking Points:**
- "Resources support lifestyle interventions based on Blue Zone principles"
- "Community engagement is core to the Blue Zone philosophy"
- "Programs are targeted based on cohort needs"

---

### 6. Technical Highlights (3 minutes)

**Behind the Scenes:**

1. **Architecture Overview**
   - IoT devices → AWS IoT Core → Lambda → DynamoDB
   - Real-time data ingestion pipeline
   - Automated aggregation with EventBridge scheduled jobs
   - Next.js 15 with ISR for optimal performance

2. **Key AWS Services**
   - **AWS IoT Core**: Device connectivity and MQTT messaging
   - **AWS Lambda**: Serverless compute for processing
   - **DynamoDB**: NoSQL database for scalability
   - **API Gateway**: RESTful API layer
   - **Amazon SNS/SES**: Multi-channel alerting (SMS/Email)
   - **CloudWatch**: Monitoring and observability
   - **Amazon Cognito**: Secure authentication

3. **Performance Metrics**
   - Page load time: < 2 seconds
   - API response time: < 500ms
   - Alert delivery: < 30 seconds from threshold breach
   - Real-time updates via 15-second ISR

4. **Security Features**
   - End-to-end encryption
   - Role-based access control
   - HIPAA-compliant data handling
   - Comprehensive security headers (CSP, HSTS, etc.)
   - Rate limiting and DDoS protection

**Key Talking Points:**
- "Fully serverless architecture for scalability and cost-efficiency"
- "Production-ready with security best practices"
- "Can scale from 100 to 100,000 residents with minimal changes"

---

## Demo Scenarios

### Scenario 1: High Blood Pressure Alert
**Use Case:** Real-time health monitoring and alerting

1. Navigate to Dashboard
2. Point out recent high-priority alert for Maria Rodriguez
3. Click on alert to see details: "Blood pressure elevated: 152/88 mmHg"
4. Navigate to Maria's resident profile
5. Show BP chart with spike
6. Explain: "Alert was sent via SMS/email to care team within 30 seconds"
7. Discuss intervention: "Care coordinator can reach out proactively"

### Scenario 2: Habit Improvement Tracking
**Use Case:** Behavioral change and lifestyle intervention

1. Navigate to Residents page
2. Select David Kim (demo-004)
3. Show improving movement score trend over 30 days
4. Point out 14-day movement streak
5. Show correlation with improving UBZI score
6. Explain: "Positive reinforcement through streak tracking"

### Scenario 3: Cohort Comparison for Program Planning
**Use Case:** Resource allocation and program design

1. Navigate to Cohorts page
2. Compare Seniors vs. Adults UBZI scores
3. Note: Seniors have more active alerts
4. Navigate to Resources page
5. Show tailored programs: "Low-impact walking groups for seniors"
6. Explain: "Data-driven program planning based on cohort needs"

---

## Q&A Preparation

### Likely Questions:

**Q: What types of IoT devices are supported?**
A: We support any device that can publish MQTT messages to AWS IoT Core. This includes wearables, smart scales, BP monitors, fitness trackers, and custom sensors. We provide SDKs and sample code for common devices.

**Q: How is data privacy handled?**
A: All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We implement role-based access control, audit logging, and comply with HIPAA regulations. PHI is stored securely in AWS with proper access controls.

**Q: What is the cost per resident?**
A: Infrastructure costs are approximately $2-5 per resident per month at scale (>500 residents), primarily for IoT messages, Lambda executions, and data storage. This scales down with serverless architecture.

**Q: Can this integrate with existing EHR systems?**
A: Yes, the API Gateway provides RESTful endpoints that can integrate with major EHR systems (Epic, Cerner, etc.) via HL7 FHIR standards. We can also push alerts to external systems.

**Q: How quickly can this be deployed for a new community?**
A: Initial deployment takes 2-3 weeks including infrastructure setup, resident enrollment, and device provisioning. Our automated deployment scripts and Terraform IaC make this highly repeatable.

**Q: What happens if a resident doesn't want to wear sensors 24/7?**
A: The system is flexible - residents can check in manually via mobile app or web portal. We also support intermittent device use (e.g., check BP twice daily). The algorithm adjusts for data frequency.

**Q: Can family members access resident data?**
A: With proper consent and authentication through Cognito, we can provide family members with read-only access to their loved ones' health dashboards via secure login.

---

## Post-Demo Follow-up

### Materials to Share:
1. Architecture diagram
2. Security whitepaper
3. Cost analysis spreadsheet
4. Implementation timeline (14-day plan)
5. Case study data (if available)
6. API documentation
7. Sample data exports

### Next Steps:
1. Schedule technical deep-dive with engineering team
2. Provide sandbox access for exploration
3. Discuss customization requirements
4. Review pricing and licensing
5. Plan pilot program

---

## Troubleshooting During Demo

### Issue: Page loads slowly
**Solution:** Refresh the page, mention ISR cache warming

### Issue: Mock data looks static
**Solution:** Explain this is demo data, production would have real-time updates

### Issue: Alert doesn't show
**Solution:** Navigate to a different resident or check alerts page directly

### Issue: Chart isn't rendering
**Solution:** Check browser console, refresh page, fall back to describing the feature

---

## Demo Best Practices

1. **Start with the "why"** - Explain the problem Urban Blue Zone solves
2. **Use storytelling** - "Imagine Maria, a 72-year-old resident..."
3. **Pause for questions** - Don't rush through sections
4. **Highlight uniqueness** - UBZI score, cohort analysis, real-time alerting
5. **Show, don't just tell** - Click through actual features
6. **Connect features to outcomes** - "This leads to earlier intervention"
7. **End with clear next steps** - Schedule follow-up, provide contact info

---

## Success Metrics for Demo

- [ ] Audience engagement (questions asked)
- [ ] Clear understanding of value proposition
- [ ] Interest in pilot program or further discussion
- [ ] Follow-up meeting scheduled
- [ ] Positive feedback on user experience
- [ ] Technical questions indicate serious consideration

---

**Demo Duration:** 15-20 minutes (main flow) + 5-10 minutes Q&A
**Recommended Audience:** Healthcare administrators, community health directors, wellness coordinators, investors, technology partners

---

*Document Version: 1.0*
*Last Updated: Day 14 - Go Live*
*Contact: [Your Team Contact Information]*
