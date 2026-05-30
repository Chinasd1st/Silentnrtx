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

### 1. Ensure latest main

```bash
git checkout main
git pull origin main --rebase
```

This guarantees the tag anchors on the absolute latest commit, avoiding a stale tag that points behind the remote.

### 2. Commit version bump (if applicable)

If `package.json` version needs updating, commit it as a chore:

```bash
git add package.json
git commit -m "chore: bump version to v<version>"
git push
```

All feature/fix/refactor commits should already exist as atomic commits from development — do NOT lump them into a single "description of all changes" commit here.

Ensure the Pre-release Checklist passes before tagging.

### 3. Tag and push tag

```bash
git tag v<version>      # e.g. git tag v1.2.0
git push origin v<version>
```

Tags MUST match `v<X>.<Y>.<Z>` or `v<X>.<Y>.<Z>-<label>.<N>`.

### 4. Create GitHub Release via gh CLI

Body is written in Chinese. Write release content to a temp file first, then use it:

```powershell
$body = @'
<release body in markdown>
'@
[System.IO.File]::WriteAllLines("$env:TEMP\release-body.md", $body, [System.Text.UTF8Encoding]::new($false))
gh release create v<version> --title "v<version>" --notes-file "$env:TEMP\release-body.md"
```

> **Encoding note:** Windows PowerShell 5.1's `-Encoding UTF8` writes a BOM (Byte Order Mark `EF BB BF`). Even `[System.IO.File]::WriteAllLines` with `[System.Text.Encoding]::UTF8` writes BOM in .NET Framework. Use `[System.Text.UTF8Encoding]::new($false)` (the `$false` parameter disables BOM) to write clean BOM-less UTF-8:
>
> ```powershell
> $body = @'
> <release body in markdown>
> '@
> [System.IO.File]::WriteAllLines("$env:TEMP\release-body.md", $body, [System.Text.UTF8Encoding]::new($false))
> gh release create v<version> --title "v<version>" --notes-file "$env:TEMP\release-body.md"
> ```

### Release Note Template (Chinese)

List items under each h3 section MUST use conventional-commit-type prefixes (`fix`, `feat`, `chore`, `deps`, etc.) followed by a colon + space. These will be rendered as colored badges in the UI (no colon displayed). Scopes are supported and rendered after the badge: `- docs(commit): refine` → **`docs`**`(commit): refine`.

Code references (component names, file paths, API endpoints, variable names, etc.) MUST be wrapped in backticks `` ` ``.

**PR Hashtag & Commit SHA auto-linking:** The ReleaseModal component (`preprocessBody`) automatically converts `#N` (N ≤ 4 digits, e.g. `#30`) and 7-digit hex SHA (e.g. `44ba7fe`) into GitHub links. Write them **without backticks** so the markdown link renders correctly — otherwise the link syntax inside inline code (`` `[44ba7fe](url)` ``) will display as literal text instead of a clickable link.

| Feature | Write as | Renders as |
|---------|----------|------------|
| PR link | `(#30)` | `(#30)` → link |
| Commit link | `(44ba7fe)` | `(44ba7fe)` → link |
| ❌ Wrong | `` (`#30`) `` | Hidden literal text |
| ❌ Wrong | `` (`44ba7fe`) `` | Hidden literal text |

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
- feat: 自定义 `ComponentName` 组件

### 修复
- fix: <Description>
- fix: `useFoo` 钩子返回空值问题
- deps: <Description>

### 重构
- refactor: `lib/bar.ts` 提取公共逻辑

### 其他
- chore: Build and tooling changes
- chore: Biome 代码质量检查通过（0 errors, 0 warnings）
- chore: TypeScript 编译通过
```

### 5. Verify

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
