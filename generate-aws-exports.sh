#!/bin/bash
set -e

# Ensure required environment variables are set
: "${AWS_REGION:?Need to set AWS_REGION}"
: "${COGNITO_IDENTITY_POOL_ID:?Need to set COGNITO_IDENTITY_POOL_ID}"
: "${COGNITO_USER_POOL_ID:?Need to set COGNITO_USER_POOL_ID}"
: "${COGNITO_USER_POOL_CLIENT_ID:?Need to set COGNITO_USER_POOL_CLIENT_ID}"
: "${COGNITO_DOMAIN:?Need to set COGNITO_DOMAIN}"
: "${API_ENDPOINT:?Need to set API_ENDPOINT}"

cat <<EOT > src/aws-exports.js
const awsmobile = {
  "aws_project_region": "${AWS_REGION}",
  "aws_cognito_identity_pool_id": "${COGNITO_IDENTITY_POOL_ID}",
  "aws_cognito_region": "${AWS_REGION}",
  "aws_user_pools_id": "${COGNITO_USER_POOL_ID}",
  "aws_user_pools_web_client_id": "${COGNITO_USER_POOL_CLIENT_ID}",
  "oauth": {
      "domain": "${COGNITO_DOMAIN}",
      "scope": [
          "phone",
          "email",
          "openid",
          "profile",
          "aws.cognito.signin.user.admin"
      ],
      "redirectSignIn": "https://roundtableai.co/callback",
      "redirectSignOut": "https://roundtableai.co",
      "responseType": "code"
  },
  "aws_cloud_logic_custom": [
      {
          "name": "RoundtableAPI",
          "endpoint": "${API_ENDPOINT}",
          "region": "${AWS_REGION}"
      }
  ]
};
export default awsmobile;
EOT

echo "aws-exports.js generated successfully."