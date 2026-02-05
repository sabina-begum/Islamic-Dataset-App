/**
 * Dynamic CSS loading utility for component-based code splitting
 * Enables loading CSS files only when needed for performance optimization
 */

interface LoadedStylesheets {
  [key: string]: HTMLLinkElement;
}

// Track loaded stylesheets to prevent duplicates
const loadedStylesheets: LoadedStylesheets = {};

/**
 * Dynamically load a CSS file
 * @param href - The CSS file path
 * @param id - Unique identifier for the stylesheet
 * @returns Promise that resolves when CSS is loaded
 */
export const loadCSS = (href: string, id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (loadedStylesheets[id]) {
      resolve();
      return;
    }

    // Check if stylesheet already exists in DOM
    const existingLink = document.getElementById(id) as HTMLLinkElement;
    if (existingLink) {
      loadedStylesheets[id] = existingLink;
      resolve();
      return;
    }

    // Create new link element
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.id = id;

    // Handle successful load
    link.onload = () => {
      loadedStylesheets[id] = link;
      resolve();
    };

    // Handle load error
    link.onerror = () => {
      reject(new Error(`Failed to load CSS: ${href}`));
    };

    // Add to document head
    document.head.appendChild(link);
  });
};

/**
 * Remove a dynamically loaded CSS file
 * @param id - Unique identifier for the stylesheet
 */
export const unloadCSS = (id: string): void => {
  const link = loadedStylesheets[id];
  if (link && link.parentNode) {
    link.parentNode.removeChild(link);
    delete loadedStylesheets[id];
  }
};

/**
 * Preload CSS file for faster loading
 * @param href - The CSS file path
 * @param id - Unique identifier for the stylesheet
 */
export const preloadCSS = (href: string, id: string): void => {
  // Check if already loaded or preloaded
  if (loadedStylesheets[id] || document.getElementById(`preload-${id}`)) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "style";
  link.href = href;
  link.id = `preload-${id}`;

  // Convert preload to stylesheet when needed
  link.onload = () => {
    link.rel = "stylesheet";
    link.id = id;
    loadedStylesheets[id] = link;
  };

  document.head.appendChild(link);
};

/**
 * Component-specific CSS loaders
 */
export const ComponentCSS = {
  // Chart components
  loadChartCSS: () =>
    loadCSS("/src/styles/components/charts.css", "charts-css"),

  // Search components
  loadSearchCSS: () =>
    loadCSS("/src/styles/components/search.css", "search-css"),

  // Card components
  loadCardCSS: () => loadCSS("/src/styles/components/cards.css", "cards-css"),

  // Auth components
  loadAuthCSS: () => loadCSS("/src/styles/components/auth.css", "auth-css"),

  // Dashboard components
  loadDashboardCSS: () =>
    loadCSS("/src/styles/components/dashboard.css", "dashboard-css"),
};

/**
 * Route-specific CSS loaders
 */
export const RouteCSS = {
  // Home page
  loadHomeCSS: () =>
    Promise.all([
      ComponentCSS.loadCardCSS(),
      loadCSS("/src/styles/pages/home.css", "home-css"),
    ]),

  // Search page
  loadSearchPageCSS: () =>
    Promise.all([
      ComponentCSS.loadSearchCSS(),
      ComponentCSS.loadCardCSS(),
      loadCSS("/src/styles/pages/search.css", "search-page-css"),
    ]),

  // Charts page
  loadChartsPageCSS: () =>
    Promise.all([
      ComponentCSS.loadChartCSS(),
      loadCSS("/src/styles/pages/charts.css", "charts-page-css"),
    ]),

  // Profile page
  loadProfilePageCSS: () =>
    Promise.all([
      ComponentCSS.loadAuthCSS(),
      loadCSS("/src/styles/pages/profile.css", "profile-css"),
    ]),
};

/**
 * Critical CSS inlining utility
 */
export const inlineCriticalCSS = async (): Promise<void> => {
  try {
    const response = await fetch("/src/styles/critical.css");
    const css = await response.text();

    const style = document.createElement("style");
    style.id = "critical-css";
    style.textContent = css;

    // Insert before other stylesheets
    const firstLink = document.head.querySelector('link[rel="stylesheet"]');
    if (firstLink) {
      document.head.insertBefore(style, firstLink);
    } else {
      document.head.appendChild(style);
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn("Failed to inline critical CSS:", error);
    }
  }
};

/**
 * Performance monitoring for CSS loading
 */
export const monitorCSSPerformance = (): void => {
  if ("performance" in window && "measure" in performance) {
    // Monitor CSS load times
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resourceEntry = entry as any; // Resource entries have additional properties
        if (
          resourceEntry.initiatorType === "link" &&
          resourceEntry.name.includes(".css")
        ) {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log(
              `CSS loaded: ${
                resourceEntry.name
              } (${resourceEntry.duration.toFixed(2)}ms)`
            );
          }
        }
      }
    }).observe({ entryTypes: ["resource"] });
  }
};

/**
 * Clean up unused CSS based on current route
 */
export const cleanupUnusedCSS = (currentRoute: string): void => {
  const routeCSSMap: { [key: string]: string[] } = {
    "/": ["home-css", "cards-css"],
    "/search": ["search-css", "search-page-css", "cards-css"],
    "/charts": ["charts-css", "charts-page-css"],
    "/profile": ["auth-css", "profile-css"],
  };

  const currentCSS = routeCSSMap[currentRoute] || [];

  // Remove CSS that's not needed for current route
  Object.keys(loadedStylesheets).forEach((id) => {
    if (!currentCSS.includes(id) && !id.includes("critical")) {
      unloadCSS(id);
    }
  });
};

export default {
  loadCSS,
  unloadCSS,
  preloadCSS,
  ComponentCSS,
  RouteCSS,
  inlineCriticalCSS,
  monitorCSSPerformance,
  cleanupUnusedCSS,
};
