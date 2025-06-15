/**
 * Update the UI with the filtered and grouped data
 * @param {Object} groupedData - Product data grouped by category, brand, and code
 */
function updateUI(groupedData) {
    // Update each category section
    renderCategorySection('Pulsa Transfer', groupedData['Pulsa Transfer'], 'pulsa-transfer-container');
    renderCategorySection('Pulsa Reguler', groupedData['Pulsa Reguler'], 'pulsa-reguler-container');
    renderCategorySection('Data', groupedData['Data'], 'data-container');
    renderCategorySection('E-Money', groupedData['E-Money'], 'e-money-container');
    renderCategorySection('Games', groupedData['Games'], 'games-container');
    renderCategorySection('PLN', groupedData['PLN'], 'pln-container');
    renderCategorySection('Lainnya', groupedData['Lainnya'], 'lainnya-container');
}

/**
 * Render all categories using the same grouping logic
 * @param {String} categoryTitle - Title of the category
 * @param {Object} categoryData - Data for this category
 * @param {String} containerId - ID of the container element
 */
function renderCategorySection(categoryTitle, categoryData, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID '${containerId}' not found!`);
        return; // Exit if the container doesn't exist
    }

    container.innerHTML = ''; // Clear previous content

    if (!categoryData) return;

    // For each brand in the category
    for (const brandName in categoryData) {
        const brandData = categoryData[brandName];
        
        // Grupkan berdasarkan prefix kode untuk semua kategori
        const groupedByPrefix = {};

        // Loop through all codes in this brand
        for (const codeValue in brandData) {
            const products = brandData[codeValue];
            if (!products || products.length === 0) continue;

            // Ambil prefix kode (huruf di awal kode)
            const prefixMatch = codeValue.match(/^[a-zA-Z]+/);
            if (!prefixMatch) continue;
            
            const prefix = prefixMatch[0];

            if (!groupedByPrefix[prefix]) {
                groupedByPrefix[prefix] = [];
            }

            // Gabungkan semua produk dalam prefix yang sama
            groupedByPrefix[prefix] = groupedByPrefix[prefix].concat(products);
        }

        // Tampilkan tabel berdasarkan prefix yang sudah digabung
        for (const prefix in groupedByPrefix) {
            const products = groupedByPrefix[prefix];
            
            // Nama tabel dengan format: BRAND KATEGORI - Kode PREFIX
            const tableName = `${brandName} ${categoryTitle} - Kode ${prefix.toUpperCase()}`;
            renderPrefixTable(prefix, products, tableName, container);
        }
    }
}

/**
 * Render a prefix-based table for all categories
 * @param {String} prefix - Code prefix
 * @param {Array} products - List of products
 * @param {String} tableName - Name of the table
 * @param {HTMLElement} container - Container element
 */
function renderPrefixTable(prefix, products, tableName, container) {
    if (!products || products.length === 0) return;
    
    // Create div container
    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-responsive mb-4';
    
    // Create table with styling
    let tableHTML = `
    <div class='tablewrapper'> 
        <table class='tabel' border='1' style='width:100%; border-collapse: collapse;'>
            <tr class='head'>
                <td colspan='4' class='center last' style='background-color: #4784a5;color: #ffffff; text-align:center;'>
                    ${tableName}
                </td>
            </tr>
            <tr class='head'>
                <td class='center'>Kode</td>
                <td class='center'>Keterangan</td>
                <td class='center'>Harga</td>
                <td class='center last'>Status</td>
            </tr>
    `;
    
    // Add product rows - sort them by price first
    products.sort((a, b) => (a.price || 0) - (b.price || 0)).forEach(product => {
        const statusText = product.status ? 'Open' : 'Gangguan';
        const statusColor = product.status ? 'green' : 'red';
        
        tableHTML += `
            <tr class='td1'>
                <td class='center'>${escapeHtml(product.code || '')}</td>
                <td class='center'>${escapeHtml(product.desc || '')}</td>
                <td class='center'>Rp ${formatNumber(product.price || 0)}</td>
                <td class='center last' style='color: ${statusColor}; font-weight: bold;'>${statusText}</td>
            </tr>
        `;
    });
    
    // Close the table
    tableHTML += `</table></div>`;
    
    // Set the HTML
    tableContainer.innerHTML = tableHTML;
    
    // Append to container
    container.appendChild(tableContainer);
}

/**
 * Format number with thousand separators (Indonesian format)
 * @param {Number} number - Number to format
 * @returns {String} - Formatted number string
 */
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Escape HTML to prevent XSS
 * @param {String} unsafe - Potentially unsafe string
 * @returns {String} - Escaped string
 */
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}