document.addEventListener('DOMContentLoaded', function() {
    // Add status indicator to the page
    addStatusIndicator();
    
    // Initial fetch
    fetchAndUpdateData();
    
    // Set up periodic refresh (every 10 seconds, increased from 5)
    setInterval(fetchAndUpdateData, 10000);
});

// Add status indicator to the page
function addStatusIndicator() {
    const header = document.querySelector('header');
    if (!header) return;
    
    const statusDiv = document.createElement('div');
    statusDiv.id = 'api-status';
    statusDiv.className = 'api-status';
    statusDiv.innerHTML = '<span>Status API: </span><span id="status-text">Memuat...</span>';
    
    // Add some basic styling
    const style = document.createElement('style');
    style.textContent = `
        .api-status {
            margin-top: 10px;
            padding: 5px 10px;
            background-color: #f8f9fa;
            border-radius: 4px;
            font-size: 0.9em;
        }
        .api-status .status-ok {
            color: green;
            font-weight: bold;
        }
        .api-status .status-error {
            color: #d9534f;
            font-weight: bold;
        }
        .api-status .status-loading {
            color: #0275d8;
            font-weight: bold;
        }
    `;
    
    document.head.appendChild(style);
    header.appendChild(statusDiv);
}

// Update status indicator
function updateStatus(status, message = '') {
    const statusText = document.getElementById('status-text');
    if (!statusText) return;
    
    statusText.className = '';
    
    switch (status) {
        case 'ok':
            statusText.textContent = 'Terhubung';
            statusText.className = 'status-ok';
            break;
        case 'error':
            statusText.textContent = `Gagal (${message})`;
            statusText.className = 'status-error';
            break;
        case 'loading':
            statusText.textContent = 'Memuat...';
            statusText.className = 'status-loading';
            break;
    }
}

// Main function to fetch data and update UI
function fetchAndUpdateData() {
    // Update status to loading
    updateStatus('loading');
    
    fetchData()
        .then(data => {
            // Filter data before updating UI
            const filteredData = filterData(data);
            updateUI(filteredData);
            updateLastUpdated();
            // Update status to ok
            updateStatus('ok');
        })
        .catch(error => {
            console.error('Error in fetching and updating data:', error);
            // Update status to error
            updateStatus('error', error.message || 'Kesalahan tidak diketahui');
        });
}

// Update the last updated timestamp
function updateLastUpdated() {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    const formattedTime = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    document.getElementById('update-time').textContent = `${formattedDate} ${formattedTime}`;
}