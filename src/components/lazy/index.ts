import React from "react";

// Lazy load heavy components for better performance
export const LazyChartsDashboard = React.lazy(() =>
  import("../features/charts/ChartsDashboard").then((module) => ({
    default: module.ChartsDashboard,
  }))
);

export const LazyAdvancedSearchDashboard = React.lazy(() =>
  import("../features/search/AdvancedSearchDashboard").then((module) => ({
    default: module.AdvancedSearchDashboard,
  }))
);

export const LazyQuranDashboard = React.lazy(() =>
  import("../features/qurancard/QuranDashboard").then((module) => ({
    default: module.QuranDashboard,
  }))
);

export const LazyHadithDashboard = React.lazy(() =>
  import("../features/hadithcard/HadithDashboard").then((module) => ({
    default: module.HadithDashboard,
  }))
);

export const LazySearchResults = React.lazy(() =>
  import("../features/search/SearchResults").then((module) => ({
    default: module.SearchResults,
  }))
);

export const LazyAdvancedFilterPanel = React.lazy(() =>
  import("../features/search/AdvancedFilterPanel").then((module) => ({
    default: module.AdvancedFilterPanel,
  }))
);

// Authentication components
export const LazyLogin = React.lazy(() =>
  import("../features/auth/Login").then((module) => ({
    default: module.default,
  }))
);

export const LazySignup = React.lazy(() =>
  import("../features/auth/Signup").then((module) => ({
    default: module.default,
  }))
);

export const LazyProfile = React.lazy(() =>
  import("../../pages/Profile").then((module) => ({
    default: module.default,
  }))
);

// Other heavy components
export const LazyAccessibilitySettings = React.lazy(() =>
  import("../common/AccessibilitySettings").then((module) => ({
    default: module.AccessibilitySettings,
  }))
);

export const LazyPWAInstallPrompt = React.lazy(() =>
  import("../PWAInstallPrompt").then((module) => ({
    default: module.PWAInstallPrompt,
  }))
);
