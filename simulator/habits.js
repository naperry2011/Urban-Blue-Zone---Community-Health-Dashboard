// Blue Zone Habit Patterns Generator

// Time-based patterns for different cohorts
const habitPatterns = {
    senior: {
        morning: {
            movement: { base: 65, variation: 15 },  // Morning walks common
            stress: { base: 4, variation: 2 },      // Lower stress in morning
            social: { base: 3, variation: 2 },      // Coffee meetups
            downshift: { base: 20, variation: 10 }, // Morning meditation/prayer
            plantSlant: { probability: 0.7 },       // Healthy breakfast habits
            purpose: { base: 0.8, variation: 0.2 }  // Strong purpose in retirement
        },
        afternoon: {
            movement: { base: 45, variation: 10 },
            stress: { base: 5, variation: 2 },
            social: { base: 5, variation: 3 },      // Afternoon social activities
            downshift: { base: 15, variation: 5 },
            plantSlant: { probability: 0.6 },
            purpose: { base: 0.7, variation: 0.2 }
        },
        evening: {
            movement: { base: 30, variation: 10 },  // Less evening activity
            stress: { base: 3, variation: 2 },      // Relaxed evenings
            social: { base: 2, variation: 2 },      // Family time
            downshift: { base: 25, variation: 10 }, // Evening relaxation
            plantSlant: { probability: 0.65 },
            purpose: { base: 0.7, variation: 0.3 }
        }
    },
    adult: {
        morning: {
            movement: { base: 55, variation: 20 },  // Gym/commute
            stress: { base: 6, variation: 3 },      // Work stress starting
            social: { base: 2, variation: 1 },      // Limited morning social
            downshift: { base: 10, variation: 5 },  // Quick meditation
            plantSlant: { probability: 0.5 },       // Mixed breakfast habits
            purpose: { base: 0.6, variation: 0.3 }  // Career-focused
        },
        afternoon: {
            movement: { base: 40, variation: 15 },  // Desk work
            stress: { base: 7, variation: 3 },      // Peak work stress
            social: { base: 4, variation: 2 },      // Work interactions
            downshift: { base: 5, variation: 3 },   // Limited break time
            plantSlant: { probability: 0.4 },       // Often fast food lunch
            purpose: { base: 0.5, variation: 0.3 }
        },
        evening: {
            movement: { base: 50, variation: 20 },  // Evening exercise/chores
            stress: { base: 5, variation: 3 },      // Winding down
            social: { base: 6, variation: 3 },      // Family/friends time
            downshift: { base: 20, variation: 10 }, // Evening relaxation
            plantSlant: { probability: 0.6 },       // Better dinner choices
            purpose: { base: 0.6, variation: 0.3 }
        }
    },
    teen: {
        morning: {
            movement: { base: 60, variation: 25 },  // School sports/walk
            stress: { base: 5, variation: 3 },      // School stress
            social: { base: 4, variation: 3 },      // Friends at school
            downshift: { base: 5, variation: 5 },   // Minimal relaxation
            plantSlant: { probability: 0.3 },       // Often skip breakfast
            purpose: { base: 0.4, variation: 0.4 }  // Still finding purpose
        },
        afternoon: {
            movement: { base: 75, variation: 20 },  // Sports/activities
            stress: { base: 6, variation: 3 },      // Homework stress
            social: { base: 8, variation: 3 },      // Peak social time
            downshift: { base: 10, variation: 5 },  // Gaming/music
            plantSlant: { probability: 0.35 },      // Snacking habits
            purpose: { base: 0.5, variation: 0.4 }
        },
        evening: {
            movement: { base: 45, variation: 20 },  // Varies widely
            stress: { base: 4, variation: 3 },      // Homework/relaxing
            social: { base: 7, variation: 4 },      // Online/in-person social
            downshift: { base: 15, variation: 10 }, // Screen time
            plantSlant: { probability: 0.5 },       // Family dinner
            purpose: { base: 0.4, variation: 0.4 }
        }
    }
};

// Condition-specific modifiers
const conditionModifiers = {
    hypertension: {
        stress: 1.3,         // Higher stress levels
        movement: 0.85,      // Slightly reduced movement
        plantSlant: 0.9,     // Trying to eat better
        downshift: 1.2       // More need for relaxation
    },
    diabetes: {
        plantSlant: 1.3,     // More conscious of diet
        movement: 0.9,       // Moderate activity
        stress: 1.1,         // Slightly elevated stress
        social: 1.0          // Normal social patterns
    },
    copd: {
        movement: 0.6,       // Significantly reduced movement
        stress: 1.4,         // Higher stress from condition
        downshift: 1.3,      // More rest needed
        social: 0.8          // Slightly reduced social activity
    },
    healthy: {
        movement: 1.2,       // More active
        stress: 0.8,         // Lower stress
        plantSlant: 1.1,     // Better eating habits
        social: 1.1,         // More social engagement
        purpose: 1.1         // Stronger sense of purpose
    }
};

