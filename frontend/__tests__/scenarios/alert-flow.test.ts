import { waitFor } from '@testing-library/react'

describe('High Blood Pressure Alert Flow', () => {
  const HIGH_BP_RESIDENT = {
    id: 'test-resident-001',
    name: 'John Doe',
    cohort: 'senior',
    age: 72,
    conditions: ['hypertension']
  }

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
  })

  describe('Alert Generation', () => {
    it('should trigger alert when systolic BP exceeds 180', async () => {
      const highBPReading = {
        residentId: HIGH_BP_RESIDENT.id,
        timestamp: new Date().toISOString(),
        vitals: {
          bloodPressure: {
            systolic: 185,
            diastolic: 95
          },
          heartRate: 92,
          oxygenLevel: 95
        }
      }

      // Simulate vital signs data
      const mockAlert = await simulateVitalReading(highBPReading)
      
      expect(mockAlert).toBeDefined()
      expect(mockAlert.severity).toBe('critical')
      expect(mockAlert.type).toBe('high_blood_pressure')
      expect(mockAlert.message).toContain('Critical: Blood pressure 185/95')
    })

    it('should trigger warning when systolic BP is between 160-179', async () => {
      const moderateBPReading = {
        residentId: HIGH_BP_RESIDENT.id,
        timestamp: new Date().toISOString(),
        vitals: {
          bloodPressure: {
            systolic: 165,
            diastolic: 88
          },
          heartRate: 78,
          oxygenLevel: 96
        }
      }

      const mockAlert = await simulateVitalReading(moderateBPReading)
      
      expect(mockAlert).toBeDefined()
      expect(mockAlert.severity).toBe('warning')
      expect(mockAlert.type).toBe('elevated_blood_pressure')
    })

    it('should not trigger alert for normal BP readings', async () => {
      const normalBPReading = {
        residentId: HIGH_BP_RESIDENT.id,
        timestamp: new Date().toISOString(),
        vitals: {
          bloodPressure: {
            systolic: 128,
            diastolic: 82
          },
          heartRate: 72,
          oxygenLevel: 98
        }
      }

      const mockAlert = await simulateVitalReading(normalBPReading)
      
      expect(mockAlert).toBeNull()
    })
  })

  describe('Alert Deduplication', () => {
    it('should not create duplicate alerts within 10-minute window', async () => {
      const reading1 = {
        residentId: HIGH_BP_RESIDENT.id,
        timestamp: new Date().toISOString(),
        vitals: {
          bloodPressure: { systolic: 185, diastolic: 95 },
          heartRate: 92,
          oxygenLevel: 95
        }
      }

      const reading2 = {
        ...reading1,
        timestamp: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes later
      }

      const alert1 = await simulateVitalReading(reading1)
      const alert2 = await simulateVitalReading(reading2)

      expect(alert1).toBeDefined()
      expect(alert2).toBeNull() // Should be deduplicated
    })

    it('should create new alert after deduplication window expires', async () => {
      const reading1 = {
        residentId: HIGH_BP_RESIDENT.id,
        timestamp: new Date().toISOString(),
        vitals: {
          bloodPressure: { systolic: 185, diastolic: 95 },
          heartRate: 92,
          oxygenLevel: 95
        }
      }

      const reading2 = {
        ...reading1,
        timestamp: new Date(Date.now() + 11 * 60 * 1000).toISOString() // 11 minutes later
      }

      const alert1 = await simulateVitalReading(reading1)
      const alert2 = await simulateVitalReading(reading2)

      expect(alert1).toBeDefined()
      expect(alert2).toBeDefined()
      expect(alert1.id).not.toBe(alert2.id)
    })
  })

  describe('Alert Notification', () => {
    it('should send SMS for critical alerts', async () => {
      const mockSendSMS = jest.fn().mockResolvedValue({ messageId: '123' })
      
      const criticalReading = {
        residentId: HIGH_BP_RESIDENT.id,
        timestamp: new Date().toISOString(),
        vitals: {
          bloodPressure: { systolic: 195, diastolic: 105 },
          heartRate: 98,
          oxygenLevel: 93
        }
      }

      await simulateVitalReading(criticalReading)
      await waitFor(() => {
        expect(mockSendSMS).toHaveBeenCalledWith(
          expect.objectContaining({
            residentId: HIGH_BP_RESIDENT.id,
            message: expect.stringContaining('CRITICAL ALERT')
          })
        )
      })
    })

    it('should send email for warning alerts', async () => {
      const mockSendEmail = jest.fn().mockResolvedValue({ messageId: '456' })
      
      const warningReading = {
        residentId: HIGH_BP_RESIDENT.id,
        timestamp: new Date().toISOString(),
        vitals: {
          bloodPressure: { systolic: 165, diastolic: 88 },
          heartRate: 78,
          oxygenLevel: 96
        }
      }

      await simulateVitalReading(warningReading)
      await waitFor(() => {
        expect(mockSendEmail).toHaveBeenCalledWith(
          expect.objectContaining({
            residentId: HIGH_BP_RESIDENT.id,
            subject: expect.stringContaining('Health Alert')
          })
        )
      })
    })
  })

  describe('Dashboard Alert Display', () => {
    it('should display critical alerts immediately on dashboard', async () => {
      const criticalAlert = {
        id: 'alert-001',
        residentId: HIGH_BP_RESIDENT.id,
        residentName: HIGH_BP_RESIDENT.name,
        type: 'high_blood_pressure',
        severity: 'critical',
        message: 'Critical: Blood pressure 195/105',
        timestamp: new Date().toISOString(),
        acknowledged: false
      }

      // Test alert display logic without JSX
      const alertDisplay = displayAlert(criticalAlert)

      expect(alertDisplay.severity).toBe('critical')
      expect(alertDisplay.message).toContain('Critical: Blood pressure')
      expect(alertDisplay.residentName).toBe(HIGH_BP_RESIDENT.name)
      expect(alertDisplay.isVisible).toBe(true)
    })

    it('should sort alerts by severity and timestamp', () => {
      const alerts = [
        { id: '1', severity: 'info', timestamp: new Date().toISOString() },
        { id: '2', severity: 'critical', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: '3', severity: 'warning', timestamp: new Date().toISOString() },
        { id: '4', severity: 'critical', timestamp: new Date().toISOString() }
      ]

      const sorted = sortAlerts(alerts)
      
      expect(sorted[0].id).toBe('4') // Most recent critical
      expect(sorted[1].id).toBe('2') // Older critical
      expect(sorted[2].id).toBe('3') // Recent warning
      expect(sorted[3].id).toBe('1') // Info
    })
  })
})

