import React, { memo, useState } from "react";
import type { IslamicData } from "../../types/Types";
import { SourceCitation } from "./SourceCitation";
import { generateScholarlySummary } from "../../utils/dataSanitizer";

interface NeutralDataCardProps {
  card: IslamicData;
  onFavorite: (card: IslamicData) => void;
  isFavorite: boolean;
}

// Neutral DataCard component that presents information without interpretive commentary
export const NeutralDataCard: React.FC<NeutralDataCardProps> = memo(
  ({ card, onFavorite, isFavorite }) => {
    const [showSources, setShowSources] = useState(false);

    const handleFavoriteClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onFavorite(card);
    };

    // Neutral status presentation
    const getStatusDisplay = (status: string) => {
      switch (status?.toLowerCase()) {
        case "fulfilled":
          return "Fulfilled Prophecy";
        case "proven":
          return "Documented";
        case "yet to happen":
          return "Future Event";
        case "in-progress":
          return "Ongoing";
        default:
          return status || "Not Specified";
      }
    };

    return (
      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* Header with type badge and favorite button */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                card.type === "prophecy"
                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200"
                  : card.type === "scientific"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                  : card.type === "health"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                  : card.type === "qadr"
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              }`}
            >
              {card.type}
            </span>
            <button
              onClick={handleFavoriteClick}
              className={`p-2 rounded-full transition-all duration-200 ${
                isFavorite
                  ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-600 hover:text-yellow-700"
                  : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700"
              }`}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <svg
                className="h-5 w-5"
                fill={isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-green-700 dark:text-green-400 mb-3">
            {card.title}
          </h3>

          {/* Notes */}
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Notes
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
              {card.notes || generateScholarlySummary(card)}
            </p>
          </div>

          {/* Status Information - Neutral presentation */}
          {card.status && (
            <div className="p-3 bg-stone-50 dark:bg-stone-700 rounded-lg border border-stone-200 dark:border-stone-600 mb-4">
              <h4 className="text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2 uppercase tracking-wide">
                Status
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-stone-600 dark:text-stone-400">
                    Status:
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      card.status === "Fulfilled Prophecy"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
                        : card.status === "Documented"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                        : card.status === "supported by evidence"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                        : card.status === "Future Event"
                        ? "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-200"
                        : card.status === "Ongoing Research"
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200"
                        : card.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {getStatusDisplay(card.status)}
                  </span>
                </div>
                {card.yearRevealed && (
                  <div className="flex items-center gap-2">
                    <span className="text-stone-600 dark:text-stone-400">
                      Year Revealed:
                    </span>
                    <span className="font-medium text-stone-800 dark:text-stone-200">
                      {card.yearRevealed} CE
                    </span>
                  </div>
                )}
                {card.yearFulfilled && (
                  <div className="flex items-center gap-2">
                    <span className="text-stone-600 dark:text-stone-400">
                      Year Fulfilled:
                    </span>
                    <span className="font-medium text-stone-800 dark:text-stone-200">
                      {card.yearFulfilled} CE
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sources Section */}
          {card.sources && (
            <div className="space-y-3">
              <button
                onClick={() => setShowSources(!showSources)}
                className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showSources ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                View Academic Sources
              </button>

              {showSources && <SourceCitation sources={card.sources} />}
            </div>
          )}
        </div>
      </div>
    );
  }
);
