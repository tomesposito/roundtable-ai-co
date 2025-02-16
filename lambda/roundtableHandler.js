const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.ROUND_TABLE_TABLE;

exports.handler = async (event) => {
  const method = event.httpMethod;
  let response;
  try {
    switch (method) {
      case 'GET':
        // Retrieve one roundtable if an ID is provided; otherwise, list all.
        const roundtableId = event.queryStringParameters && event.queryStringParameters.id;
        if (roundtableId) {
          const result = await dynamoDb.get({ TableName: TABLE_NAME, Key: { roundtableId } }).promise();
          response = { statusCode: 200, body: JSON.stringify(result.Item) };
        } else {
          const result = await dynamoDb.scan({ TableName: TABLE_NAME }).promise();
          response = { statusCode: 200, body: JSON.stringify(result.Items) };
        }
        break;

      case 'POST':
        // Create a new roundtable grouping.
        const newRoundtable = JSON.parse(event.body);
        // newRoundtable should include a unique roundtableId, a name, and a list of GPT configuration IDs.
        await dynamoDb.put({ TableName: TABLE_NAME, Item: newRoundtable }).promise();
        response = { statusCode: 201, body: JSON.stringify({ message: 'Created new roundtable.' }) };
        break;

      case 'PUT':
        // Update an existing roundtable.
        const updatedRoundtable = JSON.parse(event.body);
        await dynamoDb.put({ TableName: TABLE_NAME, Item: updatedRoundtable }).promise();
        response = { statusCode: 200, body: JSON.stringify({ message: 'Updated roundtable.' }) };
        break;

      case 'DELETE':
        // Delete a roundtable using its ID.
        const delRoundtableId = event.queryStringParameters && event.queryStringParameters.id;
        await dynamoDb.delete({ TableName: TABLE_NAME, Key: { roundtableId: delRoundtableId } }).promise();
        response = { statusCode: 200, body: JSON.stringify({ message: 'Deleted roundtable.' }) };
        break;

      default:
        response = { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed.' }) };
    }
  } catch (error) {
    response = { statusCode: 500, body: JSON.stringify({ message: error.message }) };
  }
  return response;
};