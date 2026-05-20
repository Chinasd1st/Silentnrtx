#!/usr/bin/env node

/**
 * Image Optimization Build Script
 * Scans public/images, generates responsive variants in WebP/AVIF,
 * and outputs an image manifest for the OptimizedImage component.
 */

import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import sharp from "sharp";

const PROJECT_ROOT = path.resolve(__dirname, "..");
const IMAGES_DIR = path.join(PROJECT_ROOT, "public", "images");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "public", "optimized");
const MANIFEST_PATH = path.join(PROJECT_ROOT, "image-manifest.json");
const CACHE_PATH = path.join(PROJECT_ROOT, "scripts", "image-cache.json");

const TARGET_WIDTHS = [400, 800, 1200, 1600, 2000];
const QUALITY_WEBP = 80;
const QUALITY_AVIF = 65;
interface ImageVariant {
  width: number;
  format: "webp" | "avif";
  filename: string;
  size: number;
  url: string;
}

interface ImageManifestEntry {
  id: string;
  original: string;
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
  variants: ImageVariant[];
  srcset: string;
  avifSrcset: string;
  sizes: string;
  blurDataURL: string;
  aspectRatio: number;
}

interface ImageManifest {
  version: string;
  generated: string;
  images: Record<string, ImageManifestEntry>;
}

interface CacheEntry {
  hash: string;
  mtime: number;
  variants: Record<string, string>;
}

interface ImageCache {
  [filename: string]: CacheEntry;
}

function log(message: string, type: "info" | "warn" | "error" | "success" = "info"): void {
  const prefix = { info: "ℹ", warn: "⚠", error: "✖", success: "✓" }[type];
  console.log(`${prefix} ${message}`);
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function computeFileHash(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 16);
}

function getFileMtime(filePath: string): number {
  return fs.statSync(filePath).mtimeMs;
}

function loadCache(): ImageCache {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
    }
  } catch {
    log("Failed to load cache, starting fresh", "warn");
  }
  return {};
}

