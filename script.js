// Constants and DOM elements
const API_KEY = '034389a9a81af9e9ce1137066ad9c439';
const convertButton = document.getElementById('convertButton');
const resultDiv = document.getElementById('result');
const rateDiv = document.getElementById('exchangeRate');
const amountInput = document.getElementById('amount');

function validateAmount(input) {
    // Remove any non-numeric characters except decimal point
    input.value = input.value.replace(/[^0-9.]/g, '');

    // Ensure only one decimal point
    let parts = input.value.split('.');
    if (parts.length > 2) {
        parts = [parts[0], parts.slice(1).join('')];
        input.value = parts.join('.');
    }

    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
        input.value = parseFloat(input.value).toFixed(2);
    }

    // Prevent negative values
    if (parseFloat(input.value) < 0) {
        input.value = '0';
    }
}
const fromSelect = document.getElementById('fromCurrency');
const toSelect = document.getElementById('toCurrency');
const loadingScreen = document.getElementById('loading-screen');
const mainContent = document.getElementById('main-content');


// Add timestamp display
const timestampDiv = document.createElement('div');
timestampDiv.id = 'timestamp';
rateDiv.parentNode.appendChild(timestampDiv);

function formatNumber(number, currencyCode) {
    return new Intl.NumberFormat('en-US', { 
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2
    }).format(number);
}

async function fetchWithTimeout(url, timeout = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}
async function performConversion() {
    resultDiv.textContent = 'Fetching latest rates...';
    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromSelect.value;
    const toCurrency = toSelect.value;

    if (isNaN(amount) || amount <= 0) {
        resultDiv.textContent = 'Please enter a valid amount.';
        return;
    }
    const url = `https://data.fixer.io/api/latest?access_key=${API_KEY}&base=EUR&symbols=${fromCurrency},${toCurrency}`;

    try {
        console.log('Fetching from URL:', url);
        const response = await fetchWithTimeout(url);
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('API Response:', data);

        if (data.success) {
            const fromRate = data.rates[fromCurrency];
            const toRate = data.rates[toCurrency];
            const convertedAmount = amount * (toRate / fromRate);
            const rate = toRate / fromRate;

            resultDiv.innerHTML = `
                <div class="conversion-result">
                    <span class="amount">${formatNumber(amount, fromCurrency)}</span>
                    <span class="equals">equals</span>
                    <span class="converted">${formatNumber(convertedAmount, toCurrency)}</span>
                </div>
            `;

            rateDiv.innerHTML = `
                <div class="rate-details">
                    <div>1 ${fromCurrency} = ${rate.toFixed(6)} ${toCurrency}</div>
                    <div>1 ${toCurrency} = ${(1/rate).toFixed(6)} ${fromCurrency}</div>
                </div>
            `;

            const now = new Date();
            timestampDiv.textContent = `Last updated: ${now.toLocaleString()}`;
        } else {
            resultDiv.textContent = `API Error: ${data.error.code} - ${data.error.type}`;
            console.error('API Error Details:', data.error);
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        if (error.name === 'AbortError') {
            resultDiv.textContent = 'Request timed out. Please try again later.';
        } else {
            resultDiv.textContent = `An error occurred while fetching data: ${error.message}. Please try again later.`;
        }
    }
}


// Event listeners
convertButton.addEventListener('click', performConversion);
amountInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performConversion();
});

async function initializePage() {
    try {
        // Simulate loading time (you can adjust this as needed)
        await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
        console.error('Initialization error:', error);
    } finally {
        // Always hide loading screen and show main content
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
    }
}


// Make sure this event listener is in your script

window.addEventListener('load', initializePage);

// Add this to your existing code
document.getElementById('amount').addEventListener('input', function() {
    validateAmount(this);
});

