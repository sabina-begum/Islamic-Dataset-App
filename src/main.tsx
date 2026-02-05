import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import App from "./App.tsx";
import "./index.css";

// Import copyright protection
import "./utils/copyrightProtection";

// Register service worker for PWA functionality with aggressive updates
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      // Skip aggressive unregistration that causes refresh loops
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("Starting service worker registration");
      }

      // Register new service worker with cache busting
      const registration = await navigator.serviceWorker.register(
        "/sw.js?v=2.2.0",
        {
          updateViaCache: "none", // Force bypass cache for service worker
        }
      );

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("SW registered: ", registration);
      }

      // Let updates happen naturally without forcing
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("Service worker registered successfully");
      }

      // Listen for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New SW is available, will activate on next visit
              if (import.meta.env.DEV) {
                // eslint-disable-next-line no-console
                console.log("New SW available, will activate on next visit");
              }
            }
          });
        }
      });
    } catch (registrationError) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("SW registration failed: ", registrationError);
      }
    }
  });
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
