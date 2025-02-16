#!/bin/bash
set -e

# Clear Cypress cache to free up space
rm -rf ~/.cache/Cypress

# Get the AWS Account ID and Region
CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
CDK_DEFAULT_REGION="us-east-1"

echo "Bootstrapping CDK in account: $CDK_DEFAULT_ACCOUNT, region: $CDK_DEFAULT_REGION"

npm ci --production

# Optionally, skip Cypress installation if not needed in this environment.
# For example, you might set an environment variable to skip installing dev dependencies.
export CI_SKIP_CYPRESS=true

# Bootstrap the CDK environment dynamically
npx cdk bootstrap aws://$CDK_DEFAULT_ACCOUNT/$CDK_DEFAULT_REGION
npx cdk deploy RoundtableAiStack