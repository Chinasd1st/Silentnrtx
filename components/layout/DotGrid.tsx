"use client";

import { useEffect, useRef } from "react";

const SPACING = 32;
const GLOW_RADIUS = 150;
const BASE_ALPHA = 0.1;
const GLOW_ALPHA = 0.65;

export function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const context = canvasEl.getContext("2d");
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;
    const canvas: HTMLCanvasElement = canvasEl;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    let dots: { x: number; y: number }[] = [];
    let mouseX = -9999;
    let mouseY = -9999;
    let raf = 0;
    let dirty = true;

    const readPrimary = () => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--md-primary")
        .trim();
      // oklch(0.75 0.14 275) → extract components for canvas
      const m = raw.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
      if (!m) return { l: 0.75, c: 0.14, h: 275 };
      return { l: +m[1], c: +m[2], h: +m[3] };
    };

    let primary = readPrimary();

    // oklch → sRGB approximation (simplified)
    function oklchToRgb(L: number, C: number, H: number): [number, number, number] {
      const hr = (H * Math.PI) / 180;
      const a = C * Math.cos(hr);
      const b = C * Math.sin(hr);
      const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
      const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
      const s_ = L - 0.0894841775 * a - 1.291485548 * b;
      const l = l_ ** 3;
      const m = m_ ** 3;
      const s = s_ ** 3;
      const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
      const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
      const bb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
      const clamp = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 255);
      return [clamp(r), clamp(g), clamp(bb)];
    }

    function buildDots() {
      dots = [];
      const cols = Math.ceil(W / SPACING) + 1;
      const rows = Math.ceil(H / SPACING) + 1;
      const ox = (W - (cols - 1) * SPACING) / 2;
      const oy = (H - (rows - 1) * SPACING) / 2;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) dots.push({ x: ox + c * SPACING, y: oy + r * SPACING });
    }

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth;
      H = innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildDots();
      dirty = true;
    }

    function draw() {
      if (!dirty && !reduced) {
        raf = requestAnimationFrame(draw);
        return;
      }
      dirty = false;
      ctx.clearRect(0, 0, W, H);

      const [pr, pg, pb] = oklchToRgb(primary.l, primary.c, primary.h);

      for (const dot of dots) {
        const dx = mouseX - dot.x;
        const dy = mouseY - dot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let alpha = BASE_ALPHA;
        let radius = 1.1;

        if (dist < GLOW_RADIUS && !reduced) {
          const t = 1 - dist / GLOW_RADIUS;
          const ease = t * t;
          alpha = BASE_ALPHA + (GLOW_ALPHA - BASE_ALPHA) * ease;
          radius = 1.1 + 2.2 * ease;
          const r = Math.round(180 + (pr - 180) * ease);
          const g = Math.round(180 + (pg - 180) * ease);
          const b = Math.round(180 + (pb - 180) * ease);
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.fill();
          continue;
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      }

      if (!reduced) raf = requestAnimationFrame(draw);
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dirty = true;
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) {
        mouseX = t.clientX;
        mouseY = t.clientY;
        dirty = true;
      }
    };
    const onTouchEnd = () => {
      mouseX = -9999;
      mouseY = -9999;
      dirty = true;
    };
    const onLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
      dirty = true;
    };
    const onResize = () => {
      resize();
    };
    const onTheme = () => {
      primary = readPrimary();
      dirty = true;
    };

    const mo = new MutationObserver(onTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    resize();
    draw();

    addEventListener("mousemove", onMouseMove, { passive: true });
    addEventListener("touchmove", onTouch, { passive: true });
    addEventListener("touchend", onTouchEnd, { passive: true });
    addEventListener("mouseleave", onLeave);
    addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      removeEventListener("mousemove", onMouseMove);
      removeEventListener("touchmove", onTouch);
      removeEventListener("touchend", onTouchEnd);
      removeEventListener("mouseleave", onLeave);
      removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 -z-1" />;
}
