// File: server/utils/brandUtils.js

/**
 * Determine the brand of a product
 * @param {Object} product - Product object
 * @returns {String} - Brand name
 */
exports.determineBrand = function(product) {
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
  };