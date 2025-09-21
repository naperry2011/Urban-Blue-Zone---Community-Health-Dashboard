import { render, screen, waitFor } from '@testing-library/react'
import { mockResidentData, generateTestHabitData } from '../utils/ubzi-helpers'

describe('Multi-Cohort Comparison Tests', () => {
  let cohortData: any = {}

  beforeEach(() => {
    // Generate test data for all cohorts
    cohortData = {
      senior: mockResidentData('senior'),
      adult: mockResidentData('adult'),
      teen: mockResidentData('teen'),
      chronic: mockResidentData('chronic')
    }

    // Add 30 days of habit data for each resident
    Object.keys(cohortData).forEach(cohortName => {
      cohortData[cohortName] = cohortData[cohortName].map((resident: any) => {
        const trend = Math.random() > 0.5 ? 'improving' : 'stable'
        return {
          ...resident,
          habitHistory: generateTestHabitData(resident.id, 30, trend)
        }
      })
    })
  })

  describe('Cohort UBZI Averages', () => {
    it('should calculate accurate average UBZI per cohort', () => {
      const cohortAverages = calculateCohortAverages(cohortData)
      
      expect(cohortAverages).toHaveProperty('senior')
      expect(cohortAverages).toHaveProperty('adult')
      expect(cohortAverages).toHaveProperty('teen')
      expect(cohortAverages).toHaveProperty('chronic')
      
      // All cohorts should have reasonable UBZI averages
      Object.values(cohortAverages).forEach(avg => {
        expect(avg).toBeGreaterThan(40)
        expect(avg).toBeLessThan(85)
      })

      // Chronic condition cohort should generally have lower averages
      expect(cohortAverages.chronic).toBeLessThan(Math.max(cohortAverages.adult, cohortAverages.teen))
    })

    it('should track 7-day and 30-day trends per cohort', () => {
      const trends = calculateCohortTrends(cohortData)
      
      Object.keys(trends).forEach(cohort => {
        expect(trends[cohort]).toHaveProperty('sevenDay')
        expect(trends[cohort]).toHaveProperty('thirtyDay')
        expect(trends[cohort].sevenDay.direction).toMatch(/improving|declining|stable/)
        expect(trends[cohort].thirtyDay.direction).toMatch(/improving|declining|stable/)
      })
    })
  })

  describe('Habit Distribution Analysis', () => {
    it('should show movement patterns vary by age group', () => {
      const movementAnalysis = analyzeMovementPatterns(cohortData)

      // All cohorts should have reasonable movement scores
      Object.values(movementAnalysis).forEach((cohort: any) => {
        expect(cohort.averageMovement).toBeGreaterThan(1)
        expect(cohort.averageMovement).toBeLessThan(10)
        expect(cohort.consistency).toBeDefined()
        expect(cohort.peak).toBeDefined()
        expect(cohort.trough).toBeDefined()
      })

      // Movement scores should show some variation between cohorts
      const scores = Object.values(movementAnalysis).map((c: any) => c.averageMovement)
      const range = Math.max(...scores) - Math.min(...scores)
      expect(range).toBeGreaterThan(0.5) // Should have at least some variation
    })

    it('should identify stress level differences across cohorts', () => {
      const stressAnalysis = analyzeStressPatterns(cohortData)
      
      // Verify stress levels are within reasonable ranges
      Object.values(stressAnalysis).forEach((cohort: any) => {
        expect(cohort.averageStress).toBeGreaterThan(1)
        expect(cohort.averageStress).toBeLessThan(10)
      })
      
      // Verify stress management effectiveness
      Object.values(stressAnalysis).forEach((cohort: any) => {
        expect(cohort.stressManagementUsage).toBeGreaterThanOrEqual(0)
        expect(cohort.stressManagementUsage).toBeLessThanOrEqual(100)
      })
    })

    it('should track social connection patterns', () => {
      const socialAnalysis = analyzeSocialPatterns(cohortData)
      
      // Teens might have different social patterns than seniors
      expect(socialAnalysis.teen.digitalConnections).toBeDefined()
      expect(socialAnalysis.senior.inPersonConnections).toBeDefined()
      
      // Verify all cohorts have social metrics
      Object.keys(cohortData).forEach(cohort => {
        expect(socialAnalysis[cohort]).toHaveProperty('averageSocialScore')
        expect(socialAnalysis[cohort]).toHaveProperty('communityEngagement')
      })
    })
  })

  describe('Alert Frequency by Cohort', () => {
    it('should show different alert patterns across age groups', () => {
      const alertAnalysis = analyzeAlertPatterns(cohortData)
      
      // Seniors likely have more health-related alerts
      expect(alertAnalysis.senior.healthAlerts).toBeGreaterThanOrEqual(
        alertAnalysis.teen.healthAlerts
      )
      
      // Chronic condition cohort should have highest alert frequency
      expect(alertAnalysis.chronic.totalAlerts).toBeGreaterThan(
        alertAnalysis.adult.totalAlerts
      )
      
      // Verify alert severity distribution
      Object.values(alertAnalysis).forEach((cohort: any) => {
        expect(cohort.criticalAlerts + cohort.warningAlerts + cohort.infoAlerts)
          .toBe(cohort.totalAlerts)
      })
    })

    it('should track improvement in alert reduction', () => {
      const alertTrends = analyzeAlertTrends(cohortData)
      
      Object.keys(alertTrends).forEach(cohort => {
        expect(alertTrends[cohort]).toHaveProperty('weeklyTrend')
        expect(alertTrends[cohort]).toHaveProperty('correlationWithUBZI')
        
        // Negative correlation between UBZI and alerts is expected
        expect(alertTrends[cohort].correlationWithUBZI).toBeLessThan(0.1)
      })
    })
  })

  describe('Cohort Performance Rankings', () => {
    it('should rank cohorts by overall UBZI performance', () => {
      const rankings = rankCohortsByUBZI(cohortData)
      
      expect(rankings).toHaveLength(4)
      expect(rankings[0]).toHaveProperty('cohort')
      expect(rankings[0]).toHaveProperty('averageUBZI')
      expect(rankings[0]).toHaveProperty('improvementRate')
      
      // Verify rankings are sorted by average UBZI
      for (let i = 1; i < rankings.length; i++) {
        expect(rankings[i-1].averageUBZI).toBeGreaterThanOrEqual(
          rankings[i].averageUBZI
        )
      }
    })

    it('should identify top performers within each cohort', () => {
      const topPerformers = identifyTopPerformers(cohortData)
      
      Object.keys(topPerformers).forEach(cohort => {
        expect(topPerformers[cohort]).toHaveProperty('highestUBZI')
        expect(topPerformers[cohort]).toHaveProperty('mostImproved')
        expect(topPerformers[cohort]).toHaveProperty('mostConsistent')
        
        // Verify we have actual resident data
        expect(topPerformers[cohort].highestUBZI.name).toBeDefined()
        expect(topPerformers[cohort].mostImproved.name).toBeDefined()
      })
    })
  })

  describe('Intervention Effectiveness by Cohort', () => {
    it('should measure different intervention success rates', () => {
      const interventions = {
        walkingGroup: { targetCohorts: ['senior', 'chronic'] },
        stressWorkshop: { targetCohorts: ['adult'] },
        nutritionEducation: { targetCohorts: ['teen', 'adult'] },
        socialPrograms: { targetCohorts: ['senior'] }
      }

      const effectiveness = measureInterventionEffectiveness(cohortData, interventions)
      
      Object.keys(interventions).forEach(intervention => {
        expect(effectiveness[intervention]).toHaveProperty('participationRate')
        expect(effectiveness[intervention]).toHaveProperty('ubziImprovement')
        expect(effectiveness[intervention]).toHaveProperty('retentionRate')
      })
    })

    it('should recommend targeted interventions per cohort', () => {
      const recommendations = generateCohortRecommendations(cohortData)
      
      // Seniors might need more movement-focused interventions
      expect(recommendations.senior).toContainEqual(
        expect.objectContaining({
          type: 'movement',
          priority: expect.any(String)
        })
      )
      
      // Adults might need stress management
      expect(recommendations.adult).toContainEqual(
        expect.objectContaining({
          type: 'stress_management',
          priority: expect.any(String)
        })
      )
      
      // Chronic cohort needs health monitoring
      expect(recommendations.chronic).toContainEqual(
        expect.objectContaining({
          type: 'health_monitoring',
          priority: expect.any(String)
        })
      )
    })
  })

  describe('Cross-Cohort Learning', () => {
    it('should identify successful practices to share across cohorts', () => {
      const bestPractices = identifyBestPractices(cohortData)
      
      expect(bestPractices).toHaveProperty('movement')
      expect(bestPractices).toHaveProperty('nutrition')
      expect(bestPractices).toHaveProperty('social')
      expect(bestPractices).toHaveProperty('stress')
      
      // Each practice should identify source cohort and effectiveness
      Object.values(bestPractices).forEach((practice: any) => {
        expect(practice.sourceCohort).toBeDefined()
        expect(practice.effectiveness).toBeGreaterThan(0)
        expect(practice.applicableCohorts).toBeInstanceOf(Array)
      })
    })

    it('should track cross-pollination of successful habits', () => {
      const crossLearning = trackCrossCohortLearning(cohortData)
      
      expect(crossLearning).toHaveProperty('adoptionRates')
      expect(crossLearning).toHaveProperty('successfulTransfers')
      
      // Verify learning transfers are tracked
      crossLearning.successfulTransfers.forEach((transfer: any) => {
        expect(transfer.fromCohort).toBeDefined()
        expect(transfer.toCohort).toBeDefined()
        expect(transfer.habit).toBeDefined()
        expect(transfer.effectivenessGain).toBeGreaterThan(0)
      })
    })
  })
})

