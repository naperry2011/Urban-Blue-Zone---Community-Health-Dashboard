const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Configuration
const CHECKINS_TABLE = process.env.CHECKINS_TABLE || 'ubz-checkins';
const AGGREGATIONS_TABLE = process.env.AGGREGATIONS_TABLE || 'ubz-aggregations';
const RESIDENTS_TABLE = process.env.RESIDENTS_TABLE || 'ubz-residents';
const ALERTS_TABLE = process.env.ALERTS_TABLE || 'ubz-alerts';

// Habit thresholds for alerts
const HABIT_THRESHOLDS = {
    movement: {
        low: 30,
        moderate: 50,
        good: 70
    },
    stress: {
        high: 7,
        moderate: 5,
        low: 3
    },
    social: {
        isolated: 2,
        moderate: 5,
        connected: 8
    },
    nutrition: {
        poor: 0.3,    // Less than 30% plant-based
        moderate: 0.5, // 50% plant-based
        good: 0.7     // 70%+ plant-based
    },
    purpose: {
        negative: -0.3,
        neutral: 0.3,
        positive: 0.7
    }
};

// Streak requirements
const STREAK_REQUIREMENTS = {
    movement: 50,      // Score > 50 to maintain streak
    downshift: 15,     // Minutes > 15 to maintain streak
    plantSlant: 0.6,   // 60%+ plant-based to maintain streak
    social: 3,         // Interactions > 3 to maintain streak
    purpose: 0         // Positive pulse to maintain streak
};

exports.handler = async (event) => {
    console.log('Habit analyzer triggered:', JSON.stringify(event));
    
    try {
        // Determine the analysis type from event source
        const analysisType = getAnalysisType(event);
        
        switch (analysisType) {
            case 'individual':
                return await analyzeIndividualHabits(event);
            case 'cohort':
                return await analyzeCohortHabits(event);
            case 'aggregate':
                return await performHourlyAggregation();
            case 'daily':
                return await performDailyAggregation();
            default:
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Unknown analysis type' })
                };
        }
    } catch (error) {
        console.error('Error in habit analyzer:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

function getAnalysisType(event) {
    // EventBridge scheduled event
    if (event.source === 'aws.events' && event['detail-type'] === 'Scheduled Event') {
        return event.resources?.[0]?.includes('daily') ? 'daily' : 'aggregate';
    }
    
    // DynamoDB Stream event
    if (event.Records && event.Records[0]?.eventSource === 'aws:dynamodb') {
        return 'individual';
    }
    
    // Direct invocation
    if (event.analysisType) {
        return event.analysisType;
    }
    
    // API Gateway
    if (event.httpMethod) {
        return event.queryStringParameters?.type || 'individual';
    }
    
    return 'aggregate';
}

async function analyzeIndividualHabits(event) {
    let residentId;
    let checkInData;
    
    // Parse event based on source
    if (event.Records) {
        // DynamoDB Stream
        const record = event.Records[0];
        const image = record.dynamodb.NewImage;
        residentId = image.resident_id?.S;
        checkInData = AWS.DynamoDB.Converter.unmarshall(image);
    } else {
        // Direct invocation
        residentId = event.residentId;
        checkInData = event.checkIn;
    }
    
    if (!residentId) {
        throw new Error('Resident ID not provided');
    }
    
    // Get recent check-ins for streak calculation
    const recentCheckIns = await getRecentCheckIns(residentId, 7); // Last 7 days
    
    // Calculate streaks
    const streaks = calculateStreaks(recentCheckIns);
    
    // Analyze current habits
    const analysis = analyzeHabitData(checkInData, streaks);
    
    // Check for alerts
    const alerts = checkHabitAlerts(analysis, residentId);
    
    // Store alerts if any
    if (alerts.length > 0) {
        await storeAlerts(alerts);
    }
    
    // Update resident profile with latest streaks
    await updateResidentStreaks(residentId, streaks);
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            residentId,
            analysis,
            streaks,
            alerts: alerts.length,
            timestamp: new Date().toISOString()
        })
    };
}

