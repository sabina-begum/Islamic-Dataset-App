import React, { useState } from "react";
import type { CitationMetadata } from "../../../utils/citationSystem";
import { IslamicCitationGenerator } from "../../../utils/citationSystem";

interface CitationCardProps {
  data: any;
  type: "quran" | "hadith" | "tafsir" | "scholarly_work";
  className?: string;
}

export const CitationCard: React.FC<CitationCardProps> = ({
  data,
  type,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Generate citation metadata from data
  const generateCitationMetadata = (): CitationMetadata => {
    const baseMetadata: CitationMetadata = {
      id: data.id || `${type}-${Date.now()}`,
      type,
      title: data.title || data.text || "",
      source: data.source || "",
      digitalIdentifier: IslamicCitationGenerator.generateDigitalIdentifier({
        id: data.id || "",
        type,
        source: data.source || "",
        chapter: data.chapter,
        verse: data.verse,
        hadithNumber: data.hadith_number,
      } as CitationMetadata),
    };

    // Add type-specific metadata
    switch (type) {
      case "quran":
        return {
          ...baseMetadata,
          chapter: data.chapter || data.surah,
          verse: data.verse || data.ayah,
          translator: data.translator || "Multiple Translations",
          publicationYear: new Date().getFullYear(),
        };

      case "hadith":
        return {
          ...baseMetadata,
          hadithNumber: data.hadith_number || data.number,
          narrator: data.narrator || data.chain,
          authentication: data.authentication || data.grade,
          scholar: data.scholar || data.collector,
          publicationYear: data.publication_year || new Date().getFullYear(),
        };

      case "tafsir":
      case "scholarly_work":
        return {
          ...baseMetadata,
          scholar: data.author || data.scholar,
          publisher: data.publisher,
          publicationYear: data.publication_year || new Date().getFullYear(),
          edition: data.edition,
          pages: data.pages,
        };

      default:
        return baseMetadata;
    }
  };

  const citationMetadata = generateCitationMetadata();
  const citation = IslamicCitationGenerator.generateCitation(citationMetadata);
  const validation =
    IslamicCitationGenerator.validateCitation(citationMetadata);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("Failed to copy citation:", err);
      }
    }
  };

  const formatCitation = (
    format: "apa" | "mla" | "chicago" | "islamic-studies"
  ) => {
    return IslamicCitationGenerator.exportCitation(citationMetadata, format);
  };

  return (
    <div
      className={`bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 ${className}`}
    >
      {/* Header */}
      <div className="p-3 border-b border-stone-200 dark:border-stone-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="inline-block w-4 h-4 align-text-bottom text-green-600 dark:text-green-400"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783" />
            </svg>
            <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300">
              Academic Citation
            </h4>
            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
              {type.toUpperCase()}
            </span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 rounded transition-colors"
            aria-label={isExpanded ? "Collapse citation" : "Expand citation"}
          >
            <svg
              className={`inline-block w-4 h-4 align-middle transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Quick Citation */}
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-stone-600 dark:text-stone-400 font-mono leading-relaxed flex-1">
              {citation}
            </p>
            <button
              onClick={() => copyToClipboard(citation)}
              className="flex-shrink-0 p-1.5 text-stone-500 hover:text-green-600 dark:text-stone-400 dark:hover:text-green-400 rounded transition-colors"
              title="Copy citation"
            >
              {copySuccess ? (
                <svg
                  className="inline-block w-4 h-4 align-middle text-green-600"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                </svg>
              ) : (
                <svg
                  className="inline-block w-4 h-4 align-middle"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
                </svg>
              )}
            </button>
          </div>

          {/* Digital Identifier */}
          {citationMetadata.digitalIdentifier && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  Digital ID:
                </span>
                <code className="text-xs text-blue-800 dark:text-blue-200 font-mono">
                  {citationMetadata.digitalIdentifier}
                </code>
              </div>
            </div>
          )}
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-4 border-t border-stone-200 dark:border-stone-700 pt-4">
            {/* Validation Status */}
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  validation.isValid ? "bg-green-500" : "bg-yellow-500"
                }`}
              ></span>
              <span className="text-xs text-stone-600 dark:text-stone-400">
                {validation.isValid
                  ? "Citation complete"
                  : "Missing recommended fields"}
              </span>
              {validation.warnings.length > 0 && (
                <span className="text-xs text-yellow-600 dark:text-yellow-400">
                  ({validation.warnings.length} warnings)
                </span>
              )}
            </div>

            {/* Multiple Format Options */}
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide">
                Export Formats
              </h5>

              {["islamic-studies", "apa", "mla", "chicago"].map((format) => (
                <div
                  key={format}
                  className="flex items-start gap-2 p-2 bg-white dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-600"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-stone-700 dark:text-stone-300 uppercase">
                        {format === "islamic-studies"
                          ? "Islamic Studies"
                          : format.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-400 font-mono leading-relaxed">
                      {formatCitation(format as any)}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(formatCitation(format as any))
                    }
                    className="flex-shrink-0 p-1 text-stone-500 hover:text-green-600 dark:text-stone-400 dark:hover:text-green-400 rounded transition-colors"
                    title={`Copy ${format} citation`}
                  >
                    <svg
                      className="inline-block w-3 h-3 align-middle"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                      <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Validation Warnings */}
            {(validation.missingFields.length > 0 ||
              validation.warnings.length > 0) && (
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide">
                  Citation Notes
                </h5>

                {validation.missingFields.length > 0 && (
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-700 dark:text-red-300">
                      <span className="font-medium">Missing fields:</span>{" "}
                      {validation.missingFields.join(", ")}
                    </p>
                  </div>
                )}

                {validation.warnings.length > 0 && (
                  <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                    {validation.warnings.map((warning, index) => (
                      <p
                        key={index}
                        className="text-xs text-yellow-700 dark:text-yellow-300"
                      >
                        • {warning}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
