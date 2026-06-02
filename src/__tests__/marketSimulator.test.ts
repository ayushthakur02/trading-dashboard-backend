import { MarketSimulator } from '../services/marketSimulator';

describe('MarketSimulator', () => {
  let sim: MarketSimulator;

  beforeEach(() => {
    sim = new MarketSimulator();
  });

  afterEach(() => {
    sim.stop();
  });

  it('initializes all 8 tickers', () => {
    const prices = sim.getCurrentPrices();
    expect(prices).toHaveLength(8);
  });

  it('each ticker has a positive price', () => {
    const prices = sim.getCurrentPrices();
    for (const t of prices) {
      expect(t.price).toBeGreaterThan(0);
      expect(t.symbol).toBeTruthy();
      expect(t.name).toBeTruthy();
    }
  });

  it('returns history for a known symbol', () => {
    const candles = sim.getHistory('AAPL', 50);
    expect(candles).not.toBeNull();
    expect(candles!.length).toBe(50);
  });

  it('history candles have valid OHLCV values', () => {
    const candles = sim.getHistory('TSLA', 10)!;
    for (const c of candles) {
      expect(c.high).toBeGreaterThanOrEqual(c.low);
      expect(c.open).toBeGreaterThan(0);
      expect(c.close).toBeGreaterThan(0);
      expect(c.volume).toBeGreaterThan(0);
      expect(c.time).toBeGreaterThan(0);
    }
  });

  it('returns null for an unknown symbol', () => {
    expect(sim.getHistory('FAKE')).toBeNull();
  });

  it('respects the limit parameter', () => {
    expect(sim.getHistory('MSFT', 10)!.length).toBe(10);
    expect(sim.getHistory('MSFT', 200)!.length).toBe(200);
  });

  it('fires onTick listeners when running', done => {
    const received: string[] = [];
    sim.onTick((symbol) => received.push(symbol));
    sim.start();

    setTimeout(() => {
      expect(received.length).toBeGreaterThan(0);
      done();
    }, 1200);
  });
});
