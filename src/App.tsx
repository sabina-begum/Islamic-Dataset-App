import React, { Suspense, lazy, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { FirebaseProvider } from "./contexts/FirebaseContext";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import Footer from "./components/layout/Footer";

// Import performance optimization utilities
import { monitorCSSPerformance } from "./utils/cssLoader";

// Lazy load major components for code splitting
const HomePageWrapper = lazy(() =>
  import("./components/HomePageWrapper").then((module) => ({
    default: module.default,
  }))
);
const FavoritesPage = lazy(() =>
  import("./pages/Favorites").then((module) => ({ default: module.default }))
);
const ProfilePage = lazy(() =>
  import("./pages/Profile").then((module) => ({ default: module.default }))
);
const LoginPage = lazy(() =>
  import("./pages/Login").then((module) => ({ default: module.default }))
);
const CopyrightPage = lazy(() =>
  import("./pages/Copyright").then((module) => ({ default: module.default }))
);
const TermsPage = lazy(() =>
  import("./pages/Terms").then((module) => ({ default: module.default }))
);
const PrivacyPage = lazy(() =>
  import("./pages/Privacy").then((module) => ({ default: module.default }))
);
const InstallAppPage = lazy(() =>
  import("./pages/InstallApp").then((module) => ({ default: module.default }))
);

// Loading component for lazy-loaded routes
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  </div>
);

function App() {
  // State for sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Function to close sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Initialize performance optimizations
  useEffect(() => {
    // Start CSS performance monitoring
    monitorCSSPerformance();

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log("✅ Service Worker registered:", registration);
          }

          // Handle service worker updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New service worker available
                  if (import.meta.env.DEV) {
                    // eslint-disable-next-line no-console
                    console.log("🔄 New service worker available");
                  }
                  // Could show user notification about update
                }
              });
            }
          });
        })
        .catch((error) => {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.error("❌ Service Worker registration failed:", error);
          }
        });
    }

    // Initialize route prefetching after a delay
    setTimeout(() => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("🚀 Initializing route prefetching");
      }
      // Route prefetcher is already initialized as singleton
    }, 2000);

    // Performance monitoring
    if ("performance" in window) {
      // Monitor largest contentful paint
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log(`📊 LCP: ${entry.startTime.toFixed(2)}ms`);
          }
        }
      }).observe({ entryTypes: ["largest-contentful-paint"] });

      // Monitor cumulative layout shift
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as any; // Layout shift entries have additional properties
          if (!layoutShiftEntry.hadRecentInput) {
            if (import.meta.env.DEV) {
              // eslint-disable-next-line no-console
              console.log(`📊 CLS: ${layoutShiftEntry.value.toFixed(4)}`);
            }
          }
        }
      }).observe({ entryTypes: ["layout-shift"] });
    }

    // Cleanup function
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <FirebaseProvider>
      <DarkModeProvider>
        <AccessibilityProvider>
          <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex flex-col main-container">
            {/* Pass sidebar toggle function to Navbar */}
            <Navbar onMenuToggle={toggleSidebar} />

            {/* Sidebar component */}
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

            {/* Main content with sidebar-aware layout */}
            <main
              className={`flex-1 container mx-auto max-w-7xl px-4 py-8 content-container transition-all duration-300 ${
                isSidebarOpen ? "md:mr-80" : ""
              }`}
            >
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<HomePageWrapper />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/install" element={<InstallAppPage />} />
                  <Route path="/copyright" element={<CopyrightPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </AccessibilityProvider>
      </DarkModeProvider>
    </FirebaseProvider>
  );
}

export default App;
