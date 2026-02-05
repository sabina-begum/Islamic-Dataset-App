import React, { useEffect, useState, useRef, Suspense } from "react";
import {
  LazyAdvancedSearchDashboard,
  LazyChartsDashboard,
  LazyQuranDashboard,
  LazyHadithDashboard,
} from "./lazy";
import {
  SearchLoadingFallback,
  ChartLoadingFallback,
  LazyLoadingFallback,
} from "./common/LazyLoadingFallback";
import { DataCard } from "./features/datacard/DataCard";
import PaginationButton from "./common/PaginationButton";
import { useFavorites } from "../hooks/useFavorites";
import { useQuranData } from "../hooks/useQuranData";
import { useHadithData } from "../hooks/useHadithData";
import { useSanitizedData } from "../hooks/useSanitizedData";
import type { IslamicData, IslamicDataFilters } from "../types/Types";
import type { FavoriteItem } from "../hooks/useFavorites";
import type { Dispatch, SetStateAction } from "react";
import Masonry from "react-masonry-css";

import { scrollToTop } from "../utils/scrollUtils";
import { HomePageStats } from "./home/HomePageStats";
import { HomePageTabs } from "./home/HomePageTabs";
import { HomePageHeader } from "./home/HomePageHeader";
// import { DailySelection } from "./home/DailySelection";
import { DataLoadingState } from "./common/LoadingState";
import { useLanguage } from "../hooks/useContext";

