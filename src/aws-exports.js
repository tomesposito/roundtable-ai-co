const awsRegion = process.env.AWS_REGION ;
const cognitoIdentityPoolId = process.env.COGNITO_IDENTITY_POOL_ID ;
const cognitoUserPoolId = process.env.COGNITO_USER_POOL_ID ;
const cognitoUserPoolClientId = process.env.COGNITO_USER_POOL_CLIENT_ID ;
const cognitoDomain = process.env.COGNITO_DOMAIN ;
const apiEndpoint = process.env.API_ENDPOINT ;

const awsmobile = {
    "aws_project_region": awsRegion,
    "aws_cognito_identity_pool_id": `us-east-1:${cognitoIdentityPoolId}`,
    "aws_cognito_region": awsRegion,
    "aws_user_pools_id": `us-east-1_${cognitoUserPoolId}`,
    "aws_user_pools_web_client_id": cognitoUserPoolClientId,
    "oauth": {
        "domain": `${cognitoDomain}.auth.us-east-1.amazoncognito.com`,
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
            "endpoint": `https://${apiEndpoint}.amazonaws.com/prod`,
            "region": "us-east-1"
        }
    ]
  };
  
  export default awsmobile;