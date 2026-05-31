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

export default function Home() {
  return (
    <div>
      <Hero />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="columns-1 sm:columns-2 xl:columns-3 animate-fade-in-up"
          style={{ columnGap: "1.5rem" }}
        >
          <div className="break-inside-avoid mb-6">
            <ProfileCard />
          </div>
          <div className="break-inside-avoid mb-6">
            <SocialLinks />
          </div>
          <div className="break-inside-avoid mb-6">
            <ClockCard />
          </div>
          <div className="break-inside-avoid mb-6">
            <GitHubStats />
          </div>
          <div className="break-inside-avoid mb-6">
            <GitHubGrass />
          </div>
          <div className="break-inside-avoid mb-6">
            <WakatimeCard />
          </div>
          <div className="break-inside-avoid mb-6">
            <WakaAICard />
          </div>
          <div className="break-inside-avoid mb-6">
            <MonkeytypeCard />
          </div>
          <div className="break-inside-avoid mb-6">
            <ReposCard />
          </div>
          <div className="break-inside-avoid mb-6">
            <LastFmStatus />
          </div>

          <div className="break-inside-avoid mb-6">
            <OsuSignature />
          </div>

          <div className="break-inside-avoid mb-6">
            <WeatherCard />
          </div>
          <div className="break-inside-avoid mb-6">
            <EarthquakeCard />
          </div>
          <div className="break-inside-avoid mb-6">
            <BlogPosts />
          </div>
          <div className="break-inside-avoid mb-6">
            <GalleryCard />
          </div>
          <div className="break-inside-avoid mb-6">
            <BusuanziStats />
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
