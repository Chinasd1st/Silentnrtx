import { BlogPosts } from "@/components/features/blog/BlogPosts";
import { GalleryCard } from "@/components/features/gallery/GalleryCard";
import { ProfileCard } from "@/components/features/profile/ProfileCard";
import { OsuSignature } from "@/components/features/social/OsuSignature";
import { ReposCard } from "@/components/features/social/ReposCard";
import { SocialLinks } from "@/components/features/social/SocialLinks";
import { MonkeytypeCard } from "@/components/features/stats/coding/MonkeytypeCard";
import { WakaAICard } from "@/components/features/stats/coding/WakaAICard";
import { WakatimeCard } from "@/components/features/stats/coding/WakatimeCard";
import { GitHubGrass } from "@/components/features/stats/github/GitHubGrass";
import { GitHubStats } from "@/components/features/stats/github/GitHubStats";
import { LastFmStatus } from "@/components/features/stats/media/LastFmStatus";
import { BusuanziStats } from "@/components/features/stats/widgets/BusuanziStats";
import { ClockCard } from "@/components/features/stats/widgets/ClockCard";
import { EarthquakeCard } from "@/components/features/stats/widgets/EarthquakeCard";
import { WeatherCard } from "@/components/features/stats/widgets/WeatherCard";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/layout/Hero";

const CARD_MAP: Record<string, React.ReactNode> = {
  ProfileCard: <ProfileCard />,
  SocialLinks: <SocialLinks />,
  ClockCard: <ClockCard />,
  GitHubStats: <GitHubStats />,
  GitHubGrass: <GitHubGrass />,
  WakatimeCard: <WakatimeCard />,
  WakaAICard: <WakaAICard />,
  MonkeytypeCard: <MonkeytypeCard />,
  ReposCard: <ReposCard />,
  LastFmStatus: <LastFmStatus />,
  OsuSignature: <OsuSignature />,
  WeatherCard: <WeatherCard />,
  EarthquakeCard: <EarthquakeCard />,
  BlogPosts: <BlogPosts />,
  GalleryCard: <GalleryCard />,
  BusuanziStats: <BusuanziStats />,
};

export default function Home() {
  return (
    <div>
      <Hero />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="columns-1 sm:columns-2 xl:columns-3" style={{ columnGap: "1.5rem" }}>
          {[
            "ProfileCard",
            "SocialLinks",
            "ClockCard",
            "GitHubStats",
            "GitHubGrass",
            "WakatimeCard",
            "WakaAICard",
            "MonkeytypeCard",
            "ReposCard",
            "LastFmStatus",
            "OsuSignature",
            "WeatherCard",
            "EarthquakeCard",
            "BlogPosts",
            "GalleryCard",
            "BusuanziStats",
          ].map((name, i) => (
            <div
              key={name}
              className="break-inside-avoid mb-6"
              style={{
                opacity: 0,
                animation: `fade-in-up 0.5s ease-out ${i * 0.06}s forwards`,
              }}
            >
              {CARD_MAP[name]}
            </div>
          ))}
        </div>

        <Footer />
      </div>
    </div>
  );
}
