import React from "react";
import { useLanguage } from "../../hooks/useContext";
import kaabaImage from "../../assets/kaaba-5462226.png";

export const HomePageHeader: React.FC = () => {
  const { t } = useLanguage();

  return (
    <header
      className="mb-8 relative rounded-xl overflow-hidden"
      style={{
        backgroundImage: `url(${kaabaImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "200px",
      }}
    >
      {/* Semi-transparent overlay for better text readability - Reduced opacity for more visible background */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/40"></div>

      {/* Content */}
      <div className="relative z-10 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-4">
          <h1
            className="text-3xl md:text-4xl font-bold header-title"
            style={{
              color: "#fffdd0", // Lighter cream for better contrast in light mode
              textShadow: "0 3px 6px rgba(0, 0, 0, 0.9)",
            }}
          >
            {t("header.title")}
          </h1>
        </div>

        {/* Subtitle */}
        <div className="mt-4">
          <p
            className="text-lg md:text-xl font-medium header-subtitle"
            style={{
              color: "#fffdd0", // Lighter cream for better contrast in light mode
              textShadow: "0 3px 6px rgba(0, 0, 0, 0.9)",
            }}
          >
            Access comprehensive Islamic Knowledge through Quranic verses, and
            Hadith collections.
          </p>
        </div>
      </div>

      {/* Dark mode styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
           @media (prefers-color-scheme: dark) {
             .dark .header-title {
               color: #f5f5dc !important;
               text-shadow: 0 3px 6px rgba(0, 0, 0, 0.9) !important;
             }
             
             .dark .header-subtitle {
               color: #f5f5dc !important;
               text-shadow: 0 3px 6px rgba(0, 0, 0, 0.9) !important;
             }
           }
         `,
        }}
      />
    </header>
  );
};