async function analyzeCohortHabits(event) {
    const cohort = event.cohort || 'all';
    const timeRange = event.timeRange || 24; // Hours
    
    // Get all residents in cohort
    const residents = await getResidentsByCohort(cohort);
    
    // Aggregate habit data for each resident
    const cohortData = await Promise.all(
        residents.map(async (resident) => {
            const checkIns = await getRecentCheckIns(resident.resident_id, timeRange / 24);
            return aggregateHabitData(checkIns);
        })
    );
    
    // Calculate cohort averages
    const cohortAverages = calculateCohortAverages(cohortData);
    
    // Identify trends
    const trends = identifyTrends(cohortData);
    
    // Store cohort aggregation
    await storeCohortAggregation(cohort, cohortAverages, trends);
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            cohort,
            residentCount: residents.length,
            averages: cohortAverages,
            trends,
            timestamp: new Date().toISOString()
        })
    };
}

async function performHourlyAggregation() {
    console.log('Performing hourly habit aggregation');
    
    const now = new Date();
    const hourAgo = new Date(now - 60 * 60 * 1000);
    
    // Get all check-ins from the last hour
    const checkIns = await getCheckInsInTimeRange(hourAgo, now);
    
    // Group by resident
    const byResident = groupByResident(checkIns);
    
    // Calculate hourly metrics
    const hourlyMetrics = calculateHourlyMetrics(byResident);
    
    // Store aggregations
    await storeHourlyAggregation(hourlyMetrics);
    
    // Check for cohort-level alerts
    const cohortAlerts = checkCohortAlerts(hourlyMetrics);
    if (cohortAlerts.length > 0) {
        await storeAlerts(cohortAlerts);
    }
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            processed: checkIns.length,
            residents: Object.keys(byResident).length,
            metrics: hourlyMetrics,
            alerts: cohortAlerts.length,
            timestamp: now.toISOString()
        })
    };
}

async function performDailyAggregation() {
    console.log('Performing daily habit aggregation');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get all check-ins for the day
    const checkIns = await getCheckInsInTimeRange(today, tomorrow);
    
    // Calculate daily statistics
    const dailyStats = calculateDailyStatistics(checkIns);
    
    // Calculate UBZI scores
    const ubziScores = await calculateDailyUBZI(checkIns);
    
    // Store daily aggregation
    await storeDailyAggregation(dailyStats, ubziScores);
    
    // Generate daily summary alert
    await generateDailySummary(dailyStats, ubziScores);
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            date: today.toISOString().split('T')[0],
            processed: checkIns.length,
            stats: dailyStats,
            avgUBZI: ubziScores.average,
            timestamp: new Date().toISOString()
        })
    };
}

// Helper functions
async function getRecentCheckIns(residentId, days) {
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - days);
    
    const params = {
        TableName: CHECKINS_TABLE,
        KeyConditionExpression: 'resident_id = :rid AND #ts > :start',
        ExpressionAttributeNames: {
            '#ts': 'timestamp'
        },
        ExpressionAttributeValues: {
            ':rid': residentId,
            ':start': startTime.getTime()
        },
        ScanIndexForward: false // Most recent first
    };
    
    const result = await dynamodb.query(params).promise();
    return result.Items || [];
}

function calculateStreaks(checkIns) {
    const streaks = {
        movement: { current: 0, best: 0, lastMet: null },
        downshift: { current: 0, best: 0, lastMet: null },
        plantSlant: { current: 0, best: 0, lastMet: null },
        social: { current: 0, best: 0, lastMet: null },
        purpose: { current: 0, best: 0, lastMet: null }
    };
    
    // Group check-ins by day
    const byDay = {};
    checkIns.forEach(checkIn => {
        const day = new Date(checkIn.timestamp).toDateString();
        if (!byDay[day]) byDay[day] = [];
        byDay[day].push(checkIn);
    });
    
    // Check each day for streak requirements
    const days = Object.keys(byDay).sort();
    let previousDay = null;
    
    days.forEach(day => {
        const dayCheckIns = byDay[day];
        const dayMet = checkDayRequirements(dayCheckIns);
        
        // Check if this continues streaks
        const dayDate = new Date(day);
        const prevDate = previousDay ? new Date(previousDay) : null;
        const isConsecutive = prevDate && (dayDate - prevDate) === 86400000; // 1 day
        
        Object.keys(streaks).forEach(habit => {
            if (dayMet[habit]) {
                if (isConsecutive && streaks[habit].lastMet === previousDay) {
                    streaks[habit].current++;
                } else {
                    streaks[habit].current = 1;
                }
                streaks[habit].lastMet = day;
                
                if (streaks[habit].current > streaks[habit].best) {
                    streaks[habit].best = streaks[habit].current;
                }
            } else if (streaks[habit].lastMet === previousDay) {
                // Streak broken
                streaks[habit].current = 0;
            }
        });
        
        previousDay = day;
    });
    
    return streaks;
}

