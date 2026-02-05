import React, { useState, useRef, useEffect, memo } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
  sizes?: string;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Advanced optimized image component with WebP support, lazy loading, and responsive images
 * Provides automatic format selection, performance monitoring, and accessibility features
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = memo(
  ({
    src,
    alt,
    width,
    height,
    className = "",
    loading = "lazy",
    priority = false,
    sizes = "100vw",
    placeholder = "empty",
    blurDataURL,
    onLoad,
    onError,
  }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState<string>("");
    const imgRef = useRef<HTMLImageElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Generate WebP and fallback sources
    const generateSources = (originalSrc: string) => {
      const srcWithoutExt = originalSrc.replace(/\.[^/.]+$/, "");
      const extension = originalSrc.split(".").pop()?.toLowerCase();

      // Generate responsive sizes for WebP
      const webpSources = [
        { src: `${srcWithoutExt}-480w.webp`, width: 480 },
        { src: `${srcWithoutExt}-768w.webp`, width: 768 },
        { src: `${srcWithoutExt}-1024w.webp`, width: 1024 },
        { src: `${srcWithoutExt}-1440w.webp`, width: 1440 },
      ];

      // Generate responsive sizes for original format
      const fallbackSources = [
        { src: `${srcWithoutExt}-480w.${extension}`, width: 480 },
        { src: `${srcWithoutExt}-768w.${extension}`, width: 768 },
        { src: `${srcWithoutExt}-1024w.${extension}`, width: 1024 },
        { src: `${srcWithoutExt}-1440w.${extension}`, width: 1440 },
      ];

      return { webpSources, fallbackSources, originalSrc };
    };

    // Check if WebP is supported
    const supportsWebP = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
    };

    // Generate srcSet string
    const generateSrcSet = (sources: { src: string; width: number }[]) => {
      return sources
        .map((source) => `${source.src} ${source.width}w`)
        .join(", ");
    };

    // Handle image load
    const handleImageLoad = () => {
      setImageLoaded(true);
      setImageError(false);
      onLoad?.();
    };

    // Handle image error - fallback to original
    const handleImageError = () => {
      if (currentSrc !== src) {
        setCurrentSrc(src);
      } else {
        setImageError(true);
        onError?.();
      }
    };

    // Setup intersection observer for lazy loading
    useEffect(() => {
      if (loading === "lazy" && !priority && imgRef.current) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const sources = generateSources(src);
                const preferredSrc = supportsWebP()
                  ? sources.webpSources[0]?.src || src
                  : sources.fallbackSources[0]?.src || src;

                setCurrentSrc(preferredSrc);
                observerRef.current?.unobserve(entry.target);
              }
            });
          },
          { rootMargin: "50px" }
        );

        observerRef.current.observe(imgRef.current);
      } else {
        // Load immediately for eager/priority images
        const sources = generateSources(src);
        const preferredSrc = supportsWebP()
          ? sources.webpSources[0]?.src || src
          : sources.fallbackSources[0]?.src || src;

        setCurrentSrc(preferredSrc);
      }

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }, [src, loading, priority]);

    // Preload critical images
    useEffect(() => {
      if (priority && currentSrc) {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = currentSrc;
        document.head.appendChild(link);

        return () => {
          if (document.head.contains(link)) {
            document.head.removeChild(link);
          }
        };
      }
    }, [priority, currentSrc]);

    const sources = generateSources(src);
    const webpSrcSet = generateSrcSet(sources.webpSources);
    const fallbackSrcSet = generateSrcSet(sources.fallbackSources);

    // Placeholder component
    const Placeholder = () => (
      <div
        className={`bg-stone-200 dark:bg-stone-700 animate-pulse flex items-center justify-center ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={`Loading ${alt}`}
      >
        {placeholder === "blur" && blurDataURL ? (
          <img
            src={blurDataURL}
            alt=""
            className="w-full h-full object-cover filter blur-sm opacity-60"
            aria-hidden="true"
          />
        ) : (
          <div className="text-stone-400 dark:text-stone-500">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
    );

    // Error state
    if (imageError) {
      return (
        <div
          className={`bg-stone-100 dark:bg-stone-800 border-2 border-dashed border-stone-300 dark:border-stone-600 flex items-center justify-center ${className}`}
          style={{ width, height }}
          role="img"
          aria-label={`Failed to load ${alt}`}
        >
          <div className="text-center text-stone-500 dark:text-stone-400">
            <svg
              className="w-8 h-8 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span className="text-xs">Image failed to load</span>
          </div>
        </div>
      );
    }

    // Show placeholder while loading
    if (!currentSrc || !imageLoaded) {
      return <Placeholder />;
    }

    return (
      <picture className={`block ${className}`}>
        {/* WebP sources */}
        <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />

        {/* Fallback sources */}
        <source srcSet={fallbackSrcSet} sizes={sizes} />

        {/* Main image */}
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          style={{
            maxWidth: "100%",
            height: "auto",
            objectFit: "cover",
          }}
          decoding="async"
          draggable={false}
        />
      </picture>
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";

export default OptimizedImage;
