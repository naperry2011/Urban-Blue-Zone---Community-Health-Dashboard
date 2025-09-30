import { NextRequest, NextResponse } from "next/server";
import { ResidentListItem, ResidentsResponse } from "../../types/residents";
import { scanResidents, getResidentAggregations, getResidentAlerts } from "../../lib/dynamodb";

// Transform DynamoDB resident data to API format
async function transformResidents(residents: any[]): Promise<ResidentListItem[]> {
  const transformed = await Promise.all(
    residents.map(async (resident) => {
      // Get UBZI score from aggregations
      const aggregation = await getResidentAggregations(resident.resident_id).catch(() => null);

      // Get alerts for this resident
      const alerts = await getResidentAlerts(resident.resident_id).catch(() => []);
      const criticalAlerts = alerts.filter((a: any) => a.severity === 'high' && a.status === 'active').length;

      // Calculate trend based on 7d trend
      let ubziTrend: 'improving' | 'declining' | 'stable' = 'stable';
      if (aggregation?.trend_7d) {
        const trend = parseFloat(aggregation.trend_7d);
        if (trend > 2) ubziTrend = 'improving';
        else if (trend < -2) ubziTrend = 'declining';
      }

      return {
        id: resident.resident_id,
        name: resident.name,
        age: resident.age,
        cohort: resident.cohort,
        currentUBZI: aggregation?.ubzi_score || 0,
        ubziTrend,
        lastActivity: aggregation?.calculated_at || resident.enrolled_date,
        alertCount: alerts.length,
        criticalAlerts,
        profileImage: `https://i.pravatar.cc/150?seed=${resident.resident_id}`
      };
    })
  );

  return transformed;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const cohorts = searchParams.get('cohorts')?.split(',') || [];
    const searchTerm = searchParams.get('search') || '';
    const alertLevel = searchParams.get('alertLevel') || 'all';

    // Fetch residents from DynamoDB
    const dbResidents = await scanResidents();
    let residents = await transformResidents(dbResidents);

    // Apply filters
    if (cohorts.length > 0) {
      residents = residents.filter(r => cohorts.includes(r.cohort));
    }

    if (searchTerm) {
      residents = residents.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (alertLevel !== 'all') {
      if (alertLevel === 'critical') {
        residents = residents.filter(r => r.criticalAlerts > 0);
      } else if (alertLevel === 'warning') {
        residents = residents.filter(r => r.alertCount > r.criticalAlerts);
      } else if (alertLevel === 'none') {
        residents = residents.filter(r => r.alertCount === 0);
      }
    }

    // Apply sorting
    residents.sort((a, b) => {
      let aVal: any = a[sortBy as keyof ResidentListItem];
      let bVal: any = b[sortBy as keyof ResidentListItem];

      if (sortBy === 'lastActivity') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    // Apply pagination
    const total = residents.length;
    const startIndex = (page - 1) * limit;
    const paginatedResidents = residents.slice(startIndex, startIndex + limit);

    const response: ResidentsResponse = {
      residents: paginatedResidents,
      total,
      page,
      limit,
      filters: {
        cohorts,
        ageRange: [0, 100],
        ubziRange: [0, 100],
        alertLevel: alertLevel as any,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
        searchTerm
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching residents:', error);
    return NextResponse.json(
      { error: "Failed to fetch residents" },
      { status: 500 }
    );
  }
}