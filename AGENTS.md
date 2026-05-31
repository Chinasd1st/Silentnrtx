# Project Overview

Personal homepage built with Next.js 16 (App Router), TypeScript, and Tailwind CSS v4.
Material Design 3–like design system, fully static export, deployed to GitHub Pages.

## Tech Stack

| Layer           | Choice                                                                            |
| --------------- | --------------------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router) + Turbopack                                               |
| Language        | TypeScript (strict)                                                               |
| Styling         | Tailwind CSS v4 + CSS Custom Properties                                           |
| Icons           | react-icons (FontAwesome / Simple Icons)                                          |
| L10n            | react-i18next (zh-CN / en-US, browser auto-detect)                                |
| Build           | `output: "export"` — fully static                                                 |
| Deploy          | GitHub Pages at `/Silentnrtx` subpath                                             |
| Images          | Custom `OptimizedImage` component (AVIF/WebP responsive srcset, blur placeholder) |
| CI/CD           | GitHub Actions (push → build → deploy)                                            |
| Package Manager | pnpm 10                                                                           |

## Commands

- `pnpm run dev` — start dev server at localhost:3000
- `pnpm run build` — static export to `./out/`
- `pnpm run lint` — run Biome lint + format on all files
- Before committing, run `pnpm build && pnpm lint` and ensure both report zero errors.
- Before pushing, run `pnpm tsc --noEmit && pnpm lint` to verify types and formatting.

## Component Conventions

- All dynamic components are `"use client"`.
- Functional components with hooks only (no class components).
- Import order: React → third-party → `@/components/**` → `@/lib/**` → `@/config`.
- Card rounding: `rounded-[16px]` (not `rounded-md3-sm`).
- Hover pattern on containers: `hover:bg-white/6 transition-all duration-200`.
- Subcard hover (title highlight on card hover): `group` on container + `group-hover:text-[var(--md-primary)] transition-all duration-200` on title element. Use className (not inline style) for title color so `group-hover` overrides correctly.
- Modals use `createPortal` into `document.body`.
- All `<button>` elements should have `type="button"`.

## Images

- Static local images: use `OptimizedImage` component (auto AVIF/WebP, responsive srcset, blur placeholder).
- Remote/dynamic images (music covers, Last.fm art, Osu! sig): use `<img>` with `loading="lazy"` and `onError` handler.
- Wallpaper `Background`: loads async via API + state (implicitly deferred).

## i18n

- All UI text uses `t()` from `useTranslation()` (exception: "Vibe Coding" branding).
- `toLocaleString() / toLocaleDateString()` always receives `i18n.language` as first arg.
- New i18n keys go in both `locales/en-US.json` and `locales/zh-CN.json`.
- Keys use dot notation: `section.key`.
- Prefer interpolation: `t("key", { param: value })`.

## TypeScript

- Strict mode — no `any` unless absolutely necessary.
- Use `unknown` with explicit casts instead of `any`.
- Define interfaces for API responses and component props.
- `useMemo` for derived data, `useCallback` for stable function references.
- `React.memo` for list items (e.g., `SongItem`).

## CSS / Design Tokens

- Use `--md-*` CSS custom properties for theming (`oklch()` with `--md-hue`).
- Text hierarchy: `--md-text-primary` → `--md-text-secondary` → `--md-text-muted`.
- `prefers-reduced-motion` handled globally in `globals.css`.
- Inline `style={{ color: "var(--md-*)" }}` is the project convention for dynamic colors.

## Accessibility

- Global `:focus-visible` in `globals.css`.
- Icons without text need `aria-label`.
- Dynamic content updates: `aria-live="polite"`.
- Decorative images: `alt=""` + `aria-hidden="true"`.

## Audio (GlobalAudio)

- Provider in `components/audio/GlobalAudio.tsx`, accessed via `useGlobalAudio()`.
- Context exposes: `play`, `pause`, `resume`, `seek`, `preload`, `setVolume`, `setOnEnded`.
- Preload first track: call `audio.preload(url)` after songs load (sets `el.src` + `el.load()` without autoplay).
- Progress bar drag: use `setPointerCapture` on `onPointerDown`, read clientX in `onPointerMove` during drag. Remove `transition` during drag (`dragging ? "none" : "width 0.5s cubic-bezier(0.2, 0, 0, 1)"`).

## Data Fetching & Caching

