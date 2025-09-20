import { NextRequest, NextResponse } from "next/server";
import { Cohort } from "../../types/cohorts";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateRange = searchParams.get("dateRange") || "7d";
    const sortBy = searchParams.get("sortBy") || "name";

    const generateTrendData = (baseValue: number, days: number) => {
      const data = [];
      const today = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const variation = Math.sin(i / 3) * 5 + Math.random() * 3;

        data.push({
          date: date.toISOString().split('T')[0],
          value: Math.round(baseValue + variation),
        });
      }

      return data;
    };

    const cohorts: Cohort[] = [
      {
        id: "seniors",
        name: "Seniors",
        description: "Residents aged 65 and above",
        type: "age",
        color: "#8b5cf6",
        metrics: {
          avgUBZI: 68,
          ubziTrend: -2.3,
          activeAlerts: 8,
          criticalAlerts: 2,
          warningAlerts: 6,
          memberCount: 30,
          avgHeartRate: 72,
          avgBloodPressure: {
            systolic: 135,
            diastolic: 85,
          },
          avgStressLevel: 45,
          avgMovementScore: 62,
          habitCompletion: {
            moai: 78,
            ikigai: 65,
            hara_hachi_bu: 72,
            plant_slant: 68,
            movement: 58,
          },
        },
        trends: {
          daily: generateTrendData(68, 7),
          weekly: generateTrendData(68, 4),
          monthly: generateTrendData(68, 12),
        },
      },
      {
        id: "adults",
        name: "Adults",
        description: "Residents aged 25-64",
        type: "age",
        color: "#3b82f6",
        metrics: {
          avgUBZI: 74,
          ubziTrend: 1.5,
          activeAlerts: 5,
          criticalAlerts: 1,
          warningAlerts: 4,
          memberCount: 50,
          avgHeartRate: 68,
          avgBloodPressure: {
            systolic: 120,
            diastolic: 78,
          },
          avgStressLevel: 52,
          avgMovementScore: 75,
          habitCompletion: {
            moai: 82,
            ikigai: 70,
            hara_hachi_bu: 65,
            plant_slant: 78,
            movement: 80,
          },
        },
        trends: {
          daily: generateTrendData(74, 7),
          weekly: generateTrendData(74, 4),
          monthly: generateTrendData(74, 12),
        },
      },
      {
        id: "teens",
        name: "Teens",
        description: "Residents aged 13-24",
        type: "age",
        color: "#10b981",
        metrics: {
          avgUBZI: 76,
          ubziTrend: 3.2,
          activeAlerts: 2,
          criticalAlerts: 0,
          warningAlerts: 2,
          memberCount: 20,
          avgHeartRate: 65,
          avgBloodPressure: {
            systolic: 115,
            diastolic: 72,
          },
          avgStressLevel: 48,
          avgMovementScore: 85,
          habitCompletion: {
            moai: 88,
            ikigai: 60,
            hara_hachi_bu: 55,
            plant_slant: 72,
            movement: 90,
          },
        },
        trends: {
          daily: generateTrendData(76, 7),
          weekly: generateTrendData(76, 4),
          monthly: generateTrendData(76, 12),
        },
      },
      {
        id: "chronic",
        name: "Chronic Conditions",
        description: "Residents with chronic health conditions",
        type: "condition",
        color: "#ef4444",
        metrics: {
          avgUBZI: 65,
          ubziTrend: -0.8,
          activeAlerts: 12,
          criticalAlerts: 4,
          warningAlerts: 8,
          memberCount: 25,
          avgHeartRate: 75,
          avgBloodPressure: {
            systolic: 138,
            diastolic: 88,
          },
          avgStressLevel: 58,
          avgMovementScore: 55,
          habitCompletion: {
            moai: 70,
            ikigai: 68,
            hara_hachi_bu: 75,
            plant_slant: 60,
            movement: 50,
          },
        },
        trends: {
          daily: generateTrendData(65, 7),
          weekly: generateTrendData(65, 4),
          monthly: generateTrendData(65, 12),
        },
      },
    ];

    // Apply sorting
    const sortedCohorts = [...cohorts].sort((a, b) => {
      switch (sortBy) {
        case "ubzi":
          return b.metrics.avgUBZI - a.metrics.avgUBZI;
        case "alerts":
          return b.metrics.activeAlerts - a.metrics.activeAlerts;
        case "members":
          return b.metrics.memberCount - a.metrics.memberCount;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    // Calculate system-wide statistics
    const systemStats = {
      totalResidents: cohorts.reduce((sum, c) => sum + c.metrics.memberCount, 0),
      avgSystemUBZI: Math.round(
        cohorts.reduce((sum, c) => sum + c.metrics.avgUBZI * c.metrics.memberCount, 0) /
        cohorts.reduce((sum, c) => sum + c.metrics.memberCount, 0)
      ),
      totalAlerts: cohorts.reduce((sum, c) => sum + c.metrics.activeAlerts, 0),
      criticalAlerts: cohorts.reduce((sum, c) => sum + c.metrics.criticalAlerts, 0),
    };

    return NextResponse.json({
      cohorts: sortedCohorts,
      systemStats,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch cohort data" },
      { status: 500 }
    );
  }
}