import { PWAFeatureHighlight } from "../components/home/PWAFeatureHighlight";
import { SocialShareButtons } from "../components/common/SocialShareButtons";

export default function InstallApp() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 transition-colors duration-300">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Main Content */}
        <div className="space-y-8">
          {/* PWA Features */}
          <section
            className="bg-white dark:bg-stone-900 rounded-xl shadow-lg border border-stone-200 dark:border-stone-800 p-6"
            aria-labelledby="pwa-features-heading"
          >
            <PWAFeatureHighlight />
          </section>

          {/* Sharing Section */}
          <section
            className="bg-white dark:bg-stone-900 rounded-xl shadow-lg border border-stone-200 dark:border-stone-800 p-6"
            aria-labelledby="sharing-heading"
          >
            <SocialShareButtons />
          </section>

          {/* Why Install Section */}
          <section
            className="bg-white dark:bg-stone-900 rounded-xl shadow-lg border border-stone-200 dark:border-stone-800 p-6"
            aria-labelledby="why-install-heading"
          >
            <div className="mb-6">
              <h2
                id="why-install-heading"
                className="text-xl font-bold text-green-700 dark:text-green-400"
              >
                Why Install the App?
              </h2>
              <p className="text-base text-stone-700 dark:text-stone-300 mt-2">
                Experience knowledge like never before with our dedicated app.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                    Always Up to Date
                  </h3>
                  <p className="text-base text-stone-700 dark:text-stone-300">
                    Automatic updates ensure you always have the latest content
                    and features.
                  </p>
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                    Privacy Focused
                  </h3>
                  <p className="text-base text-stone-700 dark:text-stone-300">
                    No tracking, no ads, no data collection. Just pure knowledge
                    and wisdom.
                  </p>
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                    Lightning Fast
                  </h3>
                  <p className="text-base text-stone-700 dark:text-stone-300">
                    Advanced caching technology makes searches and navigation
                    instant.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                    Complete Library
                  </h3>
                  <p className="text-base text-stone-700 dark:text-stone-300">
                    Full content collections with advanced search and
                    visualization capabilities.
                  </p>
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                    Beautiful Design
                  </h3>
                  <p className="text-base text-stone-700 dark:text-stone-300">
                    Elegant interface with dark mode support for comfortable
                    reading.
                  </p>
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                    Works Everywhere
                  </h3>
                  <p className="text-base text-stone-700 dark:text-stone-300">
                    Compatible with all devices and operating systems.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section
            className="bg-white dark:bg-stone-900 rounded-xl shadow-lg border border-stone-200 dark:border-stone-800 p-6"
            aria-labelledby="faq-heading"
          >
            <div className="mb-6">
              <h2
                id="faq-heading"
                className="text-xl font-bold text-green-700 dark:text-green-400"
              >
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              <details className="group border border-stone-200 dark:border-stone-700 rounded-lg p-4 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                <summary className="cursor-pointer text-lg font-semibold text-stone-900 dark:text-stone-100 hover:text-green-700 dark:hover:text-green-300 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-stone-900 rounded">
                  What is a Progressive Web App (PWA)?
                </summary>
                <p className="mt-3 text-base text-stone-700 dark:text-stone-300 leading-relaxed">
                  A PWA is a web application that works like a native app. It
                  can be installed on your device, works offline, and provides a
                  fast, app-like experience while being accessible from any web
                  browser.
                </p>
              </details>

              <details className="group border border-stone-200 dark:border-stone-700 rounded-lg p-4 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                <summary className="cursor-pointer text-lg font-semibold text-stone-900 dark:text-stone-100 hover:text-green-700 dark:hover:text-green-300 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-stone-900 rounded">
                  How much storage space does it require?
                </summary>
                <p className="mt-3 text-base text-stone-700 dark:text-stone-300 leading-relaxed">
                  The initial download is only about 2MB. Additional content is
                  cached as you use the app, but you can control how much space
                  it uses in your browser settings.
                </p>
              </details>

              <details className="group border border-stone-200 dark:border-stone-700 rounded-lg p-4 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                <summary className="cursor-pointer text-lg font-semibold text-stone-900 dark:text-stone-100 hover:text-green-700 dark:hover:text-green-300 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-stone-900 rounded">
                  Will it work without internet connection?
                </summary>
                <p className="mt-3 text-base text-stone-700 dark:text-stone-300 leading-relaxed">
                  Yes! Once installed, you can access previously viewed content
                  offline. The app intelligently caches content for offline
                  reading.
                </p>
              </details>

              <details className="group border border-stone-200 dark:border-stone-700 rounded-lg p-4 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                <summary className="cursor-pointer text-lg font-semibold text-stone-900 dark:text-stone-100 hover:text-green-700 dark:hover:text-green-300 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-stone-900 rounded">
                  Is my data safe and private?
                </summary>
                <p className="mt-3 text-base text-stone-700 dark:text-stone-300 leading-relaxed">
                  Absolutely. We don't collect personal data, track your usage,
                  or show ads. All your bookmarks and preferences are stored
                  locally on your device.
                </p>
              </details>

              <details className="group border border-stone-200 dark:border-stone-700 rounded-lg p-4 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                <summary className="cursor-pointer text-lg font-semibold text-stone-900 dark:text-stone-100 hover:text-green-700 dark:hover:text-green-300 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-stone-900 rounded">
                  How do I uninstall the app if needed?
                </summary>
                <p className="mt-3 text-base text-stone-700 dark:text-stone-300 leading-relaxed">
                  You can uninstall it like any other app from your device
                  settings, or simply remove it from your browser's installed
                  apps section. All data will be cleanly removed.
                </p>
              </details>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
