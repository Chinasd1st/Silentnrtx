import type { Metadata } from "next";
import { Background } from "@/components/Background";
import { I18nInit } from "@/components/I18nInit";
import { GlobalAudioProvider } from "@/components/GlobalAudio";
import { ShortcutsPanel } from "@/components/ShortcutsPanel";
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" />
        <link rel="preconnect" href="https://api.github.com" />
        <link rel="preconnect" href="https://ws.audioscrobbler.com" />
        <link rel="preconnect" href="https://wttr.in" />
        <link rel="preconnect" href="https://api.injahow.cn" />
        <link rel="preconnect" href="https://api.monkeytype.com" />
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
