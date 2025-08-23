const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();
const ses = new AWS.SESv2();

// Configuration
const ALERTS_TABLE = process.env.ALERTS_TABLE || 'ubz-alerts';
const DEDUP_TABLE = process.env.DEDUP_TABLE || 'ubz-alert-dedup';
const SNS_CRITICAL_TOPIC = process.env.SNS_CRITICAL_TOPIC_ARN;
const SNS_WELLNESS_TOPIC = process.env.SNS_WELLNESS_TOPIC_ARN;
const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL || 'alerts@urbanblue.zone';
const DEDUP_WINDOW_MINUTES = 10;

// Alert severity levels
const SEVERITY = {
    CRITICAL: 'critical',
    WARNING: 'warning',
    INFO: 'info'
};

// Alert types
const ALERT_TYPES = {
    VITAL_CRITICAL: 'vital_critical',
    VITAL_WARNING: 'vital_warning',
    HABIT_STREAK_LOW: 'habit_streak_low',
    STRESS_HIGH: 'stress_high',
    MOVEMENT_LOW: 'movement_low',
    SOCIAL_LOW: 'social_low',
    PURPOSE_LOW: 'purpose_low'
};

exports.handler = async (event) => {
    console.log('Processing alert event:', JSON.stringify(event));
    
    try {
        const alert = parseAlertEvent(event);
        
        // Check for duplicate alerts
        const isDuplicate = await checkDuplicateAlert(alert);
        if (isDuplicate) {
            console.log('Duplicate alert detected, skipping:', alert.alertKey);
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Duplicate alert suppressed' })
            };
        }
        
        // Store alert in DynamoDB
        await storeAlert(alert);
        
        // Record in deduplication table
        await recordAlertForDedup(alert);
        
        // Route alert based on severity
        await routeAlert(alert);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: 'Alert processed successfully',
                alertId: alert.alertId 
            })
        };
    } catch (error) {
        console.error('Error processing alert:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

function parseAlertEvent(event) {
    // Handle different event sources (direct invoke, EventBridge, DynamoDB Stream)
    let alertData;
    
    if (event.Records) {
        // DynamoDB Stream event
        alertData = parseDynamoDBEvent(event.Records[0]);
    } else if (event.detail) {
        // EventBridge event
        alertData = event.detail;
    } else {
        // Direct invocation
        alertData = event;
    }
    
    return {
        alertId: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        residentId: alertData.residentId,
        type: alertData.type,
        severity: alertData.severity || determineSeverity(alertData),
        timestamp: new Date().toISOString(),
        details: alertData.details || {},
        metrics: alertData.metrics || {},
        alertKey: `${alertData.residentId}#${alertData.type}#${alertData.severity || 'unknown'}`
    };
}

function parseDynamoDBEvent(record) {
    const image = record.dynamodb.NewImage || record.dynamodb.OldImage;
    return {
        residentId: image.resident_id?.S,
        type: image.alert_type?.S,
        severity: image.severity?.S,
        details: image.details?.M ? AWS.DynamoDB.Converter.unmarshall(image.details.M) : {},
        metrics: image.metrics?.M ? AWS.DynamoDB.Converter.unmarshall(image.metrics.M) : {}
    };
}

function determineSeverity(alertData) {
    // Determine severity based on alert type and metrics
    if (alertData.type === ALERT_TYPES.VITAL_CRITICAL) {
        return SEVERITY.CRITICAL;
    }
    
    if (alertData.type === ALERT_TYPES.VITAL_WARNING) {
        return SEVERITY.WARNING;
    }
    
    // Check vital thresholds
    if (alertData.metrics) {
        const { bloodPressure, heartRate, oxygenSaturation, temperature } = alertData.metrics;
        
        // Critical vitals
        if (bloodPressure?.systolic >= 180 || bloodPressure?.diastolic >= 120 ||
            heartRate < 40 || heartRate > 120 ||
            oxygenSaturation < 88 ||
            temperature < 95 || temperature > 103) {
            return SEVERITY.CRITICAL;
        }
        
        // Warning vitals
        if (bloodPressure?.systolic >= 140 || bloodPressure?.diastolic >= 90 ||
            heartRate < 50 || heartRate > 100 ||
            oxygenSaturation < 92 ||
            temperature < 96.5 || temperature > 99.5) {
            return SEVERITY.WARNING;
        }
    }
    
    // Habit-based alerts are typically info/warning
    if (alertData.type?.includes('habit') || alertData.type?.includes('streak')) {
        return SEVERITY.INFO;
    }
    
    return SEVERITY.INFO;
}

async function checkDuplicateAlert(alert) {
    const params = {
        TableName: DEDUP_TABLE,
        Key: {
            alert_key: alert.alertKey,
            window_start: getDeduplicationWindow()
        }
    };
    
    try {
        const result = await dynamodb.get(params).promise();
        return !!result.Item;
    } catch (error) {
        console.warn('Error checking deduplication:', error);
        // If we can't check, assume it's not a duplicate
        return false;
    }
}

async function recordAlertForDedup(alert) {
    const ttl = Math.floor(Date.now() / 1000) + (DEDUP_WINDOW_MINUTES * 60 * 2); // Keep for 2x window
    
    const params = {
        TableName: DEDUP_TABLE,
        Item: {
            alert_key: alert.alertKey,
            window_start: getDeduplicationWindow(),
            alert_id: alert.alertId,
            timestamp: alert.timestamp,
            ttl: ttl
        }
    };
    
    try {
        await dynamodb.put(params).promise();
    } catch (error) {
        console.error('Error recording alert for deduplication:', error);
        // Continue processing even if dedup recording fails
    }
}

function getDeduplicationWindow() {
    const now = new Date();
    const windowStart = new Date(Math.floor(now.getTime() / (DEDUP_WINDOW_MINUTES * 60 * 1000)) * (DEDUP_WINDOW_MINUTES * 60 * 1000));
    return windowStart.toISOString();
}

async function storeAlert(alert) {
    const ttl = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days retention
    
    const params = {
        TableName: ALERTS_TABLE,
        Item: {
            resident_id: alert.residentId,
            timestamp: alert.timestamp,
            alert_id: alert.alertId,
            type: alert.type,
            severity: alert.severity,
            details: alert.details,
            metrics: alert.metrics,
            ttl: ttl,
            status: 'active',
            created_at: alert.timestamp
        }
    };
    
    await dynamodb.put(params).promise();
}

async function routeAlert(alert) {
    const promises = [];
    
    // Critical alerts: Send both SMS and email
    if (alert.severity === SEVERITY.CRITICAL) {
        promises.push(sendSNSAlert(alert, SNS_CRITICAL_TOPIC));
        promises.push(sendEmailAlert(alert));
    }
    // Warning alerts: Email only
    else if (alert.severity === SEVERITY.WARNING) {
        promises.push(sendEmailAlert(alert));
        if (SNS_WELLNESS_TOPIC) {
            promises.push(sendSNSAlert(alert, SNS_WELLNESS_TOPIC));
        }
    }
    // Info alerts: Store only (already done)
    else {
        console.log('Info alert stored, no notification sent');
    }
    
    await Promise.all(promises);
}

async function sendSNSAlert(alert, topicArn) {
    if (!topicArn) {
        console.warn('SNS topic ARN not configured');
        return;
    }
    
    const message = formatSNSMessage(alert);
    
    const params = {
        TopicArn: topicArn,
        Subject: `[${alert.severity.toUpperCase()}] Urban Blue Zone Alert`,
        Message: message,
        MessageAttributes: {
            severity: {
                DataType: 'String',
                StringValue: alert.severity
            },
            residentId: {
                DataType: 'String',
                StringValue: alert.residentId
            },
            alertType: {
                DataType: 'String',
                StringValue: alert.type
            }
        }
    };
    
    try {
        await sns.publish(params).promise();
        console.log('SNS alert sent successfully');
    } catch (error) {
        console.error('Error sending SNS alert:', error);
        throw error;
    }
}

async function sendEmailAlert(alert) {
    if (!SES_FROM_EMAIL) {
        console.warn('SES from email not configured');
        return;
    }
    
    const { htmlBody, textBody } = formatEmailContent(alert);
    
    const params = {
        FromEmailAddress: SES_FROM_EMAIL,
        Destination: {
            ToAddresses: [await getResidentContactEmail(alert.residentId)]
        },
        Content: {
            Simple: {
                Subject: {
                    Data: `Urban Blue Zone Alert: ${alert.severity.toUpperCase()} - ${alert.type}`,
                    Charset: 'UTF-8'
                },
                Body: {
                    Html: {
                        Data: htmlBody,
                        Charset: 'UTF-8'
                    },
                    Text: {
                        Data: textBody,
                        Charset: 'UTF-8'
                    }
                }
            }
        }
    };
    
    try {
        await ses.sendEmail(params).promise();
        console.log('Email alert sent successfully');
    } catch (error) {
        console.error('Error sending email alert:', error);
        // Don't throw - email failure shouldn't break the flow
    }
}

function formatSNSMessage(alert) {
    const lines = [
        `Alert Level: ${alert.severity.toUpperCase()}`,
        `Resident: ${alert.residentId}`,
        `Type: ${alert.type.replace(/_/g, ' ').toUpperCase()}`,
        `Time: ${new Date(alert.timestamp).toLocaleString()}`,
        ''
    ];
    
    if (alert.metrics && Object.keys(alert.metrics).length > 0) {
        lines.push('Metrics:');
        Object.entries(alert.metrics).forEach(([key, value]) => {
            if (typeof value === 'object') {
                lines.push(`  ${key}: ${JSON.stringify(value)}`);
            } else {
                lines.push(`  ${key}: ${value}`);
            }
        });
    }
    
    if (alert.details && alert.details.message) {
        lines.push('', `Details: ${alert.details.message}`);
    }
    
    return lines.join('\\n');
}

function formatEmailContent(alert) {
    const alertColor = alert.severity === SEVERITY.CRITICAL ? '#FF0000' : 
                       alert.severity === SEVERITY.WARNING ? '#FFA500' : '#0066CC';
    
    const metricsHtml = alert.metrics && Object.keys(alert.metrics).length > 0 ? 
        `<h3>Current Readings:</h3><ul>${Object.entries(alert.metrics).map(([key, value]) => 
            `<li><strong>${key.replace(/_/g, ' ')}:</strong> ${typeof value === 'object' ? JSON.stringify(value) : value}</li>`
        ).join('')}</ul>` : '';
    
    const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                .alert-header { background-color: ${alertColor}; color: white; padding: 20px; }
                .alert-content { padding: 20px; background-color: #f4f4f4; }
                .metrics { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="alert-header">
                <h1>Urban Blue Zone Alert</h1>
                <h2>${alert.severity.toUpperCase()} - ${alert.type.replace(/_/g, ' ').toUpperCase()}</h2>
            </div>
            <div class="alert-content">
                <p><strong>Resident ID:</strong> ${alert.residentId}</p>
                <p><strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
                <div class="metrics">
                    ${metricsHtml}
                </div>
                ${alert.details?.message ? `<p><strong>Additional Details:</strong> ${alert.details.message}</p>` : ''}
                <p><small>Alert ID: ${alert.alertId}</small></p>
            </div>
        </body>
        </html>
    `;
    
    const textBody = [
        `Urban Blue Zone Alert`,
        `Level: ${alert.severity.toUpperCase()}`,
        `Type: ${alert.type.replace(/_/g, ' ').toUpperCase()}`,
        `Resident: ${alert.residentId}`,
        `Time: ${new Date(alert.timestamp).toLocaleString()}`,
        '',
        alert.metrics && Object.keys(alert.metrics).length > 0 ? 
            `Metrics:\\n${Object.entries(alert.metrics).map(([k, v]) => 
                `  ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('\\n')}` : '',
        alert.details?.message ? `\\nDetails: ${alert.details.message}` : '',
        `\\nAlert ID: ${alert.alertId}`
    ].filter(Boolean).join('\\n');
    
    return { htmlBody, textBody };
}

async function getResidentContactEmail(residentId) {
    // In production, fetch from residents table
    // For demo, return a default email
    try {
        const params = {
            TableName: 'ubz-residents',
            Key: { resident_id: residentId }
        };
        
        const result = await dynamodb.get(params).promise();
        return result.Item?.contact_email || 'demo@urbanblue.zone';
    } catch (error) {
        console.warn('Could not fetch resident email, using default');
        return 'demo@urbanblue.zone';
    }
}