"use client";

import { createContext, useContext, useRef, useState, useCallback, useEffect, useMemo, type ReactNode } from "react";

interface AudioState {
  src: string | null;
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  play: (url: string) => void;
  pause: () => void;
  resume: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
  setOnEnded: (fn: (() => void) | null) => void;
}

const AudioCtx = createContext<AudioState>(null!);

export function GlobalAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVol] = useState(0.7);
  const onEndedRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const el = new Audio();
    el.volume = 0.7;
    el.addEventListener("timeupdate", () => setCurrentTime(el.currentTime));
    el.addEventListener("loadedmetadata", () => setDuration(el.duration));
    el.addEventListener("play", () => setPlaying(true));
    el.addEventListener("pause", () => setPlaying(false));
    el.addEventListener("ended", () => {
      setPlaying(false);
      onEndedRef.current?.();
    });
    audioRef.current = el;
    return () => { el.pause(); el.src = ""; };
  }, []);

  const play = useCallback((url: string) => {
    const el = audioRef.current;
    if (!el) return;
    if (el.src !== url) { el.src = url; setSrc(url); setDuration(0); setCurrentTime(0); }
    el.play().catch(() => {});
  }, []);

  const pause = useCallback(() => { audioRef.current?.pause(); }, []);
  const resume = useCallback(() => { audioRef.current?.play().catch(() => {}); }, []);
  const seek = useCallback((t: number) => { if (audioRef.current) audioRef.current.currentTime = t; }, []);
  const setVolume = useCallback((v: number) => { setVol(v); if (audioRef.current) audioRef.current.volume = v; }, []);
  const setOnEnded = useCallback((fn: (() => void) | null) => { onEndedRef.current = fn; }, []);

  const value = useMemo<AudioState>(() => ({
    src, playing, currentTime, duration, volume,
    play, pause, resume, seek, setVolume, setOnEnded,
  }), [src, playing, currentTime, duration, volume, play, pause, resume, seek, setVolume, setOnEnded]);

  return (
    <AudioCtx.Provider value={value}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useGlobalAudio() {
  return useContext(AudioCtx);
}
