/** Build/commit info injected by GitHub Actions at build time.
 *  Falls back to current time for local development. */

export const buildTime =
  process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString();

export const commitDate =
  process.env.NEXT_PUBLIC_COMMIT_DATE || "";

export const commitSha =
  process.env.NEXT_PUBLIC_COMMIT_SHA || "";
