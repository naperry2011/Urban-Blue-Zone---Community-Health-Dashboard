const { faker } = require('@faker-js/faker')

// Generate test resident IDs for load testing
function generateResidentId(context, events, done) {
  const cohorts = ['senior', 'adult', 'teen', 'chronic']
  const cohort = cohorts[Math.floor(Math.random() * cohorts.length)]
  const id = `${cohort}-${faker.string.alphanumeric(6)}`
  
  context.vars.residentId = id
  return done()
}

// Generate realistic vital signs data
function generateVitalSigns(context, events, done) {
  const scenarios = ['normal', 'high_bp', 'low_oxygen', 'high_heart_rate']
  const scenario = Math.random() > 0.8 ? scenarios[Math.floor(Math.random() * scenarios.length)] : 'normal'
  
  let vitals = {
    bloodPressure: { systolic: 120, diastolic: 80 },
    heartRate: 72,
    oxygenLevel: 98,
    temperature: 98.6
  }
  
  switch (scenario) {
    case 'high_bp':
      vitals.bloodPressure.systolic = 160 + Math.random() * 40
      vitals.bloodPressure.diastolic = 90 + Math.random() * 20
      vitals.heartRate = 80 + Math.random() * 20
      break
    case 'low_oxygen':
      vitals.oxygenLevel = 85 + Math.random() * 10
      vitals.heartRate = 85 + Math.random() * 25
      break
    case 'high_heart_rate':
      vitals.heartRate = 100 + Math.random() * 30
      break
    default:
      // Add normal variation
      vitals.bloodPressure.systolic += (Math.random() - 0.5) * 20
      vitals.bloodPressure.diastolic += (Math.random() - 0.5) * 10
      vitals.heartRate += (Math.random() - 0.5) * 20
      vitals.oxygenLevel += (Math.random() - 0.5) * 4
      vitals.temperature += (Math.random() - 0.5) * 2
  }
  
  context.vars.timestamp = new Date().toISOString()
  context.vars.vitals = vitals
  return done()
}

// Generate habit check-in data
function generateHabitCheckin(context, events, done) {
  const habits = {
    movementScore: Math.floor(Math.random() * 10) + 1,
    plantSlant: Math.floor(Math.random() * 10) + 1,
    rightTribe: Math.floor(Math.random() * 10) + 1,
    purposePulse: Math.floor(Math.random() * 10) + 1,
    stressLevel: Math.floor(Math.random() * 10) + 1,
    downshift: Math.floor(Math.random() * 10) + 1
  }
  
  const checkins = {
    movement: habits.movementScore > 6,
    meditation: habits.downshift > 5,
    socialInteraction: habits.rightTribe > 7,
    plantBasedMeal: habits.plantSlant > 6,
    purposeActivity: habits.purposePulse > 6
  }
  
  context.vars.habits = habits
  context.vars.checkins = checkins
  return done()
}

// Generate random string for authentication
function randomString() {
  return faker.string.alphanumeric(32)
}

// Generate test report
function generateReport(context, events, done) {
  console.log('\n--- Load Test Report ---')
  console.log(`Test completed at: ${new Date().toISOString()}`)
  console.log('Summary:')
  console.log('- Simulated 100 concurrent users')
  console.log('- Tested all major endpoints')
  console.log('- Mixed read/write operations')
  console.log('- Realistic data patterns')
  console.log('\nCheck Artillery output for detailed metrics')
  return done()
}

module.exports = {
  generateResidentId,
  generateVitalSigns,
  generateHabitCheckin,
  randomString,
  generateReport
}