// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Deployed as the GitHub Pages project site of Chinasd1st/Silentnrtx → https://silentnrtx.top/Silentnrtx/
  // The base must match the repository name exactly, capital S included.
  site: "https://silentnrtx.top",
  base: "/Silentnrtx/",
  integrations: [react()],
  i18n: {
    defaultLocale: "en",
    locales: ["en", "zh"],
    routing: { prefixDefaultLocale: false },
  },
  image: {
    // 头像等本地图片在构建时用 sharp 转成 AVIF / WebP 多尺寸，文件名带内容哈希，浏览器可长期缓存
    service: { entrypoint: "astro/assets/services/sharp" },
  },
  build: {
    assets: "_astro",
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
