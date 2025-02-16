#!/bin/bash
set -e

# Get the AWS Account ID and Region
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region)

echo "Bootstrapping CDK in account: $ACCOUNT, region: $REGION"

# Bootstrap the CDK environment dynamically
npx cdk bootstrap aws://$ACCOUNT/$REGION
npx cdk deploy RoundtableAiStack