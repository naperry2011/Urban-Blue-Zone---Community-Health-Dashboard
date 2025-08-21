const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Configuration
const CHECKINS_TABLE = process.env.CHECKINS_TABLE || 'ubz-checkins';
const AGGREGATIONS_TABLE = process.env.AGGREGATIONS_TABLE || 'ubz-aggregations';

// Blue Zone habit categories
const HABIT_CATEGORIES = {
    MOVE_NATURALLY: 'moveNaturally',
    RIGHT_TRIBE: 'rightTribe',
    PLANT_SLANT: 'plantSlant',
    DOWNSHIFT: 'downshift',
    PURPOSE: 'purpose'
};

// Scoring weights for UBZI calculation
const HABIT_WEIGHTS = {
    moveNaturally: 0.25,
    rightTribe: 0.20,
    plantSlant: 0.20,
    downshift: 0.20,
    purpose: 0.15
};

// Main handler
exports.handler = async (event) => {
    console.log('Processing check-in:', JSON.stringify(event));
    
    try {
        // Extract data from IoT message
        const {
            residentId,
            timestamp = new Date().toISOString(),
            habitType,
            data
        } = event;
        
        // Validate required fields
        if (!residentId || !habitType || !data) {
            throw new Error('Missing required fields: residentId, habitType, or data');
        }
        
        // Validate habit type
        if (!Object.values(HABIT_CATEGORIES).includes(habitType)) {
            throw new Error(`Invalid habit type: ${habitType}`);
        }
        
        // Process check-in based on type
        const processedData = await processHabitData(habitType, data);
        
        // Store check-in record
        const checkinRecord = {
            residentId,
            timestamp,
            habitType,
            ...processedData,
            rawData: data,
            ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60) // 90 days TTL
        };
        
        await dynamodb.put({
            TableName: CHECKINS_TABLE,
            Item: checkinRecord
        }).promise();
        
        // Update daily aggregation
        await updateDailyAggregation(residentId, habitType, processedData);
        
        // Calculate and update streaks
        const streak = await calculateStreak(residentId, habitType);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Check-in processed successfully',
                residentId,
                habitType,
                score: processedData.score,
                streak
            })
        };
        
    } catch (error) {
        console.error('Error processing check-in:', error);
        throw error;
    }
};

// Process habit data based on type
async function processHabitData(habitType, data) {
    let score = 0;
    let processedData = {};
    
    switch (habitType) {
        case HABIT_CATEGORIES.MOVE_NATURALLY:
            // Process movement data (steps, active minutes)
            score = calculateMovementScore(data);
            processedData = {
                steps: data.steps || 0,
                activeMinutes: data.activeMinutes || 0,
                distance: data.distance || 0,
                score
            };
            break;
            
        case HABIT_CATEGORIES.RIGHT_TRIBE:
            // Process social interaction data
            score = calculateSocialScore(data);
            processedData = {
                interactions: data.interactions || 0,
                meaningfulConnections: data.meaningfulConnections || 0,
                communityActivities: data.communityActivities || 0,
                score
            };
            break;
            
        case HABIT_CATEGORIES.PLANT_SLANT:
            // Process nutrition data
            score = calculateNutritionScore(data);
            processedData = {
                plantBasedMeals: data.plantBasedMeals || 0,
                vegetableServings: data.vegetableServings || 0,
                processedFoodAvoidance: data.processedFoodAvoidance || 0,
                score
            };
            break;
            
        case HABIT_CATEGORIES.DOWNSHIFT:
            // Process stress management data
            score = calculateStressScore(data);
            processedData = {
                stressLevel: data.stressLevel || 5,
                meditationMinutes: data.meditationMinutes || 0,
                relaxationActivities: data.relaxationActivities || 0,
                score
            };
            break;
            
        case HABIT_CATEGORIES.PURPOSE:
            // Process purpose/engagement data
            score = calculatePurposeScore(data);
            processedData = {
                purposeRating: data.purposeRating || 5,
                volunteerHours: data.volunteerHours || 0,
                goalProgress: data.goalProgress || 0,
                score
            };
            break;
            
        default:
            throw new Error(`Unknown habit type: ${habitType}`);
    }
    
    return processedData;
}

// Calculate movement score (0-100)
function calculateMovementScore(data) {
    const stepScore = Math.min((data.steps || 0) / 10000 * 100, 100);
    const activeScore = Math.min((data.activeMinutes || 0) / 30 * 100, 100);
    return Math.round((stepScore * 0.6 + activeScore * 0.4));
}

