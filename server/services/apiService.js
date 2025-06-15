const axios = require('axios');
const crypto = require('crypto');

// API credentials
const credentials = {
  username: "dica85565",
  apikey: "67dc6215626f19.85865",
  url: "https://digiprosb.api.digiswitch.id/v1/user/api/price-list"
};

/**
 * Service to interact with the external API
 */
exports.fetchPriceList = async () => {
  const command = "pricelist";
  const sign = crypto.createHash('md5')
    .update(credentials.username + credentials.apikey + command)
    .digest('hex');

  const postData = {
    command: command,
    username: credentials.username,
    sign: sign
  };
 
  try {
    // Add timeout to prevent hanging requests
    const response = await axios.post(credentials.url, postData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 seconds timeout
    });
    
    // Check if response has the expected structure
    if (!response || !response.data) {
      console.error('Invalid response from API:', response);
      return { error: "Invalid response from external API" };
    }
    // For debugging: log status code and response headers
    return response.data;
  } catch (error) {
    // More detailed error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx 
      console.error('API error response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      return { error: `API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}` };
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No API response received:', error.request);
      return { error: "No response received from API (timeout or network issue)" };
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error in API request setup:', error.message);
      return { error: `API request error: ${error.message}` };
    }
  }
};