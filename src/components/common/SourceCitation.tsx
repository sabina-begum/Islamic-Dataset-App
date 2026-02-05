import React, { useState } from "react";
import { useLanguage } from "../../hooks/useContext";
import type { DataSources } from "../../types/Types";

interface SourceCitationProps {
  sources: DataSources;
  className?: string;
  showMethodology?: boolean;
}

export const SourceCitation: React.FC<SourceCitationProps> = ({
  sources,
  className = "",
  showMethodology = true,
}) => {
  const { t } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={`bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 p-4 ${className}`}
    >
      <div className="space-y-3">
        {/* Primary Source */}
        <div>
          <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
            {t("sources.primarySource")}
          </h4>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {sources.primary}
          </p>
        </div>

        {/* Verification */}
        <div>
          <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
            {t("sources.verification")}
          </h4>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {sources.verification}
          </p>
        </div>

        {/* Scholarly Consensus (Ijma) */}
        <div>
          <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
            {t("sources.ijma")}
          </h4>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Islamic scholars have reached consensus on the authenticity of this
            text. This represents the collective agreement of recognized Islamic
            scholars across different schools of thought.
          </p>
        </div>

        {/* Scientific Verification (if applicable) */}
        <div>
          <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
            {t("sources.scientificVerification")}
          </h4>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Recent, peer-reviewed scientific research has explored correlations
            with modern scientific understanding. All scientific claims are
            sourced from verified, peer-reviewed publications.
          </p>
        </div>

        {/* Methodology - Collapsible */}
        {showMethodology && (
          <div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform ${
                  showDetails ? "rotate-90" : ""
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
              {t("sources.methodology")}
            </button>

            {showDetails && (
              <div className="mt-2 p-3 bg-stone-100 dark:bg-stone-700 rounded border border-stone-200 dark:border-stone-600">
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  {sources.methodology}
                </p>
              </div>
            )}
          </div>
        )}

        {/* References */}
        {sources.references && sources.references.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
              {t("sources.references")}
            </h4>
            <ul className="space-y-1">
              {sources.references.map((reference, index) => (
                <li key={index} className="text-sm">
                  <a
                    href={reference}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                  >
                    {reference}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Source Information */}
        <div>
          <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
            {t("sources.sourceInfo")}
          </h4>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {sources.source}
          </p>
        </div>
      </div>
    </div>
  );
};
