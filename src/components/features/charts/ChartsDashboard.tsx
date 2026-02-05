import React, { useState, useRef, memo } from "react";
import { PropheticStatusChart } from "./PropheticStatusChart";
import { SpatialProphecyMap } from "./SpatialProphecyMap";
import { CategoryPieChart } from "./CategoryPieChart";
import { useSanitizedData } from "../../../hooks/useSanitizedData";
import type { IslamicData } from "../../../types/Types";

interface ChartsDashboardProps {
  readonly data: readonly IslamicData[];
}

interface ChartConfig {
  readonly id: string;
  readonly title: string;
  readonly component: React.ComponentType<{
    readonly data: readonly IslamicData[];
  }>;
  readonly ref: React.RefObject<HTMLDivElement>;
  readonly notes: string;
}

// Memoized ChartsDashboard for better performance with large datasets
export const ChartsDashboard: React.FC<ChartsDashboardProps> = memo(
  ({ data }) => {
    // Use sanitized data for charts
    const sanitizedData = useSanitizedData([...data]);

    // Debug logging
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("ChartsDashboard - Received data:", data);
      // eslint-disable-next-line no-console
      console.log("ChartsDashboard - Data length:", data.length);
      // eslint-disable-next-line no-console
      console.log("ChartsDashboard - Sanitized data:", sanitizedData);
    }

    const [viewMode, setViewMode] = useState<"single" | "overview">("overview");
    const [activeChart, setActiveChart] = useState<string>("all");

    // Create refs for each chart section for auto-scrolling
    const categoryChartRef = useRef<HTMLDivElement>(null);
    const statusChartRef = useRef<HTMLDivElement>(null);
    const geographicChartRef = useRef<HTMLDivElement>(null);
    const singleViewRef = useRef<HTMLDivElement>(null);

    const charts: readonly ChartConfig[] = [
      {
        id: "category-pie",
        title: "Category Distribution",
        component: CategoryPieChart,
        ref: categoryChartRef,
        notes:
          "This chart shows how the Islamic data is organized into different types: Prophecy (future predictions), Science (scientific facts), Health (nutrition and medical practices), and Traditional Medicine (traditional healing practices). The percentages show what portion of the data falls into each category. Hover over the chart to see exact counts and percentages.",
      },
      {
        id: "status",
        title: "Status Distribution",
        component: PropheticStatusChart,
        ref: statusChartRef,
        notes:
          "This chart shows what type of information each entry contains: Fulfilled (prophecies that have come true), Yet to Happen (prophecies still waiting), Proven (scientific facts confirmed by research), Documented (authentic hadith and traditional practices), and Ongoing Research (claims being actively studied). This helps you see how much of the data represents completed vs. ongoing prophecies and traditional knowledge.",
      },
      {
        id: "geographic",
        title: "Geographic Distribution",
        component: SpatialProphecyMap,
        ref: geographicChartRef,
        notes:
          "This chart organizes the data by topic and location: Social (music, entertainment, ignorance), Natural (honey, dates, food), Cosmological (space, universe, iron), Global (worldwide events, environmental), and Middle East (Mecca, Medina). Each card shows how many entries belong to that category and examples of the data.",
      },
    ];

    // Handle chart click with scroll functionality
    const handleChartClick = (chartId: string): void => {
      setActiveChart(chartId);
      setViewMode("single");

      // Scroll to the relevant chart section with better timing and positioning
      setTimeout(() => {
        // In single view mode, scroll to the single view container
        if (singleViewRef.current) {
          const element = singleViewRef.current;
          const rect = element.getBoundingClientRect();
          const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;

          // Calculate the target scroll position
          const targetScrollTop = scrollTop + rect.top - 100; // 100px offset from top

          // Smooth scroll to the target position
          window.scrollTo({
            top: targetScrollTop,
            behavior: "smooth",
          });
        }
      }, 150); // Increased delay to ensure view mode change is complete
    };

    const handleBackToOverview = (): void => {
      setViewMode("overview");
      setActiveChart("all");
    };

    if (viewMode === "single" && activeChart !== "all") {
      const selectedChart = charts.find((chart) => chart.id === activeChart);
      if (!selectedChart) return null;

      const ChartComponent = selectedChart.component;

      return (
        <div className="space-y-6" ref={singleViewRef}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-200">
              {selectedChart.title}
            </h2>
            <button
              onClick={handleBackToOverview}
              className="px-4 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-700 transition-colors"
            >
              Back to All Charts
            </button>
          </div>
          <ChartComponent data={sanitizedData as IslamicData[]} />

          {/* Chart Notes */}
          <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-3">
              About This Chart
            </h3>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              {selectedChart.notes}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-200">
            Data Visualizations
          </h2>
          <div className="flex flex-wrap gap-2">
            {charts.map((chart) => (
              <button
                key={chart.id}
                onClick={() => {
                  // Always switch to single view mode when clicking a chart tab
                  handleChartClick(chart.id);
                }}
                className="px-3 py-1 text-sm bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-md hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
              >
                {chart.title}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {charts.map((chart) => {
            const ChartComponent = chart.component;
            return (
              <div key={chart.id} className="w-full" ref={chart.ref}>
                <ChartComponent data={sanitizedData as IslamicData[]} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
