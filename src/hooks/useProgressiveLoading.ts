import { useState, useEffect, useCallback, useRef } from "react";
import type { IslamicData } from "../types/Types";

interface ProgressiveLoadingOptions {
  chunkSize?: number;
  delay?: number;
  autoLoad?: boolean;
}

interface ProgressiveLoadingState<T> {
  data: T[];
  isLoading: boolean;
  hasMore: boolean;
  progress: number;
  error: string | null;
}

export function useProgressiveLoading<T>(
  allData: T[],
  options: ProgressiveLoadingOptions = {}
) {
  const { chunkSize = 20, delay = 100, autoLoad = true } = options;

  const [state, setState] = useState<ProgressiveLoadingState<T>>({
    data: [],
    isLoading: false,
    hasMore: true,
    progress: 0,
    error: null,
  });

  const currentIndex = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Load next chunk of data
  const loadNextChunk = useCallback(async () => {
    if (state.isLoading || !state.hasMore) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    // Simulate async loading with delay
    await new Promise((resolve) => {
      timeoutRef.current = setTimeout(resolve, delay);
    });

    const startIndex = currentIndex.current;
    const endIndex = Math.min(startIndex + chunkSize, allData.length);
    const newChunk = allData.slice(startIndex, endIndex);

    setState((prev) => ({
      ...prev,
      data: [...prev.data, ...newChunk],
      isLoading: false,
      hasMore: endIndex < allData.length,
      progress: (endIndex / allData.length) * 100,
    }));

    currentIndex.current = endIndex;
  }, [allData, chunkSize, delay, state.isLoading, state.hasMore]);

  // Load all data at once (for small datasets)
  const loadAll = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    await new Promise((resolve) => {
      timeoutRef.current = setTimeout(resolve, delay);
    });

    setState({
      data: allData,
      isLoading: false,
      hasMore: false,
      progress: 100,
      error: null,
    });

    currentIndex.current = allData.length;
  }, [allData, delay]);

  // Reset loading state
  const reset = useCallback(() => {
    currentIndex.current = 0;
    setState({
      data: [],
      isLoading: false,
      hasMore: true,
      progress: 0,
      error: null,
    });
  }, []);

  // Auto-load if enabled and data changes
  useEffect(() => {
    if (autoLoad && allData.length > 0) {
      if (allData.length <= chunkSize) {
        // Load all at once for small datasets
        loadAll();
      } else {
        // Start progressive loading for large datasets
        loadNextChunk();
      }
    }
  }, [allData, autoLoad, chunkSize, loadAll, loadNextChunk]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    loadNextChunk,
    loadAll,
    reset,
    totalCount: allData.length,
    loadedCount: state.data.length,
  };
}

// Specialized hook for Islamic data
export function useIslamicDataProgressive(
  islamicData: IslamicData[],
  options: ProgressiveLoadingOptions = {}
) {
  return useProgressiveLoading(islamicData, {
    chunkSize: 10, // Smaller chunks for Islamic data
    delay: 150, // Slightly longer delay for better UX
    ...options,
  });
}
