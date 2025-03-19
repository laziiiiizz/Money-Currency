// Add this near the top of your file
const API_KEY = '034389a9a81af9e9ce1137066ad9c439';
const convertButton = document.getElementById('convertButton');
const resultDiv = document.getElementById('result');
const rateDiv = document.getElementById('exchangeRate');
const amountInput = document.getElementById('amount');
const fromSelect = document.getElementById('fromCurrency');
const toSelect = document.getElementById('toCurrency');

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
    const url = `http://data.fixer.io/api/latest?access_key=${API_KEY}&base=EUR&symbols=${fromCurrency},${toCurrency}`;

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
                    <span class="amount">${formatNumber(amount, fromCurrency)} ${fromCurrency}</span>
                    <span class="equals">equals</span>
                    <span class="converted">${formatNumber(convertedAmount, toCurrency)} ${toCurrency}</span>
                </div>
            `;


            rateDiv.innerHTML = `
                <div class="rate-details">
                    <div class="current-rate">1 ${fromCurrency} = ${rate.toFixed(6)} ${toCurrency}</div>
                    <div class="inverse-rate">1 ${toCurrency} = ${(1/rate).toFixed(6)} ${fromCurrency}</div>
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
            resultDiv.textContent = 'An error occurred while fetching data. Please try again later.';
        }
    }
}

// Event listeners
convertButton.addEventListener('click', performConversion);
amountInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performConversion();
});

async function testAPI() {
    const url = `http://data.fixer.io/api/latest?access_key=${API_KEY}`;

    try {
        console.log('Testing API with URL:', url);
        const response = await fetchWithTimeout(url);
        console.log('Test response status:', response.status);
        console.log('Test response headers:', Object.fromEntries(response.headers));
        const data = await response.json();
        console.log('API Test Response:', JSON.stringify(data, null, 2));
        if (data.success) {
            console.log('API is working correctly');
            console.log('Base currency:', data.base);
            console.log('Available symbols:', Object.keys(data.rates).join(', '));
        } else {
            console.log('API Error:', data.error);
            console.log('Error code:', data.error.code);
            console.log('Error type:', data.error.type);
            console.log('Error info:', data.error.info);
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        if (error.name === 'AbortError') {
            console.log('API test request timed out');
        } else {
            console.log('API test error:', error.message);
        }
    }
}

// Call the test function when the page loads
window.addEventListener('load', testAPI);

