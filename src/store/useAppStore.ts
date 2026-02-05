import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  IslamicData,
  QuranAyah,
  HadithEntry,
  IslamicDataFilters,
  QuranFilters,
  HadithFilters,
} from "../types/Types";

interface AppState {
  // Data state with lazy loading support
  cards: IslamicData[];
  quranData: QuranAyah[];
  hadithData: HadithEntry[];
  favorites: IslamicData[];

  // Loading states
  cardsLoading: boolean;
  quranLoading: boolean;
  hadithLoading: boolean;

  // Error states
  cardsError: string | null;
  quranError: string | null;
  hadithError: string | null;

  // Filter states
  cardsFilters: IslamicDataFilters;
  quranFilters: QuranFilters;
  hadithFilters: HadithFilters;

  // Pagination states with virtual scrolling support
  currentPage: number;
  itemsPerPage: number;
  virtualScrollEnabled: boolean;
  virtualScrollItemHeight: number;

  // UI state
  activeTab: string;
  toast: string | null;

  // Caching and performance
  dataCache: Map<string, unknown>;
  lastFetchTime: number;
  cacheExpiryTime: number;

  // Actions
  setCards: (cards: IslamicData[]) => void;
  setQuranData: (data: QuranAyah[]) => void;
  setHadithData: (data: HadithEntry[]) => void;

  setCardsLoading: (loading: boolean) => void;
  setQuranLoading: (loading: boolean) => void;
  setHadithLoading: (loading: boolean) => void;

  setCardsError: (error: string | null) => void;
  setQuranError: (error: string | null) => void;
  setHadithError: (error: string | null) => void;

  setCardsFilters: (filters: Partial<IslamicDataFilters>) => void;
  setQuranFilters: (filters: Partial<QuranFilters>) => void;
  setHadithFilters: (filters: Partial<HadithFilters>) => void;

  setCurrentPage: (page: number) => void;
  setActiveTab: (tab: string) => void;
  setToast: (message: string | null) => void;

  // Favorites actions
  addFavorite: (miracle: IslamicData) => void;
  removeFavorite: (miracle: IslamicData) => void;
  isFavorite: (miracle: IslamicData) => boolean;

  // Performance optimizations
  setVirtualScrollEnabled: (enabled: boolean) => void;
  setVirtualScrollItemHeight: (height: number) => void;
  clearCache: () => void;
  getCachedData: (key: string) => unknown;
  setCachedData: (key: string, data: unknown) => void;

  // Computed values with memoization
  filteredCards: IslamicData[];
  filteredQuranData: QuranAyah[];
  filteredHadithData: HadithEntry[];
  totalPages: number;
  paginatedCards: IslamicData[];

  // Virtual scrolling helpers
  getVisibleItems: (startIndex: number, endIndex: number) => IslamicData[];
  getTotalItemCount: () => number;
}

const initialCardsFilters: IslamicDataFilters = {
  searchTerm: "",
  type: "",
  sortBy: "title",
};

const initialQuranFilters: QuranFilters = {
  surah: undefined,
  searchTerm: "",
  placeOfRevelation: undefined,
  sortBy: "surah_no",
};

