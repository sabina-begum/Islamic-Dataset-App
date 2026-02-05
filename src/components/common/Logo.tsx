import bookImage from "../../assets/5179ed07851a80de976e57843ec0f946.png";
import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "", showText = true }: LogoProps) {
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Perform a hard refresh by navigating to the current URL
    window.location.href = "/";
  };

  return (
    <a
      href="/"
      onClick={handleLogoClick}
      className={`flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer ${className}`}
    >
      {/* Knowledge from Darkness Icon */}
      <div className="relative">
        {/* Dark Circle Background */}
        <div className="w-12 h-12 bg-blue-900 dark:bg-blue-950 rounded-full flex items-center justify-center relative overflow-hidden">
          {/* Enhanced yellow illuminating glow effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/40 via-yellow-300/25 to-transparent rounded-full"></div>

          {/* Additional glow rings with more intensity */}
          <div className="absolute inset-0 border-2 border-yellow-400/50 rounded-full"></div>
          <div className="absolute inset-1 border border-yellow-300/40 rounded-full"></div>
          <div className="absolute inset-2 border border-yellow-200/30 rounded-full"></div>

          {/* Book image */}
          <img
            src={bookImage}
            alt="Quran Book"
            className="w-8 h-8 object-contain z-10 relative"
          />
        </div>
      </div>

      {/* App Name */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-green-500 to-green-700 dark:from-emerald-400 dark:via-emerald-500 dark:to-emerald-700 leading-tight tracking-wide drop-shadow-sm">
            Reflect
          </span>
          <span className="text-xs font-medium text-stone-600 dark:text-stone-300 leading-tight tracking-wider uppercase">
            & IMPLEMENT
          </span>
        </div>
      )}
    </a>
  );
}
