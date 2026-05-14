import type { Metadata } from "next";
import Script from "next/script";
import { Background } from "@/components/Background";
import { GlobalAudioProvider } from "@/components/GlobalAudio";
import { I18nInit } from "@/components/I18nInit";
import { ShortcutsPanel } from "@/components/ShortcutsPanel";
import { siteConfig } from "@/config";
import "./globals.css";

const title = "Silentnrtx - Personal Homepage";
const description =
  "Silentnrtx's personal homepage. GitHub stats, Last.fm scrobbles, music player, weather, blog, and more.";
const pageUrl = "https://silentnrtx.top/Silentnrtx/";
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.profile.name,
  url: pageUrl,
  image: siteConfig.seo.image,
  sameAs: [
    siteConfig.social.github.url,
    siteConfig.social.twitter.url,
    siteConfig.social.bilibili.url,
    siteConfig.social.soundcloud.url,
    siteConfig.social.bandcamp.url,
    siteConfig.social.lastfm.url,
    siteConfig.social.osu.url,
    siteConfig.social.blog.url,
  ].filter(Boolean),
};

export const metadata: Metadata = {
  title,
  description,
  authors: [{ name: siteConfig.profile.name }],
  keywords: [siteConfig.profile.name, "developer", "portfolio", "osu!", "designer", "vibecoding"],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: pageUrl,
    siteName: title,
    title,
    description,
    images: [{ url: siteConfig.seo.image, width: 400, height: 400, alt: title }],
  },
  twitter: { card: "summary_large_image", title, description, images: [siteConfig.seo.image] },
  robots: { index: true, follow: true },
  alternates: { canonical: pageUrl },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="style" href={FONT_URL} crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.github.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script id="font-loader" strategy="afterInteractive">
          {`var el=document.querySelector('link[href="${FONT_URL}"][rel="preload"]');if(el)el.rel='stylesheet';`}
        </Script>
      </head>
      <body>
        <I18nInit />
        <GlobalAudioProvider>
          <Background />
          <ShortcutsPanel />
          <main>{children}</main>
        </GlobalAudioProvider>
      </body>
    </html>
  );
}
