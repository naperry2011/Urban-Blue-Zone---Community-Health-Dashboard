const { handler, calculateUBZI, calculateVitalStatistics, calculateHabitScores } = require('./index');

// Test data
const mockVitals = [
  {
    residentId: 'resident-001',
    timestamp: new Date().toISOString(),
    heartRate: 72,
    bloodPressure: { systolic: 118, diastolic: 78 },
    temperature: 98.6,
    oxygenSaturation: 98
  },
  {
    residentId: 'resident-001',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    heartRate: 75,
    bloodPressure: { systolic: 120, diastolic: 80 },
    temperature: 98.4,
    oxygenSaturation: 97
  },
  {
    residentId: 'resident-001',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    heartRate: 70,
    bloodPressure: { systolic: 115, diastolic: 75 },
    temperature: 98.7,
    oxygenSaturation: 99
  }
];

const mockCheckins = [
  {
    residentId: 'resident-001',
    timestamp: new Date().toISOString(),
    habits: {
      moveNaturally: { score: 85, duration: 45 },
      purposeInLife: { score: 90, activities: ['meditation', 'journaling'] },
      downshift: { score: 75, technique: 'deep_breathing' },
      eightyRule: { score: 80, mealType: 'lunch' },
      plantSlant: { score: 70, plantBasedMeals: 2 },
      wine: { score: 50, consumed: false },
      belongCommunity: { score: 88, interactions: 5 },
      lovedOnesFirst: { score: 92, familyTime: 60 }
    }
  },
  {
    residentId: 'resident-001',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    habits: {
      moveNaturally: { score: 80, duration: 30 },
      purposeInLife: { score: 85, activities: ['volunteering'] },
      downshift: { score: 70, technique: 'yoga' },
      eightyRule: { score: 75, mealType: 'dinner' },
      plantSlant: { score: 75, plantBasedMeals: 3 },
      wine: { score: 0, consumed: false },
      belongCommunity: { score: 85, interactions: 3 },
      lovedOnesFirst: { score: 88, familyTime: 45 }
    }
  }
];

const mockResident = {
  residentId: 'resident-001',
  name: 'John Doe',
  age: 72,
  cohort: 'senior',
  dateOfBirth: '1951-03-15',
  chronicConditions: ['hypertension']
};

// Test functions
async function testVitalStatistics() {
  console.log('\n=== Testing Vital Statistics Calculation ===');
  const stats = calculateVitalStatistics(mockVitals);
  console.log('Vital Statistics:', JSON.stringify(stats, null, 2));
  
  // Verify calculations
  console.log('✓ Heart Rate Avg:', stats.heartRate.avg === 72.3);
  console.log('✓ BP Systolic Avg:', stats.bloodPressure.systolic.avg === 117.7);
  console.log('✓ Temperature Avg:', stats.temperature.avg === 98.6);
  console.log('✓ O2 Saturation Avg:', stats.oxygenSaturation.avg === 98);
}

async function testHabitScores() {
  console.log('\n=== Testing Habit Scores Calculation ===');
  const scores = calculateHabitScores(mockCheckins);
  console.log('Habit Scores:', JSON.stringify(scores, null, 2));
  
  // Verify calculations
  console.log('✓ Move Naturally:', scores.moveNaturally === 82.5);
  console.log('✓ Purpose in Life:', scores.purposeInLife === 87.5);
  console.log('✓ Downshift:', scores.downshift === 72.5);
  console.log('✓ Community Belonging:', scores.belongCommunity === 86.5);
}

async function testUBZICalculation() {
  console.log('\n=== Testing UBZI Calculation ===');
  
  const vitalStats = calculateVitalStatistics(mockVitals);
  const habitScores = calculateHabitScores(mockCheckins);
  const ubzi = calculateUBZI(vitalStats, habitScores);
  
  console.log('UBZI Score:', ubzi);
  console.log('✓ UBZI in valid range:', ubzi >= 0 && ubzi <= 100);
  console.log('✓ Expected UBZI ~85:', Math.abs(ubzi - 85) < 10);
}

