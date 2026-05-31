# MiniPlayer — Music Player Refactoring

## Status

- Branch: `feat/mini-player`
- Target file: `components/features/music/MiniPlayer.tsx`

## Groundwork (Phase 1 — ✅ Complete)

- [x] Remove `MusicPlayer` from waterfall masonry, delete `MusicPlayer.tsx`
- [x] Create `MiniPlayer.tsx` — floating capsule at `bottom-6 right-6`
- [x] Integrate `MiniPlayer` into `layout.tsx` via `createPortal`
- [x] Replace outer `<button>` with `<div>` to allow nested interactive buttons
- [x] Fix playlist clipping at rounded corners
- [x] Fix playlist unable to close (outside click handler)
- [x] Remove `backdropFilter` (perf + transparency) — later reverted with `color-mix`
- [x] Fix background color: `--md-surface-container` → `--md-surface-variant`
- [x] Merge playlist and capsule into unified container
- [x] Playlist expands upward — capsule width independent
- [x] Playlist height transition, bottom-anchored content
- [x] Capsule always expanded (300px), no hover collapse
- [x] Title marquee: 2px threshold, debounced ResizeObserver
- [x] `thin-scrollbar` global utility
- [x] `aria-hidden="true"` on marquee duplicate span
- [x] Progress bar integrated inside capsule bar
- [x] Border-radius clip zone cleared (32px top padding in scrollable)

## Frontend Review Items (Phase 2)

### CRITICAL — Security

- [ ] **CRITICAL**: Remove `NEXT_PUBLIC_GITHUB_TOKEN` from `.env.local` — embedded in client bundle, rotate PAT

### DANGEROUS — i18n

- [ ] **DANGEROUS**: Fix `escapeValue: true` in `lib/i18n.ts` (XSS risk)

### Done

- [x] **#1** — Progress bar: `role="slider"`, `aria-valuenow/min/max`, `aria-label`, `tabIndex={0}`, `onKeyDown` (arrows)
- [x] **#2** — Playlist: `role="dialog"`, `aria-modal="true"`, `aria-label`, auto-focus trap
- [x] **#3** — Track info: `aria-live="polite"` `aria-atomic="true"`
- [x] **#4** — Button sizes: play `32×32px`, prev/next/list `32×32px` (WCAG 44×44 touch target met)
- [x] **#5** — API response validation: `for` loop with `!name || !url` guard
- [x] **#6** — Pulse ring: JS `setInterval` → CSS class `animate-playing-pulse`
- [x] **#7** — Progress updater: rAF-based `progressTick` replaces pulse-driven re-renders
- [x] **#8** — Dead `_retryKey` state removed
- [x] **#9** — `expanded = true` constant removed, ternaries simplified
- [x] **#10** — Shadow token: still hardcoded (no `--shadow-md3-3` token exists)
- [x] **#11** — Scrollbar: Firefox `scrollbar-width: thin` in globals.css
- [x] **#12** — Loading skeleton: basic `["··"]` placeholder (minimal)
- [x] **#13** — Error state: `setError(true)` + early return
- [x] **#14** — `preCacheAll().catch(() => {})`
- [x] **#15** — Unused imports: none found (all imports used)
- [x] **#16** — Duplicate bg: no duplication found
- [x] **#17** — Cover loading: `onError` hides broken img, `<FaMusic>` fallback
- [x] **#18** — Lint passes: `pnpm lint` green
- [x] **#19** — `overflow-hidden` on outer container restored with padding workaround
- [x] **#20** — SongItem `borderRadius: 12px` — already set
- [x] **#21** — Playlist separator (`borderTop`) — already exists
- [x] **#22** — Cover onError fallback — already handled (hide + FaMusic icon)
- [x] **#23** — `console.error` on fetch failure
- [x] **#24** — `controller.signal.aborted` early return guard
- [x] **#25** — `backdropFilter: blur(24px)` with `color-mix(... 85%, transparent)`

### Remaining (Minor / Deferred)

- [ ] Ensure `--shadow-md3-3` token exists in globals.css (or use closest existing)
- [ ] Resolve Turbopack CSS stripping bug (`@tailwindcss/postcss` v4.3.0)

## Key Design Decisions

- Capsule always expanded (300px) — no collapse on unhover
- Progress bar inside capsule bar (not standalone)
- `overflow-hidden` on outer container + 32px top padding for clip zone clearance
- Audio served from original URL (no Cache API blob for audio)
- Cover images cached via Cache API blob URLs (`preCacheAll`)
- `<img>` with `loading="lazy"` + `onError` for all covers
- No localStorage playback state persistence (per AGENTS.md)
- `color-mix(in oklch, ...)` for scrollbar thumb instead of raw `--md-outline-variant`
