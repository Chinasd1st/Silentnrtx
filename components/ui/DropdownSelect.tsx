"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownSelectProps {
  value: string;
  options: readonly DropdownOption[];
  onChange: (value: string) => void;
}

export function DropdownSelect({ value, options, onChange }: DropdownSelectProps) {
  const [open, setOpen] = useState(false);
  const [flipUp, setFlipUp] = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const listboxId = `${uid}-listbox`;

  const selectedIdx = options.findIndex((o) => o.value === value);
  const label = selectedIdx === -1 ? options[0]?.label || "" : options[selectedIdx].label;

  const close = useCallback(() => {
    setOpen(false);
    setFocusIdx(-1);
    triggerRef.current?.focus();
  }, []);

  // Click-outside-to-close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setFocusIdx(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Measure real DOM dimensions after open, delayed one frame
  useEffect(() => {
    if (!open || !menuRef.current || !ref.current) return;
    const raf = requestAnimationFrame(() => {
      if (!menuRef.current || !ref.current) return;
      const menuH = menuRef.current.getBoundingClientRect().height;
      const triggerRect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      setFlipUp(spaceBelow < menuH && spaceAbove > spaceBelow);
    });
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // Focus the listbox when opened
  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
  }, [open]);

  // Auto-scroll to currently selected item on open, and when focusIdx changes
  useEffect(() => {
    if (!open || !listRef.current || options.length === 0) return;
    const targetIdx = focusIdx >= 0 ? focusIdx : selectedIdx >= 0 ? selectedIdx : 0;
    const child = listRef.current.children[targetIdx] as HTMLElement | undefined;
    child?.scrollIntoView({ block: "nearest" });
  }, [open, focusIdx, selectedIdx, options.length]);

  const select = useCallback(
    (idx: number) => {
      if (idx >= 0 && idx < options.length) {
        onChange(options[idx].value);
      }
      close();
    },
    [onChange, options, close]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
        setFocusIdx(selectedIdx >= 0 ? selectedIdx : 0);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusIdx((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusIdx((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusIdx >= 0) select(focusIdx);
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        className="flex w-full items-center justify-between rounded-[16px] px-3 py-2 text-xs border transition-all duration-200 hover:bg-white/6 cursor-pointer"
        style={{
          borderColor: "var(--md-card-border)",
          color: "var(--md-text-primary)",
          backgroundColor: "var(--md-card-bg)",
        }}
      >
        <span>{label}</span>
        <FiChevronDown
          size={12}
          className="transition-transform duration-200"
          style={{
            transform: open ? "rotate(180deg)" : undefined,
            color: "var(--md-text-muted)",
          }}
        />
      </button>
      {open && (
        <div
          ref={menuRef}
          className={`absolute left-0 right-0 z-50 ${flipUp ? "bottom-full mb-1" : "top-full mt-1"}`}
        >
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            aria-label={label}
            onKeyDown={handleKeyDown}
            className="rounded-[16px] border py-1 shadow-lg overflow-y-auto"
            style={{
              maxHeight: 280,
              borderColor: "var(--md-card-border)",
              backgroundColor: "var(--md-card-bg)",
            }}
          >
            {options.length === 0 && (
              <div
                className="px-3 py-3 text-xs text-center"
                style={{ color: "var(--md-text-muted)" }}
              >
                No options
              </div>
            )}
            {options.map((opt, idx) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                id={`${uid}-opt-${idx}`}
                aria-selected={opt.value === value}
                tabIndex={-1}
                onClick={() => select(idx)}
                className="flex w-full items-center px-3 py-1.5 text-xs transition-all duration-200 hover:bg-white/6 cursor-pointer"
                style={{
                  color: opt.value === value ? "var(--md-primary)" : "var(--md-text-primary)",
                  backgroundColor: idx === focusIdx ? "var(--md-primary-008)" : undefined,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
