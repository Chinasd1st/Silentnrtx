"use client";

import { useEffect, useState } from "react";

const DAYS = ["日", "一", "二", "三", "四", "五", "六"];

function now() {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const cst = new Date(utc + 8 * 3600000);
  return {
    h: cst.getHours(),
    m: cst.getMinutes(),
    s: cst.getSeconds(),
    year: cst.getFullYear(),
    month: cst.getMonth() + 1,
    day: cst.getDate(),
    weekday: DAYS[cst.getDay()],
  };
}

export function ClockCard() {
  const [t, setT] = useState<ReturnType<typeof now> | null>(null);

  useEffect(() => {
    setT(now());
    const id = setInterval(() => setT(now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!t) {
    return (
      <div className="md-card animate-fade-in-up">
        <div className="flex items-center gap-6">
          <div className="w-[72px] h-[72px] shrink-0" />
          <div className="min-w-0">
            <div className="font-heading text-5xl font-light tracking-[-2px] leading-none" style={{ color: "var(--md-text-primary)" }}>
              <span>--:--:--</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hh = String(t.h).padStart(2, "0");
  const mm = String(t.m).padStart(2, "0");
  const ss = String(t.s).padStart(2, "0");

  const degH = (t.h % 12) * 30 + t.m * 0.5;
  const degM = t.m * 6 + t.s * 0.1;
  const degS = t.s * 6;
  const c = "var(--md-primary)";

  return (
    <div className="md-card animate-fade-in-up">
      <div className="flex items-center gap-6">
        <svg width="72" height="72" viewBox="0 0 100 100" className="shrink-0">
          <rect x="46" y="26" width="8" height="26" rx="4" fill="var(--md-text-primary)"
            style={{ transform: `rotate(${degH}deg)`, transformOrigin: "50px 50px" }} />
          <rect x="47.5" y="20" width="5" height="34" rx="2.5" fill="var(--md-text-primary)"
            style={{ transform: `rotate(${degM}deg)`, transformOrigin: "50px 50px" }} />
          <circle cx="50" cy="18" r="3" fill={c}
            style={{ transform: `rotate(${degS}deg)`, transformOrigin: "50px 50px", transition: "transform 0.3s cubic-bezier(0.2, 0, 0, 1)" }} />
          <circle cx="50" cy="50" r="3" fill={c} />
        </svg>

        <div className="min-w-0">
          <div className="flex items-center gap-1 font-heading text-5xl font-light tracking-[-2px] leading-none" style={{ color: "var(--md-text-primary)" }}>
            <span className="tabular-nums">{hh}</span>
            <span className="inline-block text-[0.85em] leading-none opacity-80 font-normal relative" style={{ top: "-0.05em" }}>:</span>
            <span className="tabular-nums">{mm}</span>
            <span className="inline-block text-[0.85em] leading-none opacity-60 font-normal relative" style={{ top: "-0.05em" }}>:</span>
            <span className="tabular-nums" style={{ color: c }}>{ss}</span>
          </div>
          <div className="mt-2 text-xs tracking-wide" style={{ color: "var(--md-text-secondary)" }}>
            {t.year}年{t.month}月{t.day}日 周{t.weekday}
          </div>
          <div className="mt-0.5 text-[10px]" style={{ color: "var(--md-text-muted)" }}>
            北京时间 · UTC+8
          </div>
        </div>
      </div>
    </div>
  );
}
