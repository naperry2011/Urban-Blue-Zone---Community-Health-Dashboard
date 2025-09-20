import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // TODO: Integrate with AWS API Gateway
    // For now, return mock data with historical data for charts
    const generateHistoricalData = (days: number) => {
      const data = [];
      const baseUBZI = 72;
      const today = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const variation = Math.sin(i / 5) * 5 + Math.random() * 3;

        data.push({
          date: date.toISOString().split('T')[0],
          value: Math.round(baseUBZI + variation),
          cohortAvg: Math.round(baseUBZI + variation / 2 - 2),
        });
      }

      return data;
    };

    const aggregations = {
      systemUBZI: 72,
      totalResidents: 100,
      activeAlerts: 5,
      cohorts: {
        senior: { count: 30, avgUBZI: 68 },
        adult: { count: 50, avgUBZI: 74 },
        teen: { count: 20, avgUBZI: 76 },
      },
      trends: {
        daily: [70, 71, 72, 73, 72, 71, 72],
        weekly: [68, 69, 70, 71, 72],
      },
      historicalData: generateHistoricalData(90), // 90 days of data
    };

    return NextResponse.json(aggregations);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch aggregations" },
      { status: 500 }
    );
  }
}