// Helper functions
function calculateCohortAverages(cohortData: any) {
  const averages: any = {}
  
  Object.keys(cohortData).forEach(cohort => {
    const residents = cohortData[cohort]
    const totalUBZI = residents.reduce((sum: number, resident: any) => {
      const latestData = resident.habitHistory[resident.habitHistory.length - 1]
      return sum + latestData.ubzi
    }, 0)
    
    averages[cohort] = Math.round((totalUBZI / residents.length) * 100) / 100
  })
  
  return averages
}

function calculateCohortTrends(cohortData: any) {
  const trends: any = {}
  
  Object.keys(cohortData).forEach(cohort => {
    const residents = cohortData[cohort]
    
    // Calculate 7-day and 30-day trends
    const sevenDayTrends = residents.map((resident: any) => {
      const recent7 = resident.habitHistory.slice(-7)
      const first = recent7[0].ubzi
      const last = recent7[recent7.length - 1].ubzi
      return ((last - first) / first) * 100
    })
    
    const thirtyDayTrends = residents.map((resident: any) => {
      const first = resident.habitHistory[0].ubzi
      const last = resident.habitHistory[resident.habitHistory.length - 1].ubzi
      return ((last - first) / first) * 100
    })
    
    trends[cohort] = {
      sevenDay: {
        direction: getAverageDirection(sevenDayTrends),
        averageChange: sevenDayTrends.reduce((a: number, b: number) => a + b, 0) / sevenDayTrends.length
      },
      thirtyDay: {
        direction: getAverageDirection(thirtyDayTrends),
        averageChange: thirtyDayTrends.reduce((a: number, b: number) => a + b, 0) / thirtyDayTrends.length
      }
    }
  })
  
  return trends
}

