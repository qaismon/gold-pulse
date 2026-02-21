// 1. Initialize TradingView Widget
new TradingView.widget({
    "autosize": true,
    "symbol": "BINANCE:BTCUSDT",
    "interval": "1",
    "theme": "dark",
    "style": "1",
    "locale": "en",
    "hide_top_toolbar": true,
    "container_id": "tradingview_chart"
});

let countdown = 30;
let timerInterval;

async function getMarketDecision() {
    const btn = document.getElementById('action-btn');
    const signalText = document.getElementById('signal-text');
    const screen = document.getElementById('display-screen');
    const log = document.getElementById('log-msg');

    btn.disabled = true;
    screen.classList.add('updating');
    log.textContent = "Syncing with Binance WebSocket...";

    try {
        const response = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=100');
        const data = await response.json();
        const closes = data.map(d => parseFloat(d[4]));
        const currentPrice = closes[closes.length - 1];
        
        document.getElementById('price-value').textContent = `$${currentPrice.toLocaleString()}`;

        // Indicator Calculations
        let gains = 0, losses = 0;
        for (let i = closes.length - 14; i < closes.length; i++) {
            let diff = closes[i] - closes[i - 1];
            diff > 0 ? gains += diff : losses -= diff;
        }
        const rsi = 100 - (100 / (1 + (gains / losses)));
        const ema20 = closes.slice(-20).reduce((a, b) => a + b) / 20;

        document.getElementById('rsi-val').textContent = rsi.toFixed(2);
        document.getElementById('trend-val').textContent = currentPrice > ema20 ? "BULLISH" : "BEARISH";

        // Strategy Decision
        let decision = "NEUTRAL";
        if (rsi <= 35 && currentPrice > ema20) decision = "STRONG BUY";
        else if (rsi >= 65 && currentPrice < ema20) decision = "STRONG SELL";

        renderSignal(decision, currentPrice);
        
        btn.disabled = false;
        screen.classList.remove('updating');
        resetTimer();

    } catch (e) {
        log.textContent = "API Error. Retrying...";
        btn.disabled = false;
    }
}

function renderSignal(decision, price) {
    const signalText = document.getElementById('signal-text');
    const subText = document.getElementById('sub-text');
    const screen = document.getElementById('display-screen');
    
    screen.className = "screen";

    if (decision === "STRONG BUY") {
        signalText.textContent = "STRONG BUY";
        subText.textContent = "Oversold Trend-Follow";
        screen.classList.add('bullish');
        calculateRisk("BUY", price);
    } else if (decision === "STRONG SELL") {
        signalText.textContent = "STRONG SELL";
        subText.textContent = "Overbought Trend-Rejection";
        screen.classList.add('bearish');
        calculateRisk("SELL", price);
    } else {
        signalText.textContent = "NEUTRAL / HOLD";
        subText.textContent = "Equilibrium: High Risk Entry";
        screen.classList.add('neutral');
        calculateRisk("BUY", price); // Default display
    }
}

function calculateRisk(bias, price) {
    const balance = parseFloat(document.getElementById('acc-balance').value) || 1000;
    let slPrice, tpPrice;

    // Tight Scalp Settings (0.25% SL / 0.75% TP)
    if (bias === "SELL") {
        slPrice = price * 1.0025;
        tpPrice = price * 0.9925;
    } else {
        slPrice = price * 0.9975;
        tpPrice = price * 1.0075;
    }

    document.getElementById('sl-price').textContent = `$${slPrice.toFixed(2)}`;
    document.getElementById('tp-price').textContent = `$${tpPrice.toFixed(2)}`;
    
    const riskAmount = balance * 0.01; 
    const priceDiff = Math.abs(price - slPrice);
    document.getElementById('pos-size').textContent = `${(riskAmount / priceDiff).toFixed(4)} BTC`;
}

// Timer Logic
function resetTimer() {
    clearInterval(timerInterval);
    countdown = 30;
    document.getElementById('timer').textContent = countdown;
    
    timerInterval = setInterval(() => {
        countdown--;
        document.getElementById('timer').textContent = countdown;
        if (countdown <= 0) {
            getMarketDecision();
        }
    }, 1000);
}

// Launch
getMarketDecision();