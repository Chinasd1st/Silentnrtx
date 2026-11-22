# Silentnrtx — homepage

A small static site: home, about, gallery and contact. Astro + React + Tailwind CSS v4, Material 3 color roles and motion with its own personality, English / 中文.

小型静态站：首页、关于、画廊、联系方式。Astro + React + Tailwind CSS v4，以 Material 3 的配色角色和动效为骨架、加入个人化处理，中英双语。

## Commands / 命令

All commands go through Python — no PowerShell needed. 所有命令都用 Python 执行。

```text
python tasks.py doctor     # check Node.js (>= 22.23.4) and pnpm
python tasks.py install    # pnpm install
python tasks.py dev        # http://localhost:4321
python tasks.py build      # static output in dist/
python tasks.py preview
```

## Routes / 路由

| English | 中文 | Page |
|---|---|---|
| `/` | `/zh/` | Home 首页 |
| `/about/` | `/zh/about/` | About 关于 |
| `/gallery/` | `/zh/gallery/` | Gallery 画廊 |
| `/contact/` | `/zh/contact/` | Contact 联系方式 |

The language switch keeps you on the same page. First-time visitors whose browser language is Chinese are sent to the `/zh/` version; a manual choice is remembered.

## Where to edit / 改哪里

| What | File |
|---|---|
| Gallery images 画廊图片 | `src/assets/gallery/design/`, `src/assets/gallery/photo/` |
| Gallery captions 画廊说明（可选） | `src/data/gallery.ts` |
| Accounts 账号 | `src/data/profile.ts` |
| UI copy 界面文案 (en / zh) | `src/i18n/ui.ts` |
| Colors, type, motion 配色 / 字体 / 动效 | `src/styles/global.css` (`--md-hue` re-tints everything 改它就能换整站色相) |

### Gallery / 画廊

Drop jpg / png / webp / avif files into `src/assets/gallery/design/` or `src/assets/gallery/photo/`. Nothing else is required: at build time each image becomes AVIF/WebP in several widths, plus a large version that opens on click. File names decide the order (descending), so `2026-11-22-cover.jpg` puts the newest first. To add a title or year, add an entry keyed by file name in `src/data/gallery.ts`.

图片直接放进上面两个文件夹即可，不用改代码。构建时自动生成多尺寸 AVIF/WebP 和点击查看的大图。文件名倒序排列，用日期开头最方便。想加标题或年份，在 `src/data/gallery.ts` 里按文件名添加。

## Assets / 资源

Avatar 头像: `src/assets/avatar.png`. At build time it becomes AVIF/WebP in several sizes plus the favicons, all with hashed file names so browsers cache them. 换头像只需替换这个文件。

Fonts: Google Sans Flex (weight axis only) for Latin text; 思源黑体 (Source Han Sans) for Chinese — a locally installed copy is used first, otherwise Noto Sans SC (the same typeface) is served in small subsets.

## Deploy / 部署

Repository `Chinasd1st/Silentnrtx`, published as a GitHub Pages project site at **https://silentnrtx.top/Silentnrtx/** (`base: "/Silentnrtx/"` in `astro.config.mjs`). `.github/workflows/deploy.yml` builds every pull request and deploys every push to `main`. All internal links go through `href()` in `src/i18n/ui.ts`, so they follow `base`.

仓库 `Chinasd1st/Silentnrtx`，以 GitHub Pages 项目站点发布在 **https://silentnrtx.top/Silentnrtx/**。PR 只构建检查，合并到 `main` 自动部署。

The previous Next.js version is kept at tag `v1.10.0`. 旧版 Next.js 站点保留在 tag `v1.10.0`。
