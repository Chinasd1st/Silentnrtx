"use client";

import { useEffect, useState } from "react";
import { FaKeyboard } from "react-icons/fa";

const SHORTCUTS = [
  { key: "?", desc: "打开/关闭快捷键面板" },
  { key: "Space", desc: "播放/暂停音乐" },
  { key: "→", desc: "下一首" },
  { key: "Escape", desc: "关闭面板" },
];

export function ShortcutsPanel() {
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setOpen(false)}
      role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(false); } }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" />
      <div className="relative rounded-[24px] p-6 w-full max-w-sm" style={{ backgroundColor: "var(--md-card-bg)", border: "1px solid var(--md-card-border)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-5">
          <FaKeyboard className="text-lg" style={{ color: "var(--md-primary)" }} />
          <h2 className="font-heading text-lg font-semibold" style={{ color: "var(--md-text-primary)" }}>快捷键</h2>
        </div>
        <div className="space-y-3">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "var(--md-text-secondary)" }}>{s.desc}</span>
              <kbd className="rounded-[8px] px-2.5 py-1 text-xs font-mono" style={{ backgroundColor: "var(--md-surface-variant)", color: "var(--md-on-surface-variant)" }}>
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