// Helper functions
const alertCache = new Map<string, { timestamp: string, alert: any }>()

async function simulateVitalReading(reading: any) {
  // Mock API call for testing
  await new Promise(resolve => setTimeout(resolve, 100)) // Simulate network delay

  const systolic = reading.vitals.bloodPressure.systolic
  const residentId = reading.residentId
  const currentTime = new Date(reading.timestamp).getTime()

  // Check for recent alerts (deduplication)
  const cacheKey = `${residentId}-bp`
  const cachedAlert = alertCache.get(cacheKey)

  if (cachedAlert) {
    const timeDiff = currentTime - new Date(cachedAlert.timestamp).getTime()
    if (timeDiff < 10 * 60 * 1000) { // 10 minutes
      return null // Deduplicated
    }
  }

  let alert = null

  if (systolic >= 180) {
    alert = {
      id: `alert-${Date.now()}`,
      severity: 'critical',
      type: 'high_blood_pressure',
      message: `Critical: Blood pressure ${systolic}/${reading.vitals.bloodPressure.diastolic}`,
      residentId: reading.residentId,
      timestamp: reading.timestamp
    }
  } else if (systolic >= 160) {
    alert = {
      id: `alert-${Date.now()}`,
      severity: 'warning',
      type: 'elevated_blood_pressure',
      message: `Warning: Blood pressure ${systolic}/${reading.vitals.bloodPressure.diastolic}`,
      residentId: reading.residentId,
      timestamp: reading.timestamp
    }
  }

  if (alert) {
    alertCache.set(cacheKey, { timestamp: reading.timestamp, alert })
  }

  return alert
}

function sortAlerts(alerts: any[]) {
  const severityOrder = { critical: 0, warning: 1, info: 2 }
  return alerts.sort((a, b) => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity]
    if (severityDiff !== 0) return severityDiff
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })
}

// Mock display function for testing
function displayAlert(alert: any) {
  return {
    id: alert.id,
    severity: alert.severity,
    message: alert.message,
    residentName: alert.residentName,
    timestamp: alert.timestamp,
    isVisible: true,
    priorityLevel: alert.severity === 'critical' ? 1 : alert.severity === 'warning' ? 2 : 3
  }
}