import type { IconType } from "react-icons";
import { SiBilibili, SiDiscord, SiGithub, SiLastdotfm, SiOsu, SiX } from "react-icons/si";
import type { PlatformId } from "../data/profile";

export const platformIcons: Record<PlatformId, IconType> = {
  x: SiX,
  github: SiGithub,
  osu: SiOsu,
  bilibili: SiBilibili,
  lastfm: SiLastdotfm,
  discord: SiDiscord,
};
