import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  type DocumentData,
  type Query,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./config";
import type {
  IslamicData,
  QuranAyah,
  HadithEntry,
  User,
  FilterState,
  PaginationState,
  PaginatedResponse,
} from "../types/Types";

// Collection names
export const COLLECTIONS = {
  USERS: "users",
  ISLAMIC_DATA: "islamic_data",
  QURAN: "quran",
  HADITH: "hadith",
  FAVORITES: "favorites",
  SEARCH_HISTORY: "search_history",
  ANALYTICS: "analytics",
  USER_PREFERENCES: "user_preferences",
} as const;

// Firestore service class
export class FirestoreService {
  private static instance: FirestoreService;

  private constructor() {}

  public static getInstance(): FirestoreService {
    if (!FirestoreService.instance) {
      FirestoreService.instance = new FirestoreService();
    }
    return FirestoreService.instance;
  }

  // Check if Firestore is available
  private isAvailable(): boolean {
    return isFirebaseConfigured() && db !== null;
  }

  // Generic error handler
  private handleError(error: unknown, context: string): never {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(`Firestore error in ${context}:`, error);
    }
    throw new Error(`Database operation failed: ${context}`);
  }

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  // Create or update user profile
  async createUserProfile(
    userId: string,
    userData: Partial<User>
  ): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error("Firestore not available");
    }

    try {
      if (!db) {
        throw new Error("Database not available");
      }

      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userDoc = {
        uid: userId,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(userRef, userDoc, { merge: true });
    } catch (error) {
      this.handleError(error, "createUserProfile");
    }
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<User | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      if (!db) {
        throw new Error("Database not available");
      }

      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return userSnap.data() as User;
      }
      return null;
    } catch (error) {
      this.handleError(error, "getUserProfile");
    }
  }

  // Update user preferences
  async updateUserPreferences(
    userId: string,
    preferences: User["preferences"]
  ): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error("Firestore not available");
    }

    try {
      if (!db) {
        throw new Error("Database not available");
      }

      const userRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(userRef, {
        preferences,
        updatedAt: new Date(),
      });
    } catch (error) {
      this.handleError(error, "updateUserPreferences");
    }
  }

  // Update user profile
  async updateUserProfile(
    userId: string,
    userData: Partial<User>
  ): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error("Firestore not available");
    }

    try {
      if (!db) {
        throw new Error("Database not available");
      }

      const userRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date(),
      });
    } catch (error) {
      this.handleError(error, "updateUserProfile");
    }
  }

  // ============================================================================
  // ISLAMIC DATA MANAGEMENT
  // ============================================================================

  // Add Islamic data
  async addIslamicData(
    data: Omit<IslamicData, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error("Firestore not available");
    }

    try {
      if (!db) {
        throw new Error("Database not available");
      }

      const islamicDataRef = collection(db, COLLECTIONS.ISLAMIC_DATA);
      const docData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(islamicDataRef, docData);
      return docRef.id;
    } catch (error) {
      this.handleError(error, "addIslamicData");
    }
  }

  // Get Islamic data with pagination and filters
  async getIslamicData(
    filters: Partial<FilterState> = {},
    pagination: Partial<PaginationState> = {}
  ): Promise<PaginatedResponse<IslamicData>> {
    if (!this.isAvailable()) {
      throw new Error("Firestore not available");
    }

    try {
      if (!db) {
        throw new Error("Database not available");
      }

      const islamicDataRef = collection(db, COLLECTIONS.ISLAMIC_DATA);
      let q: Query<DocumentData> = islamicDataRef;

      // Apply filters
      if (filters.types && filters.types.length > 0) {
        q = query(q, where("type", "in", filters.types));
      }

      if (filters.fulfillmentStatus && filters.fulfillmentStatus.length > 0) {
        q = query(
          q,
          where("fulfillmentStatus", "in", filters.fulfillmentStatus)
        );
      }

      if (filters.prophecyCategories && filters.prophecyCategories.length > 0) {
        q = query(
          q,
          where("prophecyCategory", "in", filters.prophecyCategories)
        );
      }

      // Apply sorting
      const sortBy = filters.sortBy || "title";
      const sortOrder = filters.sortOrder || "asc";
      q = query(q, orderBy(sortBy, sortOrder));

      // Apply pagination
      const itemsPerPage = pagination.itemsPerPage || 20;
      q = query(q, limit(itemsPerPage));

      if (pagination.currentPage && pagination.currentPage > 1) {
        // For simplicity, we'll implement cursor-based pagination later
        // This is a basic implementation
      }

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as IslamicData[];

      return {
        success: true,
        data,
        pagination: {
          currentPage: pagination.currentPage || 1,
          totalPages: Math.ceil(data.length / itemsPerPage),
          itemsPerPage,
          totalItems: data.length,
          hasNextPage: data.length === itemsPerPage,
          hasPreviousPage: (pagination.currentPage || 1) > 1,
        },
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
      };
    } catch (error) {
      this.handleError(error, "getIslamicData");
    }
  }

  // Get Islamic data by ID
  async getIslamicDataById(id: string): Promise<IslamicData | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      if (!db) {
        throw new Error("Database not available");
      }

      const docRef = doc(db, COLLECTIONS.ISLAMIC_DATA, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id } as IslamicData;
      }
      return null;
    } catch (error) {
      this.handleError(error, "getIslamicDataById");
    }
  }

  // Update Islamic data
  async updateIslamicData(
    id: string,
    data: Partial<IslamicData>
  ): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error("Firestore not available");
    }

    try {
      if (!db) {
        throw new Error("Database not available");
      }

      const docRef = doc(db, COLLECTIONS.ISLAMIC_DATA, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date(),
      });
    } catch (error) {
      this.handleError(error, "updateIslamicData");
    }
  }

  // Delete Islamic data
  async deleteIslamicData(id: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error("Firestore not available");
    }

    try {
      if (!db) {
        throw new Error("Database not available");
      }

      const docRef = doc(db, COLLECTIONS.ISLAMIC_DATA, id);
      await deleteDoc(docRef);
    } catch (error) {
      this.handleError(error, "deleteIslamicData");
    }
  }

  // ============================================================================
  // QURAN DATA MANAGEMENT
  // ============================================================================

  // Add Quran data
  async addQuranData(data: Omit<QuranAyah, "id">): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error("Firestore not available");
    }

    try {
      if (!db) {
        throw new Error("Database not available");
      }

      const quranRef = collection(db, COLLECTIONS.QURAN);
      const docRef = await addDoc(quranRef, data);
      return docRef.id;
    } catch (error) {
      this.handleError(error, "addQuranData");
    }
  }

  // Get Quran data with filters
  async getQuranData(filters: Partial<FilterState> = {}): Promise<QuranAyah[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      if (!db) {
        throw new Error("Database not available");
      }

      const quranRef = collection(db, COLLECTIONS.QURAN);
      let q: Query<DocumentData> = quranRef;

      // Apply filters
      if (filters.quranSurahs && filters.quranSurahs.length > 0) {
        q = query(q, where("surah_no", "in", filters.quranSurahs.map(Number)));
      }

      if (
        filters.quranPlaceOfRevelation &&
        filters.quranPlaceOfRevelation.length > 0
      ) {
        q = query(
          q,
          where("place_of_revelation", "in", filters.quranPlaceOfRevelation)
        );
      }

      // Apply sorting
      q = query(q, orderBy("surah_no", "asc"), orderBy("ayah_no_surah", "asc"));

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as QuranAyah[];
    } catch (error) {
      this.handleError(error, "getQuranData");
    }
  }

  // ============================================================================
  // HADITH DATA MANAGEMENT
  // ============================================================================

  // Add Hadith data
  async addHadithData(
    data: Omit<HadithEntry, "id" | "createdAt">
  ): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error("Firestore not available");
    }

    try {
      if (!db) {
        throw new Error("Database not available");
      }

      const hadithRef = collection(db, COLLECTIONS.HADITH);
      const docData = {
        ...data,
        createdAt: new Date(),
      };

      const docRef = await addDoc(hadithRef, docData);
      return docRef.id;
    } catch (error) {
      this.handleError(error, "addHadithData");
    }
  }

  // Get Hadith data with filters
  async getHadithData(
    filters: Partial<FilterState> = {}
  ): Promise<HadithEntry[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      if (!db) {
        throw new Error("Database not available");
      }

      const hadithRef = collection(db, COLLECTIONS.HADITH);
      let q: Query<DocumentData> = hadithRef;

      // Apply filters
      if (filters.hadithNumberRange) {
        q = query(
          q,
          where("number", ">=", filters.hadithNumberRange.min.toString()),
          where("number", "<=", filters.hadithNumberRange.max.toString())
        );
      }

      // Apply sorting
      q = query(q, orderBy("number", "asc"));

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as HadithEntry[];
    } catch (error) {
      this.handleError(error, "getHadithData");
    }
  }

  // ============================================================================
  // FAVORITES MANAGEMENT
  // ============================================================================

  // Add to favorites
  async addToFavorites(
    userId: string,
    itemId: string,
    itemType: string
  ): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error("Firestore not available");
    }

    try {
      if (!db) {
        throw new Error("Database not available");
      }

      const favoritesRef = collection(db, COLLECTIONS.FAVORITES);
      const favoriteDoc = {
        userId,
        itemId,
        itemType,
        createdAt: new Date(),
      };

      await addDoc(favoritesRef, favoriteDoc);
    } catch (error) {
      this.handleError(error, "addToFavorites");
    }
  }

  // Remove from favorites
  async removeFromFavorites(userId: string, itemId: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error("Firestore not available");
    }

    try {
      if (!db) {
        throw new Error("Database not available");
      }

      const favoritesRef = collection(db, COLLECTIONS.FAVORITES);
      const q = query(
        favoritesRef,
        where("userId", "==", userId),
        where("itemId", "==", itemId)
      );

      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);
    } catch (error) {
      this.handleError(error, "removeFromFavorites");
    }
  }

  // Get user favorites
  async getUserFavorites(
    userId: string
  ): Promise<Array<{ itemId: string; itemType: string }>> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      if (!db) {
        throw new Error("Database not available");
      }

      const favoritesRef = collection(db, COLLECTIONS.FAVORITES);
      const q = query(
        favoritesRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) => doc.data() as { itemId: string; itemType: string }
      );
    } catch (error) {
      this.handleError(error, "getUserFavorites");
    }
  }

  // Check if item is favorited
  async isFavorited(userId: string, itemId: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      if (!db) {
        throw new Error("Database not available");
      }

      const favoritesRef = collection(db, COLLECTIONS.FAVORITES);
      const q = query(
        favoritesRef,
        where("userId", "==", userId),
        where("itemId", "==", itemId)
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      this.handleError(error, "isFavorited");
    }
  }

  // ============================================================================
  // SEARCH HISTORY
  // ============================================================================

  // Save search history
  async saveSearchHistory(
    userId: string,
    searchQuery: string,
    filters: FilterState
  ): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }

    try {
      if (!db) {
        throw new Error("Database not available");
      }

      const searchHistoryRef = collection(db, COLLECTIONS.SEARCH_HISTORY);
      const searchDoc = {
        userId,
        searchQuery,
        filters,
        timestamp: new Date(),
      };

      await addDoc(searchHistoryRef, searchDoc);
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("Failed to save search history:", error);
      }
    }
  }

  // Get user search history
  async getUserSearchHistory(
    userId: string,
    limitCount: number = 10
  ): Promise<
    Array<{
      searchQuery: string;
      filters: FilterState;
      timestamp: Date;
    }>
  > {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      if (!db) {
        throw new Error("Database not available");
      }

      const searchHistoryRef = collection(db, COLLECTIONS.SEARCH_HISTORY);
      const q = query(
        searchHistoryRef,
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          doc.data() as {
            searchQuery: string;
            filters: FilterState;
            timestamp: Date;
          }
      );
    } catch (error) {
      this.handleError(error, "getUserSearchHistory");
    }
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  // Track user activity
  async trackUserActivity(
    userId: string,
    activity: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }

    try {
      if (!db) {
        throw new Error("Database not available");
      }

      const analyticsRef = collection(db, COLLECTIONS.ANALYTICS);
      const activityDoc = {
        userId,
        activity,
        metadata,
        timestamp: new Date(),
      };

      await addDoc(analyticsRef, activityDoc);
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("Failed to track user activity:", error);
      }
    }
  }

  // Get analytics data
  async getAnalytics(
    userId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<
    Array<{
      activity: string;
      metadata?: Record<string, unknown>;
      timestamp: Date;
    }>
  > {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      if (!db) {
        throw new Error("Database not available");
      }

      const analyticsRef = collection(db, COLLECTIONS.ANALYTICS);
      let q: Query<DocumentData> = analyticsRef;

      if (userId) {
        q = query(q, where("userId", "==", userId));
      }

      if (startDate) {
        q = query(q, where("timestamp", ">=", startDate));
      }

      if (endDate) {
        q = query(q, where("timestamp", "<=", endDate));
      }

      q = query(q, orderBy("timestamp", "desc"));

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          doc.data() as {
            activity: string;
            metadata?: Record<string, unknown>;
            timestamp: Date;
          }
      );
    } catch (error) {
      this.handleError(error, "getAnalytics");
    }
  }

  // ============================================================================
  // REAL-TIME LISTENERS
  // ============================================================================

  // Listen to user profile changes
  onUserProfileChange(
    userId: string,
    callback: (user: User | null) => void
  ): () => void {
    if (!this.isAvailable()) {
      return () => {};
    }

    if (!db) {
      throw new Error("Database not available");
    }

    const userRef = doc(db, COLLECTIONS.USERS, userId);
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as User);
      } else {
        callback(null);
      }
    });
  }

  // Listen to favorites changes
  onFavoritesChange(
    userId: string,
    callback: (favorites: Array<{ itemId: string; itemType: string }>) => void
  ): () => void {
    if (!this.isAvailable()) {
      return () => {};
    }

    if (!db) {
      throw new Error("Database not available");
    }

    const favoritesRef = collection(db, COLLECTIONS.FAVORITES);
    const q = query(favoritesRef, where("userId", "==", userId));

    return onSnapshot(q, (querySnapshot) => {
      const favorites = querySnapshot.docs.map(
        (doc) => doc.data() as { itemId: string; itemType: string }
      );
      callback(favorites);
    });
  }

  // Listen to Islamic data changes
  onIslamicDataChange(callback: (data: IslamicData[]) => void): () => void {
    if (!this.isAvailable()) {
      return () => {};
    }

    if (!db) {
      throw new Error("Database not available");
    }

    const islamicDataRef = collection(db, COLLECTIONS.ISLAMIC_DATA);
    const q = query(islamicDataRef, orderBy("createdAt", "desc"));

    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as IslamicData[];
      callback(data);
    });
  }
}

// Export singleton instance
export const firestoreService = FirestoreService.getInstance();
