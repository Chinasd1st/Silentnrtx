"use client";

import { useEffect, useRef, useState } from "react";

const INTERACTIVE =
  "a, button, [role='button'], input, textarea, select, summary, [data-cursor='hover']";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced) return;

    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;
    let visible = false;

    const show = () => {
      if (visible) return;
      visible = true;
      for (const el of [dotRef.current, ringRef.current]) {
        if (el) el.style.opacity = "1";
      }
    };

    const onMove = (event: PointerEvent) => {
      mx = event.clientX;
      my = event.clientY;
      show();
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      }
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const hovering = !!target?.closest?.(INTERACTIVE);
      if (ringRef.current) ringRef.current.dataset.hover = hovering ? "true" : "false";
    };

    const onDown = () => ringRef.current?.classList.add("is-down");
    const onUp = () => ringRef.current?.classList.remove("is-down");

    const onLeave = () => {
      visible = false;
      for (const el of [dotRef.current, ringRef.current]) {
        if (el) el.style.opacity = "0";
      }
    };

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="custom-cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="custom-cursor-ring" data-hover="false" aria-hidden="true" />
    </>
  );
}
