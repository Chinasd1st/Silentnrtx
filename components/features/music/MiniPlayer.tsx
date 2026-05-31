"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FaChevronDown,
  FaListUl,
  FaMusic,
  FaPause,
  FaPlay,
  FaRedoAlt,
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

export function MiniPlayer() {
  const { t } = useTranslation();
  const audio = useGlobalAudio();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showList, setShowList] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [coverCache, setCoverCache] = useState<Record<string, string>>({});
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [_progressTick, setProgressTick] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!audio.playing) return;
    let frame: number;
    const tick = () => {
      setProgressTick((v) => v + 1);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [audio.playing]);

  const seek = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = progressRef.current;
      if (!el || !audio.duration) return;
      const rect = el.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audio.seek(ratio * audio.duration);
    },
    [audio]
  );

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => {
      const el = progressRef.current;
      if (!el || !audio.duration) return;
      const rect = el.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audio.seek(ratio * audio.duration);
    };
    const up = () => setDragging(false);
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

  const toggle = useCallback(
    (idx: number) => {
      const song = songs[idx];
      if (!song?.url) return;
      if (selectedIdx === idx && audio.playing) {
        audio.pause();
      } else if (selectedIdx === idx) {
        audio.resume();
      } else {
        playSong(idx);
      }
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
      if (e.key === "Escape") setShowList(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle, next, selectedIdx, prev]);

  useEffect(() => {
    if (!showList) return;
    const handle = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node)) setShowList(false);
    };
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, [showList]);

  useEffect(() => {
    if (!showList || !dialogRef.current) return;
    const el = dialogRef.current;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) focusable[0].focus();
  }, [showList]);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;
    let timeout: ReturnType<typeof setTimeout>;
    const check = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsOverflowing(el.scrollWidth - parent.clientWidth > 2), 350);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(parent);
    ro.observe(el);
    return () => {
      clearTimeout(timeout);
      ro.disconnect();
    };
  }, []);

  if (loading || error || songs.length === 0 || selectedIdx === null) return null;

  const idx = selectedIdx;
  const track = songs[idx];
  const progress = audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0;

  const anim = "0.35s cubic-bezier(0.2, 0, 0, 1)";
  const _scale = collapsed ? 16 / 100 : 1;

  return createPortal(
    <div
      ref={listRef}
      className="fixed bottom-6 right-6 z-40"
      style={{
        width: 300,
        // 【关键】根节点放弃鼠标事件，防止收起时 300px 的透明区域挡住网页底部的其他元素
        pointerEvents: "none",
      }}
    >
      {/* 1. 动态背景层：放弃 scale，改用 top/left 定位实现完美形变 */}
      <div
        style={{
          position: "absolute",
          // 展开时 top/left 为 0 撑满容器；收起时挤压到右下角 48x48 的空间
          top: collapsed ? "calc(100% - 48px)" : 0,
          left: collapsed ? "calc(100% - 48px)" : 0,
          right: 0,
          bottom: 0,
          borderRadius: collapsed ? 24 : 16,
          backgroundColor: collapsed
            ? "var(--md-primary)"
            : "color-mix(in oklch, var(--md-surface-variant) 85%, transparent)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: collapsed ? "0 4px 16px rgba(0,0,0,0.25)" : "0 4px 24px rgba(0,0,0,0.2)",
          border: collapsed ? "none" : "1px solid var(--md-outline-variant)",
          transition: `all ${anim}`,
          zIndex: 0,
          // 恢复背景自身的鼠标事件
          pointerEvents: "auto",
        }}
      />

      {/* 2. 收起时的圆形音乐按钮 */}
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 48,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--md-on-primary)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          zIndex: 10,
          opacity: collapsed ? 1 : 0,
          pointerEvents: collapsed ? "auto" : "none",
          // 加入轻微的旋转缩放，抵消闪现感
          transform: collapsed ? "scale(1) rotate(0deg)" : "scale(0.5) rotate(-45deg)",
          transition: `all 0.3s cubic-bezier(0.2, 0, 0, 1)`,
        }}
        aria-label="Expand player"
      >
        <FaMusic size={16} />
      </button>

      {/* 3. 展开时的内容包装层 */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          opacity: collapsed ? 0 : 1,
          pointerEvents: collapsed ? "none" : "auto",
          // 【防闪现核心】：收起时（0.15s）让内容快速消失；展开时（0.35s）让内容平滑出现
          transition: `opacity ${collapsed ? "0.15s" : "0.35s"} ease-out, transform ${anim}`,
          transform: collapsed ? "translateY(8px) scale(0.95)" : "translateY(0) scale(1)",
          transformOrigin: "bottom right",
          width: "100%",
        }}
      >
        {/* === 以下部分保留你的原有控制台 UI 代码 === */}
        <button
          type="button"
          onClick={() => {
            setCollapsed(true);
            setShowList(false);
          }}
          className="absolute top-1 right-1 z-50 flex h-5 w-5 items-center justify-center rounded-full cursor-pointer transition-all duration-200 hover:bg-white/10"
          style={{ color: "var(--md-text-muted)" }}
          aria-label="Collapse player"
        >
          <FaChevronDown size={8} />
        </button>

        <div
          ref={dialogRef}
          role="dialog"
          aria-modal={showList ? "true" : undefined}
          aria-label={t("music.trackList")}
          style={{
            height: showList ? "360px" : "0px",
            overflow: "hidden",
            position: "relative",
            transition: "height 0.3s cubic-bezier(0.2, 0, 0, 1)",
          }}
        >
          <div
            className="overflow-y-auto thin-scrollbar"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: "360px",
              padding: "16px 16px 8px",
            }}
          >
            {songs.map((song, i) => {
              const sel = i === idx;
              return (
                <button
                  key={song.url}
                  type="button"
                  onClick={() => toggle(i)}
                  aria-label={song.name}
                  className="group flex w-full items-center gap-3 rounded-[12px] px-3 py-2 text-left cursor-pointer hover:bg-white/6"
                  style={{
                    backgroundColor: sel ? "var(--md-primary-020)" : "transparent",
                    borderRadius: "12px",
                    opacity: showList ? 1 : 0,
                    transition:
                      "opacity 0.3s cubic-bezier(0, 0.6, 0.1, 1), background-color 0.3s ease",
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
                          (e.target as HTMLImageElement).style.display = "none";
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
                      className={`truncate text-sm font-medium transition-all duration-200 group-hover:text-[var(--md-primary)] ${sel ? "text-[var(--md-primary)]" : "text-[var(--md-text-primary)]"}`}
                      title={song.name}
                    >
                      {song.name}
                    </p>
                    <p
                      className="truncate text-xs"
                      title={song.artist}
                      style={{ color: "var(--md-text-muted)" }}
                    >
                      {song.artist}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--md-outline-variant)" }}>
          <div className="flex items-start gap-3 px-4 pt-3 pb-1">
            <div style={{ position: "relative", width: 54, height: 54 }}>
              <div
                className="h-[54px] w-[54px] rounded-[14px] overflow-hidden"
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
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FaMusic size={18} style={{ color: "var(--md-primary)" }} />
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1 overflow-hidden" aria-live="polite" aria-atomic="true">
              <div className="overflow-hidden whitespace-nowrap">
                <div
                  ref={titleRef}
                  key={track.url}
                  style={{
                    display: "flex",
                    whiteSpace: "nowrap",
                    willChange: isOverflowing ? "transform" : "auto",
                    animation: isOverflowing ? "marquee 6s linear infinite" : "none",
                  }}
                >
                  <span
                    className="text-sm font-medium leading-tight"
                    style={{ color: "var(--md-text-primary)", flexShrink: 0 }}
                  >
                    {track.name}
                  </span>
                  {isOverflowing && (
                    <span
                      aria-hidden="true"
                      className="text-sm font-medium leading-tight"
                      style={{ color: "var(--md-text-primary)", flexShrink: 0 }}
                    >
                      {track.name}
                    </span>
                  )}
                </div>
              </div>
              <p
                className="truncate text-[11px] leading-tight mt-0.5"
                style={{ color: "var(--md-text-muted)" }}
              >
                {track.artist}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className="shrink-0 text-[10px] leading-tight tabular-nums w-[76px]"
                  style={{ color: "var(--md-text-muted)", opacity: 0.6 }}
                >
                  {_formatTime(audio.currentTime)}&thinsp;/&thinsp;{_formatTime(audio.duration)}
                </span>
                <FaVolumeUp
                  size={9}
                  style={{ color: "var(--md-text-muted)", opacity: 0.5, flexShrink: 0 }}
                />
                <div
                  className="flex-1 h-1 rounded-full cursor-pointer group"
                  style={{ backgroundColor: "var(--md-outline-variant)", maxWidth: 60 }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    audio.setVolume(ratio);
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

          <div
            ref={progressRef}
            className="group cursor-pointer"
            role="slider"
            tabIndex={0}
            aria-valuenow={Math.round(audio.currentTime)}
            aria-valuemin={0}
            aria-valuemax={Math.round(audio.duration)}
            aria-label={t("music.seek")}
            style={{ padding: "8px 16px 0" }}
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
          >
            <div
              className="h-1 rounded-full"
              style={{ backgroundColor: "var(--md-outline-variant)" }}
            >
              <div
                className="h-full rounded-full relative"
                style={{
                  width: `${progress}%`,
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

          <div className="flex items-center justify-center gap-4 px-4 pb-3 pt-2">
            <button
              type="button"
              aria-label="Repeat"
              className="flex h-8 w-8 items-center justify-center rounded-full cursor-pointer transition-all duration-200 hover:scale-110"
              style={{ color: "var(--md-text-secondary)" }}
            >
              <FaRedoAlt size={11} />
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
              <FaStepBackward size={11} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggle(idx);
              }}
              aria-label={audio.playing ? t("music.pause") : t("music.play")}
              className="flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 hover:scale-110"
              style={{
                width: 36,
                height: 36,
                backgroundColor: "var(--md-primary)",
                color: "var(--md-on-primary)",
              }}
            >
              {audio.playing ? (
                <FaPause size={12} />
              ) : (
                <FaPlay size={12} style={{ marginLeft: "1.5px" }} />
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
              <FaStepForward size={11} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowList((v) => !v);
              }}
              aria-label={t("music.tracks")}
              className={`flex h-8 w-8 items-center justify-center rounded-full cursor-pointer transition-all duration-200 hover:scale-110 ${showList ? "bg-white/6" : ""}`}
              style={{ color: showList ? "var(--md-primary)" : "var(--md-text-secondary)" }}
            >
              <FaListUl size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
