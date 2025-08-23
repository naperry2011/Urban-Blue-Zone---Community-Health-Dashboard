const awsIot = require('aws-iot-device-sdk');
const { v4: uuidv4 } = require('uuid');
const readline = require('readline');
const { 
    generateHabitCheckIn, 
    generateDailyHabitPattern, 
    generateHabitAlert 
} = require('./habits');

// Configuration
const config = {
    keyPath: process.env.IOT_KEY_PATH || './certs/private.pem.key',
    certPath: process.env.IOT_CERT_PATH || './certs/certificate.pem.crt',
    caPath: process.env.IOT_CA_PATH || './certs/AmazonRootCA1.pem',
    clientId: process.env.IOT_CLIENT_ID || `simulator-${uuidv4()}`,
    host: process.env.IOT_ENDPOINT || 'your-iot-endpoint.iot.us-east-1.amazonaws.com'
};

// Resident profiles for simulation
const residentProfiles = [
    {
        id: 'resident-001',
        type: 'senior',
        name: 'John Smith',
        age: 72,
        conditions: ['hypertension'],
        baseVitals: {
            bloodPressure: { systolic: 135, diastolic: 85 },
            heartRate: 72,
            temperature: 98.2,
            oxygenSaturation: 96
        }
    },
    {
        id: 'resident-002',
        type: 'adult',
        name: 'Mary Johnson',
        age: 45,
        conditions: ['diabetes'],
        baseVitals: {
            bloodPressure: { systolic: 120, diastolic: 80 },
            heartRate: 68,
            temperature: 98.6,
            oxygenSaturation: 98
        }
    },
    {
        id: 'resident-003',
        type: 'teen',
        name: 'Alex Chen',
        age: 16,
        conditions: [],
        baseVitals: {
            bloodPressure: { systolic: 110, diastolic: 70 },
            heartRate: 75,
            temperature: 98.4,
            oxygenSaturation: 99
        }
    },
    {
        id: 'resident-004',
        type: 'senior',
        name: 'Robert Davis',
        age: 68,
        conditions: ['copd'],
        baseVitals: {
            bloodPressure: { systolic: 125, diastolic: 82 },
            heartRate: 78,
            temperature: 98.5,
            oxygenSaturation: 94
        }
    },
    {
        id: 'resident-005',
        type: 'adult',
        name: 'Linda Wilson',
        age: 52,
        conditions: ['hypertension', 'diabetes'],
        baseVitals: {
            bloodPressure: { systolic: 138, diastolic: 88 },
            heartRate: 70,
            temperature: 98.3,
            oxygenSaturation: 97
        }
    }
];

// Initialize device
const device = awsIot.device(config);

// Connection handlers
device.on('connect', () => {
    console.log('Connected to AWS IoT Core');
    console.log('Starting simulation for', residentProfiles.length, 'residents');
    
    // Start simulation loops
    startVitalsSimulation();
    startCheckinsSimulation();
});

device.on('error', (error) => {
    console.error('Connection error:', error);
});

device.on('reconnect', () => {
    console.log('Reconnecting to AWS IoT Core...');
});

device.on('offline', () => {
    console.log('Device is offline');
});

// Generate realistic vital signs with variations
function generateVitals(resident) {
    const baseVitals = resident.baseVitals;
    const timeOfDay = new Date().getHours();
    
    // Add realistic variations based on time of day and conditions
    let systolicVariation = Math.random() * 10 - 5;
    let diastolicVariation = Math.random() * 5 - 2.5;
    let heartRateVariation = Math.random() * 10 - 5;
    let tempVariation = Math.random() * 0.4 - 0.2;
    let o2Variation = Math.random() * 2 - 1;
    
    // Morning spike for hypertension
    if (resident.conditions.includes('hypertension') && timeOfDay >= 6 && timeOfDay <= 10) {
        systolicVariation += 10;
        diastolicVariation += 5;
    }
    
    // Occasional concerning values (5% chance)
    if (Math.random() < 0.05) {
        if (resident.conditions.includes('hypertension')) {
            systolicVariation += 20; // Spike to concerning levels
        }
        if (resident.conditions.includes('copd')) {
            o2Variation -= 5; // Drop in oxygen
        }
    }
    
    return {
        bloodPressure: {
            systolic: Math.round(baseVitals.bloodPressure.systolic + systolicVariation),
            diastolic: Math.round(baseVitals.bloodPressure.diastolic + diastolicVariation)
        },
        heartRate: Math.round(baseVitals.heartRate + heartRateVariation),
        temperature: Number((baseVitals.temperature + tempVariation).toFixed(1)),
        oxygenSaturation: Math.max(88, Math.round(baseVitals.oxygenSaturation + o2Variation))
    };
}

