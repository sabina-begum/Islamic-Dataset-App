import { firestoreService } from "./firestore";
import { isFirebaseConfigured } from "./config";
import type {
  IslamicData,
  QuranAyah,
  HadithEntry,
  UnifiedSearchResult,
  FilterState,
  DataSource,
  FulfillmentStatus,
} from "../types/Types";

// Search service for advanced Firestore-based search
export class SearchService {
  private static instance: SearchService;

  private constructor() {}

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  // Check if search is available
  private isAvailable(): boolean {
    return isFirebaseConfigured();
  }

  // Perform unified search across all data types
  async performUnifiedSearch(
    query: string,
    filters: FilterState,
    userId?: string
  ): Promise<{
    results: UnifiedSearchResult[];
    totalResults: number;
    searchTime: number;
    sources: {
      islamicData: number;
      quran: number;
      hadith: number;
    };
  }> {
    const startTime = Date.now();

    if (!this.isAvailable()) {
      return {
        results: [],
        totalResults: 0,
        searchTime: 0,
        sources: { islamicData: 0, quran: 0, hadith: 0 },
      };
    }

    try {
      const results: UnifiedSearchResult[] = [];
      const searchTerms = this.tokenizeQuery(query);

      // Search Islamic data
      if (filters.dataSources.includes("islamic data" as DataSource)) {
        const islamicResults = await this.searchIslamicData(
          searchTerms,
          filters
        );
        results.push(...islamicResults);
      }

      // Search Quran data
      if (filters.dataSources.includes("quran" as DataSource)) {
        const quranResults = await this.searchQuranData(searchTerms, filters);
        results.push(...quranResults);
      }

      // Search Hadith data
      if (filters.dataSources.includes("hadith" as DataSource)) {
        const hadithResults = await this.searchHadithData(searchTerms, filters);
        results.push(...hadithResults);
      }

      // Sort results by relevance
      results.sort((a, b) => b.relevance - a.relevance);

      // Save search history if user is logged in
      if (userId) {
        await firestoreService.saveSearchHistory(userId, query, filters);
      }

      const searchTime = Date.now() - startTime;

      return {
        results,
        totalResults: results.length,
        searchTime,
        sources: {
          islamicData: results.filter((r) => r.type === "islamic data").length,
          quran: results.filter((r) => r.type === "quran").length,
          hadith: results.filter((r) => r.type === "hadith").length,
        },
      };
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("Search failed:", error);
      }
      return {
        results: [],
        totalResults: 0,
        searchTime: Date.now() - startTime,
        sources: { islamicData: 0, quran: 0, hadith: 0 },
      };
    }
  }

  // Search Islamic data
  private async searchIslamicData(
    searchTerms: string[],
    filters: FilterState
  ): Promise<UnifiedSearchResult[]> {
    try {
      const islamicData = await firestoreService.getIslamicData(filters);
      const results: UnifiedSearchResult[] = [];

      for (const item of islamicData.data || []) {
        const relevance = this.calculateRelevance(item, searchTerms);
        if (relevance > 0) {
          results.push({
            id: item.id,
            type: "islamic data" as DataSource,
            title: item.title,
            content: this.extractContent(item),
            source: item.sources?.source || "Islamic Data",
            data: item,
            relevance,
            timestamp: new Date(),
          });
        }
      }

      return results;
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("Islamic data search failed:", error);
      }
      return [];
    }
  }

  // Search Quran data
  private async searchQuranData(
    searchTerms: string[],
    filters: FilterState
  ): Promise<UnifiedSearchResult[]> {
    try {
      const quranData = await firestoreService.getQuranData(filters);
      const results: UnifiedSearchResult[] = [];

      for (const item of quranData) {
        const relevance = this.calculateRelevance(item, searchTerms);
        if (relevance > 0) {
          results.push({
            id: item.id,
            type: "quran" as DataSource,
            title: `${item.surah_name_en} ${item.ayah_no_surah}`,
            content: this.extractContent(item),
            source: `Quran - ${item.surah_name_en} ${item.ayah_no_surah}`,
            data: item,
            relevance,
            timestamp: new Date(),
          });
        }
      }

      return results;
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("Quran data search failed:", error);
      }
      return [];
    }
  }

  // Search Hadith data
  private async searchHadithData(
    searchTerms: string[],
    filters: FilterState
  ): Promise<UnifiedSearchResult[]> {
    try {
      const hadithData = await firestoreService.getHadithData(filters);
      const results: UnifiedSearchResult[] = [];

      for (const item of hadithData) {
        const relevance = this.calculateRelevance(item, searchTerms);
        if (relevance > 0) {
          results.push({
            id: item.id,
            type: "hadith" as DataSource,
            title: `Hadith ${item.number}`,
            content: this.extractContent(item),
            source: "Sahih Bukhari",
            data: item,
            relevance,
            timestamp: new Date(),
          });
        }
      }

      return results;
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("Hadith data search failed:", error);
      }
      return [];
    }
  }

  // Tokenize search query
  private tokenizeQuery(query: string): string[] {
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 0)
      .map((term) => term.trim());
  }

  // Calculate relevance score
  private calculateRelevance(
    item: IslamicData | QuranAyah | HadithEntry,
    searchTerms: string[]
  ): number {
    if (searchTerms.length === 0) return 100;

    const searchableText = this.extractContent(item).toLowerCase();
    let relevance = 0;

    for (const term of searchTerms) {
      const termCount = (searchableText.match(new RegExp(term, "gi")) || [])
        .length;
      const termLength = term.length;

      // Higher score for longer terms and more matches
      relevance += termCount * termLength * 10;

      // Bonus for exact matches
      if (searchableText.includes(term)) {
        relevance += 50;
      }

      // Bonus for title matches
      if ("title" in item && item.title.toLowerCase().includes(term)) {
        relevance += 100;
      }
    }

    return Math.min(relevance, 100);
  }

  // Extract searchable content from item
  private extractContent(item: IslamicData | QuranAyah | HadithEntry): string {
    if ("title" in item && "notes" in item) {
      // IslamicData
      return [
        item.title,
        item.notes,
        item.sources?.primary,
        item.sources?.verification,
        item.sources?.methodology,
        item.fulfillmentEvidence,
        item.prophecyCategory,
      ]
        .filter(Boolean)
        .join(" ");
    } else if ("surah_name_en" in item && "ayah_en" in item) {
      // QuranAyah
      return [
        item.surah_name_en,
        item.ayah_en,
        item.ayah_ar,
        item.place_of_revelation,
      ]
        .filter(Boolean)
        .join(" ");
    } else if ("text" in item && "number" in item) {
      // HadithEntry
      return [
        item.text,
        item.translation,
        item.narrator,
        item.book,
        item.chapter,
      ]
        .filter(Boolean)
        .join(" ");
    }

    return "";
  }

  // Get search suggestions
  async getSearchSuggestions(
    query: string,
    limit: number = 5
  ): Promise<string[]> {
    if (!this.isAvailable() || query.length < 2) {
      return [];
    }

    try {
      const suggestions: string[] = [];

      // Get Islamic data suggestions
      const islamicData = await firestoreService.getIslamicData(
        {},
        { itemsPerPage: 100 }
      );
      for (const item of islamicData.data || []) {
        if (suggestions.length >= limit) break;
        if (item.title.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push(item.title);
        }
      }

      // Get Quran suggestions
      const quranData = await firestoreService.getQuranData();
      for (const item of quranData) {
        if (suggestions.length >= limit) break;
        const surahName = item.surah_name_en.toLowerCase();
        if (surahName.includes(query.toLowerCase())) {
          suggestions.push(`${item.surah_name_en} ${item.ayah_no_surah}`);
        }
      }

      return [...new Set(suggestions)].slice(0, limit);
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("Failed to get search suggestions:", error);
      }
      return [];
    }
  }

  // Get popular searches
  async getPopularSearches(
    userId?: string,
    limit: number = 10
  ): Promise<
    Array<{
      query: string;
      count: number;
    }>
  > {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      if (userId) {
        // Get user's search history
        const searchHistory = await firestoreService.getUserSearchHistory(
          userId,
          limit
        );
        const queryCounts = new Map<string, number>();

        for (const search of searchHistory) {
          const count = queryCounts.get(search.searchQuery) || 0;
          queryCounts.set(search.searchQuery, count + 1);
        }

        return Array.from(queryCounts.entries())
          .map(([query, count]) => ({ query, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);
      }

      // Return default popular searches
      return [
        { query: "prophecy", count: 50 },
        { query: "scientific", count: 45 },
        { query: "health", count: 40 },
        { query: "qadr", count: 35 },
        { query: "fulfillment", count: 30 },
      ];
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("Failed to get popular searches:", error);
      }
      return [];
    }
  }

  // Advanced search with filters
  async advancedSearch(
    query: string,
    filters: FilterState,
    pagination: {
      page: number;
      limit: number;
    } = { page: 1, limit: 20 }
  ): Promise<{
    results: UnifiedSearchResult[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalResults: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    const allResults = await this.performUnifiedSearch(query, filters);
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedResults = allResults.results.slice(startIndex, endIndex);

    return {
      results: paginatedResults,
      pagination: {
        currentPage: pagination.page,
        totalPages: Math.ceil(allResults.totalResults / pagination.limit),
        totalResults: allResults.totalResults,
        hasNextPage: endIndex < allResults.totalResults,
        hasPreviousPage: pagination.page > 1,
      },
    };
  }

  // Search by category
  async searchByCategory(
    category: string,
    filters: Partial<FilterState> = {}
  ): Promise<UnifiedSearchResult[]> {
    const categoryFilters: FilterState = {
      types: [category],
      categories: [],
      searchFields: [],
      sortBy: "title",
      sortOrder: "asc",
      fulfillmentStatus: [],
      prophecyCategories: [],
      yearRange: { min: 0, max: 9999 },
      dataSources: ["islamic data"],
      quranSurahs: [],
      quranVerseRange: { min: 1, max: 6236 },
      quranPlaceOfRevelation: [],
      quranSajdahOnly: false,
      hadithNumberRange: { min: 1, max: 9999 },
      hadithCategories: [],
      ...filters,
    };

    const results = await this.performUnifiedSearch("", categoryFilters);
    return results.results;
  }

  // Search by fulfillment status
  async searchByFulfillmentStatus(
    status: string,
    filters: Partial<FilterState> = {}
  ): Promise<UnifiedSearchResult[]> {
    const statusFilters: FilterState = {
      types: [],
      categories: [],
      searchFields: [],
      sortBy: "title",
      sortOrder: "asc",
      fulfillmentStatus: [status as FulfillmentStatus],
      prophecyCategories: [],
      yearRange: { min: 0, max: 9999 },
      dataSources: ["islamic data"],
      quranSurahs: [],
      quranVerseRange: { min: 1, max: 6236 },
      quranPlaceOfRevelation: [],
      quranSajdahOnly: false,
      hadithNumberRange: { min: 1, max: 9999 },
      hadithCategories: [],
      ...filters,
    };

    const results = await this.performUnifiedSearch("", statusFilters);
    return results.results;
  }

  // Search by year range
  async searchByYearRange(
    minYear: number,
    maxYear: number,
    filters: Partial<FilterState> = {}
  ): Promise<UnifiedSearchResult[]> {
    const yearFilters: FilterState = {
      types: [],
      categories: [],
      searchFields: [],
      sortBy: "title",
      sortOrder: "asc",
      fulfillmentStatus: [],
      prophecyCategories: [],
      yearRange: { min: minYear, max: maxYear },
      dataSources: ["islamic data"],
      quranSurahs: [],
      quranVerseRange: { min: 1, max: 6236 },
      quranPlaceOfRevelation: [],
      quranSajdahOnly: false,
      hadithNumberRange: { min: 1, max: 9999 },
      hadithCategories: [],
      ...filters,
    };

    const results = await this.performUnifiedSearch("", yearFilters);
    return results.results;
  }
}

// Export singleton instance
export const searchService = SearchService.getInstance();
