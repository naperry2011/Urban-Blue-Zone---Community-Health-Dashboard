// UBZI Calculation Utilities

interface HabitData {
  movementScore: number // 1-10
  plantSlant: number    // 1-10
  rightTribe: number    // 1-10
  purposePulse: number  // 1-10
  stressLevel: number   // 1-10 (lower is better)
  downshift: number     // 1-10
}

interface DailyData {
  date: string
  movementScore: number
  plantSlant: number
  ubzi: number
}

export function calculateUBZI(habits: HabitData): number {
  // Weights based on Blue Zone research
  const weights = {
    movement: 0.25,    // Physical activity
    diet: 0.25,        // Plant-based nutrition
    social: 0.15,      // Social connections
    purpose: 0.15,     // Life purpose
    stress: 0.10,      // Stress management (inverted)
    mindfulness: 0.10  // Meditation/downshift
  }

  // Calculate weighted score
  const movementComponent = habits.movementScore * weights.movement * 10
  const dietComponent = habits.plantSlant * weights.diet * 10
  const socialComponent = habits.rightTribe * weights.social * 10
  const purposeComponent = habits.purposePulse * weights.purpose * 10
  const stressComponent = (11 - habits.stressLevel) * weights.stress * 10 // Invert stress (lower is better)
  const mindfulnessComponent = habits.downshift * weights.mindfulness * 10

  const totalScore = movementComponent + dietComponent + socialComponent + 
                    purposeComponent + stressComponent + mindfulnessComponent

  // Ensure score is between 0-100
  return Math.max(0, Math.min(100, Math.round(totalScore)))
}

export function analyzeHabitTrends(data: DailyData[]) {
  if (data.length < 2) {
    return { direction: 'insufficient_data', percentageChange: 0, averageUBZI: 0 }
  }

  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const firstUBZI = sortedData[0].ubzi
  const lastUBZI = sortedData[sortedData.length - 1].ubzi
  const averageUBZI = sortedData.reduce((sum, d) => sum + d.ubzi, 0) / sortedData.length
  
  const percentageChange = ((lastUBZI - firstUBZI) / firstUBZI) * 100
  
  let direction: 'improving' | 'declining' | 'stable'
  if (Math.abs(percentageChange) < 5) {
    direction = 'stable'
  } else if (percentageChange > 0) {
    direction = 'improving'
  } else {
    direction = 'declining'
  }

  return {
    direction,
    percentageChange,
    averageUBZI: Math.round(averageUBZI * 100) / 100
  }
}

export function generateTestHabitData(residentId: string, days: number, trend: 'improving' | 'declining' | 'stable' = 'stable') {
  const data = []
  const baseValues = {
    movementScore: 5,
    plantSlant: 5,
    rightTribe: 6,
    purposePulse: 6,
    stressLevel: 5,
    downshift: 4
  }

  for (let i = 0; i < days; i++) {
    const dayValues = { ...baseValues }
    
    if (trend === 'improving') {
      // Gradual improvement over time
      const improvement = (i / days) * 3 // Up to 3 point improvement
      dayValues.movementScore = Math.min(10, baseValues.movementScore + improvement)
      dayValues.plantSlant = Math.min(10, baseValues.plantSlant + improvement)
      dayValues.stressLevel = Math.max(1, baseValues.stressLevel - improvement)
    } else if (trend === 'declining') {
      // Gradual decline
      const decline = (i / days) * 2
      dayValues.movementScore = Math.max(1, baseValues.movementScore - decline)
      dayValues.plantSlant = Math.max(1, baseValues.plantSlant - decline)
      dayValues.stressLevel = Math.min(10, baseValues.stressLevel + decline)
    }

    // Add some random variation
    Object.keys(dayValues).forEach(key => {
      if (key !== 'stressLevel') {
        dayValues[key] += (Math.random() - 0.5) * 0.5
        dayValues[key] = Math.max(1, Math.min(10, dayValues[key]))
      } else {
        dayValues[key] += (Math.random() - 0.5) * 0.5
        dayValues[key] = Math.max(1, Math.min(10, dayValues[key]))
      }
    })

    const ubzi = calculateUBZI(dayValues)
    const date = new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    data.push({
      residentId,
      date,
      timestamp: new Date(date).toISOString(),
      habits: dayValues,
      ubzi,
      checkins: generateCheckins(dayValues)
    })
  }

  return data
}

