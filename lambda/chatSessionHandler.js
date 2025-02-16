const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.CHAT_SESSION_TABLE;

exports.handler = async (event) => {
  try {
    // Parse the incoming request body
    const body = JSON.parse(event.body);
    const { sessionId, messages } = body;

    if (!sessionId || !messages) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'sessionId and messages are required' }),
      };
    }

    // Prepare the record with a timestamp to ensure unique entries per session
    const timestamp = new Date().toISOString();

    const params = {
      TableName: TABLE_NAME,
      Item: {
        sessionId,
        timestamp,
        messages, // this should be an array of message objects
      },
    };

    // Save the chat session record to DynamoDB
    await dynamoDb.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Chat session logged successfully.' }),
    };
  } catch (error) {
    console.error("Error logging chat session:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};