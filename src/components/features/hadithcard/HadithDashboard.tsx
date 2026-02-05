import React, { useState } from "react";
import { HadithCard } from "./HadithCard";
import PaginationButton from "../../common/PaginationButton";
import { useHadithData } from "../../../hooks/useHadithData";
import { scrollToTop } from "../../../utils/scrollUtils";
import Masonry from "react-masonry-css";
import type { HadithEntry } from "../../../types/Types";
import { SanitizedInput } from "../../common/SanitizedInput";

interface HadithDashboardProps {
  onFavorite?: (hadith: HadithEntry) => void;
  isFavorite?: (hadith: HadithEntry) => boolean;
}

export function HadithDashboard({
  onFavorite,
  isFavorite,
}: HadithDashboardProps) {
  const {
    paginatedData,
    loading,
    error,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    stats,
    uniqueChapters,
  } = useHadithData();

  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, searchTerm });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, sortBy: e.target.value });
    setCurrentPage(1);
  };

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, chapter: e.target.value });
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mb-4"></div>
        <p className="text-stone-600 dark:text-stone-400">
          Loading Hadith data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded p-4">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="ltr">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-stone-700 dark:text-purple-400 mb-2">
          Sahih Bukhari and Muslim Hadith Collection
        </h2>
        <p className="text-lg text-stone-600 dark:text-stone-400">
          Explore the sayings and actions of Prophet Muhammad (ﷺ) from hadith
          collections
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-white dark:bg-stone-800 rounded-xl p-3 sm:p-4 shadow-lg border border-stone-200 dark:border-stone-700">
          <div className="text-xl sm:text-2xl font-bold text-stone-700 dark:text-purple-400">
            {stats.totalHadiths.toLocaleString()}
          </div>
          <div className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium">
            Total Hadiths
          </div>
        </div>
        <div className="bg-white dark:bg-stone-800 rounded-xl p-3 sm:p-4 shadow-lg border border-stone-200 dark:border-stone-700">
          <div className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-400">
            {stats.totalWords.toLocaleString()}
          </div>
          <div className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium">
            Total Words
          </div>
        </div>
        <div className="bg-white dark:bg-stone-800 rounded-xl p-3 sm:p-4 shadow-lg border border-stone-200 dark:border-stone-700">
          <div className="text-xl sm:text-2xl font-bold text-orange-700 dark:text-orange-400">
            {stats.averageLength}
          </div>
          <div className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium">
            Avg. Words per Hadith
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-stone-800 rounded-xl p-6 shadow-lg border border-stone-200 dark:border-stone-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="sm:col-span-2 lg:col-span-2 w-full"
          >
            <div className="flex flex-col gap-2">
              <label
                htmlFor="hadith-search"
                className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium"
              >
                Search:
              </label>
              <div className="flex items-stretch">
                <div className="flex-1 flex">
                  <SanitizedInput
                    type="text"
                    id="hadith-search"
                    name="hadith-search"
                    placeholder="Search through hadith content..."
                    sanitizeOptions={{
                      sanitizeType: "islamic",
                      validateIslamic: true,
                    }}
                    onValueChange={setSearchTerm}
                    className="!rounded-l-lg !rounded-r-none !border-r-0 !focus:ring-stone-500 !border-stone-300 dark:!border-stone-600 !bg-white dark:!bg-stone-700 !text-stone-900 dark:!text-stone-100 !h-full !flex-1 !px-3 !py-2"
                    showErrors={false}
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 sm:px-4 py-2 bg-stone-500 dark:bg-purple-700 text-white rounded-r-lg hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors text-sm sm:text-base font-medium border border-l-0 border-stone-300 dark:border-stone-600 flex items-center justify-center min-w-fit whitespace-nowrap"
                >
                  Search
                </button>
              </div>
            </div>
          </form>

          {/* Chapter Filter */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="hadith-chapter"
              className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium"
            >
              Chapter:
            </label>
            <select
              id="hadith-chapter"
              name="hadith-chapter"
              value={filters.chapter || "all"}
              onChange={handleChapterChange}
              className="w-full px-3 sm:px-4 py-2 border border-stone-300 dark:border-stone-600 rounded-xl bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-stone-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="all">All Chapters</option>
              {uniqueChapters.map((chapter) => (
                <option key={chapter} value={chapter}>
                  {chapter}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="hadith-sort"
              className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium"
            >
              Sort by:
            </label>
            <select
              id="hadith-sort"
              name="hadith-sort"
              value={filters.sortBy}
              onChange={handleSortChange}
              className="w-full px-3 sm:px-4 py-2 border border-stone-300 dark:border-stone-600 rounded-xl bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-stone-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="index">Original Order</option>
              <option value="length">Length (Longest First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-stone-600 dark:text-stone-400">
          Showing {paginatedData.length} hadiths (Page {currentPage} of{" "}
          {totalPages})
        </p>
      </div>

      {/* Hadith Cards Grid */}
      <div className="w-full overflow-hidden">
        <Masonry
          breakpointCols={{
            default: 3,
            1400: 3,
            1200: 2,
            900: 2,
            768: 1,
            600: 1,
          }}
          className="flex w-full"
          columnClassName="bg-clip-padding pr-2 sm:pr-4"
          dir="rtl"
        >
          {paginatedData.map((hadith, index) => (
            <div key={index} className="mb-4" dir="ltr">
              <HadithCard
                hadith={hadith}
                index={(currentPage - 1) * 21 + index}
                onFavorite={onFavorite}
                isFavorite={isFavorite}
              />
            </div>
          ))}
        </Masonry>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-8">
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <ul className="flex items-center space-x-1 flex-wrap justify-center">
              <li>
                <PaginationButton
                  onClick={() => {
                    setCurrentPage(1);
                    scrollToTop();
                  }}
                  disabled={currentPage === 1}
                  ariaLabel="First page"
                >
                  First
                </PaginationButton>
              </li>
              <li>
                <PaginationButton
                  onClick={() => {
                    setCurrentPage(Math.max(1, currentPage - 1));
                    scrollToTop();
                  }}
                  disabled={currentPage === 1}
                  ariaLabel="Previous page"
                >
                  Previous
                </PaginationButton>
              </li>
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                const page =
                  Math.max(1, Math.min(totalPages - 2, currentPage - 1)) + i;
                return (
                  <li key={page}>
                    <PaginationButton
                      onClick={() => {
                        setCurrentPage(page);
                        scrollToTop();
                      }}
                      isActive={page === currentPage}
                      ariaLabel={`Go to page ${page}`}
                    >
                      {page}
                    </PaginationButton>
                  </li>
                );
              })}
              <li>
                <PaginationButton
                  onClick={() => {
                    setCurrentPage(Math.min(totalPages, currentPage + 1));
                    scrollToTop();
                  }}
                  disabled={currentPage === totalPages}
                  ariaLabel="Next page"
                >
                  Next
                </PaginationButton>
              </li>
              <li>
                <PaginationButton
                  onClick={() => {
                    setCurrentPage(totalPages);
                    scrollToTop();
                  }}
                  disabled={currentPage === totalPages}
                  ariaLabel="Last page"
                >
                  Last
                </PaginationButton>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
