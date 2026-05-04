"use client";

import { useTranslation } from "@/lib/i18n";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

export function ErrorCard({
  title,
  onRetry,
}: {
  title: string;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="md-card flex flex-col items-center justify-center gap-3 py-10 text-center">
      <FiAlertCircle className="text-2xl" style={{ color: "var(--md-text-muted)" }} />
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--md-text-secondary)" }}>{title}</p>
        <p className="text-xs mt-1" style={{ color: "var(--md-text-muted)" }}>{t("github.error")}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all hover:scale-105"
          style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "var(--md-text-secondary)" }}
        >
          <FiRefreshCw size={12} />
          {t("error.retry")}
        </button>
      )}
    </div>
  );
}
