// Strong TypeScript types for Islamic Dataset app

// ============================================================================
// CONSTANTS - Strict type definitions
// ============================================================================

export const DataTypeEnum = {
  PROPHECY: "prophecy",
  SCIENTIFIC: "scientific",
  HEALTH: "health",
  TRADITIONAL_TREATMENTS: "traditional-treatments",
  QADR: "qadr",
} as const;

export const FulfillmentStatusEnum = {
  FULFILLED: "fulfilled",
  IN_PROGRESS: "in-progress",
  PENDING: "pending",
  PARTIALLY_FULFILLED: "partially-fulfilled",
} as const;

export const ProphecyStatusEnum = {
  FULFILLED_PROPHECY: "Fulfilled Prophecy",
  FUTURE_EVENT: "Future Event",
  DOCUMENTED: "Documented",
  SUPPORTED_BY_EVIDENCE: "supported by evidence",
  ONGOING_RESEARCH: "Ongoing Research",
  IN_PROGRESS: "In Progress",
  PENDING: "Pending",
} as const;

export const ProphecyCategoryEnum = {
  HISTORICAL: "historical",
  SCIENTIFIC: "scientific",
  SOCIAL: "social",
  NATURAL: "natural",
  COSMOLOGICAL: "cosmological",
  TECHNOLOGICAL: "technological",
} as const;

export const DataSourceEnum = {
  ISLAMIC_DATA: "islamic data",
  QURAN: "quran",
  HADITH: "hadith",
} as const;

export const SortOrderEnum = {
  ASC: "asc",
  DESC: "desc",
} as const;

export const ToastTypeEnum = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
} as const;

export const ChartTypeEnum = {
  BAR: "bar",
  PIE: "pie",
  LINE: "line",
  SCATTER: "scatter",
} as const;

export const ErrorCodeEnum = {
  NETWORK_ERROR: "NETWORK_ERROR",
  PARSE_ERROR: "PARSE_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNKNOWN: "UNKNOWN",
} as const;

// Type definitions from constants
export type DataType = (typeof DataTypeEnum)[keyof typeof DataTypeEnum];
export type FulfillmentStatus =
  (typeof FulfillmentStatusEnum)[keyof typeof FulfillmentStatusEnum];
export type ProphecyStatus =
  (typeof ProphecyStatusEnum)[keyof typeof ProphecyStatusEnum];
export type ProphecyCategory =
  (typeof ProphecyCategoryEnum)[keyof typeof ProphecyCategoryEnum];
export type DataSource = (typeof DataSourceEnum)[keyof typeof DataSourceEnum];
export type SortOrder = (typeof SortOrderEnum)[keyof typeof SortOrderEnum];
export type ToastType = (typeof ToastTypeEnum)[keyof typeof ToastTypeEnum];
export type ChartType = (typeof ChartTypeEnum)[keyof typeof ChartTypeEnum];
export type ErrorCode = (typeof ErrorCodeEnum)[keyof typeof ErrorCodeEnum];

// ============================================================================
// STRICT INTERFACES
// ============================================================================

// Enhanced error types with strict typing
export interface DataLoadError {
  readonly message: string;
  readonly code: ErrorCode;
  readonly retryable: boolean;
  readonly timestamp: Date;
  readonly context?: Record<string, unknown>;
}

// Authentication types with strict validation
export interface AuthUser {
  readonly uid: string;
  readonly email: string;
  readonly displayName?: string;
  readonly photoURL?: string;
  readonly emailVerified: boolean;
  readonly createdAt: Date;
  readonly lastSignInAt: Date;
}

export interface AuthError {
  readonly code: string;
  readonly message: string;
  readonly timestamp: Date;
}

// Sources interface with strict typing
export interface DataSources {
  readonly primary: string;
  readonly verification: string;
  readonly methodology: string;
  readonly references: readonly string[];
  readonly source: string;
}

// Related events with strict structure
export interface RelatedEvent {
  readonly event: string;
  readonly year: number;
  readonly description: string;
  readonly evidence: string;
  readonly confidence: number; // 0-100
}

