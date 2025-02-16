#!/bin/bash
set -e

# Clear Cypress cache to free up space
rm -rf ~/.cache/Cypress

# Get the AWS Account ID and Region
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGION="us-east-1"

echo "Bootstrapping CDK in account: $ACCOUNT, region: $REGION"

npm install aws-cdk-lib constructs
npm install --save-dev @types/node

# Optionally, skip Cypress installation if not needed in this environment.
# For example, you might set an environment variable to skip installing dev dependencies.
export CI_SKIP_CYPRESS=true

# Bootstrap the CDK environment dynamically
npx cdk bootstrap aws://$ACCOUNT/$REGION
npx cdk deploy RoundtableAiStack