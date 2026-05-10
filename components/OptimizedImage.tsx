/**
 * OptimizedImage Component
 * Automatically generates responsive, optimized images using the build manifest.
 * Supports:
 * - Multiple formats (AVIF, WebP, fallback)
 * - Responsive srcset
 * - Lazy loading with blur placeholder
 * - Priority loading for LCP images
 * - Type-safe image metadata
 */

'use client';

import { useState, useCallback, useMemo, type ImgHTMLAttributes, type SourceHTMLAttributes, type HTMLAttributes } from 'react';
import { getImageByPath, getImageById, getManifestInfo, type ImageManifestEntry } from '@/lib/image-manifest';
import { basePath } from '@/lib/base-path';

export interface OptimizedImageProps {
  /**
   * Image source - can be:
   * - Path to image in public/images/ (e.g., "photo.jpg" or "/images/photo.jpg")
   * - Image ID (hash) from manifest
   */
  src: string;
  /**
   * Alternative text for accessibility (required)
   */
  alt: string;
  /**
   * CSS classes to apply to the image
   */
  className?: string;
  /**
   * Inline styles to apply
   */
  style?: React.CSSProperties;
  /**
   * Image sizes attribute (CSS sizes)
   * @default "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
   */
  sizes?: string;
  /**
   * Whether to prioritize loading (for LCP images)
   * When true, uses loading="eager" and fetchpriority="high"
   * @default false
   */
  priority?: boolean;
  /**
   * Loading behavior
   * @default "lazy"
   */
  loading?: 'lazy' | 'eager';
  /**
   * Decoding behavior
   * @default "async"
   */
  decoding?: 'async' | 'sync';
  /**
   * Show blur placeholder while loading
   * @default true
   */
  placeholder?: boolean;
  /**
   * Fallback image URL when optimized version not found
   * If not provided and image not found, renders regular img
   */
  fallback?: string;
  /**
   * Callback when image loads
   */
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  /**
   * Callback when image fails to load
   */
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  /**
   * Width for fallback (when not using optimized)
   */
  width?: number | string;
  /**
   * Height for fallback (when not using optimized)
   */
  height?: number | string;
  /**
   * Disable AVIF format (for browser compatibility)
   * @default false
   */
  disableAvif?: boolean;
  /**
   * Fill parent container (like Next.js Image fill prop)
   * @default false
   */
  fill?: boolean;
  /**
   * Object-fit property when using fill
   * @default "cover"
   */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

interface ImageEntryResult {
  entry: ImageManifestEntry | null;
  isOptimized: boolean;
  src: string;
}

function withBasePath(url: string): string {
  if (!url) return url;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${basePath}${url}`;
}

/**
 * Resolve image path to manifest entry
 */
function resolveImage(src: string): ImageEntryResult {
  if (!src) {
    return { entry: null, isOptimized: false, src: '' };
  }

  let entry = getImageByPath(src);
  
  if (!entry && !src.startsWith('/')) {
    entry = getImageByPath(`/images/${src}`);
  }
  
  if (!entry) {
    entry = getImageById(src);
  }

  if (entry) {
    const webpVariant = entry.variants.find(v => v.format === 'webp' && v.width >= 800);
    return {
      entry,
      isOptimized: true,
      src: withBasePath(webpVariant?.url || entry.original),
    };
  }

  const normalizedSrc = src.startsWith('/') ? src : `/${src}`;
  return { entry: null, isOptimized: false, src: normalizedSrc };
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  style = {},
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  loading: loadingProp,
  decoding = 'async',
  placeholder = true,
  fallback,
  onLoad,
  onError,
  width,
  height,
  disableAvif = false,
  fill = false,
  objectFit = 'cover',
}: OptimizedImageProps): React.ReactElement {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const { entry, isOptimized, src: resolvedSrc } = useMemo(
    () => resolveImage(src),
    [src]
  );

  const finalSrc = hasError ? (fallback || resolvedSrc) : resolvedSrc;

  const effectiveLoading = priority ? 'eager' : (loadingProp || 'lazy');
  const effectiveDecoding = priority ? 'sync' : decoding;

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(e);
  }, [onLoad]);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    onError?.(e);
  }, [onError]);

  if (!isOptimized || !entry) {
    return (
      <img
        src={finalSrc}
        alt={alt}
        className={className}
        style={style}
        width={width}
        height={height}
        loading={effectiveLoading}
        decoding={effectiveDecoding}
        onLoad={handleLoad}
        onError={handleError}
      />
    );
  }

  const webpSrcset = entry.srcset.split(',').map(s => {
    const [url, size] = s.trim().split(' ');
    return `${withBasePath(url)} ${size}`;
  }).join(', ');

  const avifSrcset = !disableAvif ? entry.avifSrcset.split(',').map(s => {
    const [url, size] = s.trim().split(' ');
    return `${withBasePath(url)} ${size}`;
  }).join(', ') : '';
  const blurDataURL = placeholder ? entry.blurDataURL : '';

  const showPlaceholder = placeholder && blurDataURL && !isLoaded && !hasError;

  const imgAttributes: ImgHTMLAttributes<HTMLImageElement> = {
    src: finalSrc,
    alt,
    className,
    style: {
      ...style,
      ...(fill && { objectFit }),
    },
    width: fill ? undefined : (width || entry.originalWidth),
    height: fill ? undefined : (height || entry.originalHeight),
    loading: effectiveLoading,
    decoding: effectiveDecoding,
    onLoad: handleLoad,
    onError: handleError,
    ...(priority && { fetchPriority: 'high' }),
  };

  const sourceAvifProps: SourceHTMLAttributes<HTMLSourceElement> | null = avifSrcset ? {
    srcSet: avifSrcset,
    sizes,
    type: 'image/avif',
  } : null;

  const sourceWebpProps: SourceHTMLAttributes<HTMLSourceElement> = {
    srcSet: webpSrcset,
    sizes,
    type: 'image/webp',
  };

  if (fill) {
    return (
      <picture className={`optimized-image-container ${className}`} style={{ position: 'relative', display: 'block', ...style }}>
        {sourceAvifProps && <source {...sourceAvifProps} />}
        <source {...sourceWebpProps} />
        {showPlaceholder && (
          <img
            src={blurDataURL}
            alt=""
            className="optimized-image-blur"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit,
              filter: 'blur(20px)',
              transform: 'scale(1.1)',
              zIndex: 1,
              transition: isLoaded ? 'opacity 0.3s ease-out' : 'none',
              opacity: isLoaded ? 0 : 1,
            }}
            aria-hidden="true"
          />
        )}
        <img
          {...imgAttributes}
          className={`${className}`}
          style={{
            ...imgAttributes.style,
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit,
            zIndex: 2,
            opacity: showPlaceholder ? (isLoaded ? 1 : 0) : 1,
            transition: showPlaceholder ? 'opacity 0.3s ease-out' : 'none',
          }}
        />
      </picture>
    );
  }

  return (
    <picture className="optimized-image-wrapper">
      {sourceAvifProps && <source {...sourceAvifProps} />}
      <source {...sourceWebpProps} />
      <img
        {...imgAttributes}
        className={`${className} ${showPlaceholder ? 'optimized-image-fade-in' : ''}`}
        style={{
          ...imgAttributes.style,
          backgroundColor: showPlaceholder ? '#e5e7eb' : undefined,
        }}
        onLoad={(e) => {
          (e.target as HTMLImageElement).classList.remove('optimized-image-fade-in');
          handleLoad(e);
        }}
      />
    </picture>
  );
}

export default OptimizedImage;