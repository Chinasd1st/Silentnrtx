"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-heading text-6xl font-bold" style={{ color: "var(--md-primary)" }}>
        404
      </h1>
      <p className="text-lg" style={{ color: "var(--md-text-secondary)" }}>
        {t("not_found.title")}
      </p>
      <Link
        href="/"
        className="rounded-md3-pill px-6 py-2 text-sm font-medium transition-all duration-200 hover:opacity-90"
        style={{ backgroundColor: "var(--md-primary)", color: "var(--md-on-primary)" }}
      >
        {t("not_found.go_home")}
      </Link>
    </div>
  );
}
