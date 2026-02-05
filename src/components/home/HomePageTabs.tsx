import React from "react";
import { useLanguage } from "../../hooks/useContext";

interface HomePageTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onTabChange?: (tabId: string) => void; // New prop for handling tab changes with scroll
}

export const HomePageTabs: React.FC<HomePageTabsProps> = ({
  activeTab,
  setActiveTab,
  onTabChange,
}) => {
  const { t } = useLanguage();

  const icons = {
    "book-half": (
      <svg
        className="inline-block w-4 h-4 sm:w-5 sm:h-5 align-text-bottom"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M8.5 2.687c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783" />
      </svg>
    ),
    search: (
      <svg
        className="inline-block w-4 h-4 sm:w-5 sm:h-5 align-text-bottom"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
      </svg>
    ),
    "bar-chart": (
      <svg
        className="inline-block w-4 h-4 sm:w-5 sm:h-5 align-text-bottom"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1z" />
      </svg>
    ),
    "book-fill": (
      <svg
        className="inline-block w-4 h-4 sm:w-5 sm:h-5 align-text-bottom"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783" />
      </svg>
    ),
    bookshelf: (
      <svg
        className="inline-block w-4 h-4 sm:w-5 sm:h-5 align-text-bottom"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M2.5 0a.5.5 0 0 1 .5.5V2h10V.5a.5.5 0 0 1 1 0v15a.5.5 0 0 1-1 0V15H3v.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 .5-.5M3 14h10v-3H3zm0-4h10V7H3zm0-4h10V3H3z" />
      </svg>
    ),
  };

  const tabs = [
    { id: "all", label: t("tabs.data"), icon: "book-half" },
    { id: "search", label: t("tabs.search"), icon: "search" },
    { id: "charts", label: t("tabs.charts"), icon: "bar-chart" },
    { id: "quran", label: t("tabs.quran"), icon: "book-fill" },
    { id: "hadith", label: t("tabs.hadith"), icon: "bookshelf" },
  ];

  // Handle tab click with scroll functionality
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    // Call the scroll function if provided
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <div className="border-b border-neutral-200 dark:border-stone-700 bg-stone-200 dark:bg-stone-700 rounded-t-md">
      {/* Mobile & Tablet: Scrollable horizontal tabs */}
      <div className="lg:hidden overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 p-3 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-green-600 text-white shadow-lg shadow-green-600/25 border-2 border-green-500"
                  : "text-stone-700 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100 bg-stone-50 dark:bg-stone-800 border-2 border-transparent hover:border-stone-300 dark:hover:border-stone-600"
              }`}
            >
              <span className="inline-flex items-center gap-1">
                {icons[tab.icon as keyof typeof icons]}
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: Wrapped tabs */}
      <div className="hidden lg:flex flex-wrap gap-2 p-4 lg:p-6 justify-center lg:justify-start">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
              activeTab === tab.id
                ? "bg-green-600 text-white shadow-lg shadow-green-600/25 border-2 border-green-500"
                : "text-stone-700 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100 bg-stone-50 dark:bg-stone-800 border-2 border-transparent hover:border-stone-300 dark:hover:border-stone-600"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              {icons[tab.icon as keyof typeof icons]}
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