function generateCheckins(habits: any) {
  return {
    movement: habits.movementScore > 6,
    meditation: habits.downshift > 5,
    socialInteraction: habits.rightTribe > 7,
    plantBasedMeal: habits.plantSlant > 6,
    purposeActivity: habits.purposePulse > 6
  }
}

export function mockVitalSigns(residentId: string, scenario: 'normal' | 'high_bp' | 'low_oxygen' | 'high_heart_rate' = 'normal') {
  const baseVitals = {
    bloodPressure: { systolic: 120, diastolic: 80 },
    heartRate: 72,
    oxygenLevel: 98,
    temperature: 98.6
  }

  switch (scenario) {
    case 'high_bp':
      baseVitals.bloodPressure.systolic = 180 + Math.random() * 20
      baseVitals.bloodPressure.diastolic = 95 + Math.random() * 10
      baseVitals.heartRate = 85 + Math.random() * 15
      break
    case 'low_oxygen':
      baseVitals.oxygenLevel = 88 + Math.random() * 5
      baseVitals.heartRate = 90 + Math.random() * 20
      break
    case 'high_heart_rate':
      baseVitals.heartRate = 110 + Math.random() * 20
      break
    default:
      // Add small random variations for normal readings
      baseVitals.bloodPressure.systolic += (Math.random() - 0.5) * 20
      baseVitals.bloodPressure.diastolic += (Math.random() - 0.5) * 10
      baseVitals.heartRate += (Math.random() - 0.5) * 20
      baseVitals.oxygenLevel += (Math.random() - 0.5) * 4
  }

  return {
    residentId,
    timestamp: new Date().toISOString(),
    vitals: baseVitals
  }
}

export function mockResidentData(cohort: 'senior' | 'adult' | 'teen' | 'chronic' = 'adult') {
  const residents = {
    senior: [
      { id: 'sr001', name: 'Margaret Johnson', age: 78, conditions: ['hypertension'] },
      { id: 'sr002', name: 'Robert Wilson', age: 82, conditions: ['diabetes'] },
      { id: 'sr003', name: 'Dorothy Martinez', age: 75, conditions: [] }
    ],
    adult: [
      { id: 'ad001', name: 'Jennifer Chen', age: 42, conditions: [] },
      { id: 'ad002', name: 'Michael Brown', age: 38, conditions: ['anxiety'] },
      { id: 'ad003', name: 'Sarah Davis', age: 45, conditions: [] }
    ],
    teen: [
      { id: 'tn001', name: 'Alex Rodriguez', age: 16, conditions: [] },
      { id: 'tn002', name: 'Emma Thompson', age: 17, conditions: ['asthma'] },
      { id: 'tn003', name: 'Noah Kim', age: 15, conditions: [] }
    ],
    chronic: [
      { id: 'ch001', name: 'David Lee', age: 55, conditions: ['diabetes', 'hypertension'] },
      { id: 'ch002', name: 'Lisa Anderson', age: 48, conditions: ['arthritis'] },
      { id: 'ch003', name: 'James White', age: 62, conditions: ['heart_disease'] }
    ]
  }

  return residents[cohort].map(resident => ({
    ...resident,
    cohort,
    enrollmentDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    currentUBZI: 50 + Math.random() * 40, // 50-90 range
    contactInfo: {
      phone: `+1555${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      email: `${resident.name.toLowerCase().replace(' ', '.')}@example.com`,
      emergencyContact: 'Family Member'
    }
  }))
}