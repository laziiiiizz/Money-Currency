// 1. Get all necessary elements
const convertButton = document.getElementById('convertButton');
const resultDiv = document.getElementById('result');
const rateDiv = document.getElementById('exchangeRate');
const amountInput = document.getElementById('amount');
const fromSelect = document.getElementById('fromCurrency');
const toSelect = document.getElementById('toCurrency');

// 2. Create function to format numbers
function formatNumber(number) {
    return new Intl.NumberFormat('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    }).format(number);
}

// 3. Create the conversion function
async function performConversion() {
    // Show loading state
    resultDiv.textContent = 'Converting...';
    rateDiv.textContent = '';

    // Get input values
    const amount = amountInput.value;
    const fromCurrency = fromSelect.value;
    const toCurrency = toSelect.value;

    // Validate input
    if (!amount || amount <= 0) {
        resultDiv.textContent = 'Please enter a valid amount';
        return;
    }

    // API configuration
    const API_KEY = '034389a9a81af9e9ce1137066ad9c439';
    const url = `http://data.fixer.io/api/latest?access_key=${API_KEY}&base=EUR&symbols=${fromCurrency},${toCurrency}`;

    try {
        // Fetch data
        const response = await fetch(url);
        const data = await response.json();
        console.log('API Response:', data); // Debug log

        if (data.success) {
            // Calculate conversion
            const fromRate = data.rates[fromCurrency];
            const toRate = data.rates[toCurrency];
            const convertedAmount = amount * (toRate / fromRate);

            // Display results
            resultDiv.textContent = `${formatNumber(amount)} ${fromCurrency} = ${formatNumber(convertedAmount)} ${toCurrency}`;
            rateDiv.textContent = `Exchange Rate: 1 ${fromCurrency} = ${(toRate / fromRate).toFixed(6)} ${toCurrency}`; 
        } else {
            resultDiv.textContent = `Error: ${data.error.type}`;
            console.log('API Error:', data.error); // Debug log
        }
    } catch (error) {
        resultDiv.textContent = 'Connection error. Please try again.';
        console.error('Fetch Error:', error); // Debug log
    }
}

// 4. Add event listeners
convertButton.addEventListener('click', performConversion);
amountInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performConversion();
});

// 5. Log initial setup completion
console.log('Currency converter initialized');
