<p align="center">
  <a href="README.md">English</a> | <a href="README_CN.md">中文</a>
</p>

# Silentnrtx 个人主页

[![Deploy to GitHub Pages](https://github.com/Chinasd1st/Silentnrtx/actions/workflows/deploy.yml/badge.svg)](https://github.com/Chinasd1st/Silentnrtx/actions/workflows/deploy.yml)
[![GitHub Release](https://img.shields.io/github/v/release/Chinasd1st/Silentnrtx?include_prereleases&label=%E7%89%88%E6%9C%AC)](https://github.com/Chinasd1st/Silentnrtx/releases)

基于 Material Design 3–like 的个人主页，全程通过 **Vibe Coding** 使用 **DeepSeek V4 Flash** 配合 [opencode](https://opencode.ai) 生成。

> **在线地址**: [https://silentnrtx.top/Silentnrtx/](https://silentnrtx.top/Silentnrtx/)
>
> **仓库**: [Chinasd1st/Silentnrtx](https://github.com/Chinasd1st/Silentnrtx)

---

## 设计风格

- **Material Design 3–like** — 24px 圆角卡片、`oklch()` 动态配色，由单个 `--md-hue` 变量驱动全局色板
- **深色优先** — 默认深色模式，跟随系统 `prefers-color-scheme` 自动切换浅色，支持手动三档切换（☀️ / 🌙 / 🖥️）
- **毛玻璃背景** — Bing 每日壁纸 + `backdrop-filter` 模糊（浅色模式自动关闭）
- **瀑布流布局** — CSS `columns`，卡片高度自适应排列
- **纯 CSS 动画** — 未引入任何 JavaScript 动画库

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 16 (App Router) + Turbopack |
| 语言 | TypeScript (strict) |
| 样式 | Tailwind CSS v3 + CSS Custom Properties |
| 图标 | react-icons (FontAwesome / Simple Icons) |
| 本地化 | react-i18next (zh-CN / en-US，浏览器自动检测) |
| 构建 | `output: "export"` — 纯静态导出 |
| 部署 | GitHub Pages，子路径 `/Silentnrtx` |
| CI/CD | GitHub Actions (push → 构建 → 部署) |

## 数据源（全客户端，无服务器）

| 来源 | 数据 | 鉴权 |
|---|---|---|
| GitHub REST API | 仓库数、Star、Fork、粉丝 | 公开 |
| github-contributions-api | 贡献热力图 | 公开 |
| Last.fm API | 正在播放 / 最近听歌 | API Key |
| wttr.in | 实时天气（自动 IP） | 公开 |
| Meting API (injaho) | 网易云歌单 + 播放器 | 公开 |
| Monkeytype API | 打字速度最佳记录 | 公开 |
| WakaTime Embed JSON | 编码活动 + AI 数据 | Embed JSON |
| JMA / CEA 地震 API | 日本 / 中国地震情报 | 公开 |
| Bing 每日壁纸 | 毛玻璃背景 | 公开 |
| RSS2JSON | 博客文章 | 公开 |
| 不蒜子 | 页面访问量 & 访客数 | Script |
| Steam Web API | 游戏状态（可选） | API Key |

## 功能模块

- Hero 视差滚动
- 8 平台社交卡片
- GitHub 统计 + 贡献热力图
- Last.fm 听歌状态
- osu! 签名嵌入
- 网易云音乐播放器（全局音频、上一首/下一首、进度条）
- 实时天气
- 博客 RSS 阅读
- Monkeytype 打字统计
- WakaTime 编码活动 + AI 数据
- JMA & CEA 地震情报（标签切换）
- 图片灯箱（createPortal）
- 时钟（UTC+8，SVG 模拟 + 数字 + 装饰圆盘）
- 快捷键面板（按 `?` 打开）
- 三态主题切换（☀️ / 🌙 / 🖥️）
- 中英文 i18n
- 站点访问统计
- 构建时间 + commit SHA
- Release 版本号标签

## 本地开发

```bash
npm ci
npm run dev     # 启动开发服务器 localhost:3000
npm run build   # 构建静态导出到 ./out/
```

### 环境变量

复制 `.env.example` 为 `.env.local`，填入你的 API Key：

```env
NEXT_PUBLIC_LAST_FM_API_KEY=
NEXT_PUBLIC_LAST_FM_USERNAME=silentnrtx
NEXT_PUBLIC_STEAM_API_KEY=
```

> 所有 `NEXT_PUBLIC_*` 变量会嵌入客户端 JS 包，请仅使用只读公开密钥。

WakaTime 配置见 [WAKATIME_SETUP.md](./WAKATIME_SETUP.md)。

## Vibe Coding

本项目全程通过对话式 AI 结对编程生成，使用 **DeepSeek V4 Flash** 通过 opencode CLI。每一个组件、配置、样式和部署流程都是协作迭代的结果——没有手动敲模板代码，只有提示、审查和提交。

---

Built with Next.js · Material Design 3–like · ☕ vibe coding
