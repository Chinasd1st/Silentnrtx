import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MdCheck, MdContentCopy } from "react-icons/md";

interface Props {
  value: string;
  label: string;
  /** "{value}" is replaced with the copied text. */
  copiedText: string;
}

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.append(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

export default function CopyHandle({ value, label, copiedText }: Props) {
  const [done, setDone] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
    return () => window.clearTimeout(timer.current);
  }, []);

  const copy = async () => {
    await writeClipboard(value);
    setDone(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDone(false), 2400);
  };

  // The snackbar is portaled to <body>: the card rotates on hover, and a transformed
  // ancestor would otherwise trap a position:fixed element inside the card.
  const snackbar = (
    <div role="status" aria-live="polite" className="snackbar" data-open={done || undefined}>
      {done ? copiedText.replace("{value}", value) : ""}
    </div>
  );

  return (
    <>
      <button type="button" className="icon-btn state" onClick={copy} aria-label={label} title={label}>
        {done ? <MdCheck aria-hidden="true" size={22} /> : <MdContentCopy aria-hidden="true" size={20} />}
      </button>
      {mounted && createPortal(snackbar, document.body)}
    </>
  );
}