// Generate habit check-in data
function generateCheckin(resident, habitType) {
    const data = {};
    
    switch (habitType) {
        case 'moveNaturally':
            // Generate movement data
            const baseSteps = resident.type === 'senior' ? 5000 : 8000;
            data.steps = Math.round(baseSteps + Math.random() * 4000);
            data.activeMinutes = Math.round(20 + Math.random() * 40);
            data.distance = Number((data.steps * 0.0005).toFixed(2)); // miles
            break;
            
        case 'rightTribe':
            // Generate social interaction data
            data.interactions = Math.round(Math.random() * 8);
            data.meaningfulConnections = Math.round(Math.random() * 3);
            data.communityActivities = Math.random() < 0.3 ? 1 : 0;
            break;
            
        case 'plantSlant':
            // Generate nutrition data
            data.plantBasedMeals = Math.round(Math.random() * 3);
            data.vegetableServings = Math.round(Math.random() * 7);
            data.processedFoodAvoidance = Math.round(Math.random() * 5); // 0-5 scale
            break;
            
        case 'downshift':
            // Generate stress management data
            data.stressLevel = Math.round(3 + Math.random() * 5); // 3-8 scale
            data.meditationMinutes = Math.random() < 0.6 ? Math.round(Math.random() * 30) : 0;
            data.relaxationActivities = Math.round(Math.random() * 3);
            break;
            
        case 'purpose':
            // Generate purpose/engagement data
            data.purposeRating = Math.round(5 + Math.random() * 5); // 5-10 scale
            data.volunteerHours = Math.random() < 0.3 ? Math.round(Math.random() * 4) : 0;
            data.goalProgress = Math.round(40 + Math.random() * 60); // 40-100%
            break;
    }
    
    return data;
}

// Simulate vital signs publishing
function startVitalsSimulation() {
    console.log('Starting vitals simulation...');
    
    // Send vitals for each resident at different intervals
    residentProfiles.forEach((resident, index) => {
        // Stagger start times
        setTimeout(() => {
            // Send vitals every 5-10 minutes
            const interval = 300000 + Math.random() * 300000; // 5-10 minutes
            
            const sendVitals = () => {
                const vitals = generateVitals(resident);
                const topic = `urban-blue-zone/vitals/${resident.id}`;
                const message = {
                    residentId: resident.id,
                    timestamp: new Date().toISOString(),
                    vitals: vitals
                };
                
                device.publish(topic, JSON.stringify(message), { qos: 1 }, (error) => {
                    if (error) {
                        console.error(`Error publishing vitals for ${resident.id}:`, error);
                    } else {
                        console.log(`Published vitals for ${resident.id}:`, vitals);
                    }
                });
            };
            
            sendVitals(); // Send immediately
            setInterval(sendVitals, interval); // Then repeat
            
        }, index * 2000); // Stagger by 2 seconds
    });
}

// Simulate habit check-ins
function startCheckinsSimulation() {
    console.log('Starting enhanced habit check-ins simulation...');
    
    // Send realistic habit check-ins for each resident
    residentProfiles.forEach((resident, index) => {
        // Stagger start times
        setTimeout(() => {
            // Send habit check-ins based on time of day
            const sendHabitCheckin = () => {
                const checkIn = generateHabitCheckIn(resident);
                const topic = `urban-blue-zone/checkins/${resident.id}`;
                
                device.publish(topic, JSON.stringify(checkIn), { qos: 1 }, (error) => {
                    if (error) {
                        console.error(`Error publishing habits for ${resident.id}:`, error);
                    } else {
                        const habitSummary = `Movement: ${checkIn.habits.movement.score}, ` +
                                           `Stress: ${checkIn.habits.stress.level}, ` +
                                           `Social: ${checkIn.habits.social.interactionCount}, ` +
                                           `UBZI: ${checkIn.ubziComponent}`;
                        console.log(`✓ ${resident.name} habits - ${habitSummary}`);
                    }
                });
            };
            
            // Send initial check-in
            sendHabitCheckin();
            
            // Send check-ins 3 times per day (morning, afternoon, evening)
            // Morning: 7-9 AM
            scheduleDaily(7 + Math.random() * 2, sendHabitCheckin);
            // Afternoon: 1-3 PM  
            scheduleDaily(13 + Math.random() * 2, sendHabitCheckin);
            // Evening: 6-8 PM
            scheduleDaily(18 + Math.random() * 2, sendHabitCheckin);
            
        }, index * 3000); // Stagger residents by 3 seconds
    });
}

// Helper function to schedule daily events at specific hour
function scheduleDaily(hour, callback) {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    const timeUntilFirst = scheduledTime - now;
    
    setTimeout(() => {
        callback(); // Run first time
        setInterval(callback, 24 * 60 * 60 * 1000); // Then repeat daily
    }, timeUntilFirst);
}

