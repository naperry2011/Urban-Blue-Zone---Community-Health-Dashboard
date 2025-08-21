const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Configuration
const VITALS_TABLE = process.env.VITALS_TABLE || 'ubz-vitals';
const ALERTS_TABLE = process.env.ALERTS_TABLE || 'ubz-alerts';
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

// Alert thresholds
const THRESHOLDS = {
    bloodPressure: {
        systolic: { high: 140, critical: 180 },
        diastolic: { high: 90, critical: 120 }
    },
    heartRate: {
        low: 50,
        high: 100,
        critical_low: 40,
        critical_high: 120
    },
    temperature: {
        low: 96.5,
        high: 99.5,
        critical_low: 95,
        critical_high: 103
    },
    oxygenSaturation: {
        low: 92,
        critical: 88
    }
};

// Main handler
exports.handler = async (event) => {
    console.log('Processing vital signs:', JSON.stringify(event));
    
    try {
        // Extract data from IoT message
        const {
            residentId,
            timestamp = new Date().toISOString(),
            vitals
        } = event;
        
        // Validate required fields
        if (!residentId || !vitals) {
            throw new Error('Missing required fields: residentId or vitals');
        }
        
        // Process and store vital signs
        const vitalRecord = {
            residentId,
            timestamp,
            ...vitals,
            ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60) // 90 days TTL
        };
        
        await dynamodb.put({
            TableName: VITALS_TABLE,
            Item: vitalRecord
        }).promise();
        
        // Check for alerts
        const alerts = await checkVitalThresholds(residentId, vitals);
        
        // Store and send alerts if any
        if (alerts.length > 0) {
            await processAlerts(residentId, alerts);
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Vital signs processed successfully',
                residentId,
                alertsGenerated: alerts.length
            })
        };
        
    } catch (error) {
        console.error('Error processing vital signs:', error);
        throw error;
    }
};

// Check vital signs against thresholds
async function checkVitalThresholds(residentId, vitals) {
    const alerts = [];
    const timestamp = new Date().toISOString();
    
    // Check blood pressure
    if (vitals.bloodPressure) {
        const { systolic, diastolic } = vitals.bloodPressure;
        
        if (systolic >= THRESHOLDS.bloodPressure.systolic.critical) {
            alerts.push({
                type: 'CRITICAL_HIGH_BP',
                severity: 'critical',
                message: `Critical high blood pressure: ${systolic}/${diastolic}`,
                value: { systolic, diastolic }
            });
        } else if (systolic >= THRESHOLDS.bloodPressure.systolic.high) {
            alerts.push({
                type: 'HIGH_BP',
                severity: 'warning',
                message: `High blood pressure: ${systolic}/${diastolic}`,
                value: { systolic, diastolic }
            });
        }
        
        if (diastolic >= THRESHOLDS.bloodPressure.diastolic.critical) {
            alerts.push({
                type: 'CRITICAL_HIGH_DIASTOLIC',
                severity: 'critical',
                message: `Critical high diastolic pressure: ${diastolic}`,
                value: diastolic
            });
        }
    }
    
    // Check heart rate
    if (vitals.heartRate) {
        const hr = vitals.heartRate;
        
        if (hr <= THRESHOLDS.heartRate.critical_low || hr >= THRESHOLDS.heartRate.critical_high) {
            alerts.push({
                type: 'CRITICAL_HEART_RATE',
                severity: 'critical',
                message: `Critical heart rate: ${hr} bpm`,
                value: hr
            });
        } else if (hr < THRESHOLDS.heartRate.low || hr > THRESHOLDS.heartRate.high) {
            alerts.push({
                type: 'ABNORMAL_HEART_RATE',
                severity: 'warning',
                message: `Abnormal heart rate: ${hr} bpm`,
                value: hr
            });
        }
    }
    
    // Check temperature
    if (vitals.temperature) {
        const temp = vitals.temperature;
        
        if (temp <= THRESHOLDS.temperature.critical_low || temp >= THRESHOLDS.temperature.critical_high) {
            alerts.push({
                type: 'CRITICAL_TEMPERATURE',
                severity: 'critical',
                message: `Critical temperature: ${temp}°F`,
                value: temp
            });
        } else if (temp < THRESHOLDS.temperature.low || temp > THRESHOLDS.temperature.high) {
            alerts.push({
                type: 'ABNORMAL_TEMPERATURE',
                severity: 'warning',
                message: `Abnormal temperature: ${temp}°F`,
                value: temp
            });
        }
    }
    
    // Check oxygen saturation
    if (vitals.oxygenSaturation) {
        const o2 = vitals.oxygenSaturation;
        
        if (o2 <= THRESHOLDS.oxygenSaturation.critical) {
            alerts.push({
                type: 'CRITICAL_LOW_OXYGEN',
                severity: 'critical',
                message: `Critical low oxygen saturation: ${o2}%`,
                value: o2
            });
        } else if (o2 < THRESHOLDS.oxygenSaturation.low) {
            alerts.push({
                type: 'LOW_OXYGEN',
                severity: 'warning',
                message: `Low oxygen saturation: ${o2}%`,
                value: o2
            });
        }
    }
    
    return alerts.map(alert => ({
        ...alert,
        residentId,
        timestamp
    }));
}

// Process and send alerts
async function processAlerts(residentId, alerts) {
    const sns = new AWS.SNS();
    const timestamp = new Date().toISOString();
    
    // Store alerts in DynamoDB
    const putPromises = alerts.map(alert => {
        const alertRecord = {
            alertId: `${residentId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            residentId,
            timestamp,
            ...alert,
            status: 'active',
            ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days TTL
        };
        
        return dynamodb.put({
            TableName: ALERTS_TABLE,
            Item: alertRecord
        }).promise();
    });
    
    await Promise.all(putPromises);
    
    // Send SNS notifications for critical alerts
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    if (criticalAlerts.length > 0 && SNS_TOPIC_ARN) {
        const message = {
            residentId,
            timestamp,
            alerts: criticalAlerts,
            alertCount: criticalAlerts.length
        };
        
        await sns.publish({
            TopicArn: SNS_TOPIC_ARN,
            Message: JSON.stringify(message),
            Subject: `Critical Alert: Resident ${residentId}`,
            MessageAttributes: {
                severity: {
                    DataType: 'String',
                    StringValue: 'critical'
                },
                residentId: {
                    DataType: 'String',
                    StringValue: residentId
                }
            }
        }).promise();
    }
}