function saveCache(cache: ImageCache): void {
  ensureDir(path.dirname(CACHE_PATH));
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

// 现代 Sharp 处理函数
async function processImage(
  imagePath: string,
  cache: ImageCache
): Promise<ImageManifestEntry | null> {
  const filename = path.basename(imagePath);
  const ext = path.extname(filename).toLowerCase();
  const basename = path.basename(filename, ext);

  if (![".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff", ".tif"].includes(ext)) {
    log(`Skipping unsupported format: ${filename}`, "warn");
    return null;
  }

  log(`Processing: ${filename}`);

  const currentHash = computeFileHash(imagePath);
  const currentMtime = getFileMtime(imagePath);
  const cached = cache[filename];

  let metadata: sharp.Metadata;
  try {
    metadata = await sharp(imagePath).metadata();
  } catch {
    log(`Failed to read metadata: ${filename}`, "error");
    return null;
  }

  const originalWidth = metadata.width || 0;
  const originalHeight = metadata.height || 0;
  const originalSize = fs.statSync(imagePath).size;

  if (originalWidth === 0 || originalHeight === 0) {
    log(`Invalid image dimensions: ${filename}`, "error");
    return null;
  }

  ensureDir(OUTPUT_DIR);

  const variants: ImageVariant[] = [];
  const neededWidths = TARGET_WIDTHS.filter((w) => w <= originalWidth);
  if (neededWidths.length === 0) neededWidths.unshift(originalWidth);

  const processVariant = async (
    width: number,
    format: "webp" | "avif"
  ): Promise<ImageVariant | null> => {
    const variantFilename = `${basename}-${width}w.${format}`;
    const variantPath = path.join(OUTPUT_DIR, variantFilename);
    const cacheKey = `${width}w-${format}`;

    // 缓存命中检查
    if (cached?.hash === currentHash && cached.variants[cacheKey] && fs.existsSync(variantPath)) {
      const stats = fs.statSync(variantPath);
      log(`  Skipping unchanged: ${variantFilename}`, "info");
      return {
        width,
        format,
        filename: variantFilename,
        size: stats.size,
        url: `/optimized/${variantFilename}`,
      };
    }

    try {
      const quality = format === "webp" ? QUALITY_WEBP : QUALITY_AVIF;

      await sharp(imagePath)
        .rotate() // 自动校正方向（非常重要）
        .resize(width, null, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toFormat(format, {
          quality,
          effort: format === "webp" ? 4 : 6, // AVIF effort 更高一点
        })
        .toFile(variantPath);

      const stats = fs.statSync(variantPath);
      return {
        width,
        format,
        filename: variantFilename,
        size: stats.size,
        url: `/optimized/${variantFilename}`,
      };
    } catch (e) {
      log(`Failed to generate ${variantFilename}: ${e}`, "error");
      return null;
    }
  };

  // 并发生成所有变体
  const tasks = [];
  for (const width of neededWidths) {
    tasks.push(processVariant(width, "webp"));
    if (width <= 1200) {
      tasks.push(processVariant(width, "avif"));
    }
  }

  const results = await Promise.all(tasks);
  variants.push(...results.filter((v): v is ImageVariant => v !== null));
  variants.sort((a, b) => a.width - b.width);

  // 生成 srcset
  const webpSrcset = variants
    .filter((v) => v.format === "webp")
    .map((v) => `${v.url} ${v.width}w`)
    .join(", ");

  const avifSrcset = variants
    .filter((v) => v.format === "avif")
    .map((v) => `${v.url} ${v.width}w`)
    .join(", ");

  // 生成低质量模糊图
  let blurDataURL = "";
  try {
    const blurBuffer = await sharp(imagePath)
      .rotate()
      .resize(8, 8, { fit: "inside" })
      .blur(0.8)
      .jpeg({ quality: 60 })
      .toBuffer();

    blurDataURL = `data:image/jpeg;base64,${blurBuffer.toString("base64")}`;
  } catch {
    log(`Failed to generate blur for ${filename}`, "warn");
  }

  // 更新缓存
  cache[filename] = {
    hash: currentHash,
    mtime: currentMtime,
    variants: Object.fromEntries(variants.map((v) => [`${v.width}w-${v.format}`, v.filename])),
  };

  return {
    id: currentHash,
    original: `/${filename}`,
    originalWidth,
    originalHeight,
    originalSize,
    variants,
    srcset: webpSrcset,
    avifSrcset,
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    blurDataURL,
    aspectRatio: originalWidth / originalHeight,
  };
}

async function main(): Promise<void> {
  console.log("\n🖼️  Image Optimization Build");
  console.log("==========================\n");

  const startTime = Date.now();

  ensureDir(IMAGES_DIR);
  ensureDir(OUTPUT_DIR);

  const imageFiles = fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => !f.startsWith("."))
    .map((f) => path.join(IMAGES_DIR, f));

  if (imageFiles.length === 0) {
    log("No images found in public/images/", "warn");
    // ... 省略原有提示逻辑
    fs.writeFileSync(
      MANIFEST_PATH,
      JSON.stringify(
        {
          version: "1.0.0",
          generated: new Date().toISOString(),
          images: {},
        },
        null,
        2
      )
    );
    return;
  }

  log(`Found ${imageFiles.length} image(s) to process`, "info");

  const cache = loadCache();
  const results = await Promise.all(imageFiles.map((file) => processImage(file, cache)));

  const manifest: ImageManifest = {
    version: "1.0.0",
    generated: new Date().toISOString(),
    images: {},
  };

  let processedCount = 0;
  results.forEach((entry) => {
    if (entry) {
      manifest.images[entry.id] = entry;
      processedCount++;
    }
  });

  saveCache(cache);
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`Build complete in ${duration}s`, "success");
  log(`  Processed: ${processedCount} images`, "info");
  log(`  Output: ${OUTPUT_DIR}`, "info");
}

main().catch((error) => {
  console.error("\n✖ Build failed:", error);
  process.exit(1);
});