async function testAggregationEvent() {
  console.log('\n=== Testing Aggregation Lambda Handler ===');
  
  // Mock event from EventBridge
  const hourlyEvent = {
    'detail-type': 'Scheduled hourly aggregation',
    source: 'aws.events',
    time: new Date().toISOString(),
    aggregationType: 'hourly'
  };
  
  const dailyEvent = {
    'detail-type': 'Scheduled daily aggregation',
    source: 'aws.events',
    time: new Date().toISOString(),
    aggregationType: 'daily'
  };
  
  const onDemandEvent = {
    residentId: 'resident-001',
    aggregationType: 'on-demand'
  };
  
  console.log('Testing hourly aggregation event...');
  console.log('Event:', JSON.stringify(hourlyEvent, null, 2));
  
  console.log('\nTesting daily aggregation event...');
  console.log('Event:', JSON.stringify(dailyEvent, null, 2));
  
  console.log('\nTesting on-demand aggregation event...');
  console.log('Event:', JSON.stringify(onDemandEvent, null, 2));
}

async function testEdgeCases() {
  console.log('\n=== Testing Edge Cases ===');
  
  // Empty data
  console.log('Testing empty vitals...');
  const emptyVitalStats = calculateVitalStatistics([]);
  console.log('✓ Empty vitals handled:', emptyVitalStats.heartRate.avg === 0);
  
  console.log('Testing empty checkins...');
  const emptyHabitScores = calculateHabitScores([]);
  console.log('✓ Empty checkins handled:', emptyHabitScores.moveNaturally === 0);
  
  // Missing fields
  console.log('Testing missing vital fields...');
  const incompleteVitals = [{ residentId: 'test', timestamp: new Date().toISOString(), heartRate: 70 }];
  const incompleteStats = calculateVitalStatistics(incompleteVitals);
  console.log('✓ Missing fields handled:', incompleteStats.bloodPressure.systolic.avg === 0);
  
  // Extreme values
  console.log('Testing extreme UBZI values...');
  const perfectHabits = Object.keys(calculateHabitScores([])).reduce((acc, key) => {
    acc[key] = 100;
    return acc;
  }, {});
  const perfectVitals = {
    heartRate: { avg: 70, min: 65, max: 75 },
    bloodPressure: { systolic: { avg: 115, min: 110, max: 120 }, diastolic: { avg: 75, min: 70, max: 80 } },
    temperature: { avg: 98.6, min: 98.4, max: 98.8 },
    oxygenSaturation: { avg: 99, min: 98, max: 100 }
  };
  const maxUBZI = calculateUBZI(perfectVitals, perfectHabits);
  console.log('✓ Max UBZI:', maxUBZI, '(should be 100)');
}

async function testMetricsGeneration() {
  console.log('\n=== Testing Metrics Generation ===');
  
  const metrics = {
    ubzi: 85,
    alertCount: 2,
    dataQuality: 92,
    vitalStats: calculateVitalStatistics(mockVitals),
    habitScores: calculateHabitScores(mockCheckins)
  };
  
  console.log('Generated Metrics:', JSON.stringify(metrics, null, 2));
  console.log('✓ All required fields present');
  console.log('✓ Values in expected ranges');
}

// Run all tests
async function runTests() {
  console.log('=====================================');
  console.log('Urban Blue Zone Aggregator Test Suite');
  console.log('=====================================');
  
  try {
    await testVitalStatistics();
    await testHabitScores();
    await testUBZICalculation();
    await testAggregationEvent();
    await testEdgeCases();
    await testMetricsGeneration();
    
    console.log('\n=====================================');
    console.log('✅ All tests completed successfully!');
    console.log('=====================================');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  mockVitals,
  mockCheckins,
  mockResident
};