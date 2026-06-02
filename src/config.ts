import type { TickerConfig } from './types/market';

export const PORT = Number(process.env.PORT) || 4000;

export const TICKERS: TickerConfig[] = [
  { symbol: 'AAPL',    name: 'Apple Inc.',       basePrice: 182,   volatility: 0.002  },
  { symbol: 'TSLA',    name: 'Tesla Inc.',        basePrice: 250,   volatility: 0.004  },
  { symbol: 'MSFT',    name: 'Microsoft Corp.',   basePrice: 415,   volatility: 0.0015 },
  { symbol: 'GOOGL',   name: 'Alphabet Inc.',     basePrice: 175,   volatility: 0.0018 },
  { symbol: 'NVDA',    name: 'NVIDIA Corp.',      basePrice: 875,   volatility: 0.005  },
  { symbol: 'AMZN',    name: 'Amazon.com Inc.',   basePrice: 185,   volatility: 0.002  },
  { symbol: 'BTC-USD', name: 'Bitcoin USD',       basePrice: 65000, volatility: 0.008  },
  { symbol: 'ETH-USD', name: 'Ethereum USD',      basePrice: 3200,  volatility: 0.007  },
];

export const TICK_INTERVAL_MS = 1000;
export const HISTORY_CANDLES  = 200;
