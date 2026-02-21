Gold-Pulse Pro: Oanda XAU/USD Decision Engine
Gold-Pulse Pro is a lightweight, high-performance web terminal built for 1-minute gold scalping. It leverages the Oanda spot price for charting and uses a multi-factor indicator scoring system (Stochastic + Dual EMA) to identify high-probability entries in real-time.

⚡ Key Features
Oanda Live Feed: Real-time charting using Oanda’s specific market data for accurate spreads and wicks.

Scalp-Logic Engine: * Trend Filter: Uses a 9/21 EMA Ribbon to ensure you never trade against the micro-trend.

Momentum Trigger: Employs a Fast Stochastic (5,3,3) Oscillator to catch pullbacks within a trend.

Position Architect: * Automatic Lot Calculation: Instantly calculates Forex Lot sizes based on your account balance and a 2% risk rule.

Dynamic SL/TP: Stop-loss and Take-profit levels are calculated based on 5-minute volatility ranges.

USD News Pulse: A simulated high-impact news ticker that monitors catalysts affecting Dollar strength and Gold volatility.

10-Second Refresh: High-frequency polling ensures you catch entries before the 1-minute candle closes.

🛠️ Technical Stack
Frontend: HTML5, CSS3 (Flexbox/Grid), JavaScript (ES6+).

Charting: TradingView Lightweight Charts (Oanda Source).

API: Binance/PAXG WebSocket Proxy for high-fidelity technical math.


📈 Scalping Strategy Logic
The terminal issues a signal based on "Trend-Following Reversions":

LONG: 9 EMA > 21 EMA AND Stochastic %K < 20.

SHORT: 9 EMA < 21 EMA AND Stochastic %K > 80.

NEUTRAL: If the EMAs are flat or the Stochastic is in the "Gray Zone" (20-80).

⚠️ Disclaimer
This tool is for educational and analytical purposes only. Trading Gold (XAU/USD) involves significant risk. The "Decision Engine" is a mathematical model based on technical indicators and does not guarantee financial profit. Always use a demo account before trading live capital.

🤝 Contributing
Feel free to fork this project and submit Pull Requests. I am currently looking to add:

Real-time DXY (Dollar Index) correlation math.

Audio alerts for signal triggers.

Persistent PnL tracking using LocalStorage.
