import type { Metadata } from "next";
import Script from "next/script";
import { GlobalAudioProvider } from "@/components/audio/GlobalAudio";
import { ShortcutsPanel } from "@/components/dialogs/ShortcutsPanel";
import { Background } from "@/components/features/background/Background";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { I18nInit } from "@/components/ui/I18nInit";
import { siteConfig } from "@/config";
import { basePath } from "@/lib/base-path";
import "./globals.css";

const title = "Silentnrtx - Personal Homepage";
const description =
  "Silentnrtx's personal homepage. GitHub stats, Last.fm scrobbles, music player, weather, blog, and more.";
const pageUrl = `${siteConfig.seo.url.replace(/\/+$/, "")}${basePath}/`;
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap";

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
    <html
      lang="zh-CN"
      suppressHydrationWarning
      style={{ "--md-hue": String(siteConfig.theme.hue) } as React.CSSProperties}
    >
      <head>
        {siteConfig.background.enabled && siteConfig.background.imageUrl && (
          <link
            rel="preload"
            as="image"
            href={
              siteConfig.background.imageUrl.startsWith("/")
                ? `${basePath}${siteConfig.background.imageUrl}`
                : siteConfig.background.imageUrl
            }
            fetchPriority="high"
          />
        )}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="style" href={FONT_URL} crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.github.com" />
        <Script
          id="json-ld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script id="font-loader" strategy="afterInteractive">
          {`var el=document.querySelector('link[href="${FONT_URL}"][rel="preload"]');if(el)el.rel='stylesheet';`}
        </Script>
        <Script
          id="lang-detection"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var n=localStorage.getItem("md-lang")||navigator.language||"zh-CN";n=n.toLowerCase().replace(/_/g,"-");var l=n.indexOf("zh")===0?(n.indexOf("tw")>-1||n.indexOf("hk")>-1||n.indexOf("mo")>-1||n.indexOf("hant")>-1?"zh-TW":"zh-CN"):n.indexOf("ja")===0?"ja":n.indexOf("en")===0?"en-US":"zh-CN";var h={"zh-CN":"zh-CN","zh-TW":"zh-Hant","en-US":"en","ja":"ja"},o={"zh-CN":"zh_CN","zh-TW":"zh_TW","en-US":"en_US","ja":"ja_JP"};document.documentElement.lang=h[l];var m=document.querySelector('meta[property="og:locale"]');if(m)m.setAttribute("content",o[l])}catch(e){}})()`,
          }}
        />
        <Script
          async
          defer
          data-website-id={siteConfig.analytics.umami.id}
          data-exclude-hash={siteConfig.analytics.umami.excludeHash ? "true" : undefined}
          data-auto-track={siteConfig.analytics.umami.autoTrack ? "true" : undefined}
          src={siteConfig.analytics.umami.scriptUrl}
          strategy="afterInteractive"
        />
        <Script
          src={`https://www.clarity.ms/tag/${siteConfig.analytics.clarity.id}`}
          strategy="afterInteractive"
        />
      </head>
      <body>
        <I18nInit />
        <GlobalAudioProvider>
          <Background />
          <ShortcutsPanel />
          <main>{children}</main>
        </GlobalAudioProvider>
        <CustomCursor />
      </body>
    </html>
  );
}
