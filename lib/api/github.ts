import axios from "axios";
import { getCachedResponse, getETag, setCachedResponse, setETag } from "./etag";

const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

export const githubApi = axios.create({
  baseURL: "https://api.github.com",
  timeout: 8000,
  headers: {
    Accept: "application/vnd.github.v3+json",
    ...(token ? { Authorization: `token ${token}` } : {}),
  },
});

githubApi.interceptors.request.use((config) => {
  const url = config.url || "";
  const etag = getETag(url);
  if (etag) {
    config.headers.set("If-None-Match", etag);
  }
  return config;
});

githubApi.interceptors.response.use(
  (response) => {
    const url = response.config.url || "";
    if (url) {
      const etag = response.headers.etag;
      if (etag) {
        setETag(url, etag);
        setCachedResponse(url, response.data);
      }
    }
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 304) {
      const url = error.response.config.url || "";
      if (url) {
        const cached = getCachedResponse(url);
        if (cached !== null) {
          return Promise.resolve({ ...error.response, data: cached });
        }
      }
    }
    return Promise.reject(error);
  }
);
