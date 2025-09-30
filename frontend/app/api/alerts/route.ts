import { NextRequest, NextResponse } from "next/server";
import { scanAlerts, getResident } from "../../lib/dynamodb";

export async function GET(request: NextRequest) {
  try {
    // Fetch alerts from DynamoDB
    const dbAlerts = await scanAlerts();

    // Transform and enrich alerts with resident names
    const alerts = await Promise.all(
      dbAlerts.map(async (alert: any) => {
        const resident = await getResident(alert.resident_id).catch(() => null);

        return {
          id: alert.alert_id,
          timestamp: alert.created_at || new Date(alert.timestamp).toISOString(),
          severity: alert.severity === 'high' ? 'critical' : alert.severity === 'medium' ? 'warning' : 'info',
          residentId: alert.resident_id,
          residentName: resident?.name || 'Unknown',
          message: alert.message,
          metric: alert.metric,
          value: alert.value,
          threshold: alert.threshold,
          resolved: alert.status === 'resolved',
        };
      })
    );

    const alertCounts = alerts.reduce(
      (acc, alert) => {
        if (!alert.resolved) {
          acc.total++;
          acc[alert.severity as 'critical' | 'warning' | 'info']++;
        }
        return acc;
      },
      { total: 0, critical: 0, warning: 0, info: 0 }
    );

    return NextResponse.json({
      alerts: alerts,
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