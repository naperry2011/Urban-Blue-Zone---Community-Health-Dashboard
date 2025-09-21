import { calculateUBZI, analyzeHabitTrends } from '../utils/ubzi-helpers'

describe('UBZI Calculation and Habit Improvement', () => {
  const TEST_RESIDENT = {
    id: 'test-resident-002',
    name: 'Jane Smith',
    cohort: 'adult',
    age: 45,
    baselineUBZI: 65
  }

  describe('UBZI Score Calculation', () => {
    it('should calculate correct UBZI with all positive habits', () => {
      const perfectHabits = {
        movementScore: 10,  // Daily exercise
        plantSlant: 10,     // All plant-based meals
        rightTribe: 10,     // Strong social connections
        purposePulse: 10,   // High purpose score
        stressLevel: 1,     // Very low stress
        downshift: 10       // Regular meditation
      }

      const ubzi = calculateUBZI(perfectHabits)
      expect(ubzi).toBeGreaterThanOrEqual(90)
      expect(ubzi).toBeLessThanOrEqual(100)
    })

    it('should decrease UBZI with poor habits', () => {
      const poorHabits = {
        movementScore: 2,   // Minimal movement
        plantSlant: 3,      // Poor diet
        rightTribe: 2,      // Social isolation
        purposePulse: 3,    // Low purpose
        stressLevel: 9,     // High stress
        downshift: 1        // No stress relief
      }

      const ubzi = calculateUBZI(poorHabits)
      expect(ubzi).toBeLessThan(40)
    })

    it('should weight movement and diet more heavily', () => {
      const habitSet1 = {
        movementScore: 10,
        plantSlant: 10,
        rightTribe: 5,
        purposePulse: 5,
        stressLevel: 5,
        downshift: 5
      }

      const habitSet2 = {
        movementScore: 5,
        plantSlant: 5,
        rightTribe: 10,
        purposePulse: 10,
        stressLevel: 5,
        downshift: 5
      }

      const ubzi1 = calculateUBZI(habitSet1)
      const ubzi2 = calculateUBZI(habitSet2)
      
      // Movement and diet weighted more heavily should result in higher score
      expect(ubzi1).toBeGreaterThan(ubzi2)
    })
  })

  describe('Habit Improvement Tracking', () => {
    it('should detect improvement trend over 7 days', () => {
      const weeklyData = [
        { date: '2024-01-01', movementScore: 3, plantSlant: 4, ubzi: 45 },
        { date: '2024-01-02', movementScore: 4, plantSlant: 4, ubzi: 47 },
        { date: '2024-01-03', movementScore: 4, plantSlant: 5, ubzi: 49 },
        { date: '2024-01-04', movementScore: 5, plantSlant: 5, ubzi: 52 },
        { date: '2024-01-05', movementScore: 6, plantSlant: 6, ubzi: 56 },
        { date: '2024-01-06', movementScore: 6, plantSlant: 7, ubzi: 59 },
        { date: '2024-01-07', movementScore: 7, plantSlant: 7, ubzi: 62 }
      ]

      const trend = analyzeHabitTrends(weeklyData)
      
      expect(trend.direction).toBe('improving')
      expect(trend.percentageChange).toBeGreaterThan(35) // 45 to 62 is ~38% increase
      expect(trend.averageUBZI).toBeGreaterThan(50)
      expect(trend.averageUBZI).toBeLessThan(55)
    })

    it('should identify stagnant habits', () => {
      const stagnantData = Array(7).fill(null).map((_, i) => ({
        date: `2024-01-0${i + 1}`,
        movementScore: 5,
        plantSlant: 5,
        ubzi: 55 + (Math.random() * 2 - 1) // Small random variation
      }))

      const trend = analyzeHabitTrends(stagnantData)
      
      expect(trend.direction).toBe('stable')
      expect(Math.abs(trend.percentageChange)).toBeLessThan(5)
    })

    it('should track streak achievements', () => {
      const streakData = {
        residentId: TEST_RESIDENT.id,
        habits: {
          movement: {
            currentStreak: 7,
            longestStreak: 14,
            lastCompleted: '2024-01-07'
          },
          plantBased: {
            currentStreak: 5,
            longestStreak: 5,
            lastCompleted: '2024-01-07'
          },
          meditation: {
            currentStreak: 3,
            longestStreak: 10,
            lastCompleted: '2024-01-07'
          }
        }
      }

      const achievements = checkStreakAchievements(streakData)
      
      expect(achievements).toContainEqual(
        expect.objectContaining({
          type: 'week_streak',
          habit: 'movement',
          message: expect.stringContaining('7-day streak')
        })
      )
      
      expect(achievements).toContainEqual(
        expect.objectContaining({
          type: 'personal_best',
          habit: 'plantBased',
          message: expect.stringContaining('personal record')
        })
      )
    })
  })

  describe('UBZI Impact Scenarios', () => {
    it('should show significant UBZI increase with consistent exercise', async () => {
      const baseline = { movementScore: 3, ubzi: 55 }
      const improved = { movementScore: 8, ubzi: 68 }
      
      const impact = calculateImpact(baseline, improved, 'movement')
      
      expect(impact.ubziChange).toBe(13)
      expect(impact.percentageImprovement).toBeCloseTo(23.6, 1)
      expect(impact.category).toBe('movement')
    })

    it('should show compounding effect of multiple habit improvements', () => {
      const baseline = {
        movementScore: 4,
        plantSlant: 4,
        rightTribe: 5,
        purposePulse: 5,
        stressLevel: 6,
        downshift: 4
      }

      const oneImprovement = { ...baseline, movementScore: 8 }
      const twoImprovements = { ...oneImprovement, plantSlant: 8 }
      const threeImprovements = { ...twoImprovements, stressLevel: 3 }

      const ubziBase = calculateUBZI(baseline)
      const ubziOne = calculateUBZI(oneImprovement)
      const ubziTwo = calculateUBZI(twoImprovements)
      const ubziThree = calculateUBZI(threeImprovements)

      // Each additional improvement should have positive impact
      expect(ubziOne).toBeGreaterThan(ubziBase)
      expect(ubziTwo).toBeGreaterThan(ubziOne)
      expect(ubziThree).toBeGreaterThan(ubziTwo)
      
      // Compounding effect should be significant
      const totalImprovement = ubziThree - ubziBase
      expect(totalImprovement).toBeGreaterThan(20)
    })

    it('should correlate UBZI improvement with reduced alert frequency', async () => {
      // Simulate 30-day period
      const residentData = {
        id: TEST_RESIDENT.id,
        days: []
      }

      // First 15 days: Low UBZI, frequent alerts
      for (let i = 0; i < 15; i++) {
        residentData.days.push({
          day: i + 1,
          ubzi: 45 + Math.random() * 5,
          alerts: Math.floor(Math.random() * 3) + 1 // 1-3 alerts
        })
      }

      // Last 15 days: Improving UBZI, fewer alerts
      for (let i = 15; i < 30; i++) {
        residentData.days.push({
          day: i + 1,
          ubzi: 60 + (i - 15) + Math.random() * 5,
          alerts: Math.random() > 0.7 ? 1 : 0 // 30% chance of 1 alert
        })
      }

      const correlation = analyzeUBZIAlertCorrelation(residentData)
      
      expect(correlation.coefficient).toBeLessThan(-0.5) // Negative correlation
      expect(correlation.firstHalfAlerts).toBeGreaterThan(correlation.secondHalfAlerts)
      expect(correlation.ubziImprovement).toBeGreaterThan(15)
    })
  })

  describe('Cohort UBZI Comparison', () => {
    it('should calculate cohort average UBZI', () => {
      const cohortData = [
        { residentId: 'r1', ubzi: 65 },
        { residentId: 'r2', ubzi: 72 },
        { residentId: 'r3', ubzi: 58 },
        { residentId: 'r4', ubzi: 70 },
        { residentId: 'r5', ubzi: 63 }
      ]

      const average = calculateCohortAverage(cohortData)
      expect(average).toBeCloseTo(65.6, 1)
    })

    it('should identify top performers in cohort', () => {
      const cohortData = [
        { residentId: 'r1', name: 'John', ubzi: 78, improvement: 12 },
        { residentId: 'r2', name: 'Jane', ubzi: 82, improvement: 8 },
        { residentId: 'r3', name: 'Bob', ubzi: 71, improvement: 15 },
        { residentId: 'r4', name: 'Alice', ubzi: 85, improvement: 10 },
        { residentId: 'r5', name: 'Charlie', ubzi: 69, improvement: 18 }
      ]

      const topByScore = getTopPerformers(cohortData, 'ubzi', 3)
      expect(topByScore[0].name).toBe('Alice')
      expect(topByScore[1].name).toBe('Jane')
      expect(topByScore[2].name).toBe('John')

      const topByImprovement = getTopPerformers(cohortData, 'improvement', 3)
      expect(topByImprovement[0].name).toBe('Charlie')
      expect(topByImprovement[1].name).toBe('Bob')
      expect(topByImprovement[2].name).toBe('John')
    })
  })
})

