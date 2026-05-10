#!/usr/bin/env node

/**
 * Image Optimization Build Script
 * Scans public/images, generates responsive variants in WebP/AVIF,
 * and outputs an image manifest for the OptimizedImage component.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import sharp from 'sharp';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(PROJECT_ROOT, 'public', 'images');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'public', 'optimized');
const MANIFEST_PATH = path.join(PROJECT_ROOT, 'image-manifest.json');
const CACHE_PATH = path.join(PROJECT_ROOT, 'scripts', 'image-cache.json');

const TARGET_WIDTHS = [400, 800, 1200, 1600, 2000];
const QUALITY_WEBP = 80;
const QUALITY_AVIF = 65;
const CONCURRENCY_LIMIT = 4;

interface ImageVariant {
  width: number;
  format: 'webp' | 'avif';
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

function log(message: string, type: 'info' | 'warn' | 'error' | 'success' = 'info'): void {
  const prefix = {
    info: 'ℹ',
    warn: '⚠',
    error: '✖',
    success: '✓',
  }[type];
  console.log(`${prefix} ${message}`);
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function computeFileHash(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16);
}

function getFileMtime(filePath: string): number {
  const stats = fs.statSync(filePath);
  return stats.mtimeMs;
}

function loadCache(): ImageCache {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
    }
  } catch (e) {
    log('Failed to load cache, starting fresh', 'warn');
  }
  return {};
}

function saveCache(cache: ImageCache): void {
  ensureDir(path.dirname(CACHE_PATH));
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

async function processImage(
  imagePath: string,
  cache: ImageCache
): Promise<ImageManifestEntry | null> {
  const filename = path.basename(imagePath);
  const ext = path.extname(filename).toLowerCase();
  const basename = path.basename(filename, ext);

  if (!['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.tif'].includes(ext)) {
    log(`Skipping unsupported format: ${filename}`, 'warn');
    return null;
  }

  log(`Processing: ${filename}`);

  const currentHash = computeFileHash(imagePath);
  const currentMtime = getFileMtime(imagePath);
  const cached = cache[filename];

  let metadata: sharp.Metadata;
  try {
    metadata = await sharp(imagePath).metadata();
  } catch (e) {
    log(`Failed to read metadata: ${filename}`, 'error');
    return null;
  }

  const originalWidth = metadata.width || 0;
  const originalHeight = metadata.height || 0;
  const originalStats = fs.statSync(imagePath);
  const originalSize = originalStats.size;

  if (originalWidth === 0 || originalHeight === 0) {
    log(`Invalid image dimensions: ${filename}`, 'error');
    return null;
  }

  ensureDir(OUTPUT_DIR);

  const variants: ImageVariant[] = [];
  const neededWidths = TARGET_WIDTHS.filter(w => w <= originalWidth);

  if (neededWidths.length === 0 || neededWidths[0] > originalWidth) {
    neededWidths.unshift(originalWidth);
  }

  const processVariant = async (width: number, format: 'webp' | 'avif'): Promise<ImageVariant | null> => {
    const variantFilename = `${basename}-${width}w.${format}`;
    const variantPath = path.join(OUTPUT_DIR, variantFilename);

    const variantCacheKey = `${width}w-${format}`;
    if (cached && cached.variants[variantCacheKey] && cached.hash === currentHash) {
      if (fs.existsSync(variantPath)) {
        const stats = fs.statSync(variantPath);
        log(`  Skipping unchanged: ${variantFilename}`, 'info');
        return {
          width,
          format,
          filename: variantFilename,
          size: stats.size,
          url: `/optimized/${variantFilename}`,
        };
      }
    }

    try {
      const quality = format === 'webp' ? QUALITY_WEBP : QUALITY_AVIF;
      const sharpInstance = sharp(imagePath)
        .resize(width, null, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFormat(format, { quality });

      await sharpInstance.toFile(variantPath);

      const stats = fs.statSync(variantPath);
      return {
        width,
        format,
        filename: variantFilename,
        size: stats.size,
        url: `/optimized/${variantFilename}`,
      };
    } catch (e) {
      log(`Failed to generate ${variantFilename}: ${e}`, 'error');
      return null;
    }
  };

  const tasks: Promise<ImageVariant | null>[] = [];

  for (const width of neededWidths) {
    tasks.push(processVariant(width, 'webp'));
    if (width <= 1200) {
      tasks.push(processVariant(width, 'avif'));
    }
  }

  const results = await Promise.all(tasks);

  for (const variant of results) {
    if (variant) {
      variants.push(variant);
    }
  }

  variants.sort((a, b) => a.width - b.width);

  const webpSrcset = variants
    .filter(v => v.format === 'webp')
    .map(v => `${v.url} ${v.width}w`)
    .join(', ');

  const avifSrcset = variants
    .filter(v => v.format === 'avif')
    .map(v => `${v.url} ${v.width}w`)
    .join(', ');

  const sizes = `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw`;

  let blurDataURL = '';
  try {
    const blurBuffer = await sharp(imagePath)
      .resize(8, 8, { fit: 'inside' })
      .blur(0.5)
      .toBuffer();
    const base64 = blurBuffer.toString('base64');
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
    blurDataURL = `data:${mimeType};base64,${base64}`;
  } catch (e) {
    log(`Failed to generate blur for ${filename}`, 'warn');
  }

  const id = currentHash;
  cache[filename] = {
    hash: currentHash,
    mtime: currentMtime,
    variants: Object.fromEntries(
      variants.map(v => [`${v.width}w-${v.format}`, v.filename])
    ),
  };

  return {
    id,
    original: `/${filename}`,
    originalWidth,
    originalHeight,
    originalSize,
    variants,
    srcset: webpSrcset,
    avifSrcset,
    sizes,
    blurDataURL,
    aspectRatio: originalWidth / originalHeight,
  };
}

async function runWithConcurrencyLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (const task of tasks) {
    const promise = task().then(result => {
      results.push(result);
    });

    executing.push(promise);

    if (executing.length >= limit) {
      await Promise.race(executing);
      const completedIndex = executing.findIndex(p => Promise.race([p, Promise.resolve(true)]).then(() => true));
      if (completedIndex !== -1) {
        executing.splice(completedIndex, 1);
      }
    }
  }

  await Promise.all(executing);
  return results;
}

async function main(): Promise<void> {
  console.log('\n🖼️  Image Optimization Build');
  console.log('==========================\n');

  const startTime = Date.now();

  ensureDir(IMAGES_DIR);
  ensureDir(OUTPUT_DIR);

  const imageFiles = fs.readdirSync(IMAGES_DIR)
    .filter(f => !f.startsWith('.'))
    .map(f => path.join(IMAGES_DIR, f));

  if (imageFiles.length === 0) {
    log('No images found in public/images/', 'warn');
    log('Creating sample images directory structure...', 'info');
    console.log('\n  To add images, place them in:');
    console.log('  public/images/\n');
    console.log('  Supported formats: jpg, jpeg, png, webp, gif, bmp, tiff, tif\n');
    log('Skipping image optimization', 'info');
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify({
      version: '1.0.0',
      generated: new Date().toISOString(),
      images: {},
    }, null, 2));
    return;
  }

  log(`Found ${imageFiles.length} image(s) to process`, 'info');

  const cache = loadCache();

  const results = await runWithConcurrencyLimit(
    imageFiles.map(file => () => processImage(file, cache)),
    CONCURRENCY_LIMIT
  );

  const manifest: ImageManifest = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    images: {},
  };

  let processedCount = 0;
  let skippedCount = 0;

  for (const entry of results) {
    if (entry) {
      manifest.images[entry.id] = entry;
      processedCount++;
    } else {
      skippedCount++;
    }
  }

  saveCache(cache);

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);

  console.log('\n');
  log(`Build complete in ${duration}s`, 'success');
  log(`  Processed: ${processedCount} images`, 'info');
  log(`  Skipped: ${skippedCount} images`, 'info');
  log(`  Output: ${OUTPUT_DIR}`, 'info');
  log(`  Manifest: ${MANIFEST_PATH}`, 'info');
  console.log('\n');
}

main().catch(error => {
  console.error('\n✖ Build failed:', error);
  process.exit(1);
});