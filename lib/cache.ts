import { CACHE_PREFIXES } from "@/lib/cache-config";

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
    if (process.env.NODE_ENV === "development") console.warn("[cache] getCache error", key);
    return null;
  }
}

export function setCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    if (process.env.NODE_ENV === "development") console.warn("[cache] setCache error", key);
  }
}

export function getCacheTime(key: string): number | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return (JSON.parse(raw) as { ts: number }).ts;
  } catch {
    return null;
  }
}

export function clearAllCache(): void {
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (CACHE_PREFIXES.some((p) => key.startsWith(p))) {
        localStorage.removeItem(key);
      }
    }
    window.dispatchEvent(new CustomEvent("cache-cleared"));
  } catch {
    if (process.env.NODE_ENV === "development") console.warn("[cache] clearAllCache error");
  }
}