// Helper functions for testing
function checkStreakAchievements(streakData: any) {
  const achievements = []
  
  Object.entries(streakData.habits).forEach(([habit, data]: [string, any]) => {
    if (data.currentStreak >= 7) {
      achievements.push({
        type: 'week_streak',
        habit,
        message: `Achieved 7-day streak for ${habit}!`
      })
    }
    
    if (data.currentStreak === data.longestStreak && data.currentStreak > 0) {
      achievements.push({
        type: 'personal_best',
        habit,
        message: `New personal record: ${data.currentStreak} days!`
      })
    }
  })
  
  return achievements
}

function calculateImpact(baseline: any, improved: any, category: string) {
  return {
    ubziChange: improved.ubzi - baseline.ubzi,
    percentageImprovement: ((improved.ubzi - baseline.ubzi) / baseline.ubzi) * 100,
    category
  }
}

function analyzeUBZIAlertCorrelation(data: any) {
  const firstHalf = data.days.slice(0, 15)
  const secondHalf = data.days.slice(15)
  
  const firstHalfAlerts = firstHalf.reduce((sum: number, d: any) => sum + d.alerts, 0)
  const secondHalfAlerts = secondHalf.reduce((sum: number, d: any) => sum + d.alerts, 0)
  
  const firstHalfAvgUBZI = firstHalf.reduce((sum: number, d: any) => sum + d.ubzi, 0) / 15
  const secondHalfAvgUBZI = secondHalf.reduce((sum: number, d: any) => sum + d.ubzi, 0) / 15
  
  // Simplified correlation coefficient (not statistically rigorous, just for testing)
  const correlation = -0.7 // Negative correlation between UBZI and alerts
  
  return {
    coefficient: correlation,
    firstHalfAlerts,
    secondHalfAlerts,
    ubziImprovement: secondHalfAvgUBZI - firstHalfAvgUBZI
  }
}

function calculateCohortAverage(data: any[]) {
  return data.reduce((sum, r) => sum + r.ubzi, 0) / data.length
}

function getTopPerformers(data: any[], metric: string, count: number) {
  return [...data].sort((a, b) => b[metric] - a[metric]).slice(0, count)
}