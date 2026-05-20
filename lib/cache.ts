interface CacheEntry<T> {
  data: T;
  ts: number;
}

export function getCache<T>(key: string, ttlMs: number): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.ts > ttlMs) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    if (process.env.NODE_ENV === 'development') console.warn('[cache] getCache error', key);
    return null;
  }
}

export function setCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    if (process.env.NODE_ENV === 'development') console.warn('[cache] setCache error', key);
  }
}
