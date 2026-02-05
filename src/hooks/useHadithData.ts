import { useState, useEffect, useMemo } from "react";
import type { HadithEntry, HadithFilters } from "../types/Types";
// Import JSON data directly for better performance
import hadithDataJSON from "../data/Sahih Bukhari.json";

// Define proper types for the JSON data structure
interface RawHadithData {
  id?: string | number;
  hadith_id?: string | number;
  hadith_no?: string | number;
  source?: string;
  chapter?: string;
  chapter_no?: string | number;
  narrators?: string;
  text_en?: string;
  text_ar?: string;
}

export function useHadithData() {
  const [hadithData, setHadithData] = useState<HadithEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<HadithFilters>({
    searchTerm: "",
    sortBy: "index",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 21;

  // Load Hadith data from JSON directly
  useEffect(() => {
    const loadHadithData = async () => {
      try {
        setLoading(true);
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log("🔄 Loading Hadith data from local JSON...");
        }

        // Check if the data is an array (new format) or object (old format)
        const isArrayFormat = Array.isArray(hadithDataJSON);

        let data: HadithEntry[];

        if (isArrayFormat) {
          // New format: Array of hadith objects
          data = (hadithDataJSON as RawHadithData[]).map(
            (hadith: RawHadithData) => ({
              id:
                hadith.id?.toString() ||
                hadith.hadith_id?.toString() ||
                "unknown",
              number:
                hadith.hadith_no?.toString() ||
                hadith.id?.toString() ||
                "unknown",
              book: hadith.source || "Sahih Bukhari",
              chapter: hadith.chapter || "Unknown",
              narrator: hadith.narrators || "Unknown",
              text: hadith.text_en || hadith.text_ar || "",
              arabic: hadith.text_ar || "",
              translation: hadith.text_en || "",
              grade: undefined, // No grade assigned - requires proper authority
              reference: `${hadith.source || "Sahih Bukhari"} ${
                hadith.chapter_no || ""
              } ${hadith.hadith_no || ""}`.trim(),
            })
          ) as HadithEntry[];
        } else {
          // Old format: Object with key-value pairs
          data = Object.entries(hadithDataJSON).map(([key, value]) => ({
            id: key,
            number: key,
            book: "Sahih Bukhari",
            chapter: "Unknown",
            narrator: "Unknown",
            text: typeof value === "string" ? value : JSON.stringify(value),
            arabic: typeof value === "string" ? value : "",
            translation: "",
            grade: undefined, // No grade assigned - requires proper authority
            reference: key,
          })) as HadithEntry[];
        }

        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log("✅ Loaded", data.length, "hadiths from local JSON");
        }
        setHadithData(data);
      } catch (err) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error("❌ Hadith data load error:", err);
        }
        setError(
          err instanceof Error ? err.message : "Failed to load Hadith data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadHadithData();
  }, []);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = [...hadithData];

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter((hadith) => {
        // Search through all values in the hadith object
        return Object.values(hadith).some((value) =>
          value.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply chapter filter
    if (filters.chapter && filters.chapter !== "all") {
      const chapterFilter = filters.chapter;
      filtered = filtered.filter((hadith) => {
        return hadith.chapter
          .toLowerCase()
          .includes(chapterFilter.toLowerCase());
      });
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "index":
        // Keep original order
        break;
      case "length":
        // Sort by content length (longest first)
        filtered.sort((a, b) => {
          const aLength = Object.values(a).join("").length;
          const bLength = Object.values(b).join("").length;
          return bLength - aLength;
        });
        break;
      default:
        break;
    }

    return filtered;
  }, [hadithData, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  // Get statistics
  const stats = useMemo(() => {
    const totalHadiths = hadithData.length;
    const totalWords = hadithData.reduce((total, hadith) => {
      return total + Object.values(hadith).join(" ").split(/\s+/).length;
    }, 0);
    const averageLength =
      totalHadiths > 0 ? Math.round(totalWords / totalHadiths) : 0;

    return {
      totalHadiths,
      totalWords,
      averageLength,
    };
  }, [hadithData]);

  // Get unique chapters for filtering
  const uniqueChapters = useMemo(() => {
    const chapters = hadithData
      .map((hadith) => hadith.chapter)
      .filter((chapter) => chapter && chapter !== "Unknown")
      .filter((chapter, index, self) => self.indexOf(chapter) === index)
      .sort();
    return chapters;
  }, [hadithData]);

  return {
    hadithData,
    filteredData,
    paginatedData,
    loading,
    error,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    stats,
    itemsPerPage,
    uniqueChapters,
  };
}
