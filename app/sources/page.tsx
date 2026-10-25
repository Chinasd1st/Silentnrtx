"use client";

import Link from "next/link";
import { FiArrowLeft, FiExternalLink } from "react-icons/fi";
import { DATA_SOURCES, type DataSource, SOURCE_CATEGORIES } from "@/lib/data-sources";
import { useTranslation } from "@/lib/i18n";

export default function SourcesPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-16 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs transition-colors duration-200 hover:text-[var(--md-primary)]"
        style={{ color: "var(--md-text-muted)" }}
      >
        <FiArrowLeft size={13} aria-hidden="true" />
        {t("sources.back")}
      </Link>

      <h1
        className="mt-6 font-heading text-3xl font-bold tracking-tight"
        style={{ color: "var(--md-text-primary)" }}
      >
        {t("sources.title")}
      </h1>
      <p
        className="mt-2 max-w-2xl text-sm leading-relaxed"
        style={{ color: "var(--md-text-secondary)" }}
      >
        {t("sources.intro")}
      </p>

      {SOURCE_CATEGORIES.map((category) => {
        const items = DATA_SOURCES.filter((s) => s.category === category);
        if (items.length === 0) return null;

        return (
          <section key={category} className="mt-10">
            <h2
              className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--md-text-muted)" }}
            >
              {t(`sources.cat_${category}`)}
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {items.map((source) => (
                <SourceCard key={source.id} source={source} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function SourceCard({ source }: { source: DataSource }) {
  const { t } = useTranslation();
  const authLabel =
    source.auth === "key"
      ? t("sources.auth_key")
      : source.auth === "public"
        ? t("sources.auth_public")
        : t("sources.auth_none");

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-panel border p-4 transition-colors duration-200 hover:bg-white/6"
      style={{ backgroundColor: "var(--md-primary-008)", borderColor: "var(--md-card-border)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-semibold" style={{ color: "var(--md-text-primary)" }}>
          {source.name}
        </span>
        <FiExternalLink
          size={13}
          aria-hidden="true"
          className="mt-0.5 shrink-0 transition-colors duration-200 group-hover:text-[var(--md-primary)]"
          style={{ color: "var(--md-text-muted)" }}
        />
      </div>
      <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "var(--md-text-secondary)" }}>
        {t(source.descKey)}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge>{authLabel}</Badge>
        {source.cacheMin ? (
          <Badge>
            {source.cacheMin} {t("sources.minutes")}
          </Badge>
        ) : null}
      </div>
    </a>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px]"
      style={{ backgroundColor: "var(--md-primary-008)", color: "var(--md-text-muted)" }}
    >
      {children}
    </span>
  );
}
