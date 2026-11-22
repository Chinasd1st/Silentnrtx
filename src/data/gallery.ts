import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ImageMetadata } from "astro";
import exifr from "exifr";
import type { L10n } from "../i18n/ui";

export type Category = "design" | "photo";

export interface Exif {
  camera?: string;
  lens?: string;
  aperture?: string;
  shutter?: string;
  iso?: string;
  focal?: string;
}

export interface GalleryItem {
  id: string;
  category: Category;
  image: ImageMetadata;
  /** YYYY.MM.DD — from EXIF, else from a YYYY-MM-DD file-name prefix */
  date?: string;
  title?: L10n;
  exif?: Exif;
}

/**
 * Optional titles, keyed by file name (without extension).
 * Images without an entry still show — the date and camera data come from the file itself.
 */
const captions: Record<string, { title?: L10n }> = {
  // "2026-08-04-guangzhou": { title: { en: "Guangzhou", zh: "广州" } },
};

/** EXIF model codes → the names on the box */
const cameraNames: Record<string, string> = {
  "ILCE-7M4": "Sony α7 IV",
};

/**
 * Drop images into src/assets/gallery/design/ or src/assets/gallery/photo/.
 * They are resized to AVIF/WebP at build time and cached by hashed name.
 */
const files = import.meta.glob<{ default: ImageMetadata }>("../assets/gallery/{design,photo}/*.{jpg,jpeg,png,webp,avif}", {
  eager: true,
});

const pad = (n: number) => String(n).padStart(2, "0");

function shutter(t?: number) {
  if (!t) return undefined;
  return t >= 1 ? `${+t.toFixed(1)}s` : `1/${Math.round(1 / t)}s`;
}

async function readExif(globPath: string): Promise<{ exif?: Exif; date?: string }> {
  try {
    // glob keys are relative to src/data → resolve from the project root (build and dev both run there)
    const buf = await readFile(join(process.cwd(), "src", globPath.replace(/^\.\.\//, "")));
    const e = await exifr.parse(buf, {
      pick: ["Model", "LensModel", "FNumber", "ExposureTime", "ISO", "FocalLength", "DateTimeOriginal"],
    });
    if (!e) return {};
    const d: Date | undefined = e.DateTimeOriginal instanceof Date ? e.DateTimeOriginal : undefined;
    return {
      date: d ? `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}` : undefined,
      exif: {
        camera: e.Model ? (cameraNames[e.Model] ?? e.Model) : undefined,
        lens: e.LensModel || undefined,
        aperture: e.FNumber ? `ƒ/${+Number(e.FNumber).toFixed(1)}` : undefined,
        shutter: shutter(e.ExposureTime),
        iso: e.ISO ? `ISO ${e.ISO}` : undefined,
        focal: e.FocalLength ? `${Math.round(e.FocalLength)}mm` : undefined,
      },
    };
  } catch {
    return {};
  }
}

let cache: Promise<GalleryItem[]> | undefined;

/** All gallery items, newest first. Cached, so both language pages share one EXIF pass. */
export function loadGallery(): Promise<GalleryItem[]> {
  cache ??= Promise.all(
    Object.entries(files).map(async ([path, mod]) => {
      const [, category, name] = path.match(/gallery\/(design|photo)\/([^/]+)\.\w+$/) ?? [];
      const id = name ?? path;
      const { exif, date } = await readExif(path);
      const fromName = id.match(/^(\d{4})-(\d{2})-(\d{2})/);
      return {
        id,
        category: category as Category,
        image: mod.default,
        date: date ?? (fromName ? `${fromName[1]}.${fromName[2]}.${fromName[3]}` : undefined),
        exif,
        ...captions[id],
      } satisfies GalleryItem;
    }),
  ).then((list) => list.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || b.id.localeCompare(a.id)));
  return cache;
}
