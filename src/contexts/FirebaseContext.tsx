import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLanguage } from "../hooks/useContext";
import { authService } from "../firebase/auth";
import { firestoreService } from "../firebase/firestore";
import { searchService } from "../firebase/search";
import { dataMigrationService } from "../firebase/migration";
import { isFirebaseConfigured } from "../firebase/config";
import type {
  User,
  IslamicData,
  QuranAyah,
  HadithEntry,
  UnifiedSearchResult,
  FilterState,
} from "../types/Types";
import {
  FirebaseContext,
  type FirebaseContextType,
} from "./FirebaseContextDef";

// Firebase provider component
export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { t } = useLanguage();
  const [isFirebaseAvailable, setIsFirebaseAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // Data state
  const [islamicData, setIslamicData] = useState<IslamicData[]>([]);
  const [quranData, setQuranData] = useState<QuranAyah[]>([]);
  const [hadithData, setHadithData] = useState<HadithEntry[]>([]);

  // Search state
  const [searchResults, setSearchResults] = useState<UnifiedSearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Favorites state
  const [favorites, setFavorites] = useState<
    Array<{ itemId: string; itemType: string }>
  >([]);

  // Migration state
  const [migrationStatus, setMigrationStatus] = useState({
    islamicDataCount: 0,
    quranDataCount: 0,
    hadithDataCount: 0,
    needsMigration: false,
  });

  // Real-time listeners cleanup
  const listenersRef = useRef<Array<() => void>>([]);

  // Initialize Firebase
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const available = isFirebaseConfigured();
        setIsFirebaseAvailable(available);

        if (available) {
          // Initialize auth listener
          const unsubscribeAuth = authService.initializeAuthListener(
            (firebaseUser) => {
              if (firebaseUser) {
                // Get user profile from Firestore
                authService.getUserProfile().then((userProfile) => {
                  setCurrentUser(userProfile);
                  setIsEmailVerified(firebaseUser.emailVerified);
                });
              } else {
                setCurrentUser(null);
                setIsEmailVerified(false);
              }
            }
          );

          // Check migration status
          try {
            const status = await dataMigrationService.checkMigrationStatus();
            setMigrationStatus(status);
          } catch (err) {
            if (import.meta.env.DEV) {
              // eslint-disable-next-line no-console
              console.warn(
                "Migration check failed, continuing with local data:",
                err
              );
            }
            // Set default migration status
            setMigrationStatus({
              islamicDataCount: 0,
              quranDataCount: 0,
              hadithDataCount: 0,
              needsMigration: false,
            });
          }

          listenersRef.current = [unsubscribeAuth];
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to initialize Firebase"
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeFirebase();
  }, []);

  // Load Islamic data
  const loadIslamicData = useCallback(
    async (filters?: Partial<FilterState>) => {
      if (!isFirebaseAvailable) {
        // Load local data when Firebase is not available
        try {
          const localData = await import("../data/islamic_data.json");
          setIslamicData((localData.default as unknown as IslamicData[]) || []);
        } catch (err) {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.warn("Failed to load local Islamic data:", err);
          }
        }
        return;
      }

      try {
        const result = await firestoreService.getIslamicData(filters || {}, {
          itemsPerPage: 1000,
        });
        setIslamicData([...(result.data || [])]);
      } catch (err) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn("Failed to load Islamic data (using local data):", err);
        }
        // Don't throw error, just log it
      }
    },
    [isFirebaseAvailable]
  );

  // Load Quran data
  const loadQuranData = useCallback(
    async (filters?: Partial<FilterState>) => {
      if (!isFirebaseAvailable) {
        // Load local data when Firebase is not available
        try {
          const localData = await import("../data/The Quran Dataset.json");
          setQuranData((localData.default as unknown as QuranAyah[]) || []);
        } catch (err) {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.warn("Failed to load local Quran data:", err);
          }
        }
        return;
      }

      try {
        const data = await firestoreService.getQuranData(filters);
        setQuranData(data);
      } catch (err) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn("Failed to load Quran data (using local data):", err);
        }
        // Don't throw error, just log it
      }
    },
    [isFirebaseAvailable]
  );

  // Load Hadith data
  const loadHadithData = useCallback(
    async (filters?: Partial<FilterState>) => {
      if (!isFirebaseAvailable) {
        // Load local data when Firebase is not available
        try {
          const localData = await import("../data/Sahih Bukhari.json");
          setHadithData((localData.default as unknown as HadithEntry[]) || []);
        } catch (err) {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.warn("Failed to load local Hadith data:", err);
          }
        }
        return;
      }

      try {
        const data = await firestoreService.getHadithData(filters);
        setHadithData(data);
      } catch (err) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn("Failed to load Hadith data (using local data):", err);
        }
        // Don't throw error, just log it
      }
    },
    [isFirebaseAvailable]
  );

  // Load initial data when Firebase becomes available or when not available (load local data)
  useEffect(() => {
    if (isFirebaseAvailable && !migrationStatus.needsMigration) {
      loadIslamicData();
      loadQuranData();
      loadHadithData();
    } else if (!isFirebaseAvailable) {
      // Load local data when Firebase is not available
      loadIslamicData();
      loadQuranData();
      loadHadithData();
    }
  }, [
    isFirebaseAvailable,
    migrationStatus.needsMigration,
    loadIslamicData,
    loadQuranData,
    loadHadithData,
  ]);

  // Authentication methods
  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!isFirebaseAvailable) {
        throw new Error(t("error.firebase.notAvailable"));
      }

      try {
        setError(null);
        await authService.signIn(email, password);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : t("error.firebase.signInFailed");
        setError(message);
        throw err;
      }
    },
    [isFirebaseAvailable, t]
  );

  const signUp = useCallback(
    async (email: string, password: string, displayName?: string) => {
      if (!isFirebaseAvailable) {
        throw new Error(t("error.firebase.notAvailable"));
      }

      try {
        setError(null);
        await authService.signUp(email, password, displayName);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : t("error.firebase.signUpFailed");
        setError(message);
        throw err;
      }
    },
    [isFirebaseAvailable, t]
  );

  const signOut = useCallback(async () => {
    if (!isFirebaseAvailable) return;

    try {
      setError(null);
      await authService.signOut();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("error.firebase.signOutFailed");
      setError(message);
      throw err;
    }
  }, [isFirebaseAvailable, t]);

  const resetPassword = useCallback(
    async (email: string) => {
      if (!isFirebaseAvailable) {
        throw new Error(t("error.firebase.notAvailable"));
      }

      try {
        setError(null);
        await authService.resetPassword(email);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : t("error.firebase.resetFailed");
        setError(message);
        throw err;
      }
    },
    [isFirebaseAvailable, t]
  );

  const updateUserProfile = useCallback(
    async (updates: { displayName?: string; photoURL?: string }) => {
      if (!isFirebaseAvailable) {
        throw new Error(t("error.firebase.notAvailable"));
      }

      try {
        setError(null);
        await authService.updateUserProfile(updates);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : t("error.firebase.profileUpdateFailed");
        setError(message);
        throw err;
      }
    },
    [isFirebaseAvailable, t]
  );

  const updateUserPreferences = useCallback(
    async (preferences: User["preferences"]) => {
      if (!isFirebaseAvailable) {
        throw new Error("Firebase not available");
      }

      try {
        setError(null);
        await authService.updateUserPreferences(preferences);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Preferences update failed";
        setError(message);
        throw err;
      }
    },
    [isFirebaseAvailable]
  );

  // Search methods
  const performSearch = useCallback(
    async (query: string, filters: FilterState) => {
      if (!isFirebaseAvailable) return;

      try {
        setError(null);
        setSearchQuery(query);
        const userId = currentUser?.uid;
        const result = await searchService.performUnifiedSearch(
          query,
          filters,
          userId
        );
        setSearchResults(result.results);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : t("error.firebase.searchFailed");
        setError(message);
      }
    },
    [isFirebaseAvailable, currentUser, t]
  );

  const getSearchSuggestions = useCallback(
    async (query: string): Promise<string[]> => {
      if (!isFirebaseAvailable) return [];
      return await searchService.getSearchSuggestions(query);
    },
    [isFirebaseAvailable]
  );

  const getPopularSearches = useCallback(async (): Promise<
    Array<{ query: string; count: number }>
  > => {
    if (!isFirebaseAvailable) return [];
    const userId = currentUser?.uid;
    return await searchService.getPopularSearches(userId);
  }, [isFirebaseAvailable, currentUser]);

  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
    setSearchQuery("");
  }, []);

  // Favorites methods
  const addToFavorites = useCallback(
    async (itemId: string, itemType: string) => {
      if (!isFirebaseAvailable || !currentUser) {
        throw new Error(t("error.firebase.notAvailableOrUserNotSignedIn"));
      }

      try {
        setError(null);
        await firestoreService.addToFavorites(
          currentUser.uid,
          itemId,
          itemType
        );
        setFavorites((prev) => [...prev, { itemId, itemType }]);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : t("error.firebase.favoritesAddFailed");
        setError(message);
        throw err;
      }
    },
    [isFirebaseAvailable, currentUser, t]
  );

  const removeFromFavorites = useCallback(
    async (itemId: string) => {
      if (!isFirebaseAvailable || !currentUser) {
        throw new Error(t("error.firebase.notAvailableOrUserNotSignedIn"));
      }

      try {
        setError(null);
        await firestoreService.removeFromFavorites(currentUser.uid, itemId);
        setFavorites((prev) => prev.filter((fav) => fav.itemId !== itemId));
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : t("error.firebase.favoritesRemoveFailed");
        setError(message);
        throw err;
      }
    },
    [isFirebaseAvailable, currentUser, t]
  );

  const isFavorited = useCallback(
    (itemId: string): boolean => {
      return favorites.some((fav) => fav.itemId === itemId);
    },
    [favorites]
  );

  // Migration methods
  const performMigration = useCallback(
    async (
      islamicData: IslamicData[],
      quranData: QuranAyah[],
      hadithData: HadithEntry[],
      onProgress?: (progress: {
        step: string;
        current: number;
        total: number;
        percentage: number;
      }) => void
    ) => {
      if (!isFirebaseAvailable) {
        throw new Error(t("error.firebase.notAvailable"));
      }

      try {
        setError(null);
        const result = await dataMigrationService.performFullMigration(
          islamicData,
          quranData,
          hadithData,
          onProgress
        );

        // Reload data after migration
        if (result.success) {
          await loadIslamicData();
          await loadQuranData();
          await loadHadithData();
        }

        return result;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : t("error.firebase.migrationFailed");
        setError(message);
        throw err;
      }
    },
    [isFirebaseAvailable, loadIslamicData, loadQuranData, loadHadithData, t]
  );

  // Real-time listeners
  const startRealtimeListeners = useCallback(() => {
    if (!isFirebaseAvailable || !currentUser) return;

    const newListeners: Array<() => void> = [];

    // Listen to favorites changes
    const favoritesListener = firestoreService.onFavoritesChange(
      currentUser.uid,
      (favorites) => {
        setFavorites(favorites);
      }
    );

    // Listen to Islamic data changes
    const islamicDataListener = firestoreService.onIslamicDataChange((data) => {
      setIslamicData(data);
    });

    newListeners.push(favoritesListener, islamicDataListener);
    listenersRef.current = [...listenersRef.current, ...newListeners];
  }, [isFirebaseAvailable, currentUser]);

  const stopRealtimeListeners = useCallback(() => {
    listenersRef.current.forEach((unsubscribe) => unsubscribe());
    listenersRef.current = [];
  }, []);

  // Start listeners when user changes
  useEffect(() => {
    if (currentUser) {
      startRealtimeListeners();
    } else {
      stopRealtimeListeners();
    }

    return () => {
      stopRealtimeListeners();
    };
  }, [currentUser, startRealtimeListeners, stopRealtimeListeners]);

  const contextValue: FirebaseContextType = {
    isFirebaseAvailable,
    isLoading,
    error,
    currentUser,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    updateUserPreferences,
    isEmailVerified,
    islamicData,
    quranData,
    hadithData,
    loadIslamicData,
    loadQuranData,
    loadHadithData,
    searchResults,
    searchQuery,
    performSearch,
    getSearchSuggestions,
    getPopularSearches,
    clearSearchResults,
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorited,
    migrationStatus,
    performMigration,
    startRealtimeListeners,
    stopRealtimeListeners,
  };

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};
