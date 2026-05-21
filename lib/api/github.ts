import axios from "axios";

const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

export const githubApi = axios.create({
  baseURL: "https://api.github.com",
  timeout: 8000,
  headers: {
    Accept: "application/vnd.github.v3+json",
    ...(token ? { Authorization: `token ${token}` } : {}),
  },
});
