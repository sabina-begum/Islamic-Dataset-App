import type { HadithEntry } from "../../../types/Types";
import { useLanguage } from "../../../hooks/useContext";
import React, { useState, useRef, useCallback, useEffect } from "react";

interface HadithCardProps {
  hadith: HadithEntry;
  index: number;
  onFavorite?: (hadith: HadithEntry) => void;
  isFavorite?: (hadith: HadithEntry) => boolean;
}

export function HadithCard({
  hadith,
  index,
  onFavorite,
  isFavorite,
}: HadithCardProps) {
  const { t } = useLanguage();

  // State for expandable content sections
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  // State to track which sections are actually truncated
  const [truncatedSections, setTruncatedSections] = useState<
    Record<string, boolean>
  >({});

  // Refs for focus management
  const contentRefs = useRef<Record<string, HTMLParagraphElement | null>>({});

  // Screen reader announcement utility
  const announceToScreenReader = useCallback((message: string) => {
    const liveRegion = document.createElement("div");
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.className = "sr-only";
    liveRegion.textContent = message;
    document.body.appendChild(liveRegion);

    setTimeout(() => {
      if (document.body.contains(liveRegion)) {
        document.body.removeChild(liveRegion);
      }
    }, 1000);
  }, []);

  // Handle favorite button click with proper accessibility
  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onFavorite?.(hadith);

      // Announce favorite action to screen readers
      const isFavorited = isFavorite?.(hadith);
      const announcement = isFavorited
        ? t("accessibility.removedFromFavorites")
        : t("accessibility.addedToFavorites");

      announceToScreenReader(announcement);
    },
    [hadith, onFavorite, isFavorite, t, announceToScreenReader]
  );

  // Helper function to check if a field has meaningful content
  const hasContent = useCallback((value: string | undefined): boolean => {
    if (!value) return false;
    const trimmed = value.trim();
    return (
      trimmed.length > 0 &&
      trimmed !== "Unknown" &&
      trimmed !== "Sahih Bukhari" &&
      !trimmed.includes("placeholder") &&
      !trimmed.includes("not available")
    );
  }, []);

  // Get fields that actually have content
  const contentFields = Object.entries(hadith).filter(([key, value]) => {
    if (key === "id") return false;
    if (key === "text" || key === "arabic" || key === "translation")
      return false;
    return hasContent(value);
  });

  // Handle expand/collapse with comprehensive accessibility
  const handleExpandToggle = useCallback(
    (sectionId: string, isExpanded: boolean) => {
      setExpandedSections((prev) => ({
        ...prev,
        [sectionId]: !isExpanded,
      }));

      // Focus management - move focus to content when expanding
      if (!isExpanded && contentRefs.current[sectionId]) {
        setTimeout(() => {
          contentRefs.current[sectionId]?.focus();
        }, 100);
      }

      // Announce state change to screen readers
      const announcement = isExpanded
        ? t("accessibility.contentCollapsed")
        : t("accessibility.contentExpanded");

      announceToScreenReader(announcement);
    },
    [t, announceToScreenReader]
  );

  // Handle keyboard events for expand buttons with full keyboard support
  const handleExpandKeyDown = useCallback(
    (e: React.KeyboardEvent, sectionId: string, isExpanded: boolean) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleExpandToggle(sectionId, isExpanded);
      }
      // Add Escape key support to collapse expanded content
      if (e.key === "Escape" && isExpanded) {
        e.preventDefault();
        handleExpandToggle(sectionId, isExpanded);
      }
    },
    [handleExpandToggle]
  );

  // Handle skip link activation
  const handleSkipLink = useCallback(
    (e: React.MouseEvent, targetId: string) => {
      e.preventDefault();
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.focus();
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    []
  );

  // Generate unique IDs for ARIA relationships
  const cardId = `hadith-card-${hadith.id || index}`;
  const arabicSectionId = `${cardId}-arabic`;
  const textSectionId = `${cardId}-text`;
  const translationSectionId = `${cardId}-translation`;

  // Calculate content length for better accessibility descriptions
  const getContentLength = useCallback((content: string) => {
    const words = content.trim().split(/\s+/).length;
    const characters = content.length;
    return { words, characters };
  }, []);

  // Get accessibility description for content
  const getAccessibilityDescription = useCallback(
    (content: string, type: string) => {
      const { words, characters } = getContentLength(content);
      return `${type}, ${words} words, ${characters} characters`;
    },
    [getContentLength]
  );

  // Check if content is actually truncated (needs expansion)
  const isContentTruncated = useCallback((element: HTMLElement | null) => {
    if (!element) return false;
    return element.scrollHeight > element.clientHeight;
  }, []);

  // Check for truncation after component mounts
  useEffect(() => {
    const checkTruncation = () => {
      const newTruncatedSections: Record<string, boolean> = {};

      // Check Arabic text
      if (hasContent(hadith.arabic)) {
        const element = contentRefs.current[arabicSectionId];
        newTruncatedSections[arabicSectionId] = isContentTruncated(element);
      }

      // Check hadith text
      if (hasContent(hadith.text) && !hasContent(hadith.arabic)) {
        const element = contentRefs.current[textSectionId];
        newTruncatedSections[textSectionId] = isContentTruncated(element);
      }

      // Check translation
      if (hasContent(hadith.translation)) {
        const element = contentRefs.current[translationSectionId];
        newTruncatedSections[translationSectionId] =
          isContentTruncated(element);
      }

      // Check additional fields
      contentFields.slice(1).forEach(([,], idx) => {
        const fieldSectionId = `${cardId}-field-${idx}`;
        const element = contentRefs.current[fieldSectionId];
        newTruncatedSections[fieldSectionId] = isContentTruncated(element);
      });

      setTruncatedSections(newTruncatedSections);
    };

    // Check after a short delay to ensure DOM is ready
    const timer = setTimeout(checkTruncation, 100);

    // Set up resize observer to handle dynamic content changes
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(checkTruncation, 50);
    });

    // Observe the card element for size changes
    const cardElement = document.getElementById(cardId);
    if (cardElement) {
      resizeObserver.observe(cardElement);
    }

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, [
    hadith,
    contentFields,
    arabicSectionId,
    textSectionId,
    translationSectionId,
    cardId,
    isContentTruncated,
    hasContent,
  ]);

  return (
    <article
      className="w-full h-full bg-white dark:bg-stone-800 rounded-xl p-4 sm:p-6 shadow-lg border border-stone-200 dark:border-stone-700 hover:shadow-xl transition-shadow flex flex-col relative z-10"
      id={cardId}
      aria-labelledby={`${cardId}-title`}
      aria-describedby={`${cardId}-description`}
      role="article"
    >
      {/* Skip Links for Accessibility */}
      <nav className="sr-only" aria-label={t("accessibility.skipNavigation")}>
        <ul>
          {hasContent(hadith.arabic) && (
            <li>
              <a
                href={`#${arabicSectionId}-content`}
                onClick={(e) => handleSkipLink(e, `${arabicSectionId}-content`)}
                className="focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-green-600 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:outline-none"
              >
                {t("accessibility.skipToArabicText")}
              </a>
            </li>
          )}
          {hasContent(hadith.text) && !hasContent(hadith.arabic) && (
            <li>
              <a
                href={`#${textSectionId}-content`}
                onClick={(e) => handleSkipLink(e, `${textSectionId}-content`)}
                className="focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-green-600 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:outline-none"
              >
                {t("accessibility.skipToHadithText")}
              </a>
            </li>
          )}
          {hasContent(hadith.translation) && (
            <li>
              <a
                href={`#${translationSectionId}-content`}
                onClick={(e) =>
                  handleSkipLink(e, `${translationSectionId}-content`)
                }
                className="focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-green-600 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:outline-none"
              >
                {t("accessibility.skipToTranslation")}
              </a>
            </li>
          )}
        </ul>
      </nav>

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="bg-stone-100 dark:bg-purple-900/30 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0"
            aria-hidden="true"
          >
            <span className="text-stone-700 dark:text-purple-400 font-bold text-base sm:text-lg">
              {index + 1}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3
              id={`${cardId}-title`}
              className="text-base sm:text-lg font-bold text-stone-700 dark:text-purple-400 truncate"
            >
              {t("hadith.hadithNumber")}
              {hadith.number || index + 1}
            </h3>
            {hasContent(hadith.book) && (
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                {hadith.book}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
            aria-label={`${contentFields.length} ${t("hadith.fields")}`}
          >
            {contentFields.length} {t("hadith.fields")}
          </span>

          {/* Favorite Button */}
          {onFavorite && isFavorite && (
            <button
              onClick={handleFavoriteClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleFavoriteClick(e);
                }
              }}
              className={`p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-stone-800 relative z-20 ${
                isFavorite(hadith)
                  ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-600 hover:text-yellow-700"
                  : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700"
              }`}
              aria-label={
                isFavorite(hadith)
                  ? t("hadith.removeFromFavorites")
                  : t("hadith.addToFavorites")
              }
              aria-pressed={isFavorite(hadith)}
              aria-describedby={`${cardId}-favorite-description`}
            >
              <svg
                className="h-5 w-5"
                fill={isFavorite(hadith) ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Hidden description for screen readers */}
      <div id={`${cardId}-description`} className="sr-only">
        {`${t("accessibility.hadithCardDescription")} ${
          hadith.number || index + 1
        }, ${hadith.book || t("hadith.unknownBook")}, ${
          contentFields.length
        } ${t("hadith.fields")}`}
      </div>

      {/* Hidden favorite button description */}
      <div id={`${cardId}-favorite-description`} className="sr-only">
        {t("accessibility.favoriteButtonDescription")}
      </div>

      {/* Main Content - Arabic Text */}
      {hasContent(hadith.arabic) && (
        <section
          className="mb-4 flex-1"
          aria-labelledby={`${arabicSectionId}-heading`}
        >
          <div className="bg-stone-50 dark:bg-stone-700 rounded-lg p-3 sm:p-4 border border-stone-200 dark:border-stone-600">
            <h4
              id={`${arabicSectionId}-heading`}
              className="text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2 uppercase tracking-wide"
            >
              {t("hadith.arabicText")}
            </h4>
            <div>
              <p
                id={`${arabicSectionId}-content`}
                ref={(el) => (contentRefs.current[arabicSectionId] = el)}
                className={`text-right text-sm sm:text-lg leading-relaxed text-stone-800 dark:text-stone-200 font-arabic ${
                  expandedSections[arabicSectionId]
                    ? "line-clamp-none"
                    : "line-clamp-4"
                }`}
                dir="rtl"
                tabIndex={expandedSections[arabicSectionId] ? 0 : -1}
                aria-expanded={expandedSections[arabicSectionId]}
                aria-controls={`${arabicSectionId}-toggle`}
                aria-describedby={`${arabicSectionId}-description`}
              >
                {hadith.arabic}
              </p>

              {/* Hidden description for screen readers */}
              <div id={`${arabicSectionId}-description`} className="sr-only">
                {hadith.arabic
                  ? getAccessibilityDescription(
                      hadith.arabic,
                      t("hadith.arabicText")
                    )
                  : ""}
              </div>

              {hadith.arabic &&
                (truncatedSections[arabicSectionId] ||
                  hadith.arabic.length > 200) && (
                  <div className="flex justify-end mt-2">
                    <button
                      id={`${arabicSectionId}-toggle`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleExpandToggle(
                          arabicSectionId,
                          expandedSections[arabicSectionId]
                        );
                      }}
                      onKeyDown={(e) =>
                        handleExpandKeyDown(
                          e,
                          arabicSectionId,
                          expandedSections[arabicSectionId]
                        )
                      }
                      className="text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer bg-white dark:bg-stone-800 px-2 py-1 rounded border border-stone-200 dark:border-stone-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-stone-800 relative z-20"
                      aria-expanded={expandedSections[arabicSectionId]}
                      aria-controls={`${arabicSectionId}-content`}
                      aria-label={
                        expandedSections[arabicSectionId]
                          ? t("accessibility.collapseArabicText")
                          : t("accessibility.expandArabicText")
                      }
                    >
                      {expandedSections[arabicSectionId]
                        ? "عرض أقل"
                        : "عرض المزيد"}
                    </button>
                  </div>
                )}
            </div>
          </div>
        </section>
      )}

      {/* Main Content - Hadith Text */}
      {hasContent(hadith.text) && !hasContent(hadith.arabic) && (
        <section
          className="mb-4 flex-1"
          aria-labelledby={`${textSectionId}-heading`}
        >
          <div className="bg-stone-50 dark:bg-stone-700 rounded-lg p-3 sm:p-4 border border-stone-200 dark:border-stone-600">
            <h4
              id={`${textSectionId}-heading`}
              className="text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2 uppercase tracking-wide"
            >
              {t("hadith.hadithText")}
            </h4>
            <div>
              <p
                id={`${textSectionId}-content`}
                ref={(el) => (contentRefs.current[textSectionId] = el)}
                className={`text-sm sm:text-base leading-relaxed text-stone-800 dark:text-stone-200 ${
                  expandedSections[textSectionId]
                    ? "line-clamp-none"
                    : "line-clamp-6"
                }`}
                dir="ltr"
                tabIndex={expandedSections[textSectionId] ? 0 : -1}
                aria-expanded={expandedSections[textSectionId]}
                aria-controls={`${textSectionId}-toggle`}
                aria-describedby={`${textSectionId}-description`}
              >
                {hadith.text}
              </p>

              {/* Hidden description for screen readers */}
              <div id={`${textSectionId}-description`} className="sr-only">
                {getAccessibilityDescription(
                  hadith.text,
                  t("hadith.hadithText")
                )}
              </div>

              {hadith.text &&
                (truncatedSections[textSectionId] ||
                  hadith.text.length > 300) && (
                  <div className="flex justify-start mt-2">
                    <button
                      id={`${textSectionId}-toggle`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleExpandToggle(
                          textSectionId,
                          expandedSections[textSectionId]
                        );
                      }}
                      onKeyDown={(e) =>
                        handleExpandKeyDown(
                          e,
                          textSectionId,
                          expandedSections[textSectionId]
                        )
                      }
                      className="text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer bg-white dark:bg-stone-800 px-2 py-1 rounded border border-stone-200 dark:border-stone-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-stone-800 relative z-20"
                      aria-expanded={expandedSections[textSectionId]}
                      aria-controls={`${textSectionId}-content`}
                      aria-label={
                        expandedSections[textSectionId]
                          ? t("accessibility.collapseHadithText")
                          : t("accessibility.expandHadithText")
                      }
                    >
                      {expandedSections[textSectionId]
                        ? "Show Less"
                        : "Show More"}
                    </button>
                  </div>
                )}
            </div>
          </div>
        </section>
      )}

      {/* English Translation */}
      {hasContent(hadith.translation) && (
        <section
          className="mb-4"
          aria-labelledby={`${translationSectionId}-heading`}
        >
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 sm:p-4 border border-yellow-200 dark:border-yellow-700">
            <h4
              id={`${translationSectionId}-heading`}
              className="text-xs sm:text-sm font-semibold text-yellow-700 dark:text-yellow-400 mb-2 text-left"
            >
              {t("hadith.englishTranslation")}
            </h4>
            <div>
              <p
                id={`${translationSectionId}-content`}
                ref={(el) => (contentRefs.current[translationSectionId] = el)}
                className={`text-xs sm:text-sm text-yellow-600 dark:text-yellow-300 text-left ${
                  expandedSections[translationSectionId]
                    ? "line-clamp-none"
                    : "line-clamp-4"
                }`}
                tabIndex={expandedSections[translationSectionId] ? 0 : -1}
                aria-expanded={expandedSections[translationSectionId]}
                aria-controls={`${translationSectionId}-toggle`}
                aria-describedby={`${translationSectionId}-description`}
              >
                {hadith.translation}
              </p>

              {/* Hidden description for screen readers */}
              <div
                id={`${translationSectionId}-description`}
                className="sr-only"
              >
                {hadith.translation
                  ? getAccessibilityDescription(
                      hadith.translation,
                      t("hadith.englishTranslation")
                    )
                  : ""}
              </div>

              {hadith.translation &&
                (truncatedSections[translationSectionId] ||
                  hadith.translation.length > 200) && (
                  <div className="flex justify-start mt-2">
                    <button
                      id={`${translationSectionId}-toggle`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleExpandToggle(
                          translationSectionId,
                          expandedSections[translationSectionId]
                        );
                      }}
                      onKeyDown={(e) =>
                        handleExpandKeyDown(
                          e,
                          translationSectionId,
                          expandedSections[translationSectionId]
                        )
                      }
                      className="text-xs font-medium text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-200 transition-colors cursor-pointer bg-yellow-100 dark:bg-yellow-900/40 px-2 py-1 rounded border border-yellow-200 dark:border-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 focus:ring-offset-yellow-50 dark:focus:ring-offset-yellow-900/20 relative z-20"
                      aria-expanded={expandedSections[translationSectionId]}
                      aria-controls={`${translationSectionId}-content`}
                      aria-label={
                        expandedSections[translationSectionId]
                          ? t("accessibility.collapseTranslation")
                          : t("accessibility.expandTranslation")
                      }
                    >
                      {expandedSections[translationSectionId]
                        ? "Show Less"
                        : "Show More"}
                    </button>
                  </div>
                )}
            </div>
          </div>
        </section>
      )}

      {/* Additional Content Fields */}
      {contentFields.length > 1 && (
        <section
          className="mb-4"
          aria-labelledby={`${cardId}-additional-heading`}
        >
          <h4
            id={`${cardId}-additional-heading`}
            className="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2 text-left"
          >
            {t("hadith.additionalInformation")}:
          </h4>
          <div
            className="space-y-2"
            role="list"
            aria-label={t("accessibility.additionalFieldsList")}
          >
            {contentFields.slice(1).map(([fieldKey, fieldValue], idx) => {
              const isArabicText =
                /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
                  fieldValue
                );
              const fieldSectionId = `${cardId}-field-${idx}`;

              return (
                <div
                  key={idx}
                  className="bg-stone-50 dark:bg-stone-700 rounded p-2 sm:p-3 border border-stone-200 dark:border-stone-600"
                  role="listitem"
                >
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mb-1 text-left font-medium">
                    {fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)}:
                  </p>
                  <div>
                    <p
                      ref={(el) => (contentRefs.current[fieldSectionId] = el)}
                      className={`text-xs sm:text-sm leading-relaxed text-stone-800 dark:text-stone-200 ${
                        expandedSections[fieldSectionId]
                          ? "line-clamp-none"
                          : "line-clamp-3"
                      } ${
                        isArabicText ? "text-right font-arabic" : "text-left"
                      }`}
                      dir={isArabicText ? "rtl" : "ltr"}
                      tabIndex={expandedSections[fieldSectionId] ? 0 : -1}
                      aria-expanded={expandedSections[fieldSectionId]}
                      aria-controls={`${fieldSectionId}-toggle`}
                      aria-describedby={`${fieldSectionId}-description`}
                    >
                      {fieldValue}
                    </p>

                    {/* Hidden description for screen readers */}
                    <div
                      id={`${fieldSectionId}-description`}
                      className="sr-only"
                    >
                      {fieldValue
                        ? getAccessibilityDescription(fieldValue, fieldKey)
                        : ""}
                    </div>

                    {fieldValue &&
                      (truncatedSections[fieldSectionId] ||
                        fieldValue.length > 100) && (
                        <div
                          className={`flex items-center mt-2 ${
                            isArabicText ? "justify-end" : "justify-start"
                          }`}
                        >
                          <button
                            id={`${fieldSectionId}-toggle`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleExpandToggle(
                                fieldSectionId,
                                expandedSections[fieldSectionId]
                              );
                            }}
                            onKeyDown={(e) =>
                              handleExpandKeyDown(
                                e,
                                fieldSectionId,
                                expandedSections[fieldSectionId]
                              )
                            }
                            className="text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer bg-white dark:bg-stone-800 px-2 py-1 rounded border border-stone-200 dark:border-stone-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-stone-800 relative z-20"
                            aria-expanded={expandedSections[fieldSectionId]}
                            aria-controls={`${fieldSectionId}-content`}
                            aria-label={
                              expandedSections[fieldSectionId]
                                ? `${t(
                                    "accessibility.collapseField"
                                  )} ${fieldKey}`
                                : `${t(
                                    "accessibility.expandField"
                                  )} ${fieldKey}`
                            }
                          >
                            {expandedSections[fieldSectionId]
                              ? isArabicText
                                ? "عرض أقل"
                                : "Show Less"
                              : isArabicText
                              ? "عرض المزيد"
                              : "Show More"}
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Grade Badge */}
      {hasContent(hadith.grade) && (
        <footer className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-600">
          <div className="flex items-center justify-end">
            <span
              className="inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium"
              aria-label={`${t("hadith.grade")}: ${hadith.grade}`}
              role="status"
              aria-live="polite"
            >
              {hadith.grade}
            </span>
          </div>
        </footer>
      )}
    </article>
  );
}