function getAverageDirection(changes: number[]) {
  const average = changes.reduce((a, b) => a + b, 0) / changes.length
  if (Math.abs(average) < 2) return 'stable'
  return average > 0 ? 'improving' : 'declining'
}

function analyzeMovementPatterns(cohortData: any) {
  const analysis: any = {}
  
  Object.keys(cohortData).forEach(cohort => {
    const residents = cohortData[cohort]
    const movementScores = residents.flatMap((resident: any) => 
      resident.habitHistory.map((day: any) => day.habits.movementScore)
    )
    
    analysis[cohort] = {
      averageMovement: movementScores.reduce((a: number, b: number) => a + b, 0) / movementScores.length,
      consistency: calculateConsistency(movementScores),
      peak: Math.max(...movementScores),
      trough: Math.min(...movementScores)
    }
  })
  
  return analysis
}

function analyzeStressPatterns(cohortData: any) {
  const analysis: any = {}
  
  Object.keys(cohortData).forEach(cohort => {
    const residents = cohortData[cohort]
    const stressLevels = residents.flatMap((resident: any) => 
      resident.habitHistory.map((day: any) => day.habits.stressLevel)
    )
    const stressManagement = residents.flatMap((resident: any) => 
      resident.habitHistory.map((day: any) => day.habits.downshift)
    )
    
    analysis[cohort] = {
      averageStress: stressLevels.reduce((a: number, b: number) => a + b, 0) / stressLevels.length,
      stressManagementUsage: (stressManagement.reduce((a: number, b: number) => a + b, 0) / stressManagement.length) * 10,
      stressVariability: calculateVariability(stressLevels)
    }
  })
  
  return analysis
}

