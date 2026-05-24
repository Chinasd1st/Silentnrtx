"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchWithRetry, mapApiError } from "@/lib/api";
import { githubApi } from "@/lib/api/github";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { useTranslation } from "@/lib/i18n";

interface ReleaseData {
  tag_name: string;
  body: string;
  html_url: string;
  prerelease: boolean;
}

const TITLE_ID = "release-modal-title";

export function ReleaseModal({
  version,
  children,
}: {
  version: string;
  children?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [release, setRelease] = useState<ReleaseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const viewerRef = useFocusTrap(open);

  const fetchRelease = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await fetchWithRetry(() =>
        githubApi.get<ReleaseData>("/repos/Chinasd1st/Silentnrtx/releases/latest")
      );
      setRelease(data);
    } catch (err) {
      console.warn(mapApiError(err).message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    if (!release) fetchRelease();
  };

  const handleClose = () => setOpen(false);

  const isBeta = /beta/i.test(version);
  const isRc = /rc/i.test(version);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="hover:text-[var(--md-primary)] transition-colors cursor-pointer"
        title={t("release.notes")}
      >
        {children || version}
      </button>

      {open &&
        createPortal(
          <div
            ref={viewerRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleClose();
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") handleClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={TITLE_ID}
            tabIndex={-1}
          >
            <div
              className="relative rounded-md3 w-full max-w-lg max-h-[80vh] overflow-hidden"
              style={{
                backgroundColor: "var(--md-card-bg)",
                border: "1px solid var(--md-card-border)",
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-4 border-b"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <h2
                    id={TITLE_ID}
                    className="font-heading text-base font-semibold truncate"
                    style={{ color: "var(--md-text-primary)" }}
                  >
                    {release?.tag_name || t("release.notes")}
                  </h2>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{
                      backgroundColor: release?.prerelease
                        ? "color-mix(in srgb, var(--md-accent-yellow, #eab308) 20%, transparent)"
                        : "color-mix(in srgb, var(--md-accent-green, #22c55e) 20%, transparent)",
                      color: release?.prerelease
                        ? "var(--md-accent-yellow, #eab308)"
                        : "var(--md-accent-green, #22c55e)",
                    }}
                  >
                    {release?.prerelease ? t("release.prerelease") : t("release.latest")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label={t("release.close")}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/80 hover:bg-black/70 hover:text-white transition-all shrink-0"
                >
                  <FiX size={15} />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[calc(80vh-57px)] p-5">
                {isBeta && (
                  <div
                    className="rounded-[12px] p-3 mb-4 text-xs"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--md-accent-yellow, #eab308) 15%, transparent)",
                      color: "var(--md-accent-yellow, #eab308)",
                    }}
                  >
                    {t("release.beta_warning")}
                  </div>
                )}
                {isRc && !isBeta && (
                  <div
                    className="rounded-[12px] p-3 mb-4 text-xs"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--md-accent-yellow, #eab308) 15%, transparent)",
                      color: "var(--md-accent-yellow, #eab308)",
                    }}
                  >
                    {t("release.rc_warning")}
                  </div>
                )}

                {loading && (
                  <p className="text-sm" style={{ color: "var(--md-text-muted)" }}>
                    {t("release.loading")}
                  </p>
                )}
                {error && !loading && (
                  <p className="text-sm" style={{ color: "var(--md-accent-red, #ef4444)" }}>
                    {t("release.error")}
                  </p>
                )}
                {release && !loading && (
                  <div
                    className="prose prose-sm max-w-none"
                    style={{ color: "var(--md-text-secondary)" }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--md-primary)" }}
                          >
                            {children}
                          </a>
                        ),
                        code: ({ children, className, ...props }) => {
                          const isInline = !className;
                          if (isInline) {
                            return (
                              <code
                                style={{
                                  backgroundColor: "rgba(255,255,255,0.06)",
                                  padding: "1px 4px",
                                  borderRadius: 4,
                                  fontSize: "0.85em",
                                }}
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          }
                          return (
                            <pre
                              style={{
                                backgroundColor: "rgba(255,255,255,0.04)",
                                borderRadius: 8,
                                padding: 12,
                                overflow: "auto",
                                fontSize: "0.85em",
                              }}
                            >
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          );
                        },
                        h1: ({ children }) => (
                          <h1
                            className="text-lg font-bold font-heading mt-4 mb-2"
                            style={{ color: "var(--md-text-primary)" }}
                          >
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2
                            className="text-base font-bold font-heading mt-4 mb-2"
                            style={{ color: "var(--md-text-primary)" }}
                          >
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3
                            className="text-sm font-bold font-heading mt-3 mb-1"
                            style={{ color: "var(--md-text-primary)" }}
                          >
                            {children}
                          </h3>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>
                        ),
                        p: ({ children }) => <p className="my-2 text-sm">{children}</p>,
                        hr: () => (
                          <hr className="my-4" style={{ borderColor: "rgba(255,255,255,0.06)" }} />
                        ),
                        blockquote: ({ children }) => (
                          <blockquote
                            className="border-l-2 pl-3 my-2 text-sm italic"
                            style={{
                              borderColor: "var(--md-primary)",
                              color: "var(--md-text-muted)",
                            }}
                          >
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {release.body}
                    </ReactMarkdown>
                  </div>
                )}
                {release && (
                  <div className="mt-4 text-center">
                    <a
                      href={release.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs inline-flex items-center gap-1 hover:underline"
                      style={{ color: "var(--md-primary)" }}
                    >
                      {t("release.view_on_github")} &rarr;
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
