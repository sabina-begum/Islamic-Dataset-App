import React from "react";

interface LazyLoadingFallbackProps {
  message?: string;
  className?: string;
}

/**
 * Optimized loading fallback for lazy-loaded components
 * Uses lightweight spinner with minimal DOM impact
 */
export const LazyLoadingFallback: React.FC<LazyLoadingFallbackProps> = ({
  message = "Loading...",
  className = "",
}) => {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="flex flex-col items-center space-y-3">
        {/* Lightweight CSS-only spinner */}
        <div
          className="w-8 h-8 border-2 border-stone-300 border-t-green-600 rounded-full animate-spin"
          aria-label="Loading content"
        />
        <p className="text-sm text-stone-600 dark:text-stone-400 font-medium">
          {message}
        </p>
      </div>
    </div>
  );
};

/**
 * Minimal loading fallback for smaller components
 */
export const MinimalLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center p-4">
    <div
      className="w-5 h-5 border-2 border-stone-300 border-t-green-600 rounded-full animate-spin"
      aria-label="Loading"
    />
  </div>
);

/**
 * Chart-specific loading fallback
 */
export const ChartLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-64 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-8 h-8 border-2 border-stone-300 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-sm text-stone-600 dark:text-stone-400">
        Loading chart...
      </p>
    </div>
  </div>
);

/**
 * Search-specific loading fallback
 */
export const SearchLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-48 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-6 h-6 border-2 border-stone-300 border-t-orange-600 rounded-full animate-spin" />
      <p className="text-sm text-stone-600 dark:text-stone-400">
        Loading search...
      </p>
    </div>
  </div>
);
