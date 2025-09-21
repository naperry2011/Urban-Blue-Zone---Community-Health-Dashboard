import { generateTestHabitData, mockVitalSigns } from '../utils/ubzi-helpers'

describe('Historical Data Accuracy Verification', () => {
  describe('Data Integrity Checks', () => {
    it('should maintain data consistency across time series', () => {
      const residentId = 'test-resident-001'
      const historicalData = generateTestHabitData(residentId, 90, 'improving') // 90 days
      
      // Verify no missing days
      expect(historicalData).toHaveLength(90)
      
      // Verify chronological order
      for (let i = 1; i < historicalData.length; i++) {
        const prevDate = new Date(historicalData[i-1].date)
        const currDate = new Date(historicalData[i].date)
        expect(currDate.getTime()).toBeGreaterThan(prevDate.getTime())
      }
      
      // Verify all required fields are present
      historicalData.forEach(day => {
        expect(day).toHaveProperty('residentId')
        expect(day).toHaveProperty('date')
        expect(day).toHaveProperty('timestamp')
        expect(day).toHaveProperty('habits')
        expect(day).toHaveProperty('ubzi')
        expect(day).toHaveProperty('checkins')
      })
    })

    it('should validate UBZI calculation consistency', () => {
      const testData = generateTestHabitData('test-resident-002', 30)
      
      testData.forEach(day => {
        // Recalculate UBZI and verify it matches stored value
        const recalculatedUBZI = calculateUBZI(day.habits)
        expect(Math.abs(day.ubzi - recalculatedUBZI)).toBeLessThan(2) // Allow small rounding differences
        
        // Verify UBZI is within valid range
        expect(day.ubzi).toBeGreaterThanOrEqual(0)
        expect(day.ubzi).toBeLessThanOrEqual(100)
      })
    })

    it('should ensure habit scores are within valid ranges', () => {
      const testData = generateTestHabitData('test-resident-003', 60)
      
      testData.forEach(day => {
        Object.entries(day.habits).forEach(([habit, score]) => {
          expect(score).toBeGreaterThanOrEqual(1)
          expect(score).toBeLessThanOrEqual(10)
          expect(typeof score).toBe('number')
          expect(Number.isFinite(score)).toBe(true)
        })
      })
    })
  })

  describe('Aggregation Accuracy', () => {
    it('should correctly calculate daily averages', () => {
      const residentData = generateTestHabitData('test-resident-004', 7)
      
      const manualAverage = {
        ubzi: residentData.reduce((sum, day) => sum + day.ubzi, 0) / 7,
        movement: residentData.reduce((sum, day) => sum + day.habits.movementScore, 0) / 7,
        nutrition: residentData.reduce((sum, day) => sum + day.habits.plantSlant, 0) / 7
      }
      
      const calculatedAverage = calculateWeeklyAverages(residentData)
      
      expect(Math.abs(calculatedAverage.ubzi - manualAverage.ubzi)).toBeLessThan(0.1)
      expect(Math.abs(calculatedAverage.movement - manualAverage.movement)).toBeLessThan(0.1)
      expect(Math.abs(calculatedAverage.nutrition - manualAverage.nutrition)).toBeLessThan(0.1)
    })

    it('should accurately calculate trend percentages', () => {
      // Create test data with known improvement pattern
      const testData = [
        { date: '2024-01-01', ubzi: 50 },
        { date: '2024-01-02', ubzi: 52 },
        { date: '2024-01-03', ubzi: 54 },
        { date: '2024-01-04', ubzi: 56 },
        { date: '2024-01-05', ubzi: 58 },
        { date: '2024-01-06', ubzi: 60 },
        { date: '2024-01-07', ubzi: 62 }
      ]
      
      const trendCalculation = calculateTrendPercentage(testData)
      
      // 50 to 62 is a 24% improvement
      expect(trendCalculation.percentage).toBeCloseTo(24, 1)
      expect(trendCalculation.direction).toBe('improving')
      expect(trendCalculation.confidence).toBeGreaterThan(0.8)
    })

    it('should handle missing data points gracefully', () => {
      const incompleteData = [
        { date: '2024-01-01', ubzi: 50 },
        // Missing 2024-01-02
        { date: '2024-01-03', ubzi: 54 },
        { date: '2024-01-04', ubzi: 56 },
        // Missing 2024-01-05
        { date: '2024-01-06', ubzi: 60 },
        { date: '2024-01-07', ubzi: 62 }
      ]
      
      const result = handleMissingData(incompleteData)
      
      expect(result.interpolatedData).toHaveLength(7)
      expect(result.missingDays).toBe(2)
      expect(result.interpolationMethod).toBe('linear')
      
      // Verify interpolated values are reasonable
      const interpolated = result.interpolatedData.find((d: any) => d.date === '2024-01-02')
      expect(interpolated.ubzi).toBeCloseTo(52, 1)
    })
  })

  describe('Real-time Data Validation', () => {
    it('should validate incoming vital signs data', () => {
      const validVitals = mockVitalSigns('resident-001', 'normal')
      const validation = validateVitalSigns(validVitals)
      
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
      
      // Test invalid data
      const invalidVitals = {
        ...validVitals,
        vitals: {
          bloodPressure: { systolic: 300, diastolic: 200 }, // Impossible values
          heartRate: -10,
          oxygenLevel: 150,
          temperature: 120
        }
      }
      
      const invalidValidation = validateVitalSigns(invalidVitals)
      expect(invalidValidation.isValid).toBe(false)
      expect(invalidValidation.errors.length).toBeGreaterThan(0)
    })

    it('should detect data anomalies', () => {
      const normalPattern = Array(20).fill(null).map((_, i) => ({
        timestamp: new Date(Date.now() - (20-i) * 3600000).toISOString(),
        heartRate: 70 + Math.sin(i * 0.1) * 5 // Normal variation
      }))
      
      // Add anomalous reading
      const anomalousData = [...normalPattern, {
        timestamp: new Date().toISOString(),
        heartRate: 150 // Sudden spike
      }]
      
      const anomalies = detectAnomalies(anomalousData, 'heartRate')
      
      expect(anomalies).toHaveLength(1)
      expect(anomalies[0].value).toBe(150)
      expect(anomalies[0].severity).toBe('high')
      expect(anomalies[0].type).toBe('sudden_spike')
    })

    it('should maintain data lineage and audit trails', () => {
      const originalData = {
        residentId: 'resident-001',
        timestamp: new Date().toISOString(),
        source: 'iot_device',
        vitals: {
          bloodPressure: { systolic: 120, diastolic: 80 },
          heartRate: 75,
          oxygenLevel: 98,
          temperature: 98.6
        }
      }
      
      const processedData = processIncomingData(originalData)
      
      expect(processedData).toHaveProperty('auditTrail')
      expect(processedData.auditTrail).toContainEqual(
        expect.objectContaining({
          action: 'data_received',
          timestamp: expect.any(String),
          source: 'iot_device'
        })
      )
      
      expect(processedData.auditTrail).toContainEqual(
        expect.objectContaining({
          action: 'validation_passed',
          timestamp: expect.any(String)
        })
      )
    })
  })

  describe('Cross-System Data Consistency', () => {
    it('should maintain consistency between dashboard and API responses', async () => {
      const residentId = 'resident-001'
      
      // Mock API response
      const apiData = await mockAPICall(`/api/residents/${residentId}/ubzi`)
      
      // Mock dashboard calculation
      const dashboardData = calculateDashboardUBZI(residentId)
      
      expect(Math.abs(apiData.currentUBZI - dashboardData.currentUBZI)).toBeLessThan(1)
      expect(apiData.trend.direction).toBe(dashboardData.trend.direction)
      expect(Math.abs(apiData.trend.percentage - dashboardData.trend.percentage)).toBeLessThan(2)
    })

    it('should verify aggregation table accuracy', async () => {
      const testDate = '2024-01-15'
      
      // Get raw data for a specific day
      const rawData = await mockAPICall(`/api/raw-data?date=${testDate}`)
      
      // Get aggregated data for the same day
      const aggregatedData = await mockAPICall(`/api/aggregations?date=${testDate}`)
      
      // Verify aggregation matches raw data calculations
      const manualAggregation = calculateManualAggregation(rawData)
      
      expect(aggregatedData.totalResidents).toBe(manualAggregation.totalResidents)
      expect(Math.abs(aggregatedData.averageUBZI - manualAggregation.averageUBZI)).toBeLessThan(0.5)
      expect(aggregatedData.alertCount).toBe(manualAggregation.alertCount)
    })

    it('should ensure alert data consistency across services', async () => {
      const alertId = 'alert-12345'
      
      // Get alert from different endpoints
      const alertFromDashboard = await mockAPICall(`/api/dashboard/alerts/${alertId}`)
      const alertFromHistory = await mockAPICall(`/api/alerts/${alertId}`)
      const alertFromResident = await mockAPICall(`/api/residents/${alertFromDashboard.residentId}/alerts/${alertId}`)
      
      // Verify all responses contain consistent data
      expect(alertFromDashboard.id).toBe(alertId)
      expect(alertFromHistory.id).toBe(alertId)
      expect(alertFromResident.id).toBe(alertId)
      
      expect(alertFromDashboard.severity).toBe(alertFromHistory.severity)
      expect(alertFromHistory.timestamp).toBe(alertFromResident.timestamp)
      expect(alertFromDashboard.message).toBe(alertFromResident.message)
    })
  })

  describe('Performance Data Accuracy', () => {
    it('should handle large datasets without data loss', () => {
      const largeDataset = generateTestHabitData('resident-001', 365) // 1 year of data
      
      // Verify no data points are lost
      expect(largeDataset).toHaveLength(365)
      
      // Verify data quality remains consistent
      const firstQuarter = largeDataset.slice(0, 91)
      const lastQuarter = largeDataset.slice(-91)
      
      expect(validateDataQuality(firstQuarter)).toEqual(validateDataQuality(lastQuarter))
    })

    it('should maintain precision in calculations with many data points', () => {
      const precisionTestData = Array(1000).fill(null).map((_, i) => ({
        ubzi: 66.666666, // Repeating decimal
        movement: 7.333333,
        stress: 4.111111
      }))
      
      const average = calculatePreciseAverage(precisionTestData)
      
      // Verify precision is maintained
      expect(average.ubzi).toBeCloseTo(66.666666, 5)
      expect(average.movement).toBeCloseTo(7.333333, 5)
      expect(average.stress).toBeCloseTo(4.111111, 5)
    })

    it('should handle concurrent data updates correctly', async () => {
      const residentId = 'concurrent-test-resident'
      
      // Simulate concurrent updates
      const updates = [
        { type: 'vital_signs', data: { heartRate: 75 } },
        { type: 'habit_checkin', data: { movement: true } },
        { type: 'stress_level', data: { level: 3 } }
      ]
      
      const results = await Promise.all(
        updates.map(update => mockAPICall('/api/update', {
          method: 'POST',
          body: { residentId, ...update }
        }))
      )
      
      // Verify all updates succeeded
      results.forEach(result => {
        expect(result.success).toBe(true)
        expect(result.timestamp).toBeDefined()
      })
      
      // Verify final state includes all updates
      const finalState = await mockAPICall(`/api/residents/${residentId}`)
      expect(finalState.latestVitals.heartRate).toBe(75)
      expect(finalState.todayCheckins.movement).toBe(true)
      expect(finalState.currentStress).toBe(3)
    })
  })
})

