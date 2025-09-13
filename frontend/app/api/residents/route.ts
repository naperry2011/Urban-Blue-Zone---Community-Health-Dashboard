import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // TODO: Integrate with AWS API Gateway
    // For now, return mock data
    const residents = [
      {
        id: "resident-001",
        name: "John Smith",
        age: 68,
        cohort: "senior",
        ubzi: 75,
        lastVitals: {
          heartRate: 72,
          bloodPressure: "120/80",
          temperature: 98.6,
          oxygenLevel: 98,
        },
      },
    ];

    return NextResponse.json({ residents });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch residents" },
      { status: 500 }
    );
  }
}