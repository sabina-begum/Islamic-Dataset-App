import React, { useState, useEffect, useRef } from "react";
import type { IslamicData, IslamicDataFilters } from "../../../types/Types";

// Enhanced interface to support both basic and advanced search
interface SmartSearchBarProps {
  data: IslamicData[];
  onSearch?: (query: string) => void;
  filters?: IslamicDataFilters;
  onFiltersChange?: (filters: IslamicDataFilters) => void;
  types?: string[];
  placeholder?: string;
  mode?: "basic" | "advanced";
}

// SmartSearchBar provides both basic and advanced search functionality
export const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  data,
  onSearch,
  filters,
  onFiltersChange,
  types = [],
  placeholder = "Search signs and guidance...",
  mode = "advanced",
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    // Load search history from localStorage
    try {
      const saved = localStorage.getItem("islamic-search-history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const debouncedSearch = (searchQuery: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      onSearch?.(searchQuery);
    }, 300);
  };

  // Enhanced search suggestions with better ranking and categorization
  const generateSuggestions = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const suggestions = new Map<
      string,
      { score: number; type: string; source: string }
    >();

    // Search in titles (highest priority)
    data.forEach((card) => {
      if (card.title?.toLowerCase().includes(query)) {
        const score = card.title.toLowerCase().startsWith(query) ? 100 : 50;
        suggestions.set(card.title, {
          score,
          type: card.type || "unknown",
          source: "title",
        });
      }
    });

    // Search in types
    data.forEach((card) => {
      if (card.type?.toLowerCase().includes(query)) {
        suggestions.set(card.type, {
          score: 40,
          type: card.type,
          source: "type",
        });
      }
    });

    // Add search history items that match (with bonus score)
    searchHistory.forEach((historyItem) => {
      if (historyItem.toLowerCase().includes(query)) {
        suggestions.set(historyItem, {
          score: 60,
          type: "history",
          source: "history",
        });
      }
    });

    // Sort by score and convert to array
    const sortedSuggestions = Array.from(suggestions.entries())
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, 10)
      .map(([suggestion, meta]) => ({
        text: suggestion,
        type: meta.type,
        source: meta.source,
        score: meta.score,
      }));

    setSuggestions(sortedSuggestions.map((s) => s.text));
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setShowSuggestions(true);
    generateSuggestions(value);
    debouncedSearch(value);
  };

  // Handle basic filter changes
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (filters && onFiltersChange) {
      onFiltersChange({ ...filters, [e.target.name]: e.target.value });
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch?.(suggestion);

    // Add to search history
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item !== suggestion);
      const newHistory = [suggestion, ...filtered].slice(0, 10);
      // Save to localStorage
      localStorage.setItem(
        "islamic-search-history",
        JSON.stringify(newHistory)
      );
      return newHistory;
    });
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          setShowSuggestions(false);
          onSearch?.(query);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clear search
  const handleClearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSearch?.("");
  };

  return (
    <div className="relative">
      {/* Advanced Search Mode */}
      {mode === "advanced" && (
        <>
          {/* Search Input with Suggestions */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-stone-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              className="block w-full pl-10 pr-10 py-3 border border-stone-300 dark:border-stone-600 rounded-xl bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-500 dark:placeholder-stone-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              placeholder={placeholder}
              aria-label="Search Islamic Data"
            />
            {query && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                aria-label="Clear search"
              >
                <svg
                  className="h-5 w-5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Enhanced Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 w-full mt-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-xl shadow-lg max-h-60 overflow-y-auto"
            >
              <div className="py-2">
                {/* Recent Searches Section */}
                {suggestions.some((s) => searchHistory.includes(s)) && (
                  <div className="px-4 py-1">
                    <div className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                      Recent Searches
                    </div>
                  </div>
                )}

                {suggestions.map((suggestion, index) => {
                  const isHistory = searchHistory.includes(suggestion);
                  const isTitle = data.some(
                    (card) => card.title === suggestion
                  );
                  const isType = data.some((card) => card.type === suggestion);

                  return (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full px-4 py-3 text-left hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors ${
                        index === selectedIndex
                          ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "text-stone-700 dark:text-stone-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Icon based on suggestion type */}
                        {isHistory ? (
                          <svg
                            className="h-4 w-4 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        ) : isTitle ? (
                          <svg
                            className="h-4 w-4 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        ) : isType ? (
                          <svg
                            className="h-4 w-4 text-purple-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-4 w-4 text-stone-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="truncate font-medium">
                            {suggestion}
                          </div>
                          {isHistory && (
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              Recent search
                            </div>
                          )}
                          {isTitle && (
                            <div className="text-xs text-green-600 dark:text-green-400">
                              Title match
                            </div>
                          )}
                          {isType && (
                            <div className="text-xs text-purple-600 dark:text-purple-400">
                              Category
                            </div>
                          )}
                        </div>

                        {/* Keyboard shortcut hint */}
                        {index === 0 && (
                          <div className="text-xs text-stone-400 bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded">
                            Enter
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search History */}
          {showSuggestions && suggestions.length === 0 && query && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 w-full mt-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-xl shadow-lg"
            >
              <div className="p-4 text-center text-stone-500 dark:text-stone-400">
                No suggestions found for "{query}"
              </div>
            </div>
          )}

          {/* Quick Search Tips */}
          {!query && (
            <div className="mt-2 text-xs text-stone-500 dark:text-stone-400">
              <span className="font-medium">Quick tips:</span> Try searching by
              type, title, or keywords
            </div>
          )}
        </>
      )}

      {/* Basic Search Mode */}
      {mode === "basic" && filters && onFiltersChange && (
        <form
          className="flex flex-wrap gap-4 items-center bg-gradient-to-br from-white to-stone-50 dark:from-stone-800 dark:to-stone-900 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 p-6"
          aria-label="Search and filter Islamic Data"
        >
          {/* Search Input */}
          <div className="flex-1 min-w-[200px]">
            <label
              htmlFor="search-input"
              className="block text-sm font-semibold text-green-700 dark:text-green-400 mb-2"
            >
              Search available Islamic Data
            </label>
            <input
              id="search-input"
              name="searchTerm"
              value={filters.searchTerm}
              onChange={handleFilterChange}
              placeholder="Enter keywords to search available Islamic data..."
              className="w-full border-2 border-stone-200 dark:border-stone-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all duration-200 text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800 shadow-sm hover:shadow-md"
              data-cy="search-input"
              aria-label="Search available Islamic data"
            />
          </div>

          {/* Type Filter */}
          <div className="min-w-[180px]">
            <label
              htmlFor="type-select"
              className="block text-sm font-semibold text-green-700 dark:text-green-400 mb-2"
            >
              Type
            </label>
            <select
              id="type-select"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full border-2 border-stone-200 dark:border-stone-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all duration-200 text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800 shadow-sm hover:shadow-md"
              data-cy="type-select"
              aria-label="Filter by type"
            >
              <option value="">All Types</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div className="min-w-[160px]">
            <label
              htmlFor="sort-select"
              className="block text-sm font-semibold text-green-700 dark:text-green-400 mb-2"
            >
              Sort By
            </label>
            <select
              id="sort-select"
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="w-full border-2 border-stone-200 dark:border-stone-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all duration-200 text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800 shadow-sm hover:shadow-md"
              aria-label="Sort available Islamic data"
            >
              <option value="title">Title</option>
              <option value="type">Type</option>
            </select>
          </div>
        </form>
      )}
    </div>
  );
};
