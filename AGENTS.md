# Project Overview

Personal homepage built with Next.js 16 (App Router), TypeScript, and Tailwind CSS v4.
Material Design 3–like design system, fully static export, deployed to GitHub Pages.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + Turbopack |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + CSS Custom Properties |
| Icons | react-icons (FontAwesome / Simple Icons) |
| L10n | react-i18next (zh-CN / en-US, browser auto-detect) |
| Build | `output: "export"` — fully static |
| Deploy | GitHub Pages at `/Silentnrtx` subpath |
| CI/CD | GitHub Actions (push → build → deploy) |
| Package Manager | pnpm 10 |

## Project Instructions

- Use `pnpm` for all package management commands.
- `pnpm run dev` — start dev server at localhost:3000
- `pnpm run build` — static export to `./out/`
- `pnpm run lint` — run Biome lint + format on all files
- Before committing, run `pnpm run lint` and ensure Biome reports zero errors.
- TypeScript strict mode is enabled — fix type errors before committing.
- All components are client components (`"use client"`) unless otherwise noted.

## Code Style

- Use functional components with hooks; avoid class components.
- Prefer CSS Custom Properties via `--md-*` variables for theming.
- Use `rounded-[16px]` for card/box rounding (not `rounded-md3-sm`).
- Unified hover pattern: `hover:bg-white/6 transition-all duration-200`.
- Import order: React → third-party → `@/components/**` → `@/lib/**` → `@/config`.
- All UI text must go through `t()` from `useTranslation()` (exception: "Vibe Coding" branding).
- `toLocaleString()` must always receive `i18n.language` as the first argument.
- Use `useMemo` for derived data (e.g., `aiSum` accumulator) to avoid recomputation on re-render.

## Project Structure

```
components/
  audio/       — GlobalAudio provider
  dialogs/     — SettingsCard modal
  features/
    blog/      — BlogPosts RSS reader
    gallery/   — GalleryCard lightbox
    profile/   — ProfileCard
    social/    — SocialLinks, ReposCard, OsuSignature
    stats/
      Coding/  — WakatimeCard, WakaAICard, MonkeytypeCard
      GitHub/  — GitHubStats, GitHubGrass
      MediaStats/ — LastFmStatus, MusicPlayer
      Widgets/ — ClockCard, WeatherCard, EarthquakeCard, BusuanziStats
  layout/      — Hero, Footer
  l10n/        — i18n setup (deprecated, use lib/i18n)
  ui/          — Card, CardHeader, ExternalLink, PillButton, Skeleton, etc.
  widgets/     — ThemeSwitch
```

## Important Conventions

- `WakatimeCard` and `WakaAICard` share `CACHE_KEY = "wakatime"` in localStorage.
- Both cards independently read the same cache; `WakaAICard` does not re-fetch.
- Activity bars use a single `rounded-[16px] p-3 space-y-1` container with `--md-primary-008`.
- AI stats use 2×2 StatBox grids + full-width CostBox, all `--md-primary` value color.
- The AI tab in `WakatimeCard` is always rendered in DOM (invisible when inactive) to prevent CSS column reflow.
- Modals use `createPortal` into `document.body`.

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
