import type { APIRoute } from "astro";
import { href, type Lang } from "../i18n/ui";

/**
 * /Silentnrtx/sitemap.xml — every page in both languages, each entry listing its
 * translations so search engines treat /about/ and /zh/about/ as one page in two languages.
 * Add a route here when you add a page.
 */
const routes = ["", "about/", "gallery/", "contact/"];
const langs: { id: Lang; hreflang: string }[] = [
  { id: "en", hreflang: "en" },
  { id: "zh", hreflang: "zh-CN" },
];

export const GET: APIRoute = ({ site }) => {
  const abs = (path: string) => new URL(path, site ?? "https://silentnrtx.top").href;
  const lastmod = new Date().toISOString().slice(0, 10);

  const urls = routes.flatMap((route) => {
    const alternates = [
      ...langs.map((l) => `    <xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${abs(href(l.id, route))}"/>`),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(href("en", route))}"/>`,
    ].join("\n");
    return langs.map(
      (l) => `  <url>
    <loc>${abs(href(l.id, route))}</loc>
    <lastmod>${lastmod}</lastmod>
${alternates}
  </url>`,
    );
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
