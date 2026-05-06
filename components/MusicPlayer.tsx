"use client";

import React, { useEffect, useState, useCallback } from "react";
import { siteConfig } from "@/config";
import { useTranslation } from "@/lib/i18n";
import { useGlobalAudio } from "@/components/GlobalAudio";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { CardSkeleton } from "@/components/Skeleton";
import { ErrorCard } from "@/components/ErrorCard";
import { FaMusic, FaPlay, FaPause, FaStepBackward, FaStepForward } from "react-icons/fa";

interface Song { name: string; artist: string; url: string; pic: string; lrc: string; }

export function MusicPlayer() {
  const { t } = useTranslation();
  const audio = useGlobalAudio();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const cfg = siteConfig.music;

  useEffect(() => {
    if (!cfg.enabled) { setLoading(false); return; }
    const url = `${cfg.api}?server=${encodeURIComponent(cfg.params.server)}&type=${encodeURIComponent(cfg.params.type)}&id=${encodeURIComponent(cfg.params.id)}`;
    fetchWithTimeout(url)
      .then((r) => r.json())
      .then((data: Song[]) => {
        if (!Array.isArray(data)) throw new Error("invalid");
        setSongs(data);
        if (data.length > 0) setSelectedIdx(0);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [retryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const playSong = useCallback((idx: number) => {
    const song = songs[idx];
    if (!song?.url) return;
    setSelectedIdx(idx);
    audio.play(song.url);

  }, [songs, audio]);

  const toggle = useCallback((idx: number) => {
    if (selectedIdx === idx && audio.playing) { audio.pause(); return; }
    playSong(idx);
  }, [selectedIdx, audio, playSong]);

  const prev = useCallback(() => {
    if (selectedIdx === null) return;
    const p = selectedIdx - 1;
    if (p >= 0) playSong(p);
  }, [selectedIdx, playSong]);

  const next = useCallback(() => {
    if (selectedIdx === null) return;
    const n = selectedIdx + 1;
    if (n < songs.length) playSong(n);
  }, [selectedIdx, songs.length, playSong]);

  useEffect(() => {
    audio.setOnEnded(() => {
      const n = (selectedIdx ?? 0) + 1;
      if (n < songs.length) playSong(n);
    });
    return () => audio.setOnEnded(null);
  }, [selectedIdx, songs.length, playSong, audio]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === " " || e.code === "Space") { e.preventDefault(); if (selectedIdx !== null) toggle(selectedIdx); }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle, next, selectedIdx]);

  if (loading) return <CardSkeleton />;
  if (error || songs.length === 0) return <ErrorCard title={t("music.error")} onRetry={() => setRetryKey((k) => k + 1)} />;

  const idx = selectedIdx ?? 0;
  const track = songs[idx];

  return (
    <div className="md-card">
      <div className="flex items-center gap-3 mb-3">
        <FaMusic className="text-lg shrink-0" style={{ color: "var(--md-primary)" }} />
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg font-semibold truncate" style={{ color: "var(--md-text-primary)" }}>
            {t("music.title")}
          </h2>
        </div>
      </div>

      <div className="mb-3 rounded-[16px] p-3" style={{ backgroundColor: "var(--md-primary-008)" }}>
        <div className="flex items-center gap-3">
          {track?.pic && (
            <img src={track.pic} alt="cover" className="h-10 w-10 shrink-0 rounded-[10px] object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium" style={{ color: "var(--md-primary)" }}>{track?.name}</p>
            <p className="truncate text-xs" style={{ color: "var(--md-text-muted)" }}>{track?.artist}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={prev} aria-label="Previous track" className="flex h-8 w-8 items-center justify-center rounded-full transition-all hover:scale-110"
              style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "var(--md-text-secondary)" }}
              disabled={idx <= 0}><FaStepBackward size={12} /></button>
            <button onClick={() => toggle(idx)} aria-label={audio.playing && selectedIdx === idx ? "Pause" : "Play"} className="flex h-8 w-8 items-center justify-center rounded-full transition-all hover:scale-110"
              style={{ backgroundColor: "var(--md-primary-020)", color: "var(--md-primary)" }}>
              {audio.playing && selectedIdx === idx ? <FaPause size={12} /> : <FaPlay size={12} style={{ marginLeft: "1.5px" }} />}
            </button>
            <button onClick={next} aria-label="Next track" className="flex h-8 w-8 items-center justify-center rounded-full transition-all hover:scale-110"
              style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "var(--md-text-secondary)" }}
              disabled={idx >= songs.length - 1}><FaStepForward size={12} /></button>
          </div>
        </div>

        <div className="relative h-1.5 w-full cursor-pointer rounded-full mt-3" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            audio.seek(ratio * audio.duration);
          }}>
          <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-200"
            style={{ width: `${audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0}%`, backgroundColor: "var(--md-primary)" }} />
        </div>
        <div className="flex justify-between text-[10px] mt-1" style={{ color: "var(--md-text-muted)" }}>
          <span>{fmt(audio.currentTime)}</span>
          <span>{fmt(audio.duration)}</span>
        </div>
      </div>

      <div className="space-y-0.5 max-h-[180px] overflow-y-auto">
        {songs.map((song, i) => (
          <SongItem key={i} song={song} idx={i} selectedIdx={idx} isPlaying={audio.playing && selectedIdx === i} onToggle={toggle} />
        ))}
      </div>
    </div>
  );
}

const SongItem = React.memo(function SongItem({ song, idx, selectedIdx, isPlaying, onToggle }: {
  song: Song; idx: number; selectedIdx: number; isPlaying: boolean; onToggle: (i: number) => void;
}) {
  const sel = idx === selectedIdx;
  return (
    <button onClick={() => onToggle(idx)}
      className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2 text-left transition-all duration-200 hover:bg-white/[0.05]"
      style={{ backgroundColor: sel ? "var(--md-primary-012)" : "transparent" }}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] text-[10px]"
        style={{ backgroundColor: sel ? "var(--md-primary-020)" : "rgba(255,255,255,0.05)", color: sel ? "var(--md-primary)" : "var(--md-text-muted)" }}>
        {sel && isPlaying ? <FaPause size={8} /> : <FaPlay size={8} style={{ marginLeft: "1px" }} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" style={{ color: sel ? "var(--md-primary)" : "var(--md-text-primary)" }}>{song.name}</p>
        <p className="truncate text-xs" style={{ color: "var(--md-text-muted)" }}>{song.artist}</p>
      </div>
    </button>
  );
});

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
