import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useContext";
import { useFavorites } from "../../hooks/useFavorites";
import { LanguageSelector } from "../common/LanguageSelector";
import { useLanguage } from "../../hooks/useContext";
import DarkModeToggle from "../common/DarkModeToggle";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const { favorites } = useFavorites();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("Logout failed:", error);
      }
    }
  };

  const handleLoginClick = () => {
    // Navigate to login and close sidebar
    navigate("/login");
    onClose();
  };

  // NavLink component for consistent styling
  const NavLink = ({
    to,
    children,
    className = "",
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <Link
      to={to}
      className={`text-base font-medium transition-colors hover:text-green-700 dark:hover:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded ${className} ${
        location.pathname === to
          ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
          : "text-stone-700 dark:text-stone-300"
      }`}
      onClick={onClose}
    >
      {children}
    </Link>
  );

  // Navigation links array
  const navigationLinks = [
    {
      to: "/",
      label: t("nav.home"),
      showBadge: false,
      badgeCount: 0,
    },
    {
      to: "/favorites",
      label: t("nav.favorites"),
      showBadge: true,
      badgeCount: favorites.length,
    },
    {
      to: "/install",
      label: "Get App",
      showBadge: false,
      badgeCount: 0,
    },
  ];

  return (
    <>
      {/* Backdrop - only for mobile screens */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - only render on md+ screens */}
      <div
        className={`hidden md:block fixed top-0 right-0 h-full w-80 bg-white dark:bg-stone-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-end p-4 border-b border-stone-200 dark:border-stone-700">
          <button
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
            aria-label="Close menu"
          >
            <svg
              className="inline-block h-6 w-6 align-middle"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="p-4 space-y-2">
          {navigationLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="block px-4 py-3 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span>{link.label}</span>
                {link.showBadge && link.badgeCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                    {link.badgeCount}
                  </span>
                )}
              </div>
            </NavLink>
          ))}
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-700">
          {user ? (
            <div className="space-y-3">
              <NavLink
                to="/profile"
                className="block px-4 py-3 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      {user.displayName?.[0] || user.email?.[0] || "U"}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                      {user.displayName || user.email}
                    </div>
                    <div className="text-xs text-stone-600 dark:text-stone-400">
                      {user.email}
                    </div>
                  </div>
                </div>
              </NavLink>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-green-700 dark:hover:text-green-400 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg"
                aria-label="Sign out"
              >
                {t("nav.logout")}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleLoginClick}
                className="w-full px-4 py-3 text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-green-700 dark:hover:text-green-400 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg"
                aria-label="Sign in to your account"
              >
                {t("nav.login")}
              </button>
              <button
                onClick={handleLoginClick}
                className="w-full px-4 py-3 text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg"
                aria-label="Create new account"
              >
                {t("nav.signup")}
              </button>
            </div>
          )}
        </div>

        {/* Settings Section */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-700 mt-auto">
          <div className="flex items-center justify-between">
            <LanguageSelector />
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </>
  );
}
