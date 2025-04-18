/**
 * Function to fetch data from our API endpoint
 * @returns {Promise<Object>} The fetched and processed data
 */
async function fetchData() {
    try {
        // Use the hierarchical endpoint
        const response = await fetch('/api/price-list', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            },
            // Add a timeout
            signal: AbortSignal.timeout(15000) // 15 second timeout
        });
        
        if (!response.ok) {
            // Try to get error details from response
            let errorDetails = 'Unknown error';
            try {
                const errorData = await response.json();
                errorDetails = errorData.error || errorData.message || 'API error';
            } catch (e) {
                // If parsing error body fails, use status text
                errorDetails = response.statusText;
            }
            
            throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorDetails}`);
        }
        
        const data = await response.json();
        
        // Validate data structure
        if (!data || typeof data !== 'object') {
            console.warn('Data structure not as expected:', data);
            
            // Return an empty default structure as fallback
            return getDefaultDataStructure();
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        
        // Return default data structure as fallback
        return getDefaultDataStructure();
    }
}

/**
 * Get default data structure for fallback
 * @returns {Object} Default data structure
 */
function getDefaultDataStructure() {
    return {
        'Pulsa Transfer': {},
        'Pulsa Reguler': {},
        'Data': {},
        'Games': {},
        'E-Money': {},
        'PLN': {},
        'Lainnya': {}
    };
}

// Daftar kode yang akan disembunyikan (statis)
const HIDDEN_PREFIXES = ['OMCEK', 'DANATES', 'OVOTES', 'TES']; // Awalan kode yang disembunyikan
const HIDDEN_SPECIFIC_CODES = []; // Kode spesifik yang disembunyikan
const HIDDEN_KEYWORDS = []; // Kata kunci dalam deskripsi yang disembunyikan

/**
 * Function to filter data based on static hidden codes
 * @param {Object} data - The raw data to filter
 * @returns {Object} - Filtered data
 */
function filterData(data) {
    // If data is not valid, return default structure
    if (!data || typeof data !== 'object') {
        return getDefaultDataStructure();
    }
    
    const filteredData = {};
    
    // Loop through each category
    for (const category in data) {
        filteredData[category] = {};
        
        // Loop through each brand in the category
        for (const brand in data[category]) {
            filteredData[category][brand] = {};
            
            // Loop through each code in the brand
            for (const code in data[category][brand]) {
                // Check if code should be hidden based on prefix
                const shouldHideByPrefix = HIDDEN_PREFIXES.some(prefix => 
                    code.toLowerCase().startsWith(prefix.toLowerCase())
                );
                
                // Check if code should be hidden as a specific code
                const shouldHideByCode = HIDDEN_SPECIFIC_CODES.includes(code.toLowerCase());
                
                // If we should hide this code, skip it
                if (shouldHideByPrefix || shouldHideByCode) {
                    continue;
                }
                
                // Filter products by keyword in description
                const products = data[category][brand][code].filter(product => {
                    // Check if product has description that contains any of the hidden keywords
                    return !HIDDEN_KEYWORDS.some(keyword => 
                        product.desc && product.desc.toLowerCase().includes(keyword.toLowerCase())
                    );
                });
                
                // If there are products left after filtering, add them
                if (products.length > 0) {
                    filteredData[category][brand][code] = products;
                }
            }
            
            // Remove empty brands
            if (Object.keys(filteredData[category][brand]).length === 0) {
                delete filteredData[category][brand];
            }
        }
        
        // Remove empty categories
        if (Object.keys(filteredData[category]).length === 0) {
            delete filteredData[category];
        }
    }
    
    return filteredData;
}