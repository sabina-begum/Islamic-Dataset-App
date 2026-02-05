import React, { useState, useEffect } from "react";

interface QRInstallPromptProps {
  className?: string;
  showTitle?: boolean;
}

export const QRInstallPrompt: React.FC<QRInstallPromptProps> = ({
  className = "",
  showTitle = true,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Get current URL for QR code generation
    const url = window.location.origin;
    setCurrentUrl(url);

    // Generate QR code using a public API
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      url
    )}&format=png&bgcolor=ffffff&color=059669`;
    setQrCodeUrl(qrApiUrl);
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("Failed to copy URL:", err);
      }
    }
  };

  const shareApp = async () => {
    const shareData = {
      title:
        "🕌 Quran & Hadiths - Complete Quran & Sahih Bukhari & MuslimHadith Collection",
      text: "📚 Access 40,000+ authentic Islamic texts offline! Complete Quran, Hadith collections, and scientific discoveries in this amazing Progressive Web App. Install for instant Islamic guidance.",
      url: currentUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await copyToClipboard();
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("Error sharing:", err);
      }
    }
  };

  return (
    <div
      className={`bg-stone-50 dark:bg-stone-800/40 rounded-lg p-6 border border-stone-200 dark:border-stone-700/50 ${className}`}
      role="region"
      aria-labelledby="qr-prompt-heading"
    >
      {showTitle && (
        <div className="mb-4">
          <div className="flex items-start gap-3 mb-2">
            <img
              src="/svg-icons/phone-fill.svg"
              alt="Mobile phone icon"
              className="w-5 h-5 text-stone-600 dark:text-stone-400"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(46%) sepia(6%) saturate(458%) hue-rotate(314deg) brightness(94%) contrast(86%)",
              }}
            />
            <div>
              <h3
                id="qr-prompt-heading"
                className="text-lg font-semibold text-stone-900 dark:text-stone-100"
              >
                Share Quran & Hadiths App
              </h3>
              <p className="text-sm text-stone-700 dark:text-stone-300">
                Scan QR code or share link to install on any device
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* QR Code */}
        <div className="flex flex-col items-start">
          <div className="bg-white dark:bg-stone-100 p-4 rounded-lg shadow-sm border border-stone-200 dark:border-stone-600 mb-4">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="QR Code for Quran & Hadiths App"
                className="w-48 h-48"
                loading="lazy"
              />
            ) : (
              <div className="w-48 h-48 bg-stone-100 dark:bg-stone-200 rounded flex items-center justify-center">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"
                  role="status"
                  aria-label="Loading QR code"
                ></div>
              </div>
            )}
          </div>

          {/* URL Display */}
          <div className="w-full">
            <div className="flex items-center bg-stone-100 dark:bg-stone-700 rounded-lg p-3 border border-stone-200 dark:border-stone-600">
              <label
                htmlFor="app-url"
                className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
              >
                Quran & Hadiths App URL
              </label>
              <input
                id="app-url"
                type="text"
                value={currentUrl}
                readOnly
                className="flex-1 bg-transparent text-sm text-stone-700 dark:text-stone-200 outline-none"
                aria-label="App installation URL"
              />
              <button
                onClick={copyToClipboard}
                className="ml-2 p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-stone-800 rounded transition-colors"
                title={copied ? "Copied!" : "Copy URL"}
                aria-label={
                  copied ? "URL copied to clipboard" : "Copy URL to clipboard"
                }
              >
                {copied ? (
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
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
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={shareApp}
            className="w-full inline-flex items-center justify-start gap-3 px-4 py-3 bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-stone-800 text-white rounded-lg transition-colors text-sm font-medium"
            aria-label="Share Quran & Hadiths App using native share"
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
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
            Share App
          </button>

          <button
            onClick={() => {
              const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
                "🕌 Discover Quran & Hadiths - Complete Quran & Hadith Collection!\n\n📚 Access 40,000+ authentic Islamic texts offline. Install this amazing Progressive Web App: " +
                  currentUrl
              )}`;
              window.open(whatsappUrl, "_blank");
            }}
            className="w-full inline-flex items-center justify-start gap-3 px-4 py-3 bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-stone-800 text-white rounded-lg transition-colors text-sm font-medium"
            aria-label="Share on WhatsApp"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787" />
            </svg>
            Share on WhatsApp
          </button>

          <button
            onClick={() => {
              const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                "🕌 Amazing Islamic knowledge app! 📚 Access 40,000+ authentic Quran verses & Hadith offline. Install this Progressive Web App: " +
                  currentUrl +
                  " #IslamicKnowledge #Quran #Hadith #PWA"
              )}`;
              window.open(twitterUrl, "_blank");
            }}
            className="w-full inline-flex items-center justify-start gap-3 px-4 py-3 bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-stone-800 text-white rounded-lg transition-colors text-sm font-medium"
            aria-label="Share on Twitter"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
            Share on Twitter
          </button>

          {/* Installation Instructions */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-600">
            <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-2">
              How to install:
            </h4>
            <div className="space-y-2 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              <div className="flex items-center gap-2">
                <img
                  src="/svg-icons/phone-fill.svg"
                  alt="Mobile device"
                  className="w-4 h-4 text-stone-600 dark:text-stone-400 flex-shrink-0"
                  style={{
                    filter:
                      "brightness(0) saturate(100%) invert(46%) sepia(6%) saturate(458%) hue-rotate(314deg) brightness(94%) contrast(86%)",
                  }}
                />
                <span>
                  <strong>Mobile:</strong> Open link → Add to Home Screen
                </span>
              </div>
              <div className="flex items-center gap-2">
                <img
                  src="/svg-icons/globe-central-south-asia-fill.svg"
                  alt="Desktop computer"
                  className="w-4 h-4 text-stone-600 dark:text-stone-400 flex-shrink-0"
                  style={{
                    filter:
                      "brightness(0) saturate(100%) invert(46%) sepia(6%) saturate(458%) hue-rotate(314deg) brightness(94%) contrast(86%)",
                  }}
                />
                <span>
                  <strong>Desktop:</strong> Open link → Install button in
                  address bar
                </span>
              </div>
              <div className="flex items-center gap-2">
                <img
                  src="/svg-icons/send-fill.svg"
                  alt="Alternative method"
                  className="w-4 h-4 text-stone-600 dark:text-stone-400 flex-shrink-0"
                  style={{
                    filter:
                      "brightness(0) saturate(100%) invert(46%) sepia(6%) saturate(458%) hue-rotate(314deg) brightness(94%) contrast(86%)",
                  }}
                />
                <span>
                  <strong>Alternative:</strong> Scan QR code with camera app
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
