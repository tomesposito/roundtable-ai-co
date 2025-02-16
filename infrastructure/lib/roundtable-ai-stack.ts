import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class RoundtableAiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
      },
      ...props,
    });

    // S3 Bucket for static assets (with website hosting)
    // For production, we set the removal policy to RETAIN and disable auto deletion
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

    // Retrieve the existing hosted zone for roundtableai.co
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: 'Z075639611LJGP0PFNECZ',
      zoneName: 'roundtableai.co',
    });

    // Request an SSL certificate for the domain using ACM
    const certificate = new certificatemanager.Certificate(this, 'SiteCertificate', {
      domainName: 'roundtableai.co',
      validation: certificatemanager.CertificateValidation.fromDns(hostedZone),
    });

    // Create a log bucket for CloudFront logs (production use: do not auto-delete)
    const logBucket = new s3.Bucket(this, 'LogBucket', {
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

    // CloudFront distribution for the S3 bucket with logging enabled
    const distribution = new cloudfront.Distribution(this, 'WebsiteDistribution', {
      defaultBehavior: { origin: new origins.S3Origin(websiteBucket) },
      domainNames: ['roundtableai.co'],
      certificate,
      logBucket: logBucket,
      logFilePrefix: 'cf-logs/',
    });

    // Create a Route 53 A record pointing to the CloudFront distribution
    new route53.ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      recordName: 'roundtableai.co',
    });

    // Create a Cognito User Pool for authentication (set to RETAIN for production)
    const userPool = new cognito.UserPool(this, 'UserPool', {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      userVerification: {
        emailSubject: 'Verify your email for Roundtable AI!',
        emailBody: 'Hello, thanks for signing up to Roundtable AI! Your verification code is {####}',
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Create a Cognito User Pool Client with Hosted UI configuration
    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
      generateSecret: false,
      oAuth: {
        flows: { authorizationCodeGrant: true },
        callbackUrls: ['https://roundtableai.co/callback'],
        logoutUrls: ['https://roundtableai.co'],
      },
    });

    // DynamoDB Table for user profiles (set to RETAIN in production)
    const profileTable = new dynamodb.Table(this, 'ProfileTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // DynamoDB Table for GPT configurations
    const gptConfigTable = new dynamodb.Table(this, 'GptConfigTable', {
      partitionKey: { name: 'configId', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // DynamoDB Table for Roundtables (groupings of GPT configurations)
    const roundtableTable = new dynamodb.Table(this, 'RoundtableTable', {
      partitionKey: { name: 'roundtableId', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // DynamoDB Table for Chat Sessions (logging chat history)
    const chatSessionTable = new dynamodb.Table(this, 'ChatSessionTable', {
      partitionKey: { name: 'sessionId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Lambda Function for handling Chat Session Logging
    const chatSessionHandler = new lambda.Function(this, 'ChatSessionHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'chatSessionHandler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda')),
      environment: {
        CHAT_SESSION_TABLE: chatSessionTable.tableName,
      },
    });
    chatSessionTable.grantReadWriteData(chatSessionHandler);

    // Lambda Function for handling GPT Configuration CRUD operations
    const gptConfigHandler = new lambda.Function(this, 'GptConfigHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'gptConfigHandler.handler', // Expects the handler in lambda/gptConfigHandler.js
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda')),
      environment: {
        GPT_CONFIG_TABLE: gptConfigTable.tableName,
      },
    });
    gptConfigTable.grantReadWriteData(gptConfigHandler);

    // Lambda Function for handling Roundtable CRUD operations
    const roundtableHandler = new lambda.Function(this, 'RoundtableHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'roundtableHandler.handler', // Expects the handler in lambda/roundtableHandler.js
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda')),
      environment: {
        ROUND_TABLE_TABLE: roundtableTable.tableName,
      },
    });
    roundtableTable.grantReadWriteData(roundtableHandler);

    // Outputs for reference
    new cdk.CfnOutput(this, 'WebsiteBucketName', { value: websiteBucket.bucketName });
    new cdk.CfnOutput(this, 'CloudFrontDistributionId', { value: distribution.distributionId });
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });
  }
}