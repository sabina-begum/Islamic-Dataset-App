import React, { useState } from "react";
import { PWAInstallButton } from "../PWAInstallButton";
import { QRInstallPrompt } from "../common/QRInstallPrompt";

export const PWAFeatureHighlight: React.FC = () => {
  const [showQR, setShowQR] = useState(false);

  const features = [
    {
      icon: "/svg-icons/wifi-off.svg",
      title: "Works Offline",
      description:
        "Access complete content collections without internet connection",
    },
    {
      icon: "/svg-icons/lightning-fill.svg",
      title: "Lightning Fast",
      description: "Instant loading with advanced caching technology",
    },
    {
      icon: "/svg-icons/binoculars-fill.svg",
      title: "Advanced Search",
      description:
        "Find any content across comprehensive knowledge collections",
    },
    {
      icon: "/svg-icons/box-seam-fill.svg",
      title: "Complete Collection",
      description:
        "Full content library with advanced visualization capabilities",
    },
    {
      icon: "/svg-icons/palette-fill.svg",
      title: "Beautiful Design",
      description: "Modern, elegant interface with dark mode support",
    },
    {
      icon: "/svg-icons/arrow-repeat.svg",
      title: "Auto Updates",
      description: "Always latest content without manual updates",
    },
  ];

  return (
    <div aria-labelledby="pwa-features-heading">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
            <img
              src="/svg-icons/cloud-arrow-down-fill.svg"
              alt="Download app icon"
              className="w-6 h-6 text-green-600 dark:text-green-400"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)",
              }}
            />
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full mb-2">
              <span className="text-green-800 dark:text-green-200 font-medium text-xs uppercase tracking-wide">
                PROGRESSIVE WEB APP
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-stone-800 dark:text-stone-200">
              Install the Reflect & Implement App
            </h2>
          </div>
        </div>

        <p className="text-stone-600 dark:text-stone-400 text-left leading-relaxed">
          Get instant access to authentic knowledge on any device. Works
          offline, loads instantly, and updates automatically with advanced
          search and visualization features.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-stone-50 dark:bg-stone-800 rounded-lg p-4 border border-stone-200 dark:border-stone-700"
          >
            <div className="flex items-start gap-3 mb-2">
              <img
                src={feature.icon}
                alt=""
                className="w-5 h-5 flex-shrink-0 text-green-600 dark:text-green-400 mt-0.5"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)",
                }}
              />
              <div>
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 text-left">
                  {feature.title}
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 text-left leading-relaxed mt-1">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Installation Actions */}
      <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
        <PWAInstallButton
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
          variant="button"
        />

        <button
          onClick={() => setShowQR(!showQR)}
          className="inline-flex items-center gap-2 px-6 py-3 border-2 border-green-600 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg font-semibold transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Share with QR Code
        </button>
      </div>

      {/* QR Code Section */}
      {showQR && (
        <div className="mt-6 border-t border-stone-200 dark:border-stone-700 pt-6">
          <QRInstallPrompt showTitle={false} />
        </div>
      )}

      {/* Benefits Banner */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-stone-800 rounded-lg p-3 border border-green-100 dark:border-green-700/50">
            <img
              src="/svg-icons/box-seam-fill.svg"
              alt="Download size"
              className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)",
              }}
            />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Lightweight 2MB Download
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-stone-800 rounded-lg p-3 border border-green-100 dark:border-green-700/50">
            <img
              src="/svg-icons/lightning-fill.svg"
              alt="Loading speed"
              className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)",
              }}
            />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Loads in Under 2 Seconds
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-stone-800 rounded-lg p-3 border border-green-100 dark:border-green-700/50">
            <img
              src="/svg-icons/shield-lock-fill.svg"
              alt="Security"
              className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)",
              }}
            />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              100% Secure & Private
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-stone-800 rounded-lg p-3 border border-green-100 dark:border-green-700/50">
            <img
              src="/svg-icons/gift-fill.svg"
              alt="Free to use"
              className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)",
              }}
            />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Completely Free
            </span>
          </div>
        </div>
      </div>

      {/* Installation Instructions */}
      <section
        className="mt-4"
        aria-labelledby="installation-instructions-heading"
      >
        <h3
          id="installation-instructions-heading"
          className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
        >
          Installation Instructions
        </h3>
        <details className="group">
          <summary className="cursor-pointer text-sm text-stone-700 dark:text-stone-300 hover:text-green-600 dark:hover:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-stone-900 rounded transition-colors flex items-center gap-2">
            <span
              className="group-open:hidden flex items-center gap-2"
              role="img"
              aria-label="Document"
            >
              <img
                src="/svg-icons/chevron-down.svg"
                alt="Show instructions"
                className="w-4 h-4 text-stone-600 dark:text-stone-400"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(46%) sepia(6%) saturate(458%) hue-rotate(314deg) brightness(94%) contrast(86%)",
                }}
              />
              Show installation instructions
            </span>
            <span
              className="hidden group-open:flex items-center gap-2"
              role="img"
              aria-label="Up arrow"
            >
              <img
                src="/svg-icons/chevron-up.svg"
                alt="Hide instructions"
                className="w-4 h-4 text-stone-600 dark:text-stone-400"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(46%) sepia(6%) saturate(458%) hue-rotate(314deg) brightness(94%) contrast(86%)",
                }}
              />
              Hide instructions
            </span>
          </summary>

          <div className="mt-3 p-4 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
                  <img
                    src="/svg-icons/phone-fill.svg"
                    alt="Mobile device"
                    className="w-4 h-4 flex-shrink-0"
                    style={{
                      filter:
                        "brightness(0) saturate(100%) invert(20%) sepia(20%) saturate(2000%) hue-rotate(314deg) brightness(90%) contrast(95%)",
                    }}
                  />
                  Mobile (iOS/Android)
                </h4>
                <ol className="text-sm text-stone-700 dark:text-stone-300 space-y-2 list-decimal list-inside">
                  <li>Open this website in Safari/Chrome</li>
                  <li>Tap share button</li>
                  <li>Select "Add to Home Screen"</li>
                  <li>Tap "Add" to confirm</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
                  <img
                    src="/svg-icons/browser-chrome.svg"
                    alt="Chrome browser"
                    className="w-4 h-4 flex-shrink-0"
                    style={{
                      filter:
                        "brightness(0) saturate(100%) invert(20%) sepia(20%) saturate(2000%) hue-rotate(314deg) brightness(90%) contrast(95%)",
                    }}
                  />
                  Desktop (Chrome/Edge)
                </h4>
                <ol className="text-sm text-stone-700 dark:text-stone-300 space-y-2 list-decimal list-inside">
                  <li>Look for install icon in address bar</li>
                  <li>Click "Install Reflect & Implement"</li>
                  <li>Confirm installation</li>
                  <li>App appears in your programs</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
                  <img
                    src="/svg-icons/send-fill.svg"
                    alt="Alternative method"
                    className="w-4 h-4 flex-shrink-0"
                    style={{
                      filter:
                        "brightness(0) saturate(100%) invert(20%) sepia(20%) saturate(2000%) hue-rotate(314deg) brightness(90%) contrast(95%)",
                    }}
                  />
                  Alternative Method
                </h4>
                <ol className="text-sm text-stone-700 dark:text-stone-300 space-y-2 list-decimal list-inside">
                  <li>Bookmark this page</li>
                  <li>Use QR code to share</li>
                  <li>Send link via messaging apps</li>
                  <li>Works on any device/browser</li>
                </ol>
              </div>
            </div>
          </div>
        </details>
      </section>
    </div>
  );
};
