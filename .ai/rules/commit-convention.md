# Commit Convention

## Format

```
<type>: <description>
```

Types:

| Type | Usage |
|---|---|
| `feat` | New feature, new component |
| `fix` | Bug fix |
| `refactor` | Code restructuring, no behavior change |
| `style` | Styling changes only (Tailwind, CSS) |
| `docs` | Documentation (README, comments) |
| `chore` | Maintenance (deps, tooling) |
| `ci` | CI/CD workflow changes |
| `perf` | Performance optimization |
| `test` | Adding or updating tests |

## Examples from this repo

```
feat: WakaAICard, component restructuring, UI refinements
fix: correct theme hue initialization and reset on Default toggle
refactor: migrate workflow from npm to pnpm
chore(deps): bump axios from 1.16.0 to 1.16.1
ci(deps): bump actions/deploy-pages from 4 to 5
```

## Rules

- One commit per logical change group (squash before pushing if needed)
- Keep descriptions concise but descriptive
- Use lowercase, no period at end
- Dependency bumps use `chore(deps):` scope
- CI bumps use `ci(deps):` scope
- Multiple changes in one commit: comma-separate in description
