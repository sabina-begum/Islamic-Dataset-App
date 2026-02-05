import { useState, useEffect, useCallback, useRef } from "react";
import { useProgressiveLoading } from "./useProgressiveLoading";
import type { IslamicData } from "../types/Types";

// WorkerMessage interface removed - not used

interface OptimizedDataState {
  data: IslamicData[];
  filteredData: IslamicData[];
  searchResults: IslamicData[];
  isLoading: boolean;
  isIndexing: boolean;
  searchQuery: string;
  filters: Partial<{
    searchTerm: string;
    type: string;
    sortBy: string;
    status?: string;
  }>;
  progress: number;
  error: string | null;
}

export function useOptimizedDataWithWorkers(
  islamicData: IslamicData[],
  options: {
    enableWorkers?: boolean;
    enableProgressiveLoading?: boolean;
    enableSearchIndex?: boolean;
  } = {}
) {
  const {
    enableWorkers = true,
    enableProgressiveLoading = true,
    enableSearchIndex = true,
  } = options;

  const [state, setState] = useState<OptimizedDataState>({
    data: [],
    filteredData: [],
    searchResults: [],
    isLoading: false,
    isIndexing: false,
    searchQuery: "",
    filters: {},
    progress: 0,
    error: null,
  });

  const workerRef = useRef<Worker | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Initialize Web Worker
  useEffect(() => {
    // Completely disable workers in build environment
    if (import.meta.env.VITE_DISABLE_WORKERS) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("Web Workers disabled for build environment");
      }
      return;
    }

    const shouldUseWorkers =
      enableWorkers &&
      typeof Worker !== "undefined" &&
      typeof window !== "undefined" &&
      !import.meta.env.SSR;

    if (shouldUseWorkers) {
      try {
        // Only create worker if not disabled
        const workerUrl = new URL(
          "../workers/dataProcessor.ts",
          import.meta.url
        );
        workerRef.current = new Worker(workerUrl, { type: "module" });

        workerRef.current.onmessage = (event) => {
          const { type, ...payload } = event.data;

          switch (type) {
            case "INDEX_BUILT":
              if (import.meta.env.DEV) {
                // eslint-disable-next-line no-console
                console.log(
                  "Search index built with",
                  payload.count,
                  "entries"
                );
              }
              setState((prev) => ({ ...prev, isIndexing: false }));
              break;

            case "SEARCH_RESULTS":
              setState((prev) => ({
                ...prev,
                searchResults: payload.results,
                isLoading: false,
              }));
              break;

            case "FILTERED_DATA":
              setState((prev) => ({
                ...prev,
                filteredData: payload.data,
                isLoading: false,
              }));
              break;

            case "SORTED_DATA":
              setState((prev) => ({
                ...prev,
                filteredData: payload.data,
                isLoading: false,
              }));
              break;
          }
        };

        workerRef.current.onerror = () => {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.error("Worker error occurred");
          }
          setState((prev) => ({ ...prev, error: "Worker error occurred" }));
        };
      } catch {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn(
            "Web Workers not supported, falling back to main thread"
          );
        }
        setState((prev) => ({ ...prev, error: "Web Workers not supported" }));
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [enableWorkers]);

  // Use progressive loading
  const progressiveData = useProgressiveLoading(islamicData, {
    chunkSize: 15,
    delay: 100,
    autoLoad: enableProgressiveLoading,
  });

  // Build search index when data changes
  useEffect(() => {
    if (
      enableSearchIndex &&
      workerRef.current &&
      progressiveData.data.length > 0
    ) {
      setState((prev) => ({ ...prev, isIndexing: true }));

      workerRef.current.postMessage({
        type: "BUILD_INDEX",
        data: progressiveData.data,
      });
    }
  }, [progressiveData.data, enableSearchIndex]);

  // Perform search with debouncing
  const performSearch = useCallback(
    (
      query: string,
      filters: Partial<{
        searchTerm: string;
        type: string;
        sortBy: string;
        status?: string;
      }> = {}
    ) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      setState((prev) => ({ ...prev, searchQuery: query, isLoading: true }));

      searchTimeoutRef.current = setTimeout(() => {
        if (workerRef.current && query.trim()) {
          workerRef.current.postMessage({
            type: "SEARCH",
            query,
            filters: { ...filters, searchTerm: query },
          });
        } else {
          // Fallback to main thread search
          const results = progressiveData.data.filter((item) => {
            const searchText = [
              item.title,
              item.title,
              item.notes,
              item.type,
              item.status,
            ]
              .join(" ")
              .toLowerCase();

            return searchText.includes(query.toLowerCase());
          });

          setState((prev) => ({
            ...prev,
            searchResults: results,
            isLoading: false,
          }));
        }
      }, 300); // 300ms debounce
    },
    [progressiveData.data]
  );

  // Apply filters
  const applyFilters = useCallback(
    (
      filters: Partial<{
        searchTerm: string;
        type: string;
        sortBy: string;
        status?: string;
      }>
    ) => {
      setState((prev) => ({ ...prev, filters, isLoading: true }));

      if (workerRef.current) {
        workerRef.current.postMessage({
          type: "FILTER",
          data: progressiveData.data,
          filters,
        });
      } else {
        // Fallback to main thread filtering
        let filtered = progressiveData.data;

        if (filters.type) {
          filtered = filtered.filter((item) => item.type === filters.type);
        }

        if (filters.status) {
          filtered = filtered.filter((item) => item.status === filters.status);
        }

        setState((prev) => ({
          ...prev,
          filteredData: filtered,
          isLoading: false,
        }));
      }
    },
    [progressiveData.data]
  );

  // Sort data
  const sortData = useCallback(
    (sortBy: string, sortOrder: "asc" | "desc" = "asc") => {
      setState((prev) => ({ ...prev, isLoading: true }));

      if (workerRef.current) {
        workerRef.current.postMessage({
          type: "SORT",
          data:
            state.filteredData.length > 0
              ? state.filteredData
              : progressiveData.data,
          sortBy,
          sortOrder,
        });
      } else {
        // Fallback to main thread sorting
        const dataToSort =
          state.filteredData.length > 0
            ? state.filteredData
            : progressiveData.data;
        const sorted = [...dataToSort].sort((a, b) => {
          const aValue =
            (a as unknown as Record<string, unknown>)[sortBy] || "";
          const bValue =
            (b as unknown as Record<string, unknown>)[sortBy] || "";

          if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
          if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
          return 0;
        });

        setState((prev) => ({
          ...prev,
          filteredData: sorted,
          isLoading: false,
        }));
      }
    },
    [state.filteredData, progressiveData.data]
  );

  // Load more data
  const loadMore = useCallback(() => {
    progressiveData.loadNextChunk();
  }, [progressiveData]);

  return {
    // Data
    data: progressiveData.data,
    filteredData: state.filteredData,
    searchResults: state.searchResults,

    // Loading states
    isLoading: state.isLoading || progressiveData.isLoading,
    isIndexing: state.isIndexing,
    hasMore: progressiveData.hasMore,

    // Progress
    progress: progressiveData.progress,
    loadedCount: progressiveData.loadedCount,
    totalCount: progressiveData.totalCount,

    // Search and filters
    searchQuery: state.searchQuery,
    filters: state.filters,

    // Actions
    performSearch,
    applyFilters,
    sortData,
    loadMore,
    reset: progressiveData.reset,

    // Error
    error: state.error || progressiveData.error,

    // Worker support
    workerSupported: !!workerRef.current,
  };
}
