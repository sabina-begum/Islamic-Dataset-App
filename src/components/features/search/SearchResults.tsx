import React, { memo } from "react";
import type { IslamicData, QuranAyah, HadithEntry } from "../../../types/Types";

// Import the canonical UnifiedSearchResult type
import type { UnifiedSearchResult } from "../../../types/Types";
import type { FavoriteItem } from "../../../hooks/useFavorites";
import { ExportButton } from "../export/ExportButton";
import { generateScholarlySummary } from "../../../utils/dataSanitizer";

interface SearchResultsProps {
  results: UnifiedSearchResult[];
  searchQuery: string;
  totalResults: number;
  onFavorite: (item: FavoriteItem) => void;
  isFavorite: (item: FavoriteItem) => boolean;
  isLoading?: boolean;
}

// Memoized SearchResults for better performance with frequent search updates
export const SearchResults: React.FC<SearchResultsProps> = memo(
  ({
    results,
    searchQuery,
    totalResults,
    onFavorite,
    isFavorite,
    isLoading = false,
  }) => {
    // Get search analytics
    const getSearchAnalytics = () => {
      if (!searchQuery.trim()) return null;

      const typeBreakdown = results.reduce((acc, result) => {
        const type = result.type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topTypes = Object.entries(typeBreakdown)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

      return { typeBreakdown, topTypes };
    };

    const analytics = getSearchAnalytics();

    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
            <p className="text-stone-600 dark:text-stone-400">
              Searching across all available Islamic sources...
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-500 mt-2">
              This may take a moment for large datasets
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 max-h-screen overflow-y-auto">
        {/* Search Results Header */}
        <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700 sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-green-700 dark:text-green-400">
                Cross-Reference Search Results
              </h2>
              {searchQuery.trim() && (
                <p className="text-stone-600 dark:text-stone-400 mt-1">
                  Found{" "}
                  <span className="font-semibold text-green-700 dark:text-green-400">
                    {totalResults}
                  </span>{" "}
                  results for "
                  <span className="font-semibold">{searchQuery}</span>"
                </p>
              )}
            </div>

            {/* Search Analytics and Export */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Search Analytics */}
              {analytics && analytics.topTypes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-stone-500 dark:text-stone-400">
                    Top sources:
                  </span>
                  {analytics.topTypes.map(([type, count]) => (
                    <span
                      key={type}
                      className="px-2 py-1 bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs rounded-full"
                    >
                      {type} ({count})
                    </span>
                  ))}
                </div>
              )}

              {/* Export Button */}
              {results.length > 0 && (
                <ExportButton
                  results={results}
                  searchQuery={searchQuery}
                  className="sm:ml-auto"
                />
              )}
            </div>
          </div>
        </div>

        {/* Search Results */}
        {results.length === 0 ? (
          <div className="bg-white dark:bg-stone-800 rounded-xl shadow p-8 text-center flex flex-col items-center gap-4 border-2 border-dashed border-stone-200 dark:border-stone-600">
            <svg
              className="w-16 h-16 text-stone-400 dark:text-stone-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-stone-700 dark:text-stone-300 mb-2">
                No results found
              </h3>
              <p className="text-stone-500 dark:text-stone-400">
                {searchQuery.trim()
                  ? `No Islamic knowledge found for "${searchQuery}". Try different keywords or check your spelling.`
                  : "Start typing to search across Quran, Hadith, and miracles."}
              </p>
            </div>
            <div className="text-sm text-stone-400 dark:text-stone-500">
              <p>Try searching for:</p>
              <ul className="mt-1 space-y-1">
                <li>• Quran verses by content or surah name</li>
                <li>• Hadith narrations by keywords</li>
                <li>
                  • Prophecies/ Prophetic Medicines types like "prophecy" or
                  "medicine"
                </li>
                <li>• Source information like "Sahih Bukhari"</li>
                <li>• Broader terms to find more results</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {results.map((result, index) => {
              // Create favorite handlers for each type
              const handleFavorite = (item: FavoriteItem) => {
                onFavorite(item);
              };

              const checkIsFavorite = (item: FavoriteItem) => {
                return isFavorite(item);
              };

              return (
                <div
                  key={result.id}
                  className="break-inside-avoid bg-white dark:bg-stone-800 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700 overflow-hidden"
                >
                  {/* Type Badge */}
                  <div className="px-4 pt-4 pb-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        result.type === "islamic data"
                          ? (result.data as IslamicData).type === "prophecy"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200"
                            : (result.data as IslamicData).type === "scientific"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                            : (result.data as IslamicData).type === "health"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                            : (result.data as IslamicData).type === "qadr"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          : result.type === "quran"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                          : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200"
                      }`}
                    >
                      {result.type === "islamic data"
                        ? (result.data as IslamicData).type === "prophecy"
                          ? "Prophecy"
                          : (result.data as IslamicData).type === "scientific"
                          ? "Science"
                          : (result.data as IslamicData).type === "health"
                          ? "Health Science"
                          : (result.data as IslamicData).type === "qadr"
                          ? "Qadr"
                          : "Islamic Data"
                        : result.type === "quran"
                        ? "Quran Verse"
                        : "Hadith"}
                    </span>
                  </div>

                  {/* Render the appropriate card component */}
                  {result.type === "islamic data" && (
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-green-700 dark:text-green-400 line-clamp-2">
                          {(result.data as IslamicData).title}
                        </h3>
                        <button
                          onClick={() => handleFavorite(result.data)}
                          className={`flex-shrink-0 p-2 rounded-full transition-all duration-200 ${
                            checkIsFavorite(result.data)
                              ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-600 hover:text-yellow-700"
                              : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700"
                          }`}
                          aria-label={
                            checkIsFavorite(result.data)
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                        >
                          <svg
                            className="h-5 w-5"
                            fill={
                              checkIsFavorite(result.data)
                                ? "currentColor"
                                : "none"
                            }
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        </button>
                      </div>
                      {/* Notes */}
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-200 max-h-20 overflow-y-auto custom-scrollbar">
                          {(result.data as IslamicData).notes ||
                            generateScholarlySummary(
                              result.data as IslamicData
                            )}
                        </p>
                      </div>
                    </div>
                  )}
                  {result.type === "quran" && (
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 line-clamp-1">
                            {(result.data as QuranAyah).surah_name_en}{" "}
                            {(result.data as QuranAyah).ayah_no_surah}
                          </h3>
                          <p className="text-sm text-stone-600 dark:text-stone-400">
                            {(result.data as QuranAyah).place_of_revelation}
                          </p>
                        </div>
                        <button
                          onClick={() => handleFavorite(result.data)}
                          className={`flex-shrink-0 p-2 rounded-full transition-all duration-200 ${
                            checkIsFavorite(result.data)
                              ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-600 hover:text-yellow-700"
                              : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700"
                          }`}
                          aria-label={
                            checkIsFavorite(result.data)
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                        >
                          <svg
                            className="h-5 w-5"
                            fill={
                              checkIsFavorite(result.data)
                                ? "currentColor"
                                : "none"
                            }
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        </button>
                      </div>
                      {(result.data as QuranAyah).ayah_ar && (
                        <div className="bg-stone-50 dark:bg-stone-700 rounded-lg p-3 border border-stone-200 dark:border-stone-600 mb-3">
                          <p
                            className="text-right text-lg leading-relaxed text-stone-800 dark:text-stone-200 font-arabic max-h-32 overflow-y-auto custom-scrollbar"
                            dir="rtl"
                          >
                            {(result.data as QuranAyah).ayah_ar}
                          </p>
                        </div>
                      )}
                      {(result.data as QuranAyah).ayah_en && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                          <p className="text-sm leading-relaxed text-blue-800 dark:text-blue-300 max-h-32 overflow-y-auto custom-scrollbar">
                            {(result.data as QuranAyah).ayah_en}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {result.type === "hadith" && (
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-purple-700 dark:text-purple-400 line-clamp-1">
                            Hadith #
                            {(result.data as HadithEntry).number || index + 1}
                          </h3>
                          <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-1">
                            {(result.data as HadithEntry).book} -{" "}
                            {(result.data as HadithEntry).chapter}
                          </p>
                        </div>
                        <button
                          onClick={() => handleFavorite(result.data)}
                          className={`flex-shrink-0 p-2 rounded-full transition-all duration-200 ${
                            checkIsFavorite(result.data)
                              ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-600 hover:text-yellow-700"
                              : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700"
                          }`}
                          aria-label={
                            checkIsFavorite(result.data)
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                        >
                          <svg
                            className="h-5 w-5"
                            fill={
                              checkIsFavorite(result.data)
                                ? "currentColor"
                                : "none"
                            }
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        </button>
                      </div>
                      {(result.data as HadithEntry).text &&
                        (result.data as HadithEntry).text !==
                          "not found yet" && (
                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
                            <p className="text-sm leading-relaxed text-purple-800 dark:text-purple-300 max-h-48 overflow-y-auto custom-scrollbar">
                              {(result.data as HadithEntry).text}
                            </p>
                          </div>
                        )}
                      {(result.data as HadithEntry).arabic && (
                        <div className="bg-stone-50 dark:bg-stone-700 rounded-lg p-3 border border-stone-200 dark:border-stone-600">
                          <p
                            className="text-right text-sm leading-relaxed text-stone-800 dark:text-stone-200 font-arabic line-clamp-4"
                            dir="rtl"
                          >
                            {(result.data as HadithEntry).arabic}
                          </p>
                        </div>
                      )}
                      {(!(result.data as HadithEntry).text ||
                        (result.data as HadithEntry).text ===
                          "not found yet") && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700">
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            ⚠️ English translation not yet available for this
                            hadith. Arabic text is available above.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);
