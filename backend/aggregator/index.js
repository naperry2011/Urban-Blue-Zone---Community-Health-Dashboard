const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const cloudwatch = new AWS.CloudWatch();

// Table names from environment variables
const VITALS_TABLE = process.env.VITALS_TABLE || 'ubz-vitals';
const CHECKINS_TABLE = process.env.CHECKINS_TABLE || 'ubz-checkins';
const AGGREGATIONS_TABLE = process.env.AGGREGATIONS_TABLE || 'ubz-aggregations';
const RESIDENTS_TABLE = process.env.RESIDENTS_TABLE || 'ubz-residents';

// Cohort definitions
const COHORTS = {
  senior: { minAge: 65, maxAge: 120 },
  adult: { minAge: 25, maxAge: 64 },
  teen: { minAge: 13, maxAge: 24 },
  chronic: { condition: 'chronic' }
};

// Blue Zone habit weights for UBZI calculation
const HABIT_WEIGHTS = {
  moveNaturally: 0.20,
  purposeInLife: 0.15,
  downshift: 0.15,
  eightyRule: 0.15,
  plantSlant: 0.15,
  wine: 0.05,
  belongCommunity: 0.10,
  lovedOnesFirst: 0.05
};

exports.handler = async (event) => {
  console.log('Aggregator Lambda triggered:', JSON.stringify(event));
  
  try {
    const aggregationType = event.aggregationType || determineAggregationType(event);
    const timestamp = new Date().toISOString();
    
    switch (aggregationType) {
      case 'hourly':
        await performHourlyAggregation(timestamp);
        break;
      case 'daily':
        await performDailyAggregation(timestamp);
        break;
      case 'on-demand':
        await performOnDemandAggregation(event.residentId, timestamp);
        break;
      default:
        throw new Error(`Unknown aggregation type: ${aggregationType}`);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `${aggregationType} aggregation completed successfully`,
        timestamp
      })
    };
  } catch (error) {
    console.error('Aggregation error:', error);
    
    // Publish error metric to CloudWatch
    await publishMetric('AggregationErrors', 1, 'Count');
    
    throw error;
  }
};

function determineAggregationType(event) {
  // EventBridge scheduled events have a detail-type field
  if (event['detail-type']) {
    if (event['detail-type'].includes('hourly')) return 'hourly';
    if (event['detail-type'].includes('daily')) return 'daily';
  }
  
  // Direct Lambda invocation
  if (event.residentId) return 'on-demand';
  
  return 'hourly'; // Default
}

async function performHourlyAggregation(timestamp) {
  console.log('Starting hourly aggregation at:', timestamp);
  
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  // Get all residents
  const residents = await getAllResidents();
  
  // Process each resident
  const aggregationPromises = residents.map(async (resident) => {
    try {
      // Get recent vitals
      const vitals = await getRecentData(VITALS_TABLE, resident.residentId, oneHourAgo);
      
      // Get recent check-ins
      const checkins = await getRecentData(CHECKINS_TABLE, resident.residentId, oneHourAgo);
      
      // Calculate aggregated metrics
      const metrics = calculateHourlyMetrics(vitals, checkins, resident);
      
      // Store aggregation
      await storeAggregation({
        ...metrics,
        residentId: resident.residentId,
        aggregationType: 'hourly',
        timestamp,
        period: {
          start: oneHourAgo,
          end: timestamp
        }
      });
      
      // Publish individual metrics to CloudWatch
      await publishResidentMetrics(resident.residentId, metrics);
      
      return metrics;
    } catch (error) {
      console.error(`Error aggregating for resident ${resident.residentId}:`, error);
      return null;
    }
  });
  
  const results = await Promise.all(aggregationPromises);
  
  // Calculate and store cohort aggregations
  await calculateCohortAggregations(residents, results, 'hourly', timestamp);
  
  // Publish success metric
  await publishMetric('HourlyAggregations', 1, 'Count');
  
  console.log(`Hourly aggregation completed for ${results.filter(r => r !== null).length} residents`);
}

