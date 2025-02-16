#!/bin/bash
set -e

# Clear Cypress cache to free up space
rm -rf ~/.cache/Cypress

# Get the AWS Account ID and Region
CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="us-east-1"
CDK_DEFAULT_REGION=$AWS_REGION

echo "Bootstrapping CDK in account: $CDK_DEFAULT_ACCOUNT, region: $CDK_DEFAULT_REGION"

npm ci --omit=dev --legacy-peer-deps
npm run build

# Optionally, skip Cypress installation if not needed in this environment.
# For example, you might set an environment variable to skip installing dev dependencies.
export CI_SKIP_CYPRESS=true

# Generate the aws-exports.js file from environment variables
chmod +x generate-aws-exports.sh
./generate-aws-exports.sh

# Bootstrap the CDK environment dynamically
npx cdk bootstrap aws://$CDK_DEFAULT_ACCOUNT/$CDK_DEFAULT_REGION
npx cdk deploy RoundtableAiStack