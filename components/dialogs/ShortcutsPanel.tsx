"use client";

import { useEffect, useState } from "react";
import { FaKeyboard } from "react-icons/fa";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { useTranslation } from "@/lib/i18n";

const SHORTCUTS = [
  { key: "?", descKey: "shortcuts.open" },
  { key: "Space", descKey: "shortcuts.play" },
  { key: "→", descKey: "shortcuts.next" },
  { key: "Escape", descKey: "shortcuts.close" },
];

export function ShortcutsPanel() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "?" || e.key === "/") && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const dialogRef = useFocusTrap(open);

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-100 flex items-center justify-center p-4 cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" />
      <div
        className="relative rounded-md3 p-6 w-full max-w-sm"
        style={{ backgroundColor: "var(--md-card-bg)", border: "1px solid var(--md-card-border)" }}
      >
        <div className="flex items-center gap-3 mb-5">
          <FaKeyboard className="text-lg" style={{ color: "var(--md-primary)" }} />
          <h2
            className="font-heading text-lg font-semibold"
            style={{ color: "var(--md-text-primary)" }}
          >
            {t("shortcuts.title")}
          </h2>
        </div>
        <div className="space-y-3">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "var(--md-text-secondary)" }}>
                {t(s.descKey)}
              </span>
              <kbd
                className="rounded-[8px] px-2.5 py-1 text-xs font-mono"
                style={{
                  backgroundColor: "var(--md-surface-variant)",
                  color: "var(--md-on-surface-variant)",
                }}
              >
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
