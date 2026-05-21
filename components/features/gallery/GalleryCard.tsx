"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaImage } from "react-icons/fa";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { siteConfig } from "@/config";
import { useTranslation } from "@/lib/i18n";

interface GalleryImage {
  url: string;
  description?: string;
  descriptionCn?: string;
}

export function GalleryCard() {
  const { t, i18n } = useTranslation();
  const labels = {
    close: t("gallery.close"),
    prev: t("gallery.prev"),
    next: t("gallery.next"),
  };
  const { enabled, images } = siteConfig.gallery;
  const isZh = i18n.language === "zh-CN";
  const desc = (img: GalleryImage) =>
    (isZh && img.descriptionCn ? img.descriptionCn : img.description) || "";
  const [viewerIdx, setViewerIdx] = useState<number | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewerIdx !== null) viewerRef.current?.focus();
  }, [viewerIdx]);

  if (!enabled || images.length === 0) return null;

  const openViewer = (idx: number) => {
    setViewerIdx(idx);
  };
  const closeViewer = () => setViewerIdx(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (viewerIdx === null) return;
    if (e.key === "Escape") closeViewer();
    if (e.key === "ArrowRight" && viewerIdx < images.length - 1) setViewerIdx(viewerIdx + 1);
    if (e.key === "ArrowLeft" && viewerIdx > 0) setViewerIdx(viewerIdx - 1);
  };

  return (
    <>
      <div className="md-card">
        <div className="flex items-center justify-between mb-5">
          <h2
            className="font-heading text-lg font-semibold flex items-center gap-2"
            style={{ color: "var(--md-text-primary)" }}
          >
            <FaImage style={{ color: "var(--md-primary)" }} />
            {t("gallery.title")}
          </h2>
        </div>

        <div className="columns-2 gap-3" style={{ columnGap: "0.75rem" }}>
          {images.map((img, idx) => (
            <button
              type="button"
              key={img.url}
              onClick={() => openViewer(idx)}
              aria-label={desc(img) || `Image ${idx + 1}`}
              className="break-inside-avoid mb-3 group block w-full text-left rounded-[16px] overflow-hidden border border-transparent transition-all duration-300 hover:border-(--md-primary)/30 hover:scale-[1.02]"
              style={{ backgroundColor: "var(--md-primary-008)" }}
            >
              <div className="overflow-hidden">
                <OptimizedImage
                  src={img.url}
                  alt={desc(img)}
                  className="w-full h-auto transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, 25vw"
                  placeholder
                />
              </div>
              {desc(img) && (
                <div className="p-3">
                  <p
                    className="text-xs leading-relaxed line-clamp-2"
                    style={{ color: "var(--md-text-secondary)" }}
                  >
                    {desc(img)}
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {viewerIdx !== null &&
        createPortal(
          <div
            ref={viewerRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeViewer();
            }}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
          >
            <div
              className="relative max-h-[90vh] max-w-[90vw] rounded-md3 overflow-hidden"
              style={{
                backgroundColor: "var(--md-card-bg)",
                border: "1px solid var(--md-card-border)",
              }}
            >
              <button
                type="button"
                onClick={closeViewer}
                aria-label={labels.close}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/80 hover:bg-black/70 hover:text-white transition-all"
              >
                &times;
              </button>
              <OptimizedImage
                src={images[viewerIdx].url}
                alt={desc(images[viewerIdx])}
                className="max-h-[75vh] w-auto object-contain"
                sizes="90vw"
                priority
                placeholder={false}
              />
              {desc(images[viewerIdx]) && (
                <div className="p-4 border-t" style={{ borderColor: "var(--md-card-border)" }}>
                  <p className="text-sm" style={{ color: "var(--md-text-secondary)" }}>
                    {desc(images[viewerIdx])}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "var(--md-text-muted)" }}>
                    {viewerIdx + 1} / {images.length}
                  </p>
                </div>
              )}
            </div>

            {viewerIdx > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewerIdx(viewerIdx - 1);
                }}
                aria-label={labels.prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white/80 hover:bg-black/70 hover:text-white transition-all text-xl"
              >
                &#8249;
              </button>
            )}
            {viewerIdx < images.length - 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewerIdx(viewerIdx + 1);
                }}
                aria-label={labels.next}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white/80 hover:bg-black/70 hover:text-white transition-all text-xl"
              >
                &#8250;
              </button>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