const initialHadithFilters: HadithFilters = {
  searchTerm: "",
  sortBy: "index",
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        cards: [],
        quranData: [],
        hadithData: [],
        favorites: [],

        cardsLoading: false,
        quranLoading: false,
        hadithLoading: false,

        cardsError: null,
        quranError: null,
        hadithError: null,

        cardsFilters: initialCardsFilters,
        quranFilters: initialQuranFilters,
        hadithFilters: initialHadithFilters,

        currentPage: 1,
        itemsPerPage: 8,
        virtualScrollEnabled: false,
        virtualScrollItemHeight: 50, // Default height for virtual scrolling

        activeTab: "all",
        toast: null,

        // Caching and performance
        dataCache: new Map(),
        lastFetchTime: 0,
        cacheExpiryTime: 3600000, // 1 hour

        // Actions
        setCards: (cards) => set({ cards }),
        setQuranData: (data) => set({ quranData: data }),
        setHadithData: (data) => set({ hadithData: data }),

        setCardsLoading: (loading) => set({ cardsLoading: loading }),
        setQuranLoading: (loading) => set({ quranLoading: loading }),
        setHadithLoading: (loading) => set({ hadithLoading: loading }),

        setCardsError: (error) => set({ cardsError: error }),
        setQuranError: (error) => set({ quranError: error }),
        setHadithError: (error) => set({ hadithError: error }),

        setCardsFilters: (filters) =>
          set((state) => ({
            cardsFilters: { ...state.cardsFilters, ...filters },
            currentPage: 1, // Reset to first page when filters change
          })),

        setQuranFilters: (filters) =>
          set((state) => ({
            quranFilters: { ...state.quranFilters, ...filters },
            currentPage: 1,
          })),

        setHadithFilters: (filters) =>
          set((state) => ({
            hadithFilters: { ...state.hadithFilters, ...filters },
            currentPage: 1,
          })),

        setCurrentPage: (page) => set({ currentPage: page }),
        setActiveTab: (tab) => set({ activeTab: tab }),
        setToast: (message) => set({ toast: message }),

        // Favorites actions
        addFavorite: (miracle) =>
          set((state) => ({
            favorites: state.favorites.some(
              (fav) => fav.title === miracle.title && fav.type === miracle.type
            )
              ? state.favorites
              : [...state.favorites, miracle],
          })),

        removeFavorite: (cards) =>
          set((state) => ({
            favorites: state.favorites.filter(
              (fav) => !(fav.title === cards.title && fav.type === cards.type)
            ),
          })),

        isFavorite: (cards) => {
          const state = get();
          return state.favorites.some(
            (fav) => fav.title === cards.title && fav.type === cards.type
          );
        },

        // Performance optimizations
        setVirtualScrollEnabled: (enabled) =>
          set({ virtualScrollEnabled: enabled }),
        setVirtualScrollItemHeight: (height) =>
          set({ virtualScrollItemHeight: height }),
        clearCache: () => set({ dataCache: new Map() }),
        getCachedData: (key) => get().dataCache.get(key),
        setCachedData: (key, data) =>
          set({ dataCache: get().dataCache.set(key, data) }),

        // Computed values
        get filteredCards() {
          const state = get();
          let filtered = [...state.cards];

          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log("Zustand - Total cards:", state.cards.length);
            // eslint-disable-next-line no-console
            console.log("Zustand - Cards filters:", state.cardsFilters);
          }

          // Apply search filter
          if (state.cardsFilters.searchTerm) {
            const searchLower = state.cardsFilters.searchTerm.toLowerCase();
            filtered = filtered.filter(
              (cards) =>
                cards.title.toLowerCase().includes(searchLower) ||
                cards.notes.toLowerCase().includes(searchLower)
            );
          }

          // Apply type filter
          if (state.cardsFilters.type) {
            filtered = filtered.filter(
              (cards) => cards.type === state.cardsFilters.type
            );
          }

          // Apply sorting
          if (state.cardsFilters.sortBy === "type") {
            filtered.sort((a, b) => a.type.localeCompare(b.type));
          } else {
            filtered.sort((a, b) => a.title.localeCompare(b.title));
          }

          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log("Zustand - Filtered cards:", filtered.length);
          }
          return filtered;
        },

        get filteredQuranData() {
          const state = get();
          let filtered = [...state.quranData];

          // Apply search filter
          if (state.quranFilters.searchTerm) {
            const searchLower = state.quranFilters.searchTerm.toLowerCase();
            filtered = filtered.filter(
              (ayah) =>
                ayah.surah_name_en.toLowerCase().includes(searchLower) ||
                ayah.ayah_en.toLowerCase().includes(searchLower) ||
                ayah.ayah_ar.includes(searchLower)
            );
          }

          // Apply surah filter
          if (state.quranFilters.surah) {
            filtered = filtered.filter(
              (ayah) => ayah.surah_no === state.quranFilters.surah
            );
          }

          // Apply place filter
          if (state.quranFilters.placeOfRevelation) {
            filtered = filtered.filter(
              (ayah) =>
                ayah.place_of_revelation ===
                state.quranFilters.placeOfRevelation
            );
          }

          // Apply sorting
          switch (state.quranFilters.sortBy) {
            case "surah_name_en":
              filtered.sort((a, b) =>
                a.surah_name_en.localeCompare(b.surah_name_en)
              );
              break;
            case "place_of_revelation":
              filtered.sort((a, b) =>
                a.place_of_revelation.localeCompare(b.place_of_revelation)
              );
              break;
            default:
              filtered.sort((a, b) => a.surah_no - b.surah_no);
          }

          return filtered;
        },

        get filteredHadithData() {
          const state = get();
          let filtered = [...state.hadithData];

          // Apply search filter
          if (state.hadithFilters.searchTerm) {
            const searchLower = state.hadithFilters.searchTerm.toLowerCase();
            filtered = filtered.filter((hadith) => {
              return Object.values(hadith).some((value) =>
                value.toLowerCase().includes(searchLower)
              );
            });
          }

          // Apply sorting
          if (state.hadithFilters.sortBy === "length") {
            filtered.sort((a, b) => {
              const aLength = Object.values(a).join("").length;
              const bLength = Object.values(b).join("").length;
              return bLength - aLength;
            });
          }

          return filtered;
        },

        get totalPages() {
          const state = get();
          return Math.ceil(state.filteredCards.length / state.itemsPerPage);
        },

        get paginatedCards() {
          const state = get();
          const startIndex = (state.currentPage - 1) * state.itemsPerPage;
          return state.filteredCards.slice(
            startIndex,
            startIndex + state.itemsPerPage
          );
        },

        // Virtual scrolling helpers
        getVisibleItems: (startIndex, endIndex) => {
          const state = get();
          return state.filteredCards.slice(startIndex, endIndex);
        },
        getTotalItemCount: () => {
          const state = get();
          return state.filteredCards.length;
        },
      }),
      {
        name: "quranic-app-storage",
        partialize: (state) => ({
          favorites: state.favorites,
          cardsFilters: state.cardsFilters,
          quranFilters: state.quranFilters,
          hadithFilters: state.hadithFilters,
          activeTab: state.activeTab,
        }),
      }
    ),
    {
      name: "quranic-app-store",
    }
  )
);
