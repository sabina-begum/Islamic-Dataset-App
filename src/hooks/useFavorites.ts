import { useState, useEffect, useCallback } from "react";
import type { IslamicData, QuranAyah, HadithEntry } from "../types/Types";
import { db } from "../firebase/config";
import type { Firestore } from "firebase/firestore";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
} from "firebase/firestore";
import { useAuth } from "./useContext";

// Constants for storage management
const FAVORITES_PER_DOC = 1000; // Store 1000 favorites per document
const LOCAL_STORAGE_KEY = "localFavorites";
const LOCAL_STORAGE_MAX_SIZE = 4.5 * 1024 * 1024; // 4.5MB limit for safety

// Union type for all favoriteable items
export type FavoriteItem = IslamicData | QuranAyah | HadithEntry;

// Helper function to get unique identifier for any favorite item
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

// Helper function to check if two items are the same
const isSameItem = (item1: FavoriteItem, item2: FavoriteItem): boolean => {
  const id1 = getItemId(item1);
  const id2 = getItemId(item2);
  return id1 === id2;
};

// Helper function to compress data for localStorage
const compressData = (data: FavoriteItem[]): string => {
  try {
    // Remove unnecessary fields to reduce size
    const compressed = data.map((item: FavoriteItem) => {
      if ("title" in item && "type" in item) {
        // IslamicData
        return {
          id: getItemId(item),
          type: "islamic",
          title: item.title,
          itemType: item.type,
          // Only keep essential fields
          description: item.title?.substring(0, 200), // Use title instead of description
          fulfillmentStatus: item.fulfillmentStatus,
          yearRevealed: item.yearRevealed,
          yearFulfilled: item.yearFulfilled,
        };
      } else if ("surah_no" in item && "ayah_no_surah" in item) {
        // QuranAyah
        return {
          id: getItemId(item),
          type: "quran",
          surah_no: item.surah_no,
          ayah_no_surah: item.ayah_no_surah,
          surah_name_en: item.surah_name_en,
          ayah_en: item.ayah_en?.substring(0, 200),
        };
      } else if ("number" in item) {
        // HadithEntry
        return {
          id: getItemId(item),
          type: "hadith",
          number: item.number,
          book: item.book,
          text: item.text?.substring(0, 200),
        };
      }
      return { id: getItemId(item), type: "unknown" };
    });
    return JSON.stringify(compressed);
  } catch {
    return JSON.stringify(data);
  }
};

// Helper function to check localStorage size
const checkLocalStorageSize = (key: string): boolean => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return true;

    const size = new Blob([data]).size;
    return size < LOCAL_STORAGE_MAX_SIZE;
  } catch {
    return false;
  }
};

// Helper function to clean up localStorage if needed
const cleanupLocalStorage = (key: string, maxItems: number = 500) => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return;

    const favorites = JSON.parse(data);
    if (favorites.length > maxItems) {
      // Keep only the most recent items
      const cleaned = favorites.slice(-maxItems);
      localStorage.setItem(key, JSON.stringify(cleaned));
      return cleaned;
    }
    return favorites;
  } catch {
    return [];
  }
};

