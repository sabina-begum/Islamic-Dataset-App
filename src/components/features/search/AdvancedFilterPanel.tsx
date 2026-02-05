import React, { useState, useMemo, useCallback } from "react";
import type {
  IslamicData,
  QuranAyah,
  HadithEntry,
  FilterState,
  FulfillmentStatus,
  ProphecyCategory,
} from "../../../types/Types";
import { useLanguage } from "../../../hooks/useContext";

interface AdvancedFilterPanelProps {
  data: IslamicData[];
  quranData?: QuranAyah[];
  hadithData?: HadithEntry[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
  data,
  quranData = [],
  hadithData = [],
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true); // Changed to true to show advanced filters by default

  // Load saved presets - memoized to prevent unnecessary re-computations
  const savedPresets = useMemo(() => {
    const saved = localStorage.getItem("searchPresets");
    return saved ? JSON.parse(saved) : [];
  }, []);

  // Memoized unique values for filters to prevent recalculation on every render
  const uniqueTypes = useMemo(
    () => [...new Set(data.map((data) => data.type))],
    [data]
  );

  const uniqueFulfillmentStatus = useMemo(
    () => [
      ...new Set(data.map((data) => data.fulfillmentStatus).filter(Boolean)),
    ],
    [data]
  );

  const uniqueProphecyCategories = useMemo(
    () => [
      ...new Set(data.map((data) => data.prophecyCategory).filter(Boolean)),
    ],
    [data]
  );

  // Memoized Quran-specific unique values
  const uniqueQuranSurahs = useMemo(
    () =>
      Array.from(
        new Map<number, string>(
          quranData.map((ayah) => [ayah.surah_no, ayah.surah_name_en])
        ).entries()
      )
        .sort(([a], [b]) => a - b)
        .map(([number, name]) => ({ number, name })),
    [quranData]
  );

  const uniqueQuranPlaces = useMemo(
    () => [...new Set(quranData.map((ayah) => ayah.place_of_revelation))],
    [quranData]
  );

  const quranVerseNumbers = useMemo(
    () =>
      quranData
        .map((ayah) => parseInt(ayah.ayah_no_surah.toString()))
        .filter(Boolean),
    [quranData]
  );

  const quranMinVerse = useMemo(
    () => (quranVerseNumbers.length > 0 ? Math.min(...quranVerseNumbers) : 1),
    [quranVerseNumbers]
  );

  const quranMaxVerse = useMemo(
    () =>
      quranVerseNumbers.length > 0 ? Math.max(...quranVerseNumbers) : 6236,
    [quranVerseNumbers]
  );

  // Memoized Hadith-specific unique values
  const hadithNumbers = useMemo(
    () => hadithData.map((_, index) => index + 1),
    [hadithData]
  );

  const hadithMinNumber = useMemo(
    () => (hadithNumbers.length > 0 ? Math.min(...hadithNumbers) : 1),
    [hadithNumbers]
  );

  const hadithMaxNumber = useMemo(
    () => (hadithNumbers.length > 0 ? Math.max(...hadithNumbers) : 1000),
    [hadithNumbers]
  );

  // Memoized static options to prevent recreation on every render
  const searchFieldOptions = useMemo(
    () => [
      { value: "title", label: t("filter.title") },
      { value: "description", label: t("filter.description") },
      { value: "source", label: t("filter.source") },
      { value: "category", label: t("filter.category") },
      { value: "type", label: t("filter.type") },
      { value: "fulfillmentStatus", label: t("filter.fulfillmentStatus") },
      { value: "prophecyCategory", label: t("filter.prophecyCategory") },
    ],
    [t]
  );

  const dataSourceOptions = useMemo(
    () => [
      { value: "islamic data", label: t("filter.islamicData") },
      { value: "quran", label: t("filter.quran") },
      { value: "hadith", label: t("filter.hadith") },
    ],
    [t]
  );

  const sortOptions = useMemo(
    () => [
      { value: "title", label: t("filter.title") },
      { value: "type", label: t("filter.type") },
      { value: "category", label: t("filter.category") },
      { value: "fulfillmentStatus", label: t("filter.fulfillmentStatus") },
      { value: "prophecyCategory", label: t("filter.prophecyCategory") },
      { value: "year", label: t("filter.year") },
    ],
    [t]
  );