// Calculate social interaction score (0-100)
function calculateSocialScore(data) {
    const interactionScore = Math.min((data.interactions || 0) / 5 * 100, 100);
    const connectionScore = Math.min((data.meaningfulConnections || 0) / 2 * 100, 100);
    const communityScore = Math.min((data.communityActivities || 0) / 1 * 100, 100);
    return Math.round((interactionScore * 0.3 + connectionScore * 0.5 + communityScore * 0.2));
}

// Calculate nutrition score (0-100)
function calculateNutritionScore(data) {
    const plantScore = Math.min((data.plantBasedMeals || 0) / 2 * 100, 100);
    const veggieScore = Math.min((data.vegetableServings || 0) / 5 * 100, 100);
    const avoidanceScore = (data.processedFoodAvoidance || 0) * 20; // 0-5 scale
    return Math.round((plantScore * 0.4 + veggieScore * 0.4 + avoidanceScore * 0.2));
}

// Calculate stress management score (0-100)
function calculateStressScore(data) {
    const stressLevel = data.stressLevel || 5; // 1-10 scale, lower is better
    const stressScore = (10 - stressLevel) * 10;
    const meditationScore = Math.min((data.meditationMinutes || 0) / 20 * 100, 100);
    const relaxationScore = Math.min((data.relaxationActivities || 0) / 2 * 100, 100);
    return Math.round((stressScore * 0.5 + meditationScore * 0.3 + relaxationScore * 0.2));
}

// Calculate purpose score (0-100)
function calculatePurposeScore(data) {
    const purposeScore = (data.purposeRating || 5) * 10; // 1-10 scale
    const volunteerScore = Math.min((data.volunteerHours || 0) / 2 * 100, 100);
    const goalScore = (data.goalProgress || 0); // Already 0-100
    return Math.round((purposeScore * 0.5 + volunteerScore * 0.25 + goalScore * 0.25));
}

// Update daily aggregation
async function updateDailyAggregation(residentId, habitType, data) {
    const today = new Date().toISOString().split('T')[0];
    const aggregationId = `${residentId}-${today}`;
    
    try {
        // Try to update existing aggregation
        await dynamodb.update({
            TableName: AGGREGATIONS_TABLE,
            Key: {
                aggregationId,
                type: 'daily'
            },
            UpdateExpression: 'SET #habit = :data, lastUpdated = :timestamp',
            ExpressionAttributeNames: {
                '#habit': habitType
            },
            ExpressionAttributeValues: {
                ':data': data,
                ':timestamp': new Date().toISOString()
            }
        }).promise();
    } catch (error) {
        // If doesn't exist, create new aggregation
        await dynamodb.put({
            TableName: AGGREGATIONS_TABLE,
            Item: {
                aggregationId,
                type: 'daily',
                residentId,
                date: today,
                [habitType]: data,
                lastUpdated: new Date().toISOString(),
                ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60) // 90 days TTL
            }
        }).promise();
    }
}

// Calculate streak for a habit
async function calculateStreak(residentId, habitType) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Look back 30 days
    
    try {
        // Query check-ins for the last 30 days
        const result = await dynamodb.query({
            TableName: CHECKINS_TABLE,
            KeyConditionExpression: 'residentId = :residentId AND #timestamp BETWEEN :start AND :end',
            FilterExpression: 'habitType = :habitType',
            ExpressionAttributeNames: {
                '#timestamp': 'timestamp'
            },
            ExpressionAttributeValues: {
                ':residentId': residentId,
                ':habitType': habitType,
                ':start': startDate.toISOString(),
                ':end': endDate.toISOString()
            },
            ScanIndexForward: false // Most recent first
        }).promise();
        
        if (!result.Items || result.Items.length === 0) {
            return 0;
        }
        
        // Calculate consecutive days
        let streak = 0;
        let lastDate = null;
        const today = new Date().toISOString().split('T')[0];
        
        for (const item of result.Items) {
            const itemDate = item.timestamp.split('T')[0];
            
            if (!lastDate) {
                // First item - check if it's today or yesterday
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                
                if (itemDate === today || itemDate === yesterdayStr) {
                    streak = 1;
                    lastDate = itemDate;
                } else {
                    break; // Streak is broken
                }
            } else {
                // Check if consecutive
                const lastDateObj = new Date(lastDate);
                lastDateObj.setDate(lastDateObj.getDate() - 1);
                const expectedDate = lastDateObj.toISOString().split('T')[0];
                
                if (itemDate === expectedDate) {
                    streak++;
                    lastDate = itemDate;
                } else {
                    break; // Streak is broken
                }
            }
        }
        
        return streak;
        
    } catch (error) {
        console.error('Error calculating streak:', error);
        return 0;
    }
}