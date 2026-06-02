import WebSocket from 'ws';
import type { Ticker, WsIncomingMessage, WsOutgoingMessage } from '../types/market';
import { simulator } from './marketSimulator';

class BroadcastService {
  private subs = new Map<WebSocket, Set<string>>();

  registerClient(ws: WebSocket) {
    this.subs.set(ws, new Set());

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString()) as WsIncomingMessage;
        const set = this.subs.get(ws);
        if (!set) return;

        if (msg.action === 'subscribe') {
          msg.symbols.forEach(s => set.add(s.toUpperCase()));
        } else if (msg.action === 'unsubscribe') {
          msg.symbols.forEach(s => set.delete(s.toUpperCase()));
        }
      } catch {
        // ignore bad messages
      }
    });

    ws.on('close', () => this.subs.delete(ws));
    ws.on('error', () => this.subs.delete(ws));
  }

  broadcast(symbol: string, ticker: Ticker) {
    const payload = JSON.stringify({
      type: 'tick',
      symbol: ticker.symbol,
      price: ticker.price,
      change: ticker.change,
      changePercent: ticker.changePercent,
      volume: ticker.volume,
      timestamp: ticker.timestamp,
    } satisfies WsOutgoingMessage);

    for (const [client, set] of this.subs) {
      if (client.readyState === WebSocket.OPEN && set.has(symbol)) {
        client.send(payload);
      }
    }
  }
}

export const broadcastService = new BroadcastService();

simulator.onTick((symbol, ticker) => broadcastService.broadcast(symbol, ticker));
