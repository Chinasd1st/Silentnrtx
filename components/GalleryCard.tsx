"use client";

import { useState, useRef, useEffect } from "react";
import { siteConfig } from "@/config";
import { useTranslation } from "@/lib/i18n";
import { FaImage } from "react-icons/fa";

interface GalleryImage {
  url: string;
  description: string;
}

export function GalleryCard() {
  const { t } = useTranslation();
  const { enabled, title, images } = siteConfig.gallery;
  const [viewerIdx, setViewerIdx] = useState<number | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  if (!enabled || images.length === 0) return null;

  const openViewer = (idx: number) => { setViewerIdx(idx); };
  const closeViewer = () => setViewerIdx(null);

  useEffect(() => {
    if (viewerIdx !== null) viewerRef.current?.focus();
  }, [viewerIdx]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (viewerIdx === null) return;
    if (e.key === "Escape") closeViewer();
    if (e.key === "ArrowRight" && viewerIdx < images.length - 1)
      setViewerIdx(viewerIdx + 1);
    if (e.key === "ArrowLeft" && viewerIdx > 0)
      setViewerIdx(viewerIdx - 1);
  };

  return (
    <>
      <div className="md-card animate-fade-in-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading text-lg font-semibold flex items-center gap-2" style={{ color: "var(--md-text-primary)" }}>
            <FaImage style={{ color: "var(--md-primary)" }} />
            {t("gallery.title")}
          </h3>
        </div>

        <div
          className="columns-2 gap-3"
          style={{ columnGap: "0.75rem" }}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => openViewer(idx)}
              className="break-inside-avoid mb-3 group block w-full text-left rounded-[16px] overflow-hidden border border-transparent transition-all duration-300 hover:border-[var(--md-primary)]/30 hover:scale-[1.02]"
              style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
            >
              <div className="overflow-hidden">
                <img
                  src={img.url}
                  alt={img.description}
                  className="w-full h-auto transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              {img.description && (
                <div className="p-3">
                  <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--md-text-secondary)" }}>
                    {img.description}
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {viewerIdx !== null && (
        <div ref={viewerRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={closeViewer}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] rounded-[24px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: "var(--md-card-bg)", border: "1px solid var(--md-card-border)" }}
          >
            <button
              onClick={closeViewer}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/80 hover:bg-black/70 hover:text-white transition-all"
            >
              &times;
            </button>

            <img
              src={images[viewerIdx].url}
              alt={images[viewerIdx].description}
              className="max-h-[75vh] w-auto object-contain"
            />

            {images[viewerIdx].description && (
              <div className="p-4 border-t" style={{ borderColor: "var(--md-card-border)" }}>
                <p className="text-sm" style={{ color: "var(--md-text-secondary)" }}>
                  {images[viewerIdx].description}
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--md-text-muted)" }}>
                  {viewerIdx + 1} / {images.length}
                </p>
              </div>
            )}
          </div>

          {viewerIdx > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setViewerIdx(viewerIdx - 1); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white/80 hover:bg-black/70 hover:text-white transition-all text-xl"
            >
              &#8249;
            </button>
          )}
          {viewerIdx < images.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setViewerIdx(viewerIdx + 1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white/80 hover:bg-black/70 hover:text-white transition-all text-xl"
            >
              &#8250;
            </button>
          )}
        </div>
      )}
    </>
  );
}
