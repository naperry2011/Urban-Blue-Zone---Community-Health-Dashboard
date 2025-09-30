import { NextRequest, NextResponse } from "next/server";
import { scanResidents, scanAlerts, docClient, TABLES } from "../../lib/dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export async function GET(request: NextRequest) {
  try {
    // Fetch all residents and alerts from DynamoDB
    const residents = await scanResidents();
    const alerts = await scanAlerts();

    // Calculate system-wide UBZI by fetching all aggregations
    const aggsResponse = await docClient.send(new ScanCommand({
      TableName: TABLES.aggregations,
    }));
    const allAggregations = aggsResponse.Items || [];

    // Calculate average UBZI across all residents
    const totalUBZI = allAggregations.reduce((sum: number, agg: any) => sum + (agg.ubzi_score || 0), 0);
    const systemUBZI = allAggregations.length > 0 ? Math.round(totalUBZI / allAggregations.length) : 0;

    // Count active alerts
    const activeAlerts = alerts.filter((a: any) => a.status === 'active').length;

    // Group residents by cohort
    const cohortStats = residents.reduce((acc: any, resident: any) => {
      const cohort = resident.cohort === 'seniors' ? 'senior' : resident.cohort === 'adults' ? 'adult' : resident.cohort === 'teens' ? 'teen' : 'chronic';
      if (!acc[cohort]) {
        acc[cohort] = { count: 0, totalUBZI: 0, avgUBZI: 0 };
      }

      const agg = allAggregations.find((a: any) => a.resident_id === resident.resident_id);
      acc[cohort].count++;
      acc[cohort].totalUBZI += agg?.ubzi_score || 0;
      acc[cohort].avgUBZI = Math.round(acc[cohort].totalUBZI / acc[cohort].count);

      return acc;
    }, {});

    // Generate historical data (for now use mock, but could query historical aggregations)
    const generateHistoricalData = (days: number) => {
      const data = [];
      const today = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const variation = Math.sin(i / 5) * 5 + Math.random() * 3;

        data.push({
          date: date.toISOString().split('T')[0],
          value: Math.round(systemUBZI + variation - systemUBZI + 72),
          cohortAvg: Math.round(systemUBZI + variation / 2 - 2),
        });
      }

      return data;
    };

    const aggregations = {
      systemUBZI,
      totalResidents: residents.length,
      activeAlerts,
      cohorts: {
        senior: cohortStats.senior || { count: 0, avgUBZI: 0 },
        adult: cohortStats.adult || { count: 0, avgUBZI: 0 },
        teen: cohortStats.teen || { count: 0, avgUBZI: 0 },
      },
      trends: {
        daily: allAggregations.slice(0, 7).map((a: any) => a.ubzi_score || 0).reverse(),
        weekly: allAggregations.slice(0, 5).map((a: any) => a.ubzi_score || 0).reverse(),
      },
      historicalData: generateHistoricalData(90),
    };

    return NextResponse.json(aggregations);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch aggregations" },
      { status: 500 }
    );
  }
}