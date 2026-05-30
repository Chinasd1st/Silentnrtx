"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface AudioMetadata {
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
}

interface AudioState {
  src: string | null;
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  play: (url: string, meta?: AudioMetadata, resume?: boolean) => void;
  pause: () => void;
  resume: () => void;
  seek: (t: number) => void;
  preload: (url: string) => void;
  setVolume: (v: number) => void;
  setOnEnded: (fn: (() => void) | null) => void;
}

const AudioCtx = createContext<AudioState>(null!);

function setupMediaSession() {
  if (typeof navigator === "undefined" || !navigator.mediaSession) return;

  navigator.mediaSession.setActionHandler("play", () => {
    document.dispatchEvent(new CustomEvent("media-session-play"));
  });
  navigator.mediaSession.setActionHandler("pause", () => {
    document.dispatchEvent(new CustomEvent("media-session-pause"));
  });
  navigator.mediaSession.setActionHandler("previoustrack", () => {
    document.dispatchEvent(new CustomEvent("media-session-previous"));
  });
  navigator.mediaSession.setActionHandler("nexttrack", () => {
    document.dispatchEvent(new CustomEvent("media-session-next"));
  });
}

export function GlobalAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVol] = useState(0.7);
  const [_metadata, setMetadata] = useState<AudioMetadata | null>(null);
  const onEndedRef = useRef<(() => void) | null>(null);
  const mediaSessionSetup = useRef(false);

  useEffect(() => {
    const el = new Audio();
    el.volume = 0.7;
    el.addEventListener("timeupdate", () => setCurrentTime(el.currentTime));
    el.addEventListener("loadedmetadata", () => setDuration(el.duration));
    el.addEventListener("play", () => {
      setPlaying(true);
      if (navigator.mediaSession) navigator.mediaSession.playbackState = "playing";
    });
    el.addEventListener("pause", () => {
      setPlaying(false);
      if (navigator.mediaSession) navigator.mediaSession.playbackState = "paused";
    });
    el.addEventListener("ended", () => {
      setPlaying(false);
      if (navigator.mediaSession) navigator.mediaSession.playbackState = "none";
      onEndedRef.current?.();
    });
    audioRef.current = el;

    if (!mediaSessionSetup.current) {
      mediaSessionSetup.current = true;
      setupMediaSession();
    }

    return () => {
      el.pause();
      el.src = "";
    };
  }, []);

  const play = useCallback((url: string, meta?: AudioMetadata, resume = false) => {
    const el = audioRef.current;
    if (!el) return;
    const isNewSong = el.src !== url;
    if (isNewSong) {
      el.src = url;
      setSrc(url);
      setDuration(0);
    }
    if (!resume || isNewSong) {
      el.currentTime = 0;
      setCurrentTime(0);
    }
    el.play().catch(() => {
      if (process.env.NODE_ENV === "development") console.warn("[GlobalAudio] play() rejected");
    });

    if (meta && navigator.mediaSession) {
      setMetadata(meta);
      let artworkUrl = meta.artwork;
      if (artworkUrl && !artworkUrl.startsWith("http")) {
        artworkUrl = `https:${artworkUrl}`;
      }
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: meta.title,
          artist: meta.artist,
          album: meta.album,
          artwork: artworkUrl
            ? [{ src: artworkUrl, sizes: "512x512", type: "image/jpeg" }]
            : undefined,
        });
      } catch (e) {
        console.warn("MediaSession metadata error:", e);
      }
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);
  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => {
      if (process.env.NODE_ENV === "development") console.warn("[GlobalAudio] resume() rejected");
    });
  }, []);
  const seek = useCallback((t: number) => {
    if (audioRef.current) audioRef.current.currentTime = t;
  }, []);
  const preload = useCallback((url: string) => {
    const el = audioRef.current;
    if (!el) return;
    if (el.src !== url) {
      el.src = url;
      setSrc(url);
      setDuration(0);
      el.load();
    }
  }, []);

  const setVolume = useCallback((v: number) => {
    setVol(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);
  const setOnEnded = useCallback((fn: (() => void) | null) => {
    onEndedRef.current = fn;
  }, []);

  const value = useMemo<AudioState>(
    () => ({
      src,
      playing,
      currentTime,
      duration,
      volume,
      play,
      pause,
      resume,
      seek,
      preload,
      setVolume,
      setOnEnded,
    }),
    [
      src,
      playing,
      currentTime,
      duration,
      volume,
      play,
      pause,
      resume,
      seek,
      preload,
      setVolume,
      setOnEnded,
    ]
  );

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

export function useGlobalAudio() {
  return useContext(AudioCtx);
}
