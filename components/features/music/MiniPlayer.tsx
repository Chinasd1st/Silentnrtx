"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FaChevronDown,
  FaListUl,
  FaMusic,
  FaPause,
  FaPlay,
  FaStepBackward,
  FaStepForward,
  FaVolumeUp,
} from "react-icons/fa";
import { useGlobalAudio } from "@/components/audio/GlobalAudio";
import { siteConfig } from "@/config";
import { api, fetchWithRetry } from "@/lib/api";
import { preCacheAll } from "@/lib/cache-music";
import { useTranslation } from "@/lib/i18n";

interface Song {
  name: string;
  artist: string;
  url: string;
  pic: string;
  lrc: string;
}

function _formatTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(pointer: coarse)");
    setMobile(q.matches);
    const fn = () => setMobile(q.matches);
    q.addEventListener("change", fn);
    return () => q.removeEventListener("change", fn);
  }, []);
  return mobile;
}

function useProgress(audio: ReturnType<typeof useGlobalAudio>): number {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    if (!audio.playing) return;
    let id: number;
    const tick = () => {
      if (audio.duration > 0) {
        const next = (audio.currentTime / audio.duration) * 100;
        setPct((prev) => (Math.abs(prev - next) > 0.01 ? next : prev));
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [audio.playing, audio.duration, audio.currentTime]);
  useEffect(() => {
    if (!audio.playing) setPct(0);
  }, [audio.playing]);
  return pct;
}

const ProgressBar = memo(function ProgressBar({
  audio,
  dragging,
  progressRef,
  onPointerDown,
  onKeyDown,
}: {
  audio: ReturnType<typeof useGlobalAudio>;
  dragging: boolean;
  progressRef: React.RefObject<HTMLDivElement | null>;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}) {
  const pct = useProgress(audio);
  return (
    <div
      ref={progressRef}
      className="group cursor-pointer px-4 h-[16px] flex items-center"
      role="slider"
      tabIndex={0}
      aria-valuenow={Math.round(audio.currentTime)}
      aria-valuemin={0}
      aria-valuemax={Math.round(audio.duration)}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
    >
      <div
        className="h-1 rounded-full w-full"
        style={{ backgroundColor: "var(--md-outline-variant)" }}
      >
        <div
          className="h-full rounded-full relative"
          style={{
            width: `${pct}%`,
            backgroundColor: "var(--md-primary)",
            pointerEvents: "none",
            transition: dragging ? "none" : "width 0.3s cubic-bezier(0.2, 0, 0, 1)",
          }}
        >
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            style={{ backgroundColor: "var(--md-primary)" }}
          />
        </div>
      </div>
    </div>
  );
});

const TrackTime = memo(function TrackTime({ audio }: { audio: ReturnType<typeof useGlobalAudio> }) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!audio.playing) return;
    let id: number;
    const fn = () => {
      tick((v) => v + 1);
      id = requestAnimationFrame(fn);
    };
    id = requestAnimationFrame(fn);
    return () => cancelAnimationFrame(id);
  }, [audio.playing]);
  return (
    <span
      className="shrink-0 text-[10px] leading-tight tabular-nums w-[76px]"
      style={{ color: "var(--md-text-muted)", opacity: 0.6 }}
    >
      {_formatTime(audio.currentTime)}&thinsp;/&thinsp;{_formatTime(audio.duration)}
    </span>
  );
});