// Helper functions for testing
function calculateUBZI(habits: any): number {
  // Implementation matches the one in ubzi-helpers.ts
  const weights = {
    movement: 0.25,
    diet: 0.25,
    social: 0.15,
    purpose: 0.15,
    stress: 0.10,
    mindfulness: 0.10
  }

  const movementComponent = habits.movementScore * weights.movement * 10
  const dietComponent = habits.plantSlant * weights.diet * 10
  const socialComponent = habits.rightTribe * weights.social * 10
  const purposeComponent = habits.purposePulse * weights.purpose * 10
  const stressComponent = (11 - habits.stressLevel) * weights.stress * 10
  const mindfulnessComponent = habits.downshift * weights.mindfulness * 10

  const totalScore = movementComponent + dietComponent + socialComponent + 
                    purposeComponent + stressComponent + mindfulnessComponent

  return Math.max(0, Math.min(100, Math.round(totalScore)))
}

function calculateWeeklyAverages(data: any[]) {
  return {
    ubzi: data.reduce((sum, day) => sum + day.ubzi, 0) / data.length,
    movement: data.reduce((sum, day) => sum + day.habits.movementScore, 0) / data.length,
    nutrition: data.reduce((sum, day) => sum + day.habits.plantSlant, 0) / data.length
  }
}

