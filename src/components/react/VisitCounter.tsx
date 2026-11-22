import { useVercount } from "@vercount/react";

interface Props {
  locale: string;
  labels: { label: string; page: string; site: string; visitors: string };
}

/**
 * Vercount counters. The hook reports a visit for the current URL once per mount;
 * the footer is re-rendered on every client-side navigation, so each page view is counted.
 * Until the request returns (or if it fails) the numbers show as "—" instead of 0.
 */
export default function VisitCounter({ locale, labels }: Props) {
  const { pagePv, sitePv, siteUv } = useVercount();
  const fmt = (v: string) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n.toLocaleString(locale) : "—";
  };
  const rows = [
    { k: labels.page, v: pagePv },
    { k: labels.site, v: sitePv },
    { k: labels.visitors, v: siteUv },
  ];

  return (
    <dl className="visits" aria-label={labels.label}>
      {rows.map((r) => (
        <div key={r.k}>
          <dt>{r.k}</dt>
          <dd>{fmt(r.v)}</dd>
        </div>
      ))}
    </dl>
  );
}