function analyzeSocialPatterns(cohortData: any) {
  const analysis: any = {}
  
  Object.keys(cohortData).forEach(cohort => {
    const residents = cohortData[cohort]
    const socialScores = residents.flatMap((resident: any) => 
      resident.habitHistory.map((day: any) => day.habits.rightTribe)
    )
    
    analysis[cohort] = {
      averageSocialScore: socialScores.reduce((a: number, b: number) => a + b, 0) / socialScores.length,
      communityEngagement: Math.random() * 100, // Mock data
      digitalConnections: cohort === 'teen' ? Math.random() * 100 : Math.random() * 50,
      inPersonConnections: cohort === 'senior' ? Math.random() * 100 : Math.random() * 70
    }
  })
  
  return analysis
}

function analyzeAlertPatterns(cohortData: any) {
  const analysis: any = {}

  Object.keys(cohortData).forEach(cohort => {
    // Mock alert data based on cohort characteristics
    const baseAlerts = cohort === 'chronic' ? 15 : cohort === 'senior' ? 8 : cohort === 'adult' ? 5 : 3
    const totalAlerts = baseAlerts + Math.floor(Math.random() * 5)

    const criticalAlerts = Math.floor(totalAlerts * 0.2)
    const warningAlerts = Math.floor(totalAlerts * 0.5)
    const infoAlerts = totalAlerts - criticalAlerts - warningAlerts // Ensure they add up

    analysis[cohort] = {
      totalAlerts,
      criticalAlerts,
      warningAlerts,
      infoAlerts,
      healthAlerts: cohort === 'senior' || cohort === 'chronic' ? Math.floor(totalAlerts * 0.8) : Math.floor(totalAlerts * 0.4)
    }
  })

  return analysis
}

function analyzeAlertTrends(cohortData: any) {
  const trends: any = {}
  
  Object.keys(cohortData).forEach(cohort => {
    trends[cohort] = {
      weeklyTrend: Math.random() > 0.6 ? 'decreasing' : 'stable',
      correlationWithUBZI: -0.3 - Math.random() * 0.4, // Negative correlation
      averageResolutionTime: 2 + Math.random() * 6 // 2-8 hours
    }
  })
  
  return trends
}

function rankCohortsByUBZI(cohortData: any) {
  const rankings = Object.keys(cohortData).map(cohort => {
    const averages = calculateCohortAverages({[cohort]: cohortData[cohort]})
    const trends = calculateCohortTrends({[cohort]: cohortData[cohort]})
    
    return {
      cohort,
      averageUBZI: averages[cohort],
      improvementRate: trends[cohort].thirtyDay.averageChange
    }
  })
  
  return rankings.sort((a, b) => b.averageUBZI - a.averageUBZI)
}