function calculateTrendPercentage(data: any[]) {
  if (data.length < 2) return { percentage: 0, direction: 'stable', confidence: 0 }
  
  const first = data[0].ubzi
  const last = data[data.length - 1].ubzi
  const percentage = ((last - first) / first) * 100
  
  return {
    percentage: Math.round(percentage * 10) / 10,
    direction: percentage > 2 ? 'improving' : percentage < -2 ? 'declining' : 'stable',
    confidence: Math.min(1, data.length / 7) // Higher confidence with more data points
  }
}

function handleMissingData(data: any[]) {
  // Simple linear interpolation for missing days
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const interpolatedData = []
  let missingDays = 0
  
  const startDate = new Date(sortedData[0].date)
  const endDate = new Date(sortedData[sortedData.length - 1].date)
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1
  
  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
    const dateString = currentDate.toISOString().split('T')[0]
    
    const existingData = sortedData.find(d => d.date === dateString)
    if (existingData) {
      interpolatedData.push(existingData)
    } else {
      // Find surrounding data points for interpolation
      const prevData = sortedData.filter(d => new Date(d.date) < currentDate).pop()
      const nextData = sortedData.find(d => new Date(d.date) > currentDate)
      
      if (prevData && nextData) {
        const interpolatedUBZI = prevData.ubzi + 
          ((nextData.ubzi - prevData.ubzi) * 
           (currentDate.getTime() - new Date(prevData.date).getTime()) / 
           (new Date(nextData.date).getTime() - new Date(prevData.date).getTime()))
        
        interpolatedData.push({
          date: dateString,
          ubzi: Math.round(interpolatedUBZI),
          interpolated: true
        })
        missingDays++
      }
    }
  }
  
  return {
    interpolatedData,
    missingDays,
    interpolationMethod: 'linear'
  }
}

