const ETAG_PREFIX = "gh_etag_";
const DATA_PREFIX = "gh_etag_data_";

export function getETag(url: string): string | null {
  try {
    return localStorage.getItem(ETAG_PREFIX + url);
  } catch {
    return null;
  }
}

export function setETag(url: string, etag: string): void {
  try {
    localStorage.setItem(ETAG_PREFIX + url, etag);
  } catch {
    /* noop */
  }
}

export function getCachedResponse<T>(url: string): T | null {
  try {
    const raw = localStorage.getItem(DATA_PREFIX + url);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setCachedResponse<T>(url: string, data: T): void {
  try {
    localStorage.setItem(DATA_PREFIX + url, JSON.stringify(data));
  } catch {
    /* noop */
  }
}
