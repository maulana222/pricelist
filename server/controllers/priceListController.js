const apiService = require('../services/apiService');
const categoryUtils = require('../utils/categoryUtils');

/**
 * Controller for price list data
 */
exports.getPriceList = async (req, res) => {
  try {
    const apiResponse = await apiService.fetchPriceList();
    
    // Check if the API returned an error
    if (apiResponse.error) {
      return res.status(500).json({ error: apiResponse.error });
    }
    
    // Additional check for data structure
    if (!apiResponse || !apiResponse.data || !Array.isArray(apiResponse.data)) {
      // For debugging: Log the actual response
      console.log("Unexpected API response structure:", JSON.stringify(apiResponse));
      return res.status(500).json({ 
        error: "Unable to retrieve data from API",
        details: "Invalid data structure received" 
      });
    }
    
    const groupedProducts = categoryUtils.groupProducts(apiResponse.data);
    
    res.json(groupedProducts);
  } catch (error) {
    console.error('Error in price list controller:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
};