<p align="center">
  <a href="README.md">English</a> | <a href="README_CN.md">中文</a>
</p>

# Silentnrtx Homepage

[![Deploy to GitHub Pages](https://github.com/Chinasd1st/Silentnrtx/actions/workflows/deploy.yml/badge.svg)](https://github.com/Chinasd1st/Silentnrtx/actions/workflows/deploy.yml)
[![GitHub Release](https://img.shields.io/github/v/release/Chinasd1st/Silentnrtx?include_prereleases&label=release)](https://github.com/Chinasd1st/Silentnrtx/releases)

Personal homepage with Material Design 3–like style, built entirely with **Vibe Coding** using **DeepSeek V4 Flash** via [opencode](https://opencode.ai).

> **Live**: [https://chinasd1st.github.io/Silentnrtx/](https://chinasd1st.github.io/Silentnrtx/)
>
> **Repo**: [Chinasd1st/Silentnrtx](https://github.com/Chinasd1st/Silentnrtx)

---

## Design

- **Material Design 3–like** — 24px rounded elevated cards, `oklch()` dynamic color palette driven by a single `--md-hue` variable
- **Always-dark first** — dark mode default, automatic light mode follows `prefers-color-scheme`, plus manual toggle (☀️ / 🌙 / 🖥️)
- **Glassmorphism background** — Bing daily wallpaper with `backdrop-filter` blur
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

## Data Sources (100% client-side, no backend)

| Source | Data |
|---|---|
| GitHub REST API | Repos, stars, forks, followers |
| github-contributions-api | Contribution heatmap (grass) |
| Last.fm API | Now playing / recent scrobbles |
| wttr.in | Real-time weather (auto IP) |
| Meting API (injaho) | Netease Cloud Music playlist + player |
| Monkeytype API | Typing speed personal bests |
| Bing Daily Wallpaper | Glassmorphism page background |
| JMA / CEA Earthquake API | Latest seismic info |
| RSS2JSON | Blog posts feed |
| Busuanzi | Page views & visitors counter |
| Steam Web API | Gaming status (optional) |

## Features

- Hero parallax scroll
- 6-platform social card grid
- GitHub stats + contribution grass
- Last.fm scrobbling status
- osu! signature embed
- Netease music player (global audio, prev/next, progress bar)
- 7-day weather forecast
- Blog RSS reader
- Monkeytype typing stats
- JMA & CEA earthquake monitor
- Photo gallery lightbox
- Clock (UTC+8, SVG analog + digital)
- Keyboard shortcuts panel (`?`)
- Dark/light/auto theme switch
- zh-CN / en-US i18n
- Site visitor stats
- Build timestamp in footer

## Getting Started

```bash
# Install
npm ci

# Dev server
npm run dev

# Build static export
npm run build
# Output in ./out/
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```env
NEXT_PUBLIC_LAST_FM_API_KEY=
NEXT_PUBLIC_LAST_FM_USERNAME=silentnrtx
NEXT_PUBLIC_STEAM_API_KEY=
```

> All `NEXT_PUBLIC_*` variables are embedded in the client bundle. Only use read-only public keys.

## Vibe Coding

This entire project was generated through conversational AI pair-programming using **DeepSeek V4 Flash** via the opencode CLI. Every component, config, style, and deployment workflow was iterated collaboratively — no manually typed boilerplate, just prompt, review, and commit.

---

Built with Next.js · Material Design 3–like · ☕ vibe coding
