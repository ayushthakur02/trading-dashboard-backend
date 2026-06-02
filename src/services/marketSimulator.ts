import type { Candle, Ticker, TickerConfig } from '../types/market';
import { TICKERS, HISTORY_CANDLES, TICK_INTERVAL_MS } from '../config';

function boxMullerRandom(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function nextPrice(price: number, volatility: number): number {
  const z = boxMullerRandom();
  const delta = price * volatility * z;
  return Math.max(price + delta, price * 0.5);
}

interface TickerState {
  config: TickerConfig;
  price: number;
  dayOpen: number;
  volume: number;
  candles: Candle[];
}

export class MarketSimulator {
  private states = new Map<string, TickerState>();
  private listeners: Array<(symbol: string, ticker: Ticker) => void> = [];
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    for (const config of TICKERS) {
      const candles = this.buildHistory(config);
      const last = candles[candles.length - 1]!;
      this.states.set(config.symbol, {
        config,
        price: last.close,
        dayOpen: candles[0]!.open,
        volume: 0,
        candles,
      });
    }
  }

  private buildHistory(config: TickerConfig): Candle[] {
    const candles: Candle[] = [];
    const now = Date.now();
    const candleMs = 60_000;
    let price = config.basePrice;

    for (let i = HISTORY_CANDLES; i >= 0; i--) {
      const time = now - i * candleMs;
      const open = price;
      let high = price;
      let low = price;

      for (let j = 0; j < 4; j++) {
        price = nextPrice(price, config.volatility);
        if (price > high) high = price;
        if (price < low) low = price;
      }

      candles.push({
        time,
        open: round(open),
        high: round(high),
        low: round(low),
        close: round(price),
        volume: Math.floor(Math.random() * 50_000) + 5_000,
      });
    }

    return candles;
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), TICK_INTERVAL_MS);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private tick() {
    for (const [symbol, state] of this.states) {
      const newPrice = round(nextPrice(state.price, state.config.volatility));
      const tickVol = Math.floor(Math.random() * 1_000) + 100;

      state.price = newPrice;
      state.volume += tickVol;

      const lastCandle = state.candles[state.candles.length - 1]!;
      if (newPrice > lastCandle.high) lastCandle.high = newPrice;
      if (newPrice < lastCandle.low) lastCandle.low = newPrice;
      lastCandle.close = newPrice;
      lastCandle.volume += tickVol;

      const change = round(newPrice - state.dayOpen);
      const changePercent = round((change / state.dayOpen) * 100);

      const ticker: Ticker = {
        symbol,
        name: state.config.name,
        price: newPrice,
        change,
        changePercent,
        volume: state.volume,
        timestamp: Date.now(),
      };

      for (const fn of this.listeners) fn(symbol, ticker);
    }
  }

  onTick(fn: (symbol: string, ticker: Ticker) => void) {
    this.listeners.push(fn);
  }

  getCurrentPrices(): Ticker[] {
    return Array.from(this.states.values()).map(s => ({
      symbol: s.config.symbol,
      name: s.config.name,
      price: s.price,
      change: round(s.price - s.dayOpen),
      changePercent: round(((s.price - s.dayOpen) / s.dayOpen) * 100),
      volume: s.volume,
      timestamp: Date.now(),
    }));
  }

  getHistory(symbol: string, limit = 100): Candle[] | null {
    const state = this.states.get(symbol.toUpperCase());
    if (!state) return null;
    return state.candles.slice(-limit);
  }
}

function round(n: number, decimals = 2): number {
  return parseFloat(n.toFixed(decimals));
}

export const simulator = new MarketSimulator();
