# Commit Convention

## Format

```
<type>: <description>
```

```
feat: add header brand tooltip on hover
fix: autosave missing on theme switch
refactor: extract ProfileCard stats to subcomponent
chore(deps): bump axios from 1.16.0 to 1.16.1
```

Types:

| Type | Usage |
|---|---|
| `feat` | New feature, new component |
| `fix` | Bug fix |
| `refactor` | Code restructuring, no behavior change |
| `style` | Pure formatting, CSS-only beautification (no logic change) |
| `docs` | Documentation (README, comments, rules) |
| `chore` | Maintenance (deps, tooling) |
| `revert` | Rollback a previous commit |
| `ci` | CI/CD workflow changes |
| `perf` | Performance optimization |
| `test` | Adding or updating tests |

## Scope (optional)

Use a scope in parentheses to narrow the change area:

| Scope | When | Example |
|---|---|---|
| `(deps)` | Production dependency bump | `chore(deps): bump axios from 1.0.0 to 1.1.0` |
| `(deps-dev)` | Dev dependency bump | `chore(deps-dev): update typescript` |
| `(ui)` or `(components)` | Shared UI component change | `refactor(ui): extract ProfileCard stats to subcomponent` |
| `(views)` or `(pages)` | Page/route-level change | `feat(views): add gallery lightbox page` |
| `(store)` or `(hooks)` | State management or custom Hook | `feat(hooks): add useMediaQuery hook` |
| `(theme)` | Theme system, CSS vars, dark mode | `style(theme): adjust md-surface contrast` |
| `(release)` | Release changelog / rule update | `docs(release): update changelog conventions` |

## Type Boundaries

Keep the intent pure — don't use `style` as a catch-all:

| Intent | Use type |
|---|---|
| Implementing a new design spec (with new markup + styles) | `feat` |
| Fixing layout shift, visual bug, or CSS specificity issue | `fix` |
| Renaming CSS class, tweaking color, formatting code (logic unchanged) | `style` |
| Refactoring CSS structure (e.g. extracting variables) with no visual diff | `refactor` |

**Revert** follows a strict format that references the original commit:

```
revert: feat: add MusicPlayer progress bar

This reverts commit a1b2c3d.
```

## Commit Granularity

**Each logical change gets its own commit.** Different features, components, or concerns MUST NOT be mixed in a single commit:

```
❌ Bad:
feat: add MusicPlayer and fix WakaAICard spacing

✅ Good:
feat: add MusicPlayer progress bar with pointer capture
fix: WakaAICard spacing inconsistent with WakatimeCard
```

Rationale: independent commits allow selective revert, clean code review, and accurate changelog generation.

## Message Style

- Use **imperative mood** ("add", "fix", "extract" — not "added", "fixed", "extracted")
- Write in **English**
- No period at end of subject line
- Keep subject **under 72 characters**, ideally under 50
- If a body is needed (motivation, trade-offs), separate with a blank line, wrap at 72 chars

## Before Committing

```bash
git diff --cached   # review what's staged
```

Verify your staged changes contain only what you intend — no stray debug logs, commented-out code, or accidental file additions.

## History & Pushing

- **Rebase, don't merge**: keep linear history on `main`. Rebase feature branches before merging: `git rebase origin/main`
- **Squash fixups** before pushing: `git rebase -i` to squash "oops" commits into their logical parent
- **Never force-push `main`** — use `--force-with-lease` on branches if needed, never on shared branches
- **Never amend commits already pushed to `main`** — push a new fix commit instead
- **Reference issues/PRs in the commit body** when the change addresses a specific ticket:
  ```
  fix: correct theme hue on page load

  Closes #42
  ```

## What NOT to commit

- Secrets, API keys, `.env.local`
- Generated files (`out/`, `.next/`, `node_modules/`)
- Large binary assets
- IDE/editor config that differs from project conventions
- Debug `console.log` or commented-out code

---

## 🛠️ Tooling & Enforcement

The following toolchain automatically enforces conventions at commit time, so humans don't have to police them.

### 1. Pre-commit: auto-format staged files (`lint-staged` + `husky`)

Before every commit, `lint-staged` runs Biome on all staged `.ts`, `.tsx`, `.js`, `.json`, `.css` files — auto-fixing what it can and rejecting the commit if errors remain.

**Configured in** `package.json`:

```json
"lint-staged": {
  "*.{ts,tsx,js,jsx,mjs,cjs}": ["biome check --write --unsafe"],
  "*.{css,json}": ["biome check --write --unsafe"]
}
```

**Hooked via** `.husky/pre-commit`:

```shell
npx lint-staged
```

### 2. Commit message validation (`commitlint` + `husky`)

`commitlint` checks every message against our type list before the commit finishes. Non-conforming messages are **rejected**:

```shell
echo "foo: some change"    # ✗ rejected — unknown type
echo "feat: add search"    # ✓ accepted
```

Type, scope, and format rules are defined in `commitlint.config.mjs`:

```js
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [2, "always", ["feat", "fix", "refactor", "style", "docs", "chore", "ci", "perf", "test", "revert"]],
  },
};
```

**Hooked via** `.husky/commit-msg`:

```shell
npx --no -- commitlint --edit "$1"
```

### 3. Bypass (use sparingly)

In rare emergencies, skip hooks with `git commit --no-verify` (`-n`). This should be the exception, not the norm.
