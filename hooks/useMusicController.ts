"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGlobalAudio } from "@/components/audio/GlobalAudio";
import { siteConfig } from "@/config";
import { api, fetchWithRetry } from "@/lib/api";
import { preCacheAll } from "@/lib/cache-music";

interface Song {
  name: string;
  artist: string;
  url: string;
  pic: string;
  lrc: string;
}

export function useMusicController() {
  const audio = useGlobalAudio();
  const cfg = siteConfig.music;
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [coverCache, setCoverCache] = useState<Record<string, string>>({});
  const [playMode, setPlayMode] = useState<0 | 1 | 2>(0); // 0=repeat-list, 1=repeat-one, 2=shuffle
  const preloadRefs = useRef<HTMLAudioElement[]>([]);

  useEffect(() => {
    if (!cfg.enabled) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const url = `${cfg.api}?server=${encodeURIComponent(cfg.params.server)}&type=${encodeURIComponent(cfg.params.type)}&id=${encodeURIComponent(cfg.params.id)}`;
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    fetchWithRetry(() => api.get<unknown[]>(url, { signal: controller.signal }))
      .then(({ data }) => {
        if (!Array.isArray(data)) throw new Error("invalid");
        const validated: Song[] = [];
        for (const d of data) {
          const item = d as Record<string, unknown>;
          const name = String(item.title ?? "");
          const artist = String(item.author ?? "");
          const url = String(item.url ?? "");
          const pic = String(item.pic ?? "");
          const lrc = String(item.lrc ?? "");
          if (!name || !url) continue;
          validated.push({ name, artist, url, pic, lrc });
        }
        if (controller.signal.aborted) return;
        setSongs(validated);
        setSelectedIdx(0);
        const picUrls = validated.map((s) => s.pic).filter(Boolean);
        preCacheAll(picUrls).then(setCoverCache).catch(() => {});
        if (validated[0]?.url) audio.preload(validated[0].url);
        preloadRefs.current.forEach((el) => { el.pause(); el.src = ""; });
        preloadRefs.current = [];
        for (let i = 1; i < Math.min(3, validated.length); i++) {
          const s = validated[i];
          if (!s?.url) continue;
          const tmp = new Audio();
          tmp.preload = "auto";
          tmp.src = s.url;
          tmp.load();
          preloadRefs.current.push(tmp);
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (process.env.NODE_ENV === "development")
          console.error("[useMusicController] fetch failed:", err);
        setError(true);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setLoading(false);
      });
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
      preloadRefs.current.forEach((el) => { el.pause(); el.src = ""; });
      preloadRefs.current = [];
    };
  }, [cfg.enabled, cfg.api, cfg.params.server, cfg.params.type, cfg.params.id, audio.preload]);

  const playSong = useCallback(
    (idx: number) => {
      const song = songs[idx];
      if (!song?.url) return;
      setSelectedIdx(idx);
      audio.play(song.url, { title: song.name, artist: song.artist, artwork: song.pic });
      preloadRefs.current.forEach((el) => { el.pause(); el.src = ""; });
      preloadRefs.current = [];
      for (let i = 1; i <= 2 && idx + i < songs.length; i++) {
        const s = songs[idx + i];
        if (!s?.url) continue;
        const tmp = new Audio();
        tmp.preload = "auto";
        tmp.src = s.url;
        tmp.load();
        preloadRefs.current.push(tmp);
      }
    },
    [songs, audio]
  );

  const toggle = useCallback(
    (idx: number) => {
      const song = songs[idx];
      if (!song?.url) return;
      if (selectedIdx === idx && audio.playing) audio.pause();
      else if (selectedIdx === idx) audio.resume();
      else playSong(idx);
    },
    [selectedIdx, audio, songs, playSong]
  );

  const cyclePlayMode = useCallback(() => {
    setPlayMode((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
  }, []);

  const pickShuffleIndex = useCallback(
    (current: number): number => {
      if (songs.length <= 1) return current;
      let n: number;
      do {
        n = Math.floor(Math.random() * songs.length);
      } while (n === current);
      return n;
    },
    [songs.length]
  );

  const prev = useCallback(() => {
    if (selectedIdx === null) return;
    let p: number;
    if (playMode === 2) {
      p = pickShuffleIndex(selectedIdx);
    } else {
      p = selectedIdx - 1;
      if (p < 0) p = songs.length - 1;
    }
    playSong(p);
  }, [selectedIdx, playMode, pickShuffleIndex, songs.length, playSong]);

  const next = useCallback(() => {
    if (selectedIdx === null) return;
    let n: number;
    if (playMode === 2) {
      n = pickShuffleIndex(selectedIdx);
    } else {
      n = selectedIdx + 1;
      if (n >= songs.length) n = 0;
    }
    playSong(n);
  }, [selectedIdx, playMode, pickShuffleIndex, songs.length, playSong]);

  useEffect(() => {
    audio.setOnEnded(() => {
      if (selectedIdx === null) return;
      if (playMode === 1) {
        playSong(selectedIdx);
      } else if (playMode === 2) {
        playSong(pickShuffleIndex(selectedIdx));
      } else {
        const n = selectedIdx + 1;
        if (n < songs.length) playSong(n);
        else playSong(0);
      }
    });
    return () => audio.setOnEnded(null);
  }, [selectedIdx, songs.length, playSong, audio, playMode, pickShuffleIndex]);

  const currentTrack = selectedIdx !== null ? songs[selectedIdx] : null;

  return {
    loading,
    error,
    songs,
    selectedIdx,
    currentTrack,
    playing: audio.playing,
    currentTime: audio.currentTime,
    duration: audio.duration,
    volume: audio.volume,
    toggle,
    prev,
    next,
    seek: (ratio: number) => audio.seek(ratio * audio.duration),
    setVolume: (v: number) => audio.setVolume(v),
    coverCache,
    playMode,
    cyclePlayMode,
  };
}