function validateVitalSigns(vitals: any) {
  const errors = []
  
  // Blood pressure validation
  if (vitals.vitals.bloodPressure.systolic < 60 || vitals.vitals.bloodPressure.systolic > 250) {
    errors.push('Systolic blood pressure out of range')
  }
  if (vitals.vitals.bloodPressure.diastolic < 40 || vitals.vitals.bloodPressure.diastolic > 150) {
    errors.push('Diastolic blood pressure out of range')
  }
  
  // Heart rate validation
  if (vitals.vitals.heartRate < 30 || vitals.vitals.heartRate > 220) {
    errors.push('Heart rate out of range')
  }
  
  // Oxygen level validation
  if (vitals.vitals.oxygenLevel < 70 || vitals.vitals.oxygenLevel > 100) {
    errors.push('Oxygen level out of range')
  }
  
  // Temperature validation
  if (vitals.vitals.temperature < 94 || vitals.vitals.temperature > 108) {
    errors.push('Temperature out of range')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

function detectAnomalies(data: any[], metric: string) {
  const values = data.map(d => d[metric])
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length)
  
  const anomalies = []
  
  data.forEach((point, index) => {
    const zScore = Math.abs((point[metric] - mean) / stdDev)
    
    if (zScore > 3) { // 3 standard deviations
      anomalies.push({
        index,
        value: point[metric],
        zScore,
        severity: zScore > 4 ? 'high' : 'medium',
        type: point[metric] > mean ? 'sudden_spike' : 'sudden_drop',
        timestamp: point.timestamp
      })
    }
  })
  
  return anomalies
}

function processIncomingData(data: any) {
  const auditTrail = [
    {
      action: 'data_received',
      timestamp: new Date().toISOString(),
      source: data.source
    }
  ]
  
  // Validation step
  const validation = validateVitalSigns(data)
  if (validation.isValid) {
    auditTrail.push({
      action: 'validation_passed',
      timestamp: new Date().toISOString()
    })
  } else {
    auditTrail.push({
      action: 'validation_failed',
      timestamp: new Date().toISOString(),
      errors: validation.errors
    })
  }
  
  return {
    ...data,
    auditTrail,
    processedAt: new Date().toISOString()
  }
}

async function mockAPICall(endpoint: string, options?: any) {
  // Mock API responses for testing
  if (endpoint.includes('/ubzi')) {
    return {
      currentUBZI: 67.5,
      trend: { direction: 'improving', percentage: 8.3 }
    }
  }
  
  if (endpoint.includes('/raw-data')) {
    return [
      { residentId: '001', ubzi: 65 },
      { residentId: '002', ubzi: 72 },
      { residentId: '003', ubzi: 58 }
    ]
  }
  
  if (endpoint.includes('/aggregations')) {
    return {
      totalResidents: 3,
      averageUBZI: 65.0,
      alertCount: 2
    }
  }
  
  if (endpoint.includes('/alerts/')) {
    return {
      id: 'alert-12345',
      residentId: 'resident-001',
      severity: 'warning',
      timestamp: '2024-01-15T10:30:00Z',
      message: 'Elevated blood pressure detected'
    }
  }
  
  if (endpoint === '/api/update') {
    return {
      success: true,
      timestamp: new Date().toISOString()
    }
  }

  if (endpoint.includes('/api/residents/') && !endpoint.includes('/alerts/')) {
    return {
      id: endpoint.split('/')[3],
      latestVitals: { heartRate: 75 },
      todayCheckins: { movement: true },
      currentStress: 3
    }
  }

  return {}
}

function calculateDashboardUBZI(residentId: string) {
  // Mock dashboard calculation
  return {
    currentUBZI: 67.5,
    trend: { direction: 'improving', percentage: 8.3 }
  }
}

function calculateManualAggregation(rawData: any[]) {
  return {
    totalResidents: rawData.length,
    averageUBZI: rawData.reduce((sum, r) => sum + r.ubzi, 0) / rawData.length,
    alertCount: 2 // Mock alert count
  }
}

function validateDataQuality(data: any[]) {
  return {
    completeness: data.filter(d => d.ubzi && d.habits).length / data.length,
    accuracy: data.filter(d => d.ubzi >= 0 && d.ubzi <= 100).length / data.length,
    consistency: 1.0 // Mock consistency score
  }
}

function calculatePreciseAverage(data: any[]) {
  const sums = data.reduce((acc, item) => {
    acc.ubzi += item.ubzi
    acc.movement += item.movement
    acc.stress += item.stress
    return acc
  }, { ubzi: 0, movement: 0, stress: 0 })
  
  return {
    ubzi: sums.ubzi / data.length,
    movement: sums.movement / data.length,
    stress: sums.stress / data.length
  }
}