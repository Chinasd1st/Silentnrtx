"use client";

import { useEffect, useState } from "react";
import { FaKeyboard } from "react-icons/fa6";
import { Modal } from "@/components/ui/Modal";
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

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      icon={<FaKeyboard size={13} />}
      title={t("shortcuts.title")}
      closeLabel={t("shortcuts.close")}
      size="sm"
    >
      <div className="space-y-3">
        {SHORTCUTS.map((s) => (
          <div key={s.key} className="flex items-center justify-between gap-3">
            <span className="text-sm" style={{ color: "var(--md-text-secondary)" }}>
              {t(s.descKey)}
            </span>
            <kbd
              className="rounded-micro px-2.5 py-1 text-xs font-medium"
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
    </Modal>
  );
}
