import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useContext";
import { useFavorites } from "../../hooks/useFavorites";
import DarkModeToggle from "../common/DarkModeToggle";
import { LanguageSelector } from "../common/LanguageSelector";
import { useLanguage } from "../../hooks/useContext";
import { Logo } from "../common/Logo";
import { PWAInstallButton } from "../PWAInstallButton";

interface NavbarProps {
  onMenuToggle?: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, logout } = useAuth();
  const { favorites } = useFavorites();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("Logout failed:", error);
      }
    }
  };

  const handleLoginClick = () => {
    navigate("/login");
    setIsMenuOpen(false);
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
      className={`text-base font-medium transition-colors hover:text-green-700 dark:hover:text-green-400 ${className} ${
        location.pathname === to
          ? "text-green-700 dark:text-green-400"
          : "text-stone-600 dark:text-stone-400"
      }`}
      onClick={() => setIsMenuOpen(false)}
    >
      {children}
    </Link>
  );

  // Navigation links array to avoid duplication
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

  // Render navigation links
  const renderNavLinks = (isMobile = false) => (
    <>
      {navigationLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={isMobile ? "block px-3 py-2 rounded-md" : ""}
        >
          {link.label}
          {link.showBadge && link.badgeCount > 0 && (
            <span
              className={`${
                isMobile ? "ml-2" : "ml-1"
              } inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full`}
            >
              {link.badgeCount}
            </span>
          )}
        </NavLink>
      ))}
    </>
  );

  return (
    <nav className="bg-cyan-50/95 dark:bg-green-900/20 shadow-lg border-b border-green-300/70 dark:border-emerald-900 sticky top-0 z-40 w-full overflow-hidden">
      <div className="container mx-auto max-w-7xl px-2 sm:px-4 w-full overflow-hidden">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Logo />
          </div>

          {/* Menu button - hamburger for mobile, sidebar toggle for desktop */}
          <div className="flex items-center">
            {/* Desktop sidebar toggle */}
            <button
              onClick={onMenuToggle}
              className="hidden md:block text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 focus:outline-none focus:text-stone-900 dark:focus:text-stone-100"
              aria-label="Toggle sidebar menu"
            >
              <svg
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 focus:outline-none focus:text-stone-900 dark:focus:text-stone-100"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-stone-800 shadow-lg border-t border-stone-200 dark:border-stone-700">
              {renderNavLinks(true)}

              {/* Mobile auth buttons */}
              {!user ? (
                <div className="px-3 py-2 space-y-2">
                  <button
                    onClick={handleLoginClick}
                    className="w-full px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors text-left"
                  >
                    {t("nav.login")}
                  </button>
                  <button
                    onClick={handleLoginClick}
                    className="w-full px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {t("nav.signup")}
                  </button>
                </div>
              ) : (
                <div className="px-3 py-2">
                  <NavLink
                    to="/profile"
                    className="block text-sm text-stone-600 dark:text-stone-400 mb-2"
                  >
                    {user.displayName || user.email}
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors text-left"
                  >
                    {t("nav.logout")}
                  </button>
                </div>
              )}

              {/* Mobile settings */}
              <div className="px-3 pt-4 pb-2 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between">
                <PWAInstallButton variant="icon" />
                <LanguageSelector />
                <DarkModeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
