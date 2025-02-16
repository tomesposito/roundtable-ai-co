#!/bin/bash
set -e

# Get the AWS Account ID and Region
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGION="us-east-1"

echo "Bootstrapping CDK in account: $ACCOUNT, region: $REGION"

npm install aws-cdk-lib constructs
npm install --save-dev @types/node

# Bootstrap the CDK environment dynamically
npx cdk bootstrap aws://$ACCOUNT/$REGION
npx cdk deploy RoundtableAiStack