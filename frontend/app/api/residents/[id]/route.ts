import { NextRequest, NextResponse } from "next/server";
import { Resident, ResidentDetailResponse, VitalSigns, HabitMetrics, Alert, HistoricalData, VitalsChartData, HabitsChartData } from "../../../types/residents";

// Helper function to generate historical vital signs data
function generateVitalsHistory(residentId: string, days: number): VitalsChartData['data'] {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

    // Generate realistic variations based on resident profile
    const baseHR = 70 + Math.sin(i * 0.1) * 5 + Math.random() * 10;
    const baseSystolic = 120 + Math.sin(i * 0.15) * 10 + Math.random() * 15;
    const baseDiastolic = 80 + Math.sin(i * 0.15) * 5 + Math.random() * 8;
    const baseTemp = 98.6 + Math.sin(i * 0.2) * 0.5 + (Math.random() - 0.5) * 1;
    const baseOxygen = 98 + Math.sin(i * 0.1) * 1 + Math.random() * 2;

    data.push({
      timestamp: timestamp.toISOString(),
      heartRate: Math.round(Math.max(55, Math.min(110, baseHR))),
      systolic: Math.round(Math.max(90, Math.min(160, baseSystolic))),
      diastolic: Math.round(Math.max(60, Math.min(100, baseDiastolic))),
      temperature: Math.round((Math.max(97, Math.min(101, baseTemp))) * 10) / 10,
      oxygenLevel: Math.round(Math.max(95, Math.min(100, baseOxygen)))
    });
  }

  return data;
}

// Helper function to generate historical habits data
function generateHabitsHistory(residentId: string, days: number): HabitsChartData['data'] {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

    // Generate realistic habit variations
    const baseMovement = 60 + Math.sin(i * 0.1) * 15 + Math.random() * 20;
    const basePlantSlant = 70 + Math.sin(i * 0.08) * 10 + Math.random() * 15;
    const baseSocial = 3 + Math.sin(i * 0.12) * 2 + Math.random() * 3;
    const basePurpose = 7 + Math.sin(i * 0.09) * 1.5 + Math.random() * 2;
    const baseStress = 4 + Math.sin(i * 0.11) * 2 + Math.random() * 2;
    const baseMeditation = 15 + Math.sin(i * 0.13) * 10 + Math.random() * 15;
    const baseSleep = 7.5 + Math.sin(i * 0.07) * 1 + Math.random() * 1.5;

    data.push({
      date: date.toISOString().split('T')[0],
      movementScore: Math.round(Math.max(0, Math.min(100, baseMovement))),
      plantSlantPercentage: Math.round(Math.max(0, Math.min(100, basePlantSlant))),
      socialInteractions: Math.round(Math.max(0, Math.min(10, baseSocial))),
      purposePulse: Math.round(Math.max(1, Math.min(10, basePurpose)) * 10) / 10,
      stressLevel: Math.round(Math.max(1, Math.min(10, baseStress)) * 10) / 10,
      meditationMinutes: Math.round(Math.max(0, Math.min(60, baseMeditation))),
      sleepHours: Math.round(Math.max(4, Math.min(12, baseSleep)) * 10) / 10
    });
  }

  return data;
}

