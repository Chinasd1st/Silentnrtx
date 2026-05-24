# Release Process

## Versioning

Follow **Semantic Versioning (SemVer)**: `v<major>.<minor>.<patch>`.

All three parts MUST be non-negative integers without leading zeros. Once a version is released, it MUST NOT be modified — any change requires a new version.

| Bump | When | Example |
|---|---|---|
| **major** | Breaking changes, redesign, incompatible API changes | `v2.0.0` |
| **minor** | New features, new components, backward-compatible | `v1.2.0` |
| **patch** | Bug fixes, dependency updates, style tweaks | `v1.1.1` |

### Pre-release Suffixes

Append a hyphen + pre-release label + dot + number for pre-release versions:

| Suffix | Meaning | Example |
|---|---|---|
| `-alpha.N` | Early testing, unstable | `v2.0.0-alpha.1` |
| `-beta.N` | Feature-complete, testing | `v1.2.0-beta.2` |
| `-rc.N` | Release candidate | `v1.2.0-rc.3` |

Pre-release versions have **lower precedence** than the normal version. E.g. `v1.2.0-rc.1` < `v1.2.0`.

### Examples from this repo

```
v1.1.0           — stable release
v1.0.0           — stable release
v1.0.0-rc.7      — release candidate 7
v1.0.0-beta      — beta
```

## Creating a Release

### 1. Commit and push all changes

```bash
git add -A
git commit -m "feat: description of all changes"
git push
```

Ensure the Pre-release Checklist passes before tagging.

### 2. Tag and push tag

```bash
git tag v<version>      # e.g. git tag v1.2.0
git push origin v<version>
```

Tags MUST match `v<X>.<Y>.<Z>` or `v<X>.<Y>.<Z>-<label>.<N>`.

### 3. Create GitHub Release via gh CLI

Body is written in Chinese. Use the Release Note Template:

```bash
gh release create v<version> --title "v<version>" --notes "<body>"
```

### Release Note Template (Chinese)

List items under each h3 section MUST use conventional-commit-type prefixes (`fix`, `feat`, `chore`, `deps`, etc.) followed by a colon + space. These will be rendered as colored badges in the UI (no colon displayed).

Supported types and their badge colors:

| Type | Color | Usage |
|------|-------|-------|
| `fix` | red | Bug fixes |
| `feat` | green | New features |
| `chore` | gray | Maintenance, tooling |
| `deps` | yellow | Dependency updates |
| `refactor` | blue | Code restructuring |
| `perf` | orange | Performance improvements |
| `docs` | teal | Documentation |
| `style` | purple | Code style / formatting |
| `test` | pink | Testing |
| `ci` | cyan | CI/CD changes |
| `build` | indigo | Build system |
| `revert` | red | Reverting changes |

```markdown
### 新增
- feat: <Description>

### 修复
- fix: <Description>
- deps: <Description>

### 重构
- refactor: <Description>

### 其他
- chore: Build and tooling changes
- chore: Biome 代码质量检查通过（0 errors, 0 warnings）
- chore: TypeScript 编译通过
```

### 4. Verify

```bash
gh release view v<version>
```

## CI/CD

Deploy is automatic via `.github/workflows/deploy.yml` — pushing a tag triggers the workflow. Biome CI runs separately via `.github/workflows/biome.yml`.

## Pre-release Checklist

- [ ] `pnpm lint` passes (Biome 0 errors, 0 warnings)
- [ ] `pnpm tsc --noEmit` passes (TypeScript 0 errors)
- [ ] `pnpm build` succeeds
- [ ] All new UI text goes through `t()` i18n
- [ ] AGENTS.md and README are up to date