async function performDailyAggregation(timestamp) {
  console.log('Starting daily aggregation at:', timestamp);
  
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  // Get all residents
  const residents = await getAllResidents();
  
  // Process each resident
  const aggregationPromises = residents.map(async (resident) => {
    try {
      // Get all data from past 24 hours
      const vitals = await getRecentData(VITALS_TABLE, resident.residentId, oneDayAgo);
      const checkins = await getRecentData(CHECKINS_TABLE, resident.residentId, oneDayAgo);
      
      // Get hourly aggregations for rollup
      const hourlyAggregations = await getHourlyAggregations(resident.residentId, oneDayAgo);
      
      // Calculate comprehensive daily metrics
      const metrics = calculateDailyMetrics(vitals, checkins, hourlyAggregations, resident);
      
      // Store daily aggregation
      await storeAggregation({
        ...metrics,
        residentId: resident.residentId,
        aggregationType: 'daily',
        timestamp,
        period: {
          start: oneDayAgo,
          end: timestamp
        }
      });
      
      // Publish daily summary metrics
      await publishResidentMetrics(resident.residentId, metrics, 'Daily');
      
      return metrics;
    } catch (error) {
      console.error(`Error in daily aggregation for resident ${resident.residentId}:`, error);
      return null;
    }
  });
  
  const results = await Promise.all(aggregationPromises);
  
  // Calculate and store cohort aggregations
  await calculateCohortAggregations(residents, results, 'daily', timestamp);
  
  // Publish success metric
  await publishMetric('DailyAggregations', 1, 'Count');
  
  console.log(`Daily aggregation completed for ${results.filter(r => r !== null).length} residents`);
}

async function performOnDemandAggregation(residentId, timestamp) {
  console.log(`On-demand aggregation for resident ${residentId}`);
  
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  // Get resident details
  const resident = await getResident(residentId);
  
  // Get recent data
  const vitals = await getRecentData(VITALS_TABLE, residentId, oneHourAgo);
  const checkins = await getRecentData(CHECKINS_TABLE, residentId, oneHourAgo);
  
  // Calculate metrics
  const metrics = calculateHourlyMetrics(vitals, checkins, resident);
  
  // Store aggregation
  await storeAggregation({
    ...metrics,
    residentId,
    aggregationType: 'on-demand',
    timestamp,
    period: {
      start: oneHourAgo,
      end: timestamp
    }
  });
  
  // Publish metrics
  await publishResidentMetrics(residentId, metrics, 'OnDemand');
  
  return metrics;
}

function calculateHourlyMetrics(vitals, checkins, resident) {
  const metrics = {
    vitalStats: calculateVitalStatistics(vitals),
    habitScores: calculateHabitScores(checkins),
    ubzi: 0,
    alertCount: 0,
    dataQuality: 0
  };
  
  // Calculate UBZI
  metrics.ubzi = calculateUBZI(metrics.vitalStats, metrics.habitScores);
  
  // Count alerts (vitals outside normal range)
  metrics.alertCount = countAlerts(vitals);
  
  // Calculate data quality (completeness)
  metrics.dataQuality = calculateDataQuality(vitals, checkins);
  
  return metrics;
}

function calculateDailyMetrics(vitals, checkins, hourlyAggregations, resident) {
  const metrics = {
    vitalStats: calculateVitalStatistics(vitals),
    habitScores: calculateHabitScores(checkins),
    ubzi: 0,
    ubziTrend: 0,
    alertCount: 0,
    dataQuality: 0,
    hourlyBreakdown: summarizeHourlyData(hourlyAggregations)
  };
  
  // Calculate average UBZI for the day
  metrics.ubzi = calculateUBZI(metrics.vitalStats, metrics.habitScores);
  
  // Calculate UBZI trend (change from previous day)
  metrics.ubziTrend = calculateUBZITrend(hourlyAggregations);
  
  // Total alerts for the day
  metrics.alertCount = countAlerts(vitals);
  
  // Overall data quality
  metrics.dataQuality = calculateDataQuality(vitals, checkins);
  
  // Add daily insights
  metrics.insights = generateDailyInsights(metrics, resident);
  
  return metrics;
}

