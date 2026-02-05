import React from "react";
import type { IslamicData } from "../../../types/Types";

interface SpatialProphecyMapProps {
  data: readonly IslamicData[];
  isActive?: boolean;
}

interface LocationData {
  id: string;
  label: string;
  value: number;
  prophecies: string[];
}

export const SpatialProphecyMap: React.FC<SpatialProphecyMapProps> = ({
  data,
  isActive = false,
}) => {
  // Include ALL data types, not just specific ones
  const allData = data;

  // Define comprehensive geographic locations and their associated data
  const locations: LocationData[] = [
    {
      id: "middle-east",
      label: "Middle East",
      value: allData.filter(
        (item) =>
          item.title.toLowerCase().includes("palestine") ||
          item.title.toLowerCase().includes("jerusalem") ||
          item.title.toLowerCase().includes("israel") ||
          item.title.toLowerCase().includes("mecca") ||
          item.title.toLowerCase().includes("medina") ||
          item.title.toLowerCase().includes("yemen") ||
          item.title.toLowerCase().includes("aden")
      ).length,
      prophecies: allData
        .filter(
          (item) =>
            item.title.toLowerCase().includes("palestine") ||
            item.title.toLowerCase().includes("jerusalem") ||
            item.title.toLowerCase().includes("israel") ||
            item.title.toLowerCase().includes("mecca") ||
            item.title.toLowerCase().includes("medina") ||
            item.title.toLowerCase().includes("yemen") ||
            item.title.toLowerCase().includes("aden")
        )
        .map((item) => item.title),
    },
    {
      id: "global",
      label: "Global",
      value: allData.filter(
        (item) =>
          item.title.toLowerCase().includes("global") ||
          item.title.toLowerCase().includes("worldwide") ||
          item.title.toLowerCase().includes("environmental") ||
          item.title.toLowerCase().includes("climate") ||
          item.title.toLowerCase().includes("world")
      ).length,
      prophecies: allData
        .filter(
          (item) =>
            item.title.toLowerCase().includes("global") ||
            item.title.toLowerCase().includes("worldwide") ||
            item.title.toLowerCase().includes("environmental") ||
            item.title.toLowerCase().includes("climate") ||
            item.title.toLowerCase().includes("world")
        )
        .map((item) => item.title),
    },
    {
      id: "cosmological",
      label: "Cosmological",
      value: allData.filter(
        (item) =>
          item.title.toLowerCase().includes("space") ||
          item.title.toLowerCase().includes("cosmos") ||
          item.title.toLowerCase().includes("universe") ||
          item.title.toLowerCase().includes("iron") ||
          item.title.toLowerCase().includes("embryo") ||
          item.title.toLowerCase().includes("development") ||
          item.title.toLowerCase().includes("barrier") ||
          item.title.toLowerCase().includes("water")
      ).length,
      prophecies: allData
        .filter(
          (item) =>
            item.title.toLowerCase().includes("space") ||
            item.title.toLowerCase().includes("cosmos") ||
            item.title.toLowerCase().includes("universe") ||
            item.title.toLowerCase().includes("iron") ||
            item.title.toLowerCase().includes("embryo") ||
            item.title.toLowerCase().includes("development") ||
            item.title.toLowerCase().includes("barrier") ||
            item.title.toLowerCase().includes("water")
        )
        .map((item) => item.title),
    },
    {
      id: "social",
      label: "Social",
      value: allData.filter(
        (item) =>
          item.title.toLowerCase().includes("music") ||
          item.title.toLowerCase().includes("entertainment") ||
          item.title.toLowerCase().includes("ignorance") ||
          item.title.toLowerCase().includes("social")
      ).length,
      prophecies: allData
        .filter(
          (item) =>
            item.title.toLowerCase().includes("music") ||
            item.title.toLowerCase().includes("entertainment") ||
            item.title.toLowerCase().includes("ignorance") ||
            item.title.toLowerCase().includes("social")
        )
        .map((item) => item.title),
    },
    {
      id: "natural",
      label: "Natural",
      value: allData.filter(
        (item) =>
          item.title.toLowerCase().includes("honey") ||
          item.title.toLowerCase().includes("dates") ||
          item.title.toLowerCase().includes("barley") ||
          item.title.toLowerCase().includes("olive") ||
          item.title.toLowerCase().includes("natural") ||
          item.title.toLowerCase().includes("food") ||
          item.title.toLowerCase().includes("nutrition")
      ).length,
      prophecies: allData
        .filter(
          (item) =>
            item.title.toLowerCase().includes("honey") ||
            item.title.toLowerCase().includes("dates") ||
            item.title.toLowerCase().includes("barley") ||
            item.title.toLowerCase().includes("olive") ||
            item.title.toLowerCase().includes("natural") ||
            item.title.toLowerCase().includes("food") ||
            item.title.toLowerCase().includes("nutrition")
        )
        .map((item) => item.title),
    },
    {
      id: "traditional-treatments",
      label: "Traditional Treatments",
      value: allData.filter((item) => item.type === "traditional-treatments")
        .length,
      prophecies: allData
        .filter((item) => item.type === "traditional-treatments")
        .map((item) => item.title),
    },
    {
      id: "health",
      label: "Health & Wellness",
      value: allData.filter((item) => item.type === "health").length,
      prophecies: allData
        .filter((item) => item.type === "health")
        .map((item) => item.title),
    },
    {
      id: "scientific",
      label: "Scientific Discoveries",
      value: allData.filter((item) => item.type === "scientific").length,
      prophecies: allData
        .filter((item) => item.type === "scientific")
        .map((item) => item.title),
    },
    {
      id: "prophecy",
      label: "Prophecies",
      value: allData.filter((item) => item.type === "prophecy").length,
      prophecies: allData
        .filter((item) => item.type === "prophecy")
        .map((item) => item.title),
    },
    {
      id: "other",
      label: "Other Topics",
      value: allData.filter(
        (item) =>
          !item.title.toLowerCase().includes("palestine") &&
          !item.title.toLowerCase().includes("jerusalem") &&
          !item.title.toLowerCase().includes("israel") &&
          !item.title.toLowerCase().includes("mecca") &&
          !item.title.toLowerCase().includes("medina") &&
          !item.title.toLowerCase().includes("yemen") &&
          !item.title.toLowerCase().includes("aden") &&
          !item.title.toLowerCase().includes("global") &&
          !item.title.toLowerCase().includes("worldwide") &&
          !item.title.toLowerCase().includes("environmental") &&
          !item.title.toLowerCase().includes("climate") &&
          !item.title.toLowerCase().includes("world") &&
          !item.title.toLowerCase().includes("space") &&
          !item.title.toLowerCase().includes("cosmos") &&
          !item.title.toLowerCase().includes("universe") &&
          !item.title.toLowerCase().includes("iron") &&
          !item.title.toLowerCase().includes("embryo") &&
          !item.title.toLowerCase().includes("development") &&
          !item.title.toLowerCase().includes("barrier") &&
          !item.title.toLowerCase().includes("water") &&
          !item.title.toLowerCase().includes("music") &&
          !item.title.toLowerCase().includes("entertainment") &&
          !item.title.toLowerCase().includes("ignorance") &&
          !item.title.toLowerCase().includes("social") &&
          !item.title.toLowerCase().includes("jesus") &&
          !item.title.toLowerCase().includes("isa") &&
          !item.title.toLowerCase().includes("honey") &&
          !item.title.toLowerCase().includes("dates") &&
          !item.title.toLowerCase().includes("barley") &&
          !item.title.toLowerCase().includes("olive") &&
          !item.title.toLowerCase().includes("natural") &&
          !item.title.toLowerCase().includes("food") &&
          !item.title.toLowerCase().includes("nutrition") &&
          item.type !== "traditional-treatments" &&
          item.type !== "health" &&
          item.type !== "scientific" &&
          item.type !== "prophecy"
      ).length,
      prophecies: allData
        .filter(
          (item) =>
            !item.title.toLowerCase().includes("palestine") &&
            !item.title.toLowerCase().includes("jerusalem") &&
            !item.title.toLowerCase().includes("israel") &&
            !item.title.toLowerCase().includes("mecca") &&
            !item.title.toLowerCase().includes("medina") &&
            !item.title.toLowerCase().includes("yemen") &&
            !item.title.toLowerCase().includes("aden") &&
            !item.title.toLowerCase().includes("global") &&
            !item.title.toLowerCase().includes("worldwide") &&
            !item.title.toLowerCase().includes("environmental") &&
            !item.title.toLowerCase().includes("climate") &&
            !item.title.toLowerCase().includes("world") &&
            !item.title.toLowerCase().includes("space") &&
            !item.title.toLowerCase().includes("cosmos") &&
            !item.title.toLowerCase().includes("universe") &&
            !item.title.toLowerCase().includes("iron") &&
            !item.title.toLowerCase().includes("embryo") &&
            !item.title.toLowerCase().includes("development") &&
            !item.title.toLowerCase().includes("barrier") &&
            !item.title.toLowerCase().includes("water") &&
            !item.title.toLowerCase().includes("music") &&
            !item.title.toLowerCase().includes("entertainment") &&
            !item.title.toLowerCase().includes("ignorance") &&
            !item.title.toLowerCase().includes("social") &&
            !item.title.toLowerCase().includes("jesus") &&
            !item.title.toLowerCase().includes("isa") &&
            !item.title.toLowerCase().includes("honey") &&
            !item.title.toLowerCase().includes("dates") &&
            !item.title.toLowerCase().includes("barley") &&
            !item.title.toLowerCase().includes("olive") &&
            !item.title.toLowerCase().includes("natural") &&
            !item.title.toLowerCase().includes("food") &&
            !item.title.toLowerCase().includes("nutrition") &&
            item.type !== "traditional-treatments" &&
            item.type !== "health" &&
            item.type !== "scientific" &&
            item.type !== "prophecy"
        )
        .map((item) => item.title),
    },
  ];

  // Filter out locations with no data
  const activeLocations = locations.filter((location) => location.value > 0);

  return (
    <div className="w-full bg-white dark:bg-stone-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-green-700 dark:text-green-400 mb-6">
        Featured Geographic Data Distribution
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeLocations.map((location) => (
          <div
            key={location.id}
            className="p-4 bg-stone-50 dark:bg-stone-700 rounded-lg border border-stone-200 dark:border-stone-600 hover:shadow-lg transition-shadow duration-200 cursor-pointer group relative"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-stone-900 dark:text-stone-100">
                {location.label}
              </h4>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {location.value}
              </span>
            </div>

            <div className="text-sm text-stone-600 dark:text-stone-400">
              Data entries
            </div>

            {location.prophecies.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Examples:
                </div>
                <div className="space-y-1">
                  {location.prophecies.slice(0, 2).map((prophecy, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-stone-600 dark:text-stone-400"
                    >
                      • {prophecy}
                    </div>
                  ))}
                  {location.prophecies.length > 2 && (
                    <div className="text-xs text-stone-500 dark:text-stone-400">
                      +{location.prophecies.length - 2} more...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hover tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 max-w-xs break-words">
              <div className="font-semibold">{location.label}</div>
              <div>Data entries: {location.value}</div>
              {location.prophecies.length > 0 && (
                <div className="mt-1">
                  <div className="font-semibold">Examples:</div>
                  {location.prophecies.slice(0, 2).map((prophecy, idx) => (
                    <div key={idx} className="text-xs break-words">
                      • {prophecy}
                    </div>
                  ))}
                </div>
              )}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-stone-900 dark:border-t-stone-100"></div>
            </div>
          </div>
        ))}
      </div>

      {activeLocations.length === 0 && (
        <div className="text-center py-8 text-stone-500 dark:text-stone-400">
          <div className="text-lg font-semibold mb-2">No Geographic Data</div>
          <div className="text-sm">
            No data with geographic information found
          </div>
        </div>
      )}

      {isActive && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
          <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
            About This Chart:
          </h4>
          <ul className="text-xs text-stone-600 dark:text-stone-400 space-y-1">
            <li>
              • <strong>Middle East:</strong> Data about Palestine, Jerusalem,
              Israel, Mecca, Medina, Yemen, and Aden
            </li>
            <li>
              • <strong>Global:</strong> Data about worldwide events,
              environmental changes, climate, and world topics
            </li>
            <li>
              • <strong>Cosmological:</strong> Data about space, universe,
              cosmos, iron, embryo development, and water barriers
            </li>
            <li>
              • <strong>Social:</strong> Data about music, entertainment,
              ignorance, and social changes
            </li>
            <li>
              • <strong>Natural:</strong> Data about honey, dates, natural
              foods, nutrition, and natural resources
            </li>
            <li>
              • <strong>Traditional Treatments:</strong> All traditional healing
              practices and remedies
            </li>
            <li>
              • <strong>Health & Wellness:</strong> All health-related data and
              nutritional information
            </li>
            <li>
              • <strong>Scientific Discoveries:</strong> All scientifically
              verified facts and discoveries
            </li>
            <li>
              • <strong>Prophecies:</strong> All prophetic predictions and
              future events
            </li>
            <li>
              • <strong>Other Topics:</strong> All remaining data not covered by
              other categories
            </li>
            <li>
              • <strong>Numbers show:</strong> How many data entries belong to
              each category
            </li>
            <li>
              • <strong>Hover over cards:</strong> To see specific examples from
              each category
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
