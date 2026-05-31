const CACHE_NAME = "music-assets";
const blobCache = new Map<string, string>();

export async function getCachedUrl(url: string): Promise<string> {
  if (blobCache.has(url)) return blobCache.get(url)!;
  try {
    const cache = await caches.open(CACHE_NAME);
    let response = await cache.match(url);
    if (!response) {
      response = await fetch(url, { mode: "cors" });
      if (!response.ok) return url;
      await cache.put(url, response.clone());
    }
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    blobCache.set(url, blobUrl);
    return blobUrl;
  } catch {
    return url;
  }
}

export async function preCacheAll(urls: string[]): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  const cache = await caches.open(CACHE_NAME).catch(() => null);
  if (!cache) return map;
  const results = await Promise.allSettled(
    urls.map(async (url) => {
      if (!url) return;
      let response = await cache.match(url);
      if (!response) {
        response = await fetch(url, { mode: "cors" });
        if (!response.ok) return;
        await cache.put(url, response.clone());
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      blobCache.set(url, blobUrl);
      map[url] = blobUrl;
    })
  );
  for (const r of results) {
    if (r.status === "rejected" && process.env.NODE_ENV === "development")
      console.warn("[cache-music] preCacheAll failed for some URL", r.reason);
  }
  return map;
}
