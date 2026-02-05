import { useState, useEffect, useMemo, useCallback } from "react";
import type { QuranAyah, QuranFilters } from "../types/Types";
// Import JSON data directly for better performance
import quranDataJSON from "../data/The Quran Dataset.json";

// Enhanced error types for better error handling
interface DataLoadError {
  message: string;
  code: "NETWORK_ERROR" | "PARSE_ERROR" | "NOT_FOUND" | "UNKNOWN";
  retryable: boolean;
}

// Cache for parsed data to avoid re-parsing
const dataCache = new Map<string, QuranAyah[]>();

// Virtual scrolling configuration
const VIRTUAL_SCROLL_CONFIG = {
  itemHeight: 200, // Estimated height of each card
  overscan: 5, // Number of items to render outside viewport
  batchSize: 50, // Number of items to load in each batch
};

export function useQuranData() {
  const [data, setData] = useState<QuranAyah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DataLoadError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [filters, setFilters] = useState<QuranFilters>({
    surah: undefined,
    searchTerm: "",
    placeOfRevelation: undefined,
    sortBy: "surah_no",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const itemsPerPage = 12;

  // Simplified data loading - JSON only for better performance
  const loadData = useCallback(async (retryAttempt = 0): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("🔄 Starting Quran data load from local JSON...");
      }

      // Check cache first
      const cacheKey = "quran-data-json";
      const cachedData = dataCache.get(cacheKey);
      if (cachedData) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log(
            "✅ Using cached Quran data:",
            cachedData.length,
            "verses"
          );
        }
        setData(cachedData);
        setLoading(false);
        return;
      }

      // Load from JSON directly
      try {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log("📖 Loading Quran data from local JSON...");
        }
        const dataWithTranslations = (
          quranDataJSON as unknown as Record<string, unknown>[]
        ).map(
          (ayah) =>
            ({
              ...ayah,
              id:
                (ayah.id as string) ||
                `quran-${ayah.surah_no}-${ayah.ayah_no_surah}`,
              ayah_en: (ayah.ayah_en as string) || "", // Preserve existing translation or add empty
            } as QuranAyah)
        );

        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log(
            "✅ Loaded",
            dataWithTranslations.length,
            "verses from local JSON"
          );
        }

        // Cache the parsed data
        dataCache.set(cacheKey, dataWithTranslations);
        setData(dataWithTranslations);
      } catch {
        throw new Error("Failed to load Quran data from JSON source");
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("❌ Quran data load error:", err);
      }
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load data";
      const isRetryable =
        retryAttempt < 3 && errorMessage.includes("Failed to load");

      setError({
        message: errorMessage,
        code: isRetryable ? "NETWORK_ERROR" : "UNKNOWN",
        retryable: isRetryable,
      });

      if (isRetryable) {
        // Retry after exponential backoff
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          loadData(retryAttempt + 1);
        }, Math.pow(2, retryAttempt) * 1000);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Retry function for user-initiated retries
  const retry = useCallback(() => {
    setRetryCount(0);
    loadData();
  }, [loadData]);

  // Filter and sort data with performance optimization
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter with debouncing
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ayah) =>
          ayah.surah_name_en.toLowerCase().includes(searchLower) ||
          ayah.surah_name_roman.toLowerCase().includes(searchLower) ||
          ayah.ayah_ar.includes(searchLower) ||
          ayah.ayah_en.toLowerCase().includes(searchLower)
      );
    }

    // Apply surah filter
    if (filters.surah) {
      filtered = filtered.filter((ayah) => ayah.surah_no === filters.surah);
    }

    // Apply place of revelation filter
    if (filters.placeOfRevelation) {
      filtered = filtered.filter(
        (ayah) => ayah.place_of_revelation === filters.placeOfRevelation
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "surah_name_en":
          return a.surah_name_en.localeCompare(b.surah_name_en);
        case "place_of_revelation":
          return a.place_of_revelation.localeCompare(b.place_of_revelation);
        case "surah_no":
        default:
          return a.surah_no - b.surah_no;
      }
    });

    return filtered;
  }, [data, filters]);

  // Virtual scrolling - only render visible items
  const virtualizedData = useMemo(() => {
    const start = Math.max(
      0,
      visibleRange.start - VIRTUAL_SCROLL_CONFIG.overscan
    );
    const end = Math.min(
      filteredData.length,
      visibleRange.end + VIRTUAL_SCROLL_CONFIG.overscan
    );
    return filteredData.slice(start, end);
  }, [filteredData, visibleRange]);

  // Update visible range when scrolling
  const updateVisibleRange = useCallback((start: number, end: number) => {
    setVisibleRange({ start, end });
  }, []);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Reset current page if it's invalid after filtering
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  // Get unique surahs for filter dropdown
  const uniqueSurahs = useMemo(() => {
    const surahs = [...new Set(data.map((ayah) => ayah.surah_no))].sort(
      (a, b) => a - b
    );
    return surahs.map((surahNo) => {
      const ayah = data.find((a) => a.surah_no === surahNo);
      return {
        number: surahNo,
        name: ayah?.surah_name_en || "",
        roman: ayah?.surah_name_roman || "",
      };
    });
  }, [data]);

  // Get unique places of revelation for filter dropdown
  const uniquePlaces = useMemo(() => {
    return [...new Set(data.map((ayah) => ayah.place_of_revelation))].sort();
  }, [data]);

  return {
    data: paginatedData,
    virtualizedData,
    allData: data,
    loading,
    error,
    retry,
    retryCount,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    uniqueSurahs,
    uniquePlaces,
    totalAyahs: data.length,
    filteredCount: filteredData.length,
    updateVisibleRange,
    virtualScrollConfig: VIRTUAL_SCROLL_CONFIG,
  };
}