export function MiniPlayer() {
  const { t } = useTranslation();
  const audio = useGlobalAudio();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showList, setShowList] = useState(false);
  // 网页打开时默认展示收拢的胶囊迷你形态
  const [collapsed, setCollapsed] = useState(true);
  const [coverCache, setCoverCache] = useState<Record<string, string>>({});
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const cachedRectRef = useRef<DOMRect | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const _isMobile = useIsMobile();
  const [hovered, setHovered] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const collapsedRef = useRef(collapsed);
  collapsedRef.current = collapsed;

  const handlePointerMove = useCallback(() => {
    clearTimeout(hoverTimerRef.current);
    if (!collapsedRef.current) return;
    setHovered(true);
  }, []);

  const handlePointerLeave = useCallback(() => {
    clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => setHovered(false), 150);
  }, []);

  const BOTTOM_GAP = _isMobile ? 32 : 24;
  const PILL_W = _isMobile ? 144 : 160;
  const EXPANDED_W = _isMobile ? 280 : 300;
  const CIRCLE_SIZE = _isMobile ? 42 : 48;

  // --- 音乐控制核心逻辑保持不变 ---
  const seek = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = progressRef.current;
      if (!el || !audio.duration) return;
      const rect = el.getBoundingClientRect();
      cachedRectRef.current = rect;
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audio.seek(ratio * audio.duration);
    },
    [audio]
  );

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => {
      const rect = cachedRectRef.current;
      if (!rect || !audio.duration) return;
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audio.seek(ratio * audio.duration);
    };
    const up = () => {
      setDragging(false);
      cachedRectRef.current = null;
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
    return () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
    };
  }, [dragging, audio]);

  const cfg = siteConfig.music;

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
        const urls = validated.map((s) => s.pic).filter(Boolean);
        preCacheAll(urls)
          .then(setCoverCache)
          .catch(() => {});
        if (validated[0]?.url) audio.preload(validated[0].url);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (process.env.NODE_ENV === "development")
          console.error("[MiniPlayer] fetch failed:", err);
        setError(true);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setLoading(false);
      });
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [audio.preload]);

  const playSong = useCallback(
    (idx: number) => {
      const song = songs[idx];
      if (!song?.url) return;
      setSelectedIdx(idx);
      audio.play(song.url, { title: song.name, artist: song.artist, artwork: song.pic });
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
      else playSong(0);
    });
    return () => audio.setOnEnded(null);
  }, [selectedIdx, songs.length, playSong, audio]);

  useEffect(() => {
    const handlePlay = () => {
      if (audio.playing) {
        audio.resume();
      } else if (selectedIdx !== null) {
        const song = songs[selectedIdx];
        if (song?.url) playSong(selectedIdx);
      }
    };
    const handlePause = () => audio.pause();
    const handlePrev = () => {
      if (selectedIdx !== null && selectedIdx > 0) playSong(selectedIdx - 1);
    };
    const handleNext = () => {
      if (selectedIdx !== null && selectedIdx < songs.length - 1) playSong(selectedIdx + 1);
    };
    document.addEventListener("media-session-play", handlePlay);
    document.addEventListener("media-session-pause", handlePause);
    document.addEventListener("media-session-previous", handlePrev);
    document.addEventListener("media-session-next", handleNext);
    return () => {
      document.removeEventListener("media-session-play", handlePlay);
      document.removeEventListener("media-session-pause", handlePause);
      document.removeEventListener("media-session-previous", handlePrev);
      document.removeEventListener("media-session-next", handleNext);
    };
  }, [audio, selectedIdx, songs.length, playSong, songs]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (selectedIdx !== null) toggle(selectedIdx);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
      if (e.key === "Escape") {
        if (showList) setShowList(false);
        else if (!collapsed) setCollapsed(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle, next, selectedIdx, prev, showList, collapsed]);

  useEffect(() => {
    if (!showList || !dialogRef.current) return;
    const el = dialogRef.current;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    el.addEventListener("keydown", trap);
    return () => el.removeEventListener("keydown", trap);
  }, [showList]);

  // Click Outside Logic
  useEffect(() => {
    if (!showList) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as Node;
      const outsideMain = listRef.current && !listRef.current.contains(target);
      const outsidePlaylist = dialogRef.current && !dialogRef.current.contains(target);
      if (outsideMain && outsidePlaylist) setShowList(false);
    };
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, [showList]);

  // 确保选中有效
  const trackUrl = selectedIdx === null ? undefined : songs[selectedIdx]?.url;

  // Title Marquee check
  useEffect(() => {
    const el = titleRef.current;
    if (!el || !trackUrl) return;
    const parent = el.parentElement;
    if (!parent) return;
    let timeout: ReturnType<typeof setTimeout>;
    const check = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsOverflowing(el.scrollWidth - parent.clientWidth > 2), 350);
    };
    requestAnimationFrame(check);
    const ro = new ResizeObserver(check);
    ro.observe(parent);
    ro.observe(el);
    return () => {
      clearTimeout(timeout);
      ro.disconnect();
    };
  }, [trackUrl]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (loading) {
    return createPortal(
      <div className="fixed bottom-6 right-6 z-40 w-[160px] h-[48px] rounded-[24px] bg-white/6 animate-pulse" />,
      document.body
    );
  }
  if (error) {
    return createPortal(
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="fixed bottom-6 right-6 z-40 w-[160px] h-[48px] rounded-[24px] flex items-center justify-center text-xs cursor-pointer hover:bg-white/6 transition-colors"
        style={{
          backgroundColor: "color-mix(in oklch, var(--md-error) 20%, transparent)",
          color: "var(--md-error)",
        }}
        aria-label="Retry"
      >
        Error — tap to reload
      </button>,
      document.body
    );
  }
  if (songs.length === 0 || selectedIdx === null) return null;

  const idx = selectedIdx;
  const track = songs[idx];

  // 🌟 精密布局高度计算
  const BASE_H = 146; // 展开状态的基础高度 (Header + Progress + Controls)
  const LIST_H = 360; // 播放列表的高度
  const _COLLAPSED_H = 48; // 胶囊高度

  const ANIM_CURVE = "cubic-bezier(0.3, 0, 0, 1)";
  const _circle = collapsed && !hovered;
  const _pill = collapsed && hovered;
  const currentW = collapsed ? (_circle ? CIRCLE_SIZE : PILL_W) : EXPANDED_W;
  const currentH = collapsed ? CIRCLE_SIZE : BASE_H;
  const currentRadius = _circle ? CIRCLE_SIZE / 2 : collapsed ? 24 : 16;

  return (
    <>
      {createPortal(
        <div
          ref={listRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onPointerDown={(e) => {
            if (collapsed) {
              e.stopPropagation();
              setCollapsed(false);
            }
          }}
          className="fixed right-6 z-40"
          style={{
            bottom: BOTTOM_GAP,
            width: currentW,
            height: currentH,
            borderRadius: currentRadius,
            transition: `width 0.5s ${ANIM_CURVE}, height 0.5s ${ANIM_CURVE},
                        border-radius 0.5s ${ANIM_CURVE}, opacity 0.5s ${ANIM_CURVE},
                        background-color 0.5s ${ANIM_CURVE},
                        box-shadow 0.5s ${ANIM_CURVE}, border 0.5s ${ANIM_CURVE}`,
            backgroundColor: collapsed
              ? "var(--md-primary)"
              : "color-mix(in oklch, var(--md-surface-variant) 85%, transparent)",
            backdropFilter: collapsed || _isMobile ? "none" : "blur(20px) saturate(180%)",
            WebkitBackdropFilter: collapsed || _isMobile ? "none" : "blur(20px) saturate(180%)",
            boxShadow: collapsed ? "0 4px 16px rgba(0,0,0,0.25)" : "0 4px 24px rgba(0,0,0,0.2)",
            border: collapsed ? "none" : "1px solid var(--md-outline-variant)",
            transitionTimingFunction: ANIM_CURVE,
            overflow: "hidden",
          }}
        >
          {/* ...胶囊态交互蒙版... */}
          {collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="absolute inset-0 w-full h-full z-50 cursor-pointer"
              aria-label="Expand player"
            />
          )}

          {/* ...圆形态图标（居中）... */}
          <FaMusic
            size={16}
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${audio.playing && _circle ? "animate-pulse" : ""}`}
            style={{
              color: "var(--md-on-primary)",
              opacity: _circle ? 1 : 0,
              transition: `opacity 0.4s ${ANIM_CURVE}`,
              pointerEvents: "none",
            }}
          />

          {/* ...胶囊态/展开态图标（左上角）... */}
          <FaMusic
            size={12}
            className={`absolute left-[16px] top-[18px] ${audio.playing && collapsed ? "animate-pulse" : ""}`}
            style={{
              color: collapsed ? "var(--md-on-primary)" : "var(--md-primary)",
              opacity: collapsed && !_circle ? 1 : 0,
              transition: `opacity 0.4s ${ANIM_CURVE}`,
              pointerEvents: "none",
            }}
          />

          {/* ...核心魔法：独立滑翔的 Title Container（transform 驱动，避免布局重排）... */}
          <div
            className="absolute z-30"
            style={{
              left: 82,
              top: 11,
              width: collapsed ? PILL_W - 36 : 202,
              transform: collapsed ? "translateX(-46px)" : "none",
              opacity: _circle ? 0 : 1,
              pointerEvents: collapsed ? "none" : "auto",
              transition: `transform 0.5s ${ANIM_CURVE}, opacity 0.5s ${ANIM_CURVE}`,
            }}
          >
            <div className="min-w-0 flex-1 overflow-hidden" aria-live="polite" aria-atomic="true">
              <div
                className="overflow-hidden whitespace-nowrap"
                style={{ textOverflow: collapsed ? "ellipsis" : "clip" }}
              >
                <div
                  ref={titleRef}
                  key={track.url}
                  style={{
                    display: isOverflowing && !collapsed ? "flex" : "block",
                    whiteSpace: "nowrap",
                    willChange: isOverflowing ? "transform" : "auto",
                    animation: isOverflowing && !collapsed ? "marquee 6s linear infinite" : "none",
                  }}
                >
                  <span
                    className="font-medium leading-none"
                    style={{
                      fontSize: collapsed ? "13px" : "14px",
                      color: collapsed ? "var(--md-on-primary)" : "var(--md-text-primary)",
                      flexShrink: 0,
                      transition: `color 0.5s ${ANIM_CURVE}, font-size 0.5s ${ANIM_CURVE}`,
                    }}
                  >
                    {track.name}
                  </span>
                  {isOverflowing && !collapsed && (
                    <span
                      aria-hidden="true"
                      className="font-medium leading-none pl-8"
                      style={{
                        fontSize: "14px",
                        color: "var(--md-text-primary)",
                        flexShrink: 0,
                      }}
                    >
                      {track.name}
                    </span>
                  )}
                </div>
              </div>

              <div
                style={{
                  opacity: collapsed ? 0 : 1,
                  transform: collapsed ? "translateY(-8px)" : "translateY(0)",
                  transition: `transform 0.5s ${ANIM_CURVE}, opacity 0.5s ${ANIM_CURVE}`,
                }}
              >
                <p
                  className="truncate text-[11px] leading-tight mt-1.5"
                  style={{ color: "var(--md-text-muted)" }}
                >
                  {track.artist}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <TrackTime audio={audio} />
                  <FaVolumeUp
                    size={9}
                    style={{ color: "var(--md-text-muted)", opacity: 0.5, flexShrink: 0 }}
                  />
                  <div
                    className="flex-1 h-1 rounded-full cursor-pointer group"
                    role="slider"
                    tabIndex={0}
                    aria-label={t("music.volume")}
                    aria-valuenow={Math.round(audio.volume * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    style={{ backgroundColor: "var(--md-outline-variant)", maxWidth: 60 }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                      audio.setVolume(ratio);
                    }}
                    onKeyDown={(e) => {
                      const step = 0.05;
                      if (e.key === "ArrowRight") {
                        e.preventDefault();
                        audio.setVolume(Math.min(audio.volume + step, 1));
                      }
                      if (e.key === "ArrowLeft") {
                        e.preventDefault();
                        audio.setVolume(Math.max(audio.volume - step, 0));
                      }
                    }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${audio.volume * 100}%`,
                        backgroundColor: "var(--md-text-muted)",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ...展开态核心控制台... */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: BASE_H,
              opacity: collapsed ? 0 : 1,
              transform: collapsed ? "translateY(16px)" : "translateY(0)",
              transition: `transform 0.5s ${ANIM_CURVE}, opacity 0.5s ${ANIM_CURVE}`,
              pointerEvents: collapsed ? "none" : "auto",
            }}
          >
            <div className="h-[78px] px-4 pt-3 flex items-start">
              <div
                className="h-[56px] w-[56px] rounded-[14px] overflow-hidden shrink-0"
                style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
              >
                {track.pic ? (
                  <img
                    key={track.url}
                    src={coverCache[track.pic] || track.pic}
                    alt={track.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FaMusic size={18} style={{ color: "var(--md-primary)" }} />
                  </div>
                )}
              </div>
            </div>

            <ProgressBar
              audio={audio}
              dragging={dragging}
              progressRef={progressRef}
              onPointerDown={(e) => {
                e.preventDefault();
                setDragging(true);
                seek(e);
              }}
              onKeyDown={(e) => {
                const step = audio.duration / 100;
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  audio.seek(Math.min(audio.currentTime + step, audio.duration));
                }
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  audio.seek(Math.max(audio.currentTime - step, 0));
                }
              }}
            />

            <div className="flex items-center justify-between px-6 pb-4 pt-1 h-[52px]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowList((v) => !v);
                }}
                aria-label={t("music.tracks")}
                aria-expanded={showList}
                className={`flex h-8 w-8 items-center justify-center rounded-full cursor-pointer transition-all duration-200 hover:scale-110 ${
                  showList ? "bg-white/6" : ""
                }`}
                style={{ color: showList ? "var(--md-primary)" : "var(--md-text-secondary)" }}
              >
                <FaListUl size={12} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label={t("music.previous")}
                className="flex h-8 w-8 items-center justify-center rounded-full cursor-pointer transition-all duration-200 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ color: "var(--md-text-secondary)" }}
                disabled={idx <= 0}
              >
                <FaStepBackward size={12} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(idx);
                }}
                aria-label={audio.playing ? t("music.pause") : t("music.play")}
                className="flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 hover:scale-110 shadow-lg"
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: "var(--md-primary)",
                  color: "var(--md-on-primary)",
                }}
              >
                {audio.playing ? (
                  <FaPause size={14} />
                ) : (
                  <FaPlay size={14} style={{ marginLeft: "2px" }} />
                )}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label={t("music.next")}
                className="flex h-8 w-8 items-center justify-center rounded-full cursor-pointer transition-all duration-200 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ color: "var(--md-text-secondary)" }}
                disabled={idx >= songs.length - 1}
              >
                <FaStepForward size={12} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCollapsed(true);
                  setShowList(false);
                }}
                aria-label="Collapse player"
                className="flex h-8 w-8 items-center justify-center rounded-full cursor-pointer transition-all duration-200 hover:scale-110 hover:bg-white/6"
                style={{ color: "var(--md-text-secondary)" }}
              >
                <FaChevronDown size={12} />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* =========================================
          Playlist 独立 Portal（浮现在主播放器上方）
      ========================================= */}
      {createPortal(
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal={showList && !collapsed ? true : undefined}
          aria-label={t("music.trackList")}
          className="fixed z-40"
          style={{
            right: 24,
            bottom: BOTTOM_GAP + BASE_H + 12,
            width: EXPANDED_W,
            height: LIST_H,
            borderRadius: 16,
            backgroundColor: "color-mix(in oklch, var(--md-surface-variant) 85%, transparent)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid var(--md-outline-variant)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
            opacity: showList && !collapsed ? 1 : 0,
            transform: showList && !collapsed ? "translateY(0)" : "translateY(20px)",
            pointerEvents: showList && !collapsed ? "auto" : "none",
            transition: `transform 0.4s ${ANIM_CURVE}, opacity 0.4s ${ANIM_CURVE}`,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 12,
              bottom: 12,
              left: 0,
              right: 0,
              height: "calc(100% - 24px)",
              overflow: "hidden",
              maskImage:
                "linear-gradient(to bottom, transparent 0%, #000 12px, #000 calc(100% - 12px), transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, #000 12px, #000 calc(100% - 12px), transparent 100%)",
            }}
          >
            <div className="overflow-y-auto thin-scrollbar h-full px-4">
              {songs.length === 0 ? (
                <p className="text-center text-xs py-8" style={{ color: "var(--md-text-muted)" }}>
                  {t("music.noTracks")}
                </p>
              ) : (
                songs.map((song, i) => {
                  const sel = i === idx;
                  return (
                    <button
                      key={song.url}
                      type="button"
                      onClick={() => toggle(i)}
                      aria-label={song.name}
                      className="group flex w-full items-center gap-3 rounded-[12px] px-3 py-2 text-left cursor-pointer hover:bg-white/6 mb-1 last:mb-0"
                      style={{
                        backgroundColor: sel ? "var(--md-primary-020)" : "transparent",
                        transition: "background-color 0.3s ease",
                      }}
                    >
                      <div
                        className="relative h-7 w-7 shrink-0 rounded-[8px] overflow-hidden"
                        style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                      >
                        {song.pic && (
                          <img
                            src={coverCache[song.pic] || song.pic}
                            alt={song.name}
                            loading="lazy"
                            className="h-7 w-7 rounded-[8px] object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                            }}
                          />
                        )}
                        {!sel && (
                          <div
                            className="absolute inset-0 flex items-center justify-center rounded-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
                          >
                            <FaPlay size={7} style={{ marginLeft: "1px" }} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-medium transition-colors ${
                            sel ? "text-[var(--md-primary)]" : "text-[var(--md-text-primary)]"
                          } group-hover:text-[var(--md-primary)]`}
                        >
                          {song.name}
                        </p>
                        <p className="truncate text-xs text-[var(--md-text-muted)]">
                          {song.artist}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
