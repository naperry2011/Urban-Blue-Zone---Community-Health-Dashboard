import { NextRequest, NextResponse } from "next/server";
import { ResidentListItem, ResidentsResponse } from "../../types/residents";

// Mock data generator for realistic resident data
function generateMockResidents(): ResidentListItem[] {
  const names = [
    "John Smith", "Maria Garcia", "David Johnson", "Sarah Wilson", "Michael Brown",
    "Jennifer Davis", "Robert Miller", "Lisa Anderson", "William Taylor", "Susan Thomas",
    "James Jackson", "Karen White", "Christopher Harris", "Nancy Martin", "Daniel Thompson",
    "Betty Garcia", "Matthew Rodriguez", "Helen Lewis", "Anthony Lee", "Sandra Walker",
    "Mark Hall", "Donna Allen", "Steven Young", "Carol Hernandez", "Paul King",
    "Ruth Wright", "Andrew Lopez", "Sharon Hill", "Joshua Scott", "Michelle Green",
    "Kenneth Adams", "Laura Baker", "Kevin Gonzalez", "Emily Nelson", "Brian Carter",
    "Angela Mitchell", "George Perez", "Kimberly Roberts", "Edward Turner", "Dorothy Phillips",
    "Ronald Campbell", "Lisa Parker", "Timothy Evans", "Nancy Edwards", "Jason Collins",
    "Karen Stewart", "Jeffrey Sanchez", "Betty Morris", "Ryan Rogers", "Helen Reed",
    "Jacob Cook", "Sharon Bailey", "Gary Rivera", "Cynthia Cooper", "Nicholas Richardson",
    "Amy Cox", "Jonathan Ward", "Angela Torres", "Stephen Peterson", "Brenda Gray",
    "Larry Ramirez", "Nicole James", "Justin Watson", "Katherine Brooks", "Scott Kelly",
    "Rachel Sanders", "Brandon Price", "Janet Bennett", "Benjamin Wood", "Carolyn Barnes",
    "Samuel Ross", "Martha Henderson", "Gregory Coleman", "Deborah Jenkins", "Frank Perry",
    "Rebecca Powell", "Raymond Long", "Stephanie Patterson", "Alexander Hughes", "Julie Flores",
    "Patrick Washington", "Marie Butler", "Jack Simmons", "Diana Foster", "Dennis Gonzales",
    "Jacqueline Bryant", "Jerry Alexander", "Frances Russell", "Tyler Griffin", "Catherine Diaz",
    "Aaron Hayes", "Samantha Myers", "Jose Ford", "Gloria Hamilton", "Henry Graham",
    "Judith Sullivan", "Douglas Wallace", "Anna Woods", "Nathan Cole", "Rose West",
    "Peter Jordan", "Theresa Owens", "Zachary Reynolds", "Beverly Fisher", "Kyle Ellis",
    "Denise Harrison", "Noah Gibson", "Irene Mcdonald", "Christian Cruz", "Tammy Marshall",
    "Caleb Ortiz", "Lori Gomez", "Lucas Murray", "Monica Freeman", "Mason Wells",
    "Andrea Webb", "Elijah Simpson", "Cheryl Stevens", "Oliver Tucker", "Jacqueline Porter",
    "Carter Hunter", "Sara Hicks", "Landon Crawford", "Janice Boyd", "Owen Mason",
    "Crystal Ford", "Wyatt Morales", "Tiffany Kennedy", "Isaac Warren", "Amber Ball",
    "Luke Palmer", "Heather Robertson", "Gabriel Burke", "Melissa Daniels", "Julian Oliver",
    "Kelly Austin", "Levi Lawson", "Christina Manning", "Isaiah Washington", "Debra Clayton"
  ];

  const cohorts: Array<'senior' | 'adult' | 'teen' | 'chronic'> = ['senior', 'adult', 'teen', 'chronic'];
  const trends: Array<'improving' | 'declining' | 'stable'> = ['improving', 'declining', 'stable'];

  return names.map((name, index) => {
    const cohort = cohorts[index % 4];
    const baseAge = cohort === 'teen' ? 16 : cohort === 'adult' ? 35 : cohort === 'senior' ? 70 : 55;
    const ageVariation = cohort === 'teen' ? 7 : cohort === 'adult' ? 25 : 15;

    const age = baseAge + Math.floor(Math.random() * ageVariation);
    const ubziBase = cohort === 'teen' ? 75 : cohort === 'adult' ? 72 : cohort === 'senior' ? 65 : 60;
    const currentUBZI = Math.max(30, Math.min(100, ubziBase + Math.floor(Math.random() * 30) - 15));

    const trend = trends[Math.floor(Math.random() * trends.length)];
    const alertCount = Math.floor(Math.random() * 8);
    const criticalAlerts = Math.floor(alertCount * 0.3);

    // Generate realistic last activity
    const daysAgo = Math.floor(Math.random() * 7);
    const lastActivity = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    return {
      id: `resident-${String(index + 1).padStart(3, '0')}`,
      name,
      age,
      cohort,
      currentUBZI,
      ubziTrend: trend,
      lastActivity,
      alertCount,
      criticalAlerts,
      profileImage: `https://i.pravatar.cc/150?seed=${index + 1}`
    };
  });
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

    // Generate mock residents
    let residents = generateMockResidents();

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