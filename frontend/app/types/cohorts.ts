export interface CohortMetrics {
  avgUBZI: number;
  ubziTrend: number; // percentage change
  activeAlerts: number;
  criticalAlerts: number;
  warningAlerts: number;
  memberCount: number;
  avgHeartRate: number;
  avgBloodPressure: {
    systolic: number;
    diastolic: number;
  };
  avgStressLevel: number;
  avgMovementScore: number;
  habitCompletion: {
    moai: number;
    ikigai: number;
    hara_hachi_bu: number;
    plant_slant: number;
    movement: number;
  };
}

export interface TrendData {
  date: string;
  value: number;
}

export interface Cohort {
  id: string;
  name: string;
  description: string;
  type: "age" | "condition" | "custom";
  icon?: string;
  color: string;
  metrics: CohortMetrics;
  trends: {
    daily: TrendData[];
    weekly: TrendData[];
    monthly: TrendData[];
  };
}

export interface CohortCardProps {
  cohort: Cohort;
  isSelected?: boolean;
  onSelect?: (cohortId: string) => void;
  comparisonMode?: boolean;
  systemAverage?: number;
}

export interface CohortFilters {
  dateRange: {
    start: Date;
    end: Date;
    preset?: "7d" | "30d" | "90d" | "custom";
  };
  selectedCohorts: string[];
  sortBy: "name" | "ubzi" | "alerts" | "members";
  sortOrder: "asc" | "desc";
}

export interface CohortComparison {
  cohortId: string;
  metrics: {
    ubzi: number;
    trend: number;
    vsSystemAvg: number;
  };
}