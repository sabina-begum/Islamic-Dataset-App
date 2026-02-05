import React, { useState, useEffect } from "react";
import { useLanguage } from "../hooks/useContext";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt: React.FC = () => {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showManualInstall, setShowManualInstall] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // Check if already installed
    if (!checkIfInstalled()) {
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.addEventListener("appinstalled", handleAppInstalled);

      // Show manual install button after a delay if no automatic prompt
      const timer = setTimeout(() => {
        if (!showInstallPrompt && !isInstalled) {
          setShowManualInstall(true);
        }
      }, 3000); // Show after 3 seconds

      return () => {
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt
        );
        window.removeEventListener("appinstalled", handleAppInstalled);
        clearTimeout(timer);
      };
    }
  }, [showInstallPrompt, isInstalled]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        // Show the install prompt
        await deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log("User accepted the install prompt");
          }
          setIsInstalled(true);
          setShowInstallPrompt(false);
        } else {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log("User dismissed the install prompt");
          }
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error("Error showing install prompt:", error);
        }
      }

      setDeferredPrompt(null);
    } else {
      // Manual install instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);

      let message = t("pwa.installMessage");
      if (isIOS) {
        message += t("pwa.iosInstructions");
      } else if (isAndroid) {
        message += t("pwa.androidInstructions");
      } else {
        message += t("pwa.desktopInstructions");
      }

      alert(message);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setShowManualInstall(false);
    setDeferredPrompt(null);
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // Show either automatic prompt or manual install button
  const shouldShow = showInstallPrompt || showManualInstall;
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-xl shadow-lg z-50">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* App Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">
              {t("pwa.installTitle")}
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
              {deferredPrompt
                ? t("pwa.autoDescription")
                : t("pwa.manualDescription")}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstallClick}
            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
          >
            {deferredPrompt
              ? t("pwa.installApp")
              : t("pwa.installInstructions")}
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 text-sm font-medium transition-colors duration-200"
          >
            {t("pwa.notNow")}
          </button>
        </div>

        {/* Features List */}
        <div className="mt-3 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-1 mb-1">
            <svg
              className="w-3 h-3 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {t("pwa.offlineAccess")}
          </div>
          <div className="flex items-center gap-1 mb-1">
            <svg
              className="w-3 h-3 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {t("pwa.fasterLoading")}
          </div>
          <div className="flex items-center gap-1">
            <svg
              className="w-3 h-3 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {t("pwa.homeScreenAccess")}
          </div>
        </div>
      </div>
    </div>
  );
};
