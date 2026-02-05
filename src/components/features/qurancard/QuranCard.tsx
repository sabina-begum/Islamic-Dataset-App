import type { QuranAyah } from "../../../types/Types";
import React from "react";

interface QuranCardProps {
  ayah: QuranAyah;
  onFavorite?: (ayah: QuranAyah) => void;
  isFavorite?: (ayah: QuranAyah) => boolean;
}

export function QuranCard({ ayah, onFavorite, isFavorite }: QuranCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite?.(ayah);
  };

  return (
    <div className="w-full h-full bg-white dark:bg-stone-800 rounded-xl p-4 sm:p-6 shadow-lg border border-stone-200 dark:border-stone-700 hover:shadow-xl transition-shadow flex flex-col">
      {/* Header with Surah and Ayah info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0">
            <span className="text-green-700 dark:text-green-400 font-bold text-base sm:text-lg">
              {ayah.surah_no}:{ayah.ayah_no_surah}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-bold text-green-700 dark:text-green-400 truncate">
              {ayah.surah_name_en}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
              {ayah.surah_name_roman}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
            {ayah.place_of_revelation}
          </span>
          {/* Favorite Button */}
          {onFavorite && isFavorite && (
            <button
              onClick={handleFavoriteClick}
              className={`p-2 rounded-full transition-all duration-200 ${
                isFavorite(ayah)
                  ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-600 hover:text-yellow-700"
                  : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700"
              }`}
              aria-label={
                isFavorite(ayah) ? "Remove from favorites" : "Add to favorites"
              }
            >
              <svg
                className="h-5 w-5"
                fill={isFavorite(ayah) ? "currentColor" : "none"}
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
          )}
        </div>
      </div>

      {/* Arabic Text */}
      <div className="mb-4 flex-1">
        <div className="bg-stone-50 dark:bg-stone-700 rounded-lg p-3 sm:p-4 border border-stone-200 dark:border-stone-600">
          <p
            className="text-right text-lg sm:text-2xl leading-relaxed text-stone-800 dark:text-stone-200 font-arabic"
            dir="rtl"
          >
            {ayah.ayah_ar}
          </p>
        </div>
      </div>

      {/* English Translation */}
      {ayah.ayah_en && (
        <div className="mb-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 border border-blue-200 dark:border-blue-700">
            <h4
              className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2 text-left"
              dir="ltr"
            >
              English Translation:
            </h4>
            <p
              className="text-sm sm:text-base leading-relaxed text-blue-800 dark:text-blue-300 text-left"
              dir="ltr"
            >
              {ayah.ayah_en}
            </p>
          </div>
        </div>
      )}

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm mt-auto">
        <div className="flex items-center justify-between sm:justify-start space-x-2">
          <span className="text-stone-500 dark:text-stone-400 font-medium">
            Ayah Number:
          </span>
          <span className="text-stone-700 dark:text-stone-300">
            {ayah.ayah_no_quran} of {ayah.total_ayah_quran}
          </span>
        </div>
        <div className="flex items-center justify-between sm:justify-start space-x-2">
          <span className="text-stone-500 dark:text-stone-400 font-medium">
            Words:
          </span>
          <span className="text-stone-700 dark:text-stone-300">
            {ayah.no_of_word_ayah}
          </span>
        </div>
        <div className="flex items-center justify-between sm:justify-start space-x-2">
          <span className="text-stone-500 dark:text-stone-400 font-medium">
            Hizb Quarter:
          </span>
          <span className="text-stone-700 dark:text-stone-300">
            {ayah.hizb_quarter}
          </span>
        </div>
        <div className="flex items-center justify-between sm:justify-start space-x-2">
          <span className="text-stone-500 dark:text-stone-400 font-medium">
            Sajdah:
          </span>
          <span className="text-stone-700 dark:text-stone-300">
            {ayah.sajah_ayah ? "Yes" : "No"}
          </span>
        </div>
      </div>

      {/* Arabic Name */}
      <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-600">
        <p
          className="text-sm sm:text-lg text-stone-600 dark:text-stone-400 font-arabic text-right"
          dir="rtl"
        >
          {ayah.surah_name_ar}
        </p>
      </div>
    </div>
  );
}
