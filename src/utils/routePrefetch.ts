/**
 * Intelligent route prefetching utility
 * Preloads critical routes and components based on user behavior and network conditions
 */

interface PrefetchConfig {
  routes: string[];
  components: string[];
  delay: number;
  onlyOnWifi: boolean;
  prefetchOnHover: boolean;
  prefetchOnVisible: boolean;
}

interface PrefetchedRoute {
  route: string;
  timestamp: number;
  status: "loading" | "loaded" | "error";
}

class RoutePrefetcher {
  private prefetchedRoutes: Map<string, PrefetchedRoute> = new Map();
  private intersectionObserver: IntersectionObserver | null = null;
  private config: PrefetchConfig;
  private prefetchCache = new Set<string>();

  constructor(config: Partial<PrefetchConfig> = {}) {
    this.config = {
      routes: ["/search", "/charts", "/profile"],
      components: [],
      delay: 2000,
      onlyOnWifi: false,
      prefetchOnHover: true,
      prefetchOnVisible: true,
      ...config,
    };

    this.init();
  }

  /**
   * Initialize the prefetcher
   */
  private init(): void {
    // Check network conditions
    if (this.config.onlyOnWifi && !this.isWiFiConnection()) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("🌐 Prefetching disabled: Not on WiFi");
      }
      return;
    }

    // Setup intersection observer for visible link prefetching
    if (this.config.prefetchOnVisible) {
      this.setupIntersectionObserver();
    }

    // Setup hover prefetching
    if (this.config.prefetchOnHover) {
      this.setupHoverPrefetching();
    }

    // Start initial prefetching after delay
    setTimeout(() => {
      this.prefetchCriticalRoutes();
    }, this.config.delay);
  }

  /**
   * Check if user is on WiFi connection
   */
  private isWiFiConnection(): boolean {
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      return connection.effectiveType === "4g" || connection.type === "wifi";
    }
    return true; // Assume good connection if API not available
  }

  /**
   * Setup intersection observer for visible links
   */
  private setupIntersectionObserver(): void {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLAnchorElement;
            const href = link.href || link.getAttribute("data-prefetch");
            if (href) {
              this.prefetchRoute(this.getRouteFromHref(href));
            }
          }
        });
      },
      { rootMargin: "100px" }
    );

    // Observe existing links
    this.observeLinks();
  }

  /**
   * Setup hover-based prefetching
   */
  private setupHoverPrefetching(): void {
    document.addEventListener("mouseover", (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest(
        "a[href], [data-prefetch]"
      ) as HTMLAnchorElement;

      if (link) {
        const href = link.href || link.getAttribute("data-prefetch");
        if (href) {
          const route = this.getRouteFromHref(href);
          this.prefetchRoute(route);
        }
      }
    });
  }

  /**
   * Observe navigation links for intersection-based prefetching
   */
  private observeLinks(): void {
    const links = document.querySelectorAll("a[href], [data-prefetch]");
    links.forEach((link) => {
      this.intersectionObserver?.observe(link);
    });
  }

  /**
   * Prefetch critical routes immediately
   */
  private async prefetchCriticalRoutes(): Promise<void> {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("🚀 Starting critical route prefetching");
    }

    for (const route of this.config.routes) {
      await this.prefetchRoute(route);
      // Small delay between prefetches to avoid overwhelming the browser
      await this.delay(100);
    }
  }

  /**
   * Prefetch a specific route
   */
  public async prefetchRoute(route: string): Promise<void> {
    if (this.prefetchCache.has(route) || this.prefetchedRoutes.has(route)) {
      return;
    }

    this.prefetchCache.add(route);
    this.prefetchedRoutes.set(route, {
      route,
      timestamp: Date.now(),
      status: "loading",
    });

    try {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log(`🔄 Prefetching route: ${route}`);
      }

      // Prefetch the component
      await this.prefetchComponent(route);

      // Prefetch route-specific CSS
      await this.prefetchRouteCSS(route);

      // Prefetch route-specific data
      await this.prefetchRouteData(route);

      this.prefetchedRoutes.set(route, {
        route,
        timestamp: Date.now(),
        status: "loaded",
      });

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log(`✅ Prefetched route: ${route}`);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error(`❌ Failed to prefetch route ${route}:`, error);
      }
      this.prefetchedRoutes.set(route, {
        route,
        timestamp: Date.now(),
        status: "error",
      });
    }
  }

  /**
   * Prefetch route component
   */
  private async prefetchComponent(route: string): Promise<void> {
    const componentMap: { [key: string]: () => Promise<any> } = {
      "/search": () =>
        import("../components/features/search/AdvancedSearchDashboard"),
      "/charts": () => import("../components/features/charts/ChartsDashboard"),
      "/quran": () => import("../components/features/qurancard/QuranDashboard"),
      "/hadith": () =>
        import("../components/features/hadithcard/HadithDashboard"),
      "/profile": () => import("../pages/Profile"),
      "/favorites": () => import("../pages/Favorites"),
      "/login": () => import("../pages/Login"),
    };

    const componentLoader = componentMap[route];
    if (componentLoader) {
      await componentLoader();
    }
  }

  /**
   * Prefetch route-specific CSS
   */
  private async prefetchRouteCSS(route: string): Promise<void> {
    const cssMap: { [key: string]: string[] } = {
      "/search": ["/src/styles/components/search.css"],
      "/charts": ["/src/styles/components/charts.css"],
      "/profile": ["/src/styles/components/auth.css"],
    };

    const cssFiles = cssMap[route];
    if (cssFiles) {
      for (const cssFile of cssFiles) {
        await this.prefetchResource(cssFile, "style");
      }
    }
  }

  /**
   * Prefetch route-specific data
   */
  private async prefetchRouteData(route: string): Promise<void> {
    // Add route-specific data prefetching logic here
    // For example, prefetch API data that the route will need

    switch (route) {
      case "/charts":
        // Prefetch chart data if not already available
        break;
      case "/search":
        // Prefetch search indices
        break;
      case "/profile":
        // Prefetch user data
        break;
    }
  }

  /**
   * Prefetch a resource (CSS, JS, etc.)
   */
  private prefetchResource(href: string, as: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const existingLink = document.querySelector(`link[href="${href}"]`);
      if (existingLink) {
        resolve();
        return;
      }

      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = as;
      link.href = href;

      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to prefetch ${href}`));

      document.head.appendChild(link);
    });
  }

  /**
   * Extract route from href
   */
  private getRouteFromHref(href: string): string {
    try {
      const url = new URL(href, window.location.origin);
      return url.pathname;
    } catch {
      return href;
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get prefetch statistics
   */
  public getStats() {
    const stats = {
      total: this.prefetchedRoutes.size,
      loaded: 0,
      loading: 0,
      errors: 0,
    };

    for (const [, route] of this.prefetchedRoutes) {
      stats[
        route.status === "loaded"
          ? "loaded"
          : route.status === "loading"
          ? "loading"
          : "errors"
      ]++;
    }

    return stats;
  }

  /**
   * Clear prefetch cache
   */
  public clearCache(): void {
    this.prefetchedRoutes.clear();
    this.prefetchCache.clear();
  }

  /**
   * Update observed links (call when DOM changes)
   */
  public updateObservedLinks(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.observeLinks();
    }
  }

  /**
   * Destroy the prefetcher
   */
  public destroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    this.clearCache();
  }
}

// Create singleton instance
const routePrefetcher = new RoutePrefetcher({
  routes: ["/search", "/charts", "/quran", "/hadith"],
  delay: 3000, // Wait 3 seconds after page load
  onlyOnWifi: true, // Only prefetch on good connections
  prefetchOnHover: true,
  prefetchOnVisible: true,
});

// Export utilities
export const prefetchRoute = (route: string) =>
  routePrefetcher.prefetchRoute(route);
export const getPrefetchStats = () => routePrefetcher.getStats();
export const updateObservedLinks = () => routePrefetcher.updateObservedLinks();
export const clearPrefetchCache = () => routePrefetcher.clearCache();

export default routePrefetcher;
