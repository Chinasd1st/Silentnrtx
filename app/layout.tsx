import type { Metadata } from "next";
import { Background } from "@/components/Background";
import { I18nInit } from "@/components/I18nInit";
import { GlobalAudioProvider } from "@/components/GlobalAudio";
import { ThemeInit } from "@/components/ThemeInit";

// 注意：所有 NEXT_PUBLIC_* 环境变量在静态导出中会嵌入浏览器 JS bundle。
// 涉及的 API Key：Last.fm、Monkeytype ApeKey、Steam Web API Key
// 这些均为只读公开数据，风险可控。如需隐藏 Key 需搭建后端代理。
import { siteConfig } from "@/config";
import "./globals.css";

const title = "Silentnrtx";
const description = "Silentnrtx's personal homepage.";

export const metadata: Metadata = {
  title, description,
  authors: [{ name: siteConfig.profile.name }],
  keywords: [siteConfig.profile.name],
  openGraph: {
    type: "website", locale: "en_US", url: siteConfig.seo.url,
    siteName: title, title, description,
    images: [{ url: siteConfig.seo.image, width: 400, height: 400, alt: title }],
  },
  twitter: { card: "summary_large_image", title, description, images: [siteConfig.seo.image] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.loli.net" />
        <link rel="preconnect" href="https://api.github.com" />
        <link rel="preconnect" href="https://ws.audioscrobbler.com" />
        <link rel="preconnect" href="https://wttr.in" />
        <link rel="preconnect" href="https://api.injahow.cn" />
        <link rel="preconnect" href="https://api.monkeytype.com" />
      </head>
      <body>
        <I18nInit />
        <ThemeInit />
        <GlobalAudioProvider>
          <Background />
          <main>{children}</main>
        </GlobalAudioProvider>
      </body>
    </html>
  );
}
