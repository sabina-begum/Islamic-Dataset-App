import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useLanguage } from "../../../hooks/useContext";
import { firestoreService } from "../../../firebase/firestore";
import { UserProfile } from "./UserProfile";

interface UserStats {
  totalFavorites: number;
  totalSearches: number;
  lastActive: Date;
  memberSince: Date;
}

interface UserDashboardProps {
  className?: string;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  className = "",
}) => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "profile" | "favorites" | "history"
  >("overview");

  // Load user statistics
  useEffect(() => {
    const loadStats = async () => {
      if (!user?.uid) return;

      try {
        setIsLoading(true);

        // Get user profile
        const profile = await firestoreService.getUserProfile(user.uid);

        // Get user favorites
        const favorites = await firestoreService.getUserFavorites(user.uid);

        // Get search history
        const searchHistory = await firestoreService.getUserSearchHistory(
          user.uid,
          10
        );

        if (profile) {
          setStats({
            totalFavorites: favorites.length,
            totalSearches: searchHistory.length,
            lastActive: profile.lastActive,
            memberSince: profile.createdAt,
          });
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error("Failed to load user stats:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [user?.uid]);

  if (loading || isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <p className="text-gray-600">{t("auth.pleaseSignInToViewDashboard")}</p>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t("auth.welcomeBack")}, {user.displayName || user.email}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("auth.manageAccountPreferences")}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: t("auth.overview") },
            { id: "profile", label: t("auth.profile") },
            { id: "favorites", label: t("auth.favorites") },
            { id: "history", label: t("auth.history") },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(
                  tab.id as "overview" | "profile" | "favorites" | "history"
                )
              }
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stats Cards */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Favorites
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats?.totalFavorites || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
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
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Searches
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats?.totalSearches || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-yellow-600"
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
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Last Active
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {stats?.lastActive
                      ? new Date(stats.lastActive).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Member Since
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {stats?.memberSince
                      ? new Date(stats.memberSince).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "profile" && <UserProfile />}

        {activeTab === "favorites" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Your Favorites
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your favorite items will appear here. Start exploring to add items
              to your favorites!
            </p>
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Search History
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your recent searches will appear here. Start searching to see your
              history!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
