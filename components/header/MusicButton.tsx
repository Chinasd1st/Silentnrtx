"use client";

/* Music player layout inspired by Firefly: https://github.com/CuteLeaf/Firefly */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  FiBarChart2,
  FiList,
  FiMusic,
  FiPause,
  FiPlay,
  FiRepeat,
  FiShuffle,
  FiSkipBack,
  FiSkipForward,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";
import { useMusicController } from "@/hooks/useMusicController";
import { useTranslation } from "@/lib/i18n";

function formatTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function MusicButton() {
  const { t } = useTranslation();
  const {
    loading,
    error,
    songs,
    currentTrack,
    playing,
    currentTime,
    duration,
    volume,
    toggle,
    prev,
    next,
    seek,
    setVolume,
    coverCache,
    selectedIdx,
    playMode,
    cyclePlayMode,
  } = useMusicController();

  const [open, setOpen] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const prevVolRef = useRef(volume);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  useLayoutEffect(() => {
    if (!open || !wrapperRef.current) return;
    const update = () => {
      const rect = wrapperRef.current!.getBoundingClientRect();
      const vw = window.innerWidth;
      const panelWidth = Math.min(320, vw - 48);
      const rightSpace = vw - rect.right;
      const shift = rightSpace < panelWidth ? panelWidth - rightSpace : 0;
      setPanelStyle({
        right: 0,
        transform: shift > 0 ? `translateX(${shift}px)` : undefined,
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setPlaylistOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        setPlaylistOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (!open || selectedIdx === null || !listRef.current) return;
    const active = listRef.current.querySelector<HTMLButtonElement>(`[data-idx="${selectedIdx}"]`);
    active?.scrollIntoView({ block: "nearest" });
  }, [open, selectedIdx]);

  if (loading || error || !songs.length || currentTrack === null) return null;

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isMuted = volume === 0;

  const handleMute = () => {
    if (volume > 0) {
      prevVolRef.current = volume;
      setVolume(0);
    } else {
      setVolume(prevVolRef.current || 0.7);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-xs cursor-pointer transition-all duration-200 hover:bg-white/6 active:scale-90"
        style={{ color: "var(--md-text-primary)" }}
        aria-label={t("music.title")}
      >
        <FiMusic
          size={15}
          className={playing ? "animate-pulse" : ""}
          style={{ color: playing ? "var(--md-primary)" : undefined }}
        />
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label={t("music.trackList")}
          className="absolute right-0 top-10 z-50 w-80 max-w-[calc(100vw-3rem)] max-h-[calc(100dvh-5rem)] overflow-y-auto overflow-x-hidden rounded-[16px] p-2 pt-[18px] shadow-lg"
          style={{
            ...panelStyle,
            backgroundColor: "var(--md-surface-variant)",
            border: "1px solid var(--md-outline-variant)",
            color: "var(--md-text-primary)",
            animation: "popover-enter 0.25s cubic-bezier(0.2, 0, 0, 1) forwards",
          }}
        >
          <style>{`
            @keyframes spin-slow {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes popover-enter {
              from { opacity: 0; transform: scale(0.95) translateY(-8px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
           `}</style>

          {/* Top Row: Cover + Info */}
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="relative shrink-0 w-14 h-14">
              <div
                className="w-full h-full rounded-full overflow-hidden border-2 flex items-center justify-center"
                style={{
                  borderColor: "var(--md-outline-variant)",
                  backgroundColor: "color-mix(in oklch, var(--md-primary) 10%, transparent)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                {currentTrack.pic ? (
                  <img
                    src={coverCache[currentTrack.pic] || currentTrack.pic}
                    alt={currentTrack.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    style={{
                      animation: "spin-slow 8s linear infinite",
                      animationPlayState: playing ? "running" : "paused",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FiMusic size={16} style={{ color: "var(--md-primary)", opacity: 0.4 }} />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between gap-2 overflow-hidden">
                <div className="flex-1 min-w-0 overflow-hidden">
                  <h3
                    className="font-bold text-sm truncate leading-tight"
                    title={currentTrack.name}
                    style={{ color: "var(--md-text-primary)" }}
                  >
                    {currentTrack.name}
                  </h3>
                </div>
              </div>
              <div className="min-w-0 overflow-hidden">
                <p
                  className="text-xs truncate"
                  style={{ color: "var(--md-text-muted)" }}
                  title={currentTrack.artist}
                >
                  {currentTrack.artist}
                </p>
              </div>

              {/* Time + Volume Row */}
              <div className="flex items-center gap-3" style={{ color: "var(--md-text-muted)" }}>
                <div className="text-[10px] font-mono tabular-nums flex items-center gap-1 shrink-0 h-5">
                  <span>{formatTime(currentTime)}</span>
                  <span className="opacity-50" aria-hidden="true">
                    /
                  </span>
                  <span>{formatTime(duration)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleMute}
                    className="p-0.5 rounded-md transition-colors cursor-pointer hover:opacity-80"
                    style={{ color: "var(--md-text-muted)" }}
                    aria-label={t("music.volume")}
                    title={t("music.volume")}
                  >
                    {isMuted ? <FiVolumeX size={11} /> : <FiVolume2 size={11} />}
                  </button>
                  <div
                    className="relative h-1 w-16 rounded-full cursor-pointer"
                    role="slider"
                    tabIndex={0}
                    aria-label={t("music.volume")}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(volume * 100)}
                    style={{ backgroundColor: "var(--md-outline-variant)" }}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
                    }}
                    onKeyDown={(e) => {
                      const step = 0.05;
                      if (e.key === "ArrowRight") {
                        e.preventDefault();
                        setVolume(Math.min(volume + step, 1));
                      }
                      if (e.key === "ArrowLeft") {
                        e.preventDefault();
                        setVolume(Math.max(volume - step, 0));
                      }
                    }}
                  >
                    <div
                      className="absolute left-0 top-0 h-full rounded-full pointer-events-none"
                      style={{
                        width: `${volume * 100}%`,
                        backgroundColor: "var(--md-primary)",
                        transition: "width 0.15s ease",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar with Hover Thumb */}
          <div
            className="relative w-full h-1 rounded-full cursor-pointer group mt-2 mb-3"
            role="slider"
            tabIndex={0}
            aria-label={t("music.seek")}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressPct)}
            style={{ backgroundColor: "var(--md-outline-variant)" }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              seek(ratio);
            }}
            onKeyDown={(e) => {
              const step = duration / 100;
              if (e.key === "ArrowRight") {
                e.preventDefault();
                seek(Math.min(1, (currentTime + step) / duration));
              }
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                seek(Math.max(0, (currentTime - step) / duration));
              }
            }}
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full pointer-events-none"
              style={{
                width: `${progressPct}%`,
                backgroundColor: "var(--md-primary)",
                transition: "width 0.3s cubic-bezier(0.2, 0, 0, 1)",
              }}
            />
            <div
              className="absolute top-1/2 -mt-1.5 -ml-1.5 w-3 h-3 rounded-full shadow-sm scale-0 group-hover:scale-100 transition-transform duration-200 pointer-events-none"
              style={{
                left: `${progressPct}%`,
                backgroundColor: "var(--md-primary)",
                border: "2px solid var(--md-surface-variant)",
              }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between px-1 select-none">
            {/* Mode Toggle */}
            <button
              type="button"
              onClick={cyclePlayMode}
              className="p-2 rounded-full transition-all duration-200 cursor-pointer hover:bg-white/6"
              style={{
                color: playMode === 0 ? "var(--md-text-muted)" : "var(--md-primary)",
              }}
              aria-label={t("music.mode")}
              title={t("music.mode")}
            >
              {playMode === 2 ? (
                <FiShuffle size={14} />
              ) : playMode === 1 ? (
                <FiRepeat size={14} />
              ) : (
                <FiRepeat size={14} />
              )}
            </button>

            {/* Previous */}
            <button
              type="button"
              onClick={() => prev()}
              className="p-2 rounded-full transition-all duration-200 cursor-pointer hover:bg-white/6"
              style={{ color: "var(--md-text-secondary)" }}
              aria-label={t("music.previous")}
              title={t("music.previous")}
            >
              <FiSkipBack size={15} />
            </button>

            {/* Play/Pause (Large Circle) */}
            <button
              type="button"
              onClick={() => selectedIdx !== null && toggle(selectedIdx)}
              className="flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 hover:brightness-110 shadow-lg cursor-pointer"
              style={{
                backgroundColor: "var(--md-primary)",
                color: "var(--md-on-primary)",
              }}
              aria-label={playing ? t("music.pause") : t("music.play")}
              title={playing ? t("music.pause") : t("music.play")}
            >
              {playing ? <FiPause size={16} /> : <FiPlay size={16} style={{ marginLeft: "3px" }} />}
            </button>

            {/* Next */}
            <button
              type="button"
              onClick={() => next()}
              className="p-2 rounded-full transition-all duration-200 cursor-pointer hover:bg-white/6"
              style={{ color: "var(--md-text-secondary)" }}
              aria-label={t("music.next")}
              title={t("music.next")}
            >
              <FiSkipForward size={15} />
            </button>

            {/* Playlist Toggle */}
            <button
              type="button"
              onClick={() => setPlaylistOpen((v) => !v)}
              className="p-2 rounded-full transition-all duration-200 cursor-pointer hover:bg-white/6"
              style={{
                color: playlistOpen ? "var(--md-primary)" : "var(--md-text-muted)",
              }}
              aria-label={t("music.playlist")}
              title={t("music.playlist")}
            >
              <FiList size={15} />
            </button>
          </div>

          {/* Playlist Drawer (Accordion) */}
          <div
            className="grid transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              gridTemplateRows: playlistOpen ? "1fr" : "0fr",
              opacity: playlistOpen ? 1 : 0,
            }}
          >
            <div className="overflow-hidden min-h-0">
              <div
                className="mt-2 pt-2"
                style={{ borderTop: "1px solid var(--md-outline-variant)" }}
              >
                <div
                  ref={listRef}
                  className="max-h-48 space-y-1 thin-scrollbar"
                  style={{ overflowY: "auto", scrollbarGutter: "stable" }}
                >
                  {songs.map((song, i) => (
                    <button
                      key={song.url}
                      type="button"
                      data-idx={i}
                      onClick={() => toggle(i)}
                      className="flex w-full items-center gap-3 rounded-lg p-2 text-left cursor-pointer transition-all duration-200"
                      style={{
                        backgroundColor:
                          i === selectedIdx
                            ? "color-mix(in oklch, var(--md-primary) 10%, transparent)"
                            : "transparent",
                      }}
                      title={`${song.name} - ${song.artist}`}
                    >
                      <div
                        className="w-8 h-8 rounded-md overflow-hidden shrink-0 relative"
                        style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                      >
                        {song.pic ? (
                          <img
                            src={coverCache[song.pic] || song.pic}
                            alt=""
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <FiMusic size={10} style={{ color: "var(--md-primary)" }} />
                          </div>
                        )}
                        {i === selectedIdx && (
                          <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{
                              backgroundColor:
                                "color-mix(in oklch, var(--md-primary) 20%, transparent)",
                            }}
                          >
                            <FiBarChart2 size={14} style={{ color: "var(--md-primary)" }} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-xs font-bold truncate transition-colors duration-200"
                          style={{
                            color:
                              i === selectedIdx ? "var(--md-primary)" : "var(--md-text-primary)",
                          }}
                        >
                          {song.name}
                        </div>
                        <div
                          className="text-[10px] truncate"
                          style={{ color: "var(--md-text-muted)" }}
                        >
                          {song.artist}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <a
            href="https://github.com/CuteLeaf/Firefly"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-[9px] text-center mt-2 opacity-30 hover:opacity-60 transition-opacity"
            style={{ color: "var(--md-text-muted)" }}
          >
            Layout inspired by Firefly
          </a>
        </div>
      )}
    </div>
  );
}
