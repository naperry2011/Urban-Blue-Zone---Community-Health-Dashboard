# Urban Blue Zone — 14-Day Demo Plan (Next.js + AWS)

> This is a **demo prototype** with **Blue Zone aims**: not just vitals + alerts, but a holistic snapshot of **movement, food, stress, purpose, and social support**, plus **community insights**. It’s built to *show the idea works* end-to-end and why it matters.

---

## 0) TL;DR
**Goal:** Demonstrate a working flow from simulated “residents” → AWS → alerts → an **Urban Blue Zone dashboard** that blends vitals with **Power-9–aligned habits** (move naturally, downshift, plant slant, social ties, purpose).  
**Audience:** caregivers, community leaders, nonprofits, clinics.  
**Scope:** single environment; demo-grade auth/observability; realistic synthetic data for **50–100 residents** across 3–4 neighborhood cohorts.

---

## 1) What makes this “Blue Zone” (Demo Features)

### Individual signals (simulated)
- **Vitals:** HR, SpO₂, BP (from IoT simulator)
- **Movement score:** steps / activity bursts (simulated)
- **Downshift:** daily stress check-in (0–10) + relaxation minutes
- **Plant slant:** simple food log tags (plant-heavy / mixed / processed)
- **Social support:** “check-in circle” pings (count of interactions)
- **Purpose pulse:** weekly 1-question purpose/reflection check-in

### Community insights (aggregated)
- **Urban Blue Zone Index (UBZI):** weighted score of Movement, Food, Stress, Social, Purpose (0–100)
- **Heatcards by cohort:** seniors, adults w/ chronic risk, teens
- **Trend lines:** last 7/30 days for UBZI and alerts
- **Resource impact preview:** “what if” cards (e.g., +10 min walk → −X alerts)

### Alerts (demo)
- **Critical health alerts:** high BP/low SpO₂
- **Wellness nudges:** high stress streak, low movement streak, low social

> **No PII**: all synthetic residents; demo data only.

---

## 2) Architecture Stack

| Layer        | Tech                                                                 |
|--------------|----------------------------------------------------------------------|
| Frontend     | **Next.js (App Router) + Tailwind**                                  |
| Hosting      | **OpenNext → CloudFront + S3 + Lambda/Lambda@Edge**                  |
| Auth         | **Cognito** (basic Hosted UI / OIDC)                                 |
| API          | **API Gateway (REST)** → **Lambda**                                  |
| Ingest (IoT) | **AWS IoT Core (MQTT)**                                              |
| Storage      | **DynamoDB** (`vitals`, `residents`, `checkins`, `alerts`, `agg`)    |
| Analytics    | Simple **Lambda jobs** for hourly/day UBZI aggregates                 |
| Alerts       | **SNS** (SMS) / **SES** (email)                                      |
| Dashboard    | **Managed Grafana** (optional), Next.js charts as primary            |
| Monitoring   | **CloudWatch** logs/metrics                                          |
| Deployment   | **Terraform** (single “demo” stack)                                  |

**Optional map (no Google):** MapLibre GL + OpenStreetMap tiles (or skip maps—tag cohorts by “neighborhood” string).

---

## 3) Data Model (Demo)

**DDB: `residents`**
- `resident_id` (PK), `cohort` (senior|adult|teen|chronic), `neighborhood`
- `thresholds` (simple map), `contacts` (demo values)

**DDB: `vitals`**
- PK: `resident_id`, SK: `ts`
- `hr`, `spo2`, `bp_sys`, `bp_dia`, `status` (ok|warn|crit)

**DDB: `checkins`** (habits)
- PK: `resident_id`, SK: `ts`
- `movement_score` (0–100), `stress` (0–10), `downshift_min`
- `plant_slant` (plant|mixed|processed)
- `social_count` (0+), `purpose_pulse` (−1/0/+1)

**DDB: `alerts`**
- PK: `resident_id`, SK: `ts`
- `type` (vital|stress|movement|social), `severity` (info|warn|crit)

**DDB: `agg`** (hour/day)
- PK: `agg_key` (e.g., `day#2025-08-21#neighborhood#Southside`), SK: `metric`
- `ubzi` (0–100), `avg_stress`, `plant_ratio`, `move_avg`, `alerts_count`

**UBZI (demo weights)**  
`UBZI = 0.30*Movement + 0.25*Plant + 0.20*(10-Stress)*10 + 0.15*Social + 0.10*Purpose`

---

## 4) Screens (Next.js)

