import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // TODO: Integrate with AWS DynamoDB/API Gateway
    // For now, return mock alert data
    const now = new Date();
    const mockAlerts = [
      {
        id: "alert-001",
        timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
        severity: "critical" as const,
        residentId: "res-001",
        residentName: "John Smith",
        message: "Blood pressure critically high",
        metric: "Systolic BP",
        value: 185,
        threshold: 160,
        resolved: false,
      },
      {
        id: "alert-002",
        timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
        severity: "warning" as const,
        residentId: "res-002",
        residentName: "Mary Johnson",
        message: "Low activity detected for 3 days",
        metric: "Daily Steps",
        value: 1200,
        threshold: 3000,
        resolved: false,
      },
      {
        id: "alert-003",
        timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
        severity: "info" as const,
        residentId: "res-003",
        residentName: "Robert Davis",
        message: "Missed meditation session",
        metric: "Stress Management",
        value: 0,
        threshold: 1,
        resolved: true,
      },
      {
        id: "alert-004",
        timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
        severity: "warning" as const,
        residentId: "res-004",
        residentName: "Linda Wilson",
        message: "Heart rate elevated during rest",
        metric: "Resting Heart Rate",
        value: 95,
        threshold: 85,
        resolved: false,
      },
      {
        id: "alert-005",
        timestamp: new Date(now.getTime() - 60 * 60000).toISOString(),
        severity: "info" as const,
        residentId: "res-005",
        residentName: "Michael Brown",
        message: "Social interaction below weekly target",
        metric: "Social Hours",
        value: 2,
        threshold: 5,
        resolved: false,
      },
    ];

    const alertCounts = mockAlerts.reduce(
      (acc, alert) => {
        if (!alert.resolved) {
          acc.total++;
          acc[alert.severity]++;
        }
        return acc;
      },
      { total: 0, critical: 0, warning: 0, info: 0 }
    );

    return NextResponse.json({
      alerts: mockAlerts,
      ...alertCounts,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // TODO: Process and store alert
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 }
    );
  }
}