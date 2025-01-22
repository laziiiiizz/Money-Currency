
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

function formatNumber(number) {
    return new Intl.NumberFormat('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2,
        style: 'currency',
        currencyDisplay: 'symbol'
    }).format(number);
}

async function performConversion() {
    resultDiv.textContent = 'Fetching latest rates...';
    const amount = amountInput.value;
    const fromCurrency = fromSelect.value;
    const toCurrency = toSelect.value;

    // Using HTTPS instead of HTTP for secure connection
    const API_KEY = '034389a9a81af9e9ce1137066ad9c439';
    const url = `https://data.fixer.io/api/latest?access_key=${API_KEY}&base=EUR&symbols=${fromCurrency},${toCurrency}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('API Response:', data); // Debug log to see API response

        if (data.success) {
            const fromRate = data.rates[fromCurrency];
            const toRate = data.rates[toCurrency];
            const convertedAmount = amount * (toRate / fromRate);
            const rate = toRate / fromRate;

            // Enhanced result display
            resultDiv.innerHTML = `
                <div class="conversion-result">
                    <span class="amount">${formatNumber(amount)} ${fromCurrency}</span>
                    <span class="equals">equals</span>
                    <span class="converted">${formatNumber(convertedAmount)} ${toCurrency}</span>
                </div>
            `;

            // Detailed rate information
            rateDiv.innerHTML = `
                <div class="rate-details">
                    <div class="current-rate">1 ${fromCurrency} = ${rate.toFixed(6)} ${toCurrency}</div>
                    <div class="inverse-rate">1 ${toCurrency} = ${(1/rate).toFixed(6)} ${fromCurrency}</div>
                </div>
            `;

            const now = new Date();
            timestampDiv.textContent = `Last updated: ${now.toLocaleString()}`;
        } else {
            resultDiv.textContent = `API Error: ${data.error.type}`;
            console.log('API Error Details:', data.error);
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        resultDiv.textContent = 'Connection error. Please check your internet connection.';
    }
}// Event listeners
convertButton.addEventListener('click', performConversion);
amountInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performConversion();
});

// Add these security middleware to your Express server
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Basic security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Input validation middleware
function validateCurrencyRequest(req, res, next) {
    const { fromCurrency, toCurrency, amount } = req.query;
    
    if (!fromCurrency || !toCurrency || !amount) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
    }
    
    // Add currency code validation if needed
    next();
}

