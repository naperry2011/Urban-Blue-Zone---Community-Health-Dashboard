import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // TODO: Integrate with AWS API Gateway
    // For now, return mock data
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
    };

    return NextResponse.json(aggregations);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch aggregations" },
      { status: 500 }
    );
  }
}