// Helper function to generate mock resident profile
function generateResidentProfile(id: string): Resident {
  const names = [
    "John Smith", "Maria Garcia", "David Johnson", "Sarah Wilson", "Michael Brown",
    "Jennifer Davis", "Robert Miller", "Lisa Anderson", "William Taylor", "Susan Thomas"
  ];

  const cohorts: Array<'senior' | 'adult' | 'teen' | 'chronic'> = ['senior', 'adult', 'teen', 'chronic'];
  const conditions = [
    "Hypertension", "Type 2 Diabetes", "Arthritis", "High Cholesterol", "Sleep Apnea",
    "Anxiety", "Depression", "Osteoporosis", "COPD", "Heart Disease"
  ];

  const medications = [
    "Lisinopril", "Metformin", "Atorvastatin", "Amlodipine", "Omeprazole",
    "Levothyroxine", "Sertraline", "Ibuprofen", "Vitamin D3", "Aspirin"
  ];

  const residentIndex = parseInt(id.split('-')[1]) - 1;
  const cohort = cohorts[residentIndex % 4];
  const name = names[residentIndex % names.length] || `Resident ${residentIndex + 1}`;

  const baseAge = cohort === 'teen' ? 16 : cohort === 'adult' ? 35 : cohort === 'senior' ? 70 : 55;
  const age = baseAge + (residentIndex % 15);

  const ubziBase = cohort === 'teen' ? 75 : cohort === 'adult' ? 72 : cohort === 'senior' ? 65 : 60;
  const currentUBZI = Math.max(30, Math.min(100, ubziBase + (residentIndex % 20) - 10));

  // Generate alerts
  const alertCount = Math.floor(Math.random() * 8);
  const alerts: Alert[] = [];

  for (let i = 0; i < alertCount; i++) {
    const severities: Array<1 | 2 | 3 | 4 | 5> = [1, 2, 3, 4, 5];
    const types: Array<'critical' | 'warning' | 'info'> = ['critical', 'warning', 'info'];
    const categories: Array<'vitals' | 'habits' | 'system' | 'wellness'> = ['vitals', 'habits', 'system', 'wellness'];

    const severity = severities[Math.floor(Math.random() * severities.length)];
    const type = severity >= 4 ? 'critical' : severity >= 3 ? 'warning' : 'info';
    const category = categories[Math.floor(Math.random() * categories.length)];

    const hoursAgo = Math.floor(Math.random() * 72);
    const timestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

    alerts.push({
      id: `alert-${id}-${i + 1}`,
      type,
      category,
      message: `${category === 'vitals' ? 'Elevated heart rate detected' :
                category === 'habits' ? 'Missed daily movement goal' :
                category === 'system' ? 'Device connectivity issue' :
                'Wellness check reminder'}`,
      description: `Alert generated for ${name} at ${new Date(timestamp).toLocaleString()}`,
      timestamp,
      resolved: Math.random() > 0.3,
      severity
    });
  }

  // Generate habit streaks
  const habitStreaks = [
    {
      habitType: 'movement' as const,
      currentStreak: Math.floor(Math.random() * 30),
      longestStreak: Math.floor(Math.random() * 90) + 30,
      weeklyCompletion: Math.floor(Math.random() * 40) + 60,
      lastActivity: new Date(Date.now() - Math.floor(Math.random() * 24) * 60 * 60 * 1000).toISOString()
    },
    {
      habitType: 'plant_slant' as const,
      currentStreak: Math.floor(Math.random() * 20),
      longestStreak: Math.floor(Math.random() * 60) + 20,
      weeklyCompletion: Math.floor(Math.random() * 30) + 70,
      lastActivity: new Date(Date.now() - Math.floor(Math.random() * 24) * 60 * 60 * 1000).toISOString()
    },
    {
      habitType: 'social' as const,
      currentStreak: Math.floor(Math.random() * 15),
      longestStreak: Math.floor(Math.random() * 45) + 15,
      weeklyCompletion: Math.floor(Math.random() * 35) + 65,
      lastActivity: new Date(Date.now() - Math.floor(Math.random() * 48) * 60 * 60 * 1000).toISOString()
    }
  ];

  return {
    id,
    name,
    age,
    gender: Math.random() > 0.5 ? 'female' : 'male',
    cohort,
    profileImage: `https://i.pravatar.cc/150?seed=${residentIndex + 1}`,
    address: `${100 + residentIndex} Blue Zone Dr, Urban Heights, CA 90210`,
    emergencyContact: {
      name: `Emergency Contact ${residentIndex + 1}`,
      phone: `(555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      relationship: Math.random() > 0.5 ? 'Spouse' : 'Child'
    },
    medicalInfo: {
      conditions: conditions.slice(0, Math.floor(Math.random() * 3) + 1),
      medications: medications.slice(0, Math.floor(Math.random() * 4) + 1),
      allergies: ['None'],
      primaryPhysician: `Dr. ${names[Math.floor(Math.random() * names.length)].split(' ')[1]}`
    },
    enrollmentDate: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
    metrics: {
      currentUBZI,
      ubziTrend: Math.random() > 0.5 ? 'improving' : Math.random() > 0.5 ? 'stable' : 'declining',
      ubziChange: Math.round((Math.random() - 0.5) * 10 * 100) / 100,
      currentVitals: {
        heartRate: 70 + Math.floor(Math.random() * 20),
        bloodPressure: {
          systolic: 120 + Math.floor(Math.random() * 30),
          diastolic: 80 + Math.floor(Math.random() * 15)
        },
        temperature: Math.round((98.6 + (Math.random() - 0.5) * 2) * 10) / 10,
        oxygenLevel: 98 + Math.floor(Math.random() * 3),
        timestamp: new Date().toISOString()
      },
      currentHabits: {
        movementScore: Math.floor(Math.random() * 50) + 50,
        plantSlantPercentage: Math.floor(Math.random() * 40) + 60,
        socialInteractions: Math.floor(Math.random() * 5) + 2,
        purposePulse: Math.round((Math.random() * 3 + 7) * 10) / 10,
        stressLevel: Math.round((Math.random() * 4 + 3) * 10) / 10,
        meditationMinutes: Math.floor(Math.random() * 30) + 10,
        sleepHours: Math.round((Math.random() * 2 + 7) * 10) / 10
      },
      habitStreaks,
      alertCount: {
        total: alerts.length,
        critical: alerts.filter(a => a.type === 'critical').length,
        warning: alerts.filter(a => a.type === 'warning').length,
        unresolved: alerts.filter(a => !a.resolved).length
      }
    },
    historicalData: [],
    recentAlerts: alerts.slice(0, 10)
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';

    // Generate resident profile
    const resident = generateResidentProfile(id);

    // Generate historical data based on time range
    let days = 7;
    if (timeRange === '24h') days = 1;
    else if (timeRange === '7d') days = 7;
    else if (timeRange === '30d') days = 30;

    const vitalsHistory: VitalsChartData = {
      timeRange: { period: timeRange as any },
      data: generateVitalsHistory(id, days)
    };

    const habitsHistory: HabitsChartData = {
      timeRange: { period: timeRange as any },
      data: generateHabitsHistory(id, days)
    };

    const response: ResidentDetailResponse = {
      resident,
      vitalsHistory,
      habitsHistory
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching resident details:', error);
    return NextResponse.json(
      { error: "Failed to fetch resident details" },
      { status: 500 }
    );
  }
}