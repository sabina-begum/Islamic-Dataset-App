import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Global state for PWA install prompt
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
let globalIsInstalled = false;
let globalIsListening = false;

// Subscribers for state updates
const subscribers = new Set<() => void>();

const notifySubscribers = () => {
  subscribers.forEach((callback) => callback());
};

// Global event handlers
const handleBeforeInstallPrompt = (e: Event) => {
  e.preventDefault();
  globalDeferredPrompt = e as BeforeInstallPromptEvent;
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log("PWA install prompt captured globally");
  }
  notifySubscribers();
};

const handleAppInstalled = () => {
  globalIsInstalled = true;
  globalDeferredPrompt = null;
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log("PWA installed globally");
  }
  notifySubscribers();
};

const checkIfInstalled = () => {
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const isInAppBrowser = (window.navigator as any).standalone === true;
  return isStandalone || isInAppBrowser;
};

// Initialize global listeners once
const initializeGlobalListeners = () => {
  if (globalIsListening) return;

  globalIsInstalled = checkIfInstalled();

  if (!globalIsInstalled) {
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    globalIsListening = true;
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("Global PWA listeners initialized");
    }
  }
};

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState(globalIsInstalled);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize global listeners
    initializeGlobalListeners();

    // Subscribe to global state changes
    const updateLocalState = () => {
      setDeferredPrompt(globalDeferredPrompt);
      setIsInstalled(globalIsInstalled);
    };

    subscribers.add(updateLocalState);

    // Initial state sync
    updateLocalState();

    return () => {
      subscribers.delete(updateLocalState);
    };
  }, []);

  const installPWA = async () => {
    if (!globalDeferredPrompt) {
      // Manual install instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);

      let message = "To install this app on your device:\n\n";
      if (isIOS) {
        message +=
          "1. Tap the Share button (square with arrow)\n2. Scroll down and tap 'Add to Home Screen'\n3. Tap 'Add' to install";
      } else if (isAndroid) {
        message +=
          "1. Tap the menu button (⋮)\n2. Tap 'Add to Home Screen' or 'Install App'\n3. Follow the prompts to install";
      } else {
        message +=
          "1. Look for the install icon in your browser's address bar\n2. Click 'Install' or 'Add to Home Screen'\n3. Follow the prompts to install";
      }

      alert(message);
      return;
    }

    setIsLoading(true);
    try {
      // Show the install prompt
      await globalDeferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await globalDeferredPrompt.userChoice;

      if (outcome === "accepted") {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log("User accepted the install prompt");
        }
        globalIsInstalled = true;
        globalDeferredPrompt = null;
        notifySubscribers();
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
    } finally {
      setIsLoading(false);
    }

    // Clear the prompt as it can only be used once
    globalDeferredPrompt = null;
    notifySubscribers();
  };

  return {
    deferredPrompt,
    isInstalled,
    isLoading,
    installPWA,
    isInstallable: !!globalDeferredPrompt && !globalIsInstalled,
  };
};
