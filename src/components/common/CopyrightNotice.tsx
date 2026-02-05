import React from "react";
import { Link } from "react-router-dom";

interface CopyrightNoticeProps {
  className?: string;
}

export const CopyrightNotice: React.FC<CopyrightNoticeProps> = ({
  className = "",
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className={`w-full ${className}`}>
      {/* Copyright and legal links - responsive layout */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-stone-600 dark:text-stone-400 space-y-4 sm:space-y-0">
        {/* Copyright text - left aligned */}
        <div className="text-left">
          <p>© {currentYear} Islamic Dataset Interface. All rights reserved.</p>
          <p className="mt-1 text-xs">
            This application is protected by copyright laws and international
            treaties.
          </p>
        </div>

        {/* Legal links - stacked on mobile, inline on desktop */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs">
          <Link
            to="/copyright"
            className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Copyright Notice
          </Link>
          <span className="hidden sm:inline text-stone-400">•</span>
          <Link
            to="/terms"
            className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Terms of Use
          </Link>
          <span className="hidden sm:inline text-stone-400">•</span>
          <Link
            to="/privacy"
            className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};
