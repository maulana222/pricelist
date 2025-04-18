const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API credentials
const credentials = {
  username: "dica85565",
  apikey: "67dc6215626f19.85865",
  url: "https://digiprosb.api.digiswitch.id/v1/user/api/price-list"
};

// Function to fetch price list data
async function fetchPriceList() {
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
    const response = await axios.post(credentials.url, postData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching price list:', error.message);
    return { error: error.message };
  }
}

/**
 * Group products by category, brand, and code
 * @param {Array} products - Array of product objects
 * @returns {Object} - Grouped products in the requested hierarchy
 */
function groupProducts(products) {
  // Initialize the result object with desired structure
  const grouped = {
    'Pulsa Transfer': {},
    'Pulsa Reguler': {},
    'Data': {},
    'Games': {},
    'E-Money': {},
    'PLN': {},
    'Lainnya': {}
  };

  if (!Array.isArray(products)) {
    return grouped;
  }

  products.forEach(product => {
    if (!product || typeof product !== 'object' || !product.desc || !product.code) {
      return; // Skip invalid products
    }

    // Determine the category of the product
    const category = determineCategory(product);
    
    // Determine the brand/provider of the product
    const brand = determineBrand(product);
    
    // Get the product code
    const code = product.code;
    
    // If the category doesn't exist in our grouped object, create it
    if (!grouped[category]) {
      grouped[category] = {};
    }
    
    // If the brand doesn't exist in this category, create it
    if (!grouped[category][brand]) {
      grouped[category][brand] = {};
    }
    
    // If the code doesn't exist for this brand, create an empty array for it
    if (!grouped[category][brand][code]) {
      grouped[category][brand][code] = [];
    }
    
    // Add the product to the appropriate array
    grouped[category][brand][code].push(product);
  });

  // Sort products within each code group by price
  for (const category in grouped) {
    for (const brand in grouped[category]) {
      for (const code in grouped[category][brand]) {
        grouped[category][brand][code].sort((a, b) => (a.price || 0) - (b.price || 0));
      }
    }
  }

  // Remove empty categories and brands
  for (const category in grouped) {
    if (Object.keys(grouped[category]).length === 0) {
      delete grouped[category];
    } else {
      for (const brand in grouped[category]) {
        if (Object.keys(grouped[category][brand]).length === 0) {
          delete grouped[category][brand];
        }
      }
    }
  }

  return grouped;
}

/**
 * Determine the category of a product
 * @param {Object} product - Product object
 * @returns {String} - Category name
 */
function determineCategory(product) {
  if (!product || typeof product !== 'object' || !product.desc) {
    return 'Lainnya';
  }
  
  const desc = product.desc.toLowerCase();
  const name = (product.name || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  
  // Pulsa Transfer detection
  const transferKeywords = ['transfer', 'pulsa transfer', 'bagi pulsa', 'shared pulsa', 'kirim pulsa'];
  for (const keyword of transferKeywords) {
    if (desc.includes(keyword)) {
      return 'Pulsa Transfer';
    }
  }
  
  // Pulsa Reguler detection
  if (category.includes('pulsa') || desc.includes('pulsa')) {
    return 'Pulsa Reguler';
  }
  
  // Data package detection
  if (desc.includes('data') || 
      desc.includes('kuota') || 
      desc.includes('internet') || 
      desc.includes('gb') || 
      desc.includes('mb') ||
      name.includes('data')) {
    return 'Data';
  }
  
  // Games category
  const gameKeywords = ['free fire', 'mobile legends', 'ml', 'honor of kings', 'pubg', 'game'];
  for (const keyword of gameKeywords) {
    if (desc.includes(keyword) || name.includes(keyword)) {
      return 'Games';
    }
  }
  
  // E-Money category
  const emoneyKeywords = [
    'gopay', 'go pay', 'dana', 'ovo', 'linkaja', 'link aja', 
    'shopeepay', 'shopee pay', 'sakuku', 'astrapay', 'astra pay',
    'e-money', 'emoney', 'dompet digital', 'e-wallet', 'ewallet'
  ];
  
  for (const keyword of emoneyKeywords) {
    if (desc.includes(keyword) || name.includes(keyword) || category.includes(keyword)) {
      return 'E-Money';
    }
  }
  
  // PLN category
  if (desc.includes('pln') || name.includes('pln') || 
      desc.includes('listrik') || name.includes('listrik')) {
    return 'PLN';
  }
  
  // Return a default category for anything that doesn't match
  return 'Lainnya';
}

/**
 * Determine the brand of a product
 * @param {Object} product - Product object
 * @returns {String} - Brand name
 */
function determineBrand(product) {
  if (!product || typeof product !== 'object') {
    return 'Lainnya';
  }

  const name = (product.name || '').toLowerCase();
  const desc = (product.desc || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  
  // If product has a brand attribute, use it
  if (brand && brand !== '') {
    // Capitalize first letter
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  }
  
  // Try to determine brand from name and description
  const brandKeywords = {
    'Telkomsel': ['telkomsel', 'tsel', 'simpati', 'kartu as', 'kartu halo'],
    'Indosat': ['indosat', 'im3', 'ooredoo', 'mentari'],
    'XL': ['xl', 'axiata'],
    'Axis': ['axis'],
    'Three': ['three', 'tri', '3'],
    'Smartfren': ['smartfren', 'smart'],
    'DANA': ['dana'],
    'OVO': ['ovo'],
    'GoPay': ['gopay', 'go pay', 'go-pay'],
    'ShopeePay': ['shopeepay', 'shopee pay', 'shopee-pay'],
    'LinkAja': ['linkaja', 'link aja', 'link-aja'],
    'FREE FIRE': ['free fire', 'ff', 'freefire'],
    'MOBILE LEGENDS': ['mobile legends', 'ml', 'mobilelegends'],
    'Honor of Kings': ['honor of kings', 'hok'],
    'PLN': ['pln', 'listrik', 'token listrik']
  };

  for (const [brandName, keywords] of Object.entries(brandKeywords)) {
    for (const keyword of keywords) {
      if (name.includes(keyword) || desc.includes(keyword)) {
        return brandName;
      }
    }
  }

  return 'Lainnya';
}
// API endpoint to get price list data
app.get('/api/price-list', async (req, res) => {
  try {
    const apiResponse = await fetchPriceList();
    
    if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
      return res.status(500).json({ error: "Unable to retrieve data from API" });
    }
    
    const groupedProducts = groupProducts(apiResponse.data);
    
    res.json(groupedProducts);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open your browser and navigate to http://localhost:${PORT}`);
});