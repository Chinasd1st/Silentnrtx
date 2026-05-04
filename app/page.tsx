import { Hero } from "@/components/Hero";
import { ProfileCard } from "@/components/ProfileCard";
import { SocialLinks } from "@/components/SocialLinks";
import { GitHubStats } from "@/components/GitHubStats";
import { GitHubGrass } from "@/components/GitHubGrass";
import { LastFmStatus } from "@/components/LastFmStatus";
import { OsuSignature } from "@/components/OsuSignature";
import { BlogPosts } from "@/components/BlogPosts";
import { GalleryCard } from "@/components/GalleryCard";
import { MusicPlayer } from "@/components/MusicPlayer";
import { WeatherCard } from "@/components/WeatherCard";
import { SteamStatus } from "@/components/SteamStatus";
import { ClockCard } from "@/components/ClockCard";
import { MonkeytypeCard } from "@/components/MonkeytypeCard";
import { BusuanziStats } from "@/components/BusuanziStats";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div>
      <Hero />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="columns-1 sm:columns-2 xl:columns-3" style={{ columnGap: "1.5rem" }}>
          <div className="break-inside-avoid mb-6">
            <ProfileCard />
          </div>
          <div className="break-inside-avoid mb-6">
            <SocialLinks />
          </div>
          <div className="break-inside-avoid mb-6">
            <GitHubStats />
          </div>
          <div className="break-inside-avoid mb-6">
            <GitHubGrass />
          </div>
          <div className="break-inside-avoid mb-6">
            <LastFmStatus />
          </div>
          <div className="break-inside-avoid mb-6">
            <OsuSignature />
          </div>
          <div className="break-inside-avoid mb-6">
            <MusicPlayer />
          </div>
          <div className="break-inside-avoid mb-6">
            <WeatherCard />
          </div>
          <div className="break-inside-avoid mb-6">
            <SteamStatus />
          </div>
          <div className="break-inside-avoid mb-6">
            <ClockCard />
          </div>
          <div className="break-inside-avoid mb-6">
            <MonkeytypeCard />
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