// Enhanced IslamicData interface with strict typing
export interface IslamicData {
  readonly type: DataType;
  readonly title: string;
  readonly notes: string;
  readonly sources?: DataSources;
  readonly location?: string;
  readonly significance?: string;
  readonly pattern?: string;
  readonly examples?: readonly string[];
  readonly status?: ProphecyStatus;
  readonly source?: string;
  readonly fulfillmentStatus?: FulfillmentStatus;
  readonly yearRevealed?: number;
  readonly yearFulfilled?: number;
  readonly fulfillmentEvidence?: string;
  readonly prophecyCategory?: ProphecyCategory;
  readonly relatedEvents?: readonly RelatedEvent[];
  readonly id: string; // Add unique identifier
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// Filter interfaces with strict typing
export interface IslamicDataFilters {
  readonly type: string;
  readonly status?: ProphecyStatus;
  readonly fulfillmentStatus?: FulfillmentStatus;
  readonly prophecyCategory?: ProphecyCategory;
  readonly searchTerm: string;
  readonly sortBy: string;
  readonly yearRange?: {
    readonly min: number;
    readonly max: number;
  };
}

// Enhanced User interface
export interface User {
  readonly uid: string;
  readonly email: string;
  readonly displayName?: string;
  readonly photoURL?: string;
  readonly favorites?: readonly string[];
  readonly preferences: {
    readonly darkMode: boolean;
    readonly language: string;
    readonly fontSize: "small" | "medium" | "large";
    readonly highContrast: boolean;
    readonly reducedMotion: boolean;
  };
  readonly createdAt: Date;
  readonly lastActive: Date;
}

// Enhanced Quran Ayah interface
export interface QuranAyah {
  readonly surah_no: number;
  readonly surah_name_en: string;
  readonly surah_name_ar: string;
  readonly surah_name_roman: string;
  readonly ayah_no_surah: number;
  readonly ayah_no_quran: number;
  readonly ayah_ar: string;
  readonly ayah_en: string;
  readonly hizb_quarter: number;
  readonly total_ayah_surah: number;
  readonly total_ayah_quran: number;
  readonly place_of_revelation: string;
  readonly sajah_ayah: boolean;
  readonly sajdah_no: string;
  readonly no_of_word_ayah: number;
  readonly id: string; // Add unique identifier
}

// Enhanced Hadith Entry interface
export interface HadithEntry {
  readonly id: string;
  readonly number: string;
  readonly book: string;
  readonly chapter: string;
  readonly narrator: string;
  readonly text: string;
  readonly arabic?: string;
  readonly translation?: string;
  readonly grade?: string;
  readonly reference?: string;
  readonly createdAt: Date;
}

// Filter interfaces
export interface QuranFilters {
  readonly surah?: number;
  readonly searchTerm: string;
  readonly placeOfRevelation?: string;
  readonly sortBy: string;
  readonly verseRange?: {
    readonly min: number;
    readonly max: number;
  };
}

export interface HadithFilters {
  readonly searchTerm: string;
  readonly chapter?: string;
  readonly sortBy: string;
  readonly numberRange?: {
    readonly min: number;
    readonly max: number;
  };
}

// Enhanced search result types
export interface UnifiedSearchResult {
  readonly id: string;
  readonly type: DataSource;
  readonly title: string;
  readonly content: string;
  readonly source: string;
  readonly data: IslamicData | QuranAyah | HadithEntry;
  readonly relevance: number; // 0-100
  readonly timestamp: Date;
}

// Filter state interface with strict typing
export interface FilterState {
  readonly types: readonly string[];
  readonly categories: readonly string[];
  readonly searchFields: readonly string[];
  readonly sortBy: string;
  readonly sortOrder: SortOrder;
  readonly fulfillmentStatus: readonly FulfillmentStatus[];
  readonly prophecyCategories: readonly ProphecyCategory[];
  readonly yearRange: {
    readonly min: number;
    readonly max: number;
  };
  readonly dataSources: readonly DataSource[];
  readonly quranSurahs: readonly string[];
  readonly quranVerseRange: {
    readonly min: number;
    readonly max: number;
  };
  readonly quranPlaceOfRevelation: readonly string[];
  readonly quranSajdahOnly: boolean;
  readonly hadithNumberRange: {
    readonly min: number;
    readonly max: number;
  };
  readonly hadithCategories: readonly string[];
}

// Pagination types
export interface PaginationState {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly itemsPerPage: number;
  readonly totalItems: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

// Toast notification types
export interface ToastNotification {
  readonly id: string;
  readonly message: string;
  readonly type: ToastType;
  readonly duration?: number;
  readonly timestamp: Date;
  readonly persistent?: boolean;
}

// Chart data types with strict typing
export interface ChartDataPoint {
  readonly label: string;
  readonly value: number;
  readonly color?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface ChartConfig {
  readonly type: ChartType;
  readonly data: readonly ChartDataPoint[];
  readonly title: string;
  readonly height?: number;
  readonly width?: number;
  readonly theme?: "light" | "dark";
}

// Tooltip types for charts
export interface ChartTooltip {
  readonly datum: {
    readonly id: string | number;
    readonly value: number;
    readonly color: string;
    readonly label: string;
  };
  readonly x: number;
  readonly y: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Type guards for runtime type checking
export const isIslamicData = (data: unknown): data is IslamicData => {
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    "title" in data &&
    "notes" in data
  );
};

export const isQuranAyah = (data: unknown): data is QuranAyah => {
  return (
    typeof data === "object" &&
    data !== null &&
    "surah_no" in data &&
    "ayah_no_surah" in data &&
    "ayah_ar" in data
  );
};

export const isHadithEntry = (data: unknown): data is HadithEntry => {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "number" in data &&
    "text" in data
  );
};

// Union types for better type safety
export type SearchableData = IslamicData | QuranAyah | HadithEntry;
export type ChartData = readonly ChartDataPoint[];
export type FilterValue = string | number | boolean | readonly string[];

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: DataLoadError;
  readonly timestamp: Date;
  readonly requestId: string;
}

export interface PaginatedResponse<T> extends ApiResponse<readonly T[]> {
  readonly pagination: PaginationState;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface ChartMouseEvent {
  readonly datum: ChartDataPoint;
  readonly event: MouseEvent;
  readonly position: {
    readonly x: number;
    readonly y: number;
  };
}

export interface FilterChangeEvent {
  readonly filterName: string;
  readonly value: FilterValue;
  readonly previousValue: FilterValue;
  readonly timestamp: Date;
}
