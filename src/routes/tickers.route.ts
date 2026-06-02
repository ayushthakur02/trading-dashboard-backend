import { Router } from 'express';
import { simulator } from '../services/marketSimulator';

const router = Router();

router.get('/', (_req, res) => {
  res.json(simulator.getCurrentPrices());
});

router.get('/:symbol/history', (req, res) => {
  const { symbol } = req.params;
  const limit = Math.min(parseInt(req.query['limit'] as string) || 100, 500);

  const candles = simulator.getHistory(symbol, limit);
  if (!candles) {
    res.status(404).json({ error: `Ticker '${symbol}' not found` });
    return;
  }

  res.set('Cache-Control', 'public, max-age=60');
  res.json(candles);
});

export default router;