// Simulate alert scenarios
function simulateAlertScenario(residentId, scenario) {
    const resident = residentProfiles.find(r => r.id === residentId);
    if (!resident) {
        console.error('Resident not found:', residentId);
        return;
    }
    
    let vitals;
    switch (scenario) {
        case 'high_bp':
            vitals = {
                bloodPressure: { systolic: 165, diastolic: 105 },
                heartRate: 88,
                temperature: 98.6,
                oxygenSaturation: 96
            };
            break;
            
        case 'critical_bp':
            vitals = {
                bloodPressure: { systolic: 185, diastolic: 120 },
                heartRate: 95,
                temperature: 98.8,
                oxygenSaturation: 95
            };
            break;
            
        case 'low_oxygen':
            vitals = {
                bloodPressure: { systolic: 125, diastolic: 80 },
                heartRate: 92,
                temperature: 98.7,
                oxygenSaturation: 89
            };
            break;
            
        case 'high_temp':
            vitals = {
                bloodPressure: { systolic: 130, diastolic: 85 },
                heartRate: 102,
                temperature: 101.5,
                oxygenSaturation: 96
            };
            break;
            
        default:
            console.error('Unknown scenario:', scenario);
            return;
    }
    
    const topic = `urban-blue-zone/vitals/${residentId}`;
    const message = {
        residentId: residentId,
        timestamp: new Date().toISOString(),
        vitals: vitals
    };
    
    device.publish(topic, JSON.stringify(message), { qos: 1 }, (error) => {
        if (error) {
            console.error(`Error publishing alert scenario for ${residentId}:`, error);
        } else {
            console.log(`Published ${scenario} alert scenario for ${residentId}:`, vitals);
        }
    });
}

// Simulate habit alert scenarios
function simulateHabitAlertScenario(residentId, scenario) {
    const resident = residentProfiles.find(r => r.id === residentId);
    if (!resident) {
        console.error('Resident not found:', residentId);
        return;
    }
    
    const checkIn = generateHabitAlert(resident, scenario);
    const topic = `urban-blue-zone/checkins/${residentId}`;
    
    device.publish(topic, JSON.stringify(checkIn), { qos: 1 }, (error) => {
        if (error) {
            console.error(`Error publishing habit alert for ${residentId}:`, error);
        } else {
            console.log(`🚨 Published ${scenario} habit alert for ${resident.name}`);
            console.log(`   Alert: ${checkIn.alertMessage}`);
        }
    });
}

// CLI commands for testing
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'simulator> '
});

rl.prompt();

rl.on('line', (line) => {
    const command = line.trim();
    const parts = command.split(' ');
    
    switch (parts[0]) {
        case 'alert':
            if (parts.length >= 3) {
                simulateAlertScenario(parts[1], parts[2]);
            } else {
                console.log('Usage: alert <residentId> <scenario>');
                console.log('Vital scenarios: high_bp, critical_bp, low_oxygen, high_temp');
            }
            break;
            
        case 'habit':
            if (parts.length >= 3) {
                simulateHabitAlertScenario(parts[1], parts[2]);
            } else {
                console.log('Usage: habit <residentId> <scenario>');
                console.log('Habit scenarios: low_movement_streak, high_stress_streak, social_isolation, poor_nutrition_streak, low_purpose');
            }
            break;
            
        case 'status':
            console.log('📊 Simulator Status:');
            console.log('   Connected:', device.connected ? '✅' : '❌');
            console.log('   Residents:', residentProfiles.length);
            console.log('   Topics: vitals/{id}, checkins/{id}');
            break;
            
        case 'residents':
            console.log('👥 Active Residents:');
            residentProfiles.forEach(r => {
                console.log(`   ${r.id}: ${r.name}, ${r.age}yo ${r.type}, conditions: ${r.conditions.join(', ') || 'none'}`);
            });
            break;
            
        case 'help':
            console.log('📖 Available commands:');
            console.log('   alert <residentId> <scenario> - Trigger vital alert');
            console.log('   habit <residentId> <scenario> - Trigger habit alert');
            console.log('   status - Show simulator status');
            console.log('   residents - List all residents');
            console.log('   help - Show this help message');
            console.log('   exit - Stop simulator');
            break;
            
        case 'exit':
            console.log('Goodbye!');
            device.end();
            process.exit(0);
            break;
            
        default:
            if (command) {
                console.log('Unknown command. Type "help" for available commands.');
            }
    }
    rl.prompt();
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down simulator...');
    device.end();
    process.exit(0);
});

console.log('IoT Simulator starting...');
console.log('Type "help" for available commands');