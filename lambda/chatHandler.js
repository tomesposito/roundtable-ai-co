const axios = require('axios');

exports.handler = async (event) => {
  try {
    // Parse the incoming request body
    const body = JSON.parse(event.body);
    const userMessage = body.message;
    const roundtable = body.roundtable; // Expected to include an array: roundtable.gptConfigs

    if (!userMessage || !roundtable || !Array.isArray(roundtable.gptConfigs)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required data: message and roundtable with gptConfigs are required.' }),
      };
    }

    let responses = [];

    // Iterate over each GPT configuration and make a call to the OpenAI API
    for (const config of roundtable.gptConfigs) {
      const { configId, apiKey } = config;
      if (!apiKey) {
        responses.push({
          sender: `GPT ${configId}`,
          text: 'Error: Missing API key for this configuration.',
        });
        continue;
      }

      // Prepare the payload for the Chat API call
      const data = {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: userMessage }
        ],
        max_tokens: 50,
        temperature: 0.7,
      };

      try {
        // Call the OpenAI Chat Completions endpoint
        const apiResponse = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          data,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`,
            },
          }
        );

        // Extract the response text from the API response
        const responseText = apiResponse.data.choices[0].message.content.trim();
        responses.push({
          sender: `GPT ${configId}`,
          text: responseText,
        });
      } catch (apiError) {
        console.error(`Error for GPT config ${configId}:`, apiError.response ? apiError.response.data : apiError.message);
        responses.push({
          sender: `GPT ${configId}`,
          text: `Error calling OpenAI API: ${apiError.response ? apiError.response.data.error.message : apiError.message}`,
        });
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ gptResponses: responses }),
    };
  } catch (error) {
    console.error("General error in chatHandler:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};