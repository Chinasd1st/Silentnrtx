# AI Coding Standards

## General Rules

- **All commands use `pnpm`** — never `npm`, `npx`, or `yarn`.
- Run `pnpm lint` before any commit (Biome formats + lints).
- Run `pnpm tsc --noEmit` to verify TypeScript before committing.
- Read `AGENTS.md` first for project overview and conventions.

## When the user asks "what did we do so far"

- Update the Anchored Summary in conversation header to reflect current state.
- List completed tasks, in-progress tasks, blocked items, and next steps.
- Keep it concise — bullet points, one line per task.

## Mandatory Post-Edit Workflow

After every batch of code changes, the AI MUST run this checklist **before the next response to the user**.

### Termination Condition

The 4-step cycle runs **at most 2 iterations**. If issues remain after the 2nd pass, stop and report to the user: "仍有 X 个问题需人工介入" with a list of remaining findings. Do NOT loop infinitely.

### Subagent Scope Rule

The subagent MUST base its review only on `git diff` (current branch changes), NOT scan the entire repository. Pass the diff output explicitly in the prompt to keep context size bounded:

```
Review only these changes (from `git diff`):
<diff>
```

### Workflow Steps

1. **Run `pnpm lint`** — Biome formats + lints all files. Fix any errors immediately.
2. **Run `pnpm tsc --noEmit`** — TypeScript strict check. Fix any type errors immediately.
3. **Launch a subagent** with `general` type that performs BOTH of these reviews in one call, scoped to the `git diff` only:
   - Load the `frontend-review` skill and run all 6 passes (Security, A11y, i18n, Quality, Performance, UI/UX)
   - Load the `web-design-engineer` skill and run its review pass (visual consistency, states, design tokens, etc.)
   - Return a consolidated report with all findings
4. **Fix all reported issues** from the consolidated report, then re-run steps 1–2.
5. **Run `pnpm run build`** — Verify static export completes without errors. If it fails, fix and re-run steps 1–2 (counts toward the 2-iteration limit).

The subagent must read only diffed files, run both skill reviews, and return one structured report.

## i18n Rules

- All UI text uses `t()` from `useTranslation()`.
- Exception: "Vibe Coding" branding (intentional, no translation).
- `toLocaleString()` always receives `i18n.language` as first arg.
- New i18n keys go in both `locales/en-US.json` and `locales/zh-CN.json`.
- i18n keys use dot notation: `section.key`.
- Prefer interpolation over string concatenation: `t("key", { param: value })`.

## TypeScript

- Strict mode is enabled — no `any` unless absolutely necessary.
- Use `unknown` with explicit casts instead of `any`.
- Define interfaces for API responses and component props.
- `useMemo` for derived data, `useCallback` for stable function references.

## Component Conventions

- Functional components with hooks only (no class components).
- All dynamic components are `"use client"`.
- Import order: React → third-party → `@/components/` → `@/lib/` → `@/config`.
- Card rounding: `rounded-[16px]` (not `rounded-md3-sm`).
- Hover pattern: `hover:bg-white/6 transition-all duration-200`.
- Modals use `createPortal` into `document.body`.

## CSS / Design Tokens

- Use `--md-*` CSS custom properties for theming.
- Color system: `oklch()` with `--md-hue` variable.
- Text hierarchy: `--md-text-primary` → `--md-text-secondary` → `--md-text-muted`.
- `prefers-reduced-motion` is handled globally in `globals.css`.
- Hover on links: use `.external-link` CSS class or `hover:text-[var(--md-primary)]`.

## Accessibility

- All interactive elements need focus styles. Global `:focus-visible` is in `globals.css`.
- Icons without text need `aria-label`.
- Dynamic content updates use `aria-live="polite"`.
- `<button>` elements should have `type="button"` to prevent form submission.
