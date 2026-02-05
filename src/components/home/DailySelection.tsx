import React, { useState, useEffect, useRef, memo } from "react";
import type { QuranAyah, HadithEntry } from "../../types/Types";

interface DailySelectionProps {
  readonly quranData: readonly QuranAyah[];
  readonly hadithData: readonly HadithEntry[];
}

interface DailyContent {
  readonly id: string;
  readonly type: "quran" | "hadith";
  readonly title: string;
  readonly subtitle: string;
  readonly content: string;
  readonly arabic?: string;
  readonly reference: string;
  readonly gradient: string;
}

const DAILY_GRADIENTS = [
  "from-green-500 to-emerald-600",
  "from-blue-500 to-cyan-600",
  "from-purple-500 to-violet-600",
  "from-orange-500 to-amber-600",
  "from-teal-500 to-green-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-blue-600",
  "from-yellow-500 to-orange-500",
] as const;

export const DailySelection: React.FC<DailySelectionProps> = memo(
  ({ quranData, hadithData }) => {
    const [dailyContent, setDailyContent] = useState<DailyContent[]>([]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Generate daily content based on current date
    useEffect(() => {
      if (quranData.length === 0 && hadithData.length === 0) return;

      const today = new Date();
      const dayOfYear = Math.floor(
        (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      const content: DailyContent[] = [];

      // Select daily Quran verses (3-4 verses)
      if (quranData.length > 0) {
        const quranSelections = 4;
        for (let i = 0; i < quranSelections; i++) {
          const index = (dayOfYear * 7 + i * 13) % quranData.length;
          const ayah = quranData[index];
          if (ayah && (ayah.ayah_en || ayah.ayah_ar)) {
            content.push({
              id: `quran-${ayah.surah_no}-${ayah.ayah_no_surah}`,
              type: "quran",
              title: `Surah ${ayah.surah_name_en}`,
              subtitle: `Verse ${ayah.ayah_no_surah}`,
              content: ayah.ayah_en || ayah.ayah_ar,
              arabic: ayah.ayah_ar,
              reference: `${ayah.surah_name_en} ${ayah.ayah_no_surah}:${ayah.ayah_no_quran}`,
              gradient: DAILY_GRADIENTS[i % DAILY_GRADIENTS.length],
            });
          }
        }
      }

      // Select daily Hadiths (3-4 hadiths)
      if (hadithData.length > 0) {
        const hadithSelections = 4;
        for (let i = 0; i < hadithSelections; i++) {
          const index = (dayOfYear * 11 + i * 17) % hadithData.length;
          const hadith = hadithData[index];
          if (hadith && hadith.text) {
            content.push({
              id: `hadith-${hadith.id}`,
              type: "hadith",
              title: hadith.book,
              subtitle: `Chapter: ${hadith.chapter}`,
              content: hadith.translation || hadith.text,
              arabic: hadith.arabic,
              reference:
                hadith.reference || `${hadith.book} - ${hadith.number}`,
              gradient: DAILY_GRADIENTS[(i + 4) % DAILY_GRADIENTS.length],
            });
          }
        }
      }

      setDailyContent(content);
    }, [quranData, hadithData]);

    if (dailyContent.length === 0) {
      return (
        <div className="text-center py-12 animate-fade-in">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-2xl font-bold text-stone-700 dark:text-stone-300 mb-4">
            Loading Daily Selections...
          </h2>
          <p className="text-stone-600 dark:text-stone-400">
            Preparing your daily Quran and Hadith selections
          </p>
        </div>
      );
    }

    const formatDate = () => {
      const today = new Date();
      return today.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    return (
      <div className="py-8 animate-fade-in h-[600px] overflow-hidden">
        {/* Header */}
        <div className="text-left mb-6">
          <h2 className="text-2xl font-semibold text-stone-800 dark:text-stone-200 mb-2">
            Daily Islamic Reflections
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-sm">
            {formatDate()}
          </p>
        </div>

        {/* Horizontal Scrolling Container */}
        <div className="relative">
          {/* Scroll Indicators */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-white dark:from-stone-900 to-transparent w-8 h-full flex items-center">
            <div className="w-6 h-6 bg-stone-300 dark:bg-stone-600 rounded-full flex items-center justify-center text-stone-600 dark:text-stone-300 text-sm">
              ‹
            </div>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-l from-white dark:from-stone-900 to-transparent w-8 h-full flex items-center justify-end">
            <div className="w-6 h-6 bg-stone-300 dark:bg-stone-600 rounded-full flex items-center justify-center text-stone-600 dark:text-stone-300 text-sm">
              ›
            </div>
          </div>

          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 h-[480px]"
            style={{
              scrollSnapType: "x mandatory",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              scrollBehavior: "smooth",
            }}
          >
            {dailyContent.map((item) => (
              <div
                key={item.id}
                className="min-w-80 max-w-80 shadow-md"
                style={{ scrollSnapAlign: "start" }}
              >
                <div className="h-full bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 p-4 hover:shadow-lg transition-shadow duration-200">
                  {/* Header */}
                  <div className="mb-3 border-b border-stone-200 dark:border-stone-600 pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">
                        {item.type === "quran" ? "📖" : "📚"}
                      </span>
                      <span className="text-xs uppercase tracking-wider font-medium text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded">
                        {item.type === "quran" ? "Quran" : "Hadith"}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-stone-600 dark:text-stone-400">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Content - Scrollable Content Inside Fixed Card */}
                  <div className="flex-1 mb-3">
                    <div
                      className="h-60 overflow-y-auto bg-stone-50 dark:bg-stone-700 rounded p-3"
                      style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#9CA3AF #F3F4F6",
                      }}
                    >
                      {/* Arabic Text */}
                      {item.arabic && (
                        <div className="mb-4 text-right">
                          <h4 className="text-xs font-medium text-stone-700 dark:text-stone-300 mb-2 text-left">
                            Arabic Text
                          </h4>
                          <p className="text-sm leading-relaxed font-arabic text-stone-800 dark:text-stone-200">
                            {item.arabic}
                          </p>
                        </div>
                      )}

                      {/* Translation/Content */}
                      <div>
                        <h4 className="text-xs font-medium text-stone-700 dark:text-stone-300 mb-2">
                          {item.type === "quran" ? "Translation" : "Text"}
                        </h4>
                        <p className="text-sm leading-relaxed text-stone-800 dark:text-stone-200">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reference */}
                  <div className="pt-2 border-t border-stone-200 dark:border-stone-600">
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                      {item.reference}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Hint */}
          <div className="text-center mt-4">
            <p className="text-xs text-stone-500 dark:text-stone-400">
              ← Scroll horizontally to see more →
            </p>
          </div>
        </div>
      </div>
    );
  }
);