function calculateVitalStatistics(vitals) {
  if (!vitals || vitals.length === 0) {
    return {
      heartRate: { avg: 0, min: 0, max: 0 },
      bloodPressure: { systolic: { avg: 0, min: 0, max: 0 }, diastolic: { avg: 0, min: 0, max: 0 } },
      temperature: { avg: 0, min: 0, max: 0 },
      oxygenSaturation: { avg: 0, min: 0, max: 0 }
    };
  }
  
  const stats = {
    heartRate: { values: [], avg: 0, min: 0, max: 0 },
    bloodPressure: { 
      systolic: { values: [], avg: 0, min: 0, max: 0 }, 
      diastolic: { values: [], avg: 0, min: 0, max: 0 } 
    },
    temperature: { values: [], avg: 0, min: 0, max: 0 },
    oxygenSaturation: { values: [], avg: 0, min: 0, max: 0 }
  };
  
  // Collect values
  vitals.forEach(vital => {
    if (vital.heartRate) stats.heartRate.values.push(vital.heartRate);
    if (vital.bloodPressure) {
      stats.bloodPressure.systolic.values.push(vital.bloodPressure.systolic);
      stats.bloodPressure.diastolic.values.push(vital.bloodPressure.diastolic);
    }
    if (vital.temperature) stats.temperature.values.push(vital.temperature);
    if (vital.oxygenSaturation) stats.oxygenSaturation.values.push(vital.oxygenSaturation);
  });
  
  // Calculate statistics
  const calculateStats = (values) => {
    if (values.length === 0) return { avg: 0, min: 0, max: 0 };
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return {
      avg: Math.round(avg * 10) / 10,
      min: Math.min(...values),
      max: Math.max(...values)
    };
  };
  
  stats.heartRate = { ...stats.heartRate, ...calculateStats(stats.heartRate.values) };
  stats.bloodPressure.systolic = { ...stats.bloodPressure.systolic, ...calculateStats(stats.bloodPressure.systolic.values) };
  stats.bloodPressure.diastolic = { ...stats.bloodPressure.diastolic, ...calculateStats(stats.bloodPressure.diastolic.values) };
  stats.temperature = { ...stats.temperature, ...calculateStats(stats.temperature.values) };
  stats.oxygenSaturation = { ...stats.oxygenSaturation, ...calculateStats(stats.oxygenSaturation.values) };
  
  // Remove values arrays before returning
  delete stats.heartRate.values;
  delete stats.bloodPressure.systolic.values;
  delete stats.bloodPressure.diastolic.values;
  delete stats.temperature.values;
  delete stats.oxygenSaturation.values;
  
  return stats;
}

function calculateHabitScores(checkins) {
  if (!checkins || checkins.length === 0) {
    return Object.keys(HABIT_WEIGHTS).reduce((acc, habit) => {
      acc[habit] = 0;
      return acc;
    }, {});
  }
  
  const habitScores = {};
  const habitCounts = {};
  
  // Initialize
  Object.keys(HABIT_WEIGHTS).forEach(habit => {
    habitScores[habit] = 0;
    habitCounts[habit] = 0;
  });
  
  // Aggregate scores
  checkins.forEach(checkin => {
    if (checkin.habits) {
      Object.keys(checkin.habits).forEach(habit => {
        if (habitScores.hasOwnProperty(habit)) {
          habitScores[habit] += checkin.habits[habit].score || 0;
          habitCounts[habit]++;
        }
      });
    }
  });
  
  // Calculate averages
  Object.keys(habitScores).forEach(habit => {
    if (habitCounts[habit] > 0) {
      habitScores[habit] = Math.round((habitScores[habit] / habitCounts[habit]) * 100) / 100;
    }
  });
  
  return habitScores;
}

function calculateUBZI(vitalStats, habitScores) {
  let ubzi = 50; // Base score
  
  // Vital signs contribution (40% of score)
  const vitalScore = calculateVitalScore(vitalStats);
  ubzi += vitalScore * 0.4;
  
  // Habit scores contribution (60% of score)
  let habitTotal = 0;
  Object.keys(HABIT_WEIGHTS).forEach(habit => {
    habitTotal += (habitScores[habit] || 0) * HABIT_WEIGHTS[habit];
  });
  ubzi += habitTotal * 0.6;
  
  // Ensure UBZI is between 0 and 100
  return Math.max(0, Math.min(100, Math.round(ubzi)));
}

