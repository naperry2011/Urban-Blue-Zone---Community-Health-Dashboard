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
        // Handle both old format and new enhanced format
        let checkInData;
        
        if (event.habits && event.ubziComponent) {
            // New enhanced format from improved simulator
            checkInData = {
                residentId: event.residentId,
                timestamp: event.timestamp || new Date().toISOString(),
                type: event.type || 'habit_checkin',
                habits: event.habits,
                scores: event.scores,
                ubziComponent: event.ubziComponent,
                metadata: event.metadata
            };
        } else {
            // Legacy format for backward compatibility
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
            
            // Convert legacy format to new format
            checkInData = await convertLegacyCheckIn(residentId, timestamp, habitType, data);
        }
        
        // Process the enhanced check-in
        const processedData = await processEnhancedCheckIn(checkInData);
        
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

// Process enhanced check-in with all habits in one record
async function processEnhancedCheckIn(checkInData) {
    console.log('Processing enhanced check-in for:', checkInData.residentId);
    
    // Calculate overall UBZI if not provided
    let ubziScore = checkInData.ubziComponent;
    if (!ubziScore && checkInData.scores) {
        ubziScore = calculateUBZI(checkInData.scores);
    }
    
    // Store the comprehensive check-in record
    await storeEnhancedCheckIn(checkInData, ubziScore);
    
    // Trigger habit analytics (streak calculation, alerts)
    await triggerHabitAnalytics(checkInData);
    
    return {
        residentId: checkInData.residentId,
        timestamp: checkInData.timestamp,
        ubziScore: ubziScore,
        habits: Object.keys(checkInData.habits || {}),
        processed: true
    };
}

// Convert legacy single-habit check-in to new format
async function convertLegacyCheckIn(residentId, timestamp, habitType, data) {
    const processedData = await processHabitData(habitType, data);
    
    // Create enhanced format structure
    const enhanced = {
        residentId,
        timestamp,
        type: 'habit_checkin_legacy',
        habits: {},
        scores: {},
        ubziComponent: 0,
        metadata: {
            legacyHabitType: habitType,
            timeOfDay: getTimeOfDay(timestamp)
        }
    };
    
    // Map legacy habit types to new structure
    switch (habitType) {
        case HABIT_CATEGORIES.MOVE_NATURALLY:
            enhanced.habits.movement = {
                score: processedData.score,
                steps: processedData.steps,
                activeMinutes: processedData.activeMinutes,
                category: processedData.score > 70 ? 'active' : processedData.score > 40 ? 'moderate' : 'low'
            };
            enhanced.scores.movement = processedData.score;
            break;
            
        case HABIT_CATEGORIES.RIGHT_TRIBE:
            enhanced.habits.social = {
                interactionCount: processedData.interactions,
                meaningfulConnections: processedData.meaningfulConnections,
                category: processedData.interactions > 5 ? 'connected' : processedData.interactions > 2 ? 'moderate' : 'isolated'
            };
            enhanced.scores.social = processedData.score;
            break;
            
        case HABIT_CATEGORIES.PLANT_SLANT:
            enhanced.habits.nutrition = {
                plantSlant: processedData.plantBasedMeals > 1 ? 'plant_heavy' : processedData.plantBasedMeals > 0 ? 'mixed' : 'processed',
                plantBasedMeals: processedData.plantBasedMeals,
                vegetableServings: processedData.vegetableServings
            };
            enhanced.scores.plantSlant = processedData.score;
            break;
            
        case HABIT_CATEGORIES.DOWNSHIFT:
            enhanced.habits.stress = {
                level: processedData.stressLevel,
                downshiftMinutes: processedData.meditationMinutes,
                relaxationActivities: processedData.relaxationActivities,
                category: processedData.stressLevel < 4 ? 'low' : processedData.stressLevel < 7 ? 'moderate' : 'high'
            };
            enhanced.scores.downshift = processedData.score;
            break;
            
        case HABIT_CATEGORIES.PURPOSE:
            enhanced.habits.purpose = {
                pulse: processedData.purposeRating > 7 ? 1 : processedData.purposeRating < 4 ? -1 : 0,
                volunteerHours: processedData.volunteerHours,
                goalProgress: processedData.goalProgress
            };
            enhanced.scores.purpose = processedData.score;
            break;
    }
    
    enhanced.ubziComponent = calculateUBZI(enhanced.scores);
    
    return enhanced;
}

// Store enhanced check-in record
async function storeEnhancedCheckIn(checkInData, ubziScore) {
    const record = {
        resident_id: checkInData.residentId,
        timestamp: Date.parse(checkInData.timestamp), // Store as number for sorting
        iso_timestamp: checkInData.timestamp,
        type: checkInData.type || 'habit_checkin',
        habits: checkInData.habits,
        scores: checkInData.scores || {},
        ubzi_component: ubziScore,
        metadata: checkInData.metadata || {},
        ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60) // 90 days retention
    };
    
    const params = {
        TableName: CHECKINS_TABLE,
        Item: record
    };
    
    await dynamodb.put(params).promise();
    console.log(`Stored enhanced check-in for ${checkInData.residentId} with UBZI: ${ubziScore}`);
}

// Calculate UBZI from individual habit scores
function calculateUBZI(scores) {
    let ubzi = 0;
    let totalWeight = 0;
    
    // Movement (30%)
    if (scores.movement !== undefined) {
        ubzi += scores.movement * 0.30;
        totalWeight += 0.30;
    }
    
    // Plant Slant (25%)
    if (scores.plantSlant !== undefined) {
        ubzi += scores.plantSlant * 0.25;
        totalWeight += 0.25;
    }
    
    // Downshift (20%)
    if (scores.downshift !== undefined) {
        ubzi += scores.downshift * 0.20;
        totalWeight += 0.20;
    }
    
    // Social (15%)
    if (scores.social !== undefined) {
        ubzi += scores.social * 0.15;
        totalWeight += 0.15;
    }
    
    // Purpose (10%)
    if (scores.purpose !== undefined) {
        ubzi += scores.purpose * 0.10;
        totalWeight += 0.10;
    }
    
    // Normalize if not all scores are present
    return totalWeight > 0 ? Math.round(ubzi / totalWeight * 100) / 100 : 50;
}

// Trigger habit analytics processing
async function triggerHabitAnalytics(checkInData) {
    // In a production system, this would trigger the habit-analyzer Lambda
    // For now, we'll just log that analytics should be triggered
    console.log(`Triggering habit analytics for ${checkInData.residentId}`);
    
    // Could invoke the habit-analyzer Lambda here:
    // const lambda = new AWS.Lambda();
    // await lambda.invoke({
    //     FunctionName: 'ubz-habit-analyzer',
    //     InvocationType: 'Event',
    //     Payload: JSON.stringify({
    //         analysisType: 'individual',
    //         residentId: checkInData.residentId,
    //         checkIn: checkInData
    //     })
    // }).promise();
}

// Helper function to determine time of day
function getTimeOfDay(timestamp) {
    const hour = new Date(timestamp).getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
}

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