- Axios instance in `lib/api/index.ts` (8s timeout).
- GitHub: custom Axios instance in `lib/api/github.ts` with ETag/If-None-Match via interceptors.
- `fetchWithRetry` wrapper for automatic retry.
- `getCache` / `setCache` in `lib/cache.ts` with TTLs from `lib/cache-config.ts`.
- Cache keys for music: `CACHE_KEYS.WAKATIME = "wakatime"`.
- API base pattern: `config.ts` holds `api` + `params` for each feature.

## MusicPlayer (Netease Playlist)

- API: `https://api.i-meto.com/meting/api?server=netease&type=playlist&id={id}` returns array.
- Response fields: `title` → `name`, `author` → `artist`, `url` → `url`, `pic` → `pic`, `lrc` → `lrc`.
- `SongItem` is `React.memo`'d, renders album cover (`song.pic`) with play/pause overlay on selected.

## Project Structure

```text
components/
  audio/       — GlobalAudio provider
  dialogs/     — SettingsCard, ShortcutsPanel
  ui/          — Card, CardHeader, ExternalLink, I18nInit, OptimizedImage, PillButton, Skeleton, ThemeSwitch, ErrorCard, CachedAt, etc.
  layout/      — Hero, Footer
  features/
    blog/          — BlogPosts RSS reader
    gallery/       — GalleryCard lightbox
    profile/       — ProfileCard
    music/         — MusicPlayer
    background/    — Background (wallpaper)
    social/        — SocialLinks, ReposCard, OsuSignature
    release/       — ReleaseModal (version check)
    stats/
      coding/      — WakatimeCard, WakaAICard, MonkeytypeCard
      github/      — GitHubStats, GitHubGrass
      media/       — LastFmStatus
      widgets/     — ClockCard, WeatherCard, EarthquakeCard, BusuanziStats
```

## Important Conventions

- `WakatimeCard` and `WakaAICard` share `CACHE_KEY = "wakatime"` in localStorage.
- Both cards independently read the same cache; `WakaAICard` does not re-fetch.
- Activity bars use a single `rounded-[16px] p-3 space-y-1` container with `--md-primary-008`.
- AI stats use 2×2 StatBox grids + full-width CostBox, all `--md-primary` value color.
- The AI tab in `WakatimeCard` is always rendered in DOM (invisible when inactive) to prevent CSS column reflow.
- Progress bar fill: `pointer-events: none` so track receives pointer events.

## Development Rules

Project rules are stored in `.ai/rules/`:

- [commit-convention.md](.ai/rules/commit-convention.md) — Commit message format
- [release.md](.ai/rules/release.md) — Release workflow (tag, gh CLI, changelog)
- [coding-standards.md](.ai/rules/coding-standards.md) — TypeScript, i18n, component, CSS, a11y conventions

Key points:

- API keys go in `.env.local`, never hardcoded.
- Only use read-only public keys — all `NEXT_PUBLIC_*` variables are embedded in client bundle.
- Biome is configured in `biome.json` — do not bypass checks with inline disables unless necessary.
- All commands use `pnpm` (never `npm`, `npx`, or `yarn`).

## Forbidden Patterns (Do NOT add)

- **Content-Security-Policy (CSP)**: This is a static export (`output: "export"`) deployed to GitHub Pages. CSP `<meta>` tags break inline script execution required by Next.js/Umami analytics. Never add `httpEquiv="Content-Security-Policy"` anywhere.
- **Next.js API Routes**: The project uses `output: "export"` (fully static). API Routes require a Node.js server and will not work. Proxy API keys through static build-time data fetching instead.
- **`dompurify` / `isomorphic-dompurify`**: Do NOT install additional DOMPurify packages. The project already uses `isomorphic-dompurify` in `Footer.tsx` for `dangerouslySetInnerHTML` sanitization. If you see `dangerouslySetInnerHTML` in any new code, either avoid it entirely or reuse the existing DOMPurify import pattern.
- **Playback state caching**: Do NOT persist music playback state (selected index, currentTime, playing/paused) to localStorage or any storage. Refresh should reset the player to initial state.
- **Rounded corner clipping**: When placing elements inside a container with `border-radius` + `overflow: hidden`, ensure no content sits at the edge where the corner curve clips. Add sufficient `padding` (at least matching the radius) on the affected sides. This applies to last/first child elements in scrollable lists, progress bars, footers, etc.
