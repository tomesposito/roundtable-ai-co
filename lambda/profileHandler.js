const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const PROFILE_TABLE = process.env.PROFILE_TABLE; // set this as an environment variable

exports.handler = async (event) => {
  const method = event.httpMethod;
  let response;

  try {
    if (method === 'GET') {
      const result = await dynamoDb.scan({ TableName: PROFILE_TABLE }).promise();
      response = {
        statusCode: 200,
        body: JSON.stringify(result.Items),
      };
    } else if (method === 'PUT') {
      const body = JSON.parse(event.body);
      const params = {
        TableName: PROFILE_TABLE,
        Item: body,
      };
      await dynamoDb.put(params).promise();
      response = {
        statusCode: 200,
        body: JSON.stringify({ message: 'Profile updated successfully' }),
      };
    } else {
      response = {
        statusCode: 405,
        body: JSON.stringify({ message: 'Method not allowed' }),
      };
    }
  } catch (error) {
    response = {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }

  return response;
};