function checkDayRequirements(dayCheckIns) {
    const met = {
        movement: false,
        downshift: false,
        plantSlant: false,
        social: false,
        purpose: false
    };
    
    // Aggregate day's data
    let totalMovement = 0;
    let totalDownshift = 0;
    let plantMeals = 0;
    let totalMeals = 0;
    let totalSocial = 0;
    let purposeScore = 0;
    
    dayCheckIns.forEach(checkIn => {
        if (checkIn.habits) {
            totalMovement = Math.max(totalMovement, checkIn.habits.movement?.score || 0);
            totalDownshift += checkIn.habits.stress?.downshiftMinutes || 0;
            
            if (checkIn.habits.nutrition?.plantSlant === 'plant_heavy') plantMeals++;
            if (checkIn.habits.nutrition?.plantSlant) totalMeals++;
            
            totalSocial += checkIn.habits.social?.interactionCount || 0;
            purposeScore = Math.max(purposeScore, checkIn.habits.purpose?.pulse || -1);
        }
    });
    
    // Check against requirements
    met.movement = totalMovement >= STREAK_REQUIREMENTS.movement;
    met.downshift = totalDownshift >= STREAK_REQUIREMENTS.downshift;
    met.plantSlant = totalMeals > 0 && (plantMeals / totalMeals) >= STREAK_REQUIREMENTS.plantSlant;
    met.social = totalSocial >= STREAK_REQUIREMENTS.social;
    met.purpose = purposeScore > STREAK_REQUIREMENTS.purpose;
    
    return met;
}

function analyzeHabitData(checkInData, streaks) {
    const analysis = {
        scores: {},
        categories: {},
        streaks: streaks,
        risks: [],
        strengths: []
    };
    
    if (checkInData.habits) {
        // Movement analysis
        const movementScore = checkInData.habits.movement?.score || 0;
        analysis.scores.movement = movementScore;
        if (movementScore < HABIT_THRESHOLDS.movement.low) {
            analysis.risks.push('Low physical activity');
            analysis.categories.movement = 'at_risk';
        } else if (movementScore > HABIT_THRESHOLDS.movement.good) {
            analysis.strengths.push('Excellent physical activity');
            analysis.categories.movement = 'excellent';
        } else {
            analysis.categories.movement = 'moderate';
        }
        
        // Stress analysis
        const stressLevel = checkInData.habits.stress?.level || 0;
        analysis.scores.stress = stressLevel;
        if (stressLevel > HABIT_THRESHOLDS.stress.high) {
            analysis.risks.push('High stress levels');
            analysis.categories.stress = 'high';
        } else if (stressLevel < HABIT_THRESHOLDS.stress.low) {
            analysis.strengths.push('Low stress levels');
            analysis.categories.stress = 'low';
        } else {
            analysis.categories.stress = 'moderate';
        }
        
        // Social analysis
        const socialCount = checkInData.habits.social?.interactionCount || 0;
        analysis.scores.social = socialCount;
        if (socialCount < HABIT_THRESHOLDS.social.isolated) {
            analysis.risks.push('Social isolation risk');
            analysis.categories.social = 'isolated';
        } else if (socialCount > HABIT_THRESHOLDS.social.connected) {
            analysis.strengths.push('Strong social connections');
            analysis.categories.social = 'connected';
        } else {
            analysis.categories.social = 'moderate';
        }
    }
    
    // Calculate habit health score (0-100)
    analysis.habitHealthScore = calculateHabitHealthScore(analysis.scores);
    
    return analysis;
}

