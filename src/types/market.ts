export interface TickerConfig {
  symbol: string;
  name: string;
  basePrice: number;
  volatility: number;
}

export interface Ticker {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface WsIncomingMessage {
  action: 'subscribe' | 'unsubscribe';
  symbols: string[];
}

export interface WsOutgoingMessage {
  type: 'tick';
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}
