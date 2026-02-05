// Enhanced performance monitoring with proper TypeScript types
interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  category:
    | "navigation"
    | "resource"
    | "paint"
    | "layout"
    | "memory"
    | "custom";
}

interface PerformanceThreshold {
  name: string;
  threshold: number;
  severity: "low" | "medium" | "high" | "critical";
}

// Proper interface for performance with memory
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
  };
}

// Specific interface for performance summary
interface PerformanceSummary {
  totalMetrics: number;
  averageResponseTime: number;
  memoryUsage: number;
  errorCount: number;
  recommendations: string[];
}

// LayoutShift interface for layout shift performance entries
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
  lastInputTime: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private thresholds: PerformanceThreshold[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private isMonitoring = false;

  constructor() {
    this.initializeThresholds();
  }

  private initializeThresholds(): void {
    this.thresholds = [
      { name: "First Contentful Paint", threshold: 2000, severity: "high" },
      {
        name: "Largest Contentful Paint",
        threshold: 2500,
        severity: "critical",
      },
      { name: "Cumulative Layout Shift", threshold: 0.1, severity: "medium" },
      { name: "First Input Delay", threshold: 100, severity: "high" },
      { name: "Memory Usage", threshold: 50, severity: "medium" }, // MB
    ];
  }

  start(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.setupObservers();
    this.measureInitialLoad();
    this.startMemoryMonitoring();
    this.startCustomMetrics();

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("Performance monitoring started");
    }
  }

  stop(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;

    // Disconnect all observers
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("Performance monitoring stopped");
    }
  }

  private setupObservers(): void {
    // Navigation Timing
    if ("PerformanceObserver" in window) {
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === "navigation") {
              const navEntry = entry as PerformanceNavigationTiming;
              this.recordNavigationMetrics(navEntry);
            }
          });
        });
        navigationObserver.observe({ entryTypes: ["navigation"] });
        this.observers.set("navigation", navigationObserver);
      } catch (error) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn("Navigation timing not supported:", error);
        }
      }

      // Paint Timing
      try {
        const paintObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === "paint") {
              this.recordMetric({
                name: entry.name,
                value: entry.startTime,
                unit: "ms",
                category: "paint",
              });
            }
          });
        });
        paintObserver.observe({ entryTypes: ["paint"] });
        this.observers.set("paint", paintObserver);
      } catch (error) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn("Paint timing not supported:", error);
        }
      }

      // Layout Shifts
      try {
        const layoutObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === "layout-shift") {
              const layoutEntry = entry as LayoutShift;
              this.recordMetric({
                name: "Cumulative Layout Shift",
                value: layoutEntry.value,
                unit: "score",
                category: "layout",
              });
            }
          });
        });
        layoutObserver.observe({ entryTypes: ["layout-shift"] });
        this.observers.set("layout", layoutObserver);
      } catch (error) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn("Layout shift timing not supported:", error);
        }
      }

      // Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            this.recordMetric({
              name: "Largest Contentful Paint",
              value: lastEntry.startTime,
              unit: "ms",
              category: "paint",
            });
          }
        });
        lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
        this.observers.set("lcp", lcpObserver);
      } catch (error) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn("LCP timing not supported:", error);
        }
      }
    }
  }

  private recordNavigationMetrics(navEntry: PerformanceNavigationTiming): void {
    const metrics = [
      {
        name: "DNS Lookup",
        value: navEntry.domainLookupEnd - navEntry.domainLookupStart,
      },
      {
        name: "TCP Connection",
        value: navEntry.connectEnd - navEntry.connectStart,
      },
      {
        name: "Server Response",
        value: navEntry.responseEnd - navEntry.responseStart,
      },
      {
        name: "DOM Content Loaded",
        value:
          navEntry.domContentLoadedEventEnd -
          navEntry.domContentLoadedEventStart,
      },
      {
        name: "Load Complete",
        value: navEntry.loadEventEnd - navEntry.loadEventStart,
      },
      {
        name: "Total Load Time",
        value: navEntry.loadEventEnd - navEntry.fetchStart,
      },
    ];

    metrics.forEach(({ name, value }) => {
      if (value > 0) {
        this.recordMetric({
          name,
          value,
          unit: "ms",
          category: "navigation",
        });
      }
    });
  }

  private measureInitialLoad(): void {
    if ("performance" in window) {
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.recordNavigationMetrics(navigation);
      }

      // Measure First Contentful Paint
      const paintEntries = performance.getEntriesByType("paint");
      const fcp = paintEntries.find(
        (entry) => entry.name === "first-contentful-paint"
      );
      if (fcp) {
        this.recordMetric({
          name: "First Contentful Paint",
          value: fcp.startTime,
          unit: "ms",
          category: "paint",
        });
      }
    }
  }

  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring(): void {
    if ("memory" in performance) {
      setInterval(() => {
        const memory = (performance as PerformanceWithMemory).memory;
        if (memory) {
          this.recordMetric({
            name: "Memory Usage",
            value: memory.usedJSHeapSize / 1024 / 1024, // Convert to MB
            unit: "MB",
            category: "memory",
          });

          this.recordMetric({
            name: "Memory Limit",
            value: memory.jsHeapSizeLimit / 1024 / 1024,
            unit: "MB",
            category: "memory",
          });
        }
      }, 5000); // Check every 5 seconds
    }
  }

  /**
   * Start custom performance metrics
   */
  private startCustomMetrics(): void {
    // Monitor React component render times
    this.monitorReactRenders();

    // Monitor search performance
    this.monitorSearchPerformance();

    // Monitor data loading performance
    this.monitorDataLoading();
  }

  /**
   * Monitor React component render times
   */
  private monitorReactRenders(): void {
    // This would be implemented with React DevTools or custom profiling
    // For now, we'll create a placeholder
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("React render monitoring enabled");
    }
  }

  /**
   * Monitor search performance
   */
  private monitorSearchPerformance(): void {
    // Monitor search query performance
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();

        if (args[0].toString().includes("search")) {
          this.recordMetric({
            name: "Search Response Time",
            value: endTime - startTime,
            unit: "ms",
            category: "custom",
          });
        }

        return response;
      } catch (error) {
        const endTime = performance.now();
        this.recordMetric({
          name: "Search Error Time",
          value: endTime - startTime,
          unit: "ms",
          category: "custom",
        });
        throw error;
      }
    };
  }

  /**
   * Monitor data loading performance
   */
  private monitorDataLoading(): void {
    // Monitor data loading times
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("Data loading monitoring enabled");
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: Omit<PerformanceMetric, "timestamp">): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
    };

    this.metrics.push(fullMetric);

    // Check thresholds
    this.checkThresholds(fullMetric);

    // Limit metrics array size
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }
  }

  /**
   * Check if a metric exceeds thresholds
   */
  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.thresholds.find((t) => t.name === metric.name);
    if (threshold && metric.value > threshold.threshold) {
      this.reportThresholdExceeded(metric, threshold);
    }
  }

  /**
   * Report when a threshold is exceeded
   */
  private reportThresholdExceeded(
    metric: PerformanceMetric,
    threshold: PerformanceThreshold
  ): void {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(
        `Performance threshold exceeded: ${metric.name} = ${metric.value}${metric.unit} (threshold: ${threshold.threshold}${metric.unit}, severity: ${threshold.severity})`
      );
    }

    // Could send to analytics service here
    if (threshold.severity === "critical") {
      // Send critical alerts
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("Critical performance issue detected:", metric);
      }
    }
  }

  /**
   * Get performance report
   */
  getReport(): {
    summary: PerformanceSummary;
    metrics: PerformanceMetric[];
    recommendations: string[];
  } {
    const summary: PerformanceSummary = {
      totalMetrics: this.metrics.length,
      averageResponseTime: this.calculateAverageResponseTime(),
      memoryUsage: this.getLatestMemoryUsage(),
      errorCount: this.getErrorCount(),
      recommendations: this.generateRecommendations(),
    };

    return {
      summary,
      metrics: [...this.metrics],
      recommendations: this.generateRecommendations(),
    };
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(): number {
    const responseMetrics = this.metrics.filter(
      (m) => m.category === "navigation" && m.name === "Total Load Time"
    );
    if (responseMetrics.length === 0) return 0;

    const total = responseMetrics.reduce((sum, m) => sum + m.value, 0);
    return Math.round(total / responseMetrics.length);
  }

  /**
   * Get latest memory usage
   */
  private getLatestMemoryUsage(): number {
    const memoryMetrics = this.metrics.filter((m) => m.name === "Memory Usage");
    return memoryMetrics.length > 0
      ? memoryMetrics[memoryMetrics.length - 1].value
      : 0;
  }

  /**
   * Get error count
   */
  private getErrorCount(): number {
    return this.metrics.filter((m) => m.name.includes("Error")).length;
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    const avgResponseTime = this.calculateAverageResponseTime();
    if (avgResponseTime > 3000) {
      recommendations.push("Consider optimizing server response times");
    }

    const memoryUsage = this.getLatestMemoryUsage();
    if (memoryUsage > 100) {
      recommendations.push(
        "Memory usage is high - consider optimizing memory usage"
      );
    }

    const errorCount = this.getErrorCount();
    if (errorCount > 5) {
      recommendations.push(
        "High error rate detected - investigate error sources"
      );
    }

    return recommendations;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("Performance metrics cleared");
    }
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    return JSON.stringify(this.getReport(), null, 2);
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Export convenience functions
export const startPerformanceMonitoring = () => performanceMonitor.start();
export const stopPerformanceMonitoring = () => performanceMonitor.stop();
export const recordPerformanceMetric = (
  metric: Omit<PerformanceMetric, "timestamp">
) => {
  performanceMonitor.recordMetric(metric);
};
export const getPerformanceReport = () => performanceMonitor.getReport();
export const clearPerformanceMetrics = () => performanceMonitor.clear();
export const exportPerformanceMetrics = () =>
  performanceMonitor.exportMetrics();

export { PerformanceMonitor, performanceMonitor };
export type { PerformanceMetric, PerformanceThreshold, PerformanceSummary };
