<p align="center">
  <a href="README.md">English</a> | <a href="README_CN.md">中文</a>
</p>

# Silentnrtx Homepage

[![Deploy to GitHub Pages](https://github.com/Chinasd1st/Silentnrtx/actions/workflows/deploy.yml/badge.svg)](https://github.com/Chinasd1st/Silentnrtx/actions/workflows/deploy.yml)
[![GitHub Release](https://img.shields.io/github/v/release/Chinasd1st/Silentnrtx?include_prereleases&label=release)](https://github.com/Chinasd1st/Silentnrtx/releases)

Personal homepage with Material Design 3–like style, built entirely with **Vibe Coding** using **DeepSeek V4 Flash** via [opencode](https://opencode.ai).

> **Live**: [https://silentnrtx.top/Silentnrtx/](https://silentnrtx.top/Silentnrtx/)
>
> **Repo**: [Chinasd1st/Silentnrtx](https://github.com/Chinasd1st/Silentnrtx)

---

## Design

- **Material Design 3–like** — 24px rounded elevated cards, `oklch()` dynamic color palette driven by a single `--md-hue` variable
- **Always-dark first** — dark mode default, automatic light mode follows `prefers-color-scheme`, plus manual toggle (☀️ / 🌙 / 🖥️)
- **Glassmorphism background** — Bing daily wallpaper with `backdrop-filter` blur (disabled in light mode)
- **Masonry waterfall layout** — CSS `columns`, cards auto-flow by content height
- **Pure CSS animations** — no JavaScript animation libraries

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + Turbopack |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3 + CSS Custom Properties |
| Icons | react-icons (FontAwesome / Simple Icons) |
| L10n | react-i18next (zh-CN / en-US, browser auto-detect) |
| Build | `output: "export"` — fully static |
| Deploy | GitHub Pages at `/Silentnrtx` subpath |
| CI/CD | GitHub Actions (push → build → deploy) |

## Data Sources (100% client-side, no server)

| Source | Data | Auth |
|---|---|---|
| GitHub REST API | Repos, stars, forks, followers | Public |
| github-contributions-api | Contribution heatmap | Public |
| Last.fm API | Now playing / recent scrobbles | API Key |
| wttr.in | Real-time weather (auto IP) | Public |
| Meting API (injaho) | Netease Cloud Music playlist + player | Public |
| Monkeytype API | Typing speed personal bests | Public |
| WakaTime Embed JSON | Coding activity + AI vibecoding stats | Embeddable JSON |
| JMA / CEA Earthquake API | Latest seismic info (Japan & China) | Public |
| Bing Daily Wallpaper | Glassmorphism page background | Public |
| RSS2JSON | Blog posts feed | Public |
| Busuanzi | Page views & visitors counter | Script embed |
| Steam Web API | Gaming status (optional) | API Key |

## Features

- Hero parallax scroll
- 8-platform social card grid
- GitHub stats + contribution grass
- Last.fm scrobbling status
- osu! signature embed
- Netease music player (global audio, prev/next, progress bar)
- 7-day weather
- Blog RSS reader
- Monkeytype typing stats
- WakaTime coding activity + AI stats
- JMA & CEA earthquake monitor (tab switch)
- Photo gallery lightbox (`createPortal`)
- Clock (UTC+8, SVG analog + digital + decorative face)
- Keyboard shortcuts panel (`?`)
- Three-state theme switch (light / dark / system)
- zh-CN / en-US i18n
- Site visitor stats
- Build time + commit SHA in footer
- Version tag from GitHub releases

## Getting Started

```bash
npm ci
npm run dev     # dev server at localhost:3000
npm run build   # static export to ./out/
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```env
NEXT_PUBLIC_LAST_FM_API_KEY=
NEXT_PUBLIC_LAST_FM_USERNAME=silentnrtx
NEXT_PUBLIC_STEAM_API_KEY=
```

> All `NEXT_PUBLIC_*` variables are embedded in the client bundle. Only use read-only public keys.

For WakaTime, see [WAKATIME_SETUP.md](./WAKATIME_SETUP.md).

## Vibe Coding

This entire project was generated through conversational AI pair-programming using **DeepSeek V4 Flash** via the opencode CLI. Every component, config, style, and deployment workflow was iterated collaboratively — no manually typed boilerplate, just prompt, review, and commit.

---

Built with Next.js · Material Design 3–like · ☕ vibe coding
