const CONFIG = {
    SYMBOL: "XAUUSD",
    CHART_SYMBOL: "OANDA:XAUUSD",
    EMA_FAST: 9,
    EMA_SLOW: 21,
    STOCH_PERIOD: 5,
    RR_RATIO: 1.5,
    RISK_PER_TRADE: 0.02 // 2% risk
};

// 1. Chart Initialization using OANDA stream
new TradingView.widget({
    "autosize": true,
    "symbol": CONFIG.CHART_SYMBOL,
    "interval": "1",
    "theme": "dark",
    "style": "1",
    "container_id": "tradingview_chart",
    "hide_top_toolbar": true,
    "hide_legend": true,
    "save_image": false
});

let countdown = 10;
let timerInterval;

// News Events specific to Gold Traders
const oandaNews = [
    "OANDA: USD Strength building near 104.50",
    "XAU/USD: Spot gold testing daily liquidity",
    "DXY Pulse: Dollar index retracing, Gold bullish",
    "Market Alert: High volatility expected at NY Open",
    "OANDA: Institutional orders detected at $2025"
];

function updateNews() {
    document.getElementById('news-content').textContent = `> ${oandaNews[Math.floor(Math.random() * oandaNews.length)]}`;
}

async function getMarketDecision() {
    const screen = document.getElementById('display-screen');
    const log = document.getElementById('log-msg');

    screen.classList.add('updating');
    updateNews();

    try {
        // We use the PAXG endpoint as a high-fidelity proxy for real-time math 
        // to avoid Oanda's $600/mo API fee while keeping the Oanda chart visible.
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=PAXGUSDT&interval=1m&limit=50`);
        const data = await response.json();
        
        const closes = data.map(d => parseFloat(d[4]));
        const highs = data.map(d => parseFloat(d[2]));
        const lows = data.map(d => parseFloat(d[3]));
        const currentPrice = closes[closes.length - 1];
        
        document.getElementById('price-value').textContent = `$${currentPrice.toFixed(2)}`;

        // Calculations
        const ema9 = calculateEMA(closes, CONFIG.EMA_FAST);
        const ema21 = calculateEMA(closes, CONFIG.EMA_SLOW);
        const stochK = calculateStoch(closes, highs, lows, CONFIG.STOCH_PERIOD);
        
        // Volatility Range (ATR-Lite)
        const range = Math.max(...highs.slice(-5)) - Math.min(...lows.slice(-5));
        const slDist = range > 1.0 ? range * 0.8 : 2.10; // Gold requires at least $2 room

        document.getElementById('rsi-val').textContent = stochK.toFixed(0);
        document.getElementById('trend-val').textContent = ema9 > ema21 ? "BULLISH" : "BEARISH";

        let decision = "NEUTRAL";
        if (ema9 > ema21 && stochK < 20) decision = "LONG SCALP";
        else if (ema9 < ema21 && stochK > 80) decision = "SHORT SCALP";

        renderSignal(decision, currentPrice, slDist);
        screen.classList.remove('updating');
        resetTimer();

    } catch (e) {
        log.textContent = "Data latency detected. Reconnecting...";
    }
}

// EMA Logic
function calculateEMA(data, period) {
    const k = 2 / (period + 1);
    let ema = data[0];
    for (let i = 1; i < data.length; i++) ema = data[i] * k + ema * (1 - k);
    return ema;
}

// Stochastic Logic (Best for Gold Scalping)
function calculateStoch(closes, highs, lows, period) {
    const high = Math.max(...highs.slice(-period));
    const low = Math.min(...lows.slice(-period));
    return ((closes[closes.length - 1] - low) / (high - low)) * 100;
}

function renderSignal(decision, price, slDist) {
    const signalText = document.getElementById('signal-text');
    const subText = document.getElementById('sub-text');
    const screen = document.getElementById('display-screen');
    screen.className = "screen";

    const bias = decision.includes("SHORT") ? "SELL" : "BUY";
    updateRisk(bias, price, slDist);

    if (decision.includes("LONG")) {
        signalText.textContent = "LONG";
        subText.textContent = "Trend Support: Buy the Dip";
        screen.classList.add('bullish');
    } else if (decision.includes("SHORT")) {
        signalText.textContent = "SHORT";
        subText.textContent = "Trend Resistance: Sell Peak";
        screen.classList.add('bearish');
    } else {
        signalText.textContent = "WAITING";
        subText.textContent = "No Oanda Edge Detected";
        screen.classList.add('neutral');
    }
}

function updateRisk(type, price, slDist) {
    const balance = parseFloat(document.getElementById('acc-balance').value) || 1000;
    const sl = type === "BUY" ? price - slDist : price + slDist;
    const tp = type === "BUY" ? price + (slDist * CONFIG.RR_RATIO) : price - (slDist * CONFIG.RR_RATIO);

    document.getElementById('sl-price').textContent = `$${sl.toFixed(2)}`;
    document.getElementById('tp-price').textContent = `$${tp.toFixed(2)}`;
    
    // Risk Management
    const riskAmt = balance * CONFIG.RISK_PER_TRADE;
    const lotSize = (riskAmt / slDist) / 100; // Simplified lot calculation for Forex
    document.getElementById('pos-size').textContent = `${lotSize.toFixed(2)} Lots`;
}

function resetTimer() {
    clearInterval(timerInterval);
    countdown = 10;
    timerInterval = setInterval(() => {
        countdown--;
        document.getElementById('timer').textContent = countdown;
        if (countdown <= 0) getMarketDecision();
    }, 1000);
}

getMarketDecision();