import React, { useContext, useMemo, useState, memo } from "react";
import { ResponsivePie } from "@nivo/pie";
import type { ComputedDatum } from "@nivo/pie";
import type { IslamicData } from "../../../types/Types";
import { DataTypeEnum } from "../../../types/Types";
import { DarkModeContext } from "../../../types/ContextTypes";
import { getChartTheme } from "./chartTheme";
import { useResponsive } from "../../../hooks/useResponsive";

interface CategoryPieChartProps {
  readonly data: readonly IslamicData[];
}

interface ChartDataPoint {
  readonly id: string;
  readonly label: string;
  readonly value: number;
}

interface ChartTooltipState {
  readonly datum: {
    readonly id: string | number;
    readonly value: number;
    readonly color: string;
    readonly label: string;
  };
  readonly x: number;
  readonly y: number;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = memo(
  ({ data }) => {
    const darkModeContext = useContext(DarkModeContext);
    const isDarkMode = darkModeContext?.isDarkMode ?? false;
    const chartTheme = getChartTheme(isDarkMode);
    const isMobile = useResponsive();
    const [tooltip, setTooltip] = useState<ChartTooltipState | null>(null);

    const chartData: readonly ChartDataPoint[] = useMemo(() => {
      const categoryCounts = data.reduce((acc, item) => {
        const category = item.type || "Unknown";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(categoryCounts).map(([category, value]) => ({
        id: category.charAt(0).toUpperCase() + category.slice(1),
        label: category.charAt(0).toUpperCase() + category.slice(1),
        value,
      }));
    }, [data]);

    const getColor = (pieSlice: { readonly id: string | number }): string => {
      const type = pieSlice.id.toString().toLowerCase();

      switch (type) {
        case DataTypeEnum.PROPHECY:
          return "#ef4444";
        case DataTypeEnum.SCIENTIFIC:
          return "#3b82f6";
        case DataTypeEnum.HEALTH:
          return "#10b981";
        case DataTypeEnum.TRADITIONAL_TREATMENTS:
          return "#f59e0b"; // amber/orange for traditional treatments
        default:
          return "#6b7280";
      }
    };

    const chartMargins = isMobile
      ? { top: 20, right: 20, bottom: 20, left: 20 }
      : { top: 40, right: 80, bottom: 80, left: 80 };

    return (
      <div className="w-full h-96 md:h-[28rem] bg-white dark:bg-stone-800 rounded-xl shadow-lg p-4 flex flex-col relative">
        <h3 className="text-lg font-bold text-green-700 dark:text-green-400 mb-4">
          Featured Islamic Data Category Distribution
        </h3>

        <div className="flex-grow">
          <ResponsivePie
            data={chartData}
            theme={chartTheme}
            margin={chartMargins}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            colors={getColor}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            arcLinkLabelsSkipAngle={15}
            arcLinkLabelsTextColor={isDarkMode ? "#f0f0f0" : "#333333"}
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={15}
            arcLabelsTextColor={isDarkMode ? "#f0f0f0" : "#333333"}
            enableArcLinkLabels={true}
            enableArcLabels={true}
            onMouseEnter={(datum: ComputedDatum<ChartDataPoint>, event) => {
              setTooltip({
                datum: {
                  id: datum.id as string | number,
                  value: datum.value,
                  color: datum.color,
                  label: datum.label as string,
                },
                x: event.clientX,
                y: event.clientY,
              });
            }}
            onMouseLeave={() => {
              setTooltip(null);
            }}
            animate={true}
          />
        </div>

        {/* Custom tooltip */}
        {tooltip && (
          <div
            style={{
              position: "fixed",
              left: tooltip.x + 10,
              top: tooltip.y - 10,
              background: isDarkMode ? "#1f2937" : "#ffffff",
              border: `2px solid ${isDarkMode ? "#4b5563" : "#e5e7eb"}`,
              borderRadius: "8px",
              padding: "12px",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              color: isDarkMode ? "#f9fafb" : "#111827",
              fontSize: "14px",
              fontWeight: "600",
              zIndex: 9999,
              pointerEvents: "none",
              minWidth: "160px",
            }}
          >
            <div
              style={{
                color: tooltip.datum.color,
                marginBottom: "6px",
                fontWeight: "700",
              }}
            >
              {tooltip.datum.id}
            </div>
            <div style={{ fontSize: "13px", marginBottom: "4px" }}>
              Count: {tooltip.datum.value} entries
            </div>
            <div
              style={{ fontSize: "12px", opacity: 0.8, marginBottom: "4px" }}
            >
              {(
                (tooltip.datum.value /
                  chartData.reduce((sum, item) => sum + item.value, 0)) *
                100
              ).toFixed(1)}
              % of total data
            </div>
            <div
              style={{ fontSize: "11px", opacity: 0.7, fontStyle: "italic" }}
            >
              {tooltip.datum.id === "Prophecy" &&
                "Prophecies relayed by Prophet Muhammad (ﷺ)"}
              {tooltip.datum.id === "Scientific" &&
                "Scientific facts and discoveries mentioned in Islamic texts"}
              {tooltip.datum.id === "Health" &&
                "Health benefits, nutrition, and medical practices from Islamic tradition"}
              {(tooltip.datum.id === "Traditional-treatments" ||
                tooltip.datum.id === "Traditional-treatments") &&
                "Traditional Islamic healing methods and remedies"}
              {tooltip.datum.id === "Unknown" &&
                "Entries with unclassified or missing category"}
            </div>
          </div>
        )}
      </div>
    );
  }
);