// useFavorites manages the user's favorite items with extended storage capacity
export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all favorites from multiple documents
  const loadAllFavorites = useCallback(async () => {
    if (!user) return;

    try {
      const favoritesRef = collection(db as unknown as Firestore, "favorites");
      const userFavoritesRef = doc(favoritesRef, user.uid);

      // Get the main favorites document
      const mainDoc = await getDoc(userFavoritesRef);

      if (mainDoc.exists()) {
        const data = mainDoc.data();
        let allFavorites = data.miracles || [];

        // Check if there are additional pages
        if (data.totalPages > 1) {
          // Load additional pages
          for (let page = 2; page <= data.totalPages; page++) {
            const pageDoc = await getDoc(
              doc(favoritesRef, `${user.uid}_page_${page}`)
            );
            if (pageDoc.exists()) {
              const pageData = pageDoc.data();
              allFavorites = [...allFavorites, ...(pageData.islamicData || [])];
            }
          }
        }

        setFavorites(allFavorites);
      } else {
        setFavorites([]);
      }
      setLoading(false);
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("Failed to load favorites:", error);
      }
      setFavorites([]);
      setLoading(false);
      setError("Failed to load favorites from Firestore");
    }
  }, [user]);

  // Load favorites from Firestore with pagination support
  useEffect(() => {
    if (!user) {
      // Fallback to localStorage when user is not authenticated
      try {
        const localFavorites = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localFavorites) {
          // Clean up if needed
          const cleaned = cleanupLocalStorage(LOCAL_STORAGE_KEY, 500);
          setFavorites(cleaned);
        } else {
          setFavorites([]);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error("Failed to load local favorites:", error);
        }
        setFavorites([]);
      }
      return;
    }

    setLoading(true);
    loadAllFavorites();
  }, [user, loadAllFavorites]);

  // Add a favorite item with automatic pagination

  // Add a favorite item with automatic pagination
  const addFavorite = async (item: FavoriteItem) => {
    if (!user) {
      // Use localStorage when not authenticated
      try {
        const localFavorites = JSON.parse(
          localStorage.getItem(LOCAL_STORAGE_KEY) || "[]"
        );

        // Check if item already exists
        const exists = localFavorites.some((m: FavoriteItem) =>
          isSameItem(m, item)
        );

        if (!exists) {
          const updatedFavorites = [...localFavorites, item];

          // Check storage size before saving
          const compressedData = compressData(updatedFavorites);

          if (checkLocalStorageSize(LOCAL_STORAGE_KEY)) {
            localStorage.setItem(LOCAL_STORAGE_KEY, compressedData);
            setFavorites(updatedFavorites);
          } else {
            // Storage is full, clean up old items
            const cleaned = cleanupLocalStorage(LOCAL_STORAGE_KEY, 400);
            const newFavorites = [...cleaned, item];
            const newCompressedData = compressData(newFavorites);
            localStorage.setItem(LOCAL_STORAGE_KEY, newCompressedData);
            setFavorites(newFavorites);
            setError("Storage limit reached. Oldest favorites were removed.");
          }
        } else {
          // Item already exists, do nothing
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error("Failed to add favorite to local storage:", error);
        }
        setError("Failed to add favorite to local storage");
      }
      return;
    }

    try {
      const favoritesRef = collection(db as unknown as Firestore, "favorites");
      const userFavoritesRef = doc(favoritesRef, user.uid);

      // Get current favorites to determine storage strategy
      const currentDoc = await getDoc(userFavoritesRef);

      if (!currentDoc.exists()) {
        // First favorite - create main document
        await setDoc(userFavoritesRef, {
          miracles: [item],
          totalPages: 1,
          totalCount: 1,
          lastUpdated: new Date(),
        });
        setFavorites([item]);
      } else {
        const data = currentDoc.data();
        const currentFavorites = data.islamicData || [];

        // Check if item already exists
        const exists = currentFavorites.some((m: FavoriteItem) =>
          isSameItem(m, item)
        );

        if (!exists) {
          // Add to current page if there's space
          if (currentFavorites.length < FAVORITES_PER_DOC) {
            await updateDoc(userFavoritesRef, {
              islamicData: arrayUnion(item),
              totalCount: data.totalCount + 1,
              lastUpdated: new Date(),
            });
            setFavorites([...currentFavorites, item]);
          } else {
            // Create new page
            const newPageNum =
              Math.floor(currentFavorites.length / FAVORITES_PER_DOC) + 1;
            const newPageRef = doc(
              favoritesRef,
              `${user.uid}_page_${newPageNum}`
            );

            await setDoc(newPageRef, {
              miracles: [item],
              pageNumber: newPageNum,
              lastUpdated: new Date(),
            });

            // Update main document
            await updateDoc(userFavoritesRef, {
              totalPages: newPageNum,
              totalCount: data.totalCount + 1,
              lastUpdated: new Date(),
            });

            setFavorites([...currentFavorites, item]);
          }
        } else {
          // Item already exists, do nothing
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("Failed to add favorite:", error);
      }
      setError("Failed to add favorite");
    }
  };

  // Remove a favorite item
  const removeFavorite = async (item: FavoriteItem) => {
    if (!user) {
      // Use localStorage when not authenticated
      try {
        const localFavorites = JSON.parse(
          localStorage.getItem(LOCAL_STORAGE_KEY) || "[]"
        );
        const updatedFavorites = localFavorites.filter(
          (m: FavoriteItem) => !isSameItem(m, item)
        );

        const compressedData = compressData(updatedFavorites);
        localStorage.setItem(LOCAL_STORAGE_KEY, compressedData);
        setFavorites(updatedFavorites);
      } catch (error) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error("Failed to remove favorite from local storage:", error);
        }
        setError("Failed to remove favorite from local storage");
      }
      return;
    }

    try {
      const favoritesRef = collection(db as unknown as Firestore, "favorites");
      const userFavoritesRef = doc(favoritesRef, user.uid);

      // Get current favorites to find which page contains the item
      const currentDoc = await getDoc(userFavoritesRef);

      if (currentDoc.exists()) {
        const data = currentDoc.data();
        const currentFavorites = data.islamicData || [];

        // Check if item is in main document
        const itemIndex = currentFavorites.findIndex((m: FavoriteItem) =>
          isSameItem(m, item)
        );

        if (itemIndex !== -1) {
          // Remove from main document
          await updateDoc(userFavoritesRef, {
            islamicData: arrayRemove(item),
            totalCount: data.totalCount - 1,
            lastUpdated: new Date(),
          });

          // If we have additional pages, move an item from the next page
          if (data.totalPages > 1) {
            const nextPageRef = doc(favoritesRef, `${user.uid}_page_2`);
            const nextPageDoc = await getDoc(nextPageRef);

            if (nextPageDoc.exists()) {
              const nextPageData = nextPageDoc.data();
              const nextPageFavorites = nextPageData.islamicData || [];

              if (nextPageFavorites.length > 0) {
                // Move first item from next page to main document
                const itemToMove = nextPageFavorites[0];
                await updateDoc(userFavoritesRef, {
                  miracles: arrayUnion(itemToMove),
                });

                // Remove item from next page
                await updateDoc(nextPageRef, {
                  islamicData: arrayRemove(itemToMove),
                });

                // If next page is empty, delete it and update total pages
                if (nextPageFavorites.length === 1) {
                  await updateDoc(userFavoritesRef, {
                    totalPages: data.totalPages - 1,
                  });
                }
              }
            }
          }

          setFavorites((prev) => {
            const filtered = prev.filter((m) => !isSameItem(m, item));
            return filtered;
          });
        } else {
          // Item might be in additional pages - search through them
          for (let page = 2; page <= data.totalPages; page++) {
            const pageRef = doc(favoritesRef, `${user.uid}_page_${page}`);
            const pageDoc = await getDoc(pageRef);

            if (pageDoc.exists()) {
              const pageData = pageDoc.data();
              const pageFavorites = pageData.islamicData || [];

              const pageItemIndex = pageFavorites.findIndex((m: FavoriteItem) =>
                isSameItem(m, item)
              );

              if (pageItemIndex !== -1) {
                // Remove from this page
                await updateDoc(pageRef, {
                  islamicData: arrayRemove(item),
                });

                // Update main document count
                await updateDoc(userFavoritesRef, {
                  totalCount: data.totalCount - 1,
                  lastUpdated: new Date(),
                });

                setFavorites((prev) => {
                  const filtered = prev.filter((m) => !isSameItem(m, item));
                  return filtered;
                });
                break;
              }
            }
          }
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("Failed to remove favorite:", error);
      }
      setError("Failed to remove favorite");
    }
  };

  return { favorites, addFavorite, removeFavorite, loading, error };
}
// Utility functions for storage management
export const getStorageStats = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) return { count: 0, size: 0, percentage: 0 };

    const favorites = JSON.parse(data);
    const size = new Blob([data]).size;
    const percentage = (size / LOCAL_STORAGE_MAX_SIZE) * 100;

    return {
      count: favorites.length,
      size: size,
      sizeMB: (size / (1024 * 1024)).toFixed(2),
      percentage: Math.round(percentage),
      maxSizeMB: (LOCAL_STORAGE_MAX_SIZE / (1024 * 1024)).toFixed(2),
    };
  } catch {
    return { count: 0, size: 0, percentage: 0 };
  }
};

export const clearAllFavorites = () => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
};

export const exportFavorites = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) return null;

    const favorites = JSON.parse(data);
    const exportData = {
      exportDate: new Date().toISOString(),
      count: favorites.length,
      favorites: favorites,
    };

    return JSON.stringify(exportData, null, 2);
  } catch {
    return null;
  }
};
