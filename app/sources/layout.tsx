import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Sources · Silentnrtx",
  description: "Every remote feed this homepage reads from, with auth mode and cache TTL.",
  robots: { index: true, follow: true },
};

export default function SourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
