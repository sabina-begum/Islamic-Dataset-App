/**
 * Copyright (c) 2024 Reflect & Implement
 *
 * This file contains domain-specific TypeScript interfaces for the Reflect
 * & Implement application. These types define the structure of knowledge
 * data, content entries, and related functionality.
 *
 * The original type definitions and data structures are protected by copyright.
 * Religious content (Quran verses, Hadith text) remains in the public domain.
 */

// Domain-specific types
export interface IslamicData {
  title: string;
  type: string;
  notes?: string;
  sources?: string[];
  fulfillmentStatus?: string;
  prophecyCategory?: string;
  yearRevealed?: number;
  yearFulfilled?: number;
}

export interface QuranAyah {
  surah_no: number;
  ayah_no_surah: number;
  ayah_no_quran: number;
  surah_name_en: string;
  surah_name_roman: string;
  ayah_ar: string;
  ayah_en: string;
  place_of_revelation: string;
}

export interface HadithEntry {
  number: number;
  arabic: string;
  english: string;
  narrator?: string;
  book?: string;
  chapter?: string;
}

// Filter and search types
export interface IslamicDataFilters {
  searchTerm: string;
  type: string;
  sortBy: string;
}

export interface QuranFilters {
  surah?: number;
  searchTerm: string;
  placeOfRevelation?: string;
  sortBy: "surah_no" | "surah_name_en" | "place_of_revelation";
}

export interface HadithFilters {
  searchTerm: string;
  narrator?: string;
  book?: string;
  sortBy: "number" | "length" | "relevance";
}

// Pagination types
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

// Search result types
export interface SearchResult<T> {
  data: T[];
  total: number;
  page: number;
  hasMore: boolean;
}