- `/login` – Cognito Hosted UI
- `/dashboard` – **community overview**: UBZI gauge, trend lines (7/30d), alerts feed
- `/cohorts` – cards: Seniors / Adults / Teens / Chronic (UBZI, alerts, streaks)
- `/residents/[id]` – individual mini-profile: vitals chart (24h/7d), habit streaks, recent alerts
- `/resources` – static cards (walking groups, stress breaks, plant-forward recipes) for demo storytelling

**Rendering strategy:**  
- Overview/cohorts: **ISR** (10–30s)  
- Resident detail: **SSR** (auth-gated) or ISR with short window  
- Charts: client fetch w/ SWR polling

---

## 5) Demo Logic

- **Simulator** publishes vitals + habit check-ins per resident every 10–30s.
- **Lambda (ingest)** validates & stores → checks thresholds.
- **Alerts:** crit (SMS/email), wellness nudges (email only).
- **Aggregator Lambda (hourly)** rolls up UBZI/metrics into `agg` for fast dashboard reads.

---

## 6) Day-by-Day Timeline (14 Days)

### Week 1 — Foundations + Ingest
**Day 1:** Terraform skeleton; Cognito; DynamoDB tables; API skeleton  
**Day 2:** IoT Core (things/topics/policies) → Lambda ingest → Dynamo write  
**Day 3:** Threshold eval + **alerts via SNS/SES**; alert dedup window (10m)  
**Day 4:** Habit check-in simulator (movement, stress, plant_slant, social, purpose)  
**Day 5:** **Aggregator Lambda** (hourly/day) to compute UBZI + cohort metrics; basic CloudWatch alarms

### Week 2 — Dashboard + Story
**Day 6:** Next.js scaffold (App Router, Tailwind, protected layout)  
**Day 7:** `/dashboard` UBZI overview + alerts feed (ISR 15s)  
**Day 8:** `/cohorts` cards + trend mini-charts  
**Day 9:** `/residents/[id]` vitals + habit streak bands + recent alerts  
**Day 10:** `/resources` storytelling cards; optional MapLibre cohort tagging  
**Day 11:** Demo polish: color system, empty/error states, copy edits  
**Day 12:** End-to-end testing with scripted spikes (high BP; high stress streak)  
**Day 13:** Dry run + “what-if” cards (e.g., +10min walking → +UBZI est.)  
**Day 14:** Ship via OpenNext → CloudFront; final smoke test

---

## 7) Demo Script (Run of Show)

1. **Open Dashboard**: UBZI today vs last 7 days; alerts feed ticking.  
2. **Cohorts View**: Seniors card shows lower movement / higher alerts; Teens show higher social.  
3. **Resident Detail**: Trigger a high-BP spike → show alert SMS/email arriving → card flips to “Critical” → dashboard updates.  
4. **Habits Impact**: Toggle simulator to increase plant_slant + movement for Southside cohort → watch UBZI curve rise in next aggregate tick.  
5. **Close**: Resources cards—walking groups & stress breaks—tie tech → culture.

---

## 8) Acceptance Criteria (Demo)

- UBZI, cohorts, and alerts render within **≤30s** of changes (ISR window).  
- Critical vital spikes generate **SMS/email** during demo.  
- Habit changes shift UBZI aggregates within one aggregator cycle.  
- No PII; all synthetic. Auth gates the app.

---

## 9) Costs (Demo, Monthly)

- CloudFront/S3/Next Lambdas: **$1–5**  
- IoT Core (100 residents, light): **$3–5**  
- DynamoDB (on-demand, light): **$2–4**  
- SNS (100–300 SMS): **$2–6**  
- SES (few hundred emails): **<$1**  
- CloudWatch (basic): **~$1**  
**Estimated Total:** **$10–20**

---

## 10) Risks & Boundaries (Demo)

- **Email/SMS deliverability**: verify SES identities; ensure SMS sandbox lifted.  
- **Hot keys**: stagger resident IDs/time buckets to avoid DDB partitions.  
- **Scope creep**: clinical features & HIPAA controls are out-of-scope for demo.  
- **Map tiles**: use OSM/MapLibre or omit maps to avoid vendor constraints.

---

## 11) Post-Demo (What’s Next)

- Deeper RBAC; resident consent flows; audit trails.  
- Bring in **non-IoT** data sources (community programs, pantry/park schedules).  
- Real-time websockets; anomaly detection; goal-based nudges.  
- Multi-tenant (clinics / CBOs); language localization.  
- Compliance hardening (HIPAA) and third-party security review.

---
