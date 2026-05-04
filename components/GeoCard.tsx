"use client";

import { useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";

export function GeoCard() {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState(false);

  const request = () => {
    if (!navigator.geolocation) { setError(true); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setError(true),
      { timeout: 5000, enableHighAccuracy: false },
    );
  };

  if (error) return (
    <div className="md-card">
      <div className="flex items-center gap-3 mb-3">
        <FaMapMarkerAlt className="text-lg shrink-0" style={{ color: "var(--md-text-muted)" }} />
        <h3 className="font-heading text-lg font-semibold" style={{ color: "var(--md-text-primary)" }}>Location</h3>
      </div>
      <p className="text-xs" style={{ color: "var(--md-text-muted)" }}>定位不可用或已拒绝</p>
    </div>
  );

  if (!pos) return (
    <div className="md-card">
      <div className="flex items-center gap-3 mb-3">
        <FaMapMarkerAlt className="text-lg shrink-0" style={{ color: "var(--md-primary)" }} />
        <h3 className="font-heading text-lg font-semibold" style={{ color: "var(--md-text-primary)" }}>Location</h3>
      </div>
      <button onClick={request}
        className="rounded-full px-4 py-1.5 text-xs font-medium transition-all hover:scale-105"
        style={{ backgroundColor: "var(--md-primary-020)", color: "var(--md-primary)" }}>
        显示我的位置
      </button>
    </div>
  );

  return (
    <div className="md-card">
      <div className="flex items-center gap-3 mb-3">
        <FaMapMarkerAlt className="text-lg shrink-0" style={{ color: "var(--md-primary)" }} />
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-lg font-semibold" style={{ color: "var(--md-text-primary)" }}>Your Location</h3>
        </div>
      </div>
      <p className="text-sm" style={{ color: "var(--md-text-secondary)" }}>
        {pos.lat.toFixed(4)}, {pos.lng.toFixed(4)}
      </p>
      <a href={`https://www.openstreetmap.org/?mlat=${pos.lat}&mlon=${pos.lng}&zoom=12`} target="_blank" rel="noopener noreferrer"
        className="text-xs mt-1 inline-block transition-colors hover:underline" style={{ color: "var(--md-text-muted)" }}>
        OpenStreetMap &rarr;
      </a>
    </div>
  );
}
