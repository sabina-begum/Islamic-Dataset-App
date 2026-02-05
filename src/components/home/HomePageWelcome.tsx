import React from "react";
import { useQuranData } from "../../hooks/useQuranData";
import { useHadithData } from "../../hooks/useHadithData";
import type { QuranAyah, HadithEntry } from "../../types/Types";

interface DailyCard {
  id: string;
  title: string;
  content: string;
  source: string;
  type: "quran" | "hadith";
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const HomePageWelcome = React.forwardRef<HTMLDivElement, {}>(
  (_, ref) => {
    const { allData: quranData } = useQuranData();
    const { hadithData } = useHadithData();

    // Generate daily random cards based on current date
    const getDailyCards = (): DailyCard[] => {
      const today = new Date();
      const dayOfYear = Math.floor(
        (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      // Use day of year as seed for consistent daily cards
      const seed = dayOfYear;

      // Get random Quran verses
      const randomQuranCards = getRandomQuranCards(quranData, seed, 3);

      // Get random Hadith
      const randomHadithCards = getRandomHadithCards(hadithData, seed, 3);

      return [...randomQuranCards, ...randomHadithCards];
    };

    // Get random Quran cards based on seed
    const getRandomQuranCards = (
      quranData: QuranAyah[],
      seed: number,
      count: number
    ): DailyCard[] => {
      if (quranData.length === 0) return [];

      const shuffled = shuffleArray([...quranData], seed);
      return shuffled.slice(0, count).map((ayah) => ({
        id: `quran-${ayah.surah_no}-${ayah.ayah_no_surah}`,
        title: `${ayah.surah_name_en} ${ayah.ayah_no_surah}`,
        content: `${ayah.ayah_ar || ""}\n\n${
          ayah.ayah_en || "Translation not available"
        }`,
        source: "The Holy Quran",
        type: "quran" as const,
        icon: "📜",
        color: "var(--text-primary)",
        bgColor: "var(--card-bg)",
        borderColor: "var(--card-border)",
      }));
    };

    // Get random Hadith cards based on seed
    const getRandomHadithCards = (
      hadithData: HadithEntry[],
      seed: number,
      count: number
    ): DailyCard[] => {
      if (hadithData.length === 0) return [];

      const shuffled = shuffleArray([...hadithData], seed);
      return shuffled.slice(0, count).map((hadith) => ({
        id: `hadith-${hadith.number}`,
        title: `Hadith #${hadith.number}`,
        content: `${hadith.arabic || ""}\n\n${
          hadith.text || hadith.translation || "Translation not available"
        }`,
        source: hadith.book || "Sahih Bukhari",
        type: "hadith" as const,
        icon: "📚",
        color: "var(--text-primary)",
        bgColor: "var(--card-bg)",
        borderColor: "var(--card-border)",
      }));
    };

    // Shuffle array with seed for consistent daily results
    const shuffleArray = (array: any[], seed: number): any[] => {
      const shuffled = [...array];
      let currentSeed = seed;

      for (let i = shuffled.length - 1; i > 0; i--) {
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        const j = Math.floor((currentSeed / 233280) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      return shuffled;
    };

    const dailyCards = getDailyCards();

    const handleCardClick = (cardId: string) => {
      // Dispatch custom event to switch tabs
      const event = new CustomEvent("switchToTab", {
        detail: { tabId: cardId },
      });
      window.dispatchEvent(event);
    };

    // Handle keyboard navigation for cards
    const handleCardKeyDown = (e: React.KeyboardEvent, card: DailyCard) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleCardClick(
          card.type === "quran" ? "quran-verses" : "hadith-collection"
        );
      }
    };

    return (
      <section
        ref={ref}
        className="py-4 sm:py-6 lg:py-8 animate-fade-in"
        aria-labelledby="daily-cards-heading"
      >
        {/* Daily Cards Header */}
        <header className="mb-4 sm:mb-6">
          <h2
            id="daily-cards-heading"
            className="text-lg sm:text-xl lg:text-2xl font-bold text-stone-900 dark:text-neutral-200 mb-2"
          >
            📅 Today's Daily Quranic Verses & Hadiths
          </h2>
          <p className="sr-only">
            Browse through daily selected Quranic verses and Hadiths. Scroll
            horizontally to view all cards.
          </p>
        </header>

        {/* Horizontal Scrolling Daily Cards with Scrollbar */}
        <div className="relative" role="region" aria-label="Daily cards">
          {/* Scroll Container with Visible Scrollbar */}
          <div
            className="flex gap-3 sm:gap-4 lg:gap-6 overflow-x-auto pb-4 px-2 sm:px-4 custom-scrollbar"
            style={{
              overflowY: "visible",
              scrollbarWidth: "thin",
              scrollbarColor: "var(--text-muted) transparent",
            }}
            role="list"
            aria-label="Daily cards list"
          >
            {dailyCards.map((card) => (
              <article
                key={card.id}
                className={`flex-shrink-0 w-80 sm:w-88 lg:w-96 xl:w-[420px] h-80 sm:h-88 lg:h-96 xl:h-[420px] ${card.bgColor} ${card.borderColor} border-2 rounded-2xl p-4 sm:p-5 lg:p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-102 group relative`}
                style={{ zIndex: 1 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.zIndex = "999";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.zIndex = "1";
                }}
                onClick={() =>
                  handleCardClick(
                    card.type === "quran" ? "quran-verses" : "hadith-collection"
                  )
                }
                onKeyDown={(e) => handleCardKeyDown(e, card)}
                tabIndex={0}
                role="listitem"
                aria-label={`${card.title} from ${card.source}`}
                aria-describedby={`card-content-${card.id}`}
              >
                {/* Card Header */}
                <header className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div
                    className="text-2xl sm:text-3xl lg:text-4xl group-hover:scale-110 transition-transform duration-300"
                    aria-hidden="true"
                    role="img"
                    aria-label={
                      card.type === "quran"
                        ? "Quran scroll icon"
                        : "Hadith book icon"
                    }
                  >
                    {card.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-base sm:text-lg lg:text-xl font-bold ${card.color} truncate`}
                    >
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-200 truncate font-medium">
                      {card.source}
                    </p>
                  </div>
                </header>

                {/* Card Content */}
                <div className="space-y-3 flex-1">
                  <div
                    className="bg-white dark:bg-stone-900 rounded-xl p-3 sm:p-4 border-2 border-stone-300 dark:border-stone-600 h-48 sm:h-52 lg:h-56 xl:h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-400 dark:scrollbar-thumb-stone-500 scrollbar-track-transparent"
                    id={`card-content-${card.id}`}
                    role="region"
                    aria-label={`Content of ${card.title}`}
                  >
                    <p className="text-xs sm:text-sm lg:text-base text-stone-900 dark:text-white leading-relaxed font-medium">
                      {card.content}
                    </p>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t-2 border-stone-300 dark:border-stone-600">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          card.type === "quran"
                            ? "bg-blue-600 text-white dark:bg-blue-500 dark:text-white"
                            : "bg-yellow-600 text-white dark:bg-yellow-500 dark:text-white"
                        }`}
                        aria-label={`Type: ${
                          card.type === "quran" ? "Quran Verse" : "Hadith"
                        }`}
                      >
                        {card.type === "quran" ? "Quran Verse" : "Hadith"}
                      </span>
                      <span className="text-xs text-stone-700 dark:text-stone-200 font-bold">
                        Daily Card
                      </span>
                    </div>
                  </div>
                </div>

                {/* View All Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(
                      card.type === "quran"
                        ? "quran-verses"
                        : "hadith-collection"
                    );
                  }}
                  className={`w-full mt-3 sm:mt-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 hover:shadow-lg ${
                    card.type === "quran"
                      ? "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                      : "bg-yellow-600 hover:bg-yellow-700 text-white dark:bg-yellow-500 dark:hover:bg-yellow-600"
                  } hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  aria-label={`View all ${
                    card.type === "quran" ? "Quran verses" : "Hadith"
                  } from ${card.source}`}
                >
                  View All {card.type === "quran" ? "Quran Verses" : "Hadith"}
                </button>
              </article>
            ))}
          </div>
        </div>

        {/* Accessibility Instructions */}
        <div className="sr-only">
          <p>
            Navigation instructions: Use Tab to move between cards, Enter or
            Space to select a card, and scroll horizontally to view all cards.
          </p>
        </div>
      </section>
    );
  }
);
