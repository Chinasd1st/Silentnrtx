"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { getEffectiveTimezone, getUtcOffset } from "@/lib/timezone";

function now(tz: string) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: tz,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value || 0);
  return {
    h: get("hour"),
    m: get("minute"),
    s: get("second"),
    year: get("year"),
    month: get("month"),
    day: get("day"),
  };
}

export function ClockCard() {
  const { i18n } = useTranslation();
  const [tz, setTz] = useState(getEffectiveTimezone);
  const [t, setT] = useState<ReturnType<typeof now> | null>(null);
  const totalSec = useRef(0);
  const prevS = useRef(-1);

  useEffect(() => {
    const onSettings = () => setTz(getEffectiveTimezone());
    window.addEventListener("settings-changed", onSettings);
    return () => window.removeEventListener("settings-changed", onSettings);
  }, []);

  const utcLabel = useCallback(() => getUtcOffset(tz), [tz]);

  useEffect(() => {
    const n = now(tz);
    totalSec.current = n.h * 3600 + n.m * 60 + n.s;
    prevS.current = n.s;
    setT(n);
    const id = setInterval(() => {
      const n2 = now(tz);
      const ds = n2.s - prevS.current;
      prevS.current = n2.s;
      totalSec.current += ds < 0 ? ds + 60 : ds;
      setT(n2);
    }, 1000);
    return () => clearInterval(id);
  }, [tz]);

  if (!t) {
    return (
      <div className="md-card">
        <div className="flex items-center gap-6">
          <div className="w-[72px] h-[72px] shrink-0" />
          <div className="min-w-0">
            <div
              className="font-heading text-3xl sm:text-4xl xl:text-5xl font-light tracking-[-1px] sm:tracking-[-2px] leading-none"
              style={{ color: "var(--md-text-primary)" }}
            >
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
  const degS = totalSec.current * 6;
  const c = "var(--md-primary)";

  return (
    <div className="md-card">
      <div className="flex items-center gap-4 sm:gap-6">
        <svg
          width="56"
          height="56"
          className="sm:w-[72px] sm:h-[72px] shrink-0"
          viewBox="0 0 100 100"
          role="img"
          aria-label={`${hh}:${mm}:${ss}`}
        >
          <title>{`${hh}:${mm}:${ss}`}</title>
          <path
            fill={c}
            fillOpacity="0.1"
            transform="translate(50, 50) scale(0.2) translate(-250, -250)"
            d="M469.881,324.15a90.631,90.631,0,0,1,7.616-28.425l15.88-32.267c3.642-7.4,3.642-19.514,0-26.916L477.5,204.275a90.631,90.631,0,0,1-7.616-28.425L467.5,139.967c-.547-8.232-6.6-18.722-13.459-23.311l-29.885-20a90.643,90.643,0,0,1-20.809-20.809l-20-29.885C378.755,39.1,368.265,33.047,360.033,32.5L324.15,30.119A90.631,90.631,0,0,1,295.725,22.5L263.458,6.623c-7.4-3.642-19.514-3.642-26.916,0L204.275,22.5a90.631,90.631,0,0,1-28.425,7.616L139.967,32.5c-8.232.547-18.722,6.6-23.311,13.459l-20,29.885A90.643,90.643,0,0,1,75.844,96.653l-29.885,20C39.1,121.245,33.047,131.735,32.5,139.967L30.119,175.85A90.631,90.631,0,0,1,22.5,204.275L6.623,236.542c-3.642,7.4-3.642,19.514,0,26.916L22.5,295.725a90.631,90.631,0,0,1,7.616,28.425L32.5,360.033c.546,8.232,6.6,18.722,13.458,23.311l29.885,20a90.643,90.643,0,0,1,20.809,20.809l20,29.885c4.589,6.856,15.079,12.912,23.311,13.459l35.883,2.381a90.631,90.631,0,0,1,28.425,7.616l32.267,15.88c7.4,3.642,19.514,3.642,26.916,0l32.267-15.88a90.631,90.631,0,0,1,28.425-7.616l35.883-2.381c8.232-.547,18.722-6.6,23.311-13.459l20-29.885a90.643,90.643,0,0,1,20.809-20.809l29.885-20c6.856-4.589,12.912-15.079,13.458-23.311Z"
          />
          <rect
            x="47"
            y="26"
            width="6"
            height="26"
            rx="3"
            fill={c}
            style={{ transform: `rotate(${degH}deg)`, transformOrigin: "50px 50px" }}
          />
          <rect
            x="47"
            y="18"
            width="6"
            height="34"
            rx="3"
            fill="var(--md-text-primary)"
            style={{ transform: `rotate(${degM}deg)`, transformOrigin: "50px 50px" }}
          />
          <circle
            cx="50"
            cy="10"
            r="3.5"
            fill="var(--md-accent-pink)"
            style={{
              transform: `rotate(${degS}deg)`,
              transformOrigin: "50px 50px",
              transition: "transform 0.3s cubic-bezier(0.2, 0, 0, 1)",
            }}
          />
        </svg>

        <div className="min-w-0">
          <div
            className="flex items-center gap-1 font-heading text-3xl sm:text-4xl xl:text-5xl font-light tracking-[-1px] sm:tracking-[-2px] leading-none"
            style={{ color: "var(--md-text-primary)" }}
          >
            <span className="tabular-nums">{hh}</span>
            <span
              className="inline-block text-[0.85em] leading-none opacity-80 font-normal relative"
              style={{ top: "-0.05em" }}
            >
              :
            </span>
            <span className="tabular-nums">{mm}</span>
            <span
              className="inline-block text-[0.85em] leading-none opacity-60 font-normal relative"
              style={{ top: "-0.05em" }}
            >
              :
            </span>
            <span className="tabular-nums" style={{ color: c }}>
              {ss}
            </span>
          </div>
          <div className="mt-1 text-xs" style={{ color: "var(--md-text-secondary)" }}>
            {new Intl.DateTimeFormat(i18n.language, {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
              timeZone: tz,
            }).format(new Date(Date.UTC(t.year, t.month - 1, t.day)))}
            <span className="ml-1.5" style={{ color: "var(--md-primary)" }}>
              {utcLabel()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
