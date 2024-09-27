const apiKey = '5901154b5368441c9ab055caf85049bd'; // Replace with your actual API key

// Fetch currency list from Open Exchange Rates API
fetch(`https://openexchangerates.org/api/currencies.json?app_id=${apiKey}`)
    .then(response => response.json())
    .then(data => {
        const fromCurrencySelect = document.getElementById('fromCurrency');
        const toCurrencySelect = document.getElementById('toCurrency');
        
        for (const [code, name] of Object.entries(data)) {
            const option = document.createElement('option');
            option.value = code;
            option.text = `${code} - ${name}`;
            fromCurrencySelect.add(option.cloneNode(true)); 
            toCurrencySelect.add(option); 
        }
    })
    .catch(error => console.error('Error fetching currency list:', error));


document.getElementById('convertButton').addEventListener('click', function() {
    const amount = document.getElementById('amount').value;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    const url = `https://openexchangerates.org/api/latest.json?app_id=${apiKey}&base=${fromCurrency}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const rate = data.rates[toCurrency];
            const convertedAmount = (amount * rate).toFixed(2);
            document.getElementById('result').innerText = `${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`;
        })
        .catch(error => {
            document.getElementById('result').innerText = 'Error retrieving exchange rates. Please try again.';
            console.error('Error fetching exchange rates:', error);
        });
});

// Custom search filter for the "From" currency dropdown
document.getElementById('fromCurrencySearch').addEventListener('keyup', function() {
    const filter = this.value.toUpperCase();
    const select = document.getElementById('fromCurrency');
    const options = select.getElementsByTagName('option');
    
    for (let i = 0; i < options.length; i++) {
        const txtValue = options[i].textContent || options[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            options[i].style.display = "";
        } else {
            options[i].style.display = "none";
        }
    }
});
