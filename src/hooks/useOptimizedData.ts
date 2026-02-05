import { useEffect, useCallback } from "react";
import { useAppStore } from "../store/useAppStore";
import { useIslamicData } from "./useIslamicData";
import { useQuranData } from "./useQuranData";
import { useHadithData } from "./useHadithData";
import type { IslamicData, QuranAyah, HadithEntry } from "../types/Types";

// Optimized data loading hook that integrates with Zustand
export const useOptimizedData = () => {
  const {
    // Zustand store actions
    setCards,
    setQuranData,
    setHadithData,
    setCardsLoading,
    setQuranLoading,
    setHadithLoading,
    setCardsError,
    setQuranError,
    setHadithError,
    clearCache,
    setCachedData,
    getCachedData,
    lastFetchTime,
    cacheExpiryTime,
  } = useAppStore();

  // Use existing hooks
  const {
    islamicData,
    loading: cardsLoading,
    error: cardsError,
    refetch: refetchCards,
  } = useIslamicData();
  const {
    allData: quranData,
    loading: quranLoading,
    error: quranError,
    retry: retryQuran,
  } = useQuranData();
  const {
    hadithData,
    loading: hadithLoading,
    error: hadithError,
  } = useHadithData();

  // Check if cache is still valid
  const isCacheValid = useCallback(() => {
    const now = Date.now();
    return now - lastFetchTime < cacheExpiryTime;
  }, [lastFetchTime, cacheExpiryTime]);

  // Load data with caching
  const loadData = useCallback(async () => {
    // Check cache first
    const cachedCards = getCachedData("islamic-cards");
    const cachedQuran = getCachedData("quran-data");
    const cachedHadith = getCachedData("hadith-data");

    if (isCacheValid() && cachedCards && cachedQuran && cachedHadith) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("Using cached data");
      }
      setCards(cachedCards as IslamicData[]);
      setQuranData(cachedQuran as QuranAyah[]);
      setHadithData(cachedHadith as HadithEntry[]);
      return;
    }

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("Loading fresh data");
    }

    // Load Islamic data
    if (islamicData.length > 0) {
      setCards(islamicData);
      setCachedData("islamic-cards", islamicData);
    }

    // Load Quran data
    if (quranData.length > 0) {
      setQuranData(quranData);
      setCachedData("quran-data", quranData);
    }

    // Load Hadith data
    if (hadithData.length > 0) {
      setHadithData(hadithData);
      setCachedData("hadith-data", hadithData);
    }
  }, [
    islamicData,
    quranData,
    hadithData,
    setCards,
    setQuranData,
    setHadithData,
    setCachedData,
    getCachedData,
    isCacheValid,
  ]);

  // Sync loading states
  useEffect(() => {
    setCardsLoading(cardsLoading);
  }, [cardsLoading, setCardsLoading]);

  useEffect(() => {
    setQuranLoading(quranLoading);
  }, [quranLoading, setQuranLoading]);

  useEffect(() => {
    setHadithLoading(hadithLoading);
  }, [hadithLoading, setHadithLoading]);

  // Sync error states
  useEffect(() => {
    setCardsError(cardsError);
  }, [cardsError, setCardsError]);

  useEffect(() => {
    setQuranError(quranError?.message || null);
  }, [quranError, setQuranError]);

  useEffect(() => {
    setHadithError(hadithError);
  }, [hadithError, setHadithError]);

  // Load data when available
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Retry functions
  const retryAll = useCallback(() => {
    clearCache();
    refetchCards();
    retryQuran();
  }, [clearCache, refetchCards, retryQuran]);

  return {
    // Loading states
    cardsLoading,
    quranLoading,
    hadithLoading,
    isLoading: cardsLoading || quranLoading || hadithLoading,

    // Error states
    cardsError,
    quranError,
    hadithError,
    hasError: cardsError || quranError || hadithError,

    // Retry functions
    retryAll,
    refetchCards,
    retryQuran,

    // Cache management
    clearCache,
    isCacheValid,
  };
};