function calculateVitalScore(vitalStats) {
  let score = 50; // Base vital score
  
  // Heart rate scoring
  if (vitalStats.heartRate.avg >= 60 && vitalStats.heartRate.avg <= 100) {
    score += 12.5;
  } else if (vitalStats.heartRate.avg >= 50 && vitalStats.heartRate.avg <= 110) {
    score += 6;
  }
  
  // Blood pressure scoring
  if (vitalStats.bloodPressure.systolic.avg < 120 && vitalStats.bloodPressure.diastolic.avg < 80) {
    score += 12.5;
  } else if (vitalStats.bloodPressure.systolic.avg < 130 && vitalStats.bloodPressure.diastolic.avg < 85) {
    score += 6;
  }
  
  // Temperature scoring
  if (vitalStats.temperature.avg >= 97.8 && vitalStats.temperature.avg <= 99.1) {
    score += 12.5;
  } else if (vitalStats.temperature.avg >= 97 && vitalStats.temperature.avg <= 100) {
    score += 6;
  }
  
  // Oxygen saturation scoring
  if (vitalStats.oxygenSaturation.avg >= 95) {
    score += 12.5;
  } else if (vitalStats.oxygenSaturation.avg >= 92) {
    score += 6;
  }
  
  return score;
}

function countAlerts(vitals) {
  if (!vitals || vitals.length === 0) return 0;
  
  let alertCount = 0;
  
  vitals.forEach(vital => {
    // Check for critical values
    if (vital.heartRate && (vital.heartRate < 50 || vital.heartRate > 120)) alertCount++;
    if (vital.bloodPressure) {
      if (vital.bloodPressure.systolic >= 140 || vital.bloodPressure.diastolic >= 90) alertCount++;
    }
    if (vital.temperature && (vital.temperature < 97 || vital.temperature > 100)) alertCount++;
    if (vital.oxygenSaturation && vital.oxygenSaturation < 92) alertCount++;
  });
  
  return alertCount;
}

function calculateDataQuality(vitals, checkins) {
  const expectedHourlyVitals = 12; // Every 5 minutes
  const expectedHourlyCheckins = 2; // Every 30 minutes
  
  const vitalCompleteness = Math.min(100, (vitals.length / expectedHourlyVitals) * 100);
  const checkinCompleteness = Math.min(100, (checkins.length / expectedHourlyCheckins) * 100);
  
  return Math.round((vitalCompleteness * 0.6 + checkinCompleteness * 0.4));
}

function calculateUBZITrend(hourlyAggregations) {
  if (!hourlyAggregations || hourlyAggregations.length < 2) return 0;
  
  // Sort by timestamp
  const sorted = hourlyAggregations.sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );
  
  // Calculate average UBZI for first half vs second half
  const midPoint = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, midPoint);
  const secondHalf = sorted.slice(midPoint);
  
  const avgFirst = firstHalf.reduce((sum, agg) => sum + (agg.ubzi || 0), 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((sum, agg) => sum + (agg.ubzi || 0), 0) / secondHalf.length;
  
  return Math.round((avgSecond - avgFirst) * 10) / 10;
}

function summarizeHourlyData(hourlyAggregations) {
  if (!hourlyAggregations || hourlyAggregations.length === 0) {
    return { hours: 0, avgUBZI: 0, minUBZI: 0, maxUBZI: 0 };
  }
  
  const ubziValues = hourlyAggregations.map(agg => agg.ubzi || 0);
  
  return {
    hours: hourlyAggregations.length,
    avgUBZI: Math.round(ubziValues.reduce((a, b) => a + b, 0) / ubziValues.length),
    minUBZI: Math.min(...ubziValues),
    maxUBZI: Math.max(...ubziValues)
  };
}

