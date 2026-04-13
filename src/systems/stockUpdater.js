import fs from 'fs';
import path from 'path';

const STOCKS_FILE = path.resolve('src/storage/stocks.json');

function loadStocks() {
    if (!fs.existsSync(STOCKS_FILE)) return {};
    return JSON.parse(fs.readFileSync(STOCKS_FILE, 'utf-8') || '{}');
}

function saveStocks(data) {
    fs.writeFileSync(STOCKS_FILE, JSON.stringify(data, null, 2));
}

function updateStocks() {
    const stocks = loadStocks();

    for (const id in stocks) {
        const stock = stocks[id];

        if (!stock.price) continue;

        const history = stock.history || [];

        const volatility = stock.volatility ?? 0.02;

        const randomShock = (Math.random() - 0.5) * volatility;

        const trend = (stock.trend ?? 0) * 0.002;

        const eventRoll = Math.random();
        let event = 0;

        if (eventRoll < 0.01) event = 0.05;
        else if (eventRoll > 0.99) event = -0.05;

        const last = history.slice(-20);
        const avg =
            last.length > 0
                ? last.reduce((a, b) => a + b, 0) / last.length
                : stock.price;

        const meanReversion = ((avg - stock.price) / (stock.price + 1)) * 0.05;

        let demand = stock.demandPressure ?? 0;
        demand = Math.tanh(demand);

        const demandScale = 0.02 / (1 + Math.sqrt(stock.price));
        demand *= demandScale;

        const drift = -0.0015;

        let change =
            randomShock +
            trend +
            event +
            meanReversion +
            demand +
            drift;

        const cap = 0.08;

        change = Math.max(-cap, Math.min(change, cap));

        stock.price *= (1 + change);

        stock.price = Math.max(stock.minPrice || 1, stock.price);
        stock.price = Number(stock.price.toFixed(2));

        if (!stock.history) stock.history = [];
        stock.history.push(stock.price);

        if (stock.history.length > 50) {
            stock.history.shift();
        }

        stock.demandPressure = (stock.demandPressure ?? 0) * 0.88;

        stock.demandPressure = Math.max(-3, Math.min(3, stock.demandPressure));
    }

    saveStocks(stocks);
}

export function startStockUpdater() {
    setInterval(() => {
        updateStocks();
        console.log('📈 Stocks updated');
    }, 15 * 1000);
}