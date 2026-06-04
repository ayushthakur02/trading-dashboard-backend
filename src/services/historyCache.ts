const TTL_MS = 30_000; // 30 seconds

interface CacheEntry {
  data: string;
  expiresAt: number;
}

class HistoryCache {
  private store = new Map<string, CacheEntry>();

  get(key: string): string | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key: string, data: string) {
    this.store.set(key, { data, expiresAt: Date.now() + TTL_MS });
  }

  invalidate(symbol: string) {
    for (const key of this.store.keys()) {
      if (key.startsWith(`${symbol}:`)) this.store.delete(key);
    }
  }

  get size() {
    return this.store.size;
  }
}

export const historyCache = new HistoryCache();
