const brandUtils = require('./brandUtils');

/**
 * Group products by category, brand, and code
 * @param {Array} products - Array of product objects
 * @returns {Object} - Grouped products in the requested hierarchy
 */
exports.groupProducts = (products) => {
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
      // Use brandUtils.determineBrand directly to fix the error
      const brand = brandUtils.determineBrand(product);
      
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
};

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