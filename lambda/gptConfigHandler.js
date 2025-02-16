const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.GPT_CONFIG_TABLE;

exports.handler = async (event) => {
  const method = event.httpMethod;
  let response;

  try {
    switch (method) {
      case 'GET': {
        // If a specific configId is provided, return that item.
        const configId = event.queryStringParameters && event.queryStringParameters.id;
        // Also support filtering by name
        const nameFilter = event.queryStringParameters && event.queryStringParameters.name;
        if (configId) {
          const result = await dynamoDb.get({ TableName: TABLE_NAME, Key: { configId } }).promise();
          response = { statusCode: 200, body: JSON.stringify(result.Item) };
        } else if (nameFilter) {
          // Use scan with a filter expression for name matching
          const params = {
            TableName: TABLE_NAME,
            FilterExpression: 'contains(#n, :name)',
            ExpressionAttributeNames: { '#n': 'name' },
            ExpressionAttributeValues: { ':name': nameFilter }
          };
          const result = await dynamoDb.scan(params).promise();
          response = { statusCode: 200, body: JSON.stringify(result.Items) };
        } else {
          // Otherwise, return all items.
          const result = await dynamoDb.scan({ TableName: TABLE_NAME }).promise();
          response = { statusCode: 200, body: JSON.stringify(result.Items) };
        }
        break;
      }

      case 'POST': {
        // Create a new GPT configuration; validate required fields.
        const newConfig = JSON.parse(event.body);
        if (!newConfig.configId || !newConfig.name) {
          response = { statusCode: 400, body: JSON.stringify({ message: 'configId and name are required' }) };
          break;
        }
        await dynamoDb.put({ TableName: TABLE_NAME, Item: newConfig }).promise();
        response = { statusCode: 201, body: JSON.stringify({ message: 'Created new GPT configuration.' }) };
        break;
      }

      case 'PUT': {
        // Full update; require configId and name.
        const updatedConfig = JSON.parse(event.body);
        if (!updatedConfig.configId || !updatedConfig.name) {
          response = { statusCode: 400, body: JSON.stringify({ message: 'configId and name are required for update' }) };
          break;
        }
        await dynamoDb.put({ TableName: TABLE_NAME, Item: updatedConfig }).promise();
        response = { statusCode: 200, body: JSON.stringify({ message: 'Updated GPT configuration.' }) };
        break;
      }

      case 'PATCH': {
        // Partial update: expect configId in query parameter and update fields in the request body.
        const patchConfigId = event.queryStringParameters && event.queryStringParameters.id;
        if (!patchConfigId) {
          response = { statusCode: 400, body: JSON.stringify({ message: 'configId query parameter is required for patch' }) };
          break;
        }
        const updateFields = JSON.parse(event.body);
        if (!updateFields || Object.keys(updateFields).length === 0) {
          response = { statusCode: 400, body: JSON.stringify({ message: 'No update fields provided' }) };
          break;
        }
        // Build the update expression dynamically
        let updateExpression = 'set';
        const ExpressionAttributeNames = {};
        const ExpressionAttributeValues = {};
        const keys = Object.keys(updateFields);
        keys.forEach((key, index) => {
          updateExpression += ` #${key} = :${key}${index < keys.length - 1 ? ',' : ''}`;
          ExpressionAttributeNames[`#${key}`] = key;
          ExpressionAttributeValues[`:${key}`] = updateFields[key];
        });

        const patchParams = {
          TableName: TABLE_NAME,
          Key: { configId: patchConfigId },
          UpdateExpression: updateExpression,
          ExpressionAttributeNames,
          ExpressionAttributeValues,
          ReturnValues: "UPDATED_NEW"
        };
        const patchResult = await dynamoDb.update(patchParams).promise();
        response = {
          statusCode: 200,
          body: JSON.stringify({ message: 'Patched GPT configuration.', updatedAttributes: patchResult.Attributes })
        };
        break;
      }

      case 'DELETE': {
        // Delete a GPT configuration by configId (from query parameters).
        const delConfigId = event.queryStringParameters && event.queryStringParameters.id;
        if (!delConfigId) {
          response = { statusCode: 400, body: JSON.stringify({ message: 'configId query parameter is required for delete' }) };
          break;
        }
        await dynamoDb.delete({ TableName: TABLE_NAME, Key: { configId: delConfigId } }).promise();
        response = { statusCode: 200, body: JSON.stringify({ message: 'Deleted GPT configuration.' }) };
        break;
      }

      default:
        response = { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) };
    }
  } catch (error) {
    response = { statusCode: 500, body: JSON.stringify({ message: error.message }) };
  }
  return response;
};