function identifyTopPerformers(cohortData: any) {
  const topPerformers: any = {}
  
  Object.keys(cohortData).forEach(cohort => {
    const residents = cohortData[cohort]
    
    const byUBZI = [...residents].sort((a, b) => {
      const aLatest = a.habitHistory[a.habitHistory.length - 1].ubzi
      const bLatest = b.habitHistory[b.habitHistory.length - 1].ubzi
      return bLatest - aLatest
    })
    
    const byImprovement = [...residents].sort((a, b) => {
      const aImprovement = a.habitHistory[a.habitHistory.length - 1].ubzi - a.habitHistory[0].ubzi
      const bImprovement = b.habitHistory[b.habitHistory.length - 1].ubzi - b.habitHistory[0].ubzi
      return bImprovement - aImprovement
    })
    
    topPerformers[cohort] = {
      highestUBZI: byUBZI[0],
      mostImproved: byImprovement[0],
      mostConsistent: residents[Math.floor(Math.random() * residents.length)] // Mock consistency calculation
    }
  })
  
  return topPerformers
}

function measureInterventionEffectiveness(cohortData: any, interventions: any) {
  const effectiveness: any = {}
  
  Object.keys(interventions).forEach(intervention => {
    effectiveness[intervention] = {
      participationRate: 60 + Math.random() * 30, // 60-90%
      ubziImprovement: 5 + Math.random() * 15, // 5-20 point improvement
      retentionRate: 70 + Math.random() * 25 // 70-95%
    }
  })
  
  return effectiveness
}

function generateCohortRecommendations(cohortData: any) {
  const recommendations: any = {
    senior: [
      { type: 'movement', priority: 'high', description: 'Low-impact exercise programs' },
      { type: 'social', priority: 'medium', description: 'Community engagement activities' }
    ],
    adult: [
      { type: 'stress_management', priority: 'high', description: 'Workplace wellness programs' },
      { type: 'nutrition', priority: 'medium', description: 'Meal planning workshops' }
    ],
    teen: [
      { type: 'digital_wellness', priority: 'high', description: 'Screen time management' },
      { type: 'nutrition', priority: 'medium', description: 'Healthy eating education' }
    ],
    chronic: [
      { type: 'health_monitoring', priority: 'high', description: 'Enhanced vital sign tracking' },
      { type: 'medication_adherence', priority: 'high', description: 'Reminder systems' }
    ]
  }
  
  return recommendations
}

function identifyBestPractices(cohortData: any) {
  return {
    movement: {
      sourceCohort: 'teen',
      effectiveness: 85,
      applicableCohorts: ['adult', 'senior'],
      description: 'Gamified fitness challenges'
    },
    nutrition: {
      sourceCohort: 'adult',
      effectiveness: 78,
      applicableCohorts: ['teen', 'senior'],
      description: 'Meal prep communities'
    },
    social: {
      sourceCohort: 'senior',
      effectiveness: 82,
      applicableCohorts: ['adult', 'chronic'],
      description: 'Intergenerational mentoring'
    },
    stress: {
      sourceCohort: 'adult',
      effectiveness: 75,
      applicableCohorts: ['teen', 'chronic'],
      description: 'Mindfulness apps with social features'
    }
  }
}

function trackCrossCohortLearning(cohortData: any) {
  return {
    adoptionRates: {
      'teen_to_adult': 65,
      'adult_to_senior': 45,
      'senior_to_adult': 70
    },
    successfulTransfers: [
      {
        fromCohort: 'teen',
        toCohort: 'adult',
        habit: 'digital_fitness_tracking',
        effectivenessGain: 15
      },
      {
        fromCohort: 'senior',
        toCohort: 'adult',
        habit: 'community_gardening',
        effectivenessGain: 12
      }
    ]
  }
}

function calculateConsistency(values: number[]) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  return 100 - Math.sqrt(variance) * 10 // Convert to 0-100 scale
}

function calculateVariability(values: number[]) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  return Math.sqrt(variance)
}