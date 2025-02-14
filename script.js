const symbols = [
    "btcusdt", "ethusdt", "bnbusdt", "xrpusdt", "adausdt",
    "solusdt", "dogeusdt", "dotusdt", "maticusdt", "shibusdt",
    "ltcusdt", "avaxusdt", "uniusdt", "linkusdt", "xlmusdt",
    "bchusdt", "algousdt", "nearusdt", "vetusdt", "fttusdt",
    "axsusdt", "filusdt", "xmrusdt", "etcusdt", "heliumusdt",
    "trxusdt", "galausdt", "thetausdt", "xtzusdt", "bsvusdt"
];

const symbolNameMap = {
    "btcusdt": "Bitcoin",
    "ethusdt": "Ethereum",
    "bnbusdt": "Binance Coin",
    "xrpusdt": "Ripple",
    "adausdt": "Cardano",
    "solusdt": "Solana",
    "dogeusdt": "Dogecoin",
    "dotusdt": "Polkadot",
    "maticusdt": "Polygon",
    "shibusdt": "Shiba Inu",
    "ltcusdt": "Litecoin",
    "avaxusdt": "Avalanche",
    "uniusdt": "Uniswap",
    "linkusdt": "Chainlink",
    "xlmusdt": "Stellar",
    "bchusdt": "Bitcoin Cash",
    "algousdt": "Algorand",
    "nearusdt": "NEAR Protocol",
    "vetusdt": "VeChain",
    "fttusdt": "FTX Token",
    "axsusdt": "Axie Infinity",
    "filusdt": "Filecoin",
    "xmrusdt": "Monero",
    "etcusdt": "Ethereum Classic",
    "heliumusdt": "Helium",
    "trxusdt": "Tron",
    "galausdt": "Gala",
    "thetausdt": "Theta",
    "xtzusdt": "Tezos",
    "bsvusdt": "Bitcoin SV"
};

function createGridItems() {
    const pricesContainer = document.getElementById('prices');
    pricesContainer.innerHTML = ''; // Clear previous prices
    symbols.forEach(symbol => {
        const priceItem = document.createElement('div');
        priceItem.className = 'grid-item';
        priceItem.id = `price-${symbol}`;
        priceItem.innerHTML = `<strong>${symbolNameMap[symbol]}</strong><br>Loading...`;
        pricesContainer.appendChild(priceItem);
    });
}

async function fetchInitialPrices() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=' + symbols.map(symbol => symbol.slice(0, -4)).join(','));
        const data = await response.json();
        data.forEach(coin => {
            const symbol = coin.id + "usdt";
            const priceElement = document.getElementById(`price-${symbol}`);
            if (priceElement) {
                priceElement.innerHTML = `<strong>${coin.name}</strong><br>$${coin.current_price.toFixed(2)}`;
            }
        });
        // Set up WebSocket for real-time updates
        fetchCryptoPrices();
    } catch (error) {
        console.error('Error fetching initial prices:', error);
        document.getElementById('prices').innerHTML = 'Error loading prices';
    }
}

async function fetchCryptoPrices() {
    const socket = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');

    socket.onmessage = event => {
        const data = JSON.parse(event.data);
        updatePrices(data);
    };

    socket.onerror = error => {
        console.error('WebSocket error:', error);
        // Attempt to reconnect after 5 seconds
        setTimeout(fetchCryptoPrices, 5000);
    };

    socket.onclose = () => {
        console.log('WebSocket connection closed, attempting to reconnect...');
        // Attempt to reconnect after 5 seconds
        setTimeout(fetchCryptoPrices, 5000);
    };
}

function updatePrices(data) {
    data.forEach(coin => {
        const symbol = coin.s.toLowerCase();
        if (symbols.includes(symbol)) {
            const priceElement = document.getElementById(`price-${symbol}`);
            if (priceElement) {
                priceElement.innerHTML = `<strong>${symbolNameMap[symbol]}</strong><br>$${parseFloat(coin.c).toFixed(2)}`;
            }
        }
    });
}

// Create grid items and fetch the initial prices when the page loads
createGridItems();
fetchInitialPrices();
