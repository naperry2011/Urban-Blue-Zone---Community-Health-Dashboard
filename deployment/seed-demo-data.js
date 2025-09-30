#!/usr/bin/env node

/**
 * Urban Blue Zone - Demo Data Seeder
 *
 * This script seeds the demonstration data for the Urban Blue Zone application.
 * It creates realistic data for residents, vitals, check-ins, alerts, and aggregations.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');

// Configuration
const config = {
  region: process.env.AWS_REGION || 'us-east-1',
  tables: {
    residents: process.env.RESIDENTS_TABLE || 'ubz-prod-residents',
    vitals: process.env.VITALS_TABLE || 'ubz-prod-vitals',
    checkins: process.env.CHECKINS_TABLE || 'ubz-prod-checkins',
    alerts: process.env.ALERTS_TABLE || 'ubz-prod-alerts',
    aggregations: process.env.AGGREGATIONS_TABLE || 'ubz-prod-aggregations'
  }
};

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: config.region });
const docClient = DynamoDBDocumentClient.from(client);

// Demo residents data
const demoResidents = [
  {
    resident_id: 'demo-001',
    name: 'Maria Rodriguez',
    age: 72,
    cohort: 'seniors',
    enrolled_date: '2025-01-15',
    contact: { phone: '+1-555-0101', email: 'maria.r@example.com' },
    address: { street: '123 Oak Avenue', city: 'Urban Blue Zone', state: 'CA', zip: '90210' },
    emergency_contact: { name: 'Carlos Rodriguez', phone: '+1-555-0102', relationship: 'Son' },
    health_conditions: ['hypertension', 'type2_diabetes'],
    medications: ['metformin', 'lisinopril'],
    baseline_vitals: { heart_rate: 75, blood_pressure_systolic: 135, blood_pressure_diastolic: 82, spo2: 97 }
  },
  {
    resident_id: 'demo-002',
    name: 'James Chen',
    age: 68,
    cohort: 'seniors',
    enrolled_date: '2025-01-20',
    contact: { phone: '+1-555-0201', email: 'james.c@example.com' },
    address: { street: '456 Maple Street', city: 'Urban Blue Zone', state: 'CA', zip: '90210' },
    emergency_contact: { name: 'Linda Chen', phone: '+1-555-0202', relationship: 'Spouse' },
    health_conditions: ['arthritis'],
    medications: ['ibuprofen'],
    baseline_vitals: { heart_rate: 68, blood_pressure_systolic: 128, blood_pressure_diastolic: 78, spo2: 98 }
  },
  {
    resident_id: 'demo-003',
    name: 'Sarah Johnson',
    age: 45,
    cohort: 'adults',
    enrolled_date: '2025-02-01',
    contact: { phone: '+1-555-0301', email: 'sarah.j@example.com' },
    address: { street: '789 Pine Road', city: 'Urban Blue Zone', state: 'CA', zip: '90210' },
    emergency_contact: { name: 'Michael Johnson', phone: '+1-555-0302', relationship: 'Spouse' },
    health_conditions: [],
    medications: [],
    baseline_vitals: { heart_rate: 72, blood_pressure_systolic: 118, blood_pressure_diastolic: 75, spo2: 99 }
  },
  {
    resident_id: 'demo-004',
    name: 'David Kim',
    age: 58,
    cohort: 'adults',
    enrolled_date: '2025-02-10',
    contact: { phone: '+1-555-0401', email: 'david.k@example.com' },
    address: { street: '321 Elm Boulevard', city: 'Urban Blue Zone', state: 'CA', zip: '90210' },
    emergency_contact: { name: 'Grace Kim', phone: '+1-555-0402', relationship: 'Daughter' },
    health_conditions: ['high_cholesterol'],
    medications: ['atorvastatin'],
    baseline_vitals: { heart_rate: 70, blood_pressure_systolic: 125, blood_pressure_diastolic: 80, spo2: 98 }
  },
  {
    resident_id: 'demo-005',
    name: 'Emma Martinez',
    age: 16,
    cohort: 'teens',
    enrolled_date: '2025-02-15',
    contact: { phone: '+1-555-0501', email: 'emma.m@example.com' },
    address: { street: '555 Cedar Lane', city: 'Urban Blue Zone', state: 'CA', zip: '90210' },
    emergency_contact: { name: 'Rosa Martinez', phone: '+1-555-0502', relationship: 'Mother' },
    health_conditions: [],
    medications: [],
    baseline_vitals: { heart_rate: 65, blood_pressure_systolic: 112, blood_pressure_diastolic: 70, spo2: 99 }
  }
];

// Generate vitals data for the last 30 days
function generateVitalsData(residentId, baseline, daysBack = 30) {
  const vitals = [];
  const now = Date.now();

  for (let i = 0; i < daysBack; i++) {
    const timestamp = now - (i * 24 * 60 * 60 * 1000);

    // Add some realistic variation
    const variation = Math.sin(i / 3) * 5;

    vitals.push({
      resident_id: residentId,
      timestamp: timestamp,
      vital_type: 'comprehensive',
      heart_rate: Math.round(baseline.heart_rate + variation + (Math.random() * 4 - 2)),
      blood_pressure_systolic: Math.round(baseline.blood_pressure_systolic + variation + (Math.random() * 6 - 3)),
      blood_pressure_diastolic: Math.round(baseline.blood_pressure_diastolic + (variation / 2) + (Math.random() * 4 - 2)),
      spo2: Math.round(baseline.spo2 + (Math.random() * 2 - 1)),
      recorded_at: new Date(timestamp).toISOString()
    });
  }

  return vitals;
}

// Generate habit check-in data
function generateCheckinsData(residentId, daysBack = 30) {
  const checkins = [];
  const now = Date.now();

  for (let i = 0; i < daysBack; i++) {
    const timestamp = now - (i * 24 * 60 * 60 * 1000);
    const dayScore = 0.7 + (Math.random() * 0.3); // 70-100% completion

    checkins.push({
      resident_id: residentId,
      timestamp: timestamp,
      habits: {
        movement_score: Math.round((0.6 + Math.random() * 0.4) * 100), // 60-100
        stress_level: Math.round(Math.random() * 10), // 0-10
        plant_slant_meals: Math.round(Math.random() * 3), // 0-3
        social_interactions: Math.round(Math.random() * 5), // 0-5
        purpose_pulse: Math.round((0.5 + Math.random() * 0.5) * 10) // 5-10
      },
      recorded_at: new Date(timestamp).toISOString()
    });
  }

  return checkins;
}

// Generate UBZI aggregation data
function generateAggregationData(residentId) {
  const now = Date.now();
  const currentUBZI = 65 + Math.random() * 30; // 65-95

  return {
    resident_id: residentId,
    timestamp: now,
    period: 'daily',
    ubzi_score: Math.round(currentUBZI),
    vitals_score: Math.round(60 + Math.random() * 35),
    habits_score: Math.round(65 + Math.random() * 30),
    trend_7d: (Math.random() * 10 - 2).toFixed(1), // -2 to +8
    trend_30d: (Math.random() * 15 - 3).toFixed(1), // -3 to +12
    calculated_at: new Date(now).toISOString()
  };
}

// Generate sample alerts
function generateAlerts() {
  const now = Date.now();
  const alerts = [];

  // Recent alert for demo-001 (Maria)
  alerts.push({
    alert_id: `alert-${Date.now()}-001`,
    resident_id: 'demo-001',
    timestamp: now - (2 * 60 * 60 * 1000), // 2 hours ago
    severity: 'high',
    type: 'vitals',
    message: 'Blood pressure elevated: 152/88 mmHg',
    metric: 'blood_pressure_systolic',
    value: 152,
    threshold: 140,
    status: 'active',
    created_at: new Date(now - (2 * 60 * 60 * 1000)).toISOString()
  });

  // Resolved alert for demo-004 (David)
  alerts.push({
    alert_id: `alert-${Date.now()}-002`,
    resident_id: 'demo-004',
    timestamp: now - (24 * 60 * 60 * 1000), // 1 day ago
    severity: 'medium',
    type: 'habits',
    message: 'Low movement score: 42/100',
    metric: 'movement_score',
    value: 42,
    threshold: 50,
    status: 'resolved',
    created_at: new Date(now - (24 * 60 * 60 * 1000)).toISOString(),
    resolved_at: new Date(now - (12 * 60 * 60 * 1000)).toISOString()
  });

  return alerts;
}

// Batch write helper
async function batchWrite(tableName, items) {
  const batchSize = 25; // DynamoDB batch write limit

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const putRequests = batch.map(item => ({
      PutRequest: { Item: item }
    }));

    try {
      await docClient.send(new BatchWriteCommand({
        RequestItems: {
          [tableName]: putRequests
        }
      }));
      console.log(`  ✓ Wrote ${putRequests.length} items to ${tableName}`);
    } catch (error) {
      console.error(`  ✗ Error writing to ${tableName}:`, error.message);
      throw error;
    }
  }
}

// Main seeding function
async function seedData() {
  console.log('========================================');
  console.log('Urban Blue Zone - Demo Data Seeder');
  console.log('========================================\n');

  try {
    // Seed residents
    console.log('Seeding residents...');
    for (const resident of demoResidents) {
      await docClient.send(new PutCommand({
        TableName: config.tables.residents,
        Item: resident
      }));
    }
    console.log(`  ✓ Seeded ${demoResidents.length} residents\n`);

    // Seed vitals
    console.log('Seeding vitals data...');
    for (const resident of demoResidents) {
      const vitals = generateVitalsData(resident.resident_id, resident.baseline_vitals);
      await batchWrite(config.tables.vitals, vitals);
    }
    console.log('  ✓ Completed vitals seeding\n');

    // Seed check-ins
    console.log('Seeding check-in data...');
    for (const resident of demoResidents) {
      const checkins = generateCheckinsData(resident.resident_id);
      await batchWrite(config.tables.checkins, checkins);
    }
    console.log('  ✓ Completed check-ins seeding\n');

    // Seed aggregations
    console.log('Seeding aggregation data...');
    for (const resident of demoResidents) {
      const aggregation = generateAggregationData(resident.resident_id);
      await docClient.send(new PutCommand({
        TableName: config.tables.aggregations,
        Item: aggregation
      }));
    }
    console.log(`  ✓ Seeded ${demoResidents.length} aggregations\n`);

    // Seed alerts
    console.log('Seeding alerts...');
    const alerts = generateAlerts();
    for (const alert of alerts) {
      await docClient.send(new PutCommand({
        TableName: config.tables.alerts,
        Item: alert
      }));
    }
    console.log(`  ✓ Seeded ${alerts.length} alerts\n`);

    console.log('========================================');
    console.log('✓ Demo data seeding completed successfully!');
    console.log('========================================\n');
    console.log('Summary:');
    console.log(`  - Residents: ${demoResidents.length}`);
    console.log(`  - Vitals records: ~${demoResidents.length * 30}`);
    console.log(`  - Check-ins: ~${demoResidents.length * 30}`);
    console.log(`  - Aggregations: ${demoResidents.length}`);
    console.log(`  - Alerts: ${alerts.length}`);

  } catch (error) {
    console.error('\n✗ Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seeder
if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { seedData };
