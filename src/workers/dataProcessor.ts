// Web Worker for heavy data processing
const ctx: Worker = self as unknown as Worker;

// Search index for fast lookups
interface SearchIndex {
  [key: string]: {
    id: string;
    type: string;
    title: string;
    content: string;
    score: number;
  }[];
}

let searchIndex: SearchIndex = {};

// Message types - removed unused type definition

// Build search index for fast lookups
function buildSearchIndex(data: Record<string, unknown>[]): SearchIndex {
  const index: SearchIndex = {};

  data.forEach((item, idx) => {
    const searchableText = [
      (item.title as string) || "",
      (item.title as string) || "",
      (item.notes as string) || "",
      (item.type as string) || "",
      (item.status as string) || "",
    ]
      .join(" ")
      .toLowerCase();

    // Create trigrams for fuzzy search
    const words = searchableText.split(/\s+/);
    words.forEach((word) => {
      if (word.length > 2) {
        for (let i = 0; i <= word.length - 3; i++) {
          const trigram = word.slice(i, i + 3);
          if (!index[trigram]) {
            index[trigram] = [];
          }
          index[trigram].push({
            id: (item.id as string) || `item-${idx}`,
            type: (item.type as string) || "unknown",
            title: (item.title as string) || "",
            content: searchableText,
            score: 0,
          });
        }
      }
    });
  });

  return index;
}

// Perform search using the index
function performSearch(query: string): { id: string; score: number }[] {
  const queryLower = query.toLowerCase();
  const results: { [key: string]: number } = {};

  // Search through index
  Object.keys(searchIndex).forEach((trigram) => {
    if (trigram.includes(queryLower) || queryLower.includes(trigram)) {
      searchIndex[trigram].forEach((item) => {
        if (!results[item.id]) {
          results[item.id] = 0;
        }
        results[item.id] += 1;
      });
    }
  });

  // Convert to array and sort by relevance
  return Object.entries(results)
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 1000); // Limit results
}

// Filter data based on criteria
function filterData(
  data: Record<string, unknown>[],
  filters: Record<string, unknown>
): Record<string, unknown>[] {
  let filtered = [...data];

  if (filters.searchTerm) {
    const searchResults = performSearch(filters.searchTerm as string);
    const resultIds = new Set(searchResults.map((r) => r.id));
    filtered = filtered.filter((item) => resultIds.has(item.id as string));
  }

  if (filters.type) {
    filtered = filtered.filter(
      (item) => (item.type as string) === (filters.type as string)
    );
  }

  if (filters.status) {
    filtered = filtered.filter(
      (item) => (item.status as string) === (filters.status as string)
    );
  }

  return filtered;
}

// Sort data
function sortData(
  data: Record<string, unknown>[],
  sortBy: string,
  sortOrder: "asc" | "desc"
): Record<string, unknown>[] {
  const sorted = [...data];

  sorted.sort((a, b) => {
    let aValue = (a[sortBy] as string) || "";
    let bValue = (b[sortBy] as string) || "";

    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
}

// Handle messages from main thread
ctx.addEventListener(
  "message",
  (event: MessageEvent<Record<string, unknown>>) => {
    const message = event.data;

    if (message.type === "BUILD_INDEX") {
      searchIndex = buildSearchIndex(message.data as Record<string, unknown>[]);
      ctx.postMessage({
        type: "INDEX_BUILT",
        count: Object.keys(searchIndex).length,
      });
    } else if (message.type === "SEARCH") {
      const searchResults = performSearch(message.query as string);
      ctx.postMessage({ type: "SEARCH_RESULTS", results: searchResults });
    } else if (message.type === "FILTER") {
      const filteredData = filterData(
        message.data as Record<string, unknown>[],
        message.filters as Record<string, unknown>
      );
      ctx.postMessage({ type: "FILTERED_DATA", data: filteredData });
    } else if (message.type === "SORT") {
      const sortedData = sortData(
        message.data as Record<string, unknown>[],
        message.sortBy as string,
        message.sortOrder as "asc" | "desc"
      );
      ctx.postMessage({ type: "SORTED_DATA", data: sortedData });
    } else {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("Unknown message type:", message.type);
      }
    }
  }
);

export {};
