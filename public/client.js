document.addEventListener('DOMContentLoaded', function() {
    // Initial fetch
    fetchData();
    
    // Set up periodic refresh (every 5 seconds)
    setInterval(fetchData, 5000);
  });
  
  // Daftar kode yang akan disembunyikan (statis)
  const HIDDEN_PREFIXES = ['OMCEK', 'DANATES', 'OVOTES', 'TES']; // Awalan kode yang disembunyikan
  const HIDDEN_SPECIFIC_CODES = []; // Kode spesifik yang disembunyikan
  const HIDDEN_KEYWORDS = []; // Kata kunci dalam deskripsi yang disembunyikan
  
  // Function to fetch data from our API endpoint
  async function fetchData() {
    try {
      // Dapatkan domain saat ini
      const currentDomain = window.location.origin;
      
      const response = await fetch(`${currentDomain}/api/price-list`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin' // Mengirim cookies jika ada
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error('API Error:', data.error);
        return;
      }
      
      // Filter data before updating UI
      const filteredData = filterData(data);
      console.log('Data berhasil diambil:', filteredData);
      
      updateUI(filteredData);
      updateLastUpdated();
    } catch (error) {
      console.error('Error mengambil data:', error);
      // Tampilkan pesan error ke user
      const errorMessage = document.createElement('div');
      errorMessage.className = 'alert alert-danger';
      errorMessage.textContent = 'Gagal mengambil data. Silakan coba lagi nanti.';
      document.body.appendChild(errorMessage);
      
      // Hapus pesan error setelah 5 detik
      setTimeout(() => {
        errorMessage.remove();
      }, 5000);
    }
  }
  
  // Function to filter data based on static hidden codes
  function filterData(data) {
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
  
  // Update the UI with the filtered and grouped data
  function updateUI(groupedData) {
    // Update each category section
    renderCategorySection('Pulsa Transfer', groupedData['Pulsa Transfer'], 'pulsa-transfer-container');
    renderCategorySection('Pulsa Reguler', groupedData['Pulsa Reguler'], 'pulsa-reguler-container');
    renderCategorySection('Data', groupedData['Data'], 'data-container');
    renderCategorySection('E-Money', groupedData['E-Money'], 'e-money-container');
    renderCategorySection('Games', groupedData['Games'], 'games-container');
    renderCategorySection('', groupedData['PLN'], 'pln-container');
    renderCategorySection('', groupedData['Lainnya'], 'lainnya-container');
  }
  
  // Fungsi untuk memperbarui waktu terakhir data diambil
  function updateLastUpdated() {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    const formattedDate = now.toLocaleDateString('id-ID', options);
    const lastUpdatedElement = document.getElementById('last-updated');
    if (lastUpdatedElement) {
      lastUpdatedElement.textContent = `Terakhir diperbarui: ${formattedDate}`;
    }
  }
  
  // Render all categories using the same grouping logic
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
  
  // Render a prefix-based table for all categories
  function renderPrefixTable(prefix, products, tableName, container) {
    if (!products || products.length === 0) return;
    
    // Create div container
    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-responsive mb-4';
    
    // Create table with styling
    let tableHTML = `
    <div class='tablewrapper' > 
      <table class='tabel' border='1' style='width:100%; border-collapse: collapse;'>
        <tr class='head'>
          <td colspan='6' class='center last ' style='background-color: #4784a5;color: #ffffff; text-align:center;'>
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
    tableHTML += `</table> </div>`;
    
    // Set the HTML
    tableContainer.innerHTML = tableHTML;
    
    // Summary information
    const summary = document.createElement('div');
    summary.className = 'mb-3';
    
    // Append to container
    tableContainer.appendChild(summary);
    container.appendChild(tableContainer);
  }
  
  // Format number with thousand separators (Indonesian format)
  function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  
  // Escape HTML to prevent XSS
  function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  