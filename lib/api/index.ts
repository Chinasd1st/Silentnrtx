import axios, { type AxiosError } from "axios";

export const api = axios.create({ timeout: 8000 });

export async function fetchWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (axios.isCancel(err)) throw err;
      if (i === maxRetries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error("api_error");
}

export function mapApiError(err: unknown): Error {
  const e = err as AxiosError;
  const status = e.response?.status;
  if (status === 403 || status === 429) return new Error("rate_limit");
  if (status === 404) return new Error("not_found");
  if (e.code === "ECONNABORTED" || !e.response) return new Error("network_error");
  return new Error("api_error");
}