// Day of week patterns
const dayOfWeekPatterns = {
    0: { movement: 1.1, social: 1.3, stress: 0.7 },  // Sunday - more social, less stress
    1: { movement: 0.9, social: 0.8, stress: 1.2 },  // Monday - back to work stress
    2: { movement: 1.0, social: 0.9, stress: 1.1 },  // Tuesday
    3: { movement: 1.0, social: 1.0, stress: 1.1 },  // Wednesday
    4: { movement: 0.95, social: 1.1, stress: 1.0 }, // Thursday
    5: { movement: 1.05, social: 1.2, stress: 0.9 }, // Friday - social uptick
    6: { movement: 1.2, social: 1.4, stress: 0.6 }   // Saturday - most active/social
};

// Streak tracking
const streakTrackers = new Map();

function initializeStreaks(residentId) {
    if (!streakTrackers.has(residentId)) {
        streakTrackers.set(residentId, {
            movement: { current: 0, best: 0, lastCheck: null },
            downshift: { current: 0, best: 0, lastCheck: null },
            plantSlant: { current: 0, best: 0, lastCheck: null },
            social: { current: 0, best: 0, lastCheck: null },
            purpose: { current: 0, best: 0, lastCheck: null }
        });
    }
    return streakTrackers.get(residentId);
}

function updateStreak(residentId, habit, achieved, timestamp) {
    const streaks = initializeStreaks(residentId);
    const habitStreak = streaks[habit];
    const today = new Date(timestamp).toDateString();
    
    if (habitStreak.lastCheck !== today) {
        if (achieved) {
            habitStreak.current++;
            if (habitStreak.current > habitStreak.best) {
                habitStreak.best = habitStreak.current;
            }
        } else {
            habitStreak.current = 0;
        }
        habitStreak.lastCheck = today;
    }
    
    return habitStreak.current;
}

function generateHabitCheckIn(resident, timestamp = new Date()) {
    const hour = timestamp.getHours();
    const dayOfWeek = timestamp.getDay();
    
    // Determine time period
    let period = 'morning';
    if (hour >= 12 && hour < 17) period = 'afternoon';
    else if (hour >= 17) period = 'evening';
    
    // Get base patterns for resident type and time
    const patterns = habitPatterns[resident.type][period];
    const dayModifiers = dayOfWeekPatterns[dayOfWeek];
    
    // Get condition modifiers
    const conditions = resident.conditions || [];
    let conditionMod = conditions.length > 0 ? 
        conditionModifiers[conditions[0]] || conditionModifiers.healthy :
        conditionModifiers.healthy;
    
    // Generate movement score (0-100)
    let movementScore = patterns.movement.base + 
        (Math.random() * patterns.movement.variation * 2 - patterns.movement.variation);
    movementScore *= (conditionMod.movement || 1) * (dayModifiers.movement || 1);
    movementScore = Math.max(0, Math.min(100, Math.round(movementScore)));
    
    // Generate stress level (0-10)
    let stressLevel = patterns.stress.base + 
        (Math.random() * patterns.stress.variation * 2 - patterns.stress.variation);
    stressLevel *= (conditionMod.stress || 1) * (dayModifiers.stress || 1);
    stressLevel = Math.max(0, Math.min(10, Math.round(stressLevel)));
    
    // Generate downshift minutes (0-60)
    let downshiftMinutes = patterns.downshift.base + 
        (Math.random() * patterns.downshift.variation * 2 - patterns.downshift.variation);
    downshiftMinutes *= (conditionMod.downshift || 1);
    downshiftMinutes = Math.max(0, Math.min(60, Math.round(downshiftMinutes)));
    
    // Generate plant slant (categorical)
    const plantProbability = patterns.plantSlant.probability * (conditionMod.plantSlant || 1);
    let plantSlant = 'mixed';
    const plantRoll = Math.random();
    if (plantRoll < plantProbability * 0.7) plantSlant = 'plant_heavy';
    else if (plantRoll > 0.85) plantSlant = 'processed';
    
    // Generate social count (0-20)
    let socialCount = patterns.social.base + 
        (Math.random() * patterns.social.variation * 2 - patterns.social.variation);
    socialCount *= (conditionMod.social || 1) * (dayModifiers.social || 1);
    socialCount = Math.max(0, Math.min(20, Math.round(socialCount)));
    
    // Generate purpose pulse (-1, 0, 1)
    const purposeValue = patterns.purpose.base + 
        (Math.random() * patterns.purpose.variation * 2 - patterns.purpose.variation);
    const purposeAdjusted = purposeValue * (conditionMod.purpose || 1);
    let purposePulse = 0;
    if (purposeAdjusted > 0.7) purposePulse = 1;
    else if (purposeAdjusted < 0.3) purposePulse = -1;
    
    // Calculate streaks
    const movementStreak = updateStreak(resident.id, 'movement', movementScore > 50, timestamp);
    const downshiftStreak = updateStreak(resident.id, 'downshift', downshiftMinutes > 15, timestamp);
    const plantStreak = updateStreak(resident.id, 'plantSlant', plantSlant === 'plant_heavy', timestamp);
    const socialStreak = updateStreak(resident.id, 'social', socialCount > 3, timestamp);
    const purposeStreak = updateStreak(resident.id, 'purpose', purposePulse > 0, timestamp);
    
    // Calculate habit scores for UBZI component
    const habitScores = {
        movement: movementScore,
        downshift: Math.round((1 - stressLevel/10) * 100),
        plantSlant: plantSlant === 'plant_heavy' ? 100 : plantSlant === 'mixed' ? 60 : 20,
        social: Math.min(100, socialCount * 10),
        purpose: (purposePulse + 1) * 50
    };
    
    // Calculate UBZI component (weighted average)
    const ubziComponent = Math.round(
        habitScores.movement * 0.30 +
        habitScores.downshift * 0.20 +
        habitScores.plantSlant * 0.25 +
        habitScores.social * 0.15 +
        habitScores.purpose * 0.10
    );
    
    return {
        residentId: resident.id,
        timestamp: timestamp.toISOString(),
        type: 'habit_checkin',
        habits: {
            movement: {
                score: movementScore,
                streak: movementStreak,
                category: movementScore > 70 ? 'active' : movementScore > 40 ? 'moderate' : 'low'
            },
            stress: {
                level: stressLevel,
                downshiftMinutes: downshiftMinutes,
                streak: downshiftStreak,
                category: stressLevel < 4 ? 'low' : stressLevel < 7 ? 'moderate' : 'high'
            },
            nutrition: {
                plantSlant: plantSlant,
                streak: plantStreak,
                mealQuality: plantSlant === 'plant_heavy' ? 'excellent' : plantSlant === 'mixed' ? 'good' : 'poor'
            },
            social: {
                interactionCount: socialCount,
                streak: socialStreak,
                category: socialCount > 10 ? 'highly_connected' : socialCount > 5 ? 'connected' : 'isolated'
            },
            purpose: {
                pulse: purposePulse,
                streak: purposeStreak,
                sentiment: purposePulse > 0 ? 'positive' : purposePulse < 0 ? 'negative' : 'neutral'
            }
        },
        scores: habitScores,
        ubziComponent: ubziComponent,
        metadata: {
            timeOfDay: period,
            dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
            conditions: resident.conditions
        }
    };
}

