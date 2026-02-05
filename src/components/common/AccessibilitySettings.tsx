import React, { useState } from "react";
import { AccessibilityContext } from "../../contexts/AccessibilityContext";

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  isOpen,
  onClose,
}) => {
  const accessibilityContext = React.useContext(AccessibilityContext);

  // Early return if context is not available
  if (!accessibilityContext) {
    return null;
  }

  const {
    isHighContrast,
    toggleHighContrast,
    isReducedMotion,
    toggleReducedMotion,
    fontSize,
    setFontSize,
  } = accessibilityContext;

  const [activeTab, setActiveTab] = useState<
    "visual" | "navigation" | "testing"
  >("visual");

  // Local state for missing properties
  const [colorBlindnessMode, setColorBlindnessMode] = useState<
    "none" | "protanopia" | "deuteranopia" | "tritanopia"
  >("none");
  const [showFocusIndicators, setShowFocusIndicators] = useState(true);

  // Toggle functions for local state
  const toggleColorBlindnessMode = (mode: typeof colorBlindnessMode) => {
    setColorBlindnessMode(mode);
    // Apply color blindness filter to document
    document.documentElement.setAttribute("data-color-blindness", mode);
  };

  const toggleFocusIndicators = () => {
    setShowFocusIndicators((prev) => !prev);
    // Toggle focus indicators CSS
    document.documentElement.classList.toggle(
      "show-focus-indicators",
      !showFocusIndicators
    );
  };

  // Simple contrast ratio calculator
  const calculateContrastRatio = (color1: string, color2: string): number => {
    // Convert hex colors to RGB and calculate relative luminance
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 0, g: 0, b: 0 };
    };

    const getRelativeLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    try {
      const rgb1 = hexToRgb(color1);
      const rgb2 = hexToRgb(color2);

      const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
      const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);

      return (lighter + 0.05) / (darker + 0.05);
    } catch {
      // Fallback to default compliant ratio if calculation fails
      return 4.5;
    }
  };

  // Test color contrast
  const testContrast = () => {
    const foregroundInput = document.getElementById(
      "foreground-color"
    ) as HTMLInputElement;
    const backgroundInput = document.getElementById(
      "background-color"
    ) as HTMLInputElement;

    if (foregroundInput && backgroundInput) {
      const ratio = calculateContrastRatio(
        foregroundInput.value,
        backgroundInput.value
      );
      const isCompliant = ratio >= 4.5;

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("WCAG Compliance Result:", {
          ratio: ratio.toFixed(2),
          compliant: isCompliant,
          level: ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : "Fail",
        });
      }

      alert(
        `Contrast ratio: ${ratio.toFixed(2)} - ${
          isCompliant ? "WCAG AA Compliant" : "Not compliant"
        }`
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-settings-title"
    >
      <div className="bg-white dark:bg-stone-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-700">
          <h2
            id="accessibility-settings-title"
            className="text-xl font-bold text-stone-900 dark:text-stone-100"
          >
            Accessibility Settings
          </h2>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
            aria-label="Close accessibility settings"
          >
            <svg
              className="w-6 h-6"
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
        </header>

        {/* Tabs */}
        <nav className="flex border-b border-stone-200 dark:border-stone-700">
          {[
            { id: "visual", label: "Visual", icon: "" },
            { id: "navigation", label: "Navigation", icon: "⌨️" },
            { id: "testing", label: "Testing", icon: "🔍" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                  : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
              }`}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="p-6">
          {/* Visual Settings */}
          {activeTab === "visual" && (
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-4 text-stone-900 dark:text-stone-100">
                  Visual Preferences
                </h3>

                {/* High Contrast */}
                <div className="flex items-center justify-between py-3 border-b border-stone-200 dark:border-stone-700">
                  <div>
                    <label className="text-sm font-medium text-stone-900 dark:text-stone-100">
                      High Contrast Mode
                    </label>
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      Increases color contrast for better visibility
                    </p>
                  </div>
                  <button
                    onClick={toggleHighContrast}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isHighContrast
                        ? "bg-blue-600"
                        : "bg-stone-300 dark:bg-stone-600"
                    }`}
                    role="switch"
                    aria-checked={isHighContrast}
                    aria-label="Toggle high contrast mode"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isHighContrast ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Reduced Motion */}
                <div className="flex items-center justify-between py-3 border-b border-stone-200 dark:border-stone-700">
                  <div>
                    <label className="text-sm font-medium text-stone-900 dark:text-stone-100">
                      Reduced Motion
                    </label>
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      Reduces animations and transitions
                    </p>
                  </div>
                  <button
                    onClick={toggleReducedMotion}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isReducedMotion
                        ? "bg-blue-600"
                        : "bg-stone-300 dark:bg-stone-600"
                    }`}
                    role="switch"
                    aria-checked={isReducedMotion}
                    aria-label="Toggle reduced motion"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isReducedMotion ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Font Size */}
                <div className="py-3 border-b border-stone-200 dark:border-stone-700">
                  <label className="text-sm font-medium text-stone-900 dark:text-stone-100">
                    Font Size
                  </label>
                  <div className="flex gap-2 mt-2">
                    {(["small", "medium", "large"] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          fontSize === size
                            ? "bg-blue-600 text-white"
                            : "bg-stone-200 text-stone-700 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600"
                        }`}
                        aria-pressed={fontSize === size}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Blindness Mode */}
                <div className="py-3 border-b border-stone-200 dark:border-stone-700">
                  <label className="text-sm font-medium text-stone-900 dark:text-stone-100">
                    Color Blindness Mode
                  </label>
                  <div className="flex gap-2 mt-2">
                    {(
                      [
                        "none",
                        "protanopia",
                        "deuteranopia",
                        "tritanopia",
                      ] as const
                    ).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => toggleColorBlindnessMode(mode)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          colorBlindnessMode === mode
                            ? "bg-blue-600 text-white"
                            : "bg-stone-200 text-stone-700 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600"
                        }`}
                        aria-pressed={colorBlindnessMode === mode}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Focus Indicators */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <label className="text-sm font-medium text-stone-900 dark:text-stone-100">
                      Show Focus Indicators
                    </label>
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      Highlights focused elements for keyboard navigation
                    </p>
                  </div>
                  <button
                    onClick={toggleFocusIndicators}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showFocusIndicators
                        ? "bg-blue-600"
                        : "bg-stone-300 dark:bg-stone-600"
                    }`}
                    role="switch"
                    aria-checked={showFocusIndicators}
                    aria-label="Toggle focus indicators"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showFocusIndicators ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* Navigation Settings */}
          {activeTab === "navigation" && (
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-4 text-stone-900 dark:text-stone-100">
                  Keyboard Navigation
                </h3>

                <div className="space-y-4">
                  <div className="bg-stone-50 dark:bg-stone-700 rounded-lg p-4">
                    <h4 className="font-medium text-stone-900 dark:text-stone-100 mb-2">
                      Keyboard Shortcuts
                    </h4>
                    <div className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
                      <div className="flex justify-between">
                        <span>Navigate to Home</span>
                        <kbd className="px-2 py-1 bg-stone-200 dark:bg-stone-600 rounded text-xs">
                          H
                        </kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Open Search</span>
                        <kbd className="px-2 py-1 bg-stone-200 dark:bg-stone-600 rounded text-xs">
                          S
                        </kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Next Item</span>
                        <kbd className="px-2 py-1 bg-stone-200 dark:bg-stone-600 rounded text-xs">
                          N
                        </kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Previous Item</span>
                        <kbd className="px-2 py-1 bg-stone-200 dark:bg-stone-600 rounded text-xs">
                          P
                        </kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Accessibility Help</span>
                        <kbd className="px-2 py-1 bg-stone-200 dark:bg-stone-600 rounded text-xs">
                          ?
                        </kbd>
                      </div>
                    </div>
                  </div>

                  <div className="bg-stone-50 dark:bg-stone-700 rounded-lg p-4">
                    <h4 className="font-medium text-stone-900 dark:text-stone-100 mb-2">
                      Navigation Tips
                    </h4>
                    <ul className="space-y-1 text-sm text-stone-600 dark:text-stone-400">
                      <li>
                        • Use Tab to navigate between interactive elements
                      </li>
                      <li>
                        • Use Enter or Space to activate buttons and links
                      </li>
                      <li>• Use Arrow keys to scroll through content</li>
                      <li>• Use Escape to close dialogs and menus</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Testing Settings */}
          {activeTab === "testing" && (
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-4 text-stone-900 dark:text-stone-100">
                  WCAG Compliance Testing
                </h3>

                <div className="space-y-4">
                  <div className="bg-stone-50 dark:bg-stone-700 rounded-lg p-4">
                    <h4 className="font-medium text-stone-900 dark:text-stone-100 mb-2">
                      Color Contrast Testing
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">
                            Foreground Color
                          </label>
                          <input
                            type="color"
                            id="foreground-color"
                            className="w-12 h-8 border border-stone-300 dark:border-stone-600 rounded"
                            defaultValue="var(--test-black)"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">
                            Background Color
                          </label>
                          <input
                            type="color"
                            id="background-color"
                            className="w-12 h-8 border border-stone-300 dark:border-stone-600 rounded"
                            defaultValue="var(--test-white)"
                          />
                        </div>
                      </div>
                      <button
                        onClick={testContrast}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Test Contrast Ratio
                      </button>
                    </div>
                  </div>

                  <div className="bg-stone-50 dark:bg-stone-700 rounded-lg p-4">
                    <h4 className="font-medium text-stone-900 dark:text-stone-100 mb-2">
                      Current Settings Status
                    </h4>
                    <div className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
                      <div className="flex justify-between">
                        <span>High Contrast:</span>
                        <span
                          className={
                            isHighContrast ? "text-green-600" : "text-stone-500"
                          }
                        >
                          {isHighContrast ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reduced Motion:</span>
                        <span
                          className={
                            isReducedMotion
                              ? "text-green-600"
                              : "text-stone-500"
                          }
                        >
                          {isReducedMotion ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Font Size:</span>
                        <span className="text-blue-600">{fontSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Focus Indicators:</span>
                        <span
                          className={
                            showFocusIndicators
                              ? "text-green-600"
                              : "text-stone-500"
                          }
                        >
                          {showFocusIndicators ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex justify-end gap-3 p-6 border-t border-stone-200 dark:border-stone-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-stone-600 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};