function calculateHabitHealthScore(scores) {
    let total = 0;
    let count = 0;
    
    if (scores.movement !== undefined) {
        total += scores.movement;
        count++;
    }
    
    if (scores.stress !== undefined) {
        total += (10 - scores.stress) * 10; // Invert stress (lower is better)
        count++;
    }
    
    if (scores.social !== undefined) {
        total += Math.min(100, scores.social * 10);
        count++;
    }
    
    return count > 0 ? Math.round(total / count) : 50;
}

function checkHabitAlerts(analysis, residentId) {
    const alerts = [];
    const now = new Date().toISOString();
    
    // Check for risk conditions
    if (analysis.categories.movement === 'at_risk' && analysis.streaks.movement.current < 3) {
        alerts.push({
            resident_id: residentId,
            timestamp: now,
            type: 'movement_low',
            severity: 'info',
            message: 'Low movement detected for multiple days',
            details: {
                currentScore: analysis.scores.movement,
                streak: analysis.streaks.movement.current
            }
        });
    }
    
    if (analysis.categories.stress === 'high' && analysis.streaks.downshift.current < 2) {
        alerts.push({
            resident_id: residentId,
            timestamp: now,
            type: 'stress_high',
            severity: 'warning',
            message: 'High stress with insufficient relaxation',
            details: {
                stressLevel: analysis.scores.stress,
                downshiftStreak: analysis.streaks.downshift.current
            }
        });
    }
    
    if (analysis.categories.social === 'isolated') {
        alerts.push({
            resident_id: residentId,
            timestamp: now,
            type: 'social_low',
            severity: 'info',
            message: 'Social isolation detected',
            details: {
                interactions: analysis.scores.social,
                socialStreak: analysis.streaks.social.current
            }
        });
    }
    
    return alerts;
}

async function storeAlerts(alerts) {
    const putRequests = alerts.map(alert => ({
        PutRequest: {
            Item: {
                ...alert,
                ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
            }
        }
    }));
    
    if (putRequests.length > 0) {
        const params = {
            RequestItems: {
                [ALERTS_TABLE]: putRequests
            }
        };
        
        await dynamodb.batchWrite(params).promise();
    }
}

async function updateResidentStreaks(residentId, streaks) {
    const params = {
        TableName: RESIDENTS_TABLE,
        Key: { resident_id: residentId },
        UpdateExpression: 'SET habit_streaks = :streaks, last_habit_update = :now',
        ExpressionAttributeValues: {
            ':streaks': streaks,
            ':now': new Date().toISOString()
        }
    };
    
    await dynamodb.update(params).promise();
}

async function getResidentsByCohort(cohort) {
    const params = cohort === 'all' ? {
        TableName: RESIDENTS_TABLE
    } : {
        TableName: RESIDENTS_TABLE,
        IndexName: 'cohort-index',
        KeyConditionExpression: 'cohort = :cohort',
        ExpressionAttributeValues: {
            ':cohort': cohort
        }
    };
    
    const result = cohort === 'all' ? 
        await dynamodb.scan(params).promise() :
        await dynamodb.query(params).promise();
        
    return result.Items || [];
}

function calculateCohortAverages(cohortData) {
    const totals = {
        movement: 0,
        stress: 0,
        social: 0,
        nutrition: 0,
        purpose: 0,
        ubzi: 0
    };
    
    let count = 0;
    
    cohortData.forEach(data => {
        if (data && data.averages) {
            totals.movement += data.averages.movement || 0;
            totals.stress += data.averages.stress || 0;
            totals.social += data.averages.social || 0;
            totals.nutrition += data.averages.nutrition || 0;
            totals.purpose += data.averages.purpose || 0;
            totals.ubzi += data.ubzi || 0;
            count++;
        }
    });
    
    if (count === 0) return totals;
    
    return {
        movement: Math.round(totals.movement / count),
        stress: Math.round(totals.stress / count * 10) / 10,
        social: Math.round(totals.social / count),
        nutrition: Math.round(totals.nutrition / count * 100) / 100,
        purpose: Math.round(totals.purpose / count * 10) / 10,
        ubzi: Math.round(totals.ubzi / count)
    };
}

module.exports = {
    handler: exports.handler,
    calculateStreaks,
    analyzeHabitData,
    checkHabitAlerts
};