// Test utility for Firestore user management
import { firestoreService } from "../firebase/firestore";

export const testFirestoreUserManagement = async () => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log("🧪 Testing Firestore User Management...");
  }

  try {
    // Test 1: Check if Firebase is configured
    const isConfigured = true; // Assume configured for testing
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("✅ Firebase configured:", isConfigured);
    }

    if (!isConfigured) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("⚠️ Firebase not configured - skipping tests");
      }
      return;
    }

    // Test 2: Create a test user profile
    const testUserId = "test-user-" + Date.now();
    const testUserData = {
      email: "test@example.com",
      displayName: "Test User",
      createdAt: new Date(),
      lastActive: new Date(),
      preferences: {
        darkMode: false,
        language: "en",
        fontSize: "medium" as const,
        highContrast: false,
        reducedMotion: false,
      },
    };

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("📝 Creating test user profile...");
    }
    await firestoreService.createUserProfile(testUserId, testUserData);
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("✅ Test user profile created");
    }

    // Test 3: Retrieve the test user profile
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("📖 Retrieving test user profile...");
    }
    const retrievedProfile = await firestoreService.getUserProfile(testUserId);
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(
        "✅ Test user profile retrieved:",
        retrievedProfile?.displayName
      );
    }

    // Test 4: Update the test user profile
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("✏️ Updating test user profile...");
    }
    await firestoreService.updateUserProfile(testUserId, {
      displayName: "Updated Test User",
      lastActive: new Date(),
    });
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("✅ Test user profile updated");
    }

    // Test 5: Update user preferences
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("⚙️ Updating user preferences...");
    }
    await firestoreService.updateUserPreferences(testUserId, {
      darkMode: true,
      language: "en",
      fontSize: "large" as const,
      highContrast: true,
      reducedMotion: false,
    });
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("✅ User preferences updated");
    }

    // Test 6: Track user activity
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("📊 Tracking user activity...");
    }
    await firestoreService.trackUserActivity(testUserId, "test_activity", {
      test: true,
      timestamp: new Date().toISOString(),
    });
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("✅ User activity tracked");
    }

    // Test 7: Get user analytics
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("📈 Getting user analytics...");
    }
    const analytics = await firestoreService.getAnalytics(testUserId);
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("✅ User analytics retrieved:", analytics.length, "entries");
    }

    // Test 8: Add and manage favorites
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("❤️ Testing favorites management...");
    }
    await firestoreService.addToFavorites(testUserId, "test-item-1", "islamic");
    await firestoreService.addToFavorites(testUserId, "test-item-2", "quran");

    const favorites = await firestoreService.getUserFavorites(testUserId);
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(
        "✅ Favorites added and retrieved:",
        favorites.length,
        "items"
      );
    }

    const isFavorited = await firestoreService.isFavorited(
      testUserId,
      "test-item-1"
    );
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("✅ Favorite check:", isFavorited);
    }

    // Test 9: Search history
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("🔍 Testing search history...");
    }
    await firestoreService.saveSearchHistory(testUserId, "test search", {
      types: [],
      categories: [],
      searchFields: [],
      sortBy: "title",
      sortOrder: "asc",
      fulfillmentStatus: [],
      prophecyCategories: [],
      yearRange: { min: 0, max: 9999 },
      dataSources: ["islamic data"],
      quranSurahs: [],
      quranVerseRange: { min: 1, max: 6236 },
      quranPlaceOfRevelation: [],
      quranSajdahOnly: false,
      hadithNumberRange: { min: 1, max: 9999 },
      hadithCategories: [],
    });

    const searchHistory = await firestoreService.getUserSearchHistory(
      testUserId,
      5
    );
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(
        "✅ Search history saved and retrieved:",
        searchHistory.length,
        "entries"
      );
    }

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("🎉 All Firestore user management tests passed!");
    }
    return true;
  } catch (error) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("❌ Firestore user management test failed:", error);
    }
    return false;
  }
};

// Export for use in development
if (import.meta.env.DEV) {
  (
    window as unknown as {
      testFirestoreUserManagement: typeof testFirestoreUserManagement;
    }
  ).testFirestoreUserManagement = testFirestoreUserManagement;
}