  // Memoized unique hadith categories to prevent recalculation
  const uniqueHadithCategories = useMemo(
    () =>
      Array.from(
        new Set(hadithData.map((hadith) => hadith.chapter).filter(Boolean))
      ).sort(),
    [hadithData]
  );

  // Memoized active filter count to prevent recalculation
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.types.length > 0) count++;
    if (filters.categories.length > 0) count++;
    if (filters.searchFields.length > 0) count++;
    if (filters.fulfillmentStatus.length > 0) count++;
    if (filters.prophecyCategories.length > 0) count++;
    if (filters.dataSources.length > 0 && filters.dataSources.length < 3)
      count++;
    if (filters.yearRange.min > 0 || filters.yearRange.max < 2024) count++;
    // New filter counts
    if (filters.quranSurahs.length > 0) count++;
    if (
      filters.quranVerseRange.min > quranMinVerse ||
      filters.quranVerseRange.max < quranMaxVerse
    )
      count++;
    if (filters.quranPlaceOfRevelation.length > 0) count++;
    if (
      filters.hadithNumberRange.min > hadithMinNumber ||
      filters.hadithNumberRange.max < hadithMaxNumber
    )
      count++;
    if (filters.hadithCategories.length > 0) count++;
    return count;
  }, [filters, quranMinVerse, quranMaxVerse, hadithMinNumber, hadithMaxNumber]);

  // Memoized event handlers to prevent unnecessary re-renders
  const handleFilterChange = useCallback(
    (key: keyof FilterState, value: FilterState[keyof FilterState]) => {
      onFiltersChange({ ...filters, [key]: value });
    },
    [filters, onFiltersChange]
  );

  const handleMultiSelectToggle = useCallback(
    (key: keyof FilterState, value: string) => {
      const currentValues = filters[key] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      handleFilterChange(key, newValues);
    },
    [filters, handleFilterChange]
  );

  const handleRangeChange = useCallback(
    (key: keyof FilterState, field: "min" | "max", value: number) => {
      const currentRange = filters[key] as { min: number; max: number };
      const newRange = { ...currentRange, [field]: value };
      handleFilterChange(key, newRange);
    },
    [filters, handleFilterChange]
  );

  // Memoized preset handlers
  const handleSavePreset = useCallback(() => {
    const presetName = prompt(t("filter.presetPrompt"));
    if (presetName) {
      const newPreset = {
        name: presetName,
        filters: { ...filters },
      };
      const updatedPresets = [...savedPresets, newPreset];
      localStorage.setItem("searchPresets", JSON.stringify(updatedPresets));
      window.location.reload(); // Refresh to update the UI
    }
  }, [filters, savedPresets, t]);

  const handleLoadPreset = useCallback(
    (preset: { name: string; filters: FilterState }) => {
      onFiltersChange(preset.filters);
    },
    [onFiltersChange]
  );

  const handleDeletePreset = useCallback(
    (presetName: string) => {
      const updatedPresets = savedPresets.filter(
        (p: { name: string; filters: FilterState }) => p.name !== presetName
      );
      localStorage.setItem("searchPresets", JSON.stringify(updatedPresets));
      window.location.reload(); // Refresh to update the UI
    },
    [savedPresets]
  );

  // Memoized toggle handlers
  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const handleQuranSurahToggle = useCallback(() => {
    const newFilters = { ...filters };
    if (filters.quranSurahs.length === uniqueQuranSurahs.length) {
      newFilters.quranSurahs = [];
    } else {
      newFilters.quranSurahs = uniqueQuranSurahs.map(({ number }) =>
        number.toString()
      );
    }
    onFiltersChange(newFilters);
  }, [filters, uniqueQuranSurahs, onFiltersChange]);

  const handleHadithChapterToggle = useCallback(() => {
    const newFilters = { ...filters };
    if (filters.hadithCategories.length === uniqueHadithCategories.length) {
      newFilters.hadithCategories = [];
    } else {
      newFilters.hadithCategories = uniqueHadithCategories;
    }
    onFiltersChange(newFilters);
  }, [filters, uniqueHadithCategories, onFiltersChange]);

  // Early return if no active filters and not expanded
  if (activeFilterCount === 0 && !isExpanded) {
    return null;
  }

  return (
    <>
      {/* Only render the panel if there are active filters or if expanded */}
      {activeFilterCount > 0 || isExpanded ? (
        <div className="mb-6">
          <div className="bg-stone-200 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            {/* Filter Header */}
            <div className="p-4 sm:p-6 border-b border-stone-200 dark:border-stone-700 bg-stone-300 dark:bg-stone-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-emerald-500 to-green-600 dark:from-emerald-400 dark:to-green-500 rounded-full"></div>
                    <h3 className="text-lg sm:text-xl font-bold text-stone-800 dark:text-stone-200">
                      {t("search.advanced")}
                    </h3>
                  </div>
                  {activeFilterCount > 0 && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap">
                      {activeFilterCount} {t("search.active")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 sm:gap-3 justify-end sm:justify-start">
                  {activeFilterCount > 0 && (
                    <button
                      onClick={onClearFilters}
                      className="px-2 sm:px-3 py-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs sm:text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 border border-red-200 dark:border-red-800 whitespace-nowrap"
                    >
                      {t("search.clearAll")}
                    </button>
                  )}
                  <button
                    onClick={toggleExpanded}
                    className="p-1.5 sm:p-2 text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-all duration-200"
                  >
                    {isExpanded ? (
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Content (conditionally rendered) */}
            {isExpanded && (
              <div className="p-4 space-y-6">
                {/* Data Sources Filter */}
                <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-4 border border-stone-200 dark:border-stone-700">
                  <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 bg-stone-400 dark:bg-stone-500 rounded-full"></div>
                    {t("search.dataSources")}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {dataSourceOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-white dark:hover:bg-stone-700 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={filters.dataSources.includes(
                            option.value as "islamic data" | "quran" | "hadith"
                          )}
                          onChange={() =>
                            handleMultiSelectToggle("dataSources", option.value)
                          }
                          className="rounded border-stone-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-stone-600 dark:text-stone-400 font-medium">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Separator */}
                <hr className="border-stone-300 dark:border-stone-600 my-6" />

                {/* Quran-Specific Filters */}
                {filters.dataSources.includes("quran") && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 space-y-4">
                    <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                      <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                      {t("quran.filter.surah")}
                    </h4>

                    {/* Surah Filter */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                          {t("quran.filter.surah")}
                        </label>
                        <button
                          onClick={handleQuranSurahToggle}
                          className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        >
                          {filters.quranSurahs.length ===
                          uniqueQuranSurahs.length
                            ? t("filter.deselectAll")
                            : t("filter.selectAll")}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-32 overflow-y-auto bg-white dark:bg-stone-700 rounded-lg p-3 border border-stone-300 dark:border-stone-600 shadow-sm custom-scrollbar">
                        {uniqueQuranSurahs.map(({ number, name }) => (
                          <label
                            key={number}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={filters.quranSurahs.includes(
                                number.toString()
                              )}
                              onChange={() =>
                                handleMultiSelectToggle(
                                  "quranSurahs",
                                  number.toString()
                                )
                              }
                              className="rounded border-stone-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-xs text-stone-600 dark:text-stone-400">
                              {name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Verse Range Filter */}
                    <div>
                      <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2 block">
                        Verse Range
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min={quranMinVerse}
                          max={quranMaxVerse}
                          value={filters.quranVerseRange.min}
                          onChange={(e) =>
                            handleRangeChange(
                              "quranVerseRange",
                              "min",
                              parseInt(e.target.value) || quranMinVerse
                            )
                          }
                          className="w-20 px-2 py-1 text-sm border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                        />
                        <span className="text-sm text-stone-600 dark:text-stone-400">
                          to
                        </span>
                        <input
                          type="number"
                          min={quranMinVerse}
                          max={quranMaxVerse}
                          value={filters.quranVerseRange.max}
                          onChange={(e) =>
                            handleRangeChange(
                              "quranVerseRange",
                              "max",
                              parseInt(e.target.value) || quranMaxVerse
                            )
                          }
                          className="w-20 px-2 py-1 text-sm border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                        />
                      </div>
                    </div>

                    {/* Place of Revelation Filter */}
                    <div>
                      <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2 block">
                        {t("quran.filter.place")}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {uniqueQuranPlaces.map((place) => (
                          <label
                            key={place}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={filters.quranPlaceOfRevelation.includes(
                                place
                              )}
                              onChange={() =>
                                handleMultiSelectToggle(
                                  "quranPlaceOfRevelation",
                                  place
                                )
                              }
                              className="rounded border-stone-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-stone-600 dark:text-stone-400">
                              {place}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Sajdah Verses Filter */}
                    <div>
                      <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2 block">
                        Sajdah Verses Only
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.quranSajdahOnly}
                          onChange={(e) =>
                            handleFilterChange(
                              "quranSajdahOnly",
                              e.target.checked
                            )
                          }
                          className="rounded border-stone-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-stone-600 dark:text-stone-400">
                          Show only verses that require prostration (Sajdah)
                        </span>
                      </div>
                    </div>

                    {/* Quick Sajdah Preset Button */}
                    <div>
                      <button
                        onClick={() => {
                          const sajdahPreset: FilterState = {
                            ...filters,
                            dataSources: ["quran"],
                            quranSajdahOnly: true,
                            quranSurahs: [],
                            quranVerseRange: { min: 1, max: 6236 },
                            quranPlaceOfRevelation: [],
                          };
                          onFiltersChange(sajdahPreset);
                        }}
                        className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Show All Sajdah Verses
                      </button>
                    </div>
                  </div>
                )}

                {/* Separator */}
                <hr className="border-stone-300 dark:border-stone-600 my-6" />

                {/* Hadith-Specific Filters */}
                {filters.dataSources.includes("hadith") && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800 space-y-4">
                    <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
                      <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                      {t("hadith.filter.title")}
                    </h4>

                    {/* Hadith Number Range Filter */}
                    <div>
                      <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2 block">
                        {t("hadith.filter.numberRange")}
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min={hadithMinNumber}
                          max={hadithMaxNumber}
                          value={filters.hadithNumberRange.min}
                          onChange={(e) =>
                            handleRangeChange(
                              "hadithNumberRange",
                              "min",
                              parseInt(e.target.value) || hadithMinNumber
                            )
                          }
                          className="w-20 px-2 py-1 text-sm border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                        />
                        <span className="text-sm text-stone-600 dark:text-stone-400">
                          to
                        </span>
                        <input
                          type="number"
                          min={hadithMinNumber}
                          max={hadithMaxNumber}
                          value={filters.hadithNumberRange.max}
                          onChange={(e) =>
                            handleRangeChange(
                              "hadithNumberRange",
                              "max",
                              parseInt(e.target.value) || hadithMaxNumber
                            )
                          }
                          className="w-20 px-2 py-1 text-sm border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                        />
                      </div>
                    </div>

                    {/* Hadith Categories Filter */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                          {t("hadith.chapter")}
                        </label>
                        <button
                          onClick={handleHadithChapterToggle}
                          className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        >
                          {filters.hadithCategories.length ===
                          uniqueHadithCategories.length
                            ? t("filter.deselectAll")
                            : t("filter.selectAll")}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto bg-white dark:bg-stone-700 rounded-lg p-3 border border-stone-300 dark:border-stone-600 shadow-sm custom-scrollbar">
                        {uniqueHadithCategories.map((chapter) => (
                          <label
                            key={chapter}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={filters.hadithCategories.includes(
                                chapter
                              )}
                              onChange={() =>
                                handleMultiSelectToggle(
                                  "hadithCategories",
                                  chapter
                                )
                              }
                              className="rounded border-stone-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-stone-600 dark:text-stone-400">
                              {chapter}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Separator */}
                <hr className="border-stone-300 dark:border-stone-600 my-6" />

                {/* Islamic Data Filters */}
                {filters.dataSources.includes("islamic data") && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800 space-y-4">
                    <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-3 flex items-center gap-2">
                      <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                      {t("search.islamicDataFilters")}
                    </h4>

                    {/* Type Filter */}
                    <div>
                      <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2 block">
                        {t("filter.type")}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {uniqueTypes.map((type) => (
                          <label
                            key={type}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={filters.types.includes(type)}
                              onChange={() =>
                                handleMultiSelectToggle("types", type)
                              }
                              className="rounded border-stone-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-stone-600 dark:text-stone-400">
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Fulfillment Status Filter */}
                    {uniqueFulfillmentStatus.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2 block">
                          {t("filter.fulfillmentStatus")}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {uniqueFulfillmentStatus.map((status) => (
                            <label
                              key={status}
                              className="flex items-center space-x-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={filters.fulfillmentStatus.includes(
                                  status as FulfillmentStatus
                                )}
                                onChange={() =>
                                  handleMultiSelectToggle(
                                    "fulfillmentStatus",
                                    status as FulfillmentStatus
                                  )
                                }
                                className="rounded border-stone-300 text-green-600 focus:ring-green-500"
                              />
                              <span className="text-sm text-stone-600 dark:text-stone-400">
                                {status}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prophecy Category Filter */}
                    {uniqueProphecyCategories.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2 block">
                          {t("filter.prophecyCategory")}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {uniqueProphecyCategories.map((category) => (
                            <label
                              key={category}
                              className="flex items-center space-x-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={filters.prophecyCategories.includes(
                                  category as ProphecyCategory
                                )}
                                onChange={() =>
                                  handleMultiSelectToggle(
                                    "prophecyCategories",
                                    category as ProphecyCategory
                                  )
                                }
                                className="rounded border-stone-300 text-green-600 focus:ring-green-500"
                              />
                              <span className="text-sm text-stone-600 dark:text-stone-400">
                                {category}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Year Range Filter */}
                    <div>
                      <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2 block">
                        {t("filter.yearRange")}
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min={0}
                          max={2024}
                          value={filters.yearRange.min}
                          onChange={(e) =>
                            handleRangeChange(
                              "yearRange",
                              "min",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-20 px-2 py-1 text-sm border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                        />
                        <span className="text-sm text-stone-600 dark:text-stone-400">
                          to
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={2024}
                          value={filters.yearRange.max}
                          onChange={(e) =>
                            handleRangeChange(
                              "yearRange",
                              "max",
                              parseInt(e.target.value) || 2024
                            )
                          }
                          className="w-20 px-2 py-1 text-sm border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Separator */}
                <hr className="border-stone-300 dark:border-stone-600 my-6" />

                {/* Search Fields Filter */}
                <div>
                  <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2 block">
                    {t("filter.searchFields")}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {searchFieldOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.searchFields.includes(option.value)}
                          onChange={() =>
                            handleMultiSelectToggle(
                              "searchFields",
                              option.value
                            )
                          }
                          className="rounded border-stone-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-stone-600 dark:text-stone-400">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2 block">
                    {t("search.sort")} {t("filter.by")}
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      handleFilterChange("sortBy", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preset Management */}
                <div className="border-t border-stone-200 dark:border-stone-700 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-medium text-stone-700 dark:text-stone-300">
                      {t("search.savedPresets")}
                    </h5>
                    <button
                      onClick={handleSavePreset}
                      className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                    >
                      {t("search.saveCurrent")}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {savedPresets.map(
                      (preset: { name: string; filters: FilterState }) => (
                        <div
                          key={preset.name}
                          className="flex items-center justify-between p-2 bg-stone-50 dark:bg-stone-700 rounded"
                        >
                          <button
                            onClick={() =>
                              handleLoadPreset(
                                preset as { name: string; filters: FilterState }
                              )
                            }
                            className="text-sm text-stone-700 dark:text-stone-300 hover:text-green-600 dark:hover:text-green-400"
                          >
                            {preset.name}
                          </button>
                          <button
                            onClick={() => handleDeletePreset(preset.name)}
                            className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            {t("search.delete")}
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
};
