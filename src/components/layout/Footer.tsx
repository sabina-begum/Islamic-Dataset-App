import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "../common";
import { CopyrightNotice } from "../common/CopyrightNotice";

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 dark:bg-stone-950 text-stone-300 w-full overflow-hidden">
      <div className="container mx-auto max-w-7xl px-2 sm:px-4 py-12 w-full overflow-hidden">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* App Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Logo />
            </div>
            <p className="text-stone-400 text-sm leading-relaxed">
              Featured Islamic Data from Quranic Verses and Authentic Hadiths.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-stone-400 hover:text-green-400 transition-colors"
                aria-label="Facebook"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-stone-400 hover:text-green-400 transition-colors"
                aria-label="Twitter"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-stone-400 hover:text-green-400 transition-colors"
                aria-label="Instagram"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.928-.796-1.418-1.947-1.418-3.244s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-stone-400 hover:text-green-400 transition-colors"
                aria-label="YouTube"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-stone-400 hover:text-green-400 transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/favorites"
                  className="text-stone-400 hover:text-green-400 transition-colors text-sm"
                >
                  Saved favorites
                </Link>
              </li>

              <li>
                <Link
                  to="/charts"
                  className="text-stone-400 hover:text-green-400 transition-colors text-sm"
                >
                  Charts & Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-stone-400 hover:text-green-400 transition-colors text-sm"
                  onClick={() => {
                    // This will filter to show only prophecy data
                    const event = new CustomEvent("filterByCategory", {
                      detail: { category: "prophecy" },
                    });
                    window.dispatchEvent(event);
                  }}
                >
                  Prophecies
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-stone-400 hover:text-green-400 transition-colors text-sm"
                  onClick={() => {
                    // This will filter to show only scientific data
                    const event = new CustomEvent("filterByCategory", {
                      detail: { category: "scientific" },
                    });
                    window.dispatchEvent(event);
                  }}
                >
                  Scientific Discoveries
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-stone-400 hover:text-green-400 transition-colors text-sm"
                  onClick={() => {
                    // This will filter to show only health data
                    const event = new CustomEvent("filterByCategory", {
                      detail: { category: "health" },
                    });
                    window.dispatchEvent(event);
                  }}
                >
                  Health Science
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Contact & Support
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-stone-400 text-sm">
                  begumsabina81193@gmail.com
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-stone-400 text-sm">Help & FAQ</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-stone-400 text-sm">Report Issues</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-stone-800 pt-8">
          <div className="flex flex-col md:flex-row justify-start items-start space-y-4 md:space-y-0">
            {/* Copyright */}
            <CopyrightNotice />
          </div>

          {/* Mission Statement */}
          <div className="mt-6">
            <p className="text-stone-500 text-xs leading-relaxed max-w-2xl mx-auto">
              Our mission is to present authentic Islamic knowledge through
              Quranic verses, Hadith collections, and scholarly interpretations,
              fostering educational understanding while maintaining source
              transparency and factual presentation.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
