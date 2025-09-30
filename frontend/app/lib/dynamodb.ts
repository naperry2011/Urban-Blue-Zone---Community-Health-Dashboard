import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

export const docClient = DynamoDBDocumentClient.from(client);

// Table names from environment variables
export const TABLES = {
  residents: process.env.RESIDENTS_TABLE || 'ubz-demo-residents',
  vitals: process.env.VITALS_TABLE || 'ubz-demo-vitals',
  checkins: process.env.CHECKINS_TABLE || 'ubz-demo-checkins',
  alerts: process.env.ALERTS_TABLE || 'ubz-demo-alerts',
  aggregations: process.env.AGGREGATIONS_TABLE || 'ubz-demo-aggregations',
};

// Helper to scan residents table
export async function scanResidents() {
  const command = new ScanCommand({
    TableName: TABLES.residents,
  });

  const response = await docClient.send(command);
  return response.Items || [];
}

// Helper to get resident by ID
export async function getResident(residentId: string) {
  const command = new GetCommand({
    TableName: TABLES.residents,
    Key: { resident_id: residentId },
  });

  const response = await docClient.send(command);
  return response.Item;
}

// Helper to get aggregations for a resident
export async function getResidentAggregations(residentId: string) {
  const today = new Date().toISOString().split('T')[0];
  const command = new GetCommand({
    TableName: TABLES.aggregations,
    Key: {
      agg_key: `resident#${residentId}#${today}`,
      metric: 'ubzi',
    },
  });

  const response = await docClient.send(command);
  return response.Item;
}

// Helper to scan alerts
export async function scanAlerts() {
  const command = new ScanCommand({
    TableName: TABLES.alerts,
  });

  const response = await docClient.send(command);
  return response.Items || [];
}

// Helper to get alerts for a resident
export async function getResidentAlerts(residentId: string) {
  const command = new ScanCommand({
    TableName: TABLES.alerts,
    FilterExpression: 'resident_id = :rid',
    ExpressionAttributeValues: {
      ':rid': residentId,
    },
  });

  const response = await docClient.send(command);
  return response.Items || [];
}
