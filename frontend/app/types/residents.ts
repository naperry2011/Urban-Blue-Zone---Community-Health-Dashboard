export interface VitalSigns {
  heartRate: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  temperature: number;
  oxygenLevel: number;
  timestamp: string;
}

export interface HabitMetrics {
  movementScore: number; // 0-100
  plantSlantPercentage: number; // 0-100, percentage of plant-based meals
  socialInteractions: number; // daily count
  purposePulse: number; // 1-10 scale
  stressLevel: number; // 1-10 scale (1=low, 10=high)
  meditationMinutes: number;
  sleepHours: number;
}

export interface HabitStreak {
  habitType: 'movement' | 'plant_slant' | 'social' | 'purpose' | 'stress' | 'meditation' | 'sleep';
  currentStreak: number;
  longestStreak: number;
  weeklyCompletion: number; // percentage
  lastActivity: string;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'vitals' | 'habits' | 'system' | 'wellness';
  message: string;
  description?: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  severity: 1 | 2 | 3 | 4 | 5; // 1=info, 5=critical
}

export interface HistoricalData {
  date: string;
  ubzi: number;
  vitals: VitalSigns;
  habits: HabitMetrics;
}

export interface ResidentProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  cohort: 'senior' | 'adult' | 'teen' | 'chronic';
  profileImage?: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalInfo: {
    conditions: string[];
    medications: string[];
    allergies: string[];
    primaryPhysician: string;
  };
  enrollmentDate: string;
  lastActivity: string;
}

export interface ResidentMetrics {
  currentUBZI: number;
  ubziTrend: 'improving' | 'declining' | 'stable';
  ubziChange: number; // percentage change
  currentVitals: VitalSigns;
  currentHabits: HabitMetrics;
  habitStreaks: HabitStreak[];
  alertCount: {
    total: number;
    critical: number;
    warning: number;
    unresolved: number;
  };
}

export interface Resident extends ResidentProfile {
  metrics: ResidentMetrics;
  historicalData: HistoricalData[];
  recentAlerts: Alert[];
}

export interface ResidentListItem {
  id: string;
  name: string;
  age: number;
  cohort: 'senior' | 'adult' | 'teen' | 'chronic';
  currentUBZI: number;
  ubziTrend: 'improving' | 'declining' | 'stable';
  lastActivity: string;
  alertCount: number;
  criticalAlerts: number;
  profileImage?: string;
}

export interface TimeRange {
  period: '24h' | '7d' | '30d' | 'custom';
  startDate?: string;
  endDate?: string;
}

export interface VitalsChartData {
  timeRange: TimeRange;
  data: {
    timestamp: string;
    heartRate: number;
    systolic: number;
    diastolic: number;
    temperature: number;
    oxygenLevel: number;
  }[];
}

export interface HabitsChartData {
  timeRange: TimeRange;
  data: {
    date: string;
    movementScore: number;
    plantSlantPercentage: number;
    socialInteractions: number;
    purposePulse: number;
    stressLevel: number;
    meditationMinutes: number;
    sleepHours: number;
  }[];
}

export interface ResidentFilters {
  cohorts: string[];
  ageRange: [number, number];
  ubziRange: [number, number];
  alertLevel: 'all' | 'critical' | 'warning' | 'none';
  sortBy: 'name' | 'age' | 'ubzi' | 'alerts' | 'lastActivity';
  sortOrder: 'asc' | 'desc';
  searchTerm: string;
}

export interface ResidentsResponse {
  residents: ResidentListItem[];
  total: number;
  page: number;
  limit: number;
  filters: ResidentFilters;
}

export interface ResidentDetailResponse {
  resident: Resident;
  vitalsHistory: VitalsChartData;
  habitsHistory: HabitsChartData;
}