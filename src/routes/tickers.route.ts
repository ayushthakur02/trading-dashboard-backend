import { Router } from 'express';
import { simulator } from '../services/marketSimulator';
import { historyCache } from '../services/historyCache';

const router = Router();

router.get('/', (_req, res) => {
  res.json(simulator.getCurrentPrices());
});

router.get('/:symbol/history', (req, res) => {
  const { symbol } = req.params;
  const limit = Math.min(parseInt(req.query['limit'] as string) || 100, 500);
  const cacheKey = `${symbol.toUpperCase()}:${limit}`;

  const cached = historyCache.get(cacheKey);
  if (cached) {
    res.set('X-Cache', 'HIT');
    res.set('Cache-Control', 'public, max-age=30');
    res.type('json').send(cached);
    return;
  }

  const candles = simulator.getHistory(symbol, limit);
  if (!candles) {
    res.status(404).json({ error: `Ticker '${symbol}' not found` });
    return;
  }

  const json = JSON.stringify(candles);
  historyCache.set(cacheKey, json);

  res.set('X-Cache', 'MISS');
  res.set('Cache-Control', 'public, max-age=30');
  res.type('json').send(json);
});

export default router;
