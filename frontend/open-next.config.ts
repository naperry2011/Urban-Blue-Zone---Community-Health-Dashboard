// OpenNext Configuration for Urban Blue Zone
// Type definitions are inline since open-next types may not be available at build time

interface OpenNextConfig {
  buildCommand: string;
  outputDirectory: string;
  appPath: string;
  packageJsonPath: string;
  default?: any;
  middleware?: any;
  imageOptimization?: any;
  revalidate?: any;
  cloudfront?: any;
  splitting?: any;
  env?: any;
  dangerous?: any;
}

const config: OpenNextConfig = {
  buildCommand: 'npm run build',
  outputDirectory: '.open-next',
  appPath: '.',
  packageJsonPath: './package.json',

  // Server function configuration
  default: {
    override: {
      wrapper: 'aws-lambda-streaming',
      converter: 'aws-apigw-v2',
    },
    minify: true,
    sourcemap: false,
  },

  // Edge runtime configuration for middleware
  middleware: {
    external: ['next'],
    minify: true,
  },

  // Image optimization function
  imageOptimization: {
    arch: 'x64',
    format: 'image',
  },

  // Incremental Static Regeneration
  revalidate: {
    external: ['@aws-sdk/client-sqs'],
    override: {
      wrapper: 'sqs-revalidate',
    },
  },

  // CloudFront configuration
  cloudfront: {
    origins: {
      default: {
        protocol: 'https',
        domainName: process.env.API_GATEWAY_URL || '',
        originPath: '',
        customHeaders: {
          'X-Forwarded-Host': [
            {
              key: 'X-Forwarded-Host',
              value: process.env.DOMAIN_NAME || '',
            },
          ],
        },
      },
      s3: {
        protocol: 's3',
        domainName: process.env.S3_BUCKET || '',
        originPath: '/_next/static',
      },
    },
    behaviors: {
      // Static assets
      '/_next/static/*': {
        origin: 's3',
        cacheBehavior: {
          defaultTTL: 86400,
          maxTTL: 31536000,
          minTTL: 0,
          compress: true,
          viewerProtocolPolicy: 'redirect-to-https',
        },
      },
      // Public assets
      '/public/*': {
        origin: 's3',
        cacheBehavior: {
          defaultTTL: 86400,
          maxTTL: 31536000,
          minTTL: 0,
          compress: true,
          viewerProtocolPolicy: 'redirect-to-https',
        },
      },
      // API routes
      '/api/*': {
        origin: 'default',
        cacheBehavior: {
          defaultTTL: 0,
          maxTTL: 0,
          minTTL: 0,
          allowedMethods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'PATCH', 'DELETE'],
          viewerProtocolPolicy: 'redirect-to-https',
        },
      },
      // ISR pages with 15 second revalidation
      '/dashboard': {
        origin: 'default',
        cacheBehavior: {
          defaultTTL: 15,
          maxTTL: 15,
          minTTL: 0,
          compress: true,
          viewerProtocolPolicy: 'redirect-to-https',
        },
      },
      '/cohorts': {
        origin: 'default',
        cacheBehavior: {
          defaultTTL: 15,
          maxTTL: 15,
          minTTL: 0,
          compress: true,
          viewerProtocolPolicy: 'redirect-to-https',
        },
      },
      // Default behavior
      '/*': {
        origin: 'default',
        cacheBehavior: {
          defaultTTL: 0,
          maxTTL: 31536000,
          minTTL: 0,
          compress: true,
          viewerProtocolPolicy: 'redirect-to-https',
        },
      },
    },
  },

  // Function splitting for optimal performance
  splitting: {
    // API routes in separate function
    api: {
      routes: ['/api/*'],
      memory: 512,
      timeout: 30,
    },
    // Dashboard pages with higher memory
    dashboard: {
      routes: ['/dashboard', '/cohorts', '/residents/*'],
      memory: 1024,
      timeout: 30,
    },
  },

  // Environment variables to include
  env: {
    // AWS
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    AWS_ACCOUNT_ID: process.env.AWS_ACCOUNT_ID || '',

    // Cognito
    NEXT_PUBLIC_COGNITO_REGION: process.env.NEXT_PUBLIC_COGNITO_REGION || 'us-east-1',
    NEXT_PUBLIC_COGNITO_USER_POOL_ID: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
    NEXT_PUBLIC_COGNITO_CLIENT_ID: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
    NEXT_PUBLIC_COGNITO_DOMAIN: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || '',

    // API
    NEXT_PUBLIC_API_GATEWAY_URL: process.env.NEXT_PUBLIC_API_GATEWAY_URL || '',

    // IoT
    IOT_ENDPOINT: process.env.IOT_ENDPOINT || '',
    IOT_TOPIC_PREFIX: process.env.IOT_TOPIC_PREFIX || 'urban-blue-zone',

    // DynamoDB Tables
    DYNAMODB_REGION: process.env.DYNAMODB_REGION || 'us-east-1',
    RESIDENTS_TABLE: process.env.RESIDENTS_TABLE || 'ubz-residents',
    VITALS_TABLE: process.env.VITALS_TABLE || 'ubz-vitals',
    CHECKINS_TABLE: process.env.CHECKINS_TABLE || 'ubz-checkins',
    ALERTS_TABLE: process.env.ALERTS_TABLE || 'ubz-alerts',
    AGGREGATIONS_TABLE: process.env.AGGREGATIONS_TABLE || 'ubz-aggregations',

    // Notifications
    SNS_TOPIC_ARN: process.env.SNS_TOPIC_ARN || '',
    SES_FROM_EMAIL: process.env.SES_FROM_EMAIL || '',

    // Next.js
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // Dangerous options (use with caution)
  dangerous: {
    disableIncrementalCache: false,
    disableTagCache: false,
  },
}

export default config