// Generate realistic daily pattern
function generateDailyHabitPattern(resident, date = new Date()) {
    const checkIns = [];
    
    // Morning check-in (6-9 AM)
    const morningTime = new Date(date);
    morningTime.setHours(6 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60));
    checkIns.push(generateHabitCheckIn(resident, morningTime));
    
    // Afternoon check-in (12-3 PM)
    const afternoonTime = new Date(date);
    afternoonTime.setHours(12 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60));
    checkIns.push(generateHabitCheckIn(resident, afternoonTime));
    
    // Evening check-in (6-9 PM)
    const eveningTime = new Date(date);
    eveningTime.setHours(18 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60));
    checkIns.push(generateHabitCheckIn(resident, eveningTime));
    
    return checkIns;
}

// Alert-triggering scenarios
function generateHabitAlert(resident, type) {
    const timestamp = new Date();
    const checkIn = generateHabitCheckIn(resident, timestamp);
    
    switch(type) {
        case 'low_movement_streak':
            checkIn.habits.movement.score = Math.floor(Math.random() * 20);
            checkIn.habits.movement.streak = 0;
            checkIn.alertType = 'habit_streak_low';
            checkIn.alertSeverity = 'info';
            checkIn.alertMessage = `Low movement detected for 3+ days`;
            break;
            
        case 'high_stress_streak':
            checkIn.habits.stress.level = 8 + Math.floor(Math.random() * 2);
            checkIn.habits.stress.downshiftMinutes = Math.floor(Math.random() * 5);
            checkIn.alertType = 'stress_high';
            checkIn.alertSeverity = 'warning';
            checkIn.alertMessage = `High stress levels detected for multiple days`;
            break;
            
        case 'social_isolation':
            checkIn.habits.social.interactionCount = Math.floor(Math.random() * 2);
            checkIn.habits.social.streak = 0;
            checkIn.alertType = 'social_low';
            checkIn.alertSeverity = 'info';
            checkIn.alertMessage = `Low social interaction detected`;
            break;
            
        case 'poor_nutrition_streak':
            checkIn.habits.nutrition.plantSlant = 'processed';
            checkIn.habits.nutrition.streak = 0;
            checkIn.alertType = 'nutrition_poor';
            checkIn.alertSeverity = 'info';
            checkIn.alertMessage = `Poor nutrition habits detected`;
            break;
            
        case 'low_purpose':
            checkIn.habits.purpose.pulse = -1;
            checkIn.habits.purpose.streak = 0;
            checkIn.alertType = 'purpose_low';
            checkIn.alertSeverity = 'info';
            checkIn.alertMessage = `Low sense of purpose reported`;
            break;
    }
    
    return checkIn;
}

module.exports = {
    generateHabitCheckIn,
    generateDailyHabitPattern,
    generateHabitAlert,
    initializeStreaks,
    habitPatterns,
    conditionModifiers,
    dayOfWeekPatterns
};