function generateDailyInsights(metrics, resident) {
  const insights = [];
  
  // UBZI trend insight
  if (metrics.ubziTrend > 5) {
    insights.push('Significant improvement in overall wellness score');
  } else if (metrics.ubziTrend < -5) {
    insights.push('Wellness score declining - may need intervention');
  }
  
  // Alert insight
  if (metrics.alertCount > 10) {
    insights.push('High alert frequency - consider medical review');
  } else if (metrics.alertCount === 0) {
    insights.push('No health alerts today - vitals stable');
  }
  
  // Data quality insight
  if (metrics.dataQuality < 50) {
    insights.push('Low data quality - check device connectivity');
  } else if (metrics.dataQuality > 90) {
    insights.push('Excellent data collection rate');
  }
  
  // Habit-specific insights
  const topHabit = Object.entries(metrics.habitScores)
    .sort((a, b) => b[1] - a[1])[0];
  if (topHabit && topHabit[1] > 80) {
    insights.push(`Strong performance in ${topHabit[0]}`);
  }
  
  return insights;
}

async function calculateCohortAggregations(residents, individualResults, aggregationType, timestamp) {
  const cohortData = {};
  
  // Initialize cohort data
  Object.keys(COHORTS).forEach(cohort => {
    cohortData[cohort] = {
      residents: [],
      metrics: {
        avgUBZI: 0,
        minUBZI: 100,
        maxUBZI: 0,
        totalAlerts: 0,
        avgDataQuality: 0
      }
    };
  });
  
  // Assign residents to cohorts
  residents.forEach((resident, index) => {
    const result = individualResults[index];
    if (!result) return;
    
    // Determine cohort membership
    const age = calculateAge(resident.dateOfBirth);
    
    if (age >= COHORTS.senior.minAge) {
      cohortData.senior.residents.push({ resident, metrics: result });
    } else if (age >= COHORTS.adult.minAge) {
      cohortData.adult.residents.push({ resident, metrics: result });
    } else if (age >= COHORTS.teen.minAge) {
      cohortData.teen.residents.push({ resident, metrics: result });
    }
    
    // Check for chronic conditions
    if (resident.chronicConditions && resident.chronicConditions.length > 0) {
      cohortData.chronic.residents.push({ resident, metrics: result });
    }
  });
  
  // Calculate cohort metrics
  for (const [cohortName, cohort] of Object.entries(cohortData)) {
    if (cohort.residents.length === 0) continue;
    
    const ubziValues = cohort.residents.map(r => r.metrics.ubzi);
    const alertCounts = cohort.residents.map(r => r.metrics.alertCount);
    const dataQualities = cohort.residents.map(r => r.metrics.dataQuality);
    
    cohort.metrics.avgUBZI = Math.round(
      ubziValues.reduce((a, b) => a + b, 0) / ubziValues.length
    );
    cohort.metrics.minUBZI = Math.min(...ubziValues);
    cohort.metrics.maxUBZI = Math.max(...ubziValues);
    cohort.metrics.totalAlerts = alertCounts.reduce((a, b) => a + b, 0);
    cohort.metrics.avgDataQuality = Math.round(
      dataQualities.reduce((a, b) => a + b, 0) / dataQualities.length
    );
    
    // Store cohort aggregation
    await storeAggregation({
      cohortId: cohortName,
      aggregationType: `cohort-${aggregationType}`,
      timestamp,
      residentCount: cohort.residents.length,
      ...cohort.metrics
    });
    
    // Publish cohort metrics to CloudWatch
    await publishCohortMetrics(cohortName, cohort.metrics);
  }
  
  return cohortData;
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return 30; // Default age if not provided
  
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Database operations
async function getAllResidents() {
  try {
    const params = {
      TableName: RESIDENTS_TABLE
    };
    
    const result = await dynamodb.scan(params).promise();
    return result.Items || [];
  } catch (error) {
    console.error('Error fetching residents:', error);
    return [];
  }
}

async function getResident(residentId) {
  try {
    const params = {
      TableName: RESIDENTS_TABLE,
      Key: { residentId }
    };
    
    const result = await dynamodb.get(params).promise();
    return result.Item;
  } catch (error) {
    console.error(`Error fetching resident ${residentId}:`, error);
    return null;
  }
}

async function getRecentData(tableName, residentId, since) {
  try {
    const params = {
      TableName: tableName,
      KeyConditionExpression: 'residentId = :residentId AND #ts >= :since',
      ExpressionAttributeNames: {
        '#ts': 'timestamp'
      },
      ExpressionAttributeValues: {
        ':residentId': residentId,
        ':since': since
      }
    };
    
    const result = await dynamodb.query(params).promise();
    return result.Items || [];
  } catch (error) {
    console.error(`Error fetching recent data from ${tableName}:`, error);
    return [];
  }
}

async function getHourlyAggregations(residentId, since) {
  try {
    const params = {
      TableName: AGGREGATIONS_TABLE,
      KeyConditionExpression: 'residentId = :residentId AND #ts >= :since',
      FilterExpression: 'aggregationType = :type',
      ExpressionAttributeNames: {
        '#ts': 'timestamp'
      },
      ExpressionAttributeValues: {
        ':residentId': residentId,
        ':since': since,
        ':type': 'hourly'
      }
    };
    
    const result = await dynamodb.query(params).promise();
    return result.Items || [];
  } catch (error) {
    console.error(`Error fetching hourly aggregations:`, error);
    return [];
  }
}

async function storeAggregation(aggregation) {
  try {
    const params = {
      TableName: AGGREGATIONS_TABLE,
      Item: {
        ...aggregation,
        id: aggregation.residentId || aggregation.cohortId,
        ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days TTL
      }
    };
    
    await dynamodb.put(params).promise();
  } catch (error) {
    console.error('Error storing aggregation:', error);
    throw error;
  }
}

// CloudWatch operations
async function publishMetric(metricName, value, unit = 'None') {
  try {
    const params = {
      Namespace: 'UrbanBlueZone',
      MetricData: [
        {
          MetricName: metricName,
          Value: value,
          Unit: unit,
          Timestamp: new Date()
        }
      ]
    };
    
    await cloudwatch.putMetricData(params).promise();
  } catch (error) {
    console.error(`Error publishing metric ${metricName}:`, error);
  }
}

async function publishResidentMetrics(residentId, metrics, prefix = '') {
  const namespace = 'UrbanBlueZone/Residents';
  const timestamp = new Date();
  
  const metricData = [
    {
      MetricName: `${prefix}UBZI`,
      Value: metrics.ubzi,
      Unit: 'None',
      Dimensions: [{ Name: 'ResidentId', Value: residentId }],
      Timestamp: timestamp
    },
    {
      MetricName: `${prefix}AlertCount`,
      Value: metrics.alertCount,
      Unit: 'Count',
      Dimensions: [{ Name: 'ResidentId', Value: residentId }],
      Timestamp: timestamp
    },
    {
      MetricName: `${prefix}DataQuality`,
      Value: metrics.dataQuality,
      Unit: 'Percent',
      Dimensions: [{ Name: 'ResidentId', Value: residentId }],
      Timestamp: timestamp
    }
  ];
  
  try {
    await cloudwatch.putMetricData({
      Namespace: namespace,
      MetricData: metricData
    }).promise();
  } catch (error) {
    console.error(`Error publishing resident metrics for ${residentId}:`, error);
  }
}

async function publishCohortMetrics(cohortName, metrics) {
  const namespace = 'UrbanBlueZone/Cohorts';
  const timestamp = new Date();
  
  const metricData = [
    {
      MetricName: 'AverageUBZI',
      Value: metrics.avgUBZI,
      Unit: 'None',
      Dimensions: [{ Name: 'Cohort', Value: cohortName }],
      Timestamp: timestamp
    },
    {
      MetricName: 'TotalAlerts',
      Value: metrics.totalAlerts,
      Unit: 'Count',
      Dimensions: [{ Name: 'Cohort', Value: cohortName }],
      Timestamp: timestamp
    },
    {
      MetricName: 'DataQuality',
      Value: metrics.avgDataQuality,
      Unit: 'Percent',
      Dimensions: [{ Name: 'Cohort', Value: cohortName }],
      Timestamp: timestamp
    }
  ];
  
  try {
    await cloudwatch.putMetricData({
      Namespace: namespace,
      MetricData: metricData
    }).promise();
  } catch (error) {
    console.error(`Error publishing cohort metrics for ${cohortName}:`, error);
  }
}

module.exports = {
  handler: exports.handler,
  calculateUBZI,
  calculateVitalStatistics,
  calculateHabitScores
};