interface HomePageProps {
  cards: IslamicData[];
  paginatedCards: IslamicData[];
  filters: IslamicDataFilters;
  setFilters: Dispatch<SetStateAction<IslamicDataFilters>>;
  types: string[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  goToPage: string;
  setGoToPage: (page: string) => void;
  handleGoToPage: () => void;
  handleExportCSV: () => void;
  handleExportJSON: () => void;
  setToast: (message: string) => void;
  cardsListRef: React.RefObject<HTMLDivElement>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function HomePage({
  cards,
  paginatedCards,
  filters,
  setFilters,
  types,
  currentPage,
  setCurrentPage,
  totalPages,
  handleExportCSV,
  handleExportJSON,
  setToast,
  cardsListRef,
  activeTab,
  setActiveTab,
}: HomePageProps) {
  // Use the proper favorites hook instead of local state
  const { favorites, addFavorite, removeFavorite } = useFavorites();

  // Use Quran and Hadith data hooks for unified search
  const { allData: quranData } = useQuranData(); // Use allData for full Quran dataset
  const { hadithData } = useHadithData();

  // Use sanitized data for display
  const sanitizedPaginatedCards = useSanitizedData(paginatedCards);

  // Add loading state tracking
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Language context
  const { t } = useLanguage();

  // Create refs for each content section for auto-scrolling
  const searchContentRef = useRef<HTMLDivElement>(null);
  const chartsContentRef = useRef<HTMLDivElement>(null);
  const quranContentRef = useRef<HTMLDivElement>(null);
  const hadithContentRef = useRef<HTMLDivElement>(null);

  // Handle footer category filter clicks
  useEffect(() => {
    const handleCategoryFilter = (event: CustomEvent) => {
      const { category } = event.detail;
      setFilters((prev) => ({
        ...prev,
        type: category,
      }));
      setActiveTab("all"); // Switch to the main data view
      setCurrentPage(1); // Reset to first page
      setToast(`Filtered by ${category} category`);
    };

    const onCategoryFilter = (e: Event) =>
      handleCategoryFilter(e as CustomEvent);

    window.addEventListener("filterByCategory", onCategoryFilter);

    return () => {
      window.removeEventListener("filterByCategory", onCategoryFilter);
    };
  }, [setFilters, setActiveTab, setCurrentPage, setToast]);

  // Handle tab change with scroll functionality
  const handleTabChange = (tabId: string) => {
    // Small delay to ensure the content is rendered before scrolling
    setTimeout(() => {
      let targetRef: React.RefObject<HTMLDivElement> | null = null;

      switch (tabId) {
        case "all":
          targetRef = cardsListRef;
          break;
        case "search":
          targetRef = searchContentRef;
          break;
        case "charts":
          targetRef = chartsContentRef;
          break;
        case "quran":
          targetRef = quranContentRef;
          break;
        case "hadith":
          targetRef = hadithContentRef;
          break;
        default:
          targetRef = cardsListRef;
      }

      if (targetRef?.current) {
        targetRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    }, 100);
  };

  // Check if data is still loading
  useEffect(() => {
    const hasData =
      cards.length > 0 || quranData.length > 0 || hadithData.length > 0;
    setIsDataLoading(!hasData);
  }, [cards, quranData, hadithData]);

  // Scroll to top of cards list when currentPage changes
  useEffect(() => {
    if (cardsListRef.current) {
      cardsListRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentPage, cardsListRef]);

  // Handle favorite toggle using the proper favorites system
  const handleFavorite = async (item: FavoriteItem) => {
    const isCurrentlyFavorite = favorites.some((fav) => {
      // Use the same comparison logic as the useFavorites hook
      const id1 = getItemId(fav);
      const id2 = getItemId(item);
      return id1 === id2;
    });

    if (isCurrentlyFavorite) {
      await removeFavorite(item);
      setToast(t("toast.removedFromFavorites"));
    } else {
      await addFavorite(item);
      setToast(t("toast.addedToFavorites"));
    }
  };

  // Check if an item is favorited using the favorites from the hook
  const isFavorite = (item: FavoriteItem) => {
    const isFav = favorites.some((fav) => {
      // Use the same comparison logic as the useFavorites hook
      const id1 = getItemId(fav);
      const id2 = getItemId(item);
      return id1 === id2;
    });

    return isFav;
  };

  // Helper function to get item ID (same as in useFavorites hook)
  const getItemId = (item: FavoriteItem): string => {
    if ("title" in item && "type" in item) {
      // IslamicData - use only title for consistency since type can vary
      return `islamic-${item.title}`;
    } else if ("surah_no" in item && "ayah_no_surah" in item) {
      // QuranAyah
      return `quran-${item.surah_no}-${item.ayah_no_surah}`;
    } else if ("number" in item) {
      // HadithEntry
      return `hadith-${item.number}`;
    }
    return `unknown-${JSON.stringify(item)}`;
  };

  // Masonry breakpoints
  const breakpointColumns = {
    default: 3,
    1200: 2,
    768: 1,
  };

  // Show loading state if no data is available yet
  if (isDataLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in-up">
        <DataLoadingState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-900 transition-colors duration-300">
      <div className="container mx-auto max-w-7xl px-2 sm:px-4 py-8 w-full overflow-hidden">
        {/* Header */}
        <HomePageHeader />

        {/* Quick Stats */}
        <HomePageStats
          cards={cards}
          quranData={quranData}
          hadithData={hadithData}
          favorites={favorites}
        />

        {/* Main Content */}
        <div className="bg-white dark:bg-stone-800 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-700">
          {/* Tab Navigation */}
          <HomePageTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onTabChange={handleTabChange}
          />

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {/* Show main data view by default when no tab is selected */}
            {(!activeTab || activeTab === "all") && (
              <div ref={cardsListRef} className="animate-fade-in">
                {/* Filters and Export */}
                <div className="space-y-4 mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                      Reflections
                    </h2>
                    <p className="text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
                      <em>
                        {" "}
                        "Read! In the name of your Lord who created. He created
                        man from a clot. Read! And your Lord is the Most
                        Generous, Who taught by the pen. He taught man that
                        which he knew not."{" "}
                      </em>
                      <br />
                      (Quran 96:1-5)
                      <br />
                      <br />
                      <em> "Do they not contemplate within themselves?" </em>
                      <br />
                      (Quran 30:8)
                    </p>
                  </div>
                </div>
                <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder={t("search.placeholder")}
                      value={filters.searchTerm}
                      onChange={(e) =>
                        setFilters({ ...filters, searchTerm: e.target.value })
                      }
                      className="px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-xl bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <select
                      value={filters.type}
                      onChange={(e) =>
                        setFilters({ ...filters, type: e.target.value })
                      }
                      className="px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-xl bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">{t("ui.allTypes")}</option>
                      {types.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleExportCSV}
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {t("ui.exportCSV")}
                    </button>
                    <button
                      onClick={handleExportJSON}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t("ui.exportJSON")}
                    </button>
                  </div>
                </div>

                {/* Cards Grid */}
                <Masonry
                  breakpointCols={breakpointColumns}
                  className="flex w-full"
                  columnClassName="bg-clip-padding pr-2 sm:pr-4"
                >
                  {sanitizedPaginatedCards.map((card) => (
                    <div key={`${card.type}-${card.title}`} className="mb-4">
                      <DataCard
                        card={card as IslamicData}
                        onFavorite={handleFavorite}
                        isFavorite={isFavorite(card as IslamicData)}
                      />
                    </div>
                  ))}
                </Masonry>

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
                            ariaLabel={t("ui.ariaLabel.firstPage")}
                          >
                            {t("search.first")}
                          </PaginationButton>
                        </li>
                        <li>
                          <PaginationButton
                            onClick={() => {
                              setCurrentPage(Math.max(1, currentPage - 1));
                              scrollToTop();
                            }}
                            disabled={currentPage === 1}
                            ariaLabel={t("ui.ariaLabel.previousPage")}
                          >
                            {t("search.previous")}
                          </PaginationButton>
                        </li>

                        {/* Page numbers with smart display */}
                        {(() => {
                          const pages = [];
                          const maxVisiblePages = 5;

                          if (totalPages <= maxVisiblePages) {
                            for (let i = 1; i <= totalPages; i++) {
                              pages.push(i);
                            }
                          } else {
                            const start = Math.max(1, currentPage - 2);
                            const end = Math.min(totalPages, currentPage + 2);

                            if (start > 1) {
                              pages.push(1);
                              if (start > 2) pages.push("...");
                            }

                            for (let i = start; i <= end; i++) {
                              pages.push(i);
                            }

                            if (end < totalPages) {
                              if (end < totalPages - 1) pages.push("...");
                              pages.push(totalPages);
                            }
                          }

                          return pages.map((page, index) => (
                            <li key={index}>
                              {page === "..." ? (
                                <span className="px-2 sm:px-3 py-1 text-stone-500 text-xs sm:text-sm">
                                  ...
                                </span>
                              ) : (
                                <PaginationButton
                                  onClick={() => {
                                    setCurrentPage(page as number);
                                    scrollToTop();
                                  }}
                                  isActive={page === currentPage}
                                  ariaLabel={`${t(
                                    "ui.ariaLabel.goToPage"
                                  )} ${page}${
                                    page === currentPage
                                      ? ` (${t("ui.currentPage")})`
                                      : ""
                                  }`}
                                >
                                  {page}
                                </PaginationButton>
                              )}
                            </li>
                          ));
                        })()}

                        <li>
                          <PaginationButton
                            onClick={() => {
                              setCurrentPage(
                                Math.min(totalPages, currentPage + 1)
                              );
                              scrollToTop();
                            }}
                            disabled={currentPage === totalPages}
                            ariaLabel={t("ui.ariaLabel.nextPage")}
                          >
                            {t("search.next")}
                          </PaginationButton>
                        </li>
                        <li>
                          <PaginationButton
                            onClick={() => {
                              setCurrentPage(totalPages);
                              scrollToTop();
                            }}
                            disabled={currentPage === totalPages}
                            ariaLabel={t("ui.ariaLabel.lastPage")}
                          >
                            {t("search.last")}
                          </PaginationButton>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </div>
            )}

            {activeTab === "search" && (
              <div ref={searchContentRef} className="animate-fade-in">
                <Suspense fallback={<SearchLoadingFallback />}>
                  <LazyAdvancedSearchDashboard
                    data={cards}
                    quranData={quranData}
                    hadithData={hadithData}
                    onFavorite={handleFavorite}
                    isFavorite={isFavorite}
                  />
                </Suspense>
              </div>
            )}

            {activeTab === "charts" && (
              <div ref={chartsContentRef} className="animate-fade-in">
                <Suspense fallback={<ChartLoadingFallback />}>
                  <LazyChartsDashboard data={cards} />
                </Suspense>
              </div>
            )}

            {activeTab === "quran" && (
              <div ref={quranContentRef} className="animate-fade-in">
                <Suspense
                  fallback={<LazyLoadingFallback message="Loading Quran..." />}
                >
                  <LazyQuranDashboard
                    onFavorite={handleFavorite}
                    isFavorite={isFavorite}
                  />
                </Suspense>
              </div>
            )}

            {activeTab === "hadith" && (
              <div ref={hadithContentRef} className="animate-fade-in">
                <Suspense
                  fallback={<LazyLoadingFallback message="Loading Hadith..." />}
                >
                  <LazyHadithDashboard
                    onFavorite={handleFavorite}
                    isFavorite={isFavorite}
                  />
